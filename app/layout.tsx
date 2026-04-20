import type { Metadata } from 'next'
import './globals.css'
import BottomNav from './components/BottomNav'

export const metadata: Metadata = {
  title: 'TittyMaps - Strip Club Directory',
  description: 'Find strip clubs near me. Search strip clubs near you by location, nude level, bar type and hours. The ultimate strip club directory.',
  keywords: 'strip clubs, strip clubs near me, gentlemens clubs, adult entertainment, strip club directory, nude clubs, topless bars',
  openGraph: {
    title: 'TittyMaps - Strip Club Directory',
    description: 'Find strip clubs near you. Browse by location, check nude levels, bar type, hours and cover charges.',
    url: 'https://tittymaps.com',
    siteName: 'TittyMaps',
    type: 'website',
  },
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
