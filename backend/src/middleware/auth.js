const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Site = require('../models/Site');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Generate a JWT token for a user.
 */
function generateToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Middleware: Require authentication.
 * Extracts JWT from Authorization header, verifies it, attaches user to req.
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

/**
 * Middleware: Require that the authenticated user owns the siteId.
 * Must be used AFTER requireAuth.
 * Looks for siteId in req.params, req.query, or req.body.
 */
async function requireSiteOwner(req, res, next) {
  try {
    const siteId = req.params.siteId || req.query.siteId || req.body?.siteId;

    if (!siteId) {
      return res.status(400).json({ error: 'siteId is required' });
    }

    const site = await Site.findOne({ siteId, userId: req.userId, isActive: true });
    if (!site) {
      return res.status(403).json({ error: 'You do not have access to this site' });
    }

    req.site = site;
    next();
  } catch (err) {
    console.error('Site owner check error:', err);
    res.status(500).json({ error: 'Authorization failed' });
  }
}

module.exports = { generateToken, requireAuth, requireSiteOwner, JWT_SECRET };
