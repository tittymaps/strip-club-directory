'use client'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()

  const tabs = [
    { href: '/', label: 'Map', emoji: '🗺️' },
    { href: '/clubs', label: 'Clubs', emoji: '🏛️' },
    { href: '/dancers', label: 'Dancers', emoji: '💃' },
  ]

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#131629', borderTop: '2px solid #FF2D78', display: 'flex', padding: '6px 12px', gap: 6, zIndex: 100 }}>
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <a key={tab.href} href={tab.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '6px 4px', borderRadius: 10, textDecoration: 'none',
              background: active ? '#FF2D78' : 'transparent',
              transition: 'background 0.15s',
            }}>
            <span style={{ fontSize: 16 }}>{tab.emoji}</span>
            <span style={{ fontSize: 10, color: active ? 'white' : '#ccc', fontFamily: 'sans-serif' }}>{tab.label}</span>
          </a>
        )
      })}
    </div>
  )
}
