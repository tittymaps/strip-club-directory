'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function BottomNav() {
  const pathname = usePathname()
  const [profileUsername, setProfileUsername] = useState<string | null>(null)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
      if (profile) setProfileUsername(profile.username)
    }
  }

  const tabs = [
    { href: '/', label: 'Map', emoji: '🗺️' },
    { href: '/clubs', label: 'Clubs', emoji: '🏛️' },
    { href: '/dancers', label: 'Dancers', emoji: '💃' },
    { href: profileUsername ? `/users/${profileUsername}` : '/auth', label: profileUsername ? 'Profile' : 'Sign In', emoji: profileUsername ? '👤' : '🔑' },
  ]

  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#0D0F1E', borderTop: '1px solid #1e2140', display: 'flex', zIndex: 100 }}>
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <a key={tab.href} href={tab.href}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '8px 0', textDecoration: 'none', borderTop: `2px solid ${active ? '#FF2D78' : 'transparent'}` }}>
            <span style={{ fontSize: 20 }}>{tab.emoji}</span>
            <span style={{ color: active ? '#FF2D78' : '#8890c0', fontSize: 10, marginTop: 2 }}>{tab.label}</span>
          </a>
        )
      })}
    </div>
  )
}
