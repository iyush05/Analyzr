const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    siteId: {
      type: String,
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: ['page_view', 'click'],
    },
    pageUrl: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    data: {
      // Click event data
      x: Number,
      y: Number,
      elementTag: String,
      elementText: String,
      // Page view data
      referrer: String,
      title: String,
      // Shared
      viewportW: Number,
      viewportH: Number,
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Compound indexes for efficient queries
eventSchema.index({ siteId: 1, sessionId: 1 });
eventSchema.index({ siteId: 1, pageUrl: 1, eventType: 1 });
eventSchema.index({ siteId: 1, timestamp: -1 });

module.exports = mongoose.model('Event', eventSchema);
