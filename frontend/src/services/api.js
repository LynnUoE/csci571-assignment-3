import axios from 'axios'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

// API 服务
export const apiService = {
  // 健康检查
  healthCheck: async () => {
    const response = await api.get('/health')
    return response.data
  },

  // 获取事件建议（自动完成）
  getEventSuggestions: async (keyword) => {
    const response = await api.get('/events/suggest', {
      params: { keyword }
    })
    return response.data
  },

  // 搜索事件
  searchEvents: async (params) => {
    const { keyword, lat, lng, radius, category } = params
    const response = await api.get('/events/search', {
      params: {
        keyword,
        lat,
        lng,
        radius,
        ...(category && { segmentId: category })
      }
    })
    return response.data
  },

  // 获取事件详情
  getEventDetails: async (eventId) => {
    const response = await api.get(`/events/${eventId}`)
    return response.data
  },

  // 搜索艺术家信息（Spotify）
  searchArtist: async (keyword) => {
    const response = await api.get('/artists/search', {
      params: { keyword }
    })
    return response.data
  },

  // 获取收藏列表
  getFavorites: async () => {
    const response = await api.get('/favorites')
    return response.data
  },

  // 添加收藏
  addFavorite: async (event) => {
    const response = await api.post('/favorites', event)
    return response.data
  },

  // 删除收藏
  removeFavorite: async (eventId) => {
    const response = await api.delete(`/favorites/${eventId}`)
    return response.data
  },

  // 检查是否已收藏
  isFavorite: async (eventId) => {
    try {
      const response = await api.get(`/favorites/${eventId}`)
      return response.data
    } catch (error) {
      // If not found, return false
      return { isFavorite: false }
    }
  }
}

// Google Geocoding API（直接从前端调用）
// 从环境变量读取 API Key，如果没有则使用默认值
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

export const geocodingService = {
  getCoordinates: async (address) => {
    if (!GOOGLE_API_KEY) {
      console.error('Google Maps API Key is not configured')
      throw new Error('Google Maps API Key is missing. Please add VITE_GOOGLE_MAPS_API_KEY to your .env file')
    }

    try {
      const response = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json`,
        {
          params: {
            address,
            key: GOOGLE_API_KEY
          }
        }
      )
      
      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location
        return {
          lat: location.lat,
          lng: location.lng
        }
      }
      
      throw new Error('Location not found')
    } catch (error) {
      console.error('Geocoding error:', error)
      if (error.response?.data?.error_message) {
        throw new Error(`Geocoding failed: ${error.response.data.error_message}`)
      }
      throw new Error('Unable to geocode address')
    }
  }
}

// IPinfo API（获取用户位置）
export const ipinfoService = {
  getCurrentLocation: async () => {
    try {
      // IPinfo API 免费版本，不需要 token
      const response = await axios.get('https://ipinfo.io/json')
      
      if (response.data.loc) {
        const [lat, lng] = response.data.loc.split(',')
        return {
          lat: parseFloat(lat),
          lng: parseFloat(lng)
        }
      }
      
      throw new Error('Unable to get location from IP')
    } catch (error) {
      console.error('Error getting location from IP:', error)
      // 默认返回洛杉矶的坐标
      console.log('Using default location: Los Angeles, CA')
      return {
        lat: 34.0522,
        lng: -118.2437
      }
    }
  }
}

export default api