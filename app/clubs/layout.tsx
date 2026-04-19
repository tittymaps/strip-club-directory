import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strip Clubs Directory | TittyMaps',
  description: 'Browse all strip clubs in our directory. Filter by full nude, topless, full bar or BYOB. Find the best gentlemens clubs near you.',
}

export default function ClubsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
