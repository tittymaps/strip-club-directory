import type { Metadata } from 'next'
import './globals.css'
import BottomNav from './components/BottomNav'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import DesktopQR from './components/DesktopQR'

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
    images: [
      {
        url: 'https://tittymaps.com/android-chrome-512x512.png',
        width: 512,
        height: 512,
        alt: 'TittyMaps',
      }
    ],
    type: 'website',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, paddingBottom: 80, background: '#0D0F1E' }}>
        {children}
        <BottomNav />
        <Analytics />
        <SpeedInsights />
        <DesktopQR />
      </body>
    </html>
  )
}
