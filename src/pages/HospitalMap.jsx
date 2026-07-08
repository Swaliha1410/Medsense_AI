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
      await hospitalSearches.save({ query: q, latitude: userLocation?.lat, longitude: userLocation?.lng, results_count: filtered.length })
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

  const accInfo  = accuracyLabel(accuracy)
  const locating = locStatus === 'locating'
  const refining = locStatus === 'refining'

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-8 px-6 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <h1 className="text-4xl font-bold text-text mb-1">
            Hospital <span className="text-gradient">Finder</span>
          </h1>
          <p className="text-text/60 text-sm">Real hospitals near you · OpenStreetMap · OSRM routing</p>
        </motion.div>

        {/* ── Location status bar ────────────────────────────────────────────── */}
        <div className="mb-5 space-y-2">
          {locStatus === 'error' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="flex-1">{locationError}</span>
              <button onClick={locate} className="flex items-center gap-1 font-semibold hover:underline whitespace-nowrap">
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </motion.div>
          )}

          {locating && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-2xl text-sm text-blue-700">
              <Loader2 className="w-5 h-5 animate-spin flex-shrink-0" />
              <span>Acquiring your GPS location…</span>
            </motion.div>
          )}

          {refining && userLocation && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700">
              <Loader2 className="w-4 h-4 animate-spin flex-shrink-0 text-amber-500" />
              <span className="flex-1">
                Improving accuracy — currently{' '}
                <strong>±{accuracy} m</strong>
                {accInfo && (
                  <span className="ml-1.5 font-semibold" style={{ color: accInfo.color }}>
                    ({accInfo.text})
                  </span>
                )}
              </span>
              <span className="text-xs font-mono text-amber-500 hidden sm:block">
                {userLocation.lat.toFixed(5)}, {userLocation.lng.toFixed(5)}
              </span>
            </motion.div>
          )}

          {locStatus === 'ready' && userLocation && (
            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 px-4 py-3 bg-[#14C8A8]/10 border border-[#14C8A8]/30 rounded-2xl text-sm">
              <CheckCircle2 className="w-5 h-5 text-[#14C8A8] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-[#14C8A8] font-semibold">Location ready</span>
                <span className="text-text/40 mx-2">·</span>
                <span className="font-mono text-xs text-text/50">
                  {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                </span>
                {accuracy && (
                  <>
                    <span className="text-text/30 mx-2">·</span>
                    <span className="text-xs font-semibold" style={{ color: accInfo?.color }}>
                      ±{accuracy} m — {accInfo?.text}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={recenterOnMe} title="Re-centre map"
                  className="p-1.5 text-[#14C8A8]/60 hover:text-[#14C8A8] hover:bg-[#14C8A8]/10 rounded-lg transition-colors">
                  <Navigation className="w-4 h-4" />
                </button>
                <button onClick={locate} title="Refresh location"
                  className="p-1.5 text-[#14C8A8]/60 hover:text-[#14C8A8] hover:bg-[#14C8A8]/10 rounded-lg transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Controls ─────────────────────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-3 mb-4">

          {/* Search */}
          <div className="flex-1 min-w-56 flex items-center gap-2 bg-white rounded-2xl shadow-sm px-4 py-3">
            <Search className="w-4 h-4 text-text/40 flex-shrink-0" />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && saveSearch(query)}
              placeholder="Search hospitals, clinics, specialties…"
              className="flex-1 text-sm outline-none text-text bg-transparent" />
            {query && <button onClick={() => setQuery('')} className="text-text/30 hover:text-text/60"><X className="w-4 h-4" /></button>}
          </div>

          {/* Radius */}
          <select value={radius} onChange={(e) => { setRadius(Number(e.target.value)); setSelected(null) }}
            className="px-4 py-3 bg-white rounded-2xl shadow-sm text-sm text-text outline-none border-0 cursor-pointer">
            {RADII.map((r) => <option key={r.value} value={r.value}>{r.label} radius</option>)}
          </select>

          {/* Location button */}
          <button onClick={locate} disabled={locating || refining}
            className={`flex items-center gap-2 px-4 py-3 rounded-2xl shadow-sm text-sm font-medium transition-all disabled:opacity-60 ${
              locStatus === 'ready' ? 'bg-[#14C8A8]/10 text-[#14C8A8] border border-[#14C8A8]/30 hover:bg-[#14C8A8]/20'
              : locating || refining ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-white text-text/70 hover:text-[#0F6FFF]'
            }`}>
            {locating || refining
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Navigation className="w-4 h-4" />}
            {locating ? 'Locating…' : refining ? `Refining ±${accuracy}m…` : locStatus === 'ready' ? '📍 Located' : 'Use my location'}
          </button>

          {/* Refresh hospitals */}
          {userLocation && (
            <button onClick={refetch} disabled={loading}
              className="flex items-center gap-2 px-4 py-3 bg-white rounded-2xl shadow-sm text-sm text-text/70 hover:text-[#0F6FFF] disabled:opacity-50 transition-colors">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          )}
        </motion.div>

        {/* Filter pills */}
        <div className="flex gap-2 mb-5 flex-wrap items-center">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === f ? 'bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white shadow' : 'bg-white text-text/60 hover:text-[#0F6FFF] shadow-sm'
              }`}>{f}</button>
          ))}
          <span className="ml-auto text-xs text-text/40">
            {loading ? 'Searching…' : `${filtered.length} result${filtered.length !== 1 ? 's' : ''}`}
          </span>
        </div>

        {/* ── Main grid ── */}
        <div className="grid lg:grid-cols-5 gap-5">

          {/* Hospital list */}
          <div className="lg:col-span-2 flex flex-col gap-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
            {loading && hospitals.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-text/40">
                <Loader2 className="w-8 h-8 animate-spin text-[#0F6FFF]" />
                <p className="text-sm">Fetching nearby hospitals…</p>
              </div>
            )}

            {!loading && !userLocation && (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-text/40">
                <MapPin className="w-12 h-12 opacity-20" />
                <p className="text-sm text-center font-medium">Share your location to<br />find hospitals near you</p>
                <button onClick={locate}
                  className="mt-1 px-5 py-2.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl text-sm font-semibold flex items-center gap-2">
                  <Navigation className="w-4 h-4" /> Enable Location
                </button>
              </div>
            )}

            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-600 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
                <button onClick={refetch} className="ml-auto font-semibold hover:underline">Retry</button>
              </div>
            )}

            {filtered.map((h, i) => (
              <motion.div key={h.id}
                initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.5) }}
                onClick={() => handleSelect(h)}
                className={`cursor-pointer rounded-2xl p-4 transition-all border ${
                  selected?.id === h.id
                    ? 'bg-gradient-to-br from-[#0F6FFF]/10 to-[#14C8A8]/10 border-[#0F6FFF]/30 shadow-md'
                    : 'bg-white border-transparent shadow-sm hover:shadow-md hover:border-[#0F6FFF]/10'
                }`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-text text-sm leading-snug">{h.name}</h3>
                    <p className="text-xs text-text/50 flex items-start gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span className="truncate">{h.address}</span>
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    {h.emergency && <span className="text-xs px-2 py-0.5 bg-red-100 text-red-500 rounded-full font-medium">🚨 Emergency</span>}
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-text/50 rounded-full capitalize">{h.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-text/50">
                  <span className="flex items-center gap-1 font-medium text-[#0F6FFF]">
                    <Navigation className="w-3 h-3" />{h.distanceStr}
                  </span>
                  {h.opening_hours && (
                    <span className="flex items-center gap-1 truncate">
                      <Clock className="w-3 h-3" />
                      {h.opening_hours.length > 16 ? h.opening_hours.slice(0, 16) + '…' : h.opening_hours}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}

            {!loading && userLocation && filtered.length === 0 && hospitals.length > 0 && (
              <p className="text-center py-8 text-text/40 text-sm">No results match — try "All".</p>
            )}
          </div>

          {/* Map + detail */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {/* Map */}
            <div className="glassmorphism rounded-3xl overflow-hidden relative" style={{ height: selected ? 300 : 500 }}>
              {userLocation && (
                <button onClick={recenterOnMe} title="Centre on my location"
                  className="absolute top-3 right-3 z-[999] bg-white shadow-md rounded-xl px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-[#0F6FFF] hover:shadow-lg transition-shadow">
                  <Navigation className="w-3.5 h-3.5" /> My Location
                </button>
              )}
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center gap-2 text-text/40">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0F6FFF]" /><span className="text-sm">Loading map…</span>
                </div>
              }>
                <LeafletMap
                  center={mapCenter}
                  zoom={mapZoom}
                  userLocation={userLocation}
                  userAccuracy={accuracy}
                  hospitals={filtered}
                  selected={selected}
                  onSelect={handleSelect}
                  routeTo={routeTo}
                />
              </Suspense>
            </div>

            {/* Route info */}
            <AnimatePresence>
              {showRoute && route && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-3 px-4 py-3 bg-[#0F6FFF]/10 border border-[#0F6FFF]/20 rounded-2xl text-sm">
                  <Route className="w-4 h-4 text-[#0F6FFF] flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-[#0F6FFF] font-semibold">{route.distance} km</span>
                    <span className="text-text/50 mx-2">·</span>
                    <span className="text-text/70">~{route.duration} min by car</span>
                  </div>
                  {/* ── Navigate button — opens the full navigation page ── */}
                  <button
                    onClick={() => navigate('/navigate', {
                      state: {
                        from:  userLocation,
                        to:    { ...selected, lat: selected.lat, lng: selected.lng },
                        route,
                      }
                    })}
                    className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl text-xs font-bold shadow hover:opacity-90 transition-opacity whitespace-nowrap"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    Navigate
                  </button>
                  <button onClick={() => setShowRoute(false)} className="text-text/40 hover:text-text ml-1">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              )}
              {showRoute && !route && userLocation && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-text/50">
                  <Loader2 className="w-4 h-4 animate-spin text-[#0F6FFF]" />Calculating route…
                </motion.div>
              )}
            </AnimatePresence>

            {/* Hospital detail card */}
            <AnimatePresence mode="wait">
              {selected && (
                <motion.div key={selected.id}
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                  className="glassmorphism rounded-3xl p-6">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="min-w-0">
                      <h2 className="text-xl font-bold text-text leading-tight">{selected.name}</h2>
                      <p className="text-text/60 text-xs flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3" /> {selected.address}
                      </p>
                    </div>
                    <button onClick={() => { setSelected(null); setShowRoute(false); recenterOnMe() }} className="text-text/30 hover:text-text flex-shrink-0">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Distance', value: selected.distanceStr, color: 'text-[#0F6FFF]' },
                      { label: 'Type',     value: selected.type,        color: 'text-[#14C8A8]' },
                      { label: 'Emergency',value: selected.emergency ? '24/7' : 'No', color: selected.emergency ? 'text-red-500' : 'text-text/30' },
                    ].map((s) => (
                      <div key={s.label} className="bg-white rounded-xl p-3 text-center">
                        <p className={`text-base font-bold capitalize ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-text/50">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    {selected.opening_hours && <div className="flex items-center gap-2 text-text/60"><Clock className="w-4 h-4 text-[#0F6FFF] flex-shrink-0" /><span>{selected.opening_hours}</span></div>}
                    {selected.phone && <div className="flex items-center gap-2 text-text/60"><Phone className="w-4 h-4 text-[#0F6FFF] flex-shrink-0" /><a href={`tel:${selected.phone}`} className="hover:text-[#0F6FFF]">{selected.phone}</a></div>}
                    {selected.website && <div className="flex items-center gap-2 text-text/60"><Globe className="w-4 h-4 text-[#0F6FFF] flex-shrink-0" /><a href={selected.website} target="_blank" rel="noreferrer" className="hover:text-[#0F6FFF] truncate">{selected.website.replace(/^https?:\/\//, '')}</a></div>}
                    {selected.operator && <div className="flex items-center gap-2 text-text/60"><Star className="w-4 h-4 text-[#0F6FFF] flex-shrink-0" /><span>Operated by {selected.operator}</span></div>}
                  </div>

                  {selected.specialties.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5">
                      {selected.specialties.map((s) => (
                        <span key={s} className="px-2.5 py-1 bg-[#0F6FFF]/10 text-[#0F6FFF] rounded-full text-xs font-medium">{s}</span>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <button onClick={handleGetDirections}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all ${showRoute ? 'bg-[#0F6FFF] text-white' : 'bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white'}`}>
                      <Route className="w-4 h-4" />{showRoute ? 'Routing…' : 'Get Directions'}
                    </button>
                    <button onClick={() => navigate(`/hospitals/${selected.osmType}/${selected.osmId}`, { state: { hospital: selected } })}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white border border-gray-200 text-text rounded-xl font-semibold text-sm hover:shadow-md transition-shadow">
                      <ChevronRight className="w-4 h-4 text-[#0F6FFF]" />View Details
                    </button>
                    <button onClick={() => openOSMNav(selected)} title="Open in OpenStreetMap"
                      className="flex items-center justify-center px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <Navigation className="w-4 h-4 text-[#0F6FFF]" />
                    </button>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
                      target="_blank" rel="noreferrer" title="Google Maps"
                      className="flex items-center justify-center px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                      <ExternalLink className="w-4 h-4 text-[#0F6FFF]" />
                    </a>
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} title="Call"
                        className="flex items-center justify-center px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                        <Phone className="w-4 h-4 text-[#0F6FFF]" />
                      </a>
                    )}
                  </div>

                  <a href={`https://www.openstreetmap.org/${selected.osmType}/${selected.osmId}`}
                    target="_blank" rel="noreferrer"
                    className="mt-3 flex items-center gap-1 text-xs text-text/30 hover:text-[#0F6FFF] transition-colors">
                    <ExternalLink className="w-3 h-3" /> View on OpenStreetMap
                  </a>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
