import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'User Profile | TittyMaps',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
