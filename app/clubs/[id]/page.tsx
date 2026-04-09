'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function ClubDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [club, setClub] = useState<any>(null)
  const [dancers, setDancers] = useState<any[]>([])
  const [fullPhoto, setFullPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchClub()
  }, [id])

  async function fetchClub() {
  const { data } = await supabase
    .from('clubs')
    .select('*')
    .eq('id', id)
    .single()
  setClub(data)
  if (data) {
    const { data: dancerData } = await supabase
      .from('dancers')
      .select('*')
      .contains('club_ids', [data.id])
    setDancers(dancerData || [])
  }
}

  if (!club) return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#FF2D78', fontSize: 16 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 40 }}>
      
      {fullPhoto && (
    <div onClick={() => setFullPhoto(null)}
    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
    <img src={fullPhoto} alt="full size" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
    <button onClick={() => setFullPhoto(null)}
      style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', width: 36, height: 36, fontSize: 16, cursor: 'pointer' }}>
      ✕
    </button>
  </div>
)}

      {/* Header */}
      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
          ← Back
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#FF2D78', fontWeight: 700, fontSize: 16 }}>Titty</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Maps</span>
          <span style={{ color: '#FFD700', fontSize: 11 }}>.com</span>
        </div>
      </div>

      {/* Club hero */}
      <div style={{ background: '#131629', borderBottom: '1px solid #1e2140', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 14, background: club.is_featured ? '#2a1f00' : '#1a1530', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
            {club.is_featured ? '🌟' : '💜'}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: 0 }}>{club.name}</h1>
              {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
            </div>
            <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 10 }}>{club.city}, {club.state}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
                {club.nude_level === 'full_nude' ? 'Full nude' : 'Topless'}
              </span>
              <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
                {club.bar_type === 'full_bar' ? 'Full bar' : 'BYOB'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {/* Cover charge */}
        {club.cover_charge && (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16, marginTop: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Cover Charge</div>
            <div style={{ color: 'white', fontSize: 15 }}>💵 {club.cover_charge}</div>
          </div>
        )}

        {/* Hours */}
        {club.hours && (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16, marginTop: 12 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Hours</div>
            {DAYS.map(day => (
              <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2140' }}>
                <span style={{ color: '#8890c0', fontSize: 13 }}>{day}</span>
                <span style={{ color: club.hours[day] === 'Closed' ? '#ff4444' : '#7aff9a', fontSize: 13 }}>
                  {club.hours[day] || 'Closed'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Featured dancers */}
        <div style={{ marginTop: 12 }}>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Dancers</div>
          {dancers.length === 0 ? (
            <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 20, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💃</div>
              <div style={{ color: '#8890c0', fontSize: 13 }}>No featured dancers yet</div>
              <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Dancers can be featured here through our affiliate program</div>
            </div>
          ) : (
            dancers.map(dancer => (
  <div key={dancer.id}
    onClick={() => window.location.href = `/dancers/${dancer.id}`}
    style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 12, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
    <div style={{ width: 56, height: 56, borderRadius: 10, background: '#2a1a40', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0, cursor: 'pointer' }}
  onClick={(e) => { e.stopPropagation(); setFullPhoto((dancer.photo_urls?.[0] || dancer.photo_url) || null) }}>
  {(dancer.photo_urls?.[0] || dancer.photo_url)
    ? <img src={dancer.photo_urls?.[0] || dancer.photo_url} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : '💃'}
</div>
    <div>
      <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{dancer.stage_name}</div>
      <div style={{ color: '#FF2D78', fontSize: 11 }}>★ Featured · View profile →</div>
    </div>
  </div>
))
          )}
        </div>

      </div>
    </div>
  )
}
