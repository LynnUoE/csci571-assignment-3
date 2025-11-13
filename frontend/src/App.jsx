import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import Home from './pages/home.jsx'
import Favorites from './pages/Favorites'
import EventDetail from './pages/EventDetail'
import { Search as SearchIcon, Heart, Menu, X } from 'lucide-react'

function NavBar() {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const isActive = (path) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo/Title */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Events Around
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`flex items-center space-x-1 text-sm ${
                isActive('/')
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SearchIcon className="h-4 w-4" />
              <span>Search</span>
            </Link>
            
            <Link
              to="/favorites"
              className={`flex items-center space-x-1 text-sm ${
                isActive('/favorites')
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Favorites</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-3 border-t border-gray-200 mt-2">
            <div className="flex flex-col space-y-2 pt-2">
              <Link
                to="/"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                  isActive('/')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <SearchIcon className="h-4 w-4" />
                <span>Search</span>
              </Link>
              
              <Link
                to="/favorites"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm ${
                  isActive('/favorites')
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Heart className="h-4 w-4" />
                <span>Favorites</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-white">
        <NavBar />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/event/:id" element={<EventDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App