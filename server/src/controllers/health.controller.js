
const mongoose = require('mongoose');

function getHealth(req, res) {
  const databaseStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.status(200).json({
    success: true,
    message: 'RESQ API is healthy',
    data: {
      api: 'running',
      database:
        databaseStates[mongoose.connection.readyState] ||
        'unknown',
    },
  });
}

module.exports = { getHealth };
