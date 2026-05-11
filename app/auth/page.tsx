'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup() {
    if (!username || !email || !password) { setError('All fields are required.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    setError('')

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) { setError('Username already taken.'); setLoading(false); return }

    const { data, error: signupError } = await supabase.auth.signUp({ email, password })
    if (signupError) { setError(signupError.message); setLoading(false); return }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        username,
      })
      if (profileError) { setError('Error creating profile. Username may be taken.'); setLoading(false); return }
    }

    setLoading(false)
    window.location.href = '/'
  }

  async function handleLogin() {
    if (!email || !password) { setError('All fields are required.'); return }
    setLoading(true)
    setError('')

    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    if (loginError) { setError(loginError.message); setLoading(false); return }

    window.location.href = '/'
  }

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => window.location.href = '/'} style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>👤</div>
            <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
              {mode === 'login' ? 'Welcome back' : 'Create an account'}
            </h1>
            <p style={{ color: '#8890c0', fontSize: 14, margin: 0 }}>
              {mode === 'login' ? 'Sign in to leave reviews and manage your profile' : 'Join TittyMaps to leave reviews and build your profile'}
            </p>
          </div>

          <div style={{ display: 'flex', background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 4, marginBottom: 24 }}>
            <button onClick={() => { setMode('login'); setError('') }}
              style={{ flex: 1, padding: '10px', background: mode === 'login' ? '#FF2D78' : 'transparent', border: 'none', borderRadius: 10, color: mode === 'login' ? 'white' : '#8890c0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Log In
            </button>
            <button onClick={() => { setMode('signup'); setError('') }}
              style={{ flex: 1, padding: '10px', background: mode === 'signup' ? '#FF2D78' : 'transparent', border: 'none', borderRadius: 10, color: mode === 'signup' ? 'white' : '#8890c0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Sign Up
            </button>
          </div>

          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Username</div>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username"
                style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Email</div>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
              style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Password</div>
            <input value={password} onChange={e => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
              type="password"
              style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
          </div>

          {error && (
            <div style={{ background: '#2e1a1a', border: '1px solid #ff4444', borderRadius: 10, padding: '12px 14px', color: '#ff4444', fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}

          <button onClick={mode === 'login' ? handleLogin : handleSignup} disabled={loading}
            style={{ width: '100%', background: loading ? '#333' : '#FF2D78', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>

          <div style={{ textAlign: 'center' }}>
            {mode === 'login' ? (
              <span style={{ color: '#8890c0', fontSize: 13 }}>
                Don&apos;t have an account?{' '}
                <span onClick={() => { setMode('signup'); setError('') }} style={{ color: '#FF2D78', cursor: 'pointer' }}>Sign up</span>
              </span>
            ) : (
              <span style={{ color: '#8890c0', fontSize: 13 }}>
                Already have an account?{' '}
                <span onClick={() => { setMode('login'); setError('') }} style={{ color: '#FF2D78', cursor: 'pointer' }}>Log in</span>
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
