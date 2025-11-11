import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from './ui/card'
import { Heart } from 'lucide-react'
import { useState, useEffect } from 'react'
import { apiService } from '../services/api'

function EventCard({ event }) {
  const navigate = useNavigate()
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    checkFavoriteStatus()
  }, [event.id])

  const checkFavoriteStatus = async () => {
    try {
      const result = await apiService.isFavorite(event.id)
      setIsFavorite(result.isFavorite)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const handleCardClick = (e) => {
    // Don't navigate if clicking the favorite button
    if (e.target.closest('.favorite-button')) {
      return
    }
    navigate(`/event/${event.id}`)
  }

  const handleFavoriteClick = async (e) => {
    e.stopPropagation()
    
    try {
      if (isFavorite) {
        await apiService.removeFavorite(event.id)
        alert('Removed from Favorites!')
        setIsFavorite(false)
      } else {
        await apiService.addFavorite(event)
        alert('Event Added to Favorites!')
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Error updating favorites. Please try again.')
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString, timeString) => {
    if (!dateString) return ''
    if (!timeString) return ''
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getImageUrl = () => {
    if (event.images && event.images.length > 0) {
      return event.images[0].url
    }
    return '/placeholder-event.jpg'
  }

  const getVenueName = () => {
    return event._embedded?.venues?.[0]?.name || 'N/A'
  }

  const getGenre = () => {
    return event.classifications?.[0]?.segment?.name || 'N/A'
  }

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
            e.target.src = 'https://via.placeholder.com/400x300?text=No+Image'
          }}
        />
        <button
          className="favorite-button absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg hover:scale-110 transition-transform"
          onClick={handleFavoriteClick}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
          />
        </button>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-3 line-clamp-2 min-h-[3.5rem]">
          {event.name}
        </h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Date:</span>
            <span className="text-gray-900 font-semibold">
              {formatDate(event.dates?.start?.localDate)}
            </span>
          </div>
          
          {event.dates?.start?.localTime && (
            <div className="flex justify-between">
              <span className="text-gray-500 font-medium">Time:</span>
              <span className="text-gray-900 font-semibold">
                {formatTime(event.dates.start.localDate, event.dates.start.localTime)}
              </span>
            </div>
          )}
          
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Genre:</span>
            <span className="text-gray-900 font-semibold">{getGenre()}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-gray-500 font-medium">Venue:</span>
            <span className="text-gray-900 font-semibold truncate ml-2">
              {getVenueName()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default EventCard