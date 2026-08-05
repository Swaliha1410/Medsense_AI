import React, { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Search, Phone, Star, Clock, Navigation,
  X, Loader2, RefreshCw, Globe, ExternalLink,
  AlertCircle, ChevronRight, Route, CheckCircle2,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'
import { hospitalSearches } from '../services/api'
import { useNearbyHospitals } from '../hooks/useNearbyHospitals'
import { useOSRMRoute } from '../hooks/useOSRMRoute'
import { useAccurateLocation } from '../hooks/useAccurateLocation'

const LeafletMap = lazy(() => import('../components/LeafletMap'))

const FILTERS = ['All', 'Emergency', 'General', 'Clinic']
const RADII = [
  { label: '2 km',  value: 2000  },
  { label: '5 km',  value: 5000  },
  { label: '10 km', value: 10000 },
  { label: '20 km', value: 20000 },
]

function accuracyLabel(acc) {
  if (!acc) return null
  if (acc <= 20)  return { text: 'Excellent', color: '#14C8A8' }
  if (acc <= 50)  return { text: 'Good',      color: '#14C8A8' }
  if (acc <= 150) return { text: 'Moderate',  color: '#F59E0B' }
  return                { text: 'Low',        color: '#EF4444' }
}

export default function HospitalMap() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()

  // Helper function to get hospital images with variety
  const getHospitalImage = (index) => {
    const hospitalImages = [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=300&h=300&fit=crop&auto=format&q=80', // Modern hospital exterior
      'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=300&h=300&fit=crop&auto=format&q=80', // Hospital building
      'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=300&h=300&fit=crop&auto=format&q=80', // Medical center
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=300&h=300&fit=crop&auto=format&q=80', // Hospital entrance
      'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=300&h=300&fit=crop&auto=format&q=80', // Modern clinic
    ]
    return hospitalImages[index % hospitalImages.length]
  }

  // ── High-accuracy GPS hook ────────────────────────────────────────────────
  const {
    location: userLocation,
    accuracy,
    status: locStatus,
    errorMsg: locationError,
    locate,
  } = useAccurateLocation()

  const [query,     setQuery]     = useState('')
  const [filter,    setFilter]    = useState('All')
  const [sortBy,    setSortBy]    = useState('recommended') // New: track sort preference
  const [radius,    setRadius]    = useState(5000)
  const [selected,  setSelected]  = useState(null)
  const [showRoute, setShowRoute] = useState(false)
  const [mapCenter, setMapCenter] = useState([20.5937, 78.9629])
  const [mapZoom,   setMapZoom]   = useState(5)

  // Fly to first location fix
  useEffect(() => {
    if (userLocation && (locStatus === 'refining' || locStatus === 'ready')) {
      setMapCenter([userLocation.lat, userLocation.lng])
      setMapZoom(15)
    }
  }, [userLocation?.lat, userLocation?.lng, locStatus])

  const routeTo = showRoute && selected ? { lat: selected.lat, lng: selected.lng } : null
  const route   = useOSRMRoute(userLocation, routeTo)
  const { hospitals, loading, error, refetch } = useNearbyHospitals(userLocation, radius)

  const handleSelect = (h) => {
    setSelected(h)
    setShowRoute(false)
    setMapCenter([h.lat, h.lng])
    setMapZoom(15)
  }

  const recenterOnMe = () => {
    if (userLocation) { setMapCenter([userLocation.lat, userLocation.lng]); setMapZoom(15) }
    else locate()
  }

  const handleGetDirections = () => {
    if (!userLocation) { locate(); return }
    setShowRoute(true)
    if (selected) {
      setMapCenter([(userLocation.lat + selected.lat) / 2, (userLocation.lng + selected.lng) / 2])
      setMapZoom(13)
    }
  }

  const saveSearch = async (q) => {
    if (!isLoggedIn || !q.trim()) return
    try {
      await hospitalSearches.save({ query: q, latitude: userLocation?.lat, longitude: userLocation?.lng, results_count: sortedHospitals.length })
    } catch (_) {}
  }

  const openOSMNav = (h) => {
    const from = userLocation ? `${userLocation.lat},${userLocation.lng}` : ''
    window.open(`https://www.openstreetmap.org/directions?from=${from}&to=${h.lat},${h.lng}`, '_blank', 'noreferrer')
  }

  const filtered = hospitals.filter((h) => {
    const q = query.toLowerCase()
    const matchQ = !q || h.name.toLowerCase().includes(q) || h.address.toLowerCase().includes(q) || h.specialties.some((s) => s.toLowerCase().includes(q)) || h.amenity?.includes(q)
    const matchF = filter === 'All' || h.type === filter || (filter === 'Emergency' && h.emergency)
    return matchQ && matchF
  })

  // Sort filtered hospitals based on selected sort option
  const sortedHospitals = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case 'nearest':
        // Sort by distance (ascending)
        return a.distance - b.distance
      case 'topRated':
        // Sort by rating (descending) - using mock rating for now
        return (b.rating || 4.8) - (a.rating || 4.8)
      case 'emergency':
        // Show emergency hospitals first
        return (b.emergency ? 1 : 0) - (a.emergency ? 1 : 0)
      case 'recommended':
      default:
        // Default: mix of distance and emergency
        const aScore = (a.emergency ? 1000 : 0) - a.distance
        const bScore = (b.emergency ? 1000 : 0) - b.distance
        return bScore - aScore
    }
  })

  const accInfo  = accuracyLabel(accuracy)
  const locating = locStatus === 'locating'
  const refining = locStatus === 'refining'

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      {/* HERO SECTION - Premium Hospital Finder Banner */}
      <section className="relative bg-gradient-to-br from-[#F0F9FF] via-white to-[#F0FDFA] overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* LEFT SIDE - Text Content & Search Controls */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 z-10"
            >
              {/* Heading */}
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-[#0F172A] leading-tight mb-3">
                  Find the{' '}
                  <span className="bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] bg-clip-text text-transparent">
                    Right Care
                  </span>
                  {' '}Near You
                </h1>
                <p className="text-[#64748B] text-base lg:text-lg leading-relaxed">
                  AI-powered recommendations based on your health needs and location.
                </p>
              </div>

              {/* Search Bar with My Location Button */}
              <div className="flex gap-3">
                <div className="flex-1 flex items-center gap-3 bg-white rounded-2xl shadow-md border border-[#E2E8F0] px-5 py-4 hover:shadow-lg transition-shadow">
                  <Search className="w-5 h-5 text-[#94A3B8] flex-shrink-0" />
                  <input 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && saveSearch(query)}
                    placeholder="Search hospitals, clinics, specialties..."
                    className="flex-1 text-[15px] outline-none text-[#0F172A] bg-transparent placeholder:text-[#94A3B8]" 
                  />
                  {query && (
                    <button 
                      onClick={() => setQuery('')} 
                      className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* My Location Button */}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={locate} 
                  disabled={locating || refining}
                  className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl shadow-md text-[15px] font-semibold transition-all whitespace-nowrap border ${
                    locStatus === 'ready' 
                      ? 'bg-[#0F6FFF] text-white border-[#0F6FFF] hover:bg-[#0E5FE5]'
                      : locating || refining 
                      ? 'bg-white text-[#94A3B8] border-[#E2E8F0] cursor-not-allowed'
                      : 'bg-white text-[#0F6FFF] border-[#E2E8F0] hover:border-[#0F6FFF] hover:bg-[#F8FAFC]'
                  }`}
                >
                  {locating || refining ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Navigation className="w-5 h-5" />
                  )}
                  <span className="hidden sm:inline">My Location</span>
                </motion.button>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Recommended - Active */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy('recommended')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-all ${
                    sortBy === 'recommended'
                      ? 'bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0F6FFF] hover:text-[#0F6FFF]'
                  }`}
                >
                  <Star className={`w-4 h-4 ${sortBy === 'recommended' ? 'fill-current' : ''}`} />
                  <span>Recommended</span>
                </motion.button>

                {/* Other Filter Buttons */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy('nearest')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md ${
                    sortBy === 'nearest'
                      ? 'bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0F6FFF] hover:text-[#0F6FFF]'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Nearest</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy('topRated')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md ${
                    sortBy === 'topRated'
                      ? 'bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0F6FFF] hover:text-[#0F6FFF]'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  <span>Top Rated</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSortBy('emergency')}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md ${
                    sortBy === 'emergency'
                      ? 'bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white'
                      : 'bg-white border border-[#E2E8F0] text-[#64748B] hover:border-[#0F6FFF] hover:text-[#0F6FFF]'
                  }`}
                >
                  <AlertCircle className="w-4 h-4" />
                  <span>Emergency</span>
                </motion.button>

                {/* More Filters */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E2E8F0] hover:border-[#0F6FFF] hover:bg-[#F8FAFC] rounded-full text-sm font-medium text-[#64748B] hover:text-[#0F6FFF] transition-all shadow-sm hover:shadow-md"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>More Filters</span>
                </motion.button>
              </div>
            </motion.div>

            {/* RIGHT SIDE - Hospital Image with Decorative Elements */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block h-[320px]"
            >
              {/* Hospital Building Image - Seamlessly Integrated */}
              <div className="relative h-full w-full">
                {/* Main Hospital Image */}
                <div className="absolute inset-0 flex items-center justify-end">
                  <img 
                    src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=800&fit=crop&auto=format&q=80"
                    alt="Modern Hospital Building"
                    className="h-full w-auto max-w-none object-cover rounded-3xl shadow-2xl"
                    style={{
                      maskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))',
                      WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,1) 60%, rgba(0,0,0,0))'
                    }}
                  />
                </div>

                {/* Floating Location Card - Top Right */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl px-5 py-4 shadow-xl border border-white/60"
                >
                  <p className="text-xs text-[#64748B] font-medium mb-1">Showing results near</p>
                  <p className="text-base font-bold text-[#0F172A] mb-1">Ahmedabad, Gujarat</p>
                  <p className="text-sm text-[#0F6FFF] font-semibold">433 healthcare facilities found</p>
                </motion.div>

                {/* Decorative Blue Location Pin */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.4, type: "spring" }}
                  className="absolute top-12 right-32"
                >
                  <div className="relative">
                    <svg className="w-10 h-10 drop-shadow-lg" viewBox="0 0 24 24" fill="#0F6FFF">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                </motion.div>

                {/* Decorative Clouds */}
                <div className="absolute top-8 right-48 w-16 h-10 opacity-30">
                  <svg viewBox="0 0 100 60" fill="none">
                    <ellipse cx="50" cy="30" rx="45" ry="25" fill="#BAE6FD"/>
                    <ellipse cx="30" cy="35" rx="30" ry="20" fill="#BFDBFE"/>
                    <ellipse cx="70" cy="35" rx="30" ry="20" fill="#BFDBFE"/>
                  </svg>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Subtle Background Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#F8FAFC] to-transparent pointer-events-none" />
      </section>

      <div className="pt-6 pb-8 px-4 lg:px-6">
        <div className="max-w-[1600px] mx-auto">

          {/* ── Main grid ── */}
          <div className="grid lg:grid-cols-[420px_1fr] gap-5">

            {/* Hospital list */}
            <div className="flex flex-col gap-4 max-h-[calc(100vh-320px)] overflow-y-auto pr-2 styled-scrollbar">
              
              {/* Recommended for You Header */}
              <div className="flex items-center gap-2 px-1">
                <Star className="w-5 h-5 text-[#0F6FFF]" />
                <h2 className="text-lg font-bold text-[#0F172A]">Recommended for You</h2>
              </div>

              {loading && hospitals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 gap-3 text-[#94A3B8]">
                  <Loader2 className="w-10 h-10 animate-spin text-[#0F6FFF]" />
                  <p className="text-sm font-medium">Finding best hospitals near you…</p>
                </div>
              )}

              {!loading && !userLocation && (
                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F8FAFC] flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-[#0F6FFF]" />
                  </div>
                  <div>
                    <p className="text-base font-semibold text-[#0F172A] mb-1">Enable Location Access</p>
                    <p className="text-sm text-[#64748B]">Allow us to find the best hospitals<br />near your location</p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={locate}
                    className="mt-2 px-6 py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg"
                  >
                    <Navigation className="w-4 h-4" /> Enable Location
                  </motion.button>
                </div>
              )}

              {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                  <button onClick={refetch} className="font-semibold hover:underline">Retry</button>
                </div>
              )}

              {sortedHospitals.map((h, i) => (
                <motion.div 
                  key={h.id}
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.03, 0.4) }}
                  onClick={() => handleSelect(h)}
                  className={`cursor-pointer rounded-2xl p-5 transition-all border bg-white hover:shadow-lg ${
                    selected?.id === h.id
                      ? 'border-[#0F6FFF] shadow-lg ring-2 ring-[#0F6FFF]/20'
                      : 'border-[#E2E8F0] hover:border-[#0F6FFF]/30'
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Hospital Image */}
                    <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0]">
                      <img 
                        src={getHospitalImage(i)}
                        alt={h.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-8 h-8 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>'
                        }}
                      />
                    </div>

                    {/* Hospital Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-[#0F172A] text-base leading-tight mb-1 flex items-center gap-2">
                            {h.name}
                            {h.emergency && (
                              <CheckCircle2 className="w-4 h-4 text-[#0F6FFF] flex-shrink-0" />
                            )}
                          </h3>
                          <p className="text-sm text-[#64748B] mb-1.5">
                            Multi Specialty Hospital
                          </p>
                        </div>
                      </div>

                      {/* Rating and Reviews */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                          <span className="text-sm font-semibold text-[#0F172A]">4.8</span>
                          <span className="text-xs text-[#94A3B8]">(235 reviews)</span>
                        </div>
                        <span className="text-[#E2E8F0]">·</span>
                        <span className="text-sm text-[#0F6FFF] font-medium flex items-center gap-1">
                          <Navigation className="w-3 h-3" />
                          {h.distanceStr}
                        </span>
                      </div>

                      {/* Specialties Tags */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {['Cardiology', 'Emergency', 'Neurology'].slice(0, 3).map((spec) => (
                          <span key={spec} className="px-2.5 py-1 bg-[#F8FAFC] text-[#64748B] rounded-md text-xs font-medium">
                            {spec}
                          </span>
                        ))}
                        {h.specialties.length > 3 && (
                          <span className="px-2.5 py-1 bg-[#F8FAFC] text-[#0F6FFF] rounded-md text-xs font-medium">
                            +{h.specialties.length - 3}
                          </span>
                        )}
                      </div>

                      {/* Status Row */}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="flex items-center gap-1.5 text-[#14C8A8] font-medium">
                          <div className="w-2 h-2 rounded-full bg-[#14C8A8]" />
                          Open 24/7
                        </span>
                        {h.emergency && (
                          <span className="flex items-center gap-1.5 text-red-500 font-medium">
                            <AlertCircle className="w-3.5 h-3.5" />
                            Emergency Care
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); h.phone && window.open(`tel:${h.phone}`) }}
                        className="p-2.5 bg-[#F8FAFC] hover:bg-[#0F6FFF] text-[#0F6FFF] hover:text-white rounded-xl transition-all"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => { e.stopPropagation(); handleSelect(h); handleGetDirections() }}
                        className="p-2.5 bg-[#F8FAFC] hover:bg-[#0F6FFF] text-[#0F6FFF] hover:text-white rounded-xl transition-all"
                        title="Directions"
                      >
                        <Navigation className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 bg-[#F8FAFC] hover:bg-[#0F6FFF] text-[#0F6FFF] hover:text-white rounded-xl transition-all"
                        title="Save"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {!loading && userLocation && sortedHospitals.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-[#94A3B8] text-sm">No hospitals found matching your criteria</p>
                  <button 
                    onClick={() => { setQuery(''); setFilter('All') }}
                    className="mt-3 text-[#0F6FFF] text-sm font-semibold hover:underline"
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {/* View All Hospitals Link */}
              {sortedHospitals.length > 0 && (
                <motion.button
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-center gap-2 py-3 text-[#0F6FFF] font-semibold text-sm hover:gap-3 transition-all"
                >
                  <span>View All Hospitals</span>
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
            </div>

            {/* Map + detail */}
            <div className="flex flex-col gap-4">

              {/* Map */}
              <div className="bg-white rounded-3xl overflow-hidden relative shadow-lg border border-[#E2E8F0]" style={{ height: selected ? 380 : 600 }}>
                {userLocation && (
                  <button 
                    onClick={recenterOnMe} 
                    title="Center on my location"
                    className="absolute top-4 right-4 z-[999] bg-white shadow-lg rounded-xl px-4 py-2.5 flex items-center gap-2 text-sm font-semibold text-[#0F6FFF] hover:shadow-xl transition-all border border-[#E2E8F0]"
                  >
                    <Navigation className="w-4 h-4" /> 
                    <span className="hidden sm:inline">My Location</span>
                  </button>
                )}
                
                {/* Search in this area button */}
                <button 
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[999] bg-white shadow-lg rounded-full px-5 py-2.5 flex items-center gap-2 text-sm font-semibold text-[#0F172A] hover:shadow-xl transition-all border border-[#E2E8F0]"
                >
                  <Search className="w-4 h-4 text-[#0F6FFF]" />
                  Search in this area
                </button>

                <Suspense fallback={
                  <div className="w-full h-full flex items-center justify-center gap-3 text-[#94A3B8] bg-[#F8FAFC]">
                    <Loader2 className="w-7 h-7 animate-spin text-[#0F6FFF]" />
                    <span className="text-sm font-medium">Loading map…</span>
                  </div>
                }>
                  <LeafletMap
                    center={mapCenter}
                    zoom={mapZoom}
                    userLocation={userLocation}
                    userAccuracy={accuracy}
                    hospitals={sortedHospitals}
                    selected={selected}
                    onSelect={handleSelect}
                    routeTo={routeTo}
                  />
                </Suspense>
              </div>

              {/* Route info */}
              <AnimatePresence>
                {showRoute && route && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-[#0F6FFF]/10 to-[#14C8A8]/10 border border-[#0F6FFF]/20 rounded-2xl"
                  >
                    <Route className="w-5 h-5 text-[#0F6FFF] flex-shrink-0" />
                    <div className="flex-1">
                      <span className="text-[#0F6FFF] font-bold text-base">{route.distance} km</span>
                      <span className="text-[#94A3B8] mx-2">·</span>
                      <span className="text-[#0F172A] font-medium">~{route.duration} min by car</span>
                    </div>
                    <button
                      onClick={() => navigate('/navigate', {
                        state: {
                          from:  userLocation,
                          to:    { ...selected, lat: selected.lat, lng: selected.lng },
                          route,
                        }
                      })}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                    >
                      <Navigation className="w-4 h-4" />
                      Navigate
                    </button>
                    <button 
                      onClick={() => setShowRoute(false)} 
                      className="text-[#94A3B8] hover:text-[#0F172A] transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}
                {showRoute && !route && userLocation && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl"
                  >
                    <Loader2 className="w-5 h-5 animate-spin text-[#0F6FFF]" />
                    <span className="text-sm text-[#64748B] font-medium">Calculating best route…</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hospital detail card - Popup style */}
              <AnimatePresence mode="wait">
                {selected && (
                  <motion.div 
                    key={selected.id}
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, y: 10 }}
                    className="bg-white rounded-3xl p-6 shadow-xl border border-[#E2E8F0]"
                  >
                    {/* Header with Image */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] flex-shrink-0">
                        <img 
                          src={getHospitalImage(sortedHospitals.findIndex(h => h.id === selected.id))}
                          alt={selected.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center"><svg class="w-10 h-10 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg></div>'
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h2 className="text-xl font-bold text-[#0F172A] leading-tight flex items-center gap-2">
                            {selected.name}
                            <CheckCircle2 className="w-5 h-5 text-[#0F6FFF] flex-shrink-0" />
                          </h2>
                          <button 
                            onClick={() => { setSelected(null); setShowRoute(false); recenterOnMe() }} 
                            className="text-[#94A3B8] hover:text-[#0F172A] transition-colors flex-shrink-0"
                          >
                            <X className="w-6 h-6" />
                          </button>
                        </div>
                        <p className="text-sm text-[#64748B] mb-2">Multi Specialty Hospital</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                            <span className="text-sm font-bold text-[#0F172A]">4.8</span>
                            <span className="text-xs text-[#94A3B8]">(235 reviews)</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#64748B] flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#0F6FFF]" /> 
                          {selected.address}
                        </p>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: 'Distance', value: selected.distanceStr, color: 'text-[#0F6FFF]', bg: 'bg-[#0F6FFF]/10' },
                        { label: 'Type', value: selected.type, color: 'text-[#14C8A8]', bg: 'bg-[#14C8A8]/10' },
                        { label: 'Emergency', value: selected.emergency ? '24/7' : 'No', color: selected.emergency ? 'text-red-500' : 'text-[#94A3B8]', bg: selected.emergency ? 'bg-red-50' : 'bg-[#F8FAFC]' },
                      ].map((s) => (
                        <div key={s.label} className={`${s.bg} rounded-xl p-3.5 text-center`}>
                          <p className={`text-base font-bold capitalize ${s.color} mb-0.5`}>{s.value}</p>
                          <p className="text-xs text-[#64748B] font-medium">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center gap-3 mb-5 flex-wrap">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#14C8A8]/10 rounded-xl">
                        <div className="w-2 h-2 rounded-full bg-[#14C8A8]" />
                        <span className="text-sm font-semibold text-[#14C8A8]">Open 24/7</span>
                      </div>
                      {selected.emergency && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-red-50 rounded-xl">
                          <AlertCircle className="w-4 h-4 text-red-500" />
                          <span className="text-sm font-semibold text-red-500">Emergency Care</span>
                        </div>
                      )}
                    </div>

                    {/* Details List */}
                    <div className="space-y-3 mb-5">
                      {selected.opening_hours && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center flex-shrink-0">
                            <Clock className="w-5 h-5 text-[#0F6FFF]" />
                          </div>
                          <span className="text-[#0F172A] font-medium">{selected.opening_hours}</span>
                        </div>
                      )}
                      {selected.phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] flex items-center justify-center flex-shrink-0">
                            <Phone className="w-5 h-5 text-[#0F6FFF]" />
                          </div>
                          <a href={`tel:${selected.phone}`} className="text-[#0F6FFF] font-medium hover:underline">
                            {selected.phone}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Specialties */}
                    {selected.specialties.length > 0 && (
                      <div className="mb-5">
                        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide mb-2.5">Specialties</p>
                        <div className="flex flex-wrap gap-2">
                          {selected.specialties.slice(0, 6).map((s) => (
                            <span key={s} className="px-3 py-1.5 bg-[#F8FAFC] text-[#0F172A] border border-[#E2E8F0] rounded-lg text-xs font-medium">
                              {s}
                            </span>
                          ))}
                          {selected.specialties.length > 6 && (
                            <span className="px-3 py-1.5 bg-[#0F6FFF]/10 text-[#0F6FFF] rounded-lg text-xs font-medium">
                              +{selected.specialties.length - 6} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGetDirections}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all"
                      >
                        <Navigation className="w-5 h-5" />
                        {showRoute ? 'View Route' : 'Get Directions'}
                      </motion.button>
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/hospitals/${selected.osmType}/${selected.osmId}`, { state: { hospital: selected } })}
                        className="px-6 py-3.5 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-xl font-bold text-sm hover:border-[#0F6FFF] hover:bg-[#F8FAFC] transition-all"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick Action Cards - Bottom Suggestions */}
              {!selected && userLocation && sortedHospitals.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-6 border border-[#E2E8F0]"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                      <svg className="w-5 h-5 text-[#0F6FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-base font-bold text-[#0F172A]">Let MedSense help you find the right care</h3>
                  </div>
                  <p className="text-sm text-[#64748B] mb-4">
                    Tell us your specialization need and we'll recommend the best hospitals for you.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {['I need emergency care', 'Cardiology near me', 'Pediatric care', '24/7 hospital'].map((suggestion) => (
                      <button 
                        key={suggestion}
                        className="px-4 py-2 bg-white hover:bg-[#0F6FFF] hover:text-white text-[#0F172A] rounded-xl text-xs font-semibold transition-all shadow-sm hover:shadow-md border border-[#E2E8F0]"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
