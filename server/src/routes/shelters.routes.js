
const express = require('express');

const {
  getShelters,
  createShelter,
} = require('../controllers/shelters.controller');

const router = express.Router();

router.get('/', getShelters);
router.post('/', createShelter);

module.exports = router;

