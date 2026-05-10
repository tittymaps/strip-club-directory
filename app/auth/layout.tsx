import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In | TittyMaps',
  description: 'Sign in or create an account to leave reviews on TittyMaps.',
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
