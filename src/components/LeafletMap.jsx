/**
 * LeafletMap — reusable interactive map component
 *
 * Uses:
 *  - Leaflet + react-leaflet for rendering (free, no API key)
 *  - OpenStreetMap tiles (free, attribution required)
 *  - OSRM public demo server for turn-by-turn routing (free)
 *
 * Props:
 *  center        [lat, lng]  — map center
 *  zoom          number      — initial zoom level
 *  userLocation  {lat, lng}  — blue dot for user
 *  hospitals     Array       — markers to render
 *  selected      object|null — highlighted hospital
 *  onSelect      fn          — called when a marker is clicked
 *  routeTo       {lat,lng}   — if set, draws a route from userLocation to this point
 */

import React, { useEffect, useRef, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  Polyline,
  useMap,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── Fix Leaflet's default icon path (broken by bundlers) ──────────────────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// Custom hospital marker (red cross icon)
const hospitalIcon = (selected = false) =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:${selected ? 40 : 32}px;
        height:${selected ? 40 : 32}px;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        background:${selected ? '#0F6FFF' : '#EF4444'};
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
        display:flex;align-items:center;justify-content:center;
        transition:all .2s;
      ">
        <span style="
          transform:rotate(45deg);
          font-size:${selected ? 18 : 14}px;
          line-height:1;
        ">🏥</span>
      </div>`,
    iconSize:   [selected ? 40 : 32, selected ? 40 : 32],
    iconAnchor: [selected ? 20 : 16, selected ? 40 : 32],
    popupAnchor:[0, -(selected ? 44 : 36)],
  })

const userIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:22px;height:22px;">
      <!-- outer pulse ring -->
      <div style="
        position:absolute;inset:-6px;
        border-radius:50%;
        background:rgba(15,111,255,0.15);
        animation:userPulse 2s ease-in-out infinite;
      "></div>
      <!-- solid dot -->
      <div style="
        position:absolute;inset:0;
        background:#0F6FFF;
        border:3px solid white;
        border-radius:50%;
        box-shadow:0 2px 6px rgba(15,111,255,0.5);
      "></div>
    </div>
    <style>
      @keyframes userPulse {
        0%,100%{transform:scale(1);opacity:.6}
        50%{transform:scale(1.6);opacity:.15}
      }
    </style>`,
  iconSize:   [22, 22],
  iconAnchor: [11, 11],
})

// ── Fly-to helper (triggers re-center when center prop changes) ───────────────
function FlyToCenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.flyTo(center, zoom, { duration: 1 })
  }, [center, zoom])
  return null
}

// ── OSRM routing hook ─────────────────────────────────────────────────────────
import { useOSRMRoute } from '../hooks/useOSRMRoute'

// ── Main component ────────────────────────────────────────────────────────────
export default function LeafletMap({
  center = [20, 0],
  zoom   = 13,
  userLocation,
  userAccuracy,       // metres — draws the real GPS accuracy circle
  hospitals = [],
  selected,
  onSelect,
  routeTo,
}) {
  const route = useOSRMRoute(userLocation, routeTo)

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      style={{ width: '100%', height: '100%', borderRadius: '1.5rem' }}
    >
      {/* OpenStreetMap tiles — free, requires attribution */}
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FlyToCenter center={center} zoom={zoom} />

      {/* User location */}
      {userLocation && (
        <>
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} zIndexOffset={1000}>
            <Popup>
              <div style={{ minWidth: 140 }}>
                <strong style={{ fontSize: 13 }}>📍 You are here</strong>
                {userAccuracy && (
                  <p style={{ fontSize: 11, color: '#666', margin: '4px 0 0' }}>
                    Accuracy: ±{userAccuracy} m
                  </p>
                )}
              </div>
            </Popup>
          </Marker>

          {/* Real GPS accuracy circle — shrinks as GPS refines */}
          {userAccuracy && (
            <Circle
              center={[userLocation.lat, userLocation.lng]}
              radius={userAccuracy}
              pathOptions={{
                color:       '#0F6FFF',
                fillColor:   '#0F6FFF',
                fillOpacity: 0.08,
                weight:      1.5,
                dashArray:   '4 4',
              }}
            />
          )}
        </>
      )}

      {/* Hospital markers */}
      {hospitals.map((h) => (
        <Marker
          key={h.id}
          position={[h.lat, h.lng]}
          icon={hospitalIcon(selected?.id === h.id)}
          eventHandlers={{ click: () => onSelect?.(h) }}
        >
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong style={{ fontSize: 13 }}>{h.name}</strong>
              <br />
              <span style={{ fontSize: 11, color: '#666' }}>{h.address}</span>
              <br />
              {h.emergency && (
                <span style={{ fontSize: 10, color: '#ef4444', fontWeight: 700 }}>
                  🚨 Emergency
                </span>
              )}
            </div>
          </Popup>
        </Marker>
      ))}

      {/* Routing polyline */}
      {route && (
        <Polyline
          positions={route.coords}
          pathOptions={{ color: '#0F6FFF', weight: 4, opacity: 0.8, dashArray: '8 4' }}
        />
      )}
    </MapContainer>
  )
}

// Export route info separately so parent can display it
export { useOSRMRoute }
