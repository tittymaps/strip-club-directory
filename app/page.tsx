'use client'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

export default function Home() {
  const mapContainer = useRef<any>(null)
  const map = useRef<any>(null)
  const [clubs, setClubs] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null)
  const allClubs = useRef<any[]>([])

  useEffect(() => {
    fetchClubs()
  }, [])

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function sortByDistance(clubList: any[], lat: number, lon: number) {
    return [...clubList].sort((a, b) => {
      if (!a.latitude || !a.longitude) return 1
      if (!b.latitude || !b.longitude) return -1
      return getDistance(lat, lon, a.latitude, a.longitude) -
        getDistance(lat, lon, b.latitude, b.longitude)
    })
  }

  async function fetchClubs() {
    const { data } = await supabase.from('clubs').select('*')
    const clubData = data || []
    allClubs.current = clubData
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude
          const userLon = pos.coords.longitude
          setUserLocation({ lat: userLat, lon: userLon })
          const sorted = sortByDistance(clubData, userLat, userLon)
          allClubs.current = sorted
          setClubs(sorted)
          initMap(sorted, userLat, userLon)
        },
        () => {
          setClubs(clubData)
          initMap(clubData, 39.5, -98.35)
        }
      )
    } else {
      setClubs(clubData)
      initMap(clubData, 39.5, -98.35)
    }
  }

  function buildGeoJSON(clubData: any[]) {
    return {
      type: 'FeatureCollection',
      features: clubData
        .filter(c => c.latitude && c.longitude)
        .map(c => ({
          type: 'Feature',
          properties: {
            id: c.id,
            name: c.name,
            city: c.city,
            state: c.state,
            nude_level: c.nude_level,
            bar_type: c.bar_type,
            is_featured: c.is_featured ? 1 : 0,
          },
          geometry: { type: 'Point', coordinates: [c.longitude, c.latitude] }
        }))
    }
  }

  function initMap(clubData: any[], lat: number, lon: number) {
    if (map.current) return
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lon, lat],
      zoom: 5,
    })
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')
    map.current.on('load', () => {
      setupMapLayers(clubData)
    })
  }

  function setupMapLayers(clubData: any[]) {
    const geojson = buildGeoJSON(clubData)

    map.current.addSource('clubs', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 11,
      clusterRadius: 50,
      clusterMinPoints: 8,
    })

    // Cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'clubs',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': '#FF2D78',
        'circle-radius': ['step', ['get', 'point_count'], 22, 8, 30, 25, 38],
        'circle-stroke-width': 3,
        'circle-stroke-color': 'white',
      }
    })

    // Cluster count labels
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'clubs',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 14,
      },
      paint: { 'text-color': 'white' }
    })

    // Unclustered featured pins (gold)
    map.current.addLayer({
      id: 'unclustered-featured',
      type: 'circle',
      source: 'clubs',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_featured'], 1]],
      paint: {
        'circle-color': '#FFD700',
        'circle-radius': 16,
        'circle-stroke-width': 3,
        'circle-stroke-color': 'white',
      }
    })

    // Unclustered standard pins (pink)
    map.current.addLayer({
      id: 'unclustered-standard',
      type: 'circle',
      source: 'clubs',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_featured'], 0]],
      paint: {
        'circle-color': '#FF2D78',
        'circle-radius': 14,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': 'white',
      }
    })

    // Star symbol on featured pins
    map.current.addLayer({
      id: 'unclustered-featured-star',
      type: 'symbol',
      source: 'clubs',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_featured'], 1]],
      layout: {
        'text-field': '★',
        'text-size': 14,
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      },
      paint: { 'text-color': '#c49500' }
    })

    // Click cluster to expand
    map.current.on('click', 'clusters', (e: any) => {
      const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] })
      const clusterId = features[0].properties.cluster_id
      ;(map.current.getSource('clubs') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) return
        map.current.easeTo({ center: (features[0].geometry as any).coordinates, zoom })
      })
    })

    // Click individual pin to show popup
    const showPopup = (e: any) => {
      const props = e.features[0].properties
      const coords = (e.features[0].geometry as any).coordinates.slice()
      const club = allClubs.current.find(c => c.id === props.id)
      if (!club) return
      const popupHTML =
        '<div style="background:#131629;color:white;padding:10px;border-radius:12px;min-width:180px;cursor:pointer;border:1px solid ' + (club.is_featured ? '#FFD700' : '#1e2140') + ';" onclick="window.location.href=\'/clubs/' + club.id + '\'">' +
        '<div style="font-weight:600;font-size:14px;margin-bottom:4px;">' + club.name + ' →</div>' +
        '<div style="font-size:11px;color:#aaa;margin-bottom:6px;">' + club.city + ', ' + club.state + '</div>' +
        '<div style="display:flex;gap:4px;flex-wrap:wrap;">' +
        (club.is_featured ? '<span style="background:#3d3000;color:#FFD700;border:1px solid #FFD700;border-radius:20px;padding:2px 8px;font-size:10px;">★ Featured</span>' : '') +
        '<span style="background:#3d1a2e;color:#FF2D78;border:1px solid #FF2D78;border-radius:20px;padding:2px 8px;font-size:10px;">' + (club.nude_level === 'full_nude' ? '🐱 Full nude' : '👙 Topless') + '</span>' +
        '<span style="background:#1a2a3d;color:#7ab8ff;border:1px solid #3a7acd;border-radius:20px;padding:2px 8px;font-size:10px;">' + (club.bar_type === 'full_bar' ? '🍾 Full bar' : '🍺 BYOB') + '</span>' +
        '</div></div>'
      new mapboxgl.Popup({ offset: 20 })
        .setLngLat(coords)
        .setHTML(popupHTML)
        .addTo(map.current)
    }

    map.current.on('click', 'unclustered-featured', showPopup)
    map.current.on('click', 'unclustered-standard', showPopup)

    // Cursor pointer
    ;['clusters', 'unclustered-featured', 'unclustered-standard'].forEach(layer => {
      map.current.on('mouseenter', layer, () => { map.current.getCanvas().style.cursor = 'pointer' })
      map.current.on('mouseleave', layer, () => { map.current.getCanvas().style.cursor = '' })
    })
  }

  function updateFilter(newFilter: string) {
    setFilter(newFilter)
    if (!map.current || !map.current.getSource('clubs')) return
    const filtered = allClubs.current.filter(c => {
      if (newFilter === 'all') return true
      if (newFilter === 'full_nude') return c.nude_level === 'full_nude'
      if (newFilter === 'topless') return c.nude_level === 'topless'
      if (newFilter === 'full_bar') return c.bar_type === 'full_bar'
      if (newFilter === 'byob') return c.bar_type === 'byob'
      if (newFilter === 'featured') return c.is_featured
      return true
    })
    ;(map.current.getSource('clubs') as any).setData(buildGeoJSON(filtered))
  }

  const filtered = clubs.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'full_nude') return c.nude_level === 'full_nude'
    if (filter === 'topless') return c.nude_level === 'topless'
    if (filter === 'full_bar') return c.bar_type === 'full_bar'
    if (filter === 'byob') return c.bar_type === 'byob'
    if (filter === 'featured') return c.is_featured
    return true
  })

  const chips = [
    { key: 'all', label: 'All' },
    { key: 'featured', label: '⭐ Featured' },
    { key: 'full_nude', label: '🐱 Full nude' },
    { key: 'topless', label: '👙 Topless' },
    { key: 'full_bar', label: '🍾 Full bar' },
    { key: 'byob', label: '🍺 BYOB' },
  ]

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
      <style>{`
        .mapboxgl-popup-content { background: transparent !important; padding: 0 !important; box-shadow: none !important; border-radius: 0 !important; }
        .mapboxgl-popup-tip { display: none !important; }
        .mapboxgl-popup-close-button { display: none !important; }
      `}</style>
      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#1a1d35', border: '2px solid #7B2FBE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 18 }}>📍</span>
        </div>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#FF2D78', fontWeight: 700, fontSize: 18 }}>Titty</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 18 }}>Maps</span>
          <span style={{ color: '#FFD700', fontSize: 12 }}>.com</span>
        </div>
      </div>
      <div ref={mapContainer} style={{ height: '45vh', width: '100%' }} />
      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '8px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {chips.map((c) => (
          <button key={c.key} onClick={() => updateFilter(c.key)}
            style={{
              borderRadius: 20, padding: '5px 14px', fontSize: 12, whiteSpace: 'nowrap',
              border: '1px solid', cursor: 'pointer', flexShrink: 0,
              background: filter === c.key ? (c.key === 'featured' ? '#FFD700' : '#FF2D78') : 'transparent',
              borderColor: filter === c.key ? (c.key === 'featured' ? '#FFD700' : '#FF2D78') : '#3a3d60',
              color: filter === c.key ? (c.key === 'featured' ? '#0D0F1E' : 'white') : '#8890c0',
            }}>
            {c.label}
          </button>
        ))}
      </div>
      <div style={{ padding: '8px 12px' }}>
        <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 8 }}>{filtered.length} clubs nearby</div>
        {filtered.map((club) => (
          <div key={club.id}
            onClick={() => window.location.href = `/clubs/${club.id}`}
            style={{
              background: '#131629', borderRadius: 12, marginBottom: 8, padding: 12,
              border: `1px solid ${club.is_featured ? '#FFD700' : '#1e2140'}`,
              display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer'
            }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: club.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {club.photo_url
                ? <img src={club.photo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (club.is_featured ? '🌟' : '💜')
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{club.name}</div>
              <div style={{ fontSize: 11, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#8890c0' }}>{club.city}, {club.state}</span>
                {userLocation && club.latitude && club.longitude && (
                  <span style={{ color: '#8890c0' }}>
                    {getDistance(userLocation.lat, userLocation.lon, club.latitude, club.longitude).toFixed(1)} mi
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                  {club.nude_level === 'full_nude' ? '🐱 Full nude' : '👙 Topless'}
                </span>
                <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                  {club.bar_type === 'full_bar' ? '🍾 Full bar' : '🍺 BYOB'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
