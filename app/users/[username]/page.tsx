'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { useParams, useRouter } from 'next/navigation'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

export default function UserProfile() {
  const { username } = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isOwner, setIsOwner] = useState(false)
  const [editingBio, setEditingBio] = useState(false)
  const [bio, setBio] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null)
  const [editingReviewText, setEditingReviewText] = useState('')
  const [editingReviewRating, setEditingReviewRating] = useState(0)
  const [editingReviewHover, setEditingReviewHover] = useState(0)
  const [reviewSaving, setReviewSaving] = useState(false)

  useEffect(() => {
    fetchProfile()
    fetchCurrentUser()
  }, [username])

  async function fetchCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
      if (profile?.username === username) setIsOwner(true)
    }
  }

  async function fetchProfile() {
    const { data } = await supabase.from('profiles').select('*').eq('username', username).single()
    if (!data) { window.location.href = '/'; return }
    setProfile(data)
    setBio(data.bio || '')

    const { data: reviewData } = await supabase
      .from('reviews')
      .select('*, clubs(id, name, city, state, photo_url)')
      .eq('profile_username', username as string)
      .order('created_at', { ascending: false })
    setReviews(reviewData || [])
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function saveProfile() {
    setSaving(true)
    let avatarUrl = profile.avatar_url || ''

    if (avatarFile) {
      const fileExt = avatarFile.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('dancer-photos').upload(fileName, avatarFile)
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('dancer-photos').getPublicUrl(fileName)
        avatarUrl = urlData.publicUrl
      }
    }

    await supabase.from('profiles').update({ bio, avatar_url: avatarUrl }).eq('id', currentUser.id)
    setProfile((prev: any) => ({ ...prev, bio, avatar_url: avatarUrl }))
    setAvatarFile(null)
    setAvatarPreview('')
    setEditingBio(false)
    setSaving(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  function startEditingReview(review: any) {
    setEditingReviewId(review.id)
    setEditingReviewText(review.review)
    setEditingReviewRating(review.rating)
  }

  async function saveReview(reviewId: string) {
    if (!editingReviewText || !editingReviewRating) return
    setReviewSaving(true)
    await supabase.from('reviews').update({
      review: editingReviewText,
      rating: editingReviewRating,
      edited: true,
    }).eq('id', reviewId)
    setReviewSaving(false)
    setEditingReviewId(null)
    fetchProfile()
  }

  async function deleteReview(reviewId: string) {
    if (!confirm('Delete this review?')) return
    await supabase.from('reviews').delete().eq('id', reviewId)
    setReviews(prev => prev.filter(r => r.id !== reviewId))
  }

  if (!profile) return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: '#FF2D78', fontSize: 16 }}>Loading...</div>
    </div>
  )

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <button onClick={() => router.back()} style={{ position: 'absolute', left: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>← Back</button>
        <img src="/logo-text.png" alt="TittyMaps.com" style={{ height: 60, objectFit: 'contain' }} />
        {isOwner && (
          <button onClick={handleSignOut} style={{ position: 'absolute', right: 16, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>
            Sign out
          </button>
        )}
      </div>

      <div style={{ background: '#131629', borderBottom: '1px solid #1e2140', padding: '28px 16px', textAlign: 'center' }}>
        <label style={{ cursor: isOwner ? 'pointer' : 'default' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#2a1a40', border: '3px solid #FF2D78', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 14px' }}>
            {avatarPreview
              ? <img src={avatarPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : profile.avatar_url
              ? <img src={profile.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : '👤'}
          </div>
          {isOwner && <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} />}
        </label>

        <h1 style={{ color: 'white', fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>@{profile.username}</h1>

        {editingBio ? (
          <div style={{ maxWidth: 340, margin: '0 auto' }}>
            <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Write a bio..."
              rows={3} style={{ width: '100%', background: '#0D0F1E', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', marginBottom: 8 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => { setEditingBio(false); setBio(profile.bio || '') }} style={{ flex: 1, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 8, color: '#8890c0', padding: '8px', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveProfile} disabled={saving} style={{ flex: 2, background: '#FF2D78', border: 'none', borderRadius: 8, color: 'white', padding: '8px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p style={{ color: '#8890c0', fontSize: 14, margin: '0 0 8px', maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}>
              {profile.bio || (isOwner ? 'Add a bio...' : 'No bio yet')}
            </p>
            {isOwner && (
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setEditingBio(true)} style={{ background: 'transparent', border: '1px solid #3a3d60', borderRadius: 20, color: '#8890c0', padding: '5px 14px', fontSize: 12, cursor: 'pointer' }}>
                  {profile.bio ? 'Edit bio' : 'Add bio'}
                </button>
                {avatarFile && (
                  <button onClick={saveProfile} disabled={saving} style={{ background: '#FF2D78', border: 'none', borderRadius: 20, color: 'white', padding: '5px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>
                    {saving ? 'Saving...' : 'Save profile photo'}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 16 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>{reviews.length}</div>
            <div style={{ color: '#8890c0', fontSize: 11 }}>{reviews.length === 1 ? 'review' : 'reviews'}</div>
          </div>
          <div style={{ width: 1, background: '#1e2140' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: 'white', fontSize: 18, fontWeight: 700 }}>{reviews.length}</div>
            <div style={{ color: '#8890c0', fontSize: 11 }}>{reviews.length === 1 ? 'club visited' : 'clubs visited'}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        <div style={{ color: '#8890c0', fontSize: 11, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>Reviews</div>

        {reviews.length === 0 ? (
          <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⭐</div>
            <div style={{ color: '#8890c0', fontSize: 14 }}>No reviews yet</div>
            {isOwner && <a href="/clubs" style={{ color: '#FF2D78', fontSize: 13, textDecoration: 'none', display: 'block', marginTop: 8 }}>Browse clubs to review →</a>}
          </div>
        ) : reviews.map(review => (
          <div key={review.id} style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 14, marginBottom: 10 }}>
            <div onClick={() => window.location.href = `/clubs/${review.clubs?.id}`}
              style={{ display: 'flex', gap: 12, marginBottom: 10, cursor: 'pointer' }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: '#1a1530', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {review.clubs?.photo_url
                  ? <img src={review.clubs.photo_url ? `${review.clubs.photo_url}?width=400&quality=75` : ''} alt={review.clubs.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '🏛️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{review.clubs?.name}</div>
                <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>{review.clubs?.city}, {review.clubs?.state}</div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {[1,2,3,4,5].map(s => (
                    <span key={s} style={{ color: s <= review.rating ? '#FFD700' : '#3a3d60', fontSize: 14 }}>★</span>
                  ))}
                </div>
              </div>
              <div style={{ color: '#8890c0', fontSize: 11, flexShrink: 0 }}>{new Date(review.created_at).toLocaleDateString()}</div>
            </div>

            {editingReviewId === review.id ? (
              <div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Rating</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[1,2,3,4,5].map(s => (
                      <span key={s}
                        onClick={() => setEditingReviewRating(s)}
                        onMouseEnter={() => setEditingReviewHover(s)}
                        onMouseLeave={() => setEditingReviewHover(0)}
                        style={{ fontSize: 24, cursor: 'pointer', color: s <= (editingReviewHover || editingReviewRating) ? '#FFD700' : '#3a3d60' }}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <textarea value={editingReviewText} onChange={e => setEditingReviewText(e.target.value)}
                  rows={3} style={{ width: '100%', background: '#0D0F1E', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box', resize: 'vertical', marginBottom: 8 }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditingReviewId(null)}
                    style={{ flex: 1, background: 'transparent', border: '1px solid #3a3d60', borderRadius: 8, color: '#8890c0', padding: '8px', fontSize: 12, cursor: 'pointer' }}>
                    Cancel
                  </button>
                  <button onClick={() => saveReview(review.id)} disabled={reviewSaving}
                    style={{ flex: 2, background: reviewSaving ? '#333' : '#FF2D78', border: 'none', borderRadius: 8, color: 'white', padding: '8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                    {reviewSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ color: '#ccc', fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{review.review}</div>
                {review.edited && (
                  <div style={{ color: '#555', fontSize: 11, marginBottom: 6, fontStyle: 'italic' }}>edited</div>
                )}
                {review.admin_reply && (
                  <div style={{ background: '#0D0F1E', borderRadius: 8, border: '1px solid #FF2D78', padding: '10px 12px', marginBottom: 8 }}>
                    <div style={{ color: '#FF2D78', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>TittyMaps Team</div>
                    <div style={{ color: '#ccc', fontSize: 13 }}>{review.admin_reply}</div>
                  </div>
                )}
                {isOwner && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => startEditingReview(review)}
                      style={{ background: 'transparent', border: '1px solid #3a3d60', borderRadius: 8, color: '#8890c0', padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>
                      Edit
                    </button>
                    <button onClick={() => deleteReview(review.id)}
                      style={{ background: 'transparent', border: '1px solid #ff4444', borderRadius: 8, color: '#ff4444', padding: '5px 12px', fontSize: 11, cursor: 'pointer' }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
