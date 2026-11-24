
const Alert = require('../models/Alert');

const allowedCategories = [
  'Medical emergency',
  'Fire',
  'Flood',
  'Accident',
  'Other',
];

const allowedSeverities = ['Low', 'Medium', 'High'];
const allowedStatuses = ['Active', 'Resolved'];

const manualFields = [
  'title',
  'location',
  'category',
  'description',
  'severity',
  'status',
];

// Get all alerts
async function getAlerts(req, res) {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: alerts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

// Add manual alert
async function addAlert(req, res) {
  try {
    const {
      title,
      location,
      category = 'Other',
      description = '',
      severity = 'Medium',
      status = 'Active',
    } = req.body;

    if (!title || !location) {
      return res.status(400).json({
        success: false,
        message: 'Title and location are required',
      });
    }

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emergency category',
      });
    }

    if (!allowedSeverities.includes(severity)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity',
      });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert status',
      });
    }

    const alert = await Alert.create({
      title,
      location,
      category,
      description,
      severity,
      status,
      alertType: 'Manual',
      verificationStatus: 'Unverified',
    });

    return res.status(201).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Update manual alert
async function updateAlert(req, res) {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    if (alert.alertType === 'Official') {
      return res.status(403).json({
        success: false,
        message: 'Official alerts cannot be edited manually',
      });
    }

    const updates = {};

    for (const field of manualFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (
      updates.category &&
      !allowedCategories.includes(updates.category)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid emergency category',
      });
    }

    if (
      updates.severity &&
      !allowedSeverities.includes(updates.severity)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid severity',
      });
    }

    if (
      updates.status &&
      !allowedStatuses.includes(updates.status)
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid alert status',
      });
    }

    Object.assign(alert, updates);
    await alert.save();

    return res.status(200).json({
      success: true,
      data: alert,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

// Delete manual alert
async function deleteAlert(req, res) {
  try {
    const alert = await Alert.findById(req.params.id);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found',
      });
    }

    if (alert.alertType === 'Official') {
      return res.status(403).json({
        success: false,
        message: 'Official alerts cannot be deleted manually',
      });
    }

    await alert.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Alert deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = {
  getAlerts,
  addAlert,
  updateAlert,
  deleteAlert,
};
