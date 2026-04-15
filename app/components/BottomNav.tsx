'use client'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { key: 'map', label: 'Map', href: '/', emoji: '🗺️' },
    { key: 'clubs', label: 'Clubs', href: '/clubs', emoji: '🏛️' },
    { key: 'dancers', label: 'Dancers', href: '/dancers', emoji: '💃' },
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
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', padding: '8px 0 10px', textDecoration: 'none', gap: 3,
              borderTop: active ? '2px solid #FF2D78' : '2px solid transparent',
              background: active ? 'rgba(255,45,120,0.06)' : 'transparent',
            }}>
            <span style={{ fontSize: active ? 24 : 20, transition: 'font-size 0.15s' }}>{tab.emoji}</span>
            <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, color: active ? '#FF2D78' : '#555e7a', fontFamily: 'sans-serif' }}>
              {tab.label}
            </span>
          </a>
        )
      })}
    </div>
  )
}
