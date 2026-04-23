'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

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
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>
      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
  <img src="/logo-pins.png" alt="TittyMaps" onClick={() => window.location.href = '/'} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 16, cursor: 'pointer' }} />
  <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
  <a href="/become-a-dancer"
    style={{ position: 'absolute', right: 16, background: '#FF2D78', color: 'white', borderRadius: 20, padding: '5px 12px', fontSize: 12, textDecoration: 'none', fontWeight: 600 }}>
    Get Featured
  </a>
</div>

      <div style={{ padding: '16px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>
          Dancers
        </div>

        {dancers.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💃</div>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No dancers yet</div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {dancers.map(dancer => {
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
