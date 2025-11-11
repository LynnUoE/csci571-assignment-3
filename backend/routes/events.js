const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');
const geohash = require('ngeohash');

const API_KEY = process.env.TICKETMASTER_API_KEY;
const BASE_URL = 'https://app.ticketmaster.com/discovery/v2';

// Autocomplete/Suggest - for keyword suggestions
router.get('/suggest', async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const url = `${BASE_URL}/suggest?apikey=${API_KEY}&keyword=${encodeURIComponent(keyword)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }
    
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
      return res.status(400).json({ error: 'Location (lat/lng) is required' });
    }

    // Convert lat/lng to geohash (7 precision for ~150m accuracy)
    const geoPoint = geohash.encode(parseFloat(lat), parseFloat(lng), 7);

    // Build URL with parameters
    let url = `${BASE_URL}/events.json?apikey=${API_KEY}&keyword=${encodeURIComponent(keyword)}&geoPoint=${geoPoint}&radius=${radius || 10}&unit=miles`;

    // Add segment if not "All" (segmentId for "All" is KZFzniwnSyZfZ7v7nE)
    if (segmentId && segmentId !== 'KZFzniwnSyZfZ7v7nE') {
      url += `&segmentId=${segmentId}`;
    }

    console.log('Searching events:', { keyword, lat, lng, radius, segmentId });
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
});

// Get Event Details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const url = `${BASE_URL}/events/${id}?apikey=${API_KEY}`;
    console.log('Fetching event details:', id);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Event not found' });
      }
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Event detail error:', error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
});

// Get Venue Details
router.get('/venue/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({ error: 'Venue name is required' });
    }

    const url = `${BASE_URL}/venues.json?apikey=${API_KEY}&keyword=${encodeURIComponent(name)}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Ticketmaster API error: ${response.status}`);
    }
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Venue details error:', error);
    res.status(500).json({ error: 'Failed to fetch venue details' });
  }
});

module.exports = router;