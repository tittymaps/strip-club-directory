'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const FANSLY_REF = 'tittymaps'
const FANSLY_SIGNUP = `https://fansly.com/application/form?r=${FANSLY_REF}`

export default function BecomeADancer() {
  const [clubs, setClubs] = useState<any[]>([])
  const [clubSearch, setClubSearch] = useState('')
  const [selectedClubs, setSelectedClubs] = useState<string[]>([])
  const [stageName, setStageName] = useState('')
  const [fanslyUsername, setFanslyUsername] = useState('')
  const [email, setEmail] = useState('')
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchClubs() }, [])

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

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const remaining = 3 - photos.length
    const newFiles = files.slice(0, remaining)
    setPhotos(prev => [...prev, ...newFiles])
    setPhotoPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))])
  }

  function removePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!stageName || !fanslyUsername || !email || selectedClubs.length === 0) {
      setError('Please fill out all fields and select at least one club.')
      return
    }
    setLoading(true)
    setError('')

    const uploadedUrls: string[] = []
    for (const photo of photos) {
      const fileExt = photo.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage
        .from('dancer-photos')
        .upload(fileName, photo)
      if (uploadError) {
        setError('Photo upload failed. Please try again.')
        setLoading(false)
        return
      }
      const { data: urlData } = supabase.storage.from('dancer-photos').getPublicUrl(fileName)
      uploadedUrls.push(urlData.publicUrl)
    }

    const { error: dbError } = await supabase.from('dancer_applications').insert({
      stage_name: stageName,
      fansly_url: fanslyUsername,
      club_names: selectedClubs,
      email: email,
      photo_url: uploadedUrls[0] || null,
      photo_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
    })

    setLoading(false)
    if (dbError) {
      setError('Something went wrong. Please try again.')
    } else {
      setSubmitted(true)
    }
  }

  const filteredClubs = clubs.filter(c =>
    c.name.toLowerCase().includes(clubSearch.toLowerCase()) ||
    c.city.toLowerCase().includes(clubSearch.toLowerCase())
  )

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
    { icon: '💋', title: 'Sign up for Fansly through our link', body: 'Signing up through our link costs you nothing extra. You make the same money, but it gives us a small referral bonus that helps us keep promoting your profile for free.' },
    { icon: '📍', title: 'Your profile gets pinned to the map', body: 'Once approved, your dancer profile appears on TittyMaps linked to the clubs you perform at. Club-goers planning their night out will see your profile before they even walk in the door.' },
    { icon: '🌟', title: 'Featured badge on your profile', body: 'You get a Featured badge, your own profile page, and a direct link to your Fansly driving real fans to your content.' },
  ]

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 60 }}>
      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={() => window.location.href = '/'} style={{ background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Back</button>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#FF2D78', fontWeight: 700, fontSize: 16 }}>Titty</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Maps</span>
          <span style={{ color: '#FFD700', fontSize: 11 }}>.com</span>
        </div>
      </div>

      <div style={{ background: '#131629', padding: '32px 20px 24px', textAlign: 'center', borderBottom: '1px solid #1e2140' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>💃</div>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Get Featured on TittyMaps</h1>
        <p style={{ color: '#8890c0', fontSize: 14, maxWidth: 340, margin: '0 auto' }}>Reach thousands of club-goers in your area looking for performers near them.</p>
      </div>

      <div style={{ padding: '24px 20px', borderBottom: '1px solid #1e2140' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>How it works</div>
        {howItWorks.map((item, i) => (
          <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#131629', border: '1px solid #1e2140', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
            <div>
              <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.title}</div>
              <div style={{ color: '#8890c0', fontSize: 13, lineHeight: 1.5 }}>{item.body}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #FF2D78', padding: '20px', marginBottom: 16, textAlign: 'center' }}>
  <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Want to be a Featured Dancer?</div>
  <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 16 }}>Sign up for Fansly through our link to get your Featured badge and priority placement. It does not cost you anything extra.</div>
  <a href={FANSLY_SIGNUP} target="_blank" rel="noopener noreferrer"
    style={{ display: 'block', background: '#FF2D78', color: 'white', padding: '13px', borderRadius: 10, fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
    Sign up for Fansly through our link
  </a>
</div>

<div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: '14px 16px', marginBottom: 24 }}>
  <div style={{ color: '#8890c0', fontSize: 12, lineHeight: 1.5 }}>Already have Fansly? You can still get listed as a Dancer without the Featured badge. Just fill out the form below and leave your existing Fansly link</div>
</div>

<div style={{ color: '#8890c0', fontSize: 11, marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 }}>Your info</div>

        {/* Photo upload */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Photos (up to 3)</div>
          <div style={{ color: '#555', fontSize: 11, marginBottom: 10 }}>First photo becomes your profile picture. All photos appear on your profile page.</div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            {photoPreviews.map((preview, i) => (
              <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <img src={preview} alt={`photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removePhoto(i)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: 'white', width: 20, height: 20, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  ✕
                </button>
                {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,45,120,0.8)', color: 'white', fontSize: 9, textAlign: 'center', padding: '2px 0' }}>Profile pic</div>}
              </div>
            ))}
            {photos.length < 3 && (
              <label style={{ width: 80, height: 80, borderRadius: 10, background: '#131629', border: '2px dashed #3a3d60', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 24 }}>📷</span>
                <span style={{ color: '#8890c0', fontSize: 9 }}>Add photo</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Stage name</div>
          <input value={stageName} onChange={e => setStageName(e.target.value)} placeholder="Your stage name"
            style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Fansly profile link</div>
            <input value={fanslyUsername} onChange={e => setFanslyUsername(e.target.value)} placeholder="https://fansly.com/yourname"
            style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 14 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Your email</div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="We will contact you when you are approved" type="email"
            style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: 24 }}>
          <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Which clubs do you perform at? (pick up to 3)</div>
          <input value={clubSearch} onChange={e => setClubSearch(e.target.value)} placeholder="Search clubs by name or city..."
            style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 13, boxSizing: 'border-box', marginBottom: 8 }} />
          {selectedClubs.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
              {selectedClubs.map(name => (
                <span key={name} onClick={() => toggleClub(name)} style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>
                  {name} ✕
                </span>
              ))}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 280, overflowY: 'auto' }}>
            {filteredClubs.length === 0
              ? <div style={{ color: '#8890c0', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>No clubs found</div>
              : filteredClubs.map(club => {
                const selected = selectedClubs.includes(club.name)
                return (
                  <div key={club.id} onClick={() => toggleClub(club.name)}
                    style={{ background: selected ? '#1a0d2e' : '#131629', border: `1px solid ${selected ? '#FF2D78' : '#1e2140'}`, borderRadius: 10, padding: '12px 14px', cursor: selectedClubs.length >= 3 && !selected ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: selectedClubs.length >= 3 && !selected ? 0.4 : 1 }}>
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
