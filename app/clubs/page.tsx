'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function ClubsPage() {
  const [clubs, setClubs] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchClubs()
  }, [])

  async function fetchClubs() {
    const { data } = await supabase.from('clubs').select('*').order('is_featured', { ascending: false })
    setClubs(data || [])
  }

  const chips = [
    { key: 'all', label: 'All' },
    { key: 'full_nude', label: '🐱 Full nude' },
    { key: 'topless', label: '👙 Topless' },
    { key: 'full_bar', label: '🍾 Full bar' },
    { key: 'byob', label: '🍺 BYOB' },
    { key: 'featured', label: '🌟 Featured' },
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
      filter === 'full_bar' ? c.bar_type === 'full_bar' :
      filter === 'byob' ? c.bar_type === 'byob' :
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

      <div style={{ padding: '12px 16px 0' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or city..."
          style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '11px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }}
        />
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

      <div style={{ color: '#8890c0', fontSize: 12, padding: '4px 16px 12px' }}>
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

                {/* Club icon / placeholder */}
                {club.photo_url
                 ? <img src={club.photo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                 : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, background: club.is_featured ? '#1a1200' : '#131629' }}>
                 {club.is_featured ? '🌟' : '💜'}
                 </div>
                 }

                {/* Overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                  <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{club.name}</div>
                  <div style={{ fontSize: 12, marginBottom: 8 }}>
                   <span onClick={(e) => { e.stopPropagation(); window.location.href=`/states/${club.state.toLowerCase()}/${encodeURIComponent(club.city)}` }} style={{ color: '#7ab8ff', cursor: 'pointer' }}>{club.city}</span>
                   <span style={{ color: '#8890c0' }}>, </span>
                   <span onClick={(e) => { e.stopPropagation(); window.location.href=`/states/${club.state.toLowerCase()}` }} style={{ color: '#7ab8ff', cursor: 'pointer' }}>{club.state}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <span style={{ background: 'rgba(255,45,120,0.2)', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '1px 6px', fontSize: 9 }}>
                      {club.nude_level === 'full_nude' ? 'Full nude' : 'Topless'}
                    </span>
                    <span style={{ background: 'rgba(26,42,61,0.8)', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '1px 6px', fontSize: 9 }}>
                      {club.bar_type === 'full_bar' ? 'Full bar' : 'BYOB'}
                    </span>
                  </div>
                </div>

                {/* Featured badge top right */}
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
