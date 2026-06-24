import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { stateCode, cityName } = parseSlug(params.slug)
  const stateName = STATE_NAMES[stateCode] || stateCode
  const canonicalUrl = `https://tittymaps.com/strip-clubs-near/${params.slug}`

  return {
    title: `Strip Clubs Near ${cityName}, ${stateCode} — Within 50 Miles | TittyMaps`,
    description: `Find strip clubs near ${cityName}, ${stateName} within a 50 mile radius. Browse full nude, topless and bikini clubs near ${cityName} with hours, cover charges and reviews.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Strip Clubs Near ${cityName}, ${stateCode} | TittyMaps`,
      description: `Find strip clubs near ${cityName}, ${stateName} within 50 miles. Browse by nude level, bar type and hours.`,
      url: canonicalUrl,
    },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
