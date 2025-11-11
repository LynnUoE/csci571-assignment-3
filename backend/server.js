const express = require('express');
const cors = require('cors');
require('dotenv').config();

const eventsRouter = require('./routes/events');
const favoritesRouter = require('./routes/favorites');
const artistsRouter = require('./routes/artists');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/events', eventsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/artists', artistsRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});