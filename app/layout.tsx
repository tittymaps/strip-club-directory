import type { Metadata } from 'next'
import './globals.css'
import BottomNav from './components/BottomNav'

export const metadata: Metadata = {
  title: 'TittyMaps',
  description: 'Find strip clubs near you',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, paddingBottom: 64, background: '#0D0F1E' }}>
        {children}
        <BottomNav />
      </body>
    </html>
  )
}
