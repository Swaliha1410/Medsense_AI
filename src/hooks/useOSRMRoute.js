/**
 * useOSRMRoute
 * Fetches a driving route + turn-by-turn steps via the free OSRM demo server.
 *
 * Returns:
 *  {
 *    coords:   [lat, lng][]   — full polyline
 *    distance: string         — km
 *    duration: number         — minutes
 *    steps:    Step[]         — turn-by-turn instructions
 *  } | null
 *
 * Step shape:
 *  {
 *    instruction: string   — "Turn left onto Main Street"
 *    distance:    string   — "0.3 km" / "250 m"
 *    duration:    number   — seconds
 *    maneuver:    string   — "turn", "depart", "arrive", "roundabout", etc.
 *    modifier:    string   — "left", "right", "straight", "uturn", etc.
 *    name:        string   — street name
 *    coords:      [lat,lng]— start coords of this step
 *  }
 */

import { useState, useEffect } from 'react'

function formatDist(metres) {
  return metres >= 1000
    ? `${(metres / 1000).toFixed(1)} km`
    : `${Math.round(metres)} m`
}

function stepInstruction(step) {
  const maneuver  = step.maneuver || {}
  const type      = maneuver.type     || ''
  const modifier  = maneuver.modifier || ''
  const name      = step.name || ''
  const road      = name ? ` onto ${name}` : ''

  if (type === 'depart')           return `Start${road}`
  if (type === 'arrive')           return `Arrive at destination`
  if (type === 'roundabout' || type === 'rotary') {
    const exit = maneuver.exit ? ` — take exit ${maneuver.exit}` : ''
    return `Enter roundabout${exit}${road}`
  }
  if (type === 'turn') {
    if (modifier === 'left')            return `Turn left${road}`
    if (modifier === 'right')           return `Turn right${road}`
    if (modifier === 'sharp left')      return `Sharp left${road}`
    if (modifier === 'sharp right')     return `Sharp right${road}`
    if (modifier === 'slight left')     return `Slight left${road}`
    if (modifier === 'slight right')    return `Slight right${road}`
    if (modifier === 'straight')        return `Continue straight${road}`
    if (modifier === 'uturn')           return `Make a U-turn${road}`
  }
  if (type === 'continue' || type === 'new name') return `Continue${road}`
  if (type === 'merge')                return `Merge${road}`
  if (type === 'fork') {
    if (modifier?.includes('left'))  return `Keep left${road}`
    if (modifier?.includes('right')) return `Keep right${road}`
  }
  if (type === 'on ramp')  return `Take the ramp${road}`
  if (type === 'off ramp') return `Take the exit${road}`
  if (type === 'end of road') {
    if (modifier === 'left')  return `Turn left at end of road${road}`
    if (modifier === 'right') return `Turn right at end of road${road}`
  }
  // fallback
  const action = modifier ? `${modifier} ` : ''
  return `${action}${type}${road}`.trim() || `Continue${road}`
}

export function useOSRMRoute(from, to) {
  const [route, setRoute] = useState(null)

  useEffect(() => {
    if (!from || !to) { setRoute(null); return }

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson&steps=true&annotations=false`

    fetch(url)
      .then(r => r.json())
      .then(data => {
        const r0 = data.routes?.[0]
        if (!r0) return

        const coords = r0.geometry.coordinates.map(([lng, lat]) => [lat, lng])

        // Flatten steps from all legs
        const steps = []
        for (const leg of (r0.legs || [])) {
          for (const step of (leg.steps || [])) {
            steps.push({
              instruction: stepInstruction(step),
              distance:    formatDist(step.distance),
              distanceM:   Math.round(step.distance),
              duration:    Math.round(step.duration),
              maneuver:    step.maneuver?.type     || 'turn',
              modifier:    step.maneuver?.modifier || '',
              name:        step.name || '',
              coords:      step.maneuver?.location
                ? [step.maneuver.location[1], step.maneuver.location[0]]
                : null,
            })
          }
        }

        setRoute({
          coords,
          distance: (r0.distance / 1000).toFixed(1),
          distanceM: Math.round(r0.distance),
          duration:  Math.round(r0.duration / 60),
          durationS: Math.round(r0.duration),
          steps,
        })
      })
      .catch(() => setRoute(null))
  }, [from?.lat, from?.lng, to?.lat, to?.lng])

  return route
}
