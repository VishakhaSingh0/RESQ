
const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      enum: [
        'Medical emergency',
        'Fire',
        'Flood',
        'Accident',
        'Other',
      ],
      default: 'Other',
    },

    description: {
      type: String,
      trim: true,
      default: '',
    },

    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },

    status: {
      type: String,
      enum: ['Active', 'Resolved'],
      default: 'Active',
    },

    alertType: {
      type: String,
      enum: ['Manual', 'Official'],
      default: 'Manual',
    },

    sourceName: {
      type: String,
      trim: true,
      default: '',
    },

    sourceId: {
    type: String,
     trim: true,
     },

    sourceUrl: {
      type: String,
      trim: true,
      default: '',
    },

    verificationStatus: {
      type: String,
      enum: ['Unverified', 'Verified'],
      default: 'Unverified',
    },

    affectedAreas: {
      type: [String],
      default: [],
    },

    issuedAt: {
      type: Date,
      default: null,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

alertSchema.index(
  { sourceId: 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('Alert', alertSchema);
