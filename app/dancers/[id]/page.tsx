'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const FANSLY_REF = 'tittymaps'

export default function DancerProfile() {
  const { id } = useParams()
  const router = useRouter()
  const [dancer, setDancer] = useState<any>(null)
  const [clubs, setClubs] = useState<any[]>([])
  const [fullPhotoIndex, setFullPhotoIndex] = useState<number | null>(null)
  const [touchStartX, setTouchStartX] = useState(0)

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

  const fanslyUrl = dancer.fansly_url || `https://fansly.com/tittymaps?r=${FANSLY_REF}`

  const allPhotos: string[] = dancer.photo_urls && dancer.photo_urls.length > 0
    ? dancer.photo_urls
    : dancer.photo_url ? [dancer.photo_url] : []

  const isBikiniBarista = clubs.length > 0 && clubs.every(c => c.nude_level === 'bikini' && c.bar_type === 'cafe')
  const roleLabel = isBikiniBarista ? 'Barista' : 'Dancer'

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: dancer.fansly_url ? 90 : 40 }}>

      {/* Lightbox */}
      {fullPhotoIndex !== null && allPhotos.length > 0 && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onTouchStart={e => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={e => {
            const diff = touchStartX - e.changedTouches[0].clientX
            if (Math.abs(diff) > 50) {
              if (diff > 0) setFullPhotoIndex(prev => prev !== null ? Math.min(prev + 1, allPhotos.length - 1) : null)
              else setFullPhotoIndex(prev => prev !== null ? Math.max(prev - 1, 0) : null)
            }
          }}>
          <img src={allPhotos[fullPhotoIndex]} alt="full size" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setFullPhotoIndex(null)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', width: 36, height: 36, fontSize: 16, cursor: 'pointer' }}>
            ✕
          </button>
          {fullPhotoIndex > 0 && (
            <button onClick={() => setFullPhotoIndex(prev => prev !== null ? prev - 1 : null)}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: 'white', width: 40, height: 40, fontSize: 24, cursor: 'pointer' }}>
              ‹
            </button>
          )}
          {fullPhotoIndex < allPhotos.length - 1 && (
            <button onClick={() => setFullPhotoIndex(prev => prev !== null ? prev + 1 : null)}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: 'white', width: 40, height: 40, fontSize: 24, cursor: 'pointer' }}>
              ›
            </button>
          )}
          {allPhotos.length > 1 && (
            <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 6 }}>
              {allPhotos.map((_, i) => (
                <div key={i} onClick={() => setFullPhotoIndex(i)}
                  style={{ width: 6, height: 6, borderRadius: '50%', background: i === fullPhotoIndex ? 'white' : 'rgba(255,255,255,0.4)', cursor: 'pointer' }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sticky Fansly CTA */}
      {dancer.fansly_url && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99, background: '#0a0b14', borderTop: '1px solid #FF2D78', padding: '10px 16px' }}>
          <a href={fanslyUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', background: 'linear-gradient(135deg, #FF2D78, #cc0055)', color: 'white', textAlign: 'center', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,45,120,0.4)' }}>
            💋 Subscribe to {dancer.stage_name} on Fansly
          </a>
        </div>
      )}

      {/* Header */}
      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
      </div>

      {/* Profile hero */}
      <div style={{ background: '#131629', borderBottom: '1px solid #1e2140', padding: '28px 16px', textAlign: 'center' }}>
        <div onClick={() => allPhotos.length > 0 && setFullPhotoIndex(0)}
          style={{ width: 90, height: 90, borderRadius: '50%', background: '#2a1a40', border: '3px solid #FF2D78', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38, margin: '0 auto 14px', cursor: allPhotos.length > 0 ? 'pointer' : 'default' }}>
          {allPhotos[0]
            ? <img src={`${allPhotos[0]}?width=200&quality=80`} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : '💃'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
          <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: 0 }}>{dancer.stage_name}</h1>
          {dancer.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
        </div>
        {dancer.fansly_url && (
          <p style={{ color: '#8890c0', fontSize: 13, margin: '6px 0 0', lineHeight: 1.5 }}>
            Subscribe for exclusive photos and videos not shown here 🔥
          </p>
        )}
      </div>

      <div style={{ padding: '16px' }}>

        {/* Photo gallery — shown first to engage before CTA */}
        {allPhotos.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Photos</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
              {allPhotos.map((url, i) => (
                <div key={i} onClick={() => setFullPhotoIndex(i)}
                  style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', cursor: 'pointer', background: '#131629' }}>
                  <img src={`${url}?width=250&quality=70`} alt={`${dancer.stage_name} photo ${i + 1}`} width={250} height={250} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>

            {/* CTA after photos */}
            {dancer.fansly_url && (
              <div style={{ background: 'linear-gradient(135deg, #1a0d2e, #0d1a2e)', borderRadius: 14, border: '1px solid #FF2D78', padding: '16px', textAlign: 'center' }}>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Want to see more? 🔥</div>
                <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 12 }}>
                  {dancer.stage_name} posts exclusive content on Fansly that isn&apos;t available anywhere else.
                </div>
                <a href={fanslyUrl} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'block', background: 'linear-gradient(135deg, #FF2D78, #cc0055)', color: 'white', textAlign: 'center', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,45,120,0.3)' }}>
                  🔥 See Exclusive Content on Fansly
                </a>
              </div>
            )}
          </div>
        )}

        {/* Fansly button if no photos */}
        {allPhotos.length === 0 && dancer.fansly_url && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #1a0d2e, #0d1a2e)', borderRadius: 14, border: '1px solid #FF2D78', padding: '16px', textAlign: 'center', marginBottom: 12 }}>
              <div style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Find {dancer.stage_name} on Fansly 🔥</div>
              <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 12 }}>Subscribe for exclusive photos and videos.</div>
              <a href={fanslyUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', background: 'linear-gradient(135deg, #FF2D78, #cc0055)', color: 'white', textAlign: 'center', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,45,120,0.3)' }}>
                🔥 See Exclusive Content on Fansly
              </a>
            </div>
          </div>
        )}

        {/* Clubs */}
        {clubs.length > 0 && (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16, marginBottom: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Ask For {dancer.stage_name} At</div>
            {clubs.map(club => (
              <div key={club.id} onClick={() => window.location.href = `/clubs/${club.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2140', cursor: 'pointer' }}>
                <span style={{ color: 'white', fontSize: 14 }}>{club.name}</span>
                <span style={{ color: '#8890c0', fontSize: 12 }}>{club.city}, {club.state} →</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA for engaged scrollers */}
        {dancer.fansly_url && (
          <div style={{ background: '#131629', borderRadius: 14, border: '1px solid #1e2140', padding: '16px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 10 }}>
              Support {dancer.stage_name} by subscribing to her Fansly — exclusive content, direct access, and more 💜
            </div>
            <a href={fanslyUrl} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', background: 'linear-gradient(135deg, #FF2D78, #cc0055)', color: 'white', textAlign: 'center', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,45,120,0.3)' }}>
              💋 Subscribe to {dancer.stage_name} on Fansly
            </a>
          </div>
        )}

      </div>
    </div>
  )
}
