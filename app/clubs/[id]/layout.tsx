import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: club } = await supabase
    .from('clubs')
    .select('name, city, state, nude_level, bar_type')
    .eq('id', params.id)
    .single()

  if (!club) return { title: 'Strip Club | TittyMaps' }

  const isBikiniCafe = club.nude_level === 'bikini' && club.bar_type === 'cafe'
  const categoryLabel = isBikiniCafe ? 'Bikini Coffee Shop' : 'Strip Club'
  const nudeLabel = club.nude_level === 'full_nude' ? 'full nude' : club.nude_level === 'bikini' ? 'bikini' : 'topless'
  const barLabel = club.bar_type === 'full_bar' ? 'with a full bar' : club.bar_type === 'byob' ? 'BYOB' : club.bar_type === 'cafe' ? 'coffee shop' : ''
  const canonicalUrl = `https://tittymaps.com/clubs/${params.id}`

  return {
    title: `${club.name} - ${categoryLabel} in ${club.city}, ${club.state} | TittyMaps`,
    description: `${club.name} is a ${nudeLabel} ${categoryLabel.toLowerCase()} in ${club.city}, ${club.state}${barLabel ? ' ' + barLabel : ''}. View hours, cover charge, reviews and featured ${isBikiniCafe ? 'baristas' : 'dancers'}.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${club.name} - ${categoryLabel} in ${club.city}, ${club.state} | TittyMaps`,
      description: `${club.name} is a ${nudeLabel} ${categoryLabel.toLowerCase()} in ${club.city}, ${club.state}. View hours, cover charge and reviews on TittyMaps.`,
      url: canonicalUrl,
    }
  }
}

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
