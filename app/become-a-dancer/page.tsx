'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const FANSLY_REF = 'tittymaps'
const FANSLY_SIGNUP = `https://fansly.com/application/form?r=${FANSLY_REF}`
const TWITTER_DM = 'https://x.com/messages/compose?recipient_id=TittyMaps'

function TwitterDMButton() {
  return (
    <a href={TWITTER_DM} target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, background: '#000', color: 'white', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      DM us on X @TittyMaps
    </a>
  )
}

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
  const [totalDancers, setTotalDancers] = useState(0)

  useEffect(() => {
    fetchClubs()
    fetchDancerCount()
  }, [])

  async function fetchClubs() {
    const { data } = await supabase.from('clubs').select('id, name, city, state').order('name')
    setClubs(data || [])
  }

  async function fetchDancerCount() {
    const { count } = await supabase.from('dancers').select('*', { count: 'exact', head: true })
    setTotalDancers(count || 0)
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
    if (!stageName || !fanslyUsername) {
      setError('Please fill out your stage name and Fansly link.')
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
      club_names: selectedClubs.length > 0 ? selectedClubs : null,
      email: email || null,
      photo_url: uploadedUrls[0] || null,
      photo_urls: uploadedUrls.length > 0 ? uploadedUrls : null,
    })

    if (!dbError) {
      await fetch('/api/notify-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage_name: stageName,
          fansly_url: fanslyUsername,
          email: email || 'No email provided',
          club_names: selectedClubs,
        })
      })
    }

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
      <p style={{ color: '#8890c0', fontSize: 14, textAlign: 'center', maxWidth: 300, marginBottom: 24 }}>We will review your application and get your profile live soon. DM us on X if you have any questions!</p>
      <div style={{ width: '100%', maxWidth: 360, marginBottom: 16 }}>
        <TwitterDMButton />
      </div>
      <button onClick={() => window.location.href = '/'} style={{ background: 'transparent', border: 'none', color: '#8890c0', fontSize: 13, cursor: 'pointer', marginTop: 8 }}>
        Back to map
      </button>
    </div>
  )

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 60 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => window.location.href = '/'} style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>Back</button>
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
      </div>

      {/* Hero */}
      <div style={{ background: '#131629', padding: '32px 20px 28px', textAlign: 'center', borderBottom: '1px solid #1e2140' }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>💃</div>
        <h1 style={{ color: 'white', fontSize: 24, fontWeight: 700, margin: '0 0 8px' }}>Get Featured on TittyMaps</h1>
        <p style={{ color: '#8890c0', fontSize: 14, maxWidth: 320, margin: '0 auto 16px' }}>
          Free to list. You keep 100% of your earnings. We earn from Fansly&apos;s cut — not yours.
        </p>

        {/* Social proof */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#1a0d2e', border: '1px solid #FF2D78', borderRadius: 20, padding: '6px 16px', marginBottom: 20 }}>
          <span style={{ fontSize: 14 }}>💃</span>
          <span style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>Join {totalDancers}+ featured performers</span>
        </div>

        {/* Benefits — compact */}
        <div style={{ background: '#1a0d2e', border: '1px solid #FF2D78', borderRadius: 14, padding: '14px', maxWidth: 360, margin: '0 auto', textAlign: 'left' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { icon: '🔝', text: 'Top placement on every club and dancer list' },
              { icon: '⭐', text: 'Gold Featured badge on your profile' },
              { icon: '🔗', text: 'Direct link to your Fansly from your profile' },
              { icon: '💰', text: 'We promote you — we earn from Fansly\'s cut, never yours' },
            ].map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{b.icon}</span>
                <span style={{ color: 'white', fontSize: 13 }}>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Fansly referral — prominent but concise */}
      <div style={{ background: '#1a0d2e', border: '2px solid #FF2D78', margin: '16px 20px', borderRadius: 14, padding: '16px 14px' }}>
        <div style={{ color: '#FF2D78', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 }}>⭐ Unlock your Featured badge</div>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Apply as a Fansly creator through our link</div>
        <div style={{ color: '#8890c0', fontSize: 13, lineHeight: 1.5, marginBottom: 12 }}>
          Free to apply. We get a cut from Fansly&apos;s standard fee — it never touches your earnings. This is what unlocks your Featured badge.
        </div>
        <a href={FANSLY_SIGNUP} target="_blank" rel="noopener noreferrer"
          style={{ display: 'block', background: '#FF2D78', color: 'white', borderRadius: 10, padding: '12px 14px', fontSize: 14, fontWeight: 700, textDecoration: 'none', textAlign: 'center', boxShadow: '0 4px 20px rgba(255,45,120,0.4)' }}>
          👆 Apply as Fansly creator — unlock Featured
        </a>
        <div style={{ color: '#555', fontSize: 11, textAlign: 'center', marginTop: 8 }}>Already on Fansly? Skip this and fill the form below</div>
      </div>

      {/* DM option */}
      <div style={{ margin: '0 20px 16px', background: '#131629', borderRadius: 14, border: '1px solid #1e2140', padding: '16px' }}>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Prefer to DM us instead? 💬</div>
        <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 12 }}>Send us your stage name and Fansly link on X — we respond to every DM and will get you listed fast.</div>
        <TwitterDMButton />
      </div>

      {/* Form */}
      <div style={{ padding: '4px 20px 20px', background: '#0a0b14', borderTop: '1px solid #1e2140' }}>

        <div style={{ color: '#8890c0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, margin: '20px 0 16px' }}>Or fill out the form</div>

        {/* Photos */}
        <div style={{ background: '#131629', borderRadius: 14, border: '1px solid #1e2140', padding: '16px', marginBottom: 12 }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>📷 Photos <span style={{ color: '#8890c0', fontWeight: 400, fontSize: 11 }}>(optional, up to 3)</span></div>
          <div style={{ color: '#555', fontSize: 11, marginBottom: 12 }}>First photo becomes your profile picture.</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {photoPreviews.map((preview, i) => (
              <div key={i} style={{ position: 'relative', width: 80, height: 80, borderRadius: 10, overflow: 'hidden', flexShrink: 0 }}>
                <img src={preview} alt={`photo ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <button onClick={() => removePhoto(i)}
                  style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: 'white', width: 20, height: 20, fontSize: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  x
                </button>
                {i === 0 && <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(255,45,120,0.85)', color: 'white', fontSize: 9, textAlign: 'center', padding: '2px 0' }}>Profile pic</div>}
              </div>
            ))}
            {photos.length < 3 && (
              <label style={{ width: 80, height: 80, borderRadius: 10, background: '#0D0F1E', border: '2px dashed #FF2D78', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, flexDirection: 'column', gap: 4 }}>
                <span style={{ fontSize: 24 }}>📷</span>
                <span style={{ color: '#FF2D78', fontSize: 9, fontWeight: 600 }}>Add photo</span>
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: 'none' }} />
              </label>
            )}
          </div>
        </div>

        {/* Stage name */}
        <div style={{ background: '#131629', borderRadius: 14, border: '1px solid #1e2140', padding: '16px', marginBottom: 12 }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>💃 Stage name <span style={{ color: '#FF2D78', fontSize: 11 }}>*</span></div>
          <input value={stageName} onChange={e => setStageName(e.target.value)} placeholder="Your stage name"
            style={{ width: '100%', background: '#0D0F1E', border: '1px solid #2a2d50', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 16, boxSizing: 'border-box' }} />
        </div>

        {/* Fansly link */}
        <div style={{ background: '#131629', borderRadius: 14, border: '1px solid #1e2140', padding: '16px', marginBottom: 12 }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>🔗 Fansly profile link <span style={{ color: '#FF2D78', fontSize: 11 }}>*</span></div>
          <input value={fanslyUsername} onChange={e => setFanslyUsername(e.target.value)} placeholder="https://fansly.com/yourname"
            style={{ width: '100%', background: '#0D0F1E', border: '1px solid #2a2d50', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 16, boxSizing: 'border-box' }} />
        </div>

        {/* Email */}
        <div style={{ background: '#131629', borderRadius: 14, border: '1px solid #1e2140', padding: '16px', marginBottom: 12 }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>📧 Email <span style={{ color: '#555', fontSize: 11, fontWeight: 400 }}>optional</span></div>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 8 }}>We will notify you when your profile goes live</div>
          <input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
            style={{ width: '100%', background: '#0D0F1E', border: '1px solid #2a2d50', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 16, boxSizing: 'border-box' }} />
        </div>

        {/* Club selection — optional and collapsible feel */}
        <div style={{ background: '#131629', borderRadius: 14, border: '1px solid #1e2140', padding: '16px', marginBottom: 20 }}>
          <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>🏛️ Where do you perform? <span style={{ color: '#555', fontSize: 11, fontWeight: 400 }}>optional, pick up to 3</span></div>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 10 }}>Helps us link you to the right club pages</div>
          <input value={clubSearch} onChange={e => setClubSearch(e.target.value)} placeholder="Search clubs by name or city..."
            style={{ width: '100%', background: '#0D0F1E', border: '1px solid #2a2d50', borderRadius: 10, padding: '10px 14px', color: 'white', fontSize: 16, boxSizing: 'border-box', marginBottom: 10 }} />
          {selectedClubs.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {selectedClubs.map(name => (
                <span key={name} onClick={() => toggleClub(name)} style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '3px 10px', fontSize: 11, cursor: 'pointer' }}>
                  {name} ✕
                </span>
              ))}
            </div>
          )}
          {clubSearch.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
              {filteredClubs.length === 0
                ? <div style={{ color: '#8890c0', fontSize: 13, padding: '12px 0', textAlign: 'center' }}>No clubs found</div>
                : filteredClubs.map(club => {
                  const selected = selectedClubs.includes(club.name)
                  return (
                    <div key={club.id} onClick={() => toggleClub(club.name)}
                      style={{ background: selected ? '#1a0d2e' : '#0D0F1E', border: `1px solid ${selected ? '#FF2D78' : '#2a2d50'}`, borderRadius: 10, padding: '10px 14px', cursor: selectedClubs.length >= 3 && !selected ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: selectedClubs.length >= 3 && !selected ? 0.4 : 1 }}>
                      <div>
                        <div style={{ color: 'white', fontSize: 13 }}>{club.name}</div>
                        <div style={{ color: '#8890c0', fontSize: 11 }}>{club.city}, {club.state}</div>
                      </div>
                      {selected && <span style={{ color: '#FF2D78', fontSize: 18 }}>✓</span>}
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {error && (
          <div style={{ background: '#2e1a1a', border: '1px solid #ff4444', borderRadius: 10, padding: '12px 14px', color: '#ff4444', fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', background: loading ? '#333' : 'linear-gradient(135deg, #FF2D78, #cc0055)', color: 'white', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 4px 20px rgba(255,45,120,0.4)', marginBottom: 12 }}>
          {loading ? 'Submitting...' : '💃 Get Featured on TittyMaps'}
        </button>

        <div style={{ color: '#555', fontSize: 11, textAlign: 'center', marginBottom: 20 }}>
          By applying you confirm you are 18 or older and agree to our terms. Only 2 required fields — takes under a minute.
        </div>

        <TwitterDMButton />

      </div>
    </div>
  )
}
