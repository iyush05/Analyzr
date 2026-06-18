const express = require('express');
const Event = require('../models/Event');
const Site = require('../models/Site');
const { validateEventBatch } = require('../middleware/validate');
const { requireAuth, requireSiteOwner } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/events ─────────────────────────────────────
// Receive and store a batch of events
// NO AUTH — tracker SDK sends from visitor browsers
// But we validate the siteId exists
router.post('/events', validateEventBatch, async (req, res) => {
  try {
    const { siteId, events } = req.body;

    // Validate siteId exists and is active
    const site = await Site.findOne({ siteId, isActive: true });
    if (!site) {
      return res.status(404).json({ error: 'Invalid siteId. Site not found or inactive.' });
    }

    const docs = events.map((evt) => ({
      sessionId: evt.sessionId,
      siteId,
      eventType: evt.eventType,
      pageUrl: evt.pageUrl,
      timestamp: evt.timestamp || new Date(),
      data: evt.data || {},
    }));

    const result = await Event.insertMany(docs, { ordered: false });

    res.status(201).json({
      message: `${result.length} events stored`,
      count: result.length,
    });
  } catch (err) {
    console.error('Error storing events:', err);
    res.status(500).json({ error: 'Failed to store events' });
  }
});

// ─── All GET routes below require auth + site ownership ───

// ─── GET /api/sessions ────────────────────────────────────
// List all sessions with event counts
router.get('/sessions', requireAuth, requireSiteOwner, async (req, res) => {
  try {
    const { siteId, page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    const pipeline = [
      { $match: { siteId } },
      {
        $group: {
          _id: '$sessionId',
          totalEvents: { $sum: 1 },
          firstSeen: { $min: '$timestamp' },
          lastSeen: { $max: '$timestamp' },
          lastPageUrl: { $last: '$pageUrl' },
          pageViews: {
            $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] },
          },
          clicks: {
            $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] },
          },
        },
      },
      { $sort: { lastSeen: -1 } },
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limitNum }],
          total: [{ $count: 'count' }],
        },
      },
    ];

    const [result] = await Event.aggregate(pipeline);
    const sessions = result.data.map((s) => ({
      sessionId: s._id,
      totalEvents: s.totalEvents,
      pageViews: s.pageViews,
      clicks: s.clicks,
      firstSeen: s.firstSeen,
      lastSeen: s.lastSeen,
      lastPageUrl: s.lastPageUrl,
    }));

    const total = result.total[0]?.count || 0;

    res.json({
      sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// ─── GET /api/sessions/:sessionId/events ──────────────────
// All events for a specific session, ordered by timestamp
router.get('/sessions/:sessionId/events', requireAuth, requireSiteOwner, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { siteId } = req.query;

    const events = await Event.find({ sessionId, siteId })
      .sort({ timestamp: 1 })
      .lean();

    res.json({ sessionId, events, count: events.length });
  } catch (err) {
    console.error('Error fetching session events:', err);
    res.status(500).json({ error: 'Failed to fetch session events' });
  }
});

// ─── GET /api/heatmap ─────────────────────────────────────
// Click data for a specific page URL (for heatmap rendering)
router.get('/heatmap', requireAuth, requireSiteOwner, async (req, res) => {
  try {
    const { siteId, pageUrl } = req.query;

    if (!pageUrl) {
      return res.status(400).json({ error: 'pageUrl query parameter is required' });
    }

    const clicks = await Event.find({
      siteId,
      pageUrl,
      eventType: 'click',
    })
      .select('data.x data.y data.viewportW data.viewportH timestamp sessionId -_id')
      .sort({ timestamp: -1 })
      .limit(5000)
      .lean();

    const points = clicks.map((c) => ({
      x: c.data?.x,
      y: c.data?.y,
      viewportW: c.data?.viewportW,
      viewportH: c.data?.viewportH,
      timestamp: c.timestamp,
      sessionId: c.sessionId,
    }));

    res.json({ pageUrl, points, count: points.length });
  } catch (err) {
    console.error('Error fetching heatmap data:', err);
    res.status(500).json({ error: 'Failed to fetch heatmap data' });
  }
});

// ─── GET /api/pages ───────────────────────────────────────
// Get distinct page URLs for a site (for heatmap page selector)
router.get('/pages', requireAuth, requireSiteOwner, async (req, res) => {
  try {
    const { siteId } = req.query;
    const pages = await Event.distinct('pageUrl', { siteId });
    res.json({ pages });
  } catch (err) {
    console.error('Error fetching pages:', err);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

// ─── GET /api/stats ───────────────────────────────────────
// Overview stats for a site
router.get('/stats', requireAuth, requireSiteOwner, async (req, res) => {
  try {
    const { siteId } = req.query;

    const [stats] = await Event.aggregate([
      { $match: { siteId } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalSessions: { $addToSet: '$sessionId' },
          totalPageViews: {
            $sum: { $cond: [{ $eq: ['$eventType', 'page_view'] }, 1, 0] },
          },
          totalClicks: {
            $sum: { $cond: [{ $eq: ['$eventType', 'click'] }, 1, 0] },
          },
          uniquePages: { $addToSet: '$pageUrl' },
        },
      },
      {
        $project: {
          _id: 0,
          totalEvents: 1,
          totalSessions: { $size: '$totalSessions' },
          totalPageViews: 1,
          totalClicks: 1,
          uniquePages: { $size: '$uniquePages' },
        },
      },
    ]);

    res.json(
      stats || {
        totalEvents: 0,
        totalSessions: 0,
        totalPageViews: 0,
        totalClicks: 0,
        uniquePages: 0,
      }
    );
  } catch (err) {
    console.error('Error fetching stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
