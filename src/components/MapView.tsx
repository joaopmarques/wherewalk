import {
  AttributionControl,
  LngLatBounds,
  MapLibreMap,
  Marker,
  type GeoJSONSource,
  type MapMouseEvent,
  type PaddingOptions,
  setWorkerUrl,
} from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import { useEffect, useRef, useState } from 'react'
import type { LngLat } from '../domain/types'

// MapLibre finds its worker next to its own file, but the bundler moves that file.
// Vite bundles the worker separately and gives its URL here.
setWorkerUrl(workerUrl)

const STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty'
const WALKED_COLOR = '#9aa3ad'

export interface MapRoute {
  coordinates: LngLat[]
  color: string
  /** Direction arrows help on a Loop. On an Out-and-back they overlap, so they stay off. */
  arrows: boolean
}

interface Props {
  origin: LngLat | null
  originDraggable: boolean
  onOriginChange: (origin: LngLat) => void
  onMapClick?: (point: LngLat) => void
  routes: MapRoute[]
  selectedIndex: number
  showAll: boolean
  /** The part of the Selected Route the Walker has already covered. */
  walked: LngLat[]
  position: LngLat | null
  heading: number | null
  /** Keep the map centered on the Walker's position. */
  follow: boolean
  /** Changes to this value fit the map to the routes. */
  fitKey: number
}

/** Space the floating control box covers, so the map keeps routes out from under it. */
function controlPadding(): PaddingOptions {
  return window.innerWidth < 720
    ? { top: 48, right: 32, bottom: Math.min(360, window.innerHeight * 0.45), left: 32 }
    : { top: 64, right: 64, bottom: 64, left: 420 }
}

const lineFeature = (coordinates: LngLat[], properties: Record<string, unknown> = {}) => ({
  type: 'Feature' as const,
  geometry: { type: 'LineString' as const, coordinates },
  properties,
})

/** A small chevron that points along the line, to show which way to walk. */
function arrowImage() {
  const size = 48
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  // A dark outline keeps the white chevron visible on both the white casing and the route color.
  for (const [color, width] of [['rgba(0, 0, 0, 0.5)', 12], ['#ffffff', 6]] as const) {
    ctx.strokeStyle = color
    ctx.lineWidth = width
    ctx.beginPath()
    ctx.moveTo(18, 13)
    ctx.lineTo(29, 24)
    ctx.lineTo(18, 35)
    ctx.stroke()
  }
  const { data } = ctx.getImageData(0, 0, size, size)
  return { width: size, height: size, data: new Uint8Array(data.buffer) }
}

export function MapView(props: Props) {
  const container = useRef<HTMLDivElement>(null)
  const map = useRef<MapLibreMap | null>(null)
  const originMarker = useRef<Marker | null>(null)
  const positionMarker = useRef<Marker | null>(null)
  const positionArrow = useRef<HTMLDivElement | null>(null)
  const centeredOnOrigin = useRef(false)
  const callbacks = useRef(props)
  callbacks.current = props
  const [loaded, setLoaded] = useState(false)
  const [userMoved, setUserMoved] = useState(false)

  // Create the map once.
  useEffect(() => {
    const m = new MapLibreMap({
      container: container.current!,
      style: STYLE_URL,
      center: [0, 20],
      zoom: 1.5,
      attributionControl: false,
    })
    // The control box covers the bottom of the screen on phones, so the map credits go top-right.
    m.addControl(new AttributionControl({ compact: true }), 'top-right')
    map.current = m

    m.on('load', () => {
      m.addImage('route-arrow', arrowImage(), { pixelRatio: 2 })
      m.addSource('routes', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      m.addSource('walked', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      const lineLayout = { 'line-cap': 'round', 'line-join': 'round' } as const
      m.addLayer({
        id: 'routes-others',
        type: 'line',
        source: 'routes',
        filter: ['==', ['get', 'selected'], false],
        layout: { ...lineLayout, visibility: 'none' },
        paint: { 'line-color': ['get', 'color'], 'line-width': 4, 'line-opacity': 0.6 },
      })
      m.addLayer({
        id: 'route-casing',
        type: 'line',
        source: 'routes',
        filter: ['==', ['get', 'selected'], true],
        layout: lineLayout,
        paint: { 'line-color': '#ffffff', 'line-width': 10 },
      })
      m.addLayer({
        id: 'route-selected',
        type: 'line',
        source: 'routes',
        filter: ['==', ['get', 'selected'], true],
        layout: lineLayout,
        paint: { 'line-color': ['get', 'color'], 'line-width': 6 },
      })
      m.addLayer({
        id: 'route-walked',
        type: 'line',
        source: 'walked',
        layout: lineLayout,
        paint: { 'line-color': WALKED_COLOR, 'line-width': 6 },
      })
      m.addLayer({
        id: 'route-arrows',
        type: 'symbol',
        source: 'routes',
        filter: ['all', ['==', ['get', 'selected'], true], ['==', ['get', 'arrows'], true]],
        layout: {
          'symbol-placement': 'line',
          'symbol-spacing': 110,
          'icon-image': 'route-arrow',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
          'icon-rotation-alignment': 'map',
        },
      })
      setLoaded(true)
    })

    m.on('click', (e: MapMouseEvent) => callbacks.current.onMapClick?.([e.lngLat.lng, e.lngLat.lat]))
    // Only a drag by the Walker has an original input event. Camera animations do not.
    m.on('dragstart', (e: { originalEvent?: Event }) => {
      if (e.originalEvent) setUserMoved(true)
    })

    return () => {
      m.remove()
      // Markers belong to the removed map. A new map must create its own.
      map.current = null
      originMarker.current = null
      positionMarker.current = null
      centeredOnOrigin.current = false
      setLoaded(false)
    }
  }, [])

  // Origin marker.
  useEffect(() => {
    const m = map.current
    if (!m || !props.origin) return
    if (!originMarker.current) {
      const el = document.createElement('div')
      el.className = 'origin-marker'
      el.setAttribute('aria-label', 'Origin')
      // MapLibre positions the marker with a transform, so the pin shape goes on an inner element.
      el.appendChild(document.createElement('div')).className = 'origin-pin'
      originMarker.current = new Marker({ element: el, anchor: 'bottom' })
        .setLngLat(props.origin)
        .addTo(m)
      originMarker.current.on('dragend', () => {
        const { lng, lat } = originMarker.current!.getLngLat()
        callbacks.current.onOriginChange([lng, lat])
      })
    }
    originMarker.current.setLngLat(props.origin)
    originMarker.current.setDraggable(props.originDraggable)
    originMarker.current.getElement().classList.toggle('is-draggable', props.originDraggable)
    if (!centeredOnOrigin.current) {
      centeredOnOrigin.current = true
      m.jumpTo({ center: props.origin, zoom: 15 })
    }
  }, [props.origin, props.originDraggable])

  // Routes.
  useEffect(() => {
    const m = map.current
    if (!m || !loaded) return
    const features = props.routes.map((r, i) =>
      lineFeature(r.coordinates, { color: r.color, arrows: r.arrows, selected: i === props.selectedIndex }),
    )
    // Draw the Selected Route last, so it sits on top of the others.
    features.sort((a, b) => Number(a.properties.selected) - Number(b.properties.selected))
    ;(m.getSource('routes') as GeoJSONSource).setData({ type: 'FeatureCollection', features })
    m.setLayoutProperty('routes-others', 'visibility', props.showAll ? 'visible' : 'none')
  }, [loaded, props.routes, props.selectedIndex, props.showAll])

  // Walked part of the Selected Route.
  useEffect(() => {
    const m = map.current
    if (!m || !loaded) return
    const features = props.walked.length >= 2 ? [lineFeature(props.walked)] : []
    ;(m.getSource('walked') as GeoJSONSource).setData({ type: 'FeatureCollection', features })
  }, [loaded, props.walked])

  // Fit the map to the routes when a new plan arrives.
  useEffect(() => {
    const m = map.current
    if (!m || props.fitKey === 0 || props.routes.length === 0) return
    const bounds = new LngLatBounds()
    for (const r of props.routes) for (const c of r.coordinates) bounds.extend(c)
    m.fitBounds(bounds, { padding: controlPadding(), maxZoom: 17, duration: 600 })
    // Only a new plan refits, not a change of the Selected Route.
  }, [props.fitKey])

  // Walker position marker with a heading arrow.
  useEffect(() => {
    const m = map.current
    if (!m || !props.position) return
    if (!positionMarker.current) {
      const el = document.createElement('div')
      el.className = 'position-marker'
      const arrow = document.createElement('div')
      arrow.className = 'position-arrow'
      el.appendChild(arrow)
      positionArrow.current = arrow
      positionMarker.current = new Marker({ element: el }).setLngLat(props.position).addTo(m)
    }
    positionMarker.current.setLngLat(props.position)
    const arrow = positionArrow.current!
    arrow.style.display = props.heading === null ? 'none' : 'block'
    if (props.heading !== null) arrow.style.transform = `rotate(${props.heading}deg)`
  }, [props.position, props.heading])

  // Follow the Walker during a Walk, until they move the map by hand.
  useEffect(() => {
    if (!props.follow) setUserMoved(false)
  }, [props.follow])

  useEffect(() => {
    const m = map.current
    if (!m || !props.follow || userMoved || !props.position) return
    m.easeTo({ center: props.position, padding: controlPadding(), duration: 500 })
  }, [props.follow, userMoved, props.position])

  return (
    <>
      <div ref={container} className="map" />
      {props.follow && userMoved && (
        <button type="button" className="recenter" onClick={() => setUserMoved(false)}>
          Recenter
        </button>
      )}
    </>
  )
}
