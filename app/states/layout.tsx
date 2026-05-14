import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strip Clubs by State | TittyMaps',
  description: 'Find strip clubs in every state. Browse our directory by state and city to find gentlemens clubs near you.',
  keywords: 'strip clubs by state, strip clubs near me, gentlemens clubs, adult entertainment directory, strip club finder',
  alternates: {
    canonical: 'https://tittymaps.com/states',
  },
  openGraph: {
    title: 'Strip Clubs by State | TittyMaps',
    description: 'Find strip clubs in every state. Browse our directory by state and city to find gentlemens clubs near you.',
    url: 'https://tittymaps.com/states',
  }
}

export default function StatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
