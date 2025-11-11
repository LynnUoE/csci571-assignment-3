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
      .sort({ addedAt: 1 }) // Sort by order added
      .toArray();
    
    console.log(`Retrieved ${favorites.length} favorites`);
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
      return res.status(409).json({ 
        error: 'Event already in favorites',
        message: 'This event is already saved to favorites'
      });
    }

    // Add timestamp
    event.addedAt = new Date();
    
    const result = await collection.insertOne(event);
    console.log(`Added favorite: ${event.id}`);
    
    res.status(201).json({ 
      success: true, 
      id: result.insertedId,
      message: 'Event added to favorites'
    });
  } catch (error) {
    console.error('Add favorite error:', error);
    res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// Remove from favorites
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const db = await getDB();
    const result = await db.collection(COLLECTION_NAME)
      .deleteOne({ id: id });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Favorite not found' });
    }

    console.log(`Removed favorite: ${id}`);
    res.json({ 
      success: true,
      message: 'Event removed from favorites'
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

// Check if event is favorite
router.get('/check/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Event ID is required' });
    }

    const db = await getDB();
    const favorite = await db.collection(COLLECTION_NAME)
      .findOne({ id: id });

    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({ error: 'Failed to check favorite' });
  }
});

// Clear all favorites (for testing purposes)
router.delete('/', async (req, res) => {
  try {
    const db = await getDB();
    const result = await db.collection(COLLECTION_NAME).deleteMany({});
    
    console.log(`Cleared ${result.deletedCount} favorites`);
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount,
      message: 'All favorites cleared'
    });
  } catch (error) {
    console.error('Clear favorites error:', error);
    res.status(500).json({ error: 'Failed to clear favorites' });
  }
});

module.exports = router;