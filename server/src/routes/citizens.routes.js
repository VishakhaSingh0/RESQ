
const express = require('express');
const {
  getCitizens,
  createCitizen,
} = require('../controllers/citizens.controller');

const router = express.Router();

router.get('/', getCitizens);
router.post('/', createCitizen);

module.exports = router;

