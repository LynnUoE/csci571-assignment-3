const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let accessToken = null;
let tokenExpiry = null;

// Get Spotify Access Token
async function getAccessToken() {
  // Return cached token if still valid
  if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
    return accessToken;
  }

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    });

    if (!response.ok) {
      throw new Error(`Spotify auth error: ${response.status}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Refresh token 1 minute before expiry
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    
    console.log('✅ Spotify access token refreshed');
    return accessToken;
  } catch (error) {
    console.error('Spotify auth error:', error);
    throw error;
  }
}

// Search Artist
router.get('/search', async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword is required' });
    }

    const token = await getAccessToken();
    
    const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(keyword)}&type=artist&limit=1`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.artists && data.artists.items.length > 0) {
      const artist = data.artists.items[0];
      console.log(`Found artist: ${artist.name}`);
      res.json(artist);
    } else {
      res.status(404).json({ error: 'Artist not found' });
    }
  } catch (error) {
    console.error('Artist search error:', error);
    res.status(500).json({ error: 'Failed to search artist' });
  }
});

// Get Artist Details
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    const token = await getAccessToken();
    
    const url = `https://api.spotify.com/v1/artists/${id}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: 'Artist not found' });
      }
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Artist details error:', error);
    res.status(500).json({ error: 'Failed to fetch artist details' });
  }
});

// Get Artist Albums
router.get('/:id/albums', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({ error: 'Artist ID is required' });
    }

    const token = await getAccessToken();
    
    // Get albums - include_groups=album filters to only albums (not singles/compilations)
    const url = `https://api.spotify.com/v1/artists/${id}/albums?include_groups=album&market=US&limit=8`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Found ${data.items?.length || 0} albums for artist ${id}`);
    res.json(data);
  } catch (error) {
    console.error('Artist albums error:', error);
    res.status(500).json({ error: 'Failed to fetch albums' });
  }
});

module.exports = router;