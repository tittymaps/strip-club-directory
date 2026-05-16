'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function ProfileButton() {
  const [profileUsername, setProfileUsername] = useState<string | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('username, avatar_url').eq('id', user.id).single()
      if (profile) {
        setProfileUsername(profile.username)
        setAvatarUrl(profile.avatar_url)
      }
    }
    setLoading(false)
  }

  if (loading) return null

  return (
    <a href={profileUsername ? `/users/${profileUsername}` : '/auth'}
      style={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a1a40', border: `2px solid ${profileUsername ? '#FF2D78' : '#3a3d60'}`, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
        {avatarUrl
          ? <img src={avatarUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <span>{profileUsername ? '👤' : '🔑'}</span>}
      </div>
    </a>
  )
}
