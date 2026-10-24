
const mongoose = require('mongoose');

const citizenSchema = new mongoose.Schema(
  {
    citizenId: {
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
    location: {
      type: String,
      required: true,
      trim: true,
    },
    emergency: {
      type: String,
      required: true,
      trim: true,
    },
    severity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      required: true,
    },
    status: {
      type: String,
      enum: ['Pending', 'Rescue Assigned', 'Rescued'],
      default: 'Pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Citizen', citizenSchema);


