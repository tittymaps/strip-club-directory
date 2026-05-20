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
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0D0F1E', padding: '10px 16px 16px', zIndex: 100 }}>
      <div style={{ display: 'flex', background: '#1e2140', borderRadius: 28, padding: 6, gap: 4, border: '1px solid #2a2d50' }}>
        {tabs.map(tab => {
          const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
          return (
            <a key={tab.href} href={tab.href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '8px 4px', borderRadius: 22, textDecoration: 'none',
                background: active ? '#FF2D78' : 'transparent',
                transition: 'background 0.15s',
              }}>
              <span style={{ fontSize: 18 }}>{tab.emoji}</span>
              <span style={{ fontSize: 10, color: active ? 'white' : '#8890c0', fontFamily: 'sans-serif', fontWeight: active ? 700 : 400 }}>{tab.label}</span>
            </a>
          )
        })}
      </div>
    </div>
  )
}
