'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import ProfileButton from './components/ProfileButton'
import 'mapbox-gl/dist/mapbox-gl.css'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

function TwitterBanner() {
  return (
    <a href="https://x.com/TittyMaps" target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: '14px 16px', textDecoration: 'none' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Stay in the loop</div>
        <div style={{ color: '#8890c0', fontSize: 12 }}>Follow us for new clubs, dancers and updates — <span style={{ color: '#FF2D78', fontWeight: 600 }}>@TittyMaps</span></div>
      </div>
      <div style={{ background: '#000', color: 'white', fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20, flexShrink: 0 }}>Follow</div>
    </a>
  )
}

export default function Home() {
  const mapContainer = useRef<any>(null)
  const map = useRef<any>(null)
  const mapboxgl = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const [showSplash, setShowSplash] = useState(true)
  const [clubCount, setClubCount] = useState(0)
  const [dancerCount, setDancerCount] = useState(0)
  const [clubs, setClubs] = useState<any[]>([])
  const [filter, setFilter] = useState('all')
  const filterRef = useRef<string>('all')
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null)
  const [selectedClub, setSelectedClub] = useState<any>(null)
  const selectedClubRef = useRef<any>(null)
  const allClubs = useRef<any[]>([])
  const allClubsForMap = useRef<any[]>([])
  const clubsWithDancersRef = useRef<Set<string>>(new Set())
  const pendingMapInit = useRef<{ clubData: any[], lat: number, lon: number } | null>(null)

  useEffect(() => {
    fetchData()
    loadMapbox()
    fetchCounts()
  }, [])

  useEffect(() => {
    selectedClubRef.current = selectedClub
  }, [selectedClub])

  async function fetchCounts() {
    const [{ count: clubs }, { count: dancers }] = await Promise.all([
      supabase.from('clubs').select('*', { count: 'exact', head: true }),
      supabase.from('dancers').select('*', { count: 'exact', head: true }),
    ])
    setClubCount(clubs || 0)
    setDancerCount(dancers || 0)
  }

  async function loadMapbox() {
    const mod = await import('mapbox-gl')
    mapboxgl.current = mod.default
    mapboxgl.current.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
    setMapReady(true)
    if (pendingMapInit.current) {
      const { clubData, lat, lon } = pendingMapInit.current
      initMap(clubData, lat, lon)
      pendingMapInit.current = null
    }
  }

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function getClubPriority(club: any): number {
    if (club.is_featured) return 0
    if (clubsWithDancersRef.current.has(club.id)) return 1
    return 2
  }

  async function fetchData() {
    const [{ data: clubData }, { data: dancerData }] = await Promise.all([
      supabase.from('clubs').select('*'),
      supabase.from('dancers').select('club_ids').not('club_ids', 'is', null)
    ])

    const clubList = clubData || []
    const dancerList = dancerData || []

    const withDancers = new Set<string>()
    dancerList.forEach((d: any) => {
      if (d.club_ids) d.club_ids.forEach((cid: string) => withDancers.add(cid))
    })
    clubsWithDancersRef.current = withDancers
    allClubsForMap.current = clubList

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude
          const userLon = pos.coords.longitude
          setUserLocation({ lat: userLat, lon: userLon })

          const withDistance = clubList
            .filter(c => c.latitude && c.longitude)
            .map(c => ({ ...c, distance: getDistance(userLat, userLon, c.latitude, c.longitude) }))
            .filter(c => c.distance <= 215)
            .sort((a, b) => {
              const pa = getClubPriority(a)
              const pb = getClubPriority(b)
              if (pa !== pb) return pa - pb
              return a.distance - b.distance
            })

          allClubs.current = withDistance
          setClubs(withDistance)
          if (mapboxgl.current) {
            initMap(clubList, userLat, userLon)
          } else {
            pendingMapInit.current = { clubData: clubList, lat: userLat, lon: userLon }
          }
        },
        () => {
          const sorted = [...clubList].sort((a, b) => getClubPriority(a) - getClubPriority(b))
          const top20 = sorted.slice(0, 20)
          allClubs.current = top20
          setClubs(top20)
          if (mapboxgl.current) {
            initMap(clubList, 39.5, -98.35)
          } else {
            pendingMapInit.current = { clubData: clubList, lat: 39.5, lon: -98.35 }
          }
        }
      )
    } else {
      const sorted = [...clubList].sort((a, b) => getClubPriority(a) - getClubPriority(b))
      const top20 = sorted.slice(0, 20)
      allClubs.current = top20
      setClubs(top20)
      if (mapboxgl.current) {
        initMap(clubList, 39.5, -98.35)
      } else {
        pendingMapInit.current = { clubData: clubList, lat: 39.5, lon: -98.35 }
      }
    }
  }

  function buildGeoJSON(clubData: any[], selectedId?: string) {
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
            has_dancers: clubsWithDancersRef.current.has(c.id) ? 1 : 0,
            selected: c.id === selectedId ? 1 : 0,
          },
          geometry: { type: 'Point', coordinates: [c.longitude, c.latitude] }
        }))
    }
  }

  function initMap(clubData: any[], lat: number, lon: number) {
    if (map.current || !mapboxgl.current) return
    map.current = new mapboxgl.current.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lon, lat],
      zoom: 5,
    })
    map.current.addControl(new mapboxgl.current.NavigationControl(), 'top-right')
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

    map.current.addLayer({
      id: 'unclustered-featured',
      type: 'circle',
      source: 'clubs',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_featured'], 1]],
      paint: {
        'circle-color': ['case', ['==', ['get', 'selected'], 1], 'white', '#FFD700'],
        'circle-radius': 16,
        'circle-stroke-width': 4,
        'circle-stroke-color': ['case', ['==', ['get', 'selected'], 1], '#FFD700', 'white'],
      }
    })

    map.current.addLayer({
      id: 'unclustered-has-dancers',
      type: 'circle',
      source: 'clubs',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_featured'], 0], ['==', ['get', 'has_dancers'], 1]],
      paint: {
        'circle-color': ['case', ['==', ['get', 'selected'], 1], '#a01040', '#FF2D78'],
        'circle-radius': 14,
        'circle-stroke-width': 3.5,
        'circle-stroke-color': ['case', ['==', ['get', 'selected'], 1], 'white', '#a01040'],
      }
    })

    map.current.addLayer({
      id: 'unclustered-standard',
      type: 'circle',
      source: 'clubs',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_featured'], 0], ['==', ['get', 'has_dancers'], 0]],
      paint: {
        'circle-color': ['case', ['==', ['get', 'selected'], 1], '#a01040', '#FF2D78'],
        'circle-radius': 14,
        'circle-stroke-width': 2.5,
        'circle-stroke-color': 'white',
      }
    })

    map.current.addLayer({
      id: 'unclustered-featured-star',
      type: 'symbol',
      source: 'clubs',
      filter: ['all', ['!', ['has', 'point_count']], ['==', ['get', 'is_featured'], 1]],
      layout: {
        'text-field': '\u2605',
        'text-size': 14,
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
      },
      paint: {
        'text-color': ['case', ['==', ['get', 'selected'], 1], '#FFD700', '#c49500']
      }
    })

    map.current.on('click', 'clusters', (e: any) => {
      const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] })
      const clusterId = features[0].properties.cluster_id
      ;(map.current.getSource('clubs') as any).getClusterExpansionZoom(clusterId, (err: any, zoom: any) => {
        if (err) return
        map.current.easeTo({ center: (features[0].geometry as any).coordinates, zoom })
      })
    })

    const handlePinClick = (e: any) => {
      const props = e.features[0].properties
      const club = allClubsForMap.current.find(c => c.id === props.id)
      if (!club) return
      const currentSelected = selectedClubRef.current
      if (currentSelected && currentSelected.id === club.id) {
        window.location.href = `/clubs/${club.id}`
        return
      }
      setSelectedClub(club)
      updateSelectedPinById(club.id)
    }

    map.current.on('click', 'unclustered-featured', handlePinClick)
    map.current.on('click', 'unclustered-has-dancers', handlePinClick)
    map.current.on('click', 'unclustered-standard', handlePinClick)

    map.current.on('click', (e: any) => {
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['unclustered-featured', 'unclustered-has-dancers', 'unclustered-standard', 'clusters']
      })
      if (features.length === 0) {
        setSelectedClub(null)
        selectedClubRef.current = null
        updateSelectedPinById(null)
      }
    })

    ;['clusters', 'unclustered-featured', 'unclustered-has-dancers', 'unclustered-standard'].forEach(layer => {
      map.current.on('mouseenter', layer, () => { map.current.getCanvas().style.cursor = 'pointer' })
      map.current.on('mouseleave', layer, () => { map.current.getCanvas().style.cursor = '' })
    })
  }

  function updateSelectedPinById(selectedId: string | null) {
    if (!map.current || !map.current.getSource('clubs')) return
    const currentFilter = filterRef.current
    const filtered = allClubsForMap.current.filter(c => {
      if (currentFilter === 'all') return true
      if (currentFilter === 'full_nude') return c.nude_level === 'full_nude'
      if (currentFilter === 'topless') return c.nude_level === 'topless'
      if (currentFilter === 'bikini') return c.nude_level === 'bikini'
      if (currentFilter === 'full_bar') return c.bar_type === 'full_bar'
      if (currentFilter === 'byob') return c.bar_type === 'byob'
      if (currentFilter === 'cafe') return c.bar_type === 'cafe'
      if (currentFilter === 'none') return c.bar_type === 'none'
      if (currentFilter === 'featured') return c.is_featured
      return true
    })
    ;(map.current.getSource('clubs') as any).setData(buildGeoJSON(filtered, selectedId || undefined))
  }

  function updateFilter(newFilter: string) {
    setFilter(newFilter)
    filterRef.current = newFilter
    setSelectedClub(null)
    selectedClubRef.current = null
    if (!map.current || !map.current.getSource('clubs')) return
    const filtered = allClubsForMap.current.filter(c => {
      if (newFilter === 'all') return true
      if (newFilter === 'full_nude') return c.nude_level === 'full_nude'
      if (newFilter === 'topless') return c.nude_level === 'topless'
      if (newFilter === 'bikini') return c.nude_level === 'bikini'
      if (newFilter === 'full_bar') return c.bar_type === 'full_bar'
      if (newFilter === 'byob') return c.bar_type === 'byob'
      if (newFilter === 'cafe') return c.bar_type === 'cafe'
      if (newFilter === 'none') return c.bar_type === 'none'
      if (newFilter === 'featured') return c.is_featured
      return true
    })
    ;(map.current.getSource('clubs') as any).setData(buildGeoJSON(filtered))
  }

  const filtered = clubs.filter((c) => {
    if (filter === 'all') return true
    if (filter === 'full_nude') return c.nude_level === 'full_nude'
    if (filter === 'topless') return c.nude_level === 'topless'
    if (filter === 'bikini') return c.nude_level === 'bikini'
    if (filter === 'full_bar') return c.bar_type === 'full_bar'
    if (filter === 'byob') return c.bar_type === 'byob'
    if (filter === 'cafe') return c.bar_type === 'cafe'
    if (filter === 'none') return c.bar_type === 'none'
    if (filter === 'featured') return c.is_featured
    return true
  })

  const chips = [
    { key: 'all', label: 'All' },
    { key: 'featured', label: '⭐ Featured' },
    { key: 'full_nude', label: '🐱 Full nude' },
    { key: 'topless', label: '🍒 Topless' },
    { key: 'bikini', label: '👙 Bikini' },
    { key: 'full_bar', label: '🍾 Full bar' },
    { key: 'byob', label: '🍺 BYOB' },
    { key: 'cafe', label: '🧋 Cafe' },
    { key: 'none', label: '❌ No bar' },
  ]

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img src="/logo-pins.png" alt="TittyMaps" onClick={() => window.location.href = '/states'} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 16, cursor: 'pointer' }} />
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
        <ProfileButton />
      </div>

      <div style={{ position: 'relative' }}>
        {/* Map container — always rendered so Mapbox can initialize */}
        <div ref={mapContainer} style={{ height: '44vh', width: '100%', background: '#131629' }} />

        {/* Splash overlay */}
        {showSplash && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 10,
            background: 'linear-gradient(160deg, #0D0F1E 0%, #1a0d2e 50%, #0D0F1E 100%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px 20px', textAlign: 'center',
          }}>
            <img src="/logo-pins.png" alt="TittyMaps" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', marginBottom: 16, border: '3px solid #FF2D78', boxShadow: '0 0 30px rgba(255,45,120,0.4)' }} />
            <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>TittyMaps</h1>
            <p style={{ color: '#8890c0', fontSize: 14, margin: '0 0 20px' }}>The strip club directory</p>

            <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
              <div style={{ background: '#131629', border: '1px solid #1e2140', borderRadius: 12, padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ color: '#FF2D78', fontSize: 22, fontWeight: 700 }}>{clubCount}</div>
                <div style={{ color: '#8890c0', fontSize: 11 }}>Clubs</div>
              </div>
              <div style={{ background: '#131629', border: '1px solid #1e2140', borderRadius: 12, padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ color: '#FF2D78', fontSize: 22, fontWeight: 700 }}>{dancerCount}</div>
                <div style={{ color: '#8890c0', fontSize: 11 }}>Dancers</div>
              </div>
              <div style={{ background: '#131629', border: '1px solid #1e2140', borderRadius: 12, padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ color: '#FF2D78', fontSize: 22, fontWeight: 700 }}>50</div>
                <div style={{ color: '#8890c0', fontSize: 11 }}>States</div>
              </div>
            </div>

            <button
              onClick={() => setShowSplash(false)}
              style={{
                background: 'linear-gradient(135deg, #FF2D78, #cc0055)',
                color: 'white', border: 'none', borderRadius: 30,
                padding: '14px 36px', fontSize: 16, fontWeight: 700,
                cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,45,120,0.5)',
                letterSpacing: 0.5,
              }}>
              🗺️ Explore Map
            </button>
          </div>
        )}

        {selectedClub && !showSplash && (
          <div style={{ position: 'absolute', top: 10, left: 10, right: 10, zIndex: 10 }}>
            <div
              onClick={() => window.location.href = `/clubs/${selectedClub.id}`}
              style={{
                background: '#131629', borderRadius: 12, padding: 12,
                border: `1px solid ${selectedClub.is_featured ? '#FFD700' : '#FF2D78'}`,
                display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
                boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
              }}>
              <div style={{ width: 52, height: 52, borderRadius: 10, background: selectedClub.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {selectedClub.photo_url
                  ? <img src={`${selectedClub.photo_url}?width=200&quality=75`} alt={selectedClub.name} width={52} height={52} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : (selectedClub.is_featured ? '🌟' : '💜')}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2, color: 'white' }}>{selectedClub.name}</div>
                <div style={{ fontSize: 11, color: '#8890c0', marginBottom: 6 }}>{selectedClub.city}, {selectedClub.state}{selectedClub.address ? ` — ${selectedClub.address}` : ''}</div>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                  {selectedClub.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                  {clubsWithDancersRef.current.has(selectedClub.id) && <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>💃</span>}
                  <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                    {selectedClub.nude_level === 'full_nude' ? '🐱 Full nude' : selectedClub.nude_level === 'bikini' ? '👙 Bikini' : '🍒 Topless'}
                  </span>
                  <span style={{ background: selectedClub.bar_type === 'none' ? '#2e1a1a' : '#1a2a3d', color: selectedClub.bar_type === 'none' ? '#ff6b6b' : '#7ab8ff', border: `1px solid ${selectedClub.bar_type === 'none' ? '#ff4444' : '#3a7acd'}`, borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                    {selectedClub.bar_type === 'full_bar' ? '🍾 Full bar' : selectedClub.bar_type === 'cafe' ? '🧋 Cafe' : selectedClub.bar_type === 'byob' ? '🍺 BYOB' : '❌ No bar'}
                  </span>
                </div>
              </div>
              <button
                onClick={e => { e.stopPropagation(); setSelectedClub(null); selectedClubRef.current = null; updateSelectedPinById(null) }}
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', width: 24, height: 24, fontSize: 12, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ✕
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '8px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {chips.map((c) => (
          <button key={c.key} onClick={() => updateFilter(c.key)}
            style={{
              borderRadius: 20, padding: '5px 14px', fontSize: 12, whiteSpace: 'nowrap',
              border: '1px solid', cursor: 'pointer', flexShrink: 0,
              background: filter === c.key ? (c.key === 'featured' ? '#FFD700' : c.key === 'none' ? '#ff4444' : '#FF2D78') : 'transparent',
              borderColor: filter === c.key ? (c.key === 'featured' ? '#FFD700' : c.key === 'none' ? '#ff4444' : '#FF2D78') : '#3a3d60',
              color: filter === c.key ? (c.key === 'featured' ? '#0D0F1E' : 'white') : '#8890c0',
            }}>
            {c.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '8px 12px', paddingBottom: 100 }}>
        <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 8 }}>
          {userLocation ? `${filtered.length} clubs within 215 miles` : `${filtered.length} clubs`}
        </div>
        <div className="state-clubs-grid">
          {filtered.map((club) => (
            <div key={club.id}
              onClick={() => window.location.href = `/clubs/${club.id}`}
              style={{
                background: selectedClub?.id === club.id ? '#1a0d20' : '#131629',
                borderRadius: 12, marginBottom: 8, padding: 12,
                border: `1px solid ${selectedClub?.id === club.id ? '#FF2D78' : club.is_featured ? '#FFD700' : clubsWithDancersRef.current.has(club.id) ? '#FF2D78' : '#1e2140'}`,
                display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer'
              }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: club.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                {club.photo_url
                  ? <img src={`${club.photo_url}?width=250&quality=70`} alt={club.name} loading="lazy" width={250} height={250} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                  {clubsWithDancersRef.current.has(club.id) && <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>💃</span>}
                  <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                    {club.nude_level === 'full_nude' ? '🐱 Full nude' : club.nude_level === 'bikini' ? '👙 Bikini' : '🍒 Topless'}
                  </span>
                  <span style={{ background: club.bar_type === 'none' ? '#2e1a1a' : '#1a2a3d', color: club.bar_type === 'none' ? '#ff6b6b' : '#7ab8ff', border: `1px solid ${club.bar_type === 'none' ? '#ff4444' : '#3a7acd'}`, borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                    {club.bar_type === 'full_bar' ? '🍾 Full bar' : club.bar_type === 'cafe' ? '🧋 Cafe' : club.bar_type === 'byob' ? '🍺 BYOB' : '❌ No bar'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ paddingTop: 8 }}>
          <TwitterBanner />
        </div>
      </div>
    </div>
  )
}
