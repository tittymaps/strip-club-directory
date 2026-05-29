import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Lingerie Modeling Studios Near Me | TittyMaps',
  description: 'Find lingerie modeling studios near you. Browse full nude, no bar lingerie modeling studios open 24 hours. View locations, hours and details.',
  keywords: 'lingerie modeling studio near me, lingerie modeling near me, lingerie modeling studios, 24 hour lingerie modeling, full nude lingerie modeling',
  alternates: {
    canonical: 'https://tittymaps.com/lingerie-modeling-near-me',
  },
  openGraph: {
    title: 'Lingerie Modeling Studios Near Me | TittyMaps',
    description: 'Find lingerie modeling studios near you. Browse full nude, no bar lingerie modeling studios open 24 hours.',
    url: 'https://tittymaps.com/lingerie-modeling-near-me',
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
