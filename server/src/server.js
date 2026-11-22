
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/health.routes');
const citizensRoutes = require('./routes/citizens.routes');
const connectDB = require('./config/db');

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

app.use(express.json());

app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/citizens', citizensRoutes);

const PORT = process.env.PORT || 5001;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`RESQ server running on port ${PORT}`);
  });
}

startServer();


