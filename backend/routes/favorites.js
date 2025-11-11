const express = require('express');
const router = express.Router();
const { getDB } = require('../db/mongodb');

const COLLECTION_NAME = 'favorites';

// Get all favorites
router.get('/', async (req, res) => {
  try {
    const db = await getDB();
    const favorites = await db.collection(COLLECTION_NAME)
      .find({})
      .toArray();
    
    res.json(favorites);
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// Add to favorites
router.post('/', async (req, res) => {
  try {
    const event = req.body;
    
    if (!event.id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const db = await getDB();
    const collection = db.collection(COLLECTION_NAME);

    // Check if already exists
    const existing = await collection.findOne({ id: event.id });
    if (existing) {
      return res.status(409).json({ error: 'Event already in favorites' });
    }

    // Add timestamp
    event.addedAt = new Date();
    
    const result = await collection.insertOne(event);
    res.status(201).json({ success: true, id: result.insertedId });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = await getDB();
    const result = await db.collection(COLLECTION_NAME)
      .deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Check if event is favorite
router.get('/check/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const db = await getDB();
    const favorite = await db.collection(COLLECTION_NAME)
      .findOne({ id: id });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

module.exports = router;