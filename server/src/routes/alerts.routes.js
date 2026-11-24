const express = require('express');

const router = express.Router();

const {
  getAlerts,
  addAlert,
  updateAlert,
  deleteAlert,
  refreshAlerts,
} = require('../controllers/alerts.controller');

router.get('/', getAlerts);

router.post('/refresh', refreshAlerts);

router.post('/', addAlert);

router.put('/:id', updateAlert);

router.delete('/:id', deleteAlert);

module.exports = router;