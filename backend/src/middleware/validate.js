/**
 * Request validation middleware for the events API.
 */

function validateEventBatch(req, res, next) {
  const { siteId, events } = req.body;

  if (!siteId || typeof siteId !== 'string') {
    return res.status(400).json({
      error: 'Missing or invalid "siteId" field',
    });
  }

  if (!Array.isArray(events) || events.length === 0) {
    return res.status(400).json({
      error: '"events" must be a non-empty array',
    });
  }

  if (events.length > 100) {
    return res.status(400).json({
      error: 'Batch size exceeds maximum of 100 events',
    });
  }

  const validTypes = ['page_view', 'click'];

  for (let i = 0; i < events.length; i++) {
    const event = events[i];

    if (!event.sessionId || typeof event.sessionId !== 'string') {
      return res.status(400).json({
        error: `Event at index ${i} is missing a valid "sessionId"`,
      });
    }

    if (!event.eventType || !validTypes.includes(event.eventType)) {
      return res.status(400).json({
        error: `Event at index ${i} has an invalid "eventType". Must be one of: ${validTypes.join(', ')}`,
      });
    }

    if (!event.pageUrl || typeof event.pageUrl !== 'string') {
      return res.status(400).json({
        error: `Event at index ${i} is missing a valid "pageUrl"`,
      });
    }
  }

  next();
}

module.exports = { validateEventBatch };
