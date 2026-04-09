'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const FANSLY_REF = 'YOUR_REF_CODE_HERE'

export default function DancerProfile() {
  const { id } = useParams()
  const router = useRouter()
  const [dancer, setDancer] = useState<any>(null)
  const [clubs, setClubs] = useState<any[]>([])
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchDancer()
  }, [id])

  async function fetchDancer() {
    const { data } = await supabase.from('dancers').select('*').eq('id', id).single()
    setDancer(data)
    if (data?.club_ids?.length) {
      const { data: clubData } = await supabase.from('clubs').select('id, name, city, state').in('id', data.club_ids)
      setClubs(clubData || [])
    }
  }

  if (!dancer) return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#FF2D78', fontSize: 16 }}>Loading...</div>
    </div>
  )

  const fanslyUrl = `https://fansly.com/${dancer.fansly_username}?ref=${FANSLY_REF}`
  const allPhotos: string[] = dancer.photo_urls || (dancer.photo_url ? [dancer.photo_url] : [])

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 40 }}>

      {/* Lightbox */}
      {lightboxPhoto && (
        <div onClick={() => setLightboxPhoto(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={lightboxPhoto} alt="full size" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setLightboxPhoto(null)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', width: 36, height: 36, fontSize: 16, cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      )}

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={() => router.back()} style={{ background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#FF2D78', fontWeight: 700, fontSize: 16 }}>Titty</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Maps</span>
          <span style={{ color: '#FFD700', fontSize: 11 }}>.com</span>
        </div>
      </div>

      {/* Profile hero */}
      <div style={{ background: '#131629', borderBottom: '1px solid #1e2140', padding: '28px 16px', textAlign: 'center' }}>
        <div onClick={() => allPhotos[0] && setLightboxPhoto(allPhotos[0])}
          style={{ width: 90, height: 90, borderRadius: '50%', background: '#2a1a40', border: '3px solid #FF2D78', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 14px', cursor: allPhotos[0] ? 'pointer' : 'default' }}>
          {allPhotos[0]
            ? <img src={allPhotos[0]} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '💃'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>{dancer.stage_name}</h1>
          {dancer.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
        </div>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Fansly button */}
        {dancer.fansly_username && (
          <a href={fanslyUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', background: '#FF2D78', color: 'white', textAlign: 'center', padding: '14px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', marginBottom: 16 }}>
            Follow on Fansly
          </a>
        )}

        {/* Photo gallery */}
        {allPhotos.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Photos</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {allPhotos.map((url, i) => (
                <div key={i} onClick={() => setLightboxPhoto(url)}
                  style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: '#131629' }}>
                  <img src={url} alt={`photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clubs */}
        {clubs.length > 0 && (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Performs At</div>
            {clubs.map(club => (
              <div key={club.id} onClick={() => window.location.href = `/clubs/${club.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2140', cursor: 'pointer' }}>
                <span style={{ color: 'white', fontSize: 14 }}>{club.name}</span>
                <span style={{ color: '#8890c0', fontSize: 12 }}>{club.city}, {club.state} →</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
