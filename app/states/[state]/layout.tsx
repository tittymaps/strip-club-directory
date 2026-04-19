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

export async function generateMetadata({ params }: { params: { state: string } }): Promise<Metadata> {
  const stateCode = params.state.toUpperCase()
  const stateName = STATE_NAMES[stateCode] || stateCode
  const { count } = await supabase.from('clubs').select('*', { count: 'exact', head: true }).eq('state', stateCode)

  return {
    title: `Strip Clubs in ${stateName} | TittyMaps`,
    description: `Find ${count || ''} strip clubs in ${stateName}. Browse gentlemens clubs by city, check nude levels, bar type, hours and cover charges.`,
    openGraph: {
      title: `Strip Clubs in ${stateName} | TittyMaps`,
      description: `Find strip clubs in ${stateName}. Browse by city with full details on each club.`,
      url: `https://tittymaps.com/states/${params.state}`,
    }
  }
}

export default function StateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
