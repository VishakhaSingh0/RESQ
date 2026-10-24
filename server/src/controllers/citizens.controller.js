
const mongoose = require('mongoose');
const Citizen = require('../models/Citizen');

async function getCitizens(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
        data: [],
      });
    }

    const citizens = await Citizen.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Citizens fetched successfully',
      data: citizens.map((citizen) => ({
        id: citizen.citizenId,
        name: citizen.name,
        location: citizen.location,
        emergency: citizen.emergency,
        severity: citizen.severity,
        status: citizen.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching citizens:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch citizens',
      data: [],
    });
  }
}

async function createCitizen(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
      });
    }

    const { citizenId, name, location, emergency, severity, status } =
      req.body;

    if (
      !citizenId?.trim() ||
      !name?.trim() ||
      !location?.trim() ||
      !emergency?.trim() ||
      !severity
    ) {
      return res.status(400).json({
        success: false,
        message:
          'citizenId, name, location, emergency, and severity are required',
      });
    }

    const allowedSeverities = ['Low', 'Medium', 'High', 'Critical'];
    const allowedStatuses = ['Pending', 'Rescue Assigned', 'Rescued'];

    if (!allowedSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity',
      });
    }

    if (status !== undefined && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const citizen = await Citizen.create({
      citizenId: citizenId.trim(),
      name: name.trim(),
      location: location.trim(),
      emergency: emergency.trim(),
      severity,
      ...(status ? { status } : {}),
    });

    return res.status(201).json({
      success: true,
      message: 'Citizen created successfully',
      data: {
        id: citizen.citizenId,
        name: citizen.name,
        location: citizen.location,
        emergency: citizen.emergency,
        severity: citizen.severity,
        status: citizen.status,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A citizen with this ID already exists',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Citizen data is invalid',
      });
    }

    console.error('Error creating citizen:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to create citizen',
    });
  }
}

module.exports = { getCitizens, createCitizen };

