const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { connectDB } = require('./db/mongodb');
const eventsRouter = require('./routes/events');
const favoritesRouter = require('./routes/favorites');
const artistsRouter = require('./routes/artists');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// API Routes - MUST come BEFORE static file serving
app.use('/api/events', eventsRouter);
app.use('/api/favorites', favoritesRouter);
app.use('/api/artists', artistsRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve frontend static files
const frontendPath = path.join(__dirname, 'dist');
console.log('📂 Serving frontend from:', frontendPath);

// Serve static files with proper MIME types
app.use(express.static(frontendPath, {
  setHeaders: (res, filepath) => {
    // Set correct MIME types for different file types
    if (filepath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filepath.endsWith('.mjs')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filepath.endsWith('.css')) {
      res.setHeader('Content-Type', 'text/css');
    } else if (filepath.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (filepath.endsWith('.svg')) {
      res.setHeader('Content-Type', 'image/svg+xml');
    } else if (filepath.endsWith('.woff') || filepath.endsWith('.woff2')) {
      res.setHeader('Content-Type', 'font/woff2');
    }
  }
}));

// Catch-all route - serve index.html for any non-API, non-static routes
// This enables client-side routing (React Router, etc.)
app.get('*', (req, res, next) => {
  // Skip if it's an API route
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Skip if it's requesting a static file (has extension)
  if (path.extname(req.path)) {
    return next();
  }
  
  // Serve index.html for all other routes (for client-side routing)
  const indexPath = path.join(frontendPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      console.error('❌ Error serving index.html:', err);
      res.status(404).send('Frontend not found. Please ensure the dist folder is deployed.');
    }
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start server and connect to database
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    // Listen on 0.0.0.0 for GCP, use PORT from environment
    app.listen(PORT, '0.0.0.0', () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 Server running on http://0.0.0.0:' + PORT);
      console.log('📝 Environment:', process.env.NODE_ENV || 'development');
      console.log('🔗 API endpoints: http://0.0.0.0:' + PORT + '/api');
      console.log('📂 Frontend path:', frontendPath);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  const { closeDB } = require('./db/mongodb');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received, shutting down gracefully...');
  const { closeDB } = require('./db/mongodb');
  await closeDB();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

startServer();