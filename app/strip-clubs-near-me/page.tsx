'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

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
  const [states, setStates] = useState<{ state: string, count: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState('')

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
    const { data } = await supabase.from('clubs').select('*')
    if (!data) { setLoading(false); return }
    const sorted = data
      .filter(c => c.latitude && c.longitude)
      .map(c => ({ ...c, distance: getDistance(lat, lon, c.latitude, c.longitude) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 10)
    setClubs(sorted)
    if (sorted.length > 0) {
      setLocationName(`near ${sorted[0].city}, ${sorted[0].state}`)
    }
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

      <div style={{ padding: '20px 16px 8px' }}>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Strip Clubs Near Me</h1>
        <p style={{ color: '#8890c0', fontSize: 14, margin: '0 0 4px' }}>
          Find strip clubs and gentlemens clubs near your location. Browse full nude and topless clubs with full bar or BYOB.
        </p>
      </div>

      {/* Nearby clubs */}
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
                    ? <img src={club.photo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
                    <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                      {club.bar_type === 'full_bar' ? '🍾 Full bar' : club.bar_type === 'cafe' ? '🧋 Cafe' : '🍺 BYOB'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <a href="/" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>View all clubs on the map →</a>
            </div>
          </>
        ) : (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📍</div>
            <div style={{ color: '#8890c0', fontSize: 14, marginBottom: 4 }}>Allow location access to see clubs near you</div>
            <a href="/" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>Or browse on the map →</a>
          </div>
        )}
      </div>

      {/* Browse by state */}
      <div style={{ padding: '8px 16px' }}>
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
