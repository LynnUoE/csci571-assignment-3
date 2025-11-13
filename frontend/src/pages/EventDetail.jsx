import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiService } from '../services/api'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs'
import { Button } from '../components/ui/button'
import { ChevronLeft, ExternalLink, Loader2, Heart } from 'lucide-react'
import { Facebook, Twitter } from 'lucide-react'

function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isFavorite, setIsFavorite] = useState(false)

  useEffect(() => {
    loadEventDetail()
  }, [id])

  const loadEventDetail = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await apiService.getEventDetails(id)
      setEvent(data)
      
      // Check if event is in favorites
      try {
        const favorites = await apiService.getFavorites()
        setIsFavorite(favorites.some(fav => fav.id === id))
      } catch (err) {
        console.error('Error checking favorites:', err)
      }
    } catch (err) {
      console.error('Error loading event details:', err)
      setError('Failed to load event details')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await apiService.removeFavorite(id)
        setIsFavorite(false)
      } else {
        await apiService.addFavorite(event)
        setIsFavorite(true)
      }
    } catch (err) {
      console.error('Error toggling favorite:', err)
    }
  }

  // Get ticket status color based on code
  const getTicketStatusColor = (status) => {
    if (!status) return 'bg-gray-500'
    const code = status.toLowerCase()
    
    if (code.includes('onsale') || code === 'on sale') return 'bg-green-500'
    if (code.includes('offsale') || code === 'off sale') return 'bg-red-500'
    if (code.includes('cancel')) return 'bg-black'
    if (code.includes('postponed') || code.includes('reschedule')) return 'bg-orange-500'
    
    return 'bg-gray-500'
  }

  // Format date to display format
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  // Format time
  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get seatmap URL
  const getSeatmapUrl = () => {
    return event?.seatmap?.staticUrl || null
  }

  // Share on Facebook
  const shareOnFacebook = () => {
    const url = event?.url || window.location.href
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  // Share on Twitter
  const shareOnTwitter = () => {
    const text = `Check ${event?.name || 'this event'} on Ticketmaster`
    const url = event?.url || window.location.href
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading event details...</p>
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back to Search
        </Button>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error || 'Event not found'}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="mb-4 -ml-2 text-sm hover:bg-transparent p-0 text-gray-600 inline-flex items-center"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Search
      </button>

      {/* Event Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold break-words">
          {event.name}
        </h1>
        
        <div className="flex items-center gap-3 flex-shrink-0">
          {event.url && (
            <a 
              href={event.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white h-10 px-4 rounded-md text-sm font-medium transition-colors"
            >
              <span>Buy Tickets</span>
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          
          <Button
            variant="outline"
            size="icon"
            onClick={toggleFavorite}
            className={isFavorite ? 'text-red-500 border-red-500 hover:bg-red-50' : 'hover:bg-gray-100'}
          >
            <Heart 
              className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`}
            />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="info" className="w-full">
        <TabsList className="w-full">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="artist">Artist</TabsTrigger>
          <TabsTrigger value="venue">Venue</TabsTrigger>
        </TabsList>

        {/* Info Tab Content */}
        <TabsContent value="info">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Event Information */}
            <div className="space-y-5">
              {/* Date */}
              {event.dates?.start?.localDate && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-1">Date</h3>
                  <p className="text-gray-900 font-normal">
                    {formatDate(event.dates.start.localDate)}
                    {event.dates.start.localTime && `, ${formatTime(event.dates.start.localTime)}`}
                  </p>
                </div>
              )}

              {/* Artist/Team */}
              {event._embedded?.attractions && event._embedded.attractions.length > 0 && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-1">Artist/Team</h3>
                  <p className="text-gray-900 font-normal">
                    {event._embedded.attractions.map(a => a.name).join(', ')}
                  </p>
                </div>
              )}

              {/* Venue */}
              {event._embedded?.venues?.[0] && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-1">Venue</h3>
                  <p className="text-gray-900 font-normal">{event._embedded.venues[0].name}</p>
                </div>
              )}

              {/* Genres */}
              {event.classifications?.[0] && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-1">Genres</h3>
                  <p className="text-gray-900 font-normal">
                    {[
                      event.classifications[0].segment?.name,
                      event.classifications[0].genre?.name,
                      event.classifications[0].subGenre?.name,
                      event.classifications[0].type?.name,
                      event.classifications[0].subType?.name
                    ].filter(Boolean).join(', ')}
                  </p>
                </div>
              )}

              {/* Price Ranges */}
              {event.priceRanges?.[0] && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-1">Price Ranges</h3>
                  <p className="text-gray-900 font-normal">
                    ${event.priceRanges[0].min} - ${event.priceRanges[0].max}
                  </p>
                </div>
              )}

              {/* Ticket Status */}
              {event.dates?.status?.code && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-2">Ticket Status</h3>
                  <span 
                    className={`${getTicketStatusColor(event.dates.status.code)} text-white px-3 py-1 rounded text-sm font-medium inline-block`}
                  >
                    {event.dates.status.code}
                  </span>
                </div>
              )}

              {/* Buy Ticket At */}
              {event.url && (
                <div>
                  <h3 className="text-gray-600 text-sm mb-1">Buy Ticket At</h3>
                  <a
                    href={event.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline inline-flex items-center font-normal"
                  >
                    Ticketmaster
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Share */}
              <div>
                <h3 className="text-gray-600 text-sm mb-2">Share</h3>
                <div className="flex gap-2">
                  <button
                    onClick={shareOnFacebook}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
                    aria-label="Share on Facebook"
                  >
                    <Facebook className="h-5 w-5 text-gray-700" />
                  </button>
                  <button
                    onClick={shareOnTwitter}
                    className="p-2 rounded-md hover:bg-gray-100 transition-colors border border-gray-300"
                    aria-label="Share on Twitter"
                  >
                    <Twitter className="h-5 w-5 text-gray-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Seatmap */}
            <div>
              <h3 className="text-gray-600 text-sm mb-3">Seatmap</h3>
              {getSeatmapUrl() ? (
                <div className="rounded-lg overflow-hidden bg-gray-50">
                  <img
                    src={getSeatmapUrl()}
                    alt="Venue Seatmap"
                    className="w-full h-auto"
                  />
                </div>
              ) : (
                <div className="w-full h-96 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">No seatmap available</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Artist Tab Content */}
        <TabsContent value="artist">
          <div className="space-y-8">
            {event._embedded?.attractions && event._embedded.attractions.length > 0 ? (
              <>
                {/* Artist Info Card */}
                {event._embedded.attractions[0] && (
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Artist Image */}
                    {event._embedded.attractions[0].images?.[0] && (
                      <img
                        src={event._embedded.attractions[0].images[0].url}
                        alt={event._embedded.attractions[0].name}
                        className="w-32 h-32 rounded-lg object-cover flex-shrink-0"
                      />
                    )}
                    
                    {/* Artist Details */}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold mb-3">{event._embedded.attractions[0].name}</h2>
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Followers:</span> 122,371,766
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Popularity:</span> 89%
                        </p>
                        {event.classifications?.[0]?.genre && (
                          <p className="text-sm text-gray-600">
                            <span className="font-semibold">Genres:</span> {event.classifications[0].genre.name}
                          </p>
                        )}
                      </div>
                      
                      {/* Open in Spotify Button */}
                      <a 
                        href="#" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white h-10 px-4 rounded-md text-sm font-medium transition-colors"
                      >
                        <span>Open in Spotify</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                )}

                {/* Albums Section */}
                <div>
                  <h3 className="text-xl font-bold mb-4">Albums</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((album) => (
                      <a
                        key={album}
                        href="#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group cursor-pointer"
                      >
                        <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-400 group-hover:scale-105 transition-transform" />
                        </div>
                        <p className="text-sm font-medium truncate">Album {album}</p>
                        <p className="text-xs text-gray-500">2024-09-12</p>
                        <p className="text-xs text-gray-500">18 tracks</p>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No artist information available</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Venue Tab Content */}
        <TabsContent value="venue">
          <div className="space-y-6 max-w-4xl">
            {event._embedded?.venues?.[0] ? (
              <>
                {/* Venue Name and Address */}
                <div>
                  <h2 className="text-2xl font-bold mb-3">{event._embedded.venues[0].name}</h2>
                  {event._embedded.venues[0].address && (
                    <div className="mb-4">
                      {event._embedded.venues[0].location?.latitude && event._embedded.venues[0].location?.longitude ? (
                        <a
                          href={`https://www.google.com/maps?q=${event._embedded.venues[0].location.latitude},${event._embedded.venues[0].location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          {[
                            event._embedded.venues[0].address.line1,
                            event._embedded.venues[0].city?.name,
                            event._embedded.venues[0].state?.name || event._embedded.venues[0].state?.stateCode
                          ].filter(Boolean).join(', ')}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <p className="text-gray-700">
                          {[
                            event._embedded.venues[0].address.line1,
                            event._embedded.venues[0].city?.name,
                            event._embedded.venues[0].state?.name || event._embedded.venues[0].state?.stateCode
                          ].filter(Boolean).join(', ')}
                        </p>
                      )}
                    </div>
                  )}

                  {/* See Events Button */}
                  {event._embedded.venues[0].url && (
                    <a 
                      href={event._embedded.venues[0].url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium border border-input hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <span>See Events</span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>

                {/* Venue Image */}
                {event._embedded.venues[0].images?.[0] && (
                  <div className="rounded-lg overflow-hidden border">
                    <img
                      src={event._embedded.venues[0].images[0].url}
                      alt={event._embedded.venues[0].name}
                      className="w-full max-w-md"
                    />
                  </div>
                )}

                {/* Parking Info */}
                {event._embedded.venues[0].parkingDetail && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Parking</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {event._embedded.venues[0].parkingDetail}
                    </p>
                  </div>
                )}

                {/* General Rule */}
                {event._embedded.venues[0].generalInfo?.generalRule && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">General Rule</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {event._embedded.venues[0].generalInfo.generalRule}
                    </p>
                  </div>
                )}

                {/* Child Rule */}
                {event._embedded.venues[0].generalInfo?.childRule && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Child Rule</h3>
                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                      {event._embedded.venues[0].generalInfo.childRule}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No venue information available</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default EventDetail