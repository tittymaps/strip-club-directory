'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import ProfileButton from '../../../components/ProfileButton'

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

const MONTH_YEAR = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

export default function CityPage() {
  const { state, city } = useParams()
  const router = useRouter()
  const stateCode = (state as string).toUpperCase()
  const cityName = decodeURIComponent(city as string)
  const stateName = STATE_NAMES[stateCode] || stateCode
  const [clubs, setClubs] = useState<any[]>([])
  const [dancers, setDancers] = useState<any[]>([])

  useEffect(() => {
    fetchData()
  }, [stateCode, cityName])

  async function fetchData() {
    const { data: clubData } = await supabase
      .from('clubs')
      .select('*')
      .eq('state', stateCode)
      .ilike('city', cityName)
      .order('is_featured', { ascending: false })
    setClubs(clubData || [])

    const { data: dancerData } = await supabase
      .from('dancers')
      .select('*')
      .order('is_featured', { ascending: false })
    const clubIds = (clubData || []).map((c: any) => c.id)
    const cityDancers = (dancerData || []).filter((d: any) =>
      d.club_ids?.some((id: string) => clubIds.includes(id))
    )
    setDancers(cityDancers)
  }

  const fullNudeCount = clubs.filter(c => c.nude_level === 'full_nude').length
  const toplessCount = clubs.filter(c => c.nude_level === 'topless').length
  const bikiniCount = clubs.filter(c => c.nude_level === 'bikini').length
  const fullBarCount = clubs.filter(c => c.bar_type === 'full_bar').length
  const byobCount = clubs.filter(c => c.bar_type === 'byob').length
  const cafeCount = clubs.filter(c => c.bar_type === 'cafe').length
  const noBarCount = clubs.filter(c => c.bar_type === 'none').length

  const topClubs = [...clubs].sort((a, b) => {
    if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
    return 0
  }).slice(0, 5)

  const alcoholClubs = clubs.filter(c => c.bar_type === 'full_bar' || c.bar_type === 'byob')

  const faqSchema = clubs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What are the best strip clubs in ${cityName}, ${stateCode}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The top-rated strip clubs in ${cityName}, ${stateName} on TittyMaps include ${topClubs.map(c => c.name).join(', ')}.`
        }
      },
      {
        "@type": "Question",
        "name": `Are strip clubs in ${cityName}, ${stateCode} full nude or topless?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `${cityName} has ${fullNudeCount} full nude club${fullNudeCount === 1 ? '' : 's'}, ${toplessCount} topless club${toplessCount === 1 ? '' : 's'}, and ${bikiniCount} bikini venue${bikiniCount === 1 ? '' : 's'}. Full nude clubs typically do not serve alcohol due to local regulations, while topless clubs often have a full bar.`
        }
      },
      {
        "@type": "Question",
        "name": `Which strip clubs in ${cityName}, ${stateCode} serve alcohol?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": alcoholClubs.length > 0
            ? `${alcoholClubs.length} club${alcoholClubs.length === 1 ? '' : 's'} in ${cityName} serve alcohol: ${alcoholClubs.map(c => c.name).join(', ')}.`
            : `Clubs in ${cityName} do not currently list alcohol service. Check individual club pages for BYOB policies.`
        }
      }
    ]
  } : null

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      {faqSchema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      )}

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
        <ProfileButton />
      </div>

      <div style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Strip Clubs in {cityName}, {stateCode} — Full Directory</h1>
        <p style={{ color: '#8890c0', fontSize: 13, margin: 0 }}>{stateName} · {clubs.length} clubs · {dancers.length} featured dancers</p>
      </div>

      {clubs.length > 0 && (
        <div style={{ padding: '8px 16px 0' }}>
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16 }}>
            <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, margin: '0 0 14px' }}>
              TittyMaps lists {clubs.length} strip club{clubs.length === 1 ? '' : 's'} in {cityName}, {stateName}, including {fullNudeCount > 0 ? `${fullNudeCount} full nude` : ''}{fullNudeCount > 0 && (toplessCount > 0 || bikiniCount > 0) ? ', ' : ''}{toplessCount > 0 ? `${toplessCount} topless` : ''}{toplessCount > 0 && bikiniCount > 0 ? ', and ' : ''}{bikiniCount > 0 ? `${bikiniCount} bikini` : ''} venue{clubs.length === 1 ? '' : 's'}. Updated {MONTH_YEAR}. Browse the full list below or filter by category to find the right club near you.
            </p>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #1e2140' }}>
                  <td style={{ padding: '8px 0', color: '#8890c0' }}>Total clubs in {cityName}</td>
                  <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{clubs.length}</td>
                </tr>
                {fullNudeCount > 0 && (
                  <tr style={{ borderBottom: '1px solid #1e2140' }}>
                    <td style={{ padding: '8px 0', color: '#8890c0' }}>🐱 Full nude</td>
                    <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{fullNudeCount}</td>
                  </tr>
                )}
                {toplessCount > 0 && (
                  <tr style={{ borderBottom: '1px solid #1e2140' }}>
                    <td style={{ padding: '8px 0', color: '#8890c0' }}>🍒 Topless</td>
                    <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{toplessCount}</td>
                  </tr>
                )}
                {bikiniCount > 0 && (
                  <tr style={{ borderBottom: '1px solid #1e2140' }}>
                    <td style={{ padding: '8px 0', color: '#8890c0' }}>👙 Bikini</td>
                    <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{bikiniCount}</td>
                  </tr>
                )}
                {fullBarCount > 0 && (
                  <tr style={{ borderBottom: '1px solid #1e2140' }}>
                    <td style={{ padding: '8px 0', color: '#8890c0' }}>🍾 Full bar</td>
                    <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{fullBarCount}</td>
                  </tr>
                )}
                {byobCount > 0 && (
                  <tr style={{ borderBottom: '1px solid #1e2140' }}>
                    <td style={{ padding: '8px 0', color: '#8890c0' }}>🍺 BYOB</td>
                    <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{byobCount}</td>
                  </tr>
                )}
                {cafeCount > 0 && (
                  <tr style={{ borderBottom: '1px solid #1e2140' }}>
                    <td style={{ padding: '8px 0', color: '#8890c0' }}>🧋 Cafe</td>
                    <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{cafeCount}</td>
                  </tr>
                )}
                {noBarCount > 0 && (
                  <tr>
                    <td style={{ padding: '8px 0', color: '#8890c0' }}>❌ No bar</td>
                    <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{noBarCount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {topClubs.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>What are the best strip clubs in {cityName}, {stateCode}?</h2>
          <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
            The top-rated venues in {cityName} based on featured status and reviews are:
          </p>
          <ol style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
            {topClubs.map(club => (
              <li key={club.id}>
                <span onClick={() => window.location.href = `/clubs/${club.id}`} style={{ color: '#7ab8ff', textDecoration: 'underline', cursor: 'pointer' }}>
                  {club.name}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {clubs.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>Is {cityName} strip club full nude or topless?</h2>
          <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
            {cityName} has {fullNudeCount} full nude club{fullNudeCount === 1 ? '' : 's'}, {toplessCount} topless club{toplessCount === 1 ? '' : 's'}, and {bikiniCount} bikini venue{bikiniCount === 1 ? '' : 's'}. In most states, full nude clubs are restricted from serving alcohol, so they&apos;re often BYOB or no-bar venues, while topless clubs are more likely to have a full bar since they fall under standard liquor licensing rules.
          </p>
        </div>
      )}

      {clubs.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>Which {cityName} strip clubs serve alcohol?</h2>
          <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, marginBottom: alcoholClubs.length > 0 ? 10 : 0 }}>
            {alcoholClubs.length > 0
              ? `${alcoholClubs.length} club${alcoholClubs.length === 1 ? '' : 's'} in ${cityName} serve alcohol:`
              : `Clubs in ${cityName} do not currently list alcohol service. Check individual club pages for BYOB policies.`}
          </p>
          {alcoholClubs.length > 0 && (
            <ul style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
              {alcoholClubs.map(club => (
                <li key={club.id}>
                  <span onClick={() => window.location.href = `/clubs/${club.id}`} style={{ color: '#7ab8ff', textDecoration: 'underline', cursor: 'pointer' }}>
                    {club.name}
                  </span>
                  {' '}({club.bar_type === 'full_bar' ? 'full bar' : 'BYOB'})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>All Clubs</div>
        {clubs.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center', marginBottom: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No clubs found in {cityName}</div>
          </div>
        ) : clubs.map(club => (
          <div key={club.id}
            onClick={() => window.location.href = `/clubs/${club.id}`}
            style={{
              background: '#131629', borderRadius: 12, marginBottom: 8, padding: 12,
              border: `1px solid ${club.is_featured ? '#FFD700' : '#1e2140'}`,
              display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer'
            }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: club.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {club.photo_url
                ? <img src={`${club.photo_url}?width=400&quality=75`} alt={club.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (club.is_featured ? '🌟' : '💜')
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{club.name}</div>
              <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 6 }}>{club.city}, {club.state}</div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                  {club.nude_level === 'full_nude' ? '🐱 Full nude' : club.nude_level === 'bikini' ? '👙 Bikini' : '🍒 Topless'}
                </span>
                <span style={{ background: club.bar_type === 'none' ? '#2e1a1a' : '#1a2a3d', color: club.bar_type === 'none' ? '#ff6b6b' : '#7ab8ff', border: `1px solid ${club.bar_type === 'none' ? '#ff4444' : '#3a7acd'}`, borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                {club.bar_type === 'full_bar' ? '🍾 Full bar' : club.bar_type === 'cafe' ? '🧋 Cafe' : club.bar_type === 'byob' ? '🍺 BYOB' : '❌ No bar'}
              </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {dancers.length > 0 && (
        <div style={{ padding: '8px 16px' }}>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Dancers in {cityName}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {dancers.map(dancer => {
              const photo = dancer.photo_urls?.[0] || dancer.photo_url
              return (
                <div key={dancer.id}
                  onClick={() => window.location.href = `/dancers/${dancer.id}`}
                  style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#131629', border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}` }}>
                  {photo
                    ? <img src={`${photo}?width=400&quality=75`} alt={dancer.stage_name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>💃</div>
                  }
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{dancer.stage_name}</div>
                    {dancer.is_featured && <div style={{ color: '#FFD700', fontSize: 10 }}>★ Featured</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
