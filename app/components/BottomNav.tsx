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
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#131629', borderTop: '1px solid #1e2140', display: 'flex', padding: '10px 12px', gap: 6, zIndex: 100 }}>
      {tabs.map(tab => {
        const active = pathname === tab.href || (tab.href !== '/' && pathname.startsWith(tab.href))
        return (
          <a key={tab.href} href={tab.href}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              padding: '8px 4px', borderRadius: 10, textDecoration: 'none',
              background: active ? '#FF2D78' : 'transparent',
              transition: 'background 0.15s',
            }}>
            <span style={{ fontSize: 18 }}>{tab.emoji}</span>
            <span style={{ fontSize: 10, color: active ? 'white' : '#8890c0', fontFamily: 'sans-serif' }}>{tab.label}</span>
          </a>
        )
      })}
    </div>
  )
}
