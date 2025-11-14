// frontend/src/pages/Favorites.jsx

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getAllFavorites, removeFromFavorites } from '../utils/FavoritesUtils';

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();

    // Listen for favorites updates (from undo action)
    const handleFavoritesUpdate = () => {
      loadFavorites();
    };

    window.addEventListener('favorites-updated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdate);
    };
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    const data = await getAllFavorites();
    setFavorites(data);
    setLoading(false);
  };

  const handleRemoveFavorite = async (event, e) => {
    e.stopPropagation();
    
    // Optimistically remove from UI
    setFavorites(prevFavorites => 
      prevFavorites.filter(fav => fav.id !== event.id)
    );
    
    const result = await removeFromFavorites(event);
    
    if (!result.success) {
      // If failed, reload to restore
      loadFavorites();
    } else {
      // Set up listener for undo action
      setTimeout(() => {
        loadFavorites();
      }, 100);
    }
  };

  const handleCardClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString, timeString) => {
    if (!dateString || !timeString) return '';
    const date = new Date(`${dateString}T${timeString}`);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getImageUrl = (event) => {
    if (event.images && event.images.length > 0) {
      return event.images[0].url;
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const getCategoryBadge = (event) => {
    return event.classifications?.[0]?.segment?.name || 'Event';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading favorites...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Favorites</h1>
        {favorites.length > 0 && (
          <p className="text-gray-600">
            {favorites.length} {favorites.length === 1 ? 'event' : 'events'} saved
          </p>
        )}
      </div>

      {/* Empty State */}
      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            No favorite events yet
          </h2>
          <p className="text-gray-500 mb-6">
            Add events to your favorites by clicking the heart icon on any event
          </p>

        </div>
      ) : (
        /* Favorites Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((event) => (
            <Card 
              key={event.id}
              className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
              onClick={() => handleCardClick(event.id)}
            >
              {/* Event Image */}
              <div className="relative">
                <img
                  src={getImageUrl(event)}
                  alt={event.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
                
                {/* Category Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-white text-gray-900 text-xs font-semibold rounded-full">
                    {getCategoryBadge(event)}
                  </span>
                </div>
                
                {/* Date Badge */}
                {event.dates?.start?.localDate && (
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded">
                      {formatDate(event.dates.start.localDate)}
                      {event.dates.start.localTime && (
                        <>, {formatTime(event.dates.start.localDate, event.dates.start.localTime)}</>
                      )}
                    </span>
                  </div>
                )}
                
                {/* Remove from Favorites Button */}
                <button
                  onClick={(e) => handleRemoveFavorite(event, e)}
                  className="absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform z-10"
                  aria-label="Remove from favorites"
                >
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                </button>
              </div>

              {/* Event Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {event.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {event._embedded?.venues?.[0]?.name || 'Venue TBA'}
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}