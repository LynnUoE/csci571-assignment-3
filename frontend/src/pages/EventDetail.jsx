import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { addToFavorites, removeFromFavorites, checkIsFavorite } from '../utils/favoritesUtils';
import { Facebook, Twitter } from 'lucide-react';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Spotify data
  const [artistData, setArtistData] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loadingSpotify, setLoadingSpotify] = useState(false);

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/events/${id}`);
      if (!response.ok) throw new Error('Failed to fetch event details');
      const data = await response.json();
      setEvent(data);
      
      // Check if event is in favorites using the utility function
      const favoriteStatus = await checkIsFavorite(id);
      setIsFavorite(favoriteStatus);

      // If music event, fetch Spotify data
      if (data.classifications?.[0]?.segment?.name?.toLowerCase() === 'music') {
        fetchSpotifyData(data);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSpotifyData = async (eventData) => {
    try {
      setLoadingSpotify(true);
      
      // Get first artist name
      const artistName = eventData._embedded?.attractions?.[0]?.name;
      if (!artistName) return;

      // Search for artist on Spotify
      const artistResponse = await fetch(`/api/artists/search?keyword=${encodeURIComponent(artistName)}`);
      if (!artistResponse.ok) {
        console.error('Failed to fetch artist from Spotify');
        return;
      }
      
      const artist = await artistResponse.json();
      setArtistData(artist);

      // Fetch albums
      if (artist.id) {
        const albumsResponse = await fetch(`/api/artists/${artist.id}/albums`);
        if (albumsResponse.ok) {
          const albumsData = await albumsResponse.json();
          setAlbums(albumsData.items || []);
        }
      }
    } catch (err) {
      console.error('Error fetching Spotify data:', err);
    } finally {
      setLoadingSpotify(false);
    }
  };

  const handleFavoriteToggle = async () => {
    try {
      if (isFavorite) {
        const result = await removeFromFavorites(event);
        if (result.success) {
          setIsFavorite(false);
        }
      } else {
        const result = await addToFavorites(event);
        if (result.success) {
          setIsFavorite(true);
        }
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Helper functions
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTicketStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    if (statusLower === 'onsale') return 'bg-green-500';
    if (statusLower === 'offsale') return 'bg-red-500';
    if (statusLower === 'canceled' || statusLower === 'cancelled') return 'bg-black';
    if (statusLower === 'postponed' || statusLower === 'rescheduled') return 'bg-orange-500';
    return 'bg-gray-500';
  };

  const formatTicketStatus = (status) => {
    if (!status) return '';
    const statusLower = status.toLowerCase();
    
    // Format ticket status text
    if (statusLower === 'onsale') return 'On Sale';
    if (statusLower === 'offsale') return 'Off Sale';
    if (statusLower === 'canceled' || statusLower === 'cancelled') return 'Canceled';
    if (statusLower === 'postponed') return 'Postponed';
    if (statusLower === 'rescheduled') return 'Rescheduled';
    
    // Capitalize first letter for any other status
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getSeatmapUrl = () => {
    return event?.seatmap?.staticUrl || null;
  };

  const handleShare = (platform) => {
    const eventUrl = event?.url || '';
    const eventName = event?.name || '';
    
    if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`, '_blank');
    } else if (platform === 'twitter') {
      const text = `Check ${eventName} on Ticketmaster.`;
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(eventUrl)}`, '_blank');
    }
  };

  // Format numbers with commas
  const formatNumber = (num) => {
    return num?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") || '0';
  };

  // Format album release date
  const formatAlbumDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading event details...</div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">Error loading event details</div>
      </div>
    );
  }

  // Check if this is a music event
  const isMusicEvent = event.classifications?.[0]?.segment?.name?.toLowerCase() === 'music';

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 px-0 hover:bg-transparent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Search
      </Button>

      {/* Event Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">{event.name}</h1>
        
        <div className="flex gap-2">
          {/* Buy Tickets Button */}
          {event.url && (
            <Button
              onClick={() => window.open(event.url, '_blank')}
              className="bg-black hover:bg-gray-800"
            >
              Buy Tickets
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          )}
          
          {/* Favorite Button */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleFavoriteToggle}
            className={isFavorite ? 
              'text-red-500 border-red-500 hover:bg-red-50' : 'hover:bg-gray-100'}
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
          <TabsTrigger value="artist" disabled={!isMusicEvent}>
            Artist
          </TabsTrigger>
          <TabsTrigger value="venue">Venue</TabsTrigger>
        </TabsList>

        {/* Info Tab Content */}
        <TabsContent value="info" className="mt-6">
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
              {event.classifications?.[0] && (() => {
                const genres = [
                  event.classifications[0].segment?.name,
                  event.classifications[0].genre?.name,
                  event.classifications[0].subGenre?.name,
                  event.classifications[0].type?.name,
                  event.classifications[0].subType?.name
                ].filter(item => {
                  // Filter out empty, null, undefined, and "Undefined" string
                  return item && 
                         item.trim() !== '' && 
                         item.toLowerCase() !== 'undefined';
                });
                
                // Remove duplicates
                const uniqueGenres = [...new Set(genres)];
                
                return uniqueGenres.length > 0 ? (
                  <div>
                    <h3 className="text-gray-600 text-sm mb-1">Genres</h3>
                    <p className="text-gray-900 font-normal">
                      {uniqueGenres.join(' , ')}
                    </p>
                  </div>
                ) : null;
              })()}

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
                  <h3 className="text-gray-600 text-sm mb-1">Ticket Status</h3>
                  <span className={`inline-block px-3 py-1 rounded text-white text-sm ${getTicketStatusColor(event.dates.status.code)}`}>
                    {formatTicketStatus(event.dates.status.code)}
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
                    className="text-blue-600 hover:underline"
                  >
                    Ticketmaster
                  </a>
                </div>
              )}

              {/* Share Icons */}
              <div>
                <h3 className="text-gray-600 text-sm mb-2">Share</h3>
                <div className="flex gap-3">
                  {/* Facebook Icon */}
                  <button
                    onClick={() => handleShare('facebook')}
                    className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Share on Facebook"
                  >
                    <svg 
                      className="w-5 h-5 text-gray-700" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </button>
                  
                  {/* Twitter Icon */}
                  <button
                    onClick={() => handleShare('twitter')}
                    className="w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition-colors shadow-sm"
                    aria-label="Share on Twitter"
                  >
                    <svg 
                      className="w-5 h-5 text-gray-700" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                    </svg>
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
        <TabsContent value="artist" className="mt-6">
          <div className="space-y-8">
            {isMusicEvent && event._embedded?.attractions && event._embedded.attractions.length > 0 ? (
              <>
                {loadingSpotify ? (
                  <div className="text-center py-12 text-gray-500">
                    <p>Loading artist information...</p>
                  </div>
                ) : artistData ? (
                  <>
                      {/* Artist Info Card */}
                      <div className="flex flex-row gap-4 items-start">
                        {/* Artist Image - Always on the left */}
                        {artistData.images?.[0] && (
                          <img
                            src={artistData.images[0].url}
                            alt={artistData.name}
                            className="w-24 h-24 sm:w-40 sm:h-40 rounded-lg object-cover flex-shrink-0"
                          />
                        )}
                        
                        {/* Artist Details - Always on the right */}
                        <div className="flex-1 min-w-0">
                          <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4">{artistData.name}</h2>
                          
                          {/* Stats Layout */}
                          <div className="space-y-2 mb-3 sm:mb-4">
                            {/* Mobile: Vertical stacked layout */}
                            <div className="sm:hidden space-y-2">
                              <div>
                                <p className="text-xs text-gray-600">Followers:</p>
                                <p className="text-sm font-medium">{formatNumber(artistData.followers?.total)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-600">Popularity:</p>
                                <p className="text-sm font-medium">{artistData.popularity}%</p>
                              </div>
                              {artistData.genres && artistData.genres.length > 0 && (
                                <div>
                                  <p className="text-xs text-gray-600">Genres:</p>
                                  <p className="text-sm">{artistData.genres.join(', ')}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Desktop: Followers & Popularity on same line, Genres on second line */}
                            <div className="hidden sm:block space-y-2">
                              <div className="flex gap-6">
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Followers:</span> {formatNumber(artistData.followers?.total)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Popularity:</span> {artistData.popularity}%
                                </p>
                              </div>
                              {artistData.genres && artistData.genres.length > 0 && (
                                <p className="text-sm text-gray-600">
                                  <span className="font-semibold">Genres:</span> {artistData.genres.join(', ')}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          {/* Open in Spotify Button */}
                          {artistData.external_urls?.spotify && (
                            <a 
                              href={artistData.external_urls.spotify}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 bg-black hover:bg-gray-800 text-white h-9 sm:h-10 px-3 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors"
                            >
                              <span>Open in Spotify</span>
                              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                    {/* Albums Section - Full Width */}
                    {albums.length > 0 && (
                      <div className="w-full">
                        <h3 className="text-xl font-bold mb-4">Albums</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4">
                          {albums.map((album) => (
                            <a
                              key={album.id}
                              href={album.external_urls?.spotify}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group cursor-pointer"
                            >
                              <div className="aspect-square bg-gray-200 rounded-lg mb-2 overflow-hidden">
                                {album.images?.[0] ? (
                                  <img 
                                    src={album.images[0].url} 
                                    alt={album.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400" />
                                )}
                              </div>
                              <p className="text-sm font-medium truncate">{album.name}</p>
                              <p className="text-xs text-gray-500">{formatAlbumDate(album.release_date)}</p>
                              <p className="text-xs text-gray-500">{album.total_tracks} tracks</p>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <p>No artist information available from Spotify</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>No artist information available</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Venue Tab Content */}

          <TabsContent value="venue" className="mt-6">
            <div>
              {event._embedded?.venues && event._embedded.venues[0] ? (
                <>
                  {/* Desktop Layout: Title and Button on same row */}
                  <div className="hidden lg:flex justify-between items-start mb-6">
                    <div className="flex-1">
                      {/* Venue Name */}
                      <h2 className="text-2xl font-bold mb-2">{event._embedded.venues[0].name}</h2>
                      
                      {/* Address */}
                      {event._embedded.venues[0].address && (
                        <div>
                          {event._embedded.venues[0].location?.latitude && event._embedded.venues[0].location?.longitude ? (
                            <a
                              href={`https://www.google.com/maps?q=${event._embedded.venues[0].location.latitude},${event._embedded.venues[0].location.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline text-base inline-flex items-center gap-1"
                            >
                              {[
                                event._embedded.venues[0].address.line1,
                                event._embedded.venues[0].city?.name,
                                event._embedded.venues[0].state?.stateCode
                              ].filter(Boolean).join(', ')}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <p className="text-base text-gray-700">
                              {[
                                event._embedded.venues[0].address.line1,
                                event._embedded.venues[0].city?.name,
                                event._embedded.venues[0].state?.stateCode
                              ].filter(Boolean).join(', ')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* See Events Button - Desktop: Top right */}
                    {event._embedded.venues[0].url && (
                      <Button
                        onClick={() => window.open(event._embedded.venues[0].url, '_blank')}
                        variant="outline"
                        className="flex items-center gap-2 ml-4 flex-shrink-0"
                      >
                        See Events
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Mobile Layout: Stacked vertically */}
                  <div className="lg:hidden mb-6">
                    {/* Venue Name */}
                    <h2 className="text-2xl font-bold mb-2">{event._embedded.venues[0].name}</h2>
                    
                    {/* Address */}
                    {event._embedded.venues[0].address && (
                      <div className="mb-4">
                        {event._embedded.venues[0].location?.latitude && event._embedded.venues[0].location?.longitude ? (
                          <a
                            href={`https://www.google.com/maps?q=${event._embedded.venues[0].location.latitude},${event._embedded.venues[0].location.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-base inline-flex items-center gap-1"
                          >
                            {[
                              event._embedded.venues[0].address.line1,
                              event._embedded.venues[0].city?.name,
                              event._embedded.venues[0].state?.stateCode
                            ].filter(Boolean).join(', ')}
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        ) : (
                          <p className="text-base text-gray-700">
                            {[
                              event._embedded.venues[0].address.line1,
                              event._embedded.venues[0].city?.name,
                              event._embedded.venues[0].state?.stateCode
                            ].filter(Boolean).join(', ')}
                          </p>
                        )}
                      </div>
                    )}
                    
                    {/* See Events Button - Mobile: Full width, centered below address */}
                    {event._embedded.venues[0].url && (
                      <Button
                        onClick={() => window.open(event._embedded.venues[0].url, '_blank')}
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2"
                      >
                        See Events
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Two Column Layout: Image on left, Info on right */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column - Venue Image */}
                    <div>
                      {event._embedded.venues[0].images?.[0] && (
                        <div className="rounded-lg overflow-hidden border bg-white p-4">
                          <img
                            src={event._embedded.venues[0].images[0].url}
                            alt={event._embedded.venues[0].name}
                            className="w-full h-auto"
                          />
                        </div>
                      )}
                    </div>

                    {/* Right Column - Venue Information */}
                    <div className="space-y-6">
                      {/* Parking Info */}
                      {event._embedded.venues[0].parkingDetail && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Parking</h3>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {event._embedded.venues[0].parkingDetail}
                          </p>
                        </div>
                      )}

                      {/* General Rule */}
                      {event._embedded.venues[0].generalInfo?.generalRule && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">General Rule</h3>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {event._embedded.venues[0].generalInfo.generalRule}
                          </p>
                        </div>
                      )}

                      {/* Child Rule */}
                      {event._embedded.venues[0].generalInfo?.childRule && (
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-2">Child Rule</h3>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">
                            {event._embedded.venues[0].generalInfo.childRule}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
  );
}