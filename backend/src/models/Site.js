const mongoose = require('mongoose');
const crypto = require('crypto');

const siteSchema = new mongoose.Schema(
  {
    siteId: {
      type: String,
      unique: true,
      index: true,
      default: () => crypto.randomUUID(),
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    domain: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for user's sites
siteSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model('Site', siteSchema);
