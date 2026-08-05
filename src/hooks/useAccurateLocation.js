/**
 * useAccurateLocation
 *
 * Uses watchPosition instead of getCurrentPosition to continuously refine
 * the GPS fix. Keeps updating until accuracy drops below `targetAccuracy`
 * metres (default 50 m), then stops watching but stays ready to re-watch.
 *
 * Returns:
 *  {
 *    location:  { lat, lng } | null
 *    accuracy:  number | null   — metres
 *    status:    'idle' | 'locating' | 'refining' | 'ready' | 'error'
 *    errorMsg:  string
 *    locate:    () => void      — (re)start watching
 *    stop:      () => void      — stop watching
 *  }
 */

import { useState, useEffect, useRef, useCallback } from 'react'

const TARGET_ACCURACY = 50   // stop refining once within 50 m
const MAX_WAIT_MS     = 20000 // give up refining after 20 s

export function useAccurateLocation() {
  const [location,  setLocation]  = useState(null)
  const [accuracy,  setAccuracy]  = useState(null)
  const [status,    setStatus]    = useState('idle')   // idle | locating | refining | ready | error
  const [errorMsg,  setErrorMsg]  = useState('')

  const watchIdRef  = useRef(null)
  const timerRef    = useRef(null)
  const bestRef     = useRef(null)  // best fix seen so far

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error')
      setErrorMsg('Geolocation is not supported by your browser.')
      return
    }

    stop()
    bestRef.current = null
    setStatus('locating')
    setErrorMsg('')

    // ── Phase 1: fast coarse fix (maximumAge allowed) ─────────────────────
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }
        bestRef.current = { loc, accuracy: pos.coords.accuracy }
        setLocation(loc)
        setAccuracy(Math.round(pos.coords.accuracy))
        setStatus('refining')

        // ── Phase 2: watchPosition for high-accuracy refinement ───────────
        watchIdRef.current = navigator.geolocation.watchPosition(
          (p) => {
            const newAcc = p.coords.accuracy
            const newLoc = { lat: p.coords.latitude, lng: p.coords.longitude }

            // Only update if this fix is better
            if (!bestRef.current || newAcc < bestRef.current.accuracy) {
              bestRef.current = { loc: newLoc, accuracy: newAcc }
              setLocation(newLoc)
              setAccuracy(Math.round(newAcc))

              if (newAcc <= TARGET_ACCURACY) {
                // Good enough — stop watching
                stop()
                setStatus('ready')
              }
            }
          },
          (err) => {
            // Watch failed — use whatever coarse fix we have
            stop()
            if (bestRef.current) {
              setStatus('ready')
            } else {
              setStatus('error')
              setErrorMsg(geoErrorMsg(err))
            }
          },
          {
            enableHighAccuracy: true,
            maximumAge:         0,
            timeout:            10000,
          }
        )

        // ── Safety timer: stop refining after MAX_WAIT_MS ─────────────────
        timerRef.current = setTimeout(() => {
          stop()
          setStatus('ready')
        }, MAX_WAIT_MS)
      },
      (err) => {
        setStatus('error')
        setErrorMsg(geoErrorMsg(err))
      },
      {
        enableHighAccuracy: false,   // fast coarse fix first
        maximumAge:         10000,   // accept cached up to 10 s old
        timeout:            8000,
      }
    )
  }, [stop])

  // Auto-start on mount
  useEffect(() => {
    locate()
    return () => stop()
  }, [])

  return { location, accuracy, status, errorMsg, locate, stop }
}

function geoErrorMsg(err) {
  switch (err.code) {
    case 1: return 'Location access denied. Please allow location permission and try again.'
    case 2: return 'Location unavailable. Check your GPS or network signal.'
    case 3: return 'Location request timed out. Move to an open area and retry.'
    default: return 'Could not get your location.'
  }
}
