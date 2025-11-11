import { useState } from 'react'
import SearchForm from '../components/SearchForm'
import EventCard from '../components/EventCard'
import { apiService } from '../services/api'
import { Loader2, Search } from 'lucide-react'

function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searched, setSearched] = useState(false)

  const handleSearch = async (searchData) => {
    setLoading(true)
    setError(null)
    setSearched(true)
    
    try {
      const data = await apiService.searchEvents(searchData)
      
      // Extract events from response
      let eventsList = []
      if (data._embedded && data._embedded.events) {
        eventsList = data._embedded.events
        
        // Sort by date ascending
        eventsList.sort((a, b) => {
          const dateA = new Date(a.dates?.start?.localDate || '9999-12-31')
          const dateB = new Date(b.dates?.start?.localDate || '9999-12-31')
          return dateA - dateB
        })
      }
      
      setEvents(eventsList)
    } catch (err) {
      console.error('Search error:', err)
      setError('Failed to fetch events. Please try again.')
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setEvents([])
    setError(null)
    setSearched(false)
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Events Search</h2>
      </div>

      {/* Search Form */}
      <SearchForm onSearch={handleSearch} onClear={handleClear} />

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500">Searching for events...</p>
        </div>
      )}

      {/* Error Message */}
      {error && !loading && (
        <div className="mt-8 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* No Results */}
      {!loading && searched && events.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <Search className="h-16 w-16 mb-4 text-gray-300" />
          <p className="text-xl font-semibold mb-2">No results available</p>
          <p className="text-sm">Try adjusting your search criteria</p>
        </div>
      )}

      {/* Results Grid */}
      {!loading && events.length > 0 && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            Found {events.length} event{events.length !== 1 ? 's' : ''}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!loading && !searched && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <Search className="h-16 w-16 mb-4" />
          <p className="text-lg">Enter search criteria and click the Search button to find events</p>
        </div>
      )}
    </div>
  )
}

export default Home