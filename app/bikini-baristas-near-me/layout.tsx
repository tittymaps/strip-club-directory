import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Bikini Baristas Near Me | TittyMaps',
  description: 'Find bikini barista coffee shops near you. Browse bikini barista locations with hours, address and featured baristas.',
  keywords: 'bikini baristas near me, bikini barista, bikini coffee, bikini espresso, bikini barista locations',
  openGraph: {
    title: 'Bikini Baristas Near Me | TittyMaps',
    description: 'Find bikini barista coffee shops near your location.',
    url: 'https://tittymaps.com/bikini-baristas-near-me',
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
