
const express = require('express');

const {
  getRescueTeams,
  createRescueTeam,
  updateRescueTeam,
  deleteRescueTeam,
} = require('../controllers/rescueTeam.controller');

const router = express.Router();

router.get('/', getRescueTeams);
router.post('/', createRescueTeam);
router.put('/:teamId', updateRescueTeam);
router.delete('/:teamId',deleteRescueTeam);
module.exports = router;
