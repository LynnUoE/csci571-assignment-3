import { useState, useEffect, useRef } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Switch } from './ui/switch'
import { X, Loader2, ChevronDown, Search } from 'lucide-react'
import { apiService, geocodingService, ipinfoService } from '../services/api'

function SearchForm({ onSearch, onClear }) {
  const [formData, setFormData] = useState({
    keyword: '',
    distance: '10',
    category: 'All',
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
    { value: 'All', label: 'All', segmentId: '' },
    { value: 'Music', label: 'Music', segmentId: 'KZFzniwnSyZfZ7v7nJ' },
    { value: 'Sports', label: 'Sports', segmentId: 'KZFzniwnSyZfZ7v7nE' },
    { value: 'Arts & Theatre', label: 'Arts & Theatre', segmentId: 'KZFzniwnSyZfZ7v7na' },
    { value: 'Film', label: 'Film', segmentId: 'KZFzniwnSyZfZ7v7nn' },
    { value: 'Miscellaneous', label: 'Miscellaneous', segmentId: 'KZFzniwnSyZfZ7v7n1' },
  ]

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced autocomplete fetching
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
      setSuggestions(attractions.slice(0, 8))
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
        const location = await ipinfoService.getCurrentLocation()
        lat = location.lat
        lng = location.lng
      } else {
        const coords = await geocodingService.getCoordinates(formData.location)
        lat = coords.lat
        lng = coords.lng
      }

      const selectedCategory = categories.find(cat => cat.value === formData.category)
      
      onSearch({
        keyword: formData.keyword,
        lat,
        lng,
        radius: formData.distance,
        category: selectedCategory?.segmentId || ''
      })
    } catch (error) {
      setErrors({ location: 'Unable to determine location. Please try again.' })
    }
  }

  const handleClearClick = () => {
    setFormData({
      keyword: '',
      distance: '10',
      category: 'All',
      location: '',
      autoDetect: false
    })
    setErrors({})
    setSuggestions([])
    onClear()
  }

  // 🔧 FIX: Prepare suggestions list with user input as first option
  const getDisplaySuggestions = () => {
    if (!formData.keyword.trim()) return []
    
    // Create array with user's typed value as first item
    const userInputOption = {
      name: formData.keyword,
      id: 'user-input',
      isUserInput: true
    }
    
    // Filter out any API suggestions that exactly match user input
    const filteredSuggestions = suggestions.filter(
      s => s.name.toLowerCase() !== formData.keyword.toLowerCase()
    )
    
    return [userInputOption, ...filteredSuggestions]
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit}>
        {/* Responsive layout: vertical on mobile, horizontal on desktop */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          {/* Keywords Field with Autocomplete */}
          <div className="flex-1 min-w-0 md:min-w-[200px] relative" ref={suggestionsRef}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Keywords <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                ref={keywordInputRef}
                name="keyword"
                value={formData.keyword}
                onChange={handleChange}
                onFocus={() => {
                  if (formData.keyword.trim().length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                placeholder="Search for events..."
                className={`h-9 text-sm pr-16 ${errors.keyword ? 'border-red-500' : ''}`}
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                {loadingSuggestions && <Loader2 className="h-3 w-3 animate-spin text-gray-400" />}
                {formData.keyword && (
                  <button 
                    type="button" 
                    onClick={clearKeyword} 
                    className="p-0.5 hover:bg-gray-100 rounded"
                  >
                    <X className="h-3 w-3 text-gray-400" />
                  </button>
                )}
                <ChevronDown className="h-3 w-3 text-gray-400" />
              </div>
            </div>
            
            {/* 🔧 FIX: Autocomplete dropdown with user input as first option */}
            {showSuggestions && formData.keyword.trim().length > 0 && (
              <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {getDisplaySuggestions().map((suggestion, index) => (
                  <div
                    key={suggestion.id || index}
                    onClick={() => selectSuggestion(suggestion)}
                    className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm ${
                      suggestion.isUserInput ? 'font-medium border-b' : ''
                    }`}
                  >
                    {suggestion.name}
                  </div>
                ))}
              </div>
            )}
            {errors.keyword && <p className="text-xs text-red-500 mt-1">{errors.keyword}</p>}
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-32">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="h-9 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location Field */}
          <div className="flex-1 min-w-0 md:min-w-[180px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Location <span className="text-red-500">*</span>
            </label>
            <Input
              name="location"
              value={formData.location}
              onChange={handleChange}
              disabled={formData.autoDetect}
              placeholder="Enter location..."
              className={`h-9 text-sm ${errors.location ? 'border-red-500' : ''} ${
                formData.autoDetect ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>

          {/* Auto-detect Location Switch */}
          <div className="flex items-center gap-2 md:pb-[2px]">
            <Switch
              checked={formData.autoDetect}
              onCheckedChange={(checked) => {
                setFormData(prev => ({
                  ...prev,
                  autoDetect: checked,
                  location: checked ? '' : prev.location
                }))
                if (errors.location) {
                  setErrors(prev => ({ ...prev, location: '' }))
                }
              }}
            />
            <label className="text-xs text-gray-700 whitespace-nowrap cursor-pointer">
              Auto-detect Location
            </label>
          </div>

          {/* Distance Field */}
          <div className="w-full md:w-28">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Distance <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Input
                name="distance"
                type="number"
                value={formData.distance}
                onChange={handleChange}
                min="1"
                className={`h-9 text-sm pr-12 ${errors.distance ? 'border-red-500' : ''}`}
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                miles
              </span>
            </div>
            {errors.distance && <p className="text-xs text-red-500 mt-1">{errors.distance}</p>}
          </div>

          {/* Search Button */}
          <div className="flex items-end md:pb-[2px]">
            <Button 
              type="submit" 
              className="w-full md:w-auto h-9 bg-black hover:bg-gray-800 text-white text-sm px-4"
            >
              <Search className="h-3.5 w-3.5 mr-1.5" />
              Search Events
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default SearchForm