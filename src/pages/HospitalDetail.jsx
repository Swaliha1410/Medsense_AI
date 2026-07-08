/**
 * HospitalDetail — shows full detail for an OSM hospital.
 *
 * Route: /hospitals/:osmType/:osmId
 * (e.g. /hospitals/node/12345678)
 *
 * Also supports legacy numeric IDs from the old static list via /hospitals/:id
 * for backwards compatibility.
 *
 * Data is re-fetched from Overpass API using the OSM node/way ID.
 */

import React, { useState, useEffect, lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import {
  MapPin, Phone, Star, Clock, Navigation, ArrowLeft,
  CheckCircle, Ambulance, Building2, Globe, ExternalLink,
  Loader2, Route, AlertCircle, X,
} from 'lucide-react'
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useOSRMRoute } from '../hooks/useOSRMRoute'

const LeafletMap = lazy(() => import('../components/LeafletMap'))
// ── Fetch single element from Overpass ───────────────────────────────────────
async function fetchOsmElement(osmType, osmId) {
  const query = `
    [out:json][timeout:15];
    ${osmType}(${osmId});
    out center tags;
  `
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(query),
  })
  if (!res.ok) throw new Error('Overpass error')
  const data = await res.json()
  const el   = data.elements?.[0]
  if (!el) throw new Error('Not found')

  const tags    = el.tags || {}
  const lat     = el.lat ?? el.center?.lat
  const lng     = el.lon ?? el.center?.lon
  const city    = tags['addr:city']        || ''
  const street  = tags['addr:street']      || ''
  const housen  = tags['addr:housenumber'] || ''
  const address = [housen, street, city].filter(Boolean).join(', ') || 'Address not available'

  return {
    id:         `osm-${el.type}-${el.id}`,
    osmId:      el.id,
    osmType:    el.type,
    name:       tags.name || tags['name:en'] || 'Unnamed Facility',
    address,
    lat, lng,
    phone:      tags.phone            || tags['contact:phone']   || '',
    website:    tags.website          || tags['contact:website'] || '',
    email:      tags.email            || tags['contact:email']   || '',
    emergency:  tags.emergency === 'yes' || tags.amenity === 'hospital',
    amenity:    tags.amenity          || '',
    opening_hours: tags.opening_hours || '',
    operator:   tags.operator         || '',
    beds:       tags.beds             || tags['capacity:beds']   || null,
    wheelchair: tags.wheelchair       || '',
    specialties: tags.speciality
      ? tags.speciality.split(';').map((s) => s.trim())
      : [],
    description: tags.description || '',
    wikidata:   tags.wikidata || '',
    wikipedia:  tags.wikipedia || '',
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function HospitalDetail() {
  const { osmType, osmId, id } = useParams()
  const locationState = useLocation().state   // hospital passed via navigate state
  const navReact = useNavigate()

  const [hospital,  setHospital]  = useState(locationState?.hospital || null)
  const [loading,   setLoading]   = useState(!locationState?.hospital)
  const [error,     setError]     = useState(null)
  const [userLoc,   setUserLoc]   = useState(null)
  const [showRoute, setShowRoute] = useState(false)

  // Route
  const routeTo   = showRoute && hospital ? { lat: hospital.lat, lng: hospital.lng } : null
  const route     = useOSRMRoute(userLoc, routeTo)

  // Get user location silently
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setUserLoc({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => {}
    )
  }, [])

  // Fetch from Overpass if not passed via state
  useEffect(() => {
    if (hospital) return
    const type = osmType || 'node'
    const eid  = osmId || id
    if (!eid) { setError('Invalid hospital ID'); setLoading(false); return }

    setLoading(true)
    fetchOsmElement(type, eid)
      .then(setHospital)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [osmType, osmId, id])

  const openExternalNav = () => {
    if (!hospital) return
    window.open(
      `https://www.openstreetmap.org/directions?to=${hospital.lat},${hospital.lng}`,
      '_blank', 'noreferrer'
    )
  }

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-screen gap-3 text-text/40">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F6FFF]" />
          <span>Loading hospital info…</span>
        </div>
      </div>
    )
  }

  // ── Error ──
  if (error || !hospital) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-text/40">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <h2 className="text-xl font-bold">{error || 'Hospital not found'}</h2>
          <Link to="/hospitals" className="text-[#0F6FFF] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Hospital Finder
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">

        {/* Back */}
        <Link to="/hospitals" className="inline-flex items-center gap-2 text-sm text-text/50 hover:text-[#0F6FFF] mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Hospital Finder
        </Link>

        {/* Hero Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glassmorphism rounded-3xl p-8 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="min-w-0">
              <div className="flex items-start gap-4 mb-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-3xl font-bold text-text leading-tight">{hospital.name}</h1>
                  <p className="text-text/60 flex items-center gap-1 text-sm mt-1">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span>{hospital.address}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {hospital.specialties.map((s) => (
                  <span key={s} className="px-3 py-1 bg-[#0F6FFF]/10 text-[#0F6FFF] rounded-full text-xs font-medium">{s}</span>
                ))}
                {hospital.emergency && (
                  <span className="px-3 py-1 bg-red-100 text-red-500 rounded-full text-xs font-medium flex items-center gap-1">
                    <Ambulance className="w-3 h-3" /> 24/7 Emergency
                  </span>
                )}
                {hospital.amenity && (
                  <span className="px-3 py-1 bg-gray-100 text-text/60 rounded-full text-xs capitalize">{hospital.amenity}</span>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => { setShowRoute(!showRoute) }}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all ${
                  showRoute
                    ? 'bg-[#0F6FFF] text-white'
                    : 'bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white'
                }`}
              >
                <Route className="w-4 h-4" />
                {showRoute ? 'Hide Route' : 'Get Directions'}
              </button>
              <button
                onClick={openExternalNav}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-text rounded-xl font-semibold text-sm hover:shadow-md transition-shadow"
              >
                <Navigation className="w-4 h-4 text-[#0F6FFF]" /> Open Maps
              </button>
              {hospital.phone && (
                <a href={`tel:${hospital.phone}`} className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-text rounded-xl font-semibold text-sm hover:shadow-md transition-shadow">
                  <Phone className="w-4 h-4 text-[#0F6FFF]" /> Call
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Type',      value: hospital.amenity || 'Hospital', color: 'text-[#0F6FFF]' },
              { label: 'Emergency', value: hospital.emergency ? '24/7' : 'No', color: hospital.emergency ? 'text-red-500' : 'text-text/40' },
              { label: 'Beds',      value: hospital.beds || '—', color: 'text-purple-500' },
              { label: 'Wheelchair', value: hospital.wheelchair || '—', color: 'text-[#14C8A8]' },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-2xl p-4 text-center">
                <p className={`text-lg font-bold capitalize ${s.color}`}>{s.value}</p>
                <p className="text-xs text-text/50">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glassmorphism rounded-3xl overflow-hidden mb-6" style={{ height: 360 }}>
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center gap-2 text-text/40">
              <Loader2 className="w-6 h-6 animate-spin text-[#0F6FFF]" />
              <span className="text-sm">Loading map…</span>
            </div>
          }>
            <LeafletMap
              center={[hospital.lat, hospital.lng]}
              zoom={15}
              userLocation={userLoc}
              hospitals={[hospital]}
              selected={hospital}
              routeTo={routeTo}
            />
          </Suspense>
        </motion.div>

        {/* Route info */}
        {showRoute && route && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex items-center gap-3 px-5 py-3 bg-[#0F6FFF]/10 border border-[#0F6FFF]/20 rounded-2xl text-sm mb-6">
            <Route className="w-4 h-4 text-[#0F6FFF]" />
            <div className="flex-1">
              <span className="text-[#0F6FFF] font-semibold">{route.distance} km</span>
              <span className="text-text/50 mx-2">·</span>
              <span className="text-text/70">~{route.duration} min by car</span>
            </div>
            {/* Full navigation page */}
            <button
              onClick={() => navReact('/navigate', {
                state: {
                  from:  userLoc,
                  to:    { ...hospital, lat: hospital.lat, lng: hospital.lng },
                  route,
                }
              })}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl text-xs font-bold shadow hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Navigation className="w-3.5 h-3.5" />
              Navigate
            </button>
          </motion.div>
        )}
        {showRoute && !route && !userLoc && (
          <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-700 mb-6 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Allow location access to calculate the route.
          </div>
        )}

        {/* Info grid */}
        <div className="grid md:grid-cols-2 gap-6">

          {/* About */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="glassmorphism rounded-3xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">Information</h2>
            {hospital.description && (
              <p className="text-text/60 leading-relaxed text-sm mb-4">{hospital.description}</p>
            )}
            <div className="space-y-3 text-sm">
              {hospital.opening_hours && (
                <div className="flex items-start gap-3 text-text/70">
                  <Clock className="w-4 h-4 text-[#0F6FFF] mt-0.5" />
                  <span>{hospital.opening_hours}</span>
                </div>
              )}
              {hospital.phone && (
                <div className="flex items-center gap-3 text-text/70">
                  <Phone className="w-4 h-4 text-[#0F6FFF]" />
                  <a href={`tel:${hospital.phone}`} className="hover:text-[#0F6FFF] transition-colors">{hospital.phone}</a>
                </div>
              )}
              {hospital.email && (
                <div className="flex items-center gap-3 text-text/70">
                  <Globe className="w-4 h-4 text-[#0F6FFF]" />
                  <a href={`mailto:${hospital.email}`} className="hover:text-[#0F6FFF] transition-colors">{hospital.email}</a>
                </div>
              )}
              {hospital.website && (
                <div className="flex items-center gap-3 text-text/70">
                  <ExternalLink className="w-4 h-4 text-[#0F6FFF]" />
                  <a href={hospital.website} target="_blank" rel="noreferrer" className="hover:text-[#0F6FFF] transition-colors truncate">
                    {hospital.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              {hospital.operator && (
                <div className="flex items-center gap-3 text-text/70">
                  <Building2 className="w-4 h-4 text-[#0F6FFF]" />
                  <span>{hospital.operator}</span>
                </div>
              )}
              {hospital.wheelchair && (
                <div className="flex items-center gap-3 text-text/70">
                  <CheckCircle className="w-4 h-4 text-[#14C8A8]" />
                  <span>Wheelchair access: {hospital.wheelchair}</span>
                </div>
              )}
            </div>
          </motion.div>

          {/* Navigation options */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="glassmorphism rounded-3xl p-6">
            <h2 className="text-xl font-bold text-text mb-4">Get There</h2>
            <div className="space-y-3">

              {/* OSRM in-app */}
              <button
                onClick={() => setShowRoute(!showRoute)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#0F6FFF]/10 to-[#14C8A8]/10 border border-[#0F6FFF]/20 rounded-xl hover:from-[#0F6FFF]/20 hover:to-[#14C8A8]/20 transition-all group"
              >
                <Route className="w-5 h-5 text-[#0F6FFF]" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-text">In-App Navigation</p>
                  <p className="text-xs text-text/50">Driving route via OSRM (free)</p>
                </div>
              </button>

              {/* OpenStreetMap */}
              <button
                onClick={openExternalNav}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow group"
              >
                <div className="w-8 h-8 rounded-lg bg-[#7EBC6F]/20 flex items-center justify-center">
                  <span className="text-base">🗺️</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-text">OpenStreetMap</p>
                  <p className="text-xs text-text/50">Free navigation, no account needed</p>
                </div>
                <ExternalLink className="w-4 h-4 text-text/30 ml-auto" />
              </button>

              {/* Google Maps */}
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${hospital.lat},${hospital.lng}&destination_place_id=${encodeURIComponent(hospital.name)}`}
                target="_blank" rel="noreferrer"
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <span className="text-base">🔵</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-text">Google Maps</p>
                  <p className="text-xs text-text/50">Step-by-step directions</p>
                </div>
                <ExternalLink className="w-4 h-4 text-text/30 ml-auto" />
              </a>

              {/* Apple Maps (iOS/macOS) */}
              <a
                href={`maps://maps.apple.com/?daddr=${hospital.lat},${hospital.lng}`}
                className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:shadow-md transition-shadow"
              >
                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center">
                  <span className="text-base">🍎</span>
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-text">Apple Maps</p>
                  <p className="text-xs text-text/50">For iPhone / Mac users</p>
                </div>
              </a>
            </div>

            {/* Coordinates */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-text/40 font-mono">
                {hospital.lat.toFixed(6)}, {hospital.lng.toFixed(6)}
              </p>
              <a
                href={`https://www.openstreetmap.org/${hospital.osmType}/${hospital.osmId}`}
                target="_blank" rel="noreferrer"
                className="text-xs text-text/30 hover:text-[#0F6FFF] transition-colors flex items-center gap-1 mt-1"
              >
                <ExternalLink className="w-3 h-3" /> View on OpenStreetMap
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
