'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export const revalidate = 0

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function LingerieModelingNearMe() {
  const [clubs, setClubs] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number, lon: number } | null>(null)

  useEffect(() => {
    fetchClubs()
  }, [])

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  async function fetchClubs() {
    const [{ data: clubData }, { data: dancerData }] = await Promise.all([
      supabase.from('clubs').select('*').eq('nude_level', 'full_nude').eq('bar_type', 'none'),
      supabase.from('dancers').select('*').order('is_featured', { ascending: false })
    ])

    const filtered = (clubData || []).filter(c => {
      if (!c.hours) return false
      return Object.values(c.hours).some((h: any) =>
        typeof h === 'string' && h.toLowerCase().includes('24')
      )
    })

    const processClubs = (clubList: any[]) => {
      const clubIds = clubList.map(c => c.id)
      const nearbyModels = (dancerData || []).filter((d: any) =>
        d.club_ids?.some((id: string) => clubIds.includes(id))
      )
      setModels(nearbyModels)
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const userLat = pos.coords.latitude
          const userLon = pos.coords.longitude
          setUserLocation({ lat: userLat, lon: userLon })
          const withDistance = filtered
            .filter(c => c.latitude && c.longitude)
            .map(c => ({ ...c, distance: getDistance(userLat, userLon, c.latitude, c.longitude) }))
            .sort((a, b) => a.distance - b.distance)
          setClubs(withDistance)
          processClubs(withDistance)
        },
        () => {
          const sorted = [...filtered.filter(c => c.is_featured), ...filtered.filter(c => !c.is_featured)]
          setClubs(sorted)
          processClubs(sorted)
        }
      )
    } else {
      const sorted = [...filtered.filter(c => c.is_featured), ...filtered.filter(c => !c.is_featured)]
      setClubs(sorted)
      processClubs(sorted)
    }
  }

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <img src="/logo-pins.png" alt="TittyMaps" onClick={() => window.location.href = '/'} style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', position: 'absolute', left: 16, cursor: 'pointer' }} />
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
      </div>

      <div style={{ background: '#131629', borderBottom: '1px solid #1e2140', padding: '28px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>💋</div>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>Lingerie Modeling Studios Near Me</h1>
        <p style={{ color: '#8890c0', fontSize: 14, maxWidth: 360, margin: '0 auto 16px' }}>
          Browse lingerie modeling studios open 24 hours. Private, full nude, no bar — the real deal.
        </p>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>🐱 Full nude</span>
          <span style={{ background: '#2e1a1a', color: '#ff6b6b', border: '1px solid #ff4444', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>❌ No bar</span>
          <span style={{ background: '#1a2e1a', color: '#7aff9a', border: '1px solid #3acd60', borderRadius: 20, padding: '3px 12px', fontSize: 12 }}>🕐 Open 24hrs</span>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 12 }}>
          {clubs.length} lingerie modeling {clubs.length === 1 ? 'studio' : 'studios'} found
          {userLocation ? ' — sorted by distance' : ''}
        </div>

        {clubs.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💋</div>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No lingerie modeling studios found</div>
          </div>
        ) : clubs.map(club => (
          <div key={club.id}
            onClick={() => window.location.href = `/clubs/${club.id}`}
            style={{ background: '#131629', borderRadius: 12, marginBottom: 10, padding: 14, border: `1px solid ${club.is_featured ? '#FFD700' : '#1e2140'}`, display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 12, background: club.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
              {club.photo_url
                ? <img src={`${club.photo_url}?width=200&quality=75`} alt={club.name} width={52} height={52} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : '💋'}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 3 }}>{club.name}</div>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>{club.city}, {club.state}</span>
                {userLocation && club.distance !== undefined && (
                  <span>{club.distance.toFixed(1)} mi away</span>
                )}
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>🐱 Full nude</span>
                <span style={{ background: '#2e1a1a', color: '#ff6b6b', border: '1px solid #ff4444', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>❌ No bar</span>
                <span style={{ background: '#1a2e1a', color: '#7aff9a', border: '1px solid #3acd60', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>🕐 Open 24hrs</span>
              </div>
            </div>
          </div>
        ))}

        {models.length > 0 && (
          <div style={{ marginTop: 8, marginBottom: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Models</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }} className="dancers-grid">
              {models.map((model: any) => {
                const photo = model.photo_urls?.[0] || model.photo_url
                return (
                  <div key={model.id}
                    onClick={() => window.location.href = `/dancers/${model.id}`}
                    style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#131629', border: `1px solid ${model.is_featured ? '#FFD700' : '#1e2140'}` }}>
                    {photo
                      ? <img src={`${photo}?width=250&quality=70`} alt={model.stage_name} loading="lazy" width={250} height={333} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>💋</div>
                    }
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                      <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{model.stage_name}</div>
                      {model.is_featured && <div style={{ color: '#FFD700', fontSize: 10 }}>★ Featured</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 20, marginTop: 8 }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>What is a Lingerie Modeling Studio?</div>
          <div style={{ color: '#8890c0', fontSize: 13, lineHeight: 1.7 }}>
            Lingerie modeling studios are private adult entertainment venues where performers model lingerie or go fully nude in a one-on-one or small group setting. Unlike traditional strip clubs they typically have no bar, no alcohol, and are often open 24 hours a day. They offer a more private and personal experience than a standard gentlemen&apos;s club.
          </div>
        </div>

        <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 20, marginTop: 10 }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Browse More Adult Entertainment</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href="/strip-clubs-near-me" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Strip Clubs Near Me</a>
            <a href="/bikini-baristas-near-me" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Bikini Baristas Near Me</a>
            <a href="/clubs" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Browse All Clubs</a>
            <a href="/states" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Browse by State</a>
          </div>
        </div>

      </div>
    </div>
  )
}
