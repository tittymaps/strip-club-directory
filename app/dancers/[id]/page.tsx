'use client'
import { useEffect, useState, useRef } from 'react'
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
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const touchStartX = useRef(0)

  useEffect(() => {
    if (id) fetchDancer()
  }, [id])

  useEffect(() => {
    if (slideDirection) {
      const timer = setTimeout(() => {
        setSlideDirection(null)
        setIsAnimating(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [slideDirection])

  async function fetchDancer() {
    const { data } = await supabase.from('dancers').select('*').eq('id', id).single()
    setDancer(data)
    if (data?.club_ids?.length) {
      const { data: clubData } = await supabase.from('clubs').select('id, name, city, state, nude_level, bar_type').in('id', data.club_ids)
      setClubs(clubData || [])
    }
  }

  function goToPhoto(newIndex: number, direction: 'left' | 'right') {
    if (isAnimating) return
    setIsAnimating(true)
    setSlideDirection(direction)
    setTimeout(() => {
      setFullPhotoIndex(newIndex)
    }, 150)
  }

  if (!dancer) return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#FF2D78', fontSize: 16 }}>Loading...</div>
    </div>
  )

  const fanslyUrl = dancer.is_featured && dancer.fansly_url
    ? dancer.fansly_url
    : `https://fansly.com/tittymaps?r=${FANSLY_REF}`

  const allPhotos: string[] = dancer.photo_urls && dancer.photo_urls.length > 0
    ? dancer.photo_urls
    : dancer.photo_url ? [dancer.photo_url] : []

  const isBikiniBarista = clubs.length > 0 && clubs.every((c: any) => c.nude_level === 'bikini' && c.bar_type === 'cafe')
  const roleLabel = isBikiniBarista ? 'Barista' : 'Dancer'

  const slideStyle = slideDirection === 'left'
    ? { transform: 'translateX(-60px)', opacity: 0, transition: 'transform 0.15s ease, opacity 0.15s ease' }
    : slideDirection === 'right'
    ? { transform: 'translateX(60px)', opacity: 0, transition: 'transform 0.15s ease, opacity 0.15s ease' }
    : { transform: 'translateX(0)', opacity: 1, transition: 'transform 0.15s ease, opacity 0.15s ease' }

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 90 }}>

      {/* Lightbox */}
      {fullPhotoIndex !== null && allPhotos.length > 0 && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.97)', zIndex: 1000, overflow: 'hidden' }}
          onTouchStart={e => {
            touchStartX.current = e.touches[0].clientX
          }}
          onTouchMove={e => {
            const delta = e.touches[0].clientX - touchStartX.current
            const container = document.getElementById('lightbox-track')
            if (container) container.style.transform = `translateX(calc(-${fullPhotoIndex * 100}% + ${delta}px))`
          }}
          onTouchEnd={e => {
            const diff = touchStartX.current - e.changedTouches[0].clientX
            const container = document.getElementById('lightbox-track')
            if (Math.abs(diff) > 60) {
              const newIndex = diff > 0
                ? Math.min(fullPhotoIndex + 1, allPhotos.length - 1)
                : Math.max(fullPhotoIndex - 1, 0)
              setFullPhotoIndex(newIndex)
              if (container) {
                container.style.transition = 'transform 0.25s ease'
                container.style.transform = `translateX(-${newIndex * 100}%)`
                setTimeout(() => { if (container) container.style.transition = '' }, 250)
              }
            } else {
              if (container) {
                container.style.transition = 'transform 0.25s ease'
                container.style.transform = `translateX(-${fullPhotoIndex * 100}%)`
                setTimeout(() => { if (container) container.style.transition = '' }, 250)
              }
            }
          }}>

          {/* Full-width photo track */}
          <div
            id="lightbox-track"
            style={{
              display: 'flex',
              width: `${allPhotos.length * 100}%`,
              height: '100%',
              transform: `translateX(-${fullPhotoIndex * 100 / allPhotos.length}%)`,
              willChange: 'transform',
            }}>
            {allPhotos.map((url, i) => (
              <div key={i}
                style={{ width: `${100 / allPhotos.length}%`, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box', flexShrink: 0 }}
                onClick={() => setFullPhotoIndex(null)}>
                <img src={url} alt={`photo ${i + 1}`} style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain', cursor: 'pointer', userSelect: 'none', pointerEvents: 'none' }} />
              </div>
            ))}
          </div>

          {/* Close button */}
          <button onClick={() => setFullPhotoIndex(null)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: 'white', width: 40, height: 40, fontSize: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            ✕
          </button>

          {/* Prev/Next buttons */}
          {fullPhotoIndex > 0 && (
            <button onClick={() => setFullPhotoIndex(fullPhotoIndex - 1)}
              style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: 'white', width: 44, height: 44, fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ‹
            </button>
          )}
          {fullPhotoIndex < allPhotos.length - 1 && (
            <button onClick={() => setFullPhotoIndex(fullPhotoIndex + 1)}
              style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', color: 'white', width: 44, height: 44, fontSize: 26, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              ›
            </button>
          )}

          {/* Counter */}
          <div style={{ position: 'absolute', top: 20, left: 0, right: 0, textAlign: 'center' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{fullPhotoIndex + 1} / {allPhotos.length}</span>
          </div>

          {/* Dots */}
          {allPhotos.length > 1 && (
            <div style={{ position: 'absolute', bottom: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
              {allPhotos.map((_, i) => (
                <div key={i} onClick={() => setFullPhotoIndex(i)}
                  style={{ width: i === fullPhotoIndex ? 20 : 6, height: 6, borderRadius: 3, background: i === fullPhotoIndex ? '#FF2D78' : 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'width 0.2s ease, background 0.2s ease' }} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Sticky bottom CTA */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 99, background: '#0a0b14', borderTop: '1px solid #FF2D78', padding: '10px 16px' }}>
        <a href={fanslyUrl} target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', background: 'linear-gradient(135deg, #FF2D78, #cc0055)', color: 'white', textAlign: 'center', padding: '13px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,45,120,0.4)' }}>
          💋 Subscribe to {dancer.stage_name} on Fansly
        </a>
      </div>

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
          {dancer.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured {roleLabel}</span>}
        </div>
        <p style={{ color: '#8890c0', fontSize: 13, margin: '6px 0 0', lineHeight: 1.5 }}>
          Subscribe for exclusive photos and videos not shown here 🔥
        </p>
      </div>

      <div style={{ padding: '16px' }}>

        {/* Photo gallery */}
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

            {/* Mid-page CTA after photos */}
            <div style={{ background: 'linear-gradient(135deg, #1a0d2e, #0d1a2e)', borderRadius: 14, border: '1px solid #FF2D78', padding: '16px', textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Want to see more? 🔥</div>
              <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 12 }}>
                {dancer.is_featured
                  ? `${dancer.stage_name} posts exclusive content on Fansly that isn't available anywhere else.`
                  : `Search for ${dancer.stage_name} on Fansly to find their exclusive content.`}
              </div>
              <a href={fanslyUrl} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', background: 'linear-gradient(135deg, #FF2D78, #cc0055)', color: 'white', textAlign: 'center', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,45,120,0.3)' }}>
                🔥 See Exclusive Content on Fansly
              </a>
            </div>
          </div>
        )}

        {/* CTA when no photos */}
        {allPhotos.length === 0 && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ background: 'linear-gradient(135deg, #1a0d2e, #0d1a2e)', borderRadius: 14, border: '1px solid #FF2D78', padding: '16px', textAlign: 'center' }}>
              <div style={{ color: 'white', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>Want to see more? 🔥</div>
              <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 12 }}>
                {dancer.is_featured
                  ? 'Subscribe for exclusive photos and videos.'
                  : `Search for ${dancer.stage_name} on Fansly to find their exclusive content.`}
              </div>
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
            {clubs.map((club: any) => (
              <div key={club.id} onClick={() => window.location.href = `/clubs/${club.id}`}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1e2140', cursor: 'pointer' }}>
                <span style={{ color: 'white', fontSize: 14 }}>{club.name}</span>
                <span style={{ color: '#8890c0', fontSize: 12 }}>{club.city}, {club.state} →</span>
              </div>
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div style={{ background: '#131629', borderRadius: 14, border: '1px solid #1e2140', padding: '16px', textAlign: 'center', marginBottom: 16 }}>
          <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 10 }}>
            {dancer.is_featured
              ? `Support ${dancer.stage_name} by subscribing to her Fansly — exclusive content, direct access, and more 💜`
              : `Find ${dancer.stage_name} on Fansly — search their name after clicking below 💜`}
          </div>
          <a href={fanslyUrl} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', background: 'linear-gradient(135deg, #FF2D78, #cc0055)', color: 'white', textAlign: 'center', padding: '13px', borderRadius: 10, fontSize: 15, fontWeight: 700, textDecoration: 'none', boxShadow: '0 4px 20px rgba(255,45,120,0.3)' }}>
            💋 Subscribe to {dancer.stage_name} on Fansly
          </a>
        </div>

      </div>
    </div>
  )
}
