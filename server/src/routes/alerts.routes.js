
const express = require('express');

const router = express.Router();

const {
  getAlerts,
  addAlert,
  updateAlert,
  deleteAlert,
} = require('../controllers/alerts.controller');

router.get('/', getAlerts);

router.post('/', addAlert);

router.put('/:id', updateAlert);

router.delete('/:id', deleteAlert);

module.exports = router;
