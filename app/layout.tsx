import type { Metadata } from 'next'
import './globals.css'
import BottomNav from './components/BottomNav'
import { Analytics } from '@vercel/analytics/react'

export const metadata: Metadata = {
  title: 'TittyMaps - Strip Club Directory',
  description: 'Find strip clubs near me. Search strip clubs near you by location, nude level, bar type and hours. The ultimate strip club directory.',
  keywords: 'strip clubs, strip clubs near me, gentlemens clubs, adult entertainment, strip club directory, nude clubs, topless bars',
  alternates: {
    canonical: 'https://tittymaps.com',
  },
  other: {
    'apple-mobile-web-app-title': 'TittyMaps',
  },
  openGraph: {
    title: 'TittyMaps - Strip Club Directory',
    description: 'Find strip clubs near you. Browse by location, check nude levels, bar type, hours and cover charges.',
    url: 'https://tittymaps.com',
    siteName: 'TittyMaps',
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', rel: 'shortcut icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
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
        <Analytics />
      </body>
    </html>
  )
}
