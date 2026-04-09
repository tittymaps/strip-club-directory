'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const FANSLY_REF = 'YOUR_REF_CODE_HERE'

export default function Dancers() {
  const [dancers, setDancers] = useState<any[]>([])

  useEffect(() => {
    fetchDancers()
  }, [])

  async function fetchDancers() {
    const { data } = await supabase
      .from('dancers')
      .select('*')
      .order('is_featured', { ascending: false })
    setDancers(data || [])
  }

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 40 }}>
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

      <div style={{ padding: '16px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Dancers</div>
        {dancers.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💃</div>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No featured dancers yet</div>
          </div>
        ) : (
          dancers.map((dancer) => (
            <div key={dancer.id}
              onClick={() => window.location.href = `/dancers/${dancer.id}`}
              style={{
                background: '#131629', borderRadius: 12, marginBottom: 10, padding: 16,
                border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}`,
                display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer'
              }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#2a1a40', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
              {(dancer.photo_urls?.[0] || dancer.photo_url)
              ? <img src={dancer.photo_urls?.[0] || dancer.photo_url} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '💃'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ color: 'white', fontWeight: 600, fontSize: 16 }}>{dancer.stage_name}</span>
                  {dancer.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                </div>
                <div style={{ color: '#FF2D78', fontSize: 12 }}>View profile →</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
