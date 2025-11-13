// frontend/src/components/EventCard.jsx

import { useNavigate } from 'react-router-dom';
import { Card } from './ui/card';
import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { addToFavorites, removeFromFavorites, checkIsFavorite } from '../utils/favoritesUtils';

function EventCard({ event, onFavoriteChange }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadFavoriteStatus();

    // Listen for favorites updates
    const handleFavoritesUpdate = () => {
      loadFavoriteStatus();
    };

    window.addEventListener('favorites-updated', handleFavoritesUpdate);
    
    return () => {
      window.removeEventListener('favorites-updated', handleFavoritesUpdate);
    };
  }, [event.id]);

  const loadFavoriteStatus = async () => {
    const status = await checkIsFavorite(event.id);
    setIsFavorite(status);
  };

  const handleCardClick = (e) => {
    // Don't navigate if clicking the favorite button
    if (e.target.closest('.favorite-button')) {
      return;
    }
    navigate(`/event/${event.id}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      if (isFavorite) {
        const result = await removeFromFavorites(event);
        if (result.success) {
          setIsFavorite(false);
          if (onFavoriteChange) {
            onFavoriteChange();
          }
        }
      } else {
        const result = await addToFavorites(event);
        if (result.success) {
          setIsFavorite(true);
          if (onFavoriteChange) {
            onFavoriteChange();
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  const getImageUrl = () => {
    if (event.images && event.images.length > 0) {
      return event.images[0].url;
    }
    return 'https://via.placeholder.com/400x300?text=No+Image';
  };

  const getVenueName = () => {
    return event._embedded?.venues?.[0]?.name || 'N/A';
  };

  const getGenre = () => {
    return event.classifications?.[0]?.segment?.name || 'Event';
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
      onClick={handleCardClick}
    >
      <div className="relative">
        <img
          src={getImageUrl()}
          alt={event.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
          }}
        />
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white text-gray-900 text-xs font-semibold rounded-full">
            {getGenre()}
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
        
        {/* Favorite Button */}
        <button
          className="favorite-button absolute bottom-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
          onClick={handleFavoriteClick}
          disabled={isLoading}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
          />
        </button>
      </div>

      {/* Event Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {event.name}
        </h3>
        <p className="text-sm text-gray-600 mb-1">
          {getVenueName()}
        </p>
        {event.dates?.start?.localDate && event.dates.start.localTime && (
          <p className="text-xs text-gray-500">
            {formatDate(event.dates.start.localDate)} • {formatTime(event.dates.start.localDate, event.dates.start.localTime)}
          </p>
        )}
      </div>
    </Card>
  );
}

export default EventCard;