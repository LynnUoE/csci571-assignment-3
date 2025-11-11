import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent } from './ui/card'
import { X, Loader2, ChevronDown } from 'lucide-react'
import { apiService, geocodingService, ipinfoService } from '../services/api'

function SearchForm({ onSearch, onClear }) {
  const [formData, setFormData] = useState({
    keyword: '',
    distance: '10',
    category: 'KZFzniwnSyZfZ7v7nJ', // Default to Music
    location: '',
    autoDetect: false
  })

  const [errors, setErrors] = useState({})
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const suggestionsRef = useRef(null)
  const keywordInputRef = useRef(null)

  const categories = [
    { value: 'KZFzniwnSyZfZ7v7nJ', label: 'Music' },
    { value: 'KZFzniwnSyZfZ7v7nE', label: 'Sports' },
    { value: 'KZFzniwnSyZfZ7v7na', label: 'Arts & Theatre' },
    { value: 'KZFzniwnSyZfZ7v7nn', label: 'Film' },
    { value: 'KZFzniwnSyZfZ7v7n1', label: 'Miscellaneous' },
  ]

  // Handle clicks outside suggestions dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced autocomplete
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.keyword.trim().length > 0) {
        fetchSuggestions(formData.keyword)
      } else {
        setSuggestions([])
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [formData.keyword])

  const fetchSuggestions = async (keyword) => {
    setLoadingSuggestions(true)
    try {
      const data = await apiService.getEventSuggestions(keyword)
      const attractions = data._embedded?.attractions || []
      setSuggestions(attractions.slice(0, 8)) // Limit to 8 suggestions
      setShowSuggestions(true)
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleAutoDetectChange = async (e) => {
    const checked = e.target.checked
    setFormData(prev => ({
      ...prev,
      autoDetect: checked,
      location: checked ? '' : prev.location
    }))
    
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }))
    }
  }

  const selectSuggestion = (suggestion) => {
    setFormData(prev => ({ ...prev, keyword: suggestion.name }))
    setShowSuggestions(false)
    setSuggestions([])
  }

  const clearKeyword = () => {
    setFormData(prev => ({ ...prev, keyword: '' }))
    setSuggestions([])
    keywordInputRef.current?.focus()
  }

  const validate = () => {
    const newErrors = {}
    
    if (!formData.keyword.trim()) {
      newErrors.keyword = 'Please enter some keywords'
    }
    
    if (!formData.autoDetect && !formData.location.trim()) {
      newErrors.location = 'Location is required when auto-detect is disabled'
    }

    if (formData.distance && parseFloat(formData.distance) < 1) {
      newErrors.distance = 'Distance must be at least 1 mile'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validate()) {
      return
    }

    try {
      let lat, lng

      if (formData.autoDetect) {
        // Get location from IP
        const location = await ipinfoService.getCurrentLocation()
        lat = location.lat
        lng = location.lng
      } else {
        // Geocode the address
        const coords = await geocodingService.getCoordinates(formData.location)
        lat = coords.lat
        lng = coords.lng
      }

      // Call parent search handler
      onSearch({
        keyword: formData.keyword,
        lat,
        lng,
        radius: formData.distance,
        category: formData.category
      })
    } catch (error) {
      setErrors({ location: 'Unable to determine location. Please try again.' })
    }
  }

  const handleClearClick = () => {
    setFormData({
      keyword: '',
      distance: '10',
      category: 'KZFzniwnSyZfZ7v7nJ',
      location: '',
      autoDetect: false
    })
    setErrors({})
    setSuggestions([])
    onClear()
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Keyword with Autocomplete */}
          <div className="space-y-2 relative" ref={suggestionsRef}>
            <label htmlFor="keyword" className="text-sm font-medium flex items-center">
              Keyword <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Input
                ref={keywordInputRef}
                id="keyword"
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                placeholder="Search for events..."
                className={errors.keyword ? 'border-red-500 pr-20' : 'pr-20'}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {loadingSuggestions && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}
                {formData.keyword && (
                  <button
                    type="button"
                    onClick={clearKeyword}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                )}
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            {errors.keyword && (
              <p className="text-sm text-red-500">{errors.keyword}</p>
            )}
            
            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.id || index}
                    onClick={() => selectSuggestion(suggestion)}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                  >
                    {suggestion.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Distance */}
          <div className="space-y-2">
            <label htmlFor="distance" className="text-sm font-medium flex items-center">
              Distance <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <Input
                id="distance"
                name="distance"
                type="number"
                value={formData.distance}
                onChange={handleChange}
                placeholder="10"
                min="1"
                className={errors.distance ? 'border-red-500' : ''}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                miles
              </span>
            </div>
            {errors.distance && (
              <p className="text-sm text-red-500">{errors.distance}</p>
            )}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium flex items-center">
              Category <span className="text-red-500 ml-1">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-detect Location */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="autoDetect"
              name="autoDetect"
              checked={formData.autoDetect}
              onChange={handleAutoDetectChange}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="autoDetect" className="text-sm font-medium text-red-500">
              Auto-detect Location
            </label>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium flex items-center">
              Location <span className="text-red-500 ml-1">*</span>
            </label>
            <Input
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={formData.autoDetect}
              placeholder="Enter city, district or street..."
              className={errors.location ? 'border-red-500' : ''}
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location}</p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-2">
            <Button type="submit" className="flex-1 bg-red-500 hover:bg-red-600">
              Search Events
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClearClick}
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default SearchForm