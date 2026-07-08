/**
 * useNearbyHospitals
 *
 * Queries the Overpass API (free, no key required) for hospitals / clinics
 * within `radiusMeters` of a given lat/lng.
 *
 * Returns:
 *  { hospitals, loading, error }
 *
 * Each hospital object shape:
 *  { id, name, address, lat, lng, phone, website, emergency, type, amenity, distance }
 */

import { useState, useEffect, useCallback } from 'react'

const OVERPASS_URL = 'https://overpass-api.de/api/interpreter'

// Haversine distance in km
function haversine(lat1, lng1, lat2, lng2) {
  const R   = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function buildQuery(lat, lng, radius) {
  return `
    [out:json][timeout:25];
    (
      node["amenity"="hospital"](around:${radius},${lat},${lng});
      node["amenity"="clinic"](around:${radius},${lat},${lng});
      node["amenity"="doctors"](around:${radius},${lat},${lng});
      way["amenity"="hospital"](around:${radius},${lat},${lng});
      way["amenity"="clinic"](around:${radius},${lat},${lng});
    );
    out center tags;
  `
}

function normalizeType(amenity) {
  if (amenity === 'hospital') return 'General'
  if (amenity === 'clinic')   return 'Clinic'
  if (amenity === 'doctors')  return 'Clinic'
  return 'General'
}

function parseElement(el, userLat, userLng) {
  const tags = el.tags || {}
  const lat  = el.lat ?? el.center?.lat
  const lng  = el.lon ?? el.center?.lon
  if (!lat || !lng) return null

  const name    = tags.name || tags['name:en'] || 'Unnamed Facility'
  const city    = tags['addr:city'] || ''
  const street  = tags['addr:street'] || ''
  const housen  = tags['addr:housenumber'] || ''
  const address = [housen, street, city].filter(Boolean).join(', ') || 'Address not available'

  const distance = haversine(userLat, userLng, lat, lng)

  return {
    id:        `osm-${el.type}-${el.id}`,
    osmId:     el.id,
    osmType:   el.type,
    name,
    address,
    lat,
    lng,
    phone:     tags.phone || tags['contact:phone'] || '',
    website:   tags.website || tags['contact:website'] || '',
    emergency: tags.emergency === 'yes' || tags.amenity === 'hospital',
    type:      normalizeType(tags.amenity),
    amenity:   tags.amenity,
    opening_hours: tags.opening_hours || '',
    operator:  tags.operator || '',
    distance,                              // km
    distanceStr: distance < 1
      ? `${Math.round(distance * 1000)} m`
      : `${distance.toFixed(1)} km`,
    // placeholder values for UI consistency
    rating:    null,
    wait:      null,
    specialties: tags.speciality
      ? tags.speciality.split(';').map(s => s.trim())
      : [],
  }
}

export function useNearbyHospitals(userLocation, radiusMeters = 5000) {
  const [hospitals, setHospitals] = useState([])
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)

  const fetch_ = useCallback(async () => {
    if (!userLocation?.lat || !userLocation?.lng) return
    setLoading(true)
    setError(null)

    try {
      const query = buildQuery(userLocation.lat, userLocation.lng, radiusMeters)
      const res   = await fetch(OVERPASS_URL, {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body:    'data=' + encodeURIComponent(query),
      })
      if (!res.ok) throw new Error('Overpass API error')
      const data = await res.json()

      const parsed = (data.elements || [])
        .map((el) => parseElement(el, userLocation.lat, userLocation.lng))
        .filter(Boolean)

      // Deduplicate by name + round coords, keep closest
      const seen = new Map()
      for (const h of parsed) {
        const key = h.name.toLowerCase()
        if (!seen.has(key) || seen.get(key).distance > h.distance) {
          seen.set(key, h)
        }
      }

      const sorted = [...seen.values()].sort((a, b) => a.distance - b.distance)
      setHospitals(sorted)
    } catch (err) {
      setError(err.message || 'Failed to load nearby hospitals')
    } finally {
      setLoading(false)
    }
  }, [userLocation?.lat, userLocation?.lng, radiusMeters])

  useEffect(() => { fetch_() }, [fetch_])

  return { hospitals, loading, error, refetch: fetch_ }
}
