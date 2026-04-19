import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Strip Clubs by State | TittyMaps',
  description: 'Find strip clubs in every state. Browse our directory by state and city to find gentlemens clubs near you.',
}

export default function StatesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
