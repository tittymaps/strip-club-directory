import { createClient } from '@supabase/supabase-js'
import ProfileButton from '../../components/ProfileButton'

export const revalidate = 0

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

function parseSlug(slug: string) {
  const parts = slug.split('-')
  const stateCode = parts[parts.length - 1].toUpperCase()
  const citySlug = parts.slice(0, parts.length - 1).join('-')
  const cityName = citySlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  return { stateCode, cityName }
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 3958.8
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function is24Hours(hours: any): boolean {
  if (!hours) return false
  return Object.values(hours).some((h: any) =>
    typeof h === 'string' && h.toLowerCase().includes('24')
  )
}

function isLingerieStudio(club: any): boolean {
  return club.nude_level === 'full_nude' && club.bar_type === 'none' && is24Hours(club.hours)
}

function isBikiniCafe(club: any): boolean {
  return club.nude_level === 'bikini' && club.bar_type === 'cafe'
}

export default async function StripClubsNearPage({ params }: { params: { slug: string } }) {
  const { stateCode, cityName } = parseSlug(params.slug)
  const stateName = STATE_NAMES[stateCode] || stateCode

  const [{ data: allClubs }, { data: dancerData }] = await Promise.all([
    supabase.from('clubs').select('*'),
    supabase.from('dancers').select('*').order('is_featured', { ascending: false })
  ])

  const clubs = allClubs || []

  const cityClub = clubs.find(c =>
    c.state === stateCode &&
    c.city.toLowerCase() === cityName.toLowerCase() &&
    c.latitude && c.longitude
  )

  if (!cityClub) {
    return (
      <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>
        <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <a href="/clubs" style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer', textDecoration: 'none' }}>← Back</a>
          <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
          <ProfileButton />
        </div>
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ color: '#8890c0', fontSize: 14 }}>No clubs found near {cityName}, {stateCode}</div>
          <a href="/clubs" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none', display: 'block', marginTop: 12 }}>Browse all clubs →</a>
        </div>
      </div>
    )
  }

  const centerLat = cityClub.latitude
  const centerLon = cityClub.longitude

  const nearbyClubs = clubs
    .filter(c => c.latitude && c.longitude)
    .map(c => ({ ...c, distance: getDistance(centerLat, centerLon, c.latitude, c.longitude) }))
    .filter(c => c.distance <= 50)
    .sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1
      return a.distance - b.distance
    })

  const nearbyClubIds = nearbyClubs.map(c => c.id)
  const nearbyDancers = (dancerData || []).filter((d: any) =>
    d.club_ids?.some((id: string) => nearbyClubIds.includes(id))
  )

  const bikiniCafeCount = nearbyClubs.filter(isBikiniCafe).length
  const lingerieCount = nearbyClubs.filter(isLingerieStudio).length
  const nearbyStripClubs = nearbyClubs.filter(c => !isBikiniCafe(c) && !isLingerieStudio(c))
  const stripClubCount = nearbyStripClubs.length
  const fullNudeCount = nearbyStripClubs.filter(c => c.nude_level === 'full_nude').length
  const toplessCount = nearbyStripClubs.filter(c => c.nude_level === 'topless').length
  const bikiniCount = nearbyStripClubs.filter(c => c.nude_level === 'bikini').length
  const fullBarCount = nearbyStripClubs.filter(c => c.bar_type === 'full_bar').length
  const byobCount = nearbyStripClubs.filter(c => c.bar_type === 'byob').length
  const noBarCount = nearbyStripClubs.filter(c => c.bar_type === 'none').length
  const alcoholClubs = nearbyClubs.filter(c => c.bar_type === 'full_bar' || c.bar_type === 'byob')
  const topClubs = nearbyClubs.slice(0, 5)

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What are the best strip clubs near ${cityName}, ${stateCode}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `The top strip clubs within 50 miles of ${cityName}, ${stateName} on TittyMaps include ${topClubs.map(c => `${c.name} in ${c.city} (${c.distance.toFixed(1)} miles away)`).join(', ')}.`
        }
      },
      {
        "@type": "Question",
        "name": `How many strip clubs are within 50 miles of ${cityName}, ${stateCode}?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `There are ${stripClubCount} strip clubs${bikiniCafeCount > 0 ? `, ${bikiniCafeCount} bikini coffee shops` : ''}${lingerieCount > 0 ? `, and ${lingerieCount} lingerie modeling studios` : ''} within 50 miles of ${cityName}, ${stateName}, including ${fullNudeCount} full nude, ${toplessCount} topless, and ${bikiniCount} bikini venues.`
        }
      },
      {
        "@type": "Question",
        "name": `Which strip clubs near ${cityName}, ${stateCode} serve alcohol?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": alcoholClubs.length > 0
            ? `${alcoholClubs.length} club${alcoholClubs.length === 1 ? '' : 's'} near ${cityName} serve alcohol: ${alcoholClubs.slice(0, 5).map(c => c.name).join(', ')}.`
            : `Clubs near ${cityName} do not currently list alcohol service. Check individual club pages for details.`
        }
      }
    ]
  }

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <a href="/clubs" style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer', textDecoration: 'none' }}>← Back</a>
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
        <ProfileButton />
      </div>

      <div style={{ padding: '16px 16px 8px' }}>
        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 4px' }}>Strip Clubs Near {cityName}, {stateCode}</h1>
        <p style={{ color: '#8890c0', fontSize: 13, margin: 0 }}>
          {stripClubCount > 0 ? `${stripClubCount} strip club${stripClubCount === 1 ? '' : 's'}` : ''}
          {bikiniCafeCount > 0 ? ` · ${bikiniCafeCount} bikini coffee shop${bikiniCafeCount === 1 ? '' : 's'}` : ''}
          {lingerieCount > 0 ? ` · ${lingerieCount} lingerie studio${lingerieCount === 1 ? '' : 's'}` : ''}
          {' '}within 50 miles of {cityName}, {stateName}
        </p>
      </div>

      <div style={{ padding: '8px 16px 0' }}>
        <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16 }}>
          <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6, margin: '0 0 14px' }}>
            TittyMaps lists {stripClubCount > 0 ? `${stripClubCount} strip club${stripClubCount === 1 ? '' : 's'}` : ''}
            {bikiniCafeCount > 0 ? `${stripClubCount > 0 ? ', ' : ''}${bikiniCafeCount} bikini coffee shop${bikiniCafeCount === 1 ? '' : 's'}` : ''}
            {lingerieCount > 0 ? `${stripClubCount > 0 || bikiniCafeCount > 0 ? ', and ' : ''}${lingerieCount} lingerie modeling studio${lingerieCount === 1 ? '' : 's'}` : ''}
            {' '}within 50 miles of {cityName}, {stateName}. Sorted by featured status then distance.
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {stripClubCount > 0 && (
                <tr style={{ borderBottom: '1px solid #1e2140' }}>
                  <td style={{ padding: '8px 0', color: '#8890c0' }}>Strip clubs within 50 miles</td>
                  <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{stripClubCount}</td>
                </tr>
              )}
              {bikiniCafeCount > 0 && (
                <tr style={{ borderBottom: '1px solid #1e2140' }}>
                  <td style={{ padding: '8px 0', color: '#8890c0' }}>🧋 Bikini coffee shops</td>
                  <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{bikiniCafeCount}</td>
                </tr>
              )}
              {lingerieCount > 0 && (
                <tr style={{ borderBottom: '1px solid #1e2140' }}>
                  <td style={{ padding: '8px 0', color: '#8890c0' }}>💋 Lingerie modeling studios</td>
                  <td style={{ padding: '8px 0', color: 'white', textAlign: 'right', fontWeight: 600 }}>{lingerieCount}</td>
                </tr>
              )}
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

      <div style={{ padding: '16px 16px 0' }}>
        <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>What are the best strip clubs near {cityName}, {stateCode}?</h2>
        <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
          The top-rated venues within 50 miles of {cityName} are:
        </p>
        <ol style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
          {topClubs.map(club => (
            <li key={club.id}>
              <a href={`/clubs/${club.id}`} style={{ color: '#7ab8ff', textDecoration: 'underline' }}>
                {club.name}
              </a>
              {' '}— {club.city}, {club.state} ({club.distance.toFixed(1)} mi)
              {isBikiniCafe(club) ? ' · bikini coffee shop' : isLingerieStudio(club) ? ' · lingerie studio' : ''}
            </li>
          ))}
        </ol>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>How many strip clubs are within 50 miles of {cityName}?</h2>
        <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, margin: 0 }}>
          There are {stripClubCount} strip club{stripClubCount === 1 ? '' : 's'}
          {bikiniCafeCount > 0 ? `, ${bikiniCafeCount} bikini coffee shop${bikiniCafeCount === 1 ? '' : 's'}` : ''}
          {lingerieCount > 0 ? `, and ${lingerieCount} lingerie modeling studio${lingerieCount === 1 ? '' : 's'}` : ''}
          {' '}within 50 miles of {cityName}, {stateName} listed on TittyMaps, including {fullNudeCount} full nude, {toplessCount} topless, and {bikiniCount} bikini venue{bikiniCount === 1 ? '' : 's'}.
        </p>
      </div>

      {alcoholClubs.length > 0 && (
        <div style={{ padding: '16px 16px 0' }}>
          <h2 style={{ color: 'white', fontSize: 17, fontWeight: 700, margin: '0 0 8px' }}>Which strip clubs near {cityName} serve alcohol?</h2>
          <p style={{ color: '#ccc', fontSize: 13, lineHeight: 1.6, marginBottom: 10 }}>
            {alcoholClubs.length} club{alcoholClubs.length === 1 ? '' : 's'} near {cityName} serve alcohol:
          </p>
          <ul style={{ color: '#ccc', fontSize: 13, lineHeight: 1.8, paddingLeft: 20, margin: 0 }}>
            {alcoholClubs.map(club => (
              <li key={club.id}>
                <a href={`/clubs/${club.id}`} style={{ color: '#7ab8ff', textDecoration: 'underline' }}>
                  {club.name}
                </a>
                {' '}— {club.city} ({club.distance.toFixed(1)} mi, {club.bar_type === 'full_bar' ? 'full bar' : 'BYOB'})
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ padding: '20px 16px 8px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>
          All {nearbyClubs.length} venues within 50 miles
        </div>
        <div className="state-clubs-grid">
          {nearbyClubs.map(club => (
          <a key={club.id}
            href={`/clubs/${club.id}`}
            style={{
              background: '#131629', borderRadius: 12, marginBottom: 8, padding: 12,
              border: `1px solid ${club.is_featured ? '#FFD700' : '#1e2140'}`,
              display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer',
              textDecoration: 'none', color: 'inherit'
            }}>
            <div style={{ width: 48, height: 48, borderRadius: 10, background: club.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
              {club.photo_url
                ? <img src={`${club.photo_url}?width=250&quality=70`} alt={club.name} loading="lazy" width={48} height={48} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : (club.is_featured ? '🌟' : '💜')
              }
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{club.name}</div>
              <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 6, display: 'flex', justifyContent: 'space-between' }}>
                <span>{club.city}, {club.state}</span>
                <span>{club.distance.toFixed(1)} mi away</span>
              </div>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                {isBikiniCafe(club)
                  ? <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>🧋 Bikini Coffee</span>
                  : isLingerieStudio(club)
                  ? <span style={{ background: '#2a1a2e', color: '#cc88ff', border: '1px solid #9944cc', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>💋 Lingerie Studio</span>
                  : <>
                    <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                      {club.nude_level === 'full_nude' ? '🐱 Full nude' : club.nude_level === 'bikini' ? '👙 Bikini' : '🍒 Topless'}
                    </span>
                    <span style={{ background: club.bar_type === 'none' ? '#2e1a1a' : '#1a2a3d', color: club.bar_type === 'none' ? '#ff6b6b' : '#7ab8ff', border: `1px solid ${club.bar_type === 'none' ? '#ff4444' : '#3a7acd'}`, borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                      {club.bar_type === 'full_bar' ? '🍾 Full bar' : club.bar_type === 'byob' ? '🍺 BYOB' : '❌ No bar'}
                    </span>
                  </>
                }
              </div>
            </div>
          </a>
        ))}
        </div>

      {nearbyDancers.length > 0 &&
        <div style={{ padding: '8px 16px' }}>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 }}>Featured Dancers Near {cityName}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }} className="dancers-grid">
            {nearbyDancers.map((dancer: any) => {
              const photo = dancer.photo_urls?.[0] || dancer.photo_url
              return (
                <a key={dancer.id}
                  href={`/dancers/${dancer.id}`}
                  style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#131629', border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}`, textDecoration: 'none', display: 'block' }}>
                  {photo
                    ? <img src={`${photo}?width=250&quality=70`} alt={dancer.stage_name} loading="lazy" width={250} height={333} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>💃</div>
                  }
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{dancer.stage_name}</div>
                    {dancer.is_featured && <div style={{ color: '#FFD700', fontSize: 10 }}>★ Featured</div>}
                  </div>
                </a>
              )
            })}
          </div>
        </div>
      )}

      <div style={{ padding: '8px 16px 16px' }}>
        <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 20 }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Browse More</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <a href={`/states/${stateCode.toLowerCase()}`} style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ All strip clubs in {stateName}</a>
            <a href={`/states/${stateCode.toLowerCase()}/${encodeURIComponent(cityName)}`} style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Strip clubs in {cityName} only</a>
            <a href="/clubs" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Browse all clubs nationwide</a>
            <a href="/states" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none' }}>→ Browse by state</a>
          </div>
        </div>
      </div>

    </div>
  )
}
