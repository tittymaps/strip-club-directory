'use client'
import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
        email,
      })
      if (profileError) { setError('Error creating profile. Username may be taken.'); setLoading(false); return }
    }

    setLoading(false)
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    window.location.href = redirect || '/'
  }

  async function handleLogin() {
    if (!emailOrUsername || !password) { setError('All fields are required.'); return }
    setLoading(true)
    setError('')

    let loginEmail = emailOrUsername

    if (!emailOrUsername.includes('@')) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('username', emailOrUsername)
        .single()

      if (!profile || !profile.email) {
        setError('Username not found. Try signing in with your email instead.')
        setLoading(false)
        return
      }

      loginEmail = profile.email
    }

    const { error: loginError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    if (loginError) { setError(loginError.message); setLoading(false); return }

    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    window.location.href = redirect || '/'
  }

  async function handleForgotPassword() {
    if (!email) { setError('Please enter your email address.'); return }
    setLoading(true)
    setError('')

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://tittymaps.com/auth',
    })

    setLoading(false)
    if (resetError) {
      setError(resetError.message)
    } else {
      setSuccess('Password reset email sent! Check your inbox.')
    }
  }

  const resetForm = () => {
    setError('')
    setSuccess('')
    setEmailOrUsername('')
    setEmail('')
    setPassword('')
    setUsername('')
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
              {mode === 'login' ? 'Welcome back' : mode === 'signup' ? 'Create an account' : 'Reset your password'}
            </h1>
            <p style={{ color: '#8890c0', fontSize: 14, margin: 0 }}>
              {mode === 'login' ? 'Sign in to leave reviews and manage your profile'
                : mode === 'signup' ? 'Join TittyMaps to leave reviews and build your profile'
                : 'Enter your email and we will send you a reset link'}
            </p>
          </div>

          {mode !== 'forgot' && (
            <div style={{ display: 'flex', background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 4, marginBottom: 24 }}>
              <button onClick={() => { setMode('login'); resetForm() }}
                style={{ flex: 1, padding: '10px', background: mode === 'login' ? '#FF2D78' : 'transparent', border: 'none', borderRadius: 10, color: mode === 'login' ? 'white' : '#8890c0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Log In
              </button>
              <button onClick={() => { setMode('signup'); resetForm() }}
                style={{ flex: 1, padding: '10px', background: mode === 'signup' ? '#FF2D78' : 'transparent', border: 'none', borderRadius: 10, color: mode === 'signup' ? 'white' : '#8890c0', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                Sign Up
              </button>
            </div>
          )}

          {mode === 'signup' && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Username</div>
              <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Choose a username"
                style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          )}

          {mode === 'forgot' ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Email</div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
                style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          ) : mode === 'signup' ? (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Email</div>
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email"
                style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          ) : (
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Email or username</div>
              <input value={emailOrUsername} onChange={e => setEmailOrUsername(e.target.value)} placeholder="your@email.com or username"
                style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
            </div>
          )}

          {mode !== 'forgot' && (
            <div style={{ marginBottom: mode === 'login' ? 8 : 20 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Password</div>
              <div style={{ position: 'relative' }}>
                <input value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : 'Your password'}
                  type={showPassword ? 'text' : 'password'}
                  style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 44px 12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
                <button onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#8890c0', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1 }}>
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: 20 }}>
              <span onClick={() => { setMode('forgot'); resetForm() }} style={{ color: '#8890c0', fontSize: 12, cursor: 'pointer' }}>
                Forgot password?
              </span>
            </div>
          )}

          {error && (
            <div style={{ background: '#2e1a1a', border: '1px solid #ff4444', borderRadius: 10, padding: '12px 14px', color: '#ff4444', fontSize: 13, marginBottom: 14 }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: '#1a2e1a', border: '1px solid #3acd60', borderRadius: 10, padding: '12px 14px', color: '#7aff9a', fontSize: 13, marginBottom: 14 }}>
              {success}
            </div>
          )}

          <button
            onClick={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgotPassword}
            disabled={loading}
            style={{ width: '100%', background: loading ? '#333' : '#FF2D78', color: 'white', border: 'none', borderRadius: 12, padding: '14px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16 }}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : mode === 'signup' ? 'Create Account' : 'Send Reset Email'}
          </button>

          <div style={{ textAlign: 'center' }}>
            {mode === 'login' ? (
              <span style={{ color: '#8890c0', fontSize: 13 }}>
                Don&apos;t have an account?{' '}
                <span onClick={() => { setMode('signup'); resetForm() }} style={{ color: '#FF2D78', cursor: 'pointer' }}>Sign up</span>
              </span>
            ) : mode === 'signup' ? (
              <span style={{ color: '#8890c0', fontSize: 13 }}>
                Already have an account?{' '}
                <span onClick={() => { setMode('login'); resetForm() }} style={{ color: '#FF2D78', cursor: 'pointer' }}>Log in</span>
              </span>
            ) : (
              <span onClick={() => { setMode('login'); resetForm() }} style={{ color: '#FF2D78', fontSize: 13, cursor: 'pointer' }}>
                ← Back to log in
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
