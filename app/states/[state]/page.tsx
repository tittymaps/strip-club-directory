'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams } from 'next/navigation'

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

export default function StatePage() {
  const { state } = useParams()
  const stateCode = (state as string).toUpperCase()
  const stateName = STATE_NAMES[stateCode] || stateCode
  const [clubs, setClubs] = useState<any[]>([])
  const [dancers, setDancers] = useState<any[]>([])
  const [cities, setCities] = useState<string[]>([])
  const [selectedCity, setSelectedCity] = useState('all')

  useEffect(() => {
    fetchData()
  }, [stateCode])

  async function fetchData() {
    const { data: clubData } = await supabase
      .from('clubs')
      .select('*')
      .eq('state', stateCode)
      .order('is_featured', { ascending: false })
    setClubs(clubData || [])
    const uniqueCities = Array.from(new Set((clubData || []).map((c: any) => c.city))).sort() as string[]
    setCities(uniqueCities)

    const { data: dancerData } = await supabase
      .from('dancers')
      .select('*')
      .order('is_featured', { ascending: false })
    setDancers(dancerData || [])
  }

  const filteredClubs = clubs.filter(c => selectedCity === 'all' || c.city === selectedCity)
  const filteredDancers = dancers.filter(d => {
    if (selectedCity === 'all') return true
    return d.club_ids?.some((id: string) =>
      clubs.find(c => c.id === id && c.city === selectedCity)
    )
  })

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
  <button onClick={() => router.back()} style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
  <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
  </div>
      </div>

      <div style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Strip Clubs in {stateName}</h1>
        <p style={{ color: '#8890c0', fontSize: 13, margin: 0 }}>{filteredClubs.length} clubs · {filteredDancers.length} featured dancers</p>
      </div>

      {cities.length > 1 && (
        <div style={{ padding: '8px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
          {['all', ...cities].map(city => (
            <button key={city} onClick={() => setSelectedCity(city)}
              style={{
                borderRadius: 20, padding: '5px 14px', fontSize: 12, whiteSpace: 'nowrap',
                border: '1px solid', cursor: 'pointer', flexShrink: 0,
                background: selectedCity === city ? '#FF2D78' : 'transparent',
                borderColor: selectedCity === city ? '#FF2D78' : '#3a3d60',
                color: selectedCity === city ? 'white' : '#8890c0',
              }}>
              {city === 'all' ? 'All cities' : city}
            </button>
          ))}
        </div>
      )}

      {/* Clubs list */}
      <div style={{ padding: '8px 16px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Clubs</div>
        {filteredClubs.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No clubs found</div>
          </div>
        ) : filteredClubs.map(club => (
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
                : (club.is_featured ? '🌟' : '💜')
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{club.name}</div>
              <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 6 }}>{club.city}, {club.state}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                  {club.nude_level === 'full_nude' ? '🐱 Full nude' : club.nude_level === 'bikini' ? '👙 Bikini' : '🍒 Topless'}
                </span>
                {club.bar_type !== 'none' && (
              <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
             {club.bar_type === 'full_bar' ? '🍾 Full bar' : club.bar_type === 'cafe' ? '🧋 Cafe' : '🍺 BYOB'}
             </span>
             )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dancers grid */}
      {filteredDancers.length > 0 && (
        <div style={{ padding: '8px 16px' }}>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Dancers</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {filteredDancers.map(dancer => {
              const photo = dancer.photo_urls?.[0] || dancer.photo_url
              return (
                <div key={dancer.id}
                  onClick={() => window.location.href = `/dancers/${dancer.id}`}
                  style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#131629', border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}` }}>
                  {photo
                    ? <img src={photo} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
    </div>
  )
}
