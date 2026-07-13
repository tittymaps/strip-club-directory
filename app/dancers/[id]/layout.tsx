import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

function extractFanslyUsername(fanslyUrl: string): string | null {
  if (!fanslyUrl) return null
  try {
    const url = new URL(fanslyUrl)
    const parts = url.pathname.split('/').filter(Boolean)
    return parts[0] || null
  } catch {
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: dancer } = await supabase
    .from('dancers')
    .select('stage_name, fansly_url, club_ids, is_featured')
    .eq('id', params.id)
    .single()

  if (!dancer) return { title: 'Dancer | TittyMaps' }

  let clubNames: string[] = []
  let cities: string[] = []
  let isBikiniOnly = false

  if (dancer.club_ids && dancer.club_ids.length > 0) {
    const { data: clubs } = await supabase
      .from('clubs')
      .select('name, city, state, nude_level, bar_type')
      .in('id', dancer.club_ids)
    if (clubs && clubs.length > 0) {
      clubNames = clubs.map(c => c.name)
      const citySet: Record<string, boolean> = {}
      clubs.forEach(c => { citySet[`${c.city}, ${c.state}`] = true })
      cities = Object.keys(citySet)
      isBikiniOnly = clubs.every(c => c.nude_level === 'bikini' && c.bar_type === 'cafe')
    }
  }

  const roleLabel = isBikiniOnly ? 'Bikini Barista' : 'Exotic Dancer'
  const featuredLabel = dancer.is_featured ? 'Featured ' : ''
  const locationText = cities.length > 0 ? ` in ${cities.slice(0, 2).join(' & ')}` : ''
  const clubText = clubNames.length > 0 ? ` at ${clubNames.slice(0, 2).join(' & ')}` : ''
  const fanslyUsername = extractFanslyUsername(dancer.fansly_url)
  const fanslyText = fanslyUsername
    ? ` Follow ${fanslyUsername} on Fansly for exclusive content.`
    : dancer.fansly_url ? ' Follow on Fansly for exclusive content.' : ''
  const canonicalUrl = `https://tittymaps.com/dancers/${params.id}`

  const keywords = [
    dancer.stage_name,
    fanslyUsername,
    roleLabel,
    ...clubNames.slice(0, 2),
    ...cities.slice(0, 2),
    'TittyMaps',
    'Fansly',
  ].filter(Boolean).join(', ')

  return {
    title: `${dancer.stage_name} - ${featuredLabel}${roleLabel}${clubText} | TittyMaps`,
    description: `View ${dancer.stage_name}'s profile on TittyMaps. ${featuredLabel}${roleLabel}${clubText}${locationText}.${fanslyText}`,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${dancer.stage_name} - ${featuredLabel}${roleLabel} | TittyMaps`,
      description: `View ${dancer.stage_name}'s profile on TittyMaps. ${featuredLabel}${roleLabel}${clubText}${locationText}.${fanslyText}`,
      url: canonicalUrl,
    }
  }
}

export default function DancerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
