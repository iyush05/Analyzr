const express = require('express');
const Site = require('../models/Site');
const Event = require('../models/Event');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(requireAuth);

// ─── GET /api/sites ───────────────────────────────────────
// List all sites belonging to the authenticated user, with basic stats
router.get('/', async (req, res) => {
  try {
    const sites = await Site.find({ userId: req.userId, isActive: true })
      .sort({ createdAt: -1 })
      .lean();

    // Fetch basic stats for each site in parallel
    const sitesWithStats = await Promise.all(
      sites.map(async (site) => {
        const [stats] = await Event.aggregate([
          { $match: { siteId: site.siteId } },
          {
            $group: {
              _id: null,
              totalEvents: { $sum: 1 },
              totalSessions: { $addToSet: '$sessionId' },
            },
          },
          {
            $project: {
              _id: 0,
              totalEvents: 1,
              totalSessions: { $size: '$totalSessions' },
            },
          },
        ]);

        return {
          siteId: site.siteId,
          name: site.name,
          domain: site.domain,
          createdAt: site.createdAt,
          totalEvents: stats?.totalEvents || 0,
          totalSessions: stats?.totalSessions || 0,
        };
      })
    );

    res.json({ sites: sitesWithStats });
  } catch (err) {
    console.error('Error fetching sites:', err);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// ─── POST /api/sites ──────────────────────────────────────
// Register a new site
router.post('/', async (req, res) => {
  try {
    const { name, domain } = req.body;

    if (!name || !domain) {
      return res.status(400).json({ error: 'Site name and domain are required' });
    }

    const site = await Site.create({
      userId: req.userId,
      name,
      domain,
    });

    res.status(201).json({
      message: 'Site created successfully',
      site: {
        siteId: site.siteId,
        name: site.name,
        domain: site.domain,
        createdAt: site.createdAt,
      },
    });
  } catch (err) {
    console.error('Error creating site:', err);
    res.status(500).json({ error: 'Failed to create site' });
  }
});

// ─── GET /api/sites/:siteId ──────────────────────────────
// Get site details
router.get('/:siteId', async (req, res) => {
  try {
    const site = await Site.findOne({
      siteId: req.params.siteId,
      userId: req.userId,
      isActive: true,
    }).lean();

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json({
      site: {
        siteId: site.siteId,
        name: site.name,
        domain: site.domain,
        createdAt: site.createdAt,
      },
    });
  } catch (err) {
    console.error('Error fetching site:', err);
    res.status(500).json({ error: 'Failed to fetch site' });
  }
});

// ─── DELETE /api/sites/:siteId ───────────────────────────
// Soft-delete a site
router.delete('/:siteId', async (req, res) => {
  try {
    const site = await Site.findOneAndUpdate(
      { siteId: req.params.siteId, userId: req.userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!site) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json({ message: 'Site deleted successfully' });
  } catch (err) {
    console.error('Error deleting site:', err);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

module.exports = router;
