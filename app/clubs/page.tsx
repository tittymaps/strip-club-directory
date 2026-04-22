'use client'
import { useEffect, useState, useRef } from 'react'
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

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const searchRef = useRef<any>(null)

  useEffect(() => {
    fetchClubs()
  }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchClubs() {
    const { data } = await supabase.from('clubs').select('*').order('is_featured', { ascending: false })
    setClubs(data || [])
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    if (value.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }
    const q = value.toLowerCase()
    const results: any[] = []

    // Match clubs
    clubs.forEach(club => {
      if (club.name.toLowerCase().includes(q)) {
        results.push({ type: 'club', label: club.name, sublabel: `${club.city}, ${STATE_NAMES[club.state] || club.state}`, href: `/clubs/${club.id}`, icon: '🏛️' })
      }
    })

    // Match cities
    const cities = Array.from(new Set(clubs.map(c => c.city))) as string[]
    cities.forEach(city => {
      if (city.toLowerCase().includes(q)) {
        const club = clubs.find(c => c.city === city)
        if (club) {
          results.push({ type: 'city', label: city, sublabel: STATE_NAMES[club.state] || club.state, href: `/states/${club.state.toLowerCase()}/${encodeURIComponent(city)}`, icon: '📍' })
        }
      }
    })

    // Match states
    Object.entries(STATE_NAMES).forEach(([code, name]) => {
      if (name.toLowerCase().includes(q) || code.toLowerCase().includes(q)) {
        if (clubs.some(c => c.state === code)) {
          results.push({ type: 'state', label: name, sublabel: 'View all clubs', href: `/states/${code.toLowerCase()}`, icon: '🗺️' })
        }
      }
    })

    setSuggestions(results.slice(0, 8))
    setShowSuggestions(results.length > 0)
  }

  function handleSuggestionClick(href: string) {
    setShowSuggestions(false)
    window.location.href = href
  }

  const chips = [
    { key: 'all', label: 'All' },
    { key: 'featured', label: '⭐ Featured' },
    { key: 'full_nude', label: '🐱 Full nude' },
    { key: 'topless', label: '🍒 Topless' },
    { key: 'bikini', label: '👙 Bikini' },
    { key: 'full_bar', label: '🍾 Full bar' },
    { key: 'byob', label: '🍺 BYOB' },
    { key: 'cafe', '🧋 Cafe' },
  ]

  const filtered = clubs.filter(c => {
    const matchesSearch = search === '' ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.state.toLowerCase().includes(search.toLowerCase())
   const matchesFilter =
      filter === 'all' ? true :
      filter === 'full_nude' ? c.nude_level === 'full_nude' :
      filter === 'topless' ? c.nude_level === 'topless' :
      filter === 'bikini' ? c.nude_level === 'bikini' :
      filter === 'full_bar' ? c.bar_type === 'full_bar' :
      filter === 'byob' ? c.bar_type === 'byob' :
      filter === 'cafe' ? c.bar_type === 'cafe' :
      filter === 'featured' ? c.is_featured : true
    return matchesSearch && matchesFilter
  })

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

      {/* Search with autocomplete */}
      <div style={{ padding: '12px 16px 0', position: 'relative' }} ref={searchRef}>
        <input
          value={search}
          onChange={e => handleSearchChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Search clubs, cities, or states..."
          style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: showSuggestions ? '10px 10px 0 0' : 10, padding: '11px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }}
        />
        {showSuggestions && (
          <div style={{ position: 'absolute', top: '100%', left: 16, right: 16, background: '#131629', border: '1px solid #1e2140', borderTop: 'none', borderRadius: '0 0 10px 10px', zIndex: 50, overflow: 'hidden' }}>
            {suggestions.map((s, i) => (
              <div key={i} onClick={() => handleSuggestionClick(s.href)}
                style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', borderTop: i > 0 ? '1px solid #1e2140' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1a1d35')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <span style={{ fontSize: 16 }}>{s.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 500 }}>{s.label}</div>
                  <div style={{ color: '#8890c0', fontSize: 11 }}>{s.sublabel}</div>
                </div>
                <span style={{ color: '#3a3d60', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1 }}>{s.type}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '10px 12px', display: 'flex', gap: 8, overflowX: 'auto' }}>
        {chips.map(c => (
          <button key={c.key} onClick={() => setFilter(c.key)}
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

      <div style={{ color: '#8890c0', fontSize: 12, padding: '4px 16px 8px' }}>
        {filtered.length} {filtered.length === 1 ? 'club' : 'clubs'} found
      </div>

      <div style={{ padding: '0 16px' }}>
        {filtered.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No clubs found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {filtered.map(club => (
              <div key={club.id}
                onClick={() => window.location.href = `/clubs/${club.id}`}
                style={{
                  borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
                  position: 'relative', aspectRatio: '1',
                  background: '#131629',
                  border: `1px solid ${club.is_featured ? '#FFD700' : '#1e2140'}`
                }}>
                {club.photo_url
                  ? <img src={club.photo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, background: club.is_featured ? '#1a1200' : '#131629' }}>
                      {club.is_featured ? '🌟' : '💜'}
                    </div>
                }
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{club.name}</div>
                  <div style={{ color: '#8890c0', fontSize: 10, marginBottom: 5 }}>{club.city}, {STATE_NAMES[club.state] || club.state}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,45,120,0.2)', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '1px 6px', fontSize: 9 }}>
                      {club.nude_level === 'full_nude' ? '🐱 Full nude' : club.nude_level === 'bikini' ? '👙 Bikini' : '🍒 Topless'}
                    </span>
                    {club.bar_type !== 'none' && (
                <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                {club.bar_type === 'full_bar' ? '🍾 Full bar' : club.bar_type === 'cafe' ? '🧋 Cafe' : '🍺 BYOB'}
                </span>
               )}
                  </div>
                </div>
                {club.is_featured && (
                  <div style={{ position: 'absolute', top: 8, right: 8, background: '#FFD700', color: '#0D0F1E', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 700 }}>
                    ★ Featured
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
