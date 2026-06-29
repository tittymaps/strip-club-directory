'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'
import ProfileButton from '../../components/ProfileButton'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

const STATE_NAMES: Record<string, string> = {
  AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
  CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
  HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
  KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
  MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
  MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
  NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
  OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
  SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
  VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
  DC: 'Washington D.C.'
}

function getTodayKey() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
  return days[new Date().getDay()]
}

function getTodayFullName() {
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return days[new Date().getDay()]
}

function is24Hours(hours: any) {
  if (!hours) return false
  return Object.values(hours).some((h: any) =>
    typeof h === 'string' && h.toLowerCase().includes('24')
  )
}

function TwitterBanner() {
  return (
    <a href="https://x.com/TittyMaps" target="_blank" rel="noopener noreferrer"
      style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: '14px 16px', textDecoration: 'none' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>Stay in the loop</div>
        <div style={{ color: '#8890c0', fontSize: 12 }}>Follow us for new clubs, dancers and updates — <span style={{ color: '#FF2D78', fontWeight: 600 }}>@TittyMaps</span></div>
      </div>
      <div style={{ background: '#000', color: 'white', fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 20, flexShrink: 0 }}>Follow</div>
    </a>
  )
}

export default function ClubDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [club, setClub] = useState<any>(null)
  const [dancers, setDancers] = useState<any[]>([])
  const [fullPhoto, setFullPhoto] = useState<string | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [nearbyClubs, setNearbyClubs] = useState<any[]>([])
  const [profileAvatars, setProfileAvatars] = useState<Record<string, string>>({})
  const [showAllHours, setShowAllHours] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewTitle, setReviewTitle] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [updateSubmitted, setUpdateSubmitted] = useState(false)
  const [updateLoading, setUpdateLoading] = useState(false)
  const [updateForm, setUpdateForm] = useState({
    name: '', address: '', city: '', state: '',
    nude_level: '', bar_type: '', cover_charge: '',
    hours: { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' },
    additional_comments: ''
  })

  useEffect(() => {
    if (id) {
      fetchClub()
      fetchReviews()
    }
  }, [id])

  useEffect(() => {
    if (club) {
      const params = new URLSearchParams(window.location.search)
      if (params.get('update') === 'true') {
        setShowUpdateForm(true)
        window.history.replaceState({}, '', `/clubs/${id}`)
      }
    }
  }, [club])

  async function fetchClub() {
    const { data } = await supabase.from('clubs').select('*').eq('id', id).single()
    setClub(data)
    if (data) {
      setUpdateForm({
        name: data.name || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        nude_level: data.nude_level || '',
        bar_type: data.bar_type || '',
        cover_charge: data.cover_charge || '',
        hours: data.hours || { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' },
        additional_comments: ''
      })
      const { data: dancerData } = await supabase
        .from('dancers')
        .select('*')
        .contains('club_ids', [data.id])
      setDancers(dancerData || [])
      fetchNearbyClubs(data)
    }
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('club_id', id)
      .order('created_at', { ascending: false })
    setReviews(data || [])
    if (data) fetchProfileAvatars(data)
  }

  async function fetchProfileAvatars(reviewData: any[]) {
    const usernames = reviewData.filter(r => r.profile_username).map(r => r.profile_username)
    if (usernames.length === 0) return
    const { data } = await supabase.from('profiles').select('username, avatar_url').in('username', usernames)
    if (!data) return
    const map: Record<string, string> = {}
    data.forEach(p => { if (p.avatar_url) map[p.username] = p.avatar_url })
    setProfileAvatars(map)
  }

  async function fetchNearbyClubs(club: any) {
    if (!club.latitude || !club.longitude) return
    const { data } = await supabase.from('clubs').select('*').neq('id', club.id)
    if (!data) return
    const withDistance = data
      .filter(c => c.latitude && c.longitude)
      .map(c => ({ ...c, distance: getDistance(club.latitude, club.longitude, c.latitude, c.longitude) }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
    setNearbyClubs(withDistance)
  }

  function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3958.8
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  async function handleUpdateClick() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      window.location.href = `/auth?redirect=/clubs/${id}?update=true`
      return
    }
    setShowUpdateForm(true)
  }

  async function submitUpdate() {
    setUpdateLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    const { data: profile } = user
      ? await supabase.from('profiles').select('username').eq('id', user.id).single()
      : { data: null }
    await supabase.from('club_update_requests').insert({
      club_id: id,
      club_name: club.name,
      user_id: user?.id || null,
      profile_username: profile?.username || null,
      name: updateForm.name,
      address: updateForm.address,
      city: updateForm.city,
      state: updateForm.state,
      nude_level: updateForm.nude_level,
      bar_type: updateForm.bar_type,
      cover_charge: updateForm.cover_charge,
      hours: updateForm.hours,
      additional_comments: updateForm.additional_comments,
      status: 'pending',
    })
    setUpdateLoading(false)
    setUpdateSubmitted(true)
  }

  async function submitReview() {
    if (!reviewRating || !reviewText) {
      setReviewError('Please select a star rating and write a review.')
      return
    }
    setReviewLoading(true)
    setReviewError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = `/auth?redirect=/clubs/${id}`; return }
    const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
    const { error } = await supabase.from('reviews').insert({
      club_id: id,
      username: profile?.username || user.email,
      email: user.email,
      rating: reviewRating,
      title: reviewTitle || null,
      review: reviewText,
      user_id: user.id,
      profile_username: profile?.username,
    })
    setReviewLoading(false)
    if (error) {
      if (error.code === '23505') {
        setReviewError('You have already reviewed this club.')
      } else {
        setReviewError('Something went wrong. Please try again.')
      }
    } else {
      setReviewSuccess(true)
      setShowReviewForm(false)
      setReviewRating(0)
      setReviewTitle('')
      setReviewText('')
      fetchReviews()
    }
  }

  function avgRating() {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
  }

  function StarDisplay({ rating, size = 16 }: { rating: number, size?: number }) {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        {[1,2,3,4,5].map(s => (
          <span key={s} style={{ fontSize: size, color: s <= rating ? '#FFD700' : '#3a3d60' }}>★</span>
        ))}
      </div>
    )
  }

  if (!club) return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#FF2D78', fontSize: 16 }}>Loading...</div>
    </div>
  )

  const todayKey = getTodayKey()
  const todayHours = club.hours?.[todayKey]
  const isBarista = club.nude_level === 'bikini' && club.bar_type === 'cafe'
  const isLingerie = club.nude_level === 'full_nude' && club.bar_type === 'none' && is24Hours(club.hours)

  const sectionLabel = isLingerie ? 'Models' : isBarista ? 'Baristas' : 'Dancers'
  const addLabel = isLingerie ? '+ Add Model' : isBarista ? '+ Add Barista' : '+ Add Dancer'
  const addSubtitle = isLingerie ? 'Model here?\nGet featured!' : isBarista ? 'Work here?\nGet featured!' : 'Perform here?\nGet featured!'

  const AddPerformerCard = () => (
    <div
      onClick={() => window.location.href = '/become-a-dancer'}
      style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#0D0F1E', border: '2px dashed #FF2D78', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <div style={{ fontSize: 32 }}>💃</div>
      <div style={{ background: '#FF2D78', color: 'white', fontSize: 10, fontWeight: 700, fontFamily: 'sans-serif', borderRadius: 20, padding: '4px 10px' }}>{addLabel}</div>
      <div style={{ color: '#8890c0', fontSize: 9, fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.3, padding: '0 8px' }}>{addSubtitle.split('\n').map((line, i) => <span key={i}>{line}{i === 0 ? <br/> : ''}</span>)}</div>
    </div>
  )

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 100 }}>

      {fullPhoto && (
        <div onClick={() => setFullPhoto(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={fullPhoto} alt="full size" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setFullPhoto(null)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', width: 36, height: 36, fontSize: 16, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      {showUpdateForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, overflowY: 'auto', padding: 16 }}>
          <div style={{ background: '#0D0F1E', borderRadius: 16, border: '1px solid #1e2140', padding: 20, maxWidth: 500, margin: '0 auto' }}>
            {updateSubmitted ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
                <div style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Thank you!</div>
                <div style={{ color: '#8890c0', fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Your update request has been submitted. We will review it and make any necessary changes shortly.</div>
                <button onClick={() => { setShowUpdateForm(false); setUpdateSubmitted(false) }}
                  style={{ background: '#FF2D78', border: 'none', borderRadius: 12, color: 'white', padding: '10px 24px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                  Close
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <div>
                    <div style={{ color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Update Club Info</div>
                    <div style={{ color: '#8890c0', fontSize: 12 }}>Changes will be reviewed before going live</div>
                  </div>
                  <button onClick={() => setShowUpdateForm(false)} style={{ background: 'transparent', border: 'none', color: '#8890c0', fontSize: 20, cursor: 'pointer' }}>✕</button>
                </div>
                {[
                  { label: 'Club name', key: 'name', placeholder: 'Club name' },
                  { label: 'Address', key: 'address', placeholder: 'Street address' },
                  { label: 'City', key: 'city', placeholder: 'City' },
                  { label: 'State', key: 'state', placeholder: 'e.g. ME' },
                  { label: 'Cover charge', key: 'cover_charge', placeholder: 'e.g. $10 weekdays' },
                ].map(field => (
                  <div key={field.key} style={{ marginBottom: 12 }}>
                    <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>{field.label}</div>
                    <input value={(updateForm as any)[field.key]}
                      onChange={e => setUpdateForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box' }} />
                  </div>
                ))}
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Nude level</div>
                  <select value={updateForm.nude_level} onChange={e => setUpdateForm(prev => ({ ...prev, nude_level: e.target.value }))}
                    style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13 }}>
                    <option value="">Select...</option>
                    <option value="full_nude">Full nude</option>
                    <option value="topless">Topless</option>
                    <option value="bikini">Bikini</option>
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Bar type</div>
                  <select value={updateForm.bar_type} onChange={e => setUpdateForm(prev => ({ ...prev, bar_type: e.target.value }))}
                    style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13 }}>
                    <option value="">Select...</option>
                    <option value="full_bar">Full bar</option>
                    <option value="byob">BYOB</option>
                    <option value="cafe">Cafe</option>
                    <option value="none">No bar</option>
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 8 }}>Hours</div>
                  {DAYS.map(day => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ color: '#8890c0', fontSize: 12, width: 30 }}>{day}</span>
                      <input value={updateForm.hours[day as keyof typeof updateForm.hours]}
                        onChange={e => setUpdateForm(prev => ({ ...prev, hours: { ...prev.hours, [day]: e.target.value } }))}
                        placeholder="e.g. 8pm-2am or Closed"
                        style={{ flex: 1, background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '7px 10px', color: 'white', fontSize: 12 }} />
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 20 }}>
                  <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Additional comments</div>
                  <textarea value={updateForm.additional_comments}
                    onChange={e => setUpdateForm(prev => ({ ...prev, additional_comments: e.target.value }))}
                    placeholder="Describe any specific changes or corrections..."
                    rows={3}
                    style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
                </div>
                <button onClick={submitUpdate} disabled={updateLoading}
                  style={{ width: '100%', background: updateLoading ? '#333' : '#FF2D78', color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: updateLoading ? 'not-allowed' : 'pointer' }}>
                  {updateLoading ? 'Submitting...' : 'Submit Update Request'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
        <ProfileButton />
      </div>

      <div style={{ background: '#131629', borderBottom: '1px solid #1e2140', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div onClick={() => club.photo_url && setFullPhoto(club.photo_url)}
            style={{ width: 56, height: 56, borderRadius: 14, background: club.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, cursor: club.photo_url ? 'pointer' : 'default' }}>
            {club.photo_url
              ? <img src={`${club.photo_url}?width=400&quality=75`} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (club.is_featured ? '🌟' : '💜')}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{club.name}</div>
            {club.address && <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 4 }}>{club.address}</div>}
            <div style={{ fontSize: 15, marginBottom: 8 }}>
              <span onClick={() => window.location.href = `/states/${club.state.toLowerCase()}/${encodeURIComponent(club.city)}`} style={{ color: '#7ab8ff', textDecoration: 'underline', cursor: 'pointer' }}>{club.city}</span>
              <span style={{ color: '#8890c0' }}>, </span>
              <span onClick={() => window.location.href = `/states/${club.state.toLowerCase()}`} style={{ color: '#7ab8ff', textDecoration: 'underline', cursor: 'pointer' }}>{STATE_NAMES[club.state] || club.state}</span>
            </div>
            {reviews.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <StarDisplay rating={Math.round(avgRating())} />
                <span style={{ color: '#8890c0', fontSize: 12 }}>{avgRating().toFixed(1)} ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {club.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>★ Featured</span>}
              <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
                {club.nude_level === 'full_nude' ? '🐱 Full nude' : club.nude_level === 'bikini' ? '👙 Bikini' : '🍒 Topless'}
              </span>
              <span style={{ background: club.bar_type === 'none' ? '#2e1a1a' : '#1a2a3d', color: club.bar_type === 'none' ? '#ff6b6b' : '#7ab8ff', border: `1px solid ${club.bar_type === 'none' ? '#ff4444' : '#3a7acd'}`, borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
                {club.bar_type === 'full_bar' ? '🍾 Full bar' : club.bar_type === 'cafe' ? '🧋 Cafe' : club.bar_type === 'byob' ? '🍺 BYOB' : '❌ No bar'}
              </span>
            </div>
            <div style={{ textAlign: 'right', marginTop: 8 }}>
              <span onClick={handleUpdateClick} style={{ color: '#3a3d60', fontSize: 11, cursor: 'pointer', textDecoration: 'underline' }}>
                Update Club Info
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '4px 16px' }}>

        {club.cover_charge && (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16, marginTop: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Cover Charge</div>
            <div style={{ color: 'white', fontSize: 15 }}>💵 {club.cover_charge}</div>
          </div>
        )}

        {club.hours && (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', marginTop: 12, overflow: 'hidden' }}>
            <div style={{ color: '#8890c0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, padding: '14px 16px 6px' }}>Hours</div>
            <div onClick={() => setShowAllHours(!showAllHours)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px 14px', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ background: '#FF2D78', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: 20, padding: '2px 8px' }}>Today</span>
                <span style={{ color: '#8890c0', fontSize: 13 }}>{getTodayFullName()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: todayHours === 'Closed' ? '#ff4444' : '#7aff9a', fontSize: 13 }}>
                  {todayHours || 'Closed'}
                </span>
                <button onClick={(e) => { e.stopPropagation(); setShowAllHours(!showAllHours) }}
                  style={{ width: 24, height: 24, borderRadius: 20, border: '1px solid #3a3d60', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <span style={{ color: '#8890c0', fontSize: 11, lineHeight: 1, display: 'block', transform: showAllHours ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▾</span>
                </button>
              </div>
            </div>
            {showAllHours && (
              <div style={{ borderTop: '1px solid #1e2140', padding: '8px 16px' }}>
                {DAYS.map(day => (
                  <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid #1e2140' }}>
                    <span style={{ color: day === todayKey ? 'white' : '#8890c0', fontSize: 13, fontWeight: day === todayKey ? 600 : 400 }}>{day}</span>
                    <span style={{ color: club.hours[day] === 'Closed' ? '#ff4444' : '#7aff9a', fontSize: 13, fontWeight: day === todayKey ? 600 : 400 }}>
                      {club.hours[day] || 'Closed'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>
            {sectionLabel}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {dancers.map(dancer => {
              const photo = dancer.photo_urls?.[0] || dancer.photo_url
              return (
                <div key={dancer.id}
                  onClick={() => window.location.href = `/dancers/${dancer.id}`}
                  style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '3/4', background: '#131629', border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}` }}>
                  {photo
                    ? <img src={`${photo}?width=400&quality=75`} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>💃</div>}
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{dancer.stage_name}</div>
                    {dancer.is_featured && <div style={{ color: '#FFD700', fontSize: 10 }}>★ Featured</div>}
                  </div>
                </div>
              )
            })}
            <AddPerformerCard />
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ color: '#8890c0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Reviews ({reviews.length})</div>
            {!showReviewForm && !reviewSuccess && (
              <button onClick={async () => {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) { window.location.href = `/auth?redirect=/clubs/${id}`; return }
                setShowReviewForm(true)
              }}
                style={{ background: '#FF2D78', border: 'none', borderRadius: 20, color: 'white', padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                Write a review
              </button>
            )}
          </div>

          {reviewSuccess && (
            <div style={{ background: '#1a2e1a', border: '1px solid #3acd60', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
              <div style={{ color: '#7aff9a', fontSize: 13, marginBottom: 8 }}>Your review has been posted! ✅</div>
              <TwitterBanner />
            </div>
          )}

          {showReviewForm && (
            <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16, marginBottom: 16 }}>
              <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 14 }}>Write a Review</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Your rating</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s}
                      onClick={() => setReviewRating(s)}
                      onMouseEnter={() => setReviewHover(s)}
                      onMouseLeave={() => setReviewHover(0)}
                      style={{ fontSize: 28, cursor: 'pointer', color: s <= (reviewHover || reviewRating) ? '#FFD700' : '#3a3d60' }}>★</span>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Review title</div>
                <input value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} placeholder="Summarize your experience in one line..."
                  style={{ width: '100%', background: '#0D0F1E', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Your review</div>
                <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder="Share your experience..."
                  rows={3}
                  style={{ width: '100%', background: '#0D0F1E', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box', resize: 'vertical' }} />
              </div>
              {reviewError && <div style={{ color: '#ff4444', fontSize: 12, marginBottom: 10 }}>{reviewError}</div>}
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => { setShowReviewForm(false); setReviewError('') }}
                  style={{ flex: 1, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 10, color: '#8890c0', padding: '10px', fontSize: 13, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button onClick={submitReview} disabled={reviewLoading}
                  style={{ flex: 2, background: reviewLoading ? '#333' : '#FF2D78', border: 'none', borderRadius: 10, color: 'white', padding: '10px', fontSize: 13, fontWeight: 600, cursor: reviewLoading ? 'not-allowed' : 'pointer' }}>
                  {reviewLoading ? 'Posting...' : 'Post Review'}
                </button>
              </div>
            </div>
          )}

          {reviews.length === 0 && !showReviewForm ? (
            <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 24, textAlign: 'center' }}>
              <div style={{ color: '#8890c0', fontSize: 13 }}>No reviews yet — be the first!</div>
            </div>
          ) : reviews.map(review => (
            <div key={review.id} style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a1a40', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2D78', fontSize: 14, fontWeight: 700, flexShrink: 0 }}>
                    {review.profile_username && profileAvatars[review.profile_username]
                      ? <img src={`${profileAvatars[review.profile_username]}?width=100&quality=80`} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : (review.profile_username || review.username)[0].toUpperCase()}
                  </div>
                  <div>
                    <div onClick={() => { if (review.profile_username) window.location.href = `/users/${review.profile_username}` }}
                      style={{ color: review.profile_username ? '#FF2D78' : 'white', fontSize: 13, fontWeight: 600, cursor: review.profile_username ? 'pointer' : 'default' }}>
                      {review.profile_username ? `@${review.profile_username}` : review.username}
                    </div>
                    <div style={{ color: '#8890c0', fontSize: 11 }}>{new Date(review.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <StarDisplay rating={review.rating} size={14} />
              </div>
              {review.title && <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{review.title}</div>}
              <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.5, marginBottom: review.admin_reply ? 10 : 0 }}>{review.review}</div>
              {review.edited && <div style={{ color: '#555', fontSize: 11, marginTop: 4, fontStyle: 'italic' }}>edited</div>}
              {review.admin_reply && (
                <div style={{ background: '#0D0F1E', borderRadius: 8, border: '1px solid #FF2D78', padding: '10px 12px', marginTop: 10 }}>
                  <div style={{ color: '#FF2D78', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>TittyMaps Team</div>
                  <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.5 }}>{review.admin_reply}</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {nearbyClubs.length > 0 && (
          <div style={{ marginTop: 20, marginBottom: 20 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>More Clubs in the Area</div>
            {nearbyClubs.map(nearby => (
              <div key={nearby.id}
                onClick={() => window.location.href = `/clubs/${nearby.id}`}
                style={{ background: '#131629', borderRadius: 12, marginBottom: 8, padding: 12, border: `1px solid ${nearby.is_featured ? '#FFD700' : '#1e2140'}`, display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: nearby.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {nearby.photo_url
                    ? <img src={`${nearby.photo_url}?width=400&quality=75`} alt={nearby.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : (nearby.is_featured ? '🌟' : '💜')}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 2 }}>{nearby.name}</div>
                  <div style={{ fontSize: 11, color: '#8890c0', marginBottom: 4 }}>{nearby.city}, {nearby.state}</div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {nearby.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>★ Featured</span>}
                    <span style={{ background: '#3d1a2e', color: '#FF2D78', border: '1px solid #FF2D78', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                      {nearby.nude_level === 'full_nude' ? '🐱 Full nude' : nearby.nude_level === 'bikini' ? '👙 Bikini' : '🍒 Topless'}
                    </span>
                    <span style={{ background: nearby.bar_type === 'none' ? '#2e1a1a' : '#1a2a3d', color: nearby.bar_type === 'none' ? '#ff6b6b' : '#7ab8ff', border: `1px solid ${nearby.bar_type === 'none' ? '#ff4444' : '#3a7acd'}`, borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                      {nearby.bar_type === 'full_bar' ? '🍾 Full bar' : nearby.bar_type === 'cafe' ? '🧋 Cafe' : nearby.bar_type === 'byob' ? '🍺 BYOB' : '❌ No bar'}
                    </span>
                    <span style={{ background: '#1a2e1a', color: '#7aff9a', border: '1px solid #3acd60', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                      {nearby.distance.toFixed(1)} mi away
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginBottom: 20 }}>
          <TwitterBanner />
        </div>

      </div>
    </div>
  )
}
