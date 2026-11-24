const express = require('express');

const {
  getShelters,
  createShelter,
  updateShelter,
  deleteShelter,
} = require('../controllers/shelters.controller');

const router = express.Router();

router.get('/', getShelters);
router.post('/', createShelter);
router.put('/:id', updateShelter);
router.delete('/:id', deleteShelter);

module.exports = router;
