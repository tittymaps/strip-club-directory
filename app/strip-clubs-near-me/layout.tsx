import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strip Clubs Near Me | TittyMaps',
  description: 'Find strip clubs near me. Search gentlemens clubs near your location. Browse full nude and topless strip clubs with full bar or BYOB options.',
  keywords: 'strip clubs near me, gentlemens clubs near me, topless bars near me, nude clubs near me, strip club finder',
  alternates: {
    canonical: 'https://tittymaps.com/strip-clubs-near-me',
  },
  openGraph: {
    title: 'Strip Clubs Near Me | TittyMaps',
    description: 'Find strip clubs near your location. Browse full nude and topless clubs with hours, cover charges and featured dancers.',
    url: 'https://tittymaps.com/strip-clubs-near-me',
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
