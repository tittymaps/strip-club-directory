import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tittymaps.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/strip-clubs-near-me`, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/clubs`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/bikini-baristas-near-me`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/dancers`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/states`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/become-a-dancer`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Club pages
  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, updated_at')

 const clubPages: MetadataRoute.Sitemap = (clubs || []).map(club => ({
    url: `${baseUrl}/clubs/${club.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // State pages
  const { data: stateData } = await supabase
    .from('clubs')
    .select('state')

  const states = Array.from(new Set((stateData || []).map(c => c.state).filter(Boolean)))
  const statePages: MetadataRoute.Sitemap = states.map(state => ({
    url: `${baseUrl}/states/${state.toLowerCase()}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  // City pages
  const { data: cityData } = await supabase
    .from('clubs')
    .select('state, city')

  const citySet = new Set<string>()
  const cityPages: MetadataRoute.Sitemap = []
  ;(cityData || []).forEach(c => {
    if (!c.state || !c.city) return
    const key = `${c.state}-${c.city}`
    if (!citySet.has(key)) {
      citySet.add(key)
      cityPages.push({
        url: `${baseUrl}/states/${c.state.toLowerCase()}/${encodeURIComponent(c.city)}`,
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    }
  })

  // Dancer pages
  const { data: dancers } = await supabase
    .from('dancers')
    .select('id, created_at')

  const dancerPages: MetadataRoute.Sitemap = (dancers || []).map(dancer => ({
    url: `${baseUrl}/dancers/${dancer.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [
    ...staticPages,
    ...clubPages,
    ...statePages,
    ...cityPages,
    ...dancerPages,
  ]
}
