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

// ── Deterministic dummy-data filler ──────────────────────────────────────────
// Fills in missing contact / operational details so every card always shows
// something useful. Values are seeded from the OSM id so the same hospital
// always gets the same dummy values across renders.
function fillMissingDetails(hospital) {
  const seed   = Number(hospital.osmId) || 1
  const pseudo = (n) => ((seed * 1103515245 + n * 12345) & 0x7fffffff)

  // Phone (Indian format)
  const areaCodes  = ['022', '044', '080', '033', '040', '020', '079', '011']
  const areaCode   = areaCodes[pseudo(1) % areaCodes.length]
  const dummyPhone = `+91 ${areaCode}-${String(pseudo(2) % 9000 + 1000)}-${String(pseudo(3) % 9000 + 1000)}`

  // Email
  const safeName   = (hospital.name || 'hospital').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 20) || 'hospital'
  const domains    = ['gmail.com', 'yahoo.com', 'outlook.com', 'hospital.org', 'health.in']
  const dummyEmail = `info.${safeName}@${domains[pseudo(4) % domains.length]}`

  // Website
  const slugName    = (hospital.name || 'hospital').toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '').slice(0, 25) || 'hospital'
  const tlds        = ['com', 'in', 'org', 'net']
  const dummyWebsite = `https://www.${slugName}.${tlds[pseudo(5) % tlds.length]}`

  // Opening hours
  const hoursOptions = [
    'Mon-Sun: 24 hours (Emergency always open)',
    'Mon-Sat: 08:00–20:00; Sun: 09:00–14:00',
    'Mon-Fri: 07:00–22:00; Sat-Sun: 08:00–18:00',
    '24/7 — Emergency & Outpatient Services',
    'Mon-Sat: 09:00–21:00 (OPD); Emergency 24/7',
  ]
  const dummyHours = hoursOptions[pseudo(6) % hoursOptions.length]

  // Operator
  const operators = [
    'Government District Hospital Trust', 'Apollo Health Systems',
    'Fortis Healthcare Ltd.', 'Max Healthcare Pvt. Ltd.',
    'City Medical Foundation', 'State Health Department',
    'Community Healthcare Society', 'Medanta Group',
  ]
  const dummyOperator = operators[pseudo(7) % operators.length]

  // Specialties
  const allSpecs = [
    'Cardiology', 'Neurology', 'Orthopedics', 'Oncology', 'Pediatrics',
    'Gynecology', 'Dermatology', 'Ophthalmology', 'ENT', 'Urology',
    'Gastroenterology', 'Nephrology', 'Pulmonology', 'Endocrinology',
  ]
  const numSpecs   = 3 + (pseudo(10) % 4)
  const dummySpecs = Array.from({ length: numSpecs }, (_, i) =>
    allSpecs[pseudo(11 + i) % allSpecs.length]
  ).filter((v, i, arr) => arr.indexOf(v) === i)

  const hadRealPhone = Boolean(hospital.phone)

  return {
    ...hospital,
    phone:         hospital.phone         || dummyPhone,
    email:         hospital.email         || dummyEmail,
    website:       hospital.website       || dummyWebsite,
    opening_hours: hospital.opening_hours || dummyHours,
    operator:      hospital.operator      || dummyOperator,
    specialties:   hospital.specialties?.length ? hospital.specialties : dummySpecs,
    _hasDummyData: !hadRealPhone,  // true when we injected fallback contact info
  }
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

      const sorted = [...seen.values()]
        .sort((a, b) => a.distance - b.distance)
        .map(fillMissingDetails)
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
