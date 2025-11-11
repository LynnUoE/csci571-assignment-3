import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { ArrowLeft, Heart, ExternalLink, Loader2 } from 'lucide-react'
import { apiService } from '../services/api'

function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    loadEventDetails()
    checkFavoriteStatus()
  }, [id])

  const loadEventDetails = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await apiService.getEventDetails(id)
      setEvent(data)
    } catch (err) {
      console.error('Error loading event details:', err)
      setError('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const checkFavoriteStatus = async () => {
    try {
      const result = await apiService.isFavorite(id)
      setIsFavorite(result.isFavorite)
    } catch (error) {
      console.error('Error checking favorite:', error)
    }
  }

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        await apiService.removeFavorite(id)
        alert('Removed from Favorites!')
        setIsFavorite(false)
      } else {
        await apiService.addFavorite(event)
        alert('Event Added to Favorites!')
        setIsFavorite(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Error updating favorites')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to search
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Event not found'}
        </div>
      </div>
    )
  }

  const getTicketUrl = () => {
    return event.url || '#'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatTime = (dateString, timeString) => {
    if (!dateString || !timeString) return 'N/A'
    const date = new Date(`${dateString}T${timeString}`)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Back Button */}
      <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to search
      </Button>

      <Card>
        <CardContent className="p-6">
          {/* Event Header */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
              {event.dates?.start?.localDate && (
                <p className="text-gray-600">
                  {formatDate(event.dates.start.localDate)}
                  {event.dates.start.localTime && 
                    ` at ${formatTime(event.dates.start.localDate, event.dates.start.localTime)}`
                  }
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleFavoriteClick}
              className="ml-4"
            >
              <Heart
                className={`h-6 w-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
              />
            </Button>
          </div>

          {/* Buy Tickets */}
          {getTicketUrl() !== '#' && (
            <a
              href={getTicketUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center text-blue-600 hover:underline mb-6"
            >
              Buy Tickets at Ticketmaster
              <ExternalLink className="ml-1 h-4 w-4" />
            </a>
          )}

          {/* Tabs */}
          <Tabs defaultValue="info" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Info</TabsTrigger>
              <TabsTrigger value="artists" className="flex-1">Artists/Teams</TabsTrigger>
              <TabsTrigger value="venue" className="flex-1">Venue</TabsTrigger>
            </TabsList>

            {/* Info Tab */}
            <TabsContent value="info" className="mt-6">
              <div className="space-y-6">
                {/* Artist/Team */}
                {event._embedded?.attractions && (
                  <div>
                    <h3 className="font-semibold mb-2">Artist/Team</h3>
                    <p className="text-gray-700">
                      {event._embedded.attractions.map(a => a.name).join(' | ')}
                    </p>
                  </div>
                )}

                {/* Venue */}
                {event._embedded?.venues?.[0] && (
                  <div>
                    <h3 className="font-semibold mb-2">Venue</h3>
                    <p className="text-gray-700">{event._embedded.venues[0].name}</p>
                  </div>
                )}

                {/* Genres */}
                {event.classifications && (
                  <div>
                    <h3 className="font-semibold mb-2">Genres</h3>
                    <p className="text-gray-700">
                      {event.classifications
                        .map(c => [c.segment?.name, c.genre?.name, c.subGenre?.name].filter(Boolean).join(' | '))
                        .join(', ')}
                    </p>
                  </div>
                )}

                {/* Price Ranges */}
                {event.priceRanges && (
                  <div>
                    <h3 className="font-semibold mb-2">Price Range</h3>
                    <p className="text-gray-700">
                      ${event.priceRanges[0].min} - ${event.priceRanges[0].max}
                    </p>
                  </div>
                )}

                {/* Ticket Status */}
                {event.dates?.status && (
                  <div>
                    <h3 className="font-semibold mb-2">Ticket Status</h3>
                    <p className="text-gray-700">{event.dates.status.code}</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Artists/Teams Tab */}
            <TabsContent value="artists" className="mt-6">
              {event._embedded?.attractions && event._embedded.attractions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {event._embedded.attractions.map((artist) => (
                    <Card key={artist.id}>
                      <CardContent className="p-4">
                        {artist.images && artist.images[0] && (
                          <img
                            src={artist.images[0].url}
                            alt={artist.name}
                            className="w-full h-48 object-cover rounded mb-3"
                          />
                        )}
                        <h4 className="font-semibold mb-2">{artist.name}</h4>
                        {artist.url && (
                          <a
                            href={artist.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline inline-flex items-center"
                          >
                            View Profile
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No artist information available</p>
              )}
            </TabsContent>

            {/* Venue Tab */}
            <TabsContent value="venue" className="mt-6">
              {event._embedded?.venues?.[0] ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Name</h3>
                    <p className="text-gray-700">{event._embedded.venues[0].name}</p>
                  </div>
                  
                  {event._embedded.venues[0].address && (
                    <div>
                      <h3 className="font-semibold mb-2">Address</h3>
                      <p className="text-gray-700">
                        {event._embedded.venues[0].address.line1}
                        {event._embedded.venues[0].city && `, ${event._embedded.venues[0].city.name}`}
                        {event._embedded.venues[0].state && `, ${event._embedded.venues[0].state.name}`}
                      </p>
                    </div>
                  )}

                  {event._embedded.venues[0].url && (
                    <div>
                      <a
                        href={event._embedded.venues[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center"
                      >
                        View Venue Website
                        <ExternalLink className="ml-1 h-4 w-4" />
                      </a>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No venue information available</p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default EventDetail