
const mongoose = require('mongoose');
const Shelter = require('../models/shelters');

async function getShelters(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
        data: [],
      });
    }

    const shelters = await Shelter.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Shelters fetched successfully',
      data: shelters.map((shelter) => ({
        id: shelter.shelterId,
        name: shelter.name,
        location: shelter.location,
        address: shelter.address,
        status: shelter.status,
        available: shelter.available,
        capacity: shelter.capacity,
        facilities: shelter.facilities,
        latitude: shelter.latitude,
        longitude: shelter.longitude,
      })),
    });
  } catch (error) {
    console.error('Error fetching shelters:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch shelters',
      data: [],
    });
  }
}

async function createShelter(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
      });
    }

    const {
      shelterId,
      name,
      location,
      address,
      status,
      available,
      capacity,
      facilities,
      latitude,
      longitude,
    } = req.body;

    if (
      !shelterId?.trim() ||
      !name?.trim() ||
      !location?.trim() ||
      !address?.trim() ||
      !status ||
      available === undefined ||
      capacity === undefined ||
      latitude === undefined ||
      longitude === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required shelter fields',
      });
    }

    const allowedStatuses = ['Available', 'Limited', 'Full'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shelter status',
      });
    }

    if (
      !Number.isInteger(available) ||
      !Number.isInteger(capacity) ||
      available < 0 ||
      capacity < 1 ||
      available > capacity
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shelter capacity values',
      });
    }

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid shelter coordinates',
      });
    }

    if (
      facilities !== undefined &&
      (!Array.isArray(facilities) ||
        !facilities.every(
          (facility) =>
            typeof facility === 'string' && facility.trim()
        ))
    ) {
      return res.status(400).json({
        success: false,
        message: 'Facilities must be an array of non-empty strings',
      });
    }

    const shelter = await Shelter.create({
      shelterId: shelterId.trim(),
      name: name.trim(),
      location: location.trim(),
      address: address.trim(),
      status,
      available,
      capacity,
      facilities: facilities
        ? facilities.map((facility) => facility.trim())
        : [],
      latitude,
      longitude,
    });

    return res.status(201).json({
      success: true,
      message: 'Shelter created successfully',
      data: {
        id: shelter.shelterId,
        name: shelter.name,
        location: shelter.location,
        address: shelter.address,
        status: shelter.status,
        available: shelter.available,
        capacity: shelter.capacity,
        facilities: shelter.facilities,
        latitude: shelter.latitude,
        longitude: shelter.longitude,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A shelter with this ID already exists',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Shelter data is invalid',
      });
    }

    console.error('Error creating shelter:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to create shelter',
    });
  }
}

async function updateShelter(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
      });
    }

    const updatedShelter = await Shelter.findOneAndUpdate(
      { shelterId: req.params.id },
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedShelter) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Shelter updated successfully',
      data: {
        id: updatedShelter.shelterId,
        name: updatedShelter.name,
        location: updatedShelter.location,
        address: updatedShelter.address,
        status: updatedShelter.status,
        available: updatedShelter.available,
        capacity: updatedShelter.capacity,
        facilities: updatedShelter.facilities,
        latitude: updatedShelter.latitude,
        longitude: updatedShelter.longitude,
      },
    });
  } catch (error) {
    console.error('Error updating shelter:', error.message);
    return res.status(400).json({
      success: false,
      message: 'Failed to update shelter',
    });
  }
}

async function deleteShelter(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
      });
    }

    const deletedShelter = await Shelter.findOneAndDelete({
      shelterId: req.params.id,
    });

    if (!deletedShelter) {
      return res.status(404).json({
        success: false,
        message: 'Shelter not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Shelter deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting shelter:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete shelter',
    });
  }
}

module.exports = {
  getShelters,
  createShelter,
  updateShelter,
  deleteShelter,
};
