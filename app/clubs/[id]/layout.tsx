import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data } = await supabase.from('clubs').select('name, city, state, nude_level, bar_type').eq('id', params.id).single()

  if (!data) return { title: 'Strip Club | TittyMaps' }

  const nudeLevel = data.nude_level === 'full_nude' ? 'Full nude' : 'Topless'
  const barType = data.bar_type === 'full_bar' ? 'full bar' : 'BYOB'

  return {
    title: `${data.name} — Strip Club in ${data.city}, ${data.state} | TittyMaps`,
    description: `${data.name} is a ${nudeLevel.toLowerCase()} strip club in ${data.city}, ${data.state} with a ${barType}. View hours, cover charge and featured dancers.`,
    openGraph: {
      title: `${data.name} | TittyMaps`,
      description: `${nudeLevel} strip club in ${data.city}, ${data.state}. View hours, cover charge and featured dancers.`,
      url: `https://tittymaps.com/clubs/${params.id}`,
    }
  }
}

export default function ClubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
