'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const FANSLY_REF = 'YOUR_REF_CODE_HERE'
const FANSLY_SIGNUP = `https://fansly.com/signup?ref=${FANSLY_REF}`

export default function BecomeADancer() {
  const [clubs, setClubs] = useState<any[]>([])
  const [selectedClubs, setSelectedClubs] = useState<string[]>([])
  const [stageName, setStageName] = useState('')
  const [fanslyUsername, setFanslyUsername] = useState('')
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchClubs()
  }, [])

  async function fetchClubs() {
    const { data } = await supabase.from('clubs').select('id, name, city, state').order('name')
    setClubs(data || [])
  }

  function toggleClub(name: string) {
    setSelectedClubs(prev => {
      if (prev.includes(name)) return prev.filter(c => c !== name)
      if (prev.length >= 3) return prev
      return [...prev, name]
    })
  }

  async function handleSubmit() {
    if (!stageName || !fanslyUsername || !email || selectedClubs.length === 0) {
      setError('Please fill out all fields and select at least one club.')
      return
    }
    setLoading(true)
    setError('')
    const { error: dbError } = await supabase.from('dancer_applications').insert({
      stage_name: stageName,
      fansly_username: fanslyUsername,
      club_names: selectedClubs,
      email: email,
    })
    setLoading(false)
    if (dbError) {
      setError('Something went wrong. Please try again.')
    } else {
      setSubmitted(true)
    }
  }

  if (submitted) return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>💃</div>
      <h2 style={{ color: 'white', fontSize: 22, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>You are on the list!</h2>
      <p style={{ color: '#8890c0', fontSize: 14, textAlign: 'center', maxWidth: 300, marginBottom: 24 }}>We will review your application and get your profile live soon. Make sure you have signed up for Fansly through our link to be featured!</p>
      <a href={FANSLY_SIGNUP} target="_blank" rel="noopener noreferrer"
        style={{ display: 'block', background: '#FF2D78', color: 'white', padding: '14px 28px', borderRadius: 12, fontSize: 15, fontWeight: 700, textDecoration: 'none', marginBottom: 12 }}>
        Sign up for Fansly
      </a>
      <button onClick={() => window.location.href = '/'} style={{ background: 'transparent', border: 'none', color: '#8890c0', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
        Back to map
      </button>
    </div>
  )

  const howItWorks = [
    {
      icon: '💋',
      title: 'Sign up for Fansly through our link',
      body: 'We partner with Fansly to bring you more fans. Signing up through our link costs you nothing extra. You make the same money, but it gives us a small referral bonus that helps us keep promoting your profile for free.'
    },
    {
      icon: '📍',
      title: 'Your profile gets pinned to the map',
      body: 'Once approved, your dancer profile appears on TittyMaps linked to the clubs you perform at. Club-goers planning their night out will see your profile before they even walk in the door.'
    },
    {
      icon: '🌟',
      title: 'Featured badge on your profile',
      body: 'You get a Featured badge, your own profile page, and a direct link to your Fansly driving real fans to your content.'
    },
  ]

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 60 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => window.location.href = '/'} style={{ background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
          Back
        </button>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#FF2D78', fontWeight: 700, fontSize: 16 }}>Titty</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Maps</span>
          <span style={{ color: '#FFD700', fontSize: 11 }}>.com</span>
        </div>
      </div>

      <div style={{ background: '#131629', padding: '32px 20px 24px', textAlign: 'center', borderBottom: '1px solid #1e2140' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>💃</div>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Get Featured on TittyMaps</h1>
        <p style={{ color: '#8890c0', fontSize: 14, maxWidth: 340, margin: '0 auto' }}>
          Reach thousands of club-goers in your area looking for performers near them.
        </p>
      </div>

      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e2140' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>How it works</div>
        {howItWorks.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#131629', border: '1px solid #1e2140', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
              {item.icon}
            </div>
            <div>
              <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
              <div style={{ color: '#8890c0', fontSize: 13, lineHeight: 1.5 }}>{item.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #FF2D78', padding: '20px', marginBottom: 24, textAlign: 'center' }}>
          <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Step 1 — Sign up for Fansly</div>
          <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 16 }}>Use our link so we can feature you for free. It takes 2 minutes and does not cost you anything.</div>
          <a href={FANSLY_SIGNUP} target="_blank" rel="noopener noreferrer"
            style={{ display: 'block', background: '#FF2D78', color: 'white', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
            Sign up for Fansly through our link
          </a>
        </div>

        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Step 2 — Submit your info</div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Stage name</div>
          <input value={stageName} onChange={e => setStageName(e.target.value)} placeholder="Your stage name"
            style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Fansly username</div>
          <input value={fanslyUsername} onChange={e => setFanslyUsername(e.target.value)} placeholder="Your Fansly username"
            style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Your email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="We will contact you when you are approved" type="email"
            style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Which clubs do you perform at? (pick up to 3)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {clubs.map(club => {
              const selected = selectedClubs.includes(club.name)
              return (
                <div key={club.id} onClick={() => toggleClub(club.name)}
                  style={{
                    background: selected ? '#1a0d2e' : '#131629',
                    border: `1px solid ${selected ? '#FF2D78' : '#1e2140'}`,
                    borderRadius: 10, padding: '12px 14px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                  <div>
                    <div style={{ color: 'white', fontSize: 14 }}>{club.name}</div>
                    <div style={{ color: '#8890c0', fontSize: 11 }}>{club.city}, {club.state}</div>
                  </div>
                  {selected && <span style={{ color: '#FF2D78', fontSize: 18 }}>✓</span>}
                </div>
              )
            })}
          </div>
        </div>

        {error && <div style={{ color: '#ff4444', fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', background: loading ? '#333' : '#FF2D78', color: 'white', border: 'none', borderRadius: 12, padding: '15px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'Submitting...' : 'Apply to be Featured'}
        </button>

        <div style={{ color: '#555', fontSize: 11, textAlign: 'center', marginTop: 12 }}>
          By applying you confirm you are 18 or older and agree to our terms.
        </div>
      </div>
    </div>
  )
}
