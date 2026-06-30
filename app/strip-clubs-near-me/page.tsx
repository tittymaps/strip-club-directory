'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import ProfileButton from '../components/ProfileButton'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'Washington D.C.'
}

export default function StripClubsNearMe() {
  const [clubs, setClubs] = useState<any[]>([])
  const [dancers, setDancers] = useState<any[]>([])
  const [states, setStates] = useState<{ state: string, count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState('')
  const [nearCity, setNearCity] = useState('')
  const [nearState, setNearState] = useState('')

  useEffect(() => {
    fetchStates()
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => fetchNearbyClubs(pos.coords.latitude, pos.coords.longitude),
        () => setLoading(false)
      )
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchNearbyClubs(lat: number, lon: number) {
    const [{ data: clubData }, { data: dancerData }] = await Promise.all([
      supabase.from('clubs').select('*'),
      supabase.from('dancers').select('*').order('is_featured', { ascending: false })
    ])

    if (!clubData) { setLoading(false); return }

    const sorted = clubData
      .filter(c => c.latitude && c.longitude)
      .map(c => ({ ...c, distance: getDistance(lat, lon, c.latitude, c.longitude) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)

    setClubs(sorted)

    if (sorted.length > 0) {
      setLocationName(`near ${sorted[0].city}, ${sorted[0].state}`)
      setNearCity(sorted[0].city)
      setNearState(sorted[0].state)
    }

    const clubIds = sorted.map(c => c.id)
    const nearbyDancers = (dancerData || []).filter((d: any) =>
      d.club_ids?.some((id: string) => clubIds.includes(id))
    )
    setDancers(nearbyDancers)
    setLoading(false)
  }

  async function fetchStates() {
    const { data } = await supabase.from('clubs').select('state')
    if (!data) return
    const counts: Record<string, number> = {}
    data.forEach(c => { if (c.state) counts[c.state] = (counts[c.state] || 0) + 1 })
    const sorted = Object.entries(counts)
      .map(([state, count]) => ({ state, count }))
      .sort((a, b) => {
        const nameA = STATE_NAMES[a.state] || a.state
        const nameB = STATE_NAMES[b.state] || b.state
        return nameA.localeCompare(nameB)
      })
    setStates(sorted)
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

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img src="/logo-pins.png" alt="TittyMaps" onClick={() => window.location.href = '/'} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 16, cursor: 'pointer' }} />
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
        <ProfileButton />
      </div>

      <div style={{ padding: '20px 16px 8px' }}>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Strip Clubs Near Me</h1>
        <p style={{ color: '#8890c0', fontSize: 14, margin: 0 }}>
          Find strip clubs and gentlemens clubs near your location. Browse full nude and topless clubs with full bar or BYOB.
        </p>
      </div>

      <div style={{ padding: '8px 16px' }}>
        {loading ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center' }}>
            <div style={{ color: '#8890c0', fontSize: 14 }}>Finding clubs near you...</div>
          </div>
        ) : clubs.length > 0 ? (
          <>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
              Closest clubs {locationName}
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
                    ? <img src={`${club.photo_url}?width=250&quality=70`} alt={club.name} width={48} height={48} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (club.is_featured ? '🌟' : '💜')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{club.name}</div>
                  <div style={{ fontSize: 11, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#8890c0' }}>{club.city}, {club.state}</span>
                    <span style={{ color: '#8890c0' }}>{club.distance.toFixed(1)} mi</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
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
          </>
        ) : (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
            <div style={{ color: '#8890c0', fontSize: 14, marginBottom: 4 }}>Allow location access to see clubs near you</div>
            <a href="/" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>Or browse on the map →</a>
          </div>
        )}
      </div>

      {dancers.length > 0 && (
        <div style={{ padding: '8px 16px' }}>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Dancers Near You</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {dancers.map((dancer: any) => {
              const photo = dancer.photo_urls?.[0] || dancer.photo_url
              return (
                <div key={dancer.id}
                  onClick={() => window.location.href = `/dancers/${dancer.id}`}
                  style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#131629', border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}` }}>
                  {photo
                    ? <img src={`${photo}?width=250&quality=70`} alt={dancer.stage_name} loading="lazy" width={250} height={333} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>💃</div>
                  }
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{dancer.stage_name}</div>
                    {dancer.is_featured && <div style={{ color: '#FFD700', fontSize: 10 }}>★ Featured</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ padding: '8px 16px' }}>
        <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 20, marginBottom: 16 }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Browse More</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {nearCity && nearState && (
              <a href={`/strip-clubs-near/${nearCity.toLowerCase().replace(/\s+/g, '-')}-${nearState.toLowerCase()}`} style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ All strip clubs within 50 miles of {nearCity}</a>
            )}
            {nearState && (
              <a href={`/states/${nearState.toLowerCase()}`} style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ All strip clubs in {STATE_NAMES[nearState] || nearState}</a>
            )}
            <a href="/clubs" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Browse all clubs nationwide</a>
            <a href="/states" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Browse by state</a>
            <a href="/" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ View all clubs on the map</a>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px 8px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Browse Strip Clubs by State</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {states.map(({ state, count }) => (
            <div key={state}
              onClick={() => window.location.href = `/states/${state.toLowerCase()}`}
              style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
              <div>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>Strip Clubs in {STATE_NAMES[state] || state}</div>
                <div style={{ color: '#8890c0', fontSize: 11 }}>{count} {count === 1 ? 'club' : 'clubs'}</div>
              </div>
              <span style={{ color: '#FF2D78', fontSize: 16 }}>→</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
