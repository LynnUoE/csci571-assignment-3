import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { addToFavorites, removeFromFavorites, checkIsFavorite } from '../utils/favoritesUtils';

function EventCard({ event }) {
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchFavoriteStatus = async () => {
      const status = await checkIsFavorite(event.id);
      setIsFavorite(status);
    };
    fetchFavoriteStatus();
  }, [event.id]);

  const handleCardClick = () => {
    navigate(`/event/${event.id}`);
  };

  const handleFavoriteClick = async (e) => {
    e.stopPropagation(); // Prevent card click
    setIsLoading(true);
    try {
      if (isFavorite) {
        await removeFromFavorites(event);
        setIsFavorite(false);
      } else {
        await addToFavorites(event);
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getImageUrl = () => {
    return event.images?.[0]?.url || 'https://via.placeholder.com/400x300?text=No+Image';
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
        
        {/* Category Badge - Top Left */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 bg-white text-gray-900 text-xs font-medium rounded-full shadow-sm">
            {getGenre()}
          </span>
        </div>
        
        {/* Date Badge - Top Right */}
        {event.dates?.start?.localDate && (
          <div className="absolute top-3 right-3">
            <span className="px-3 py-1 bg-white text-gray-900 text-xs font-medium rounded-md shadow-sm">
              {formatDate(event.dates.start.localDate)}
              {event.dates.start.localTime && (
                <>, {formatTime(event.dates.start.localTime)}</>
              )}
            </span>
          </div>
        )}
      </div>

      {/* Event Info */}
      <div className="p-4 relative">
        <h3 className="font-semibold text-lg mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors pr-10">
          {event.name}
        </h3>
        <p className="text-sm text-gray-500">
          {getVenueName()}
        </p>
        
        {/* Favorite Button - Bottom Right of Card */}
        <button
          className="absolute bottom-4 right-4 p-2 hover:scale-110 transition-transform disabled:opacity-50"
          onClick={handleFavoriteClick}
          disabled={isLoading}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>
    </Card>
  );
}

export default EventCard;