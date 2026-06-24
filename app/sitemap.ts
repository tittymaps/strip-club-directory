import { createClient } from '@supabase/supabase-js'
import { MetadataRoute } from 'next'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://tittymaps.com'

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}/strip-clubs-near-me`, changeFrequency: 'daily' as const, priority: 1.0 },
    { url: `${baseUrl}/clubs`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/bikini-baristas-near-me`, changeFrequency: 'daily' as const, priority: 0.9 },
    { url: `${baseUrl}/dancers`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}/states`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/lingerie-modeling-near-me`, lastModified: new Date(), changeFrequency: 'weekly' as const, priority: 0.8 },
    { url: `${baseUrl}/become-a-dancer`, changeFrequency: 'monthly', priority: 0.6 },
  ]

  const { data: clubs } = await supabase
    .from('clubs')
    .select('id, state, city, latitude, updated_at')

  const clubPages: MetadataRoute.Sitemap = (clubs || []).map(club => ({
    url: `${baseUrl}/clubs/${club.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const stateSet: Record<string, boolean> = {}
  const statePages: MetadataRoute.Sitemap = (clubs || [])
    .filter(c => {
      if (!c.state || stateSet[c.state]) return false
      stateSet[c.state] = true
      return true
    })
    .map(c => ({
      url: `${baseUrl}/states/${c.state.toLowerCase()}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  const citySet: Record<string, boolean> = {}
  const cityPages: MetadataRoute.Sitemap = (clubs || [])
    .filter(c => {
      if (!c.state || !c.city) return false
      const key = `${c.state}-${c.city}`
      if (citySet[key]) return false
      citySet[key] = true
      return true
    })
    .map(c => ({
      url: `${baseUrl}/states/${c.state.toLowerCase()}/${encodeURIComponent(c.city)}`,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  const nearSlugSet: Record<string, boolean> = {}
  const nearPages: MetadataRoute.Sitemap = (clubs || [])
    .filter(c => {
      if (!c.state || !c.city || !c.latitude) return false
      const slug = `${c.city.toLowerCase().replace(/\s+/g, '-')}-${c.state.toLowerCase()}`
      if (nearSlugSet[slug]) return false
      nearSlugSet[slug] = true
      return true
    })
    .map(c => ({
      url: `${baseUrl}/strip-clubs-near/${c.city.toLowerCase().replace(/\s+/g, '-')}-${c.state.toLowerCase()}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

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
    ...nearPages,
    ...dancerPages,
  ]
}
