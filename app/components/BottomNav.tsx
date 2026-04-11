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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF2D78' : '#8890c0'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="2"/>
          <path d="M12 7v6M9 10l3 3 3-3M9 17l-2 4M15 17l2 4"/>
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
