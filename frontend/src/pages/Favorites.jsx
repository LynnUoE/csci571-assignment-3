import { useState, useEffect } from 'react'
import { apiService } from '../services/api'
import EventCard from '../components/ui/card'
import { Loader2, Heart } from 'lucide-react'

function Favorites() {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadFavorites()
  }, [])

  const loadFavorites = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await apiService.getFavorites()
      setFavorites(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading favorites:', err)
      setError('Failed to load favorites')
      setFavorites([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
        <p className="text-gray-500">Loading favorites...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-6">My Favorites</h2>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">My Favorites</h2>
        <p className="text-gray-600">
          {favorites.length} {favorites.length === 1 ? 'event' : 'events'} saved
        </p>
      </div>

      {favorites.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Heart className="h-16 w-16 mb-4" />
          <p className="text-xl font-semibold mb-2">No favorite events yet</p>
          <p className="text-sm">Add events to your favorites by clicking the heart icon on any event</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites