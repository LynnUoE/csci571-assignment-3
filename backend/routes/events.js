const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const geohash = require('ngeohash');

const API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

// Autocomplete/Suggest
router.get('/suggest', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const url = `${BASE_URL}/suggest?apikey=${API_KEY}&keyword=${encodeURIComponent(keyword)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Suggest error:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

// Search Events
router.get('/search', async (req, res) => {
  try {
    const { keyword, lat, lng, radius, segmentId } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Location is required' });
    }

    // Convert lat/lng to geohash
    const geoPoint = geohash.encode(parseFloat(lat), parseFloat(lng), 7);

    let url = `${BASE_URL}/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(keyword)}&geoPoint=${geoPoint}&radius=${radius || 10}&unit=miles`;

    // Add segment if not "All"
    if (segmentId && segmentId !== 'KZFzniwnSyZfZ7v7nE') {
      url += `&segmentId=${segmentId}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
});

// Get Event Details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const url = `${BASE_URL}/events/${id}?apikey=${API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    res.json(data);
  } catch (error) {
    console.error('Event detail error:', error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

module.exports = router;