'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function Dancers() {
  const [dancers, setDancers] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [suggestions, setSuggestions] = useState<{ label: string, type: string }[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filtered, setFiltered] = useState<any[]>([])
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchDancers()
    fetchClubs()
  }, [])

  useEffect(() => {
    if (search === '') {
      setFiltered(dancers)
      setSuggestions([])
      return
    }
    buildSuggestions(search)
    filterDancers(search)
  }, [search, dancers, clubs])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  async function fetchDancers() {
    const { data } = await supabase
      .from('dancers')
      .select('*')
      .order('is_featured', { ascending: false })
    setDancers(data || [])
    setFiltered(data || [])
  }

  async function fetchClubs() {
    const { data } = await supabase.from('clubs').select('id, name, city, state')
    setClubs(data || [])
  }

  function buildSuggestions(query: string) {
    const q = query.toLowerCase()
    const results: { label: string, type: string }[] = []
    const seen = new Set<string>()

    dancers.forEach(d => {
      if (d.stage_name.toLowerCase().includes(q)) {
        const key = `name:${d.stage_name}`
        if (!seen.has(key)) { seen.add(key); results.push({ label: d.stage_name, type: 'dancer' }) }
      }
    })

    clubs.forEach(c => {
      if (c.name.toLowerCase().includes(q)) {
        const dancersAtClub = dancers.filter(d => d.club_ids?.includes(c.id))
        if (dancersAtClub.length > 0) {
          const key = `club:${c.name}`
          if (!seen.has(key)) { seen.add(key); results.push({ label: c.name, type: 'club' }) }
        }
      }
      if (c.city.toLowerCase().includes(q)) {
        const key = `city:${c.city}`
        if (!seen.has(key)) { seen.add(key); results.push({ label: c.city, type: 'city' }) }
      }
      if (c.state.toLowerCase().includes(q)) {
        const key = `state:${c.state}`
        if (!seen.has(key)) { seen.add(key); results.push({ label: c.state, type: 'state' }) }
      }
    })

    setSuggestions(results.slice(0, 8))
  }

  function filterDancers(query: string) {
    const q = query.toLowerCase()
    const clubMatches = clubs
      .filter(c =>
        c.name.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.state.toLowerCase().includes(q)
      )
      .map(c => c.id)

    const result = dancers.filter(d =>
      d.stage_name.toLowerCase().includes(q) ||
      d.club_ids?.some((id: string) => clubMatches.includes(id))
    )
    setFiltered(result)
  }

  function handleSuggestionClick(suggestion: { label: string, type: string }) {
    setSearch(suggestion.label)
    setShowSuggestions(false)
  }

  function typeLabel(type: string) {
    if (type === 'dancer') return '💃'
    if (type === 'club') return '🏛️'
    if (type === 'city') return '📍'
    if (type === 'state') return '🗺️'
    return ''
  }

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img src="/logo-pins.png" alt="TittyMaps" onClick={() => window.location.href = '/'} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 16, cursor: 'pointer' }} />
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
        <a href="/become-a-dancer"
          style={{ position: 'absolute', right: 16, background: '#FF2D78', color: 'white', borderRadius: 20, padding: '5px 12px', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>
          Get Featured
        </a>
      </div>

      <div style={{ padding: '16px 16px 8px' }}>
        <div ref={searchRef} style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setShowSuggestions(true) }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search dancers, clubs, cities, states..."
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
                <div key={i} onClick={() => handleSuggestionClick(s)}
                  style={{ padding: '10px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: i < suggestions.length - 1 ? '1px solid #1e2140' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1a1d35')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span style={{ fontSize: 16 }}>{typeLabel(s.type)}</span>
                  <div>
                    <div style={{ color: 'white', fontSize: 13 }}>{s.label}</div>
                    <div style={{ color: '#8890c0', fontSize: 11, textTransform: 'capitalize' }}>{s.type}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '8px 16px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
          Dancers & Baristas {search ? `— ${filtered.length} results` : ''}
        </div>

        {filtered.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💃</div>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No dancers found</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {filtered.map(dancer => {
              const photo = dancer.photo_urls?.[0] || dancer.photo_url
              return (
                <div key={dancer.id}
                  onClick={() => window.location.href = `/dancers/${dancer.id}`}
                  style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#131629', border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}` }}>
                  {photo
                    ? <img src={photo} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>💃</div>
                  }
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.85))', padding: '24px 12px 12px' }}>
                    <div style={{ color: 'white', fontSize: 15, fontWeight: 600 }}>{dancer.stage_name}</div>
                    {dancer.is_featured && <div style={{ color: '#FFD700', fontSize: 10 }}>★ Featured</div>}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
