
const mongoose = require('mongoose');
const RescueTeam = require('../models/RescueTeam');

async function getRescueTeams(req, res) {
  try {
    console.log(
  'Rescue Team API database state:',
  mongoose.connection.readyState
);
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
        data: [],
      });
    }

    const teams = await RescueTeam.find()
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      message: 'Rescue teams fetched successfully',
      data: teams.map((team) => ({
        id: team.teamId,
        name: team.name,
        leader: team.leader,
        members: team.members,
        location: team.location,
        contact: team.contact,
        status: team.status,
      })),
    });
  } catch (error) {
    console.error('Error fetching rescue teams:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch rescue teams',
      data: [],
    });
  }
}

async function createRescueTeam(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
      });
    }

    const {
      teamId,
      name,
      leader,
      members,
      location,
      contact,
      status,
    } = req.body;

    if (
      !teamId?.trim() ||
      !name?.trim() ||
      !leader?.trim() ||
      members === undefined ||
      !location?.trim() ||
      !contact?.trim() ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required rescue team fields',
      });
    }

    const allowedStatuses = ['Available', 'Busy', 'Offline'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rescue team status',
      });
    }

    if (!Number.isInteger(members) || members < 1) {
      return res.status(400).json({
        success: false,
        message: 'Members must be a positive whole number',
      });
    }

    const team = await RescueTeam.create({
      teamId: teamId.trim(),
      name: name.trim(),
      leader: leader.trim(),
      members,
      location: location.trim(),
      contact: contact.trim(),
      status,
    });

    return res.status(201).json({
      success: true,
      message: 'Rescue team created successfully',
      data: {
        id: team.teamId,
        name: team.name,
        leader: team.leader,
        members: team.members,
        location: team.location,
        contact: team.contact,
        status: team.status,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'A rescue team with this ID already exists',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Rescue team data is invalid',
      });
    }

    console.error('Error creating rescue team:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to create rescue team',
    });
  }
}


async function updateRescueTeam(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
      });
    }

    const {
      name,
      leader,
      members,
      location,
      contact,
      status,
    } = req.body;

    if (
      !name?.trim() ||
      !leader?.trim() ||
      members === undefined ||
      !location?.trim() ||
      !contact?.trim() ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required rescue team fields',
      });
    }

    const allowedStatuses = ['Available', 'Busy', 'Offline'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rescue team status',
      });
    }

    if (!Number.isInteger(members) || members < 1) {
      return res.status(400).json({
        success: false,
        message: 'Members must be a positive whole number',
      });
    }

    const team = await RescueTeam.findOneAndUpdate(
      { teamId: req.params.teamId },
      { name, leader, members, location, contact, status },
      { new: true, runValidators: true }
    );

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Rescue team not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rescue team updated successfully',
      data: {
        id: team.teamId,
        name: team.name,
        leader: team.leader,
        members: team.members,
        location: team.location,
        contact: team.contact,
        status: team.status,
      },
    });
  } catch (error) {
    console.error('Error updating rescue team:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to update rescue team',
    });
  }
}

async function deleteRescueTeam(req, res) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected',
      });
    }

    const team = await RescueTeam.findOneAndDelete({
      teamId: req.params.teamId,
    });

    if (!team) {
      return res.status(404).json({
        success: false,
        message: 'Rescue team not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Rescue team deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting rescue team:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete rescue team',
    });
  }
}

module.exports = {
  getRescueTeams,
  createRescueTeam,
  updateRescueTeam,
  deleteRescueTeam,
};

