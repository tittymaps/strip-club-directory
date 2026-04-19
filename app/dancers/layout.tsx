import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Featured Dancers | TittyMaps',
  description: 'Browse featured dancers at strip clubs near you. Connect with performers on Fansly and find out where they perform.',
}

export default function DancersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
