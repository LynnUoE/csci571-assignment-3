// frontend/src/utils/favoritesUtils.js

import { toast } from 'sonner';

/**
 * Add event to favorites with toast notification
 */
export const addToFavorites = async (event) => {
  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      if (response.status === 409) {
        toast.error('Event is already in favorites');
        return { success: false, alreadyExists: true };
      }
      throw new Error('Failed to add to favorites');
    }

    // Show success toast
    toast.success(`${event.name} added to favorites!`);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding to favorites:', error);
    toast.error('Failed to add to favorites');
    return { success: false };
  }
};

/**
 * Remove event from favorites with toast notification and undo option
 */
export const removeFromFavorites = async (event) => {
  try {
    const response = await fetch(`/api/favorites/${event.id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to remove from favorites');
    }

    // Store event temporarily for undo
    let undoExecuted = false;

    // Show toast with undo button
    toast.error(`${event.name} removed from favorites!`, {
      duration: 4000,
      action: {
        label: 'Undo',
        onClick: async () => {
          if (!undoExecuted) {
            undoExecuted = true;
            // Re-add the event
            const result = await addToFavoritesWithoutToast(event);
            if (result.success) {
              toast.success(`${event.name} re-added to favorites!`);
              // Trigger a custom event to reload favorites
              window.dispatchEvent(new CustomEvent('favorites-updated'));
            }
          }
        }
      }
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error removing from favorites:', error);
    toast.error('Failed to remove from favorites');
    return { success: false };
  }
};

/**
 * Add to favorites without showing a toast (for undo functionality)
 */
const addToFavoritesWithoutToast = async (event) => {
  try {
    const response = await fetch('/api/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    });

    if (!response.ok) {
      throw new Error('Failed to re-add to favorites');
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error re-adding to favorites:', error);
    return { success: false };
  }
};

/**
 * Check if event is in favorites
 */
export const checkIsFavorite = async (eventId) => {
  try {
    const response = await fetch(`/api/favorites/check/${eventId}`);
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    return data.isFavorite;
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return false;
  }
};

/**
 * Get all favorites
 */
export const getAllFavorites = async () => {
  try {
    const response = await fetch('/api/favorites');
    if (!response.ok) {
      throw new Error('Failed to fetch favorites');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return [];
  }
};