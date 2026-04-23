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

export default function StatesPage() {
  const [states, setStates] = useState<{ state: string, count: number }[]>([])

  useEffect(() => {
    fetchStates()
  }, [])

  async function fetchStates() {
    const { data } = await supabase.from('clubs').select('state')
    if (!data) return
    const counts: Record<string, number> = {}
    data.forEach(c => {
      if (c.state) counts[c.state] = (counts[c.state] || 0) + 1
    })
    const sorted = Object.entries(counts)
  .map(([state, count]) => ({ state, count }))
  .sort((a, b) => {
    const nameA = STATE_NAMES[a.state] || a.state
    const nameB = STATE_NAMES[b.state] || b.state
    return nameA.localeCompare(nameB)
  })
    setStates(sorted)
  }

  return (
  <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' }}>
    <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <img src="/logo-pins.png" alt="TittyMaps" onClick={() => window.location.href = '/'} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 16, cursor: 'pointer' }} />
      <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
    </div>
    <div style={{ padding: '16px' }}>
      {/* ... rest of content ... */}
    </div>
  </div>   {/* ← this now correctly closes the outer wrapper */}
)

      <div style={{ padding: '16px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Browse by State</div>

        {states.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center' }}>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No clubs listed yet</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {states.map(({ state, count }) => (
              <div key={state}
                onClick={() => window.location.href = `/states/${state.toLowerCase()}`}
                style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                <div>
                  <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>{STATE_NAMES[state] || state}</div>
                  <div style={{ color: '#8890c0', fontSize: 12 }}>{count} {count === 1 ? 'club' : 'clubs'}</div>
                </div>
                <span style={{ color: '#FF2D78', fontSize: 18 }}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
