
const mongoose = require('mongoose');

const rescueTeamSchema = new mongoose.Schema(
  {
    teamId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    leader: {
      type: String,
      required: true,
      trim: true,
    },
    members: {
      type: Number,
      required: true,
      min: 1,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    contact: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Busy', 'Offline'],
      default: 'Available',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RescueTeam', rescueTeamSchema);
