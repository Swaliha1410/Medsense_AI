/**
 * Navigate — full-screen turn-by-turn navigation page
 *
 * Route: /navigate
 * Receives via router state:
 *   { from: {lat,lng}, to: {lat,lng,name,address}, route: {…from useOSRMRoute} }
 *
 * Features:
 *  - Full-screen live map (Leaflet) with route polyline
 *  - Pulsing "You" marker that tracks your live position
 *  - Current step highlighted, auto-advances when you pass the next waypoint
 *  - Scrollable step list panel
 *  - Top HUD: next instruction + distance to it
 *  - Bottom bar: total remaining distance / time
 *  - "Re-route" if you leave the path
 *  - "End Navigation" button
 */

import React, { useState, useEffect, useRef, lazy, Suspense } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, ArrowRight, Navigation, MapPin, Clock,
  Route, ChevronUp, ChevronDown, CornerUpLeft, CornerUpRight,
  MoveRight, RotateCcw, Flag, Loader2, AlertCircle,
} from 'lucide-react'
import { useOSRMRoute } from '../hooks/useOSRMRoute'

const LeafletMap = lazy(() => import('../components/LeafletMap'))

// ── Maneuver icon mapping ─────────────────────────────────────────────────────
function ManeuverIcon({ maneuver, modifier, size = 20 }) {
  const cls = `w-${size === 20 ? 5 : 6} h-${size === 20 ? 5 : 6}`

  if (maneuver === 'arrive')  return <Flag       className={cls} />
  if (maneuver === 'depart')  return <Navigation className={cls} />
  if (maneuver === 'roundabout' || maneuver === 'rotary') return <RotateCcw className={cls} />

  if (modifier === 'left' || modifier === 'sharp left')    return <CornerUpLeft  className={cls} />
  if (modifier === 'right' || modifier === 'sharp right')  return <CornerUpRight className={cls} />
  if (modifier === 'slight left')  return <ArrowLeft  className={cls} />
  if (modifier === 'slight right') return <ArrowRight className={cls} />
  if (modifier === 'uturn')        return <RotateCcw  className={cls} />
  return <MoveRight className={cls} />
}

// Haversine distance in metres
function distanceBetween(a, b) {
  const R = 6371000
  const dLat = (b[0] - a[0]) * Math.PI / 180
  const dLng = (b[1] - a[1]) * Math.PI / 180
  const sin2 = Math.sin(dLat / 2) ** 2 +
    Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(sin2), Math.sqrt(1 - sin2))
}

function formatDist(m) {
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)} m`
}

function formatETA(minutes) {
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h}h ${m}m`
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function Navigate() {
  const { state }    = useLocation()
  const navReact     = useNavigate()

  // Expect state: { from, to, route (pre-fetched) }
  const destination  = state?.to     || null
  const initialRoute = state?.route  || null
  const initialFrom  = state?.from   || null

  // Live user position
  const [userPos,     setUserPos]     = useState(initialFrom)
  const [userAcc,     setUserAcc]     = useState(null)
  const [mapCenter,   setMapCenter]   = useState(
    initialFrom ? [initialFrom.lat, initialFrom.lng] : [20, 0]
  )
  const [mapZoom,     setMapZoom]     = useState(16)

  // Route state
  const [currentStep, setCurrentStep] = useState(0)
  const [showSteps,   setShowSteps]   = useState(false)
  const [rerouting,   setRerouting]   = useState(false)
  const [routeFrom,   setRouteFrom]   = useState(initialFrom)
  const [arrived,     setArrived]     = useState(false)

  // Re-route trigger — only fires when user goes off track
  const route = useOSRMRoute(routeFrom, destination)
  const steps = route?.steps || initialRoute?.steps || []
  const activeRoute = route || initialRoute

  const watchRef     = useRef(null)
  const stepsRef     = useRef(null)
  const lastReroute  = useRef(0)

  // ── Live GPS tracking ────────────────────────────────────────────────────
  useEffect(() => {
    if (!navigator.geolocation) return

    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        setUserPos(loc)
        setUserAcc(Math.round(pos.coords.accuracy))
        setMapCenter([loc.lat, loc.lng])

        // Auto-advance step when within 30m of next step's coords
        if (steps.length > 0 && currentStep < steps.length - 1) {
          const next = steps[currentStep + 1]
          if (next?.coords) {
            const d = distanceBetween([loc.lat, loc.lng], next.coords)
            if (d < 30) {
              setCurrentStep(s => {
                const ns = Math.min(s + 1, steps.length - 1)
                // scroll that step into view
                setTimeout(() => {
                  stepsRef.current
                    ?.children[ns]
                    ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                }, 100)
                return ns
              })
            }
          }
        }

        // Arrived check — within 40m of destination
        if (destination) {
          const d = distanceBetween([loc.lat, loc.lng], [destination.lat, destination.lng])
          if (d < 40) setArrived(true)
        }

        // Off-route check — re-route if >150m from route polyline & 10s cooldown
        if (activeRoute?.coords && Date.now() - lastReroute.current > 10000) {
          const onRoute = activeRoute.coords.some(c => distanceBetween([loc.lat, loc.lng], c) < 150)
          if (!onRoute) {
            lastReroute.current = Date.now()
            setRerouting(true)
            setRouteFrom({ lat: loc.lat, lng: loc.lng })
            setCurrentStep(0)
            setTimeout(() => setRerouting(false), 3000)
          }
        }
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 0, timeout: 8000 }
    )
    return () => {
      if (watchRef.current) navigator.geolocation.clearWatch(watchRef.current)
    }
  }, [steps, currentStep, destination, activeRoute])

  // ── Guard: no state ──────────────────────────────────────────────────────
  if (!destination) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-amber-400" />
        <p className="text-text/60 text-sm">No destination set. Go back to the hospital finder.</p>
        <button onClick={() => navReact('/hospitals')}
          className="px-6 py-3 bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] text-white rounded-xl font-semibold text-sm">
          Back to Hospital Finder
        </button>
      </div>
    )
  }

  const step       = steps[currentStep]
  const prevStep   = currentStep > 0 ? steps[currentStep - 1] : null
  const nextStep   = steps[currentStep + 1] || null
  const isLastStep = currentStep === steps.length - 1

  // Remaining distance from current step onwards
  const remainingM = steps.slice(currentStep).reduce((s, st) => s + (st.distanceM || 0), 0)

  // Remaining time (rough — sum durations from current step)
  const remainingS = steps.slice(currentStep).reduce((s, st) => s + (st.duration || 0), 0)

  // Route polyline for the map (only from current position onwards)
  const routePolyline = activeRoute
    ? { ...activeRoute, coords: activeRoute.coords }
    : null

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#0a0f1e]">

      {/* ── Top HUD — current instruction ───────────────────────────────── */}
      <div className="relative z-20 flex-shrink-0">
        <motion.div
          initial={{ y: -80 }} animate={{ y: 0 }}
          className="bg-gradient-to-r from-[#0F6FFF] to-[#14C8A8] px-5 pt-5 pb-4 shadow-2xl"
        >
          {/* Back button */}
          <button
            onClick={() => navReact(-1)}
            className="absolute top-4 left-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>

          {/* Rerouting banner */}
          <AnimatePresence>
            {rerouting && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-amber-500 flex items-center justify-center gap-2 text-white font-bold text-sm rounded-b-2xl">
                <RotateCcw className="w-4 h-4 animate-spin" /> Recalculating route…
              </motion.div>
            )}
          </AnimatePresence>

          {/* Arrived banner */}
          <AnimatePresence>
            {arrived && (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 bg-[#14C8A8] flex items-center justify-center gap-3 text-white font-bold text-lg rounded-b-2xl z-10">
                <Flag className="w-6 h-6" /> You have arrived!
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-4 pl-10">
            {/* Maneuver icon */}
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0">
              {step
                ? <ManeuverIcon maneuver={step.maneuver} modifier={step.modifier} size={24} />
                : <Navigation className="w-6 h-6 text-white" />
              }
            </div>

            {/* Instruction */}
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-lg leading-snug">
                {step?.instruction || 'Head to your destination'}
              </p>
              {step?.name && (
                <p className="text-white/70 text-sm truncate">{step.name}</p>
              )}
            </div>

            {/* Distance to next turn */}
            <div className="text-right flex-shrink-0">
              <p className="text-white font-bold text-xl">{step?.distance || '—'}</p>
              <p className="text-white/60 text-xs">to turn</p>
            </div>
          </div>

          {/* Next step preview */}
          {nextStep && !isLastStep && (
            <div className="flex items-center gap-2 mt-3 pl-10 border-t border-white/20 pt-2">
              <span className="text-white/50 text-xs">Then:</span>
              <ManeuverIcon maneuver={nextStep.maneuver} modifier={nextStep.modifier} size={16} />
              <span className="text-white/70 text-xs truncate flex-1">{nextStep.instruction}</span>
              <span className="text-white/50 text-xs">{nextStep.distance}</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Full-screen Map ──────────────────────────────────────────────── */}
      <div className="flex-1 relative">
        <Suspense fallback={
          <div className="w-full h-full bg-[#1a2035] flex items-center justify-center gap-2 text-white/40">
            <Loader2 className="w-6 h-6 animate-spin text-[#0F6FFF]" />
            <span className="text-sm">Loading map…</span>
          </div>
        }>
          <LeafletMap
            center={mapCenter}
            zoom={mapZoom}
            userLocation={userPos}
            userAccuracy={userAcc}
            hospitals={[destination]}
            selected={destination}
            routeTo={destination}
          />
        </Suspense>

        {/* Step counter badge */}
        {steps.length > 0 && (
          <div className="absolute top-3 left-3 z-[999] bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
            Step {currentStep + 1} / {steps.length}
          </div>
        )}

        {/* Manual prev/next step controls */}
        <div className="absolute bottom-28 right-3 z-[999] flex flex-col gap-2">
          <button
            onClick={() => setCurrentStep(s => Math.max(0, s - 1))}
            disabled={currentStep === 0}
            className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronUp className="w-5 h-5 text-text" />
          </button>
          <button
            onClick={() => setCurrentStep(s => Math.min(steps.length - 1, s + 1))}
            disabled={currentStep >= steps.length - 1}
            className="w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-gray-50 transition-colors"
          >
            <ChevronDown className="w-5 h-5 text-text" />
          </button>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: 120 }} animate={{ y: 0 }}
        className="relative z-20 flex-shrink-0 bg-white shadow-2xl rounded-t-3xl"
      >
        {/* Pull handle */}
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full flex flex-col items-center pt-2 pb-1"
        >
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </button>

        {/* Summary row */}
        <div className="flex items-center gap-4 px-5 py-3">
          <div className="flex-1">
            <p className="font-bold text-text text-base truncate">{destination.name}</p>
            <p className="text-text/50 text-xs truncate">{destination.address}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-[#0F6FFF] text-lg">{formatDist(remainingM)}</p>
            <p className="text-text/50 text-xs">{formatETA(Math.round(remainingS / 60))} remaining</p>
          </div>
          <button
            onClick={() => setShowSteps(!showSteps)}
            className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${
              showSteps ? 'bg-[#0F6FFF]/10 text-[#0F6FFF]' : 'bg-gray-100 text-text/60'
            }`}
          >
            <Route className="w-4 h-4" />
            {showSteps ? 'Hide' : 'Steps'}
          </button>
          <button
            onClick={() => navReact(-1)}
            className="px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            End
          </button>
        </div>

        {/* ── Expandable step-by-step directions panel ── */}
        <AnimatePresence>
          {showSteps && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-gray-100"
            >
              <div
                ref={stepsRef}
                className="max-h-72 overflow-y-auto px-4 py-3 space-y-1"
              >
                {steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setCurrentStep(i)
                      if (s.coords) {
                        setMapCenter(s.coords)
                        setMapZoom(16)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-left transition-all ${
                      i === currentStep
                        ? 'bg-gradient-to-r from-[#0F6FFF]/10 to-[#14C8A8]/10 border border-[#0F6FFF]/20'
                        : i < currentStep
                        ? 'opacity-40'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Step number / checkmark */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i < currentStep
                        ? 'bg-[#14C8A8]/20 text-[#14C8A8]'
                        : i === currentStep
                        ? 'bg-gradient-to-br from-[#0F6FFF] to-[#14C8A8] text-white'
                        : 'bg-gray-100 text-text/40'
                    }`}>
                      {i < currentStep ? '✓' : i + 1}
                    </div>

                    {/* Icon */}
                    <div className={`flex-shrink-0 ${i === currentStep ? 'text-[#0F6FFF]' : 'text-text/40'}`}>
                      <ManeuverIcon maneuver={s.maneuver} modifier={s.modifier} size={16} />
                    </div>

                    {/* Instruction */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium leading-snug ${i === currentStep ? 'text-text' : 'text-text/70'}`}>
                        {s.instruction}
                      </p>
                      {s.name && s.name !== s.instruction && (
                        <p className="text-xs text-text/40 truncate">{s.name}</p>
                      )}
                    </div>

                    {/* Distance */}
                    <span className={`text-xs font-semibold flex-shrink-0 ${i === currentStep ? 'text-[#0F6FFF]' : 'text-text/40'}`}>
                      {s.distance}
                    </span>
                  </button>
                ))}

                {/* Destination row */}
                <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-red-50 border border-red-100">
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <Flag className="w-3.5 h-3.5 text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-red-600 truncate">{destination.name}</p>
                    <p className="text-xs text-red-400 truncate">{destination.address}</p>
                  </div>
                  <span className="text-xs font-semibold text-red-400">{activeRoute?.distance} km</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
