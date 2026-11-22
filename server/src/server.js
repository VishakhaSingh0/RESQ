
require('dotenv').config();
console.log("CLIENT_URL:", process.env.CLIENT_URL);

const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const citizensRoutes = require('./routes/citizens.routes');
const connectDB = require('./config/db');
const sheltersRoutes = require('./routes/shelters.routes');
const rescueTeamRoutes = require('./routes/rescueTeam.routes');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

app.use(express.json());

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/citizens', citizensRoutes);
app.use('/api/v1/shelters', sheltersRoutes);
app.use('/api/v1/rescue-teams', rescueTeamRoutes);

const PORT = process.env.PORT || 5001;

async function startServer() {
  const connected = await connectDB();

  console.log(
    'MongoDB readyState:',
    require('mongoose').connection.readyState
  );

  console.log('connectDB returned:', connected);

  app.listen(PORT, () => {
    console.log(`RESQ server running on port ${PORT}`);
  });
}

startServer();




