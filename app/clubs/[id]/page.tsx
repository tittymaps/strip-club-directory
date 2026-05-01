'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const DAYS = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

export default function ClubDetail() {
  const { id } = useParams()
  const router = useRouter()
  const [club, setClub] = useState<any>(null)
  const [dancers, setDancers] = useState<any[]>([])
  const [fullPhoto, setFullPhoto] = useState<string | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewUsername, setReviewUsername] = useState('')
  const [reviewEmail, setReviewEmail] = useState('')
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState(false)
  const [nearbyClubs, setNearbyClubs] = useState<any[]>([])

  useEffect(() => {
    if (id) {
      fetchClub()
      fetchReviews()
    }
  }, [id])

  async function fetchClub() {
    const { data } = await supabase.from('clubs').select('*').eq('id', id).single()
    setClub(data)
    if (data) {
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
  }
  async function fetchNearbyClubs(club: any) {
    if (!club.latitude || !club.longitude) return
    const { data } = await supabase
      .from('clubs')
      .select('*')
      .neq('id', club.id)
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

  async function submitReview() {
    if (!reviewUsername || !reviewEmail || !reviewRating || !reviewText) {
      setReviewError('Please fill out all fields and select a star rating.')
      return
    }
    setReviewLoading(true)
    setReviewError('')
    const { error } = await supabase.from('reviews').insert({
      club_id: id,
      username: reviewUsername,
      email: reviewEmail,
      rating: reviewRating,
      review: reviewText,
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
      setReviewUsername('')
      setReviewEmail('')
      setReviewRating(0)
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

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      {fullPhoto && (
        <div onClick={() => setFullPhoto(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <img src={fullPhoto} alt="full size" style={{ maxWidth: '100%', maxHeight: '90vh', borderRadius: 12, objectFit: 'contain' }} />
          <button onClick={() => setFullPhoto(null)}
            style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', color: 'white', width: 36, height: 36, fontSize: 16, cursor: 'pointer' }}>✕</button>
        </div>
      )}

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
      </div>

      <div style={{ background: '#131629', borderBottom: '1px solid #1e2140', padding: '24px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
          <div onClick={() => club.photo_url && setFullPhoto(club.photo_url)}
            style={{ width: 56, height: 56, borderRadius: 14, background: club.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0, cursor: club.photo_url ? 'pointer' : 'default' }}>
            {club.photo_url
              ? <img src={club.photo_url} alt={club.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : (club.is_featured ? '🌟' : '💜')}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: 'white', fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{club.name}</h1>
            {club.address && <div style={{ color: '#8890c0', fontSize: 13, marginBottom: 4 }}>{club.address}</div>}
            <div style={{ fontSize: 13, marginBottom: 8 }}>
              <span onClick={() => window.location.href = `/states/${club.state.toLowerCase()}/${encodeURIComponent(club.city)}`} style={{ color: '#7ab8ff', cursor: 'pointer' }}>{club.city}</span>
              <span style={{ color: '#8890c0' }}>, </span>
              <span onClick={() => window.location.href = `/states/${club.state.toLowerCase()}`} style={{ color: '#7ab8ff', cursor: 'pointer' }}>{club.state}</span>
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
              {club.bar_type !== 'none' && (
                <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '3px 10px', fontSize: 11 }}>
                  {club.bar_type === 'full_bar' ? '🍾 Full bar' : club.bar_type === 'cafe' ? '🧋 Cafe' : '🍺 BYOB'}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px' }}>

        {club.cover_charge && (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16, marginTop: 16 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 }}>Cover Charge</div>
            <div style={{ color: 'white', fontSize: 15 }}>💵 {club.cover_charge}</div>
          </div>
        )}

        {club.hours && (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 16, marginTop: 12 }}>
            <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Hours</div>
            {DAYS.map(day => (
              <div key={day} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #1e2140' }}>
                <span style={{ color: '#8890c0', fontSize: 13 }}>{day}</span>
                <span style={{ color: club.hours[day] === 'Closed' ? '#ff4444' : '#7aff9a', fontSize: 13 }}>
                  {club.hours[day] || 'Closed'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Dancers */}
        <div style={{ marginTop: 16 }}>
          <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Dancers</div>
          {dancers.length === 0 ? (
            <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>💃</div>
              <div style={{ color: '#8890c0', fontSize: 13 }}>No featured dancers yet</div>
              <div style={{ color: '#555', fontSize: 11, marginTop: 4 }}>Dancers can be featured here through our affiliate program</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {dancers.map(dancer => {
                const photo = dancer.photo_urls?.[0] || dancer.photo_url
                return (
                  <div key={dancer.id}
                    onClick={() => window.location.href = `/dancers/${dancer.id}`}
                    style={{ borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative', aspectRatio: '1', background: '#131629', border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}` }}>
                    {photo
                      ? <img src={photo} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>💃</div>}
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.9))', padding: '20px 10px 10px' }}>
                      <div style={{ color: 'white', fontSize: 13, fontWeight: 600, marginBottom: 2 }}>{dancer.stage_name}</div>
                      {dancer.is_featured && <div style={{ color: '#FFD700', fontSize: 10 }}>★ Featured</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ color: '#8890c0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Reviews ({reviews.length})</div>
            {!showReviewForm && !reviewSuccess && (
              <button onClick={() => setShowReviewForm(true)}
                style={{ background: '#FF2D78', border: 'none', borderRadius: 20, color: 'white', padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                Write a review
              </button>
            )}
          </div>

          {reviewSuccess && (
            <div style={{ background: '#1a2e1a', border: '1px solid #3acd60', borderRadius: 10, padding: '12px 14px', color: '#7aff9a', fontSize: 13, marginBottom: 12 }}>
              Your review has been posted!
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
                      style={{ fontSize: 28, cursor: 'pointer', color: s <= (reviewHover || reviewRating) ? '#FFD700' : '#3a3d60' }}>
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Username</div>
                <input value={reviewUsername} onChange={e => setReviewUsername(e.target.value)} placeholder="Choose a username"
                  style={{ width: '100%', background: '#0D0F1E', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box' }} />
              </div>

              <div style={{ marginBottom: 10 }}>
                <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Email (not shown publicly)</div>
                <input value={reviewEmail} onChange={e => setReviewEmail(e.target.value)} placeholder="your@email.com" type="email"
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
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#2a1a40', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF2D78', fontSize: 14, fontWeight: 700 }}>
                    {review.username[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ color: 'white', fontSize: 13, fontWeight: 600 }}>{review.username}</div>
                    <div style={{ color: '#8890c0', fontSize: 11 }}>{new Date(review.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <StarDisplay rating={review.rating} size={14} />
              </div>
              <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.5, marginBottom: review.admin_reply ? 10 : 0 }}>{review.review}</div>
              {review.admin_reply && (
                <div style={{ background: '#0D0F1E', borderRadius: 8, border: '1px solid #FF2D78', padding: '10px 12px', marginTop: 10 }}>
                  <div style={{ color: '#FF2D78', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>TittyMaps Team</div>
                  <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.5 }}>{review.admin_reply}</div>
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
      {/* Nearby Clubs */}
{nearbyClubs.length > 0 && (
  <div style={{ marginTop: 20, marginBottom: 20 }}>
    <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>More Clubs in the Area</div>
    {nearbyClubs.map(nearby => (
      <div key={nearby.id}
        onClick={() => window.location.href = `/clubs/${nearby.id}`}
        style={{
          background: '#131629', borderRadius: 12, marginBottom: 8, padding: 12,
          border: `1px solid ${nearby.is_featured ? '#FFD700' : '#1e2140'}`,
          display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer'
        }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: nearby.is_featured ? '#2a1f00' : '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {nearby.photo_url
            ? <img src={nearby.photo_url} alt={nearby.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
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
            {nearby.bar_type !== 'none' && (
              <span style={{ background: '#1a2a3d', color: '#7ab8ff', border: '1px solid #3a7acd', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
                {nearby.bar_type === 'full_bar' ? '🍾 Full bar' : nearby.bar_type === 'cafe' ? '🧋 Cafe' : '🍺 BYOB'}
              </span>
            )}
            <span style={{ background: '#1a2e1a', color: '#7aff9a', border: '1px solid #3acd60', borderRadius: 20, padding: '2px 8px', fontSize: 10 }}>
              {nearby.distance.toFixed(1)} mi away
            </span>
          </div>
        </div>
      </div>
    ))}
  </div>
)}
    </div>
  )
}
