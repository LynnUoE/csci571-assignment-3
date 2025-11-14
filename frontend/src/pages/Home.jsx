import { useState } from 'react'
import { apiService } from '../services/api'
import SearchForm from '../components/SearchForm'
import EventCard from '../components/EventCard'
import { Loader2, Search } from 'lucide-react'

function Home() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState(null)

  // After receiving events from API, sort them
  const handleSearch = async (searchParams) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await apiService.searchEvents(searchParams)
      const eventsData = data._embedded?.events || []
      
      // Sort events by date and time in ascending order
      const sortedEvents = eventsData.sort((a, b) => {
        const dateA = new Date(`${a.dates?.start?.localDate || '9999-12-31'}T${a.dates?.start?.localTime || '00:00:00'}`)
        const dateB = new Date(`${b.dates?.start?.localDate || '9999-12-31'}T${b.dates?.start?.localTime || '00:00:00'}`)
        return dateA - dateB
      })
      
      setEvents(sortedEvents)
      setSearched(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setEvents([])
    setSearched(false)
    setError(null)
  }

  return (
    <div className="w-full">
      {/* Search Form */}
      <div className="mb-6 sm:mb-8">
        <SearchForm onSearch={handleSearch} onClear={handleClear} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20">
          <Loader2 className="h-12 w-12 sm:h-16 sm:w-16 animate-spin text-gray-400 mb-4" />
          <p className="text-gray-500 text-sm sm:text-base">Searching for events...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* No Results */}
      {!loading && searched && events.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-gray-400">
          <Search className="h-12 w-12 sm:h-16 sm:w-16 mb-4" />
          <p className="text-base sm:text-lg font-medium">Nothing Found</p>
          <p className="text-sm mt-2">Update the query to find events near you</p>
        </div>
      )}

      {/* Results */}
      {!loading && events.length > 0 && (
        <div>
          <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 px-1">
            {events.length} Event{events.length !== 1 ? 's' : ''} Found
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      {/* Initial State */}
      {!loading && !searched && (
        <div className="flex flex-col items-center justify-center py-12 sm:py-20 text-gray-400 px-4">
          <Search className="h-12 w-12 sm:h-16 sm:w-16 mb-4" />
          <p className="text-base sm:text-lg text-center">
            Enter search criteria and click the Search button to find events
          </p>
        </div>
      )}
    </div>
  )
}

export default Home