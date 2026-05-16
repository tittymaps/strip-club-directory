'use client'
import { useEffect, useState, useRef } from 'react'
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

export default function StatesPage() {
  const [states, setStates] = useState<{ code: string, name: string, count: number }[]>([])
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<{ label: string, code: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filtered, setFiltered] = useState<{ code: string, name: string, count: number }[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStates()
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (search === '') {
      setFiltered(states)
      setSuggestions([])
      return
    }
    const q = search.toLowerCase()
    const newFiltered = states.filter(s =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    )
    setFiltered(newFiltered)

    const newSuggestions = states
      .filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, 6)
      .map(s => ({ label: `${s.name} (${s.code})`, code: s.code }))
    setSuggestions(newSuggestions)
  }, [search, states])

  async function fetchStates() {
    const { data } = await supabase.from('clubs').select('state')
    if (!data) return
    const counts: Record<string, number> = {}
    data.forEach(c => { if (c.state) counts[c.state] = (counts[c.state] || 0) + 1 })
    const sorted = Object.entries(counts)
      .map(([code, count]) => ({
        code,
        name: STATE_NAMES[code] || code,
        count
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
    setStates(sorted)
    setFiltered(sorted)
  }

  function handleSuggestionClick(code: string) {
    window.location.href = `/states/${code.toLowerCase()}`
  }

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img src="/logo-pins.png" alt="TittyMaps" onClick={() => window.location.href = '/'} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 16, cursor: 'pointer' }} />
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
        <ProfileButton />
      </div>

      <div style={{ padding: '16px 16px 8px' }}>
        <div ref={searchRef} style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search states..."
            style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }}
          />
          {search.length > 0 && (
            <button onClick={() => { setSearch(''); setShowSuggestions(false) }}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#8890c0', fontSize: 16, cursor: 'pointer' }}>
              ✕
            </button>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#131629', border: '1px solid #1e2140', borderRadius: 10, marginTop: 4, zIndex: 100, overflow: 'hidden' }}>
              {suggestions.map((s, i) => (
                <div key={i} onClick={() => handleSuggestionClick(s.code)}
                  style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i < suggestions.length - 1 ? '1px solid #1e2140' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a1d35')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{ fontSize: 16 }}>🗺️</span>
                  <div style={{ color: 'white', fontSize: 13 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
          {search ? `${filtered.length} states found` : `${states.length} states`}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center' }}>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No states found</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.map(({ code, name, count }) => (
              <div key={code}
                onClick={() => window.location.href = `/states/${code.toLowerCase()}`}
                style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#FF2D78')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#1e2140')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#1a1d35', border: '1px solid #2a2d50', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#FF2D78', fontSize: 13, fontWeight: 700 }}>{code}</span>
                  </div>
                  <div>
                    <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>Strip Clubs in {name}</div>
                    <div style={{ color: '#8890c0', fontSize: 11 }}>{count} {count === 1 ? 'club' : 'clubs'}</div>
                  </div>
                </div>
                <span style={{ color: '#FF2D78', fontSize: 16 }}>→</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
