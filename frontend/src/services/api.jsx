// frontend/src/services/api.js

const API_BASE = '/api';

export const apiService = {
  // Search events
  searchEvents: async (params) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE}/events/search?${queryString}`);
    if (!response.ok) {
      throw new Error('Failed to search events');
    }
    return response.json();
  },

  // Get event details by ID
  getEventById: async (id) => {
    const response = await fetch(`${API_BASE}/events/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Event not found');
      }
      throw new Error('Failed to fetch event details');
    }
    return response.json();
  },

  // Get autocomplete suggestions
  getSuggestions: async (keyword) => {
    const response = await fetch(`${API_BASE}/events/suggest?keyword=${encodeURIComponent(keyword)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    return response.json();
  },

  // Favorites API
  getFavorites: async () => {
    const response = await fetch(`${API_BASE}/favorites`);
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }
    return response.json();
  },

  addFavorite: async (event) => {
    const response = await fetch(`${API_BASE}/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add favorite');
    }
    
    return response.json();
  },

  removeFavorite: async (eventId) => {
    const response = await fetch(`${API_BASE}/favorites/${eventId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Favorite not found');
      }
      throw new Error('Failed to remove favorite');
    }
    
    return response.json();
  },

  isFavorite: async (eventId) => {
    try {
      const response = await fetch(`${API_BASE}/favorites/check/${eventId}`);
      if (!response.ok) {
        // If event not found, it's not a favorite
        return { isFavorite: false };
      }
      return response.json();
    } catch (error) {
      // If any error occurs, assume not favorite
      console.error('Error checking favorite status:', error);
      return { isFavorite: false };
    }
  },

  // Artist/Spotify API
  searchArtist: async (artistName) => {
    const response = await fetch(`${API_BASE}/artists/search?name=${encodeURIComponent(artistName)}`);
    if (!response.ok) {
      throw new Error('Failed to search artist');
    }
    return response.json();
  },

  getArtistDetails: async (artistId) => {
    const response = await fetch(`${API_BASE}/artists/${artistId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist details');
    }
    return response.json();
  },

  getArtistAlbums: async (artistId) => {
    const response = await fetch(`${API_BASE}/artists/${artistId}/albums`);
    if (!response.ok) {
      throw new Error('Failed to fetch artist albums');
    }
    return response.json();
  },

  // Venue API
  getVenueDetails: async (venueName) => {
    const response = await fetch(`${API_BASE}/events/venue/${encodeURIComponent(venueName)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch venue details');
    }
    return response.json();
  },
};

export default apiService;