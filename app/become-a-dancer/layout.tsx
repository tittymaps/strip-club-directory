import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Become a Featured Dancer | TittyMaps',
  description: 'Get your profile in front of thousands of club-goers. Featured dancers get a direct Fansly link, gold badge, and top placement on every club page. Sign up free.',
  alternates: {
    canonical: 'https://tittymaps.com/become-a-dancer',
  },
}

export default function BecomeADancerLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
