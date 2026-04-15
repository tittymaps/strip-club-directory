'use client'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    {
      key: 'map',
      label: 'Map',
      href: '/',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF2D78' : '#8890c0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5"/>
        </svg>
      )
    },
    {
      key: 'clubs',
      label: 'Clubs',
      href: '/clubs',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF2D78' : '#8890c0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="9" width="18" height="12" rx="2"/>
          <path d="M8 9V7a4 4 0 018 0v2"/>
          <line x1="12" y1="13" x2="12" y2="17"/>
        </svg>
      )
    },
    {
      key: 'dancers',
      label: 'Dancers',
      href: '/dancers',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 100 100" fill={active ? '#FF2D78' : '#8890c0'}>
          <ellipse cx="50" cy="12" rx="8" ry="10"/>
          <path d="M50 22 C42 26 36 32 38 42 L44 58 L36 80 L42 82 L50 62 L58 82 L64 80 L56 58 L62 42 C64 32 58 26 50 22Z"/>
          <path d="M38 42 C32 44 26 48 24 56 L30 58 C31 52 36 48 40 47Z"/>
          <path d="M62 42 C68 44 74 48 76 56 L70 58 C69 52 64 48 60 47Z"/>
        </svg>
      )
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: '#0D0F1E', borderTop: '1px solid #1e2140',
      display: 'flex', zIndex: 100,
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      {tabs.map(tab => {
        const active = isActive(tab.href)
        return (
          <a key={tab.key} href={tab.href}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px 0 10px', textDecoration: 'none', gap: 3 }}>
            {tab.icon(active)}
            <span style={{ fontSize: 10, color: active ? '#FF2D78' : '#8890c0', fontFamily: 'sans-serif' }}>
              {tab.label}
            </span>
          </a>
        )
      })}
    </div>
  )
}
