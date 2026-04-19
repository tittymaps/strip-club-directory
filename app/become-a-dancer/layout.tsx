import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become a Featured Dancer | TittyMaps',
  description: 'Get your dancer profile listed on TittyMaps. Reach thousands of club-goers in your area. Sign up through our Fansly link to become a featured dancer.',
}

export default function BecomeADancerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
