'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function BikiniBaristasNearMe() {
  const [clubs, setClubs] = useState<any[]>([])
  const [dancers, setDancers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState('')
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null)

  useEffect(() => {
    fetchData()
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

  async function fetchData() {
    const { data: clubData } = await supabase
      .from('clubs')
      .select('*')
      .eq('nude_level', 'bikini')
      .eq('bar_type', 'cafe')

    const bikiniBaristaClubs = clubData || []

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const userLat = pos.coords.latitude
          const userLon = pos.coords.longitude
          setUserLocation({ lat: userLat, lon: userLon })

          const featured = bikiniBaristaClubs
            .filter(c => c.is_featured && c.latitude && c.longitude)
            .map(c => ({ ...c, distance: getDistance(userLat, userLon, c.latitude, c.longitude) }))
            .sort((a, b) => a.distance - b.distance)

          const standard = bikiniBaristaClubs
            .filter(c => !c.is_featured && c.latitude && c.longitude)
            .map(c => ({ ...c, distance: getDistance(userLat, userLon, c.latitude, c.longitude) }))
            .sort((a, b) => a.distance - b.distance)

          const remaining = Math.max(0, 20 - featured.length)
          const result = [...featured, ...standard.slice(0, remaining)]

          if (result.length > 0) {
            setLocationName(`near ${result[0].city}, ${result[0].state}`)
          }

          setClubs(result)
          await fetchDancers(bikiniBaristaClubs.map(c => c.id))
          setLoading(false)
        },
        async () => {
          const featured = bikiniBaristaClubs.filter(c => c.is_featured)
          const standard = bikiniBaristaClubs.filter(c => !c.is_featured)
          const shuffled = [...standard].sort(() => Math.random() - 0.5)
          const remaining = Math.max(0, 15 - featured.length)
          const result = [...featured, ...shuffled.slice(0, remaining)]
          setClubs(result)
          await fetchDancers(bikiniBaristaClubs.map(c => c.id))
          setLoading(false)
        }
      )
    } else {
      const featured = bikiniBaristaClubs.filter(c => c.is_featured)
      const standard = bikiniBaristaClubs.filter(c => !c.is_featured)
      const shuffled = [...standard].sort(() => Math.random() - 0.5)
      const remaining = Math.max(0, 15 - featured.length)
      const result = [...featured, ...shuffled.slice(0, remaining)]
      setClubs(result)
      await fetchDancers(bikiniBaristaClubs.map(c => c.id))
      setLoading(false)
    }
  }

  async function fetchDancers(clubIds: string[]) {
    if (clubIds.length === 0) return
    const { data } = await supabase
      .from('dancers')
      .select('*')
      .order('is_featured', { ascending: false })
    const relevant = (data || []).filter(d =>
      d.club_ids && d.club_ids.some((id: string) => clubIds.includes(id))
    )
    setDancers(relevant)
  }

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img src="/logo-pins.png" alt="TittyMaps" onClick={() => window.location.href = '/'} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 16, cursor: 'pointer' }} />
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
      </div>

      <div style={{ padding: '20px 16px 8px' }}>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Bikini Baristas Near Me</h1>
        <p style={{ color: '#8890c0', fontSize: 14, margin: '0 0 4px' }}>
          Find bikini barista coffee shops near you. Browse locations where baristas serve in bikinis.
        </p>
      </div>

      <div style={{ padding: '8px 16px' }}>
        {loading ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center' }}>
            <div style={{ color: '#8890c0', fontSize: 14 }}>Finding bikini baristas near you...</div>
          </div>
        ) : clubs.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🧋</div>
            <div style={{ color: '#8890c0', fontSize: 14, marginBottom: 4 }}>No bikini barista locations listed yet in your area</div>
            <a href="/" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>Browse all clubs on the map →</a>
          </div>
        ) : (
          <>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              {clubs.length} bikini barista {clubs.length === 1 ? 'location' : 'locations'} {locationName}
            </div>
            {clubs.map(club => (
              <div key={club.id}
                onClick={() => window.location.href = `/clubs/${club.id}`}
                style={{
                  background: '#131629', borderRadius: 12, marginBottom: 8, padding: 12,
                  border: `1px solid ${club.is_featured ? '#FFD700' : '#1e2140'}`,
                  display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer'
                }}>
                <div style={{ width: 48, height: 48, borderRadius: 10, background: club.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                  {club.photo_url
                    ? <img src={club.photo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : '🧋'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{club.name}</div>
                  <div style={{ fontSize: 11, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8890c0' }}>{club.city}, {club.state}</span>
                    {userLocation && club.distance && (
                      <span style={{ color: '#8890c0' }}>{club.distance.toFixed(1)} mi</span>
                    )}
                  </div>
                  {club.address && <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 6 }}>{club.address}</div>}
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                    <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>👙 Bikini</span>
                    <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>🧋 Cafe</span>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {dancers.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Baristas</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {dancers.map(dancer => {
                const photo = dancer.photo_urls?.[0] || dancer.photo_url
                return (
                  <div key={dancer.id}
                    onClick={() => window.location.href = `/dancers/${dancer.id}`}
                    style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#131629', border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}` }}>
                    {photo
                      ? <img src={photo} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🧋</div>
                    }
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '24px 12px 12px' }}>
                      <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>{dancer.stage_name}</div>
                      {dancer.is_featured && <div style={{ color: '#FFD700', fontSize: 10 }}>★ Featured</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
