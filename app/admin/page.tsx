'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://ssruvoxuwlksmbmubcfv.supabase.co',
  'sb_publishable_HpBo6b0DnC-J1B9LL0u26Q_wkkAIAEl'
)

const ADMIN_PASSWORD = 'titty2026maps'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [pwError, setPwError] = useState('')
  const [tab, setTab] = useState<'applications' | 'clubs' | 'dancers' | 'reviews'>('applications')
  const [applications, setApplications] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [dancers, setDancers] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [replyText, setReplyText] = useState<Record<string, string>>({})
  const [showAddClub, setShowAddClub] = useState(false)
  const [editClub, setEditClub] = useState<any>(null)
  const [clubPhoto, setClubPhoto] = useState<File | null>(null)
  const [clubPhotoPreview, setClubPhotoPreview] = useState('')
  const [clubForm, setClubForm] = useState({
    name: '', address: '', city: '', state: '',
    latitude: '', longitude: '',
    nude_level: 'full_nude', bar_type: 'full_bar',
    cover_charge: '', is_featured: false,
    hours: { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' }
  })
  const [showAddDancer, setShowAddDancer] = useState(false)
  const [editDancer, setEditDancer] = useState<any>(null)
  const [dancerPhoto, setDancerPhoto] = useState<File | null>(null)
  const [dancerPhotoPreview, setDancerPhotoPreview] = useState('')
  const [dancerForm, setDancerForm] = useState({
    stage_name: '', fansly_url: '', is_featured: false, club_ids: [] as string[]
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authed) {
      fetchApplications()
      fetchClubs()
      fetchDancers()
      fetchReviews()
    }
  }, [authed])

  async function fetchApplications() {
    const { data } = await supabase.from('dancer_applications').select('*').order('created_at', { ascending: false })
    setApplications(data || [])
  }

  async function fetchClubs() {
    const { data } = await supabase.from('clubs').select('*').order('name')
    setClubs(data || [])
  }

  async function fetchDancers() {
    const { data } = await supabase.from('dancers').select('*').order('stage_name')
    setDancers(data || [])
  }

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*, clubs(name, city, state)')
      .order('created_at', { ascending: false })
    setReviews(data || [])
  }

  async function approveApplication(app: any) {
    const { data, error } = await supabase.from('dancers').insert({
      stage_name: app.stage_name,
      fansly_url: app.fansly_url || null,
      photo_url: app.photo_url || null,
      photo_urls: app.photo_urls || null,
      is_featured: true,
    }).select().single()
    if (error) { setMessage('Error approving dancer'); return }
    await supabase.from('dancer_applications').update({ status: 'approved' }).eq('id', app.id)
    await fetch('/api/notify-dancer-approved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stage_name: app.stage_name,
        email: app.email,
        is_featured: true,
        dancer_id: data.id,
      })
    })
    setMessage(`${app.stage_name} approved!`)
    fetchApplications()
    fetchDancers()
  }

  async function rejectApplication(id: string) {
    await supabase.from('dancer_applications').update({ status: 'rejected' }).eq('id', id)
    setMessage('Application rejected.')
    fetchApplications()
  }

  function handleClubPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setClubPhoto(file)
    setClubPhotoPreview(URL.createObjectURL(file))
  }

  function handleDancerPhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setDancerPhoto(file)
    setDancerPhotoPreview(URL.createObjectURL(file))
  }

  function openAddClub() {
    setEditClub(null)
    setClubPhoto(null)
    setClubPhotoPreview('')
    setClubForm({ name: '', address: '', city: '', state: '', latitude: '', longitude: '', nude_level: 'full_nude', bar_type: 'full_bar', cover_charge: '', is_featured: false, hours: { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' } })
    setShowAddClub(true)
  }

  function openEditClub(club: any) {
    setEditClub(club)
    setClubPhoto(null)
    setClubPhotoPreview('')
    setClubForm({
      name: club.name || '', address: club.address || '', city: club.city || '', state: club.state || '',
      latitude: club.latitude || '', longitude: club.longitude || '',
      nude_level: club.nude_level || 'full_nude', bar_type: club.bar_type || 'full_bar',
      cover_charge: club.cover_charge || '', is_featured: club.is_featured || false,
      hours: club.hours || { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' }
    })
    setShowAddClub(true)
  }

  function openAddDancer() {
    setEditDancer(null)
    setDancerPhoto(null)
    setDancerPhotoPreview('')
    setDancerForm({ stage_name: '', fansly_url: '', is_featured: false, club_ids: [] })
    setShowAddDancer(true)
  }

  function openEditDancer(dancer: any) {
    setEditDancer(dancer)
    setDancerPhoto(null)
    setDancerPhotoPreview('')
    setDancerForm({
      stage_name: dancer.stage_name || '',
      fansly_url: dancer.fansly_url || '',
      is_featured: dancer.is_featured || false,
      club_ids: dancer.club_ids || []
    })
    setShowAddDancer(true)
  }

  function toggleDancerClub(clubId: string) {
    setDancerForm(prev => ({
      ...prev,
      club_ids: prev.club_ids.includes(clubId)
        ? prev.club_ids.filter(id => id !== clubId)
        : [...prev.club_ids, clubId]
    }))
  }

  async function saveClub() {
    setSaving(true)
    let photoUrl = editClub?.photo_url || ''
    if (clubPhoto) {
      const fileExt = clubPhoto.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('club-photos').upload(fileName, clubPhoto)
      if (uploadError) { setMessage('Photo upload failed.'); setSaving(false); return }
      const { data: urlData } = supabase.storage.from('club-photos').getPublicUrl(fileName)
      photoUrl = urlData.publicUrl
    }
    const payload = {
      name: clubForm.name, address: clubForm.address, city: clubForm.city, state: clubForm.state,
      latitude: parseFloat(clubForm.latitude as string) || null,
      longitude: parseFloat(clubForm.longitude as string) || null,
      nude_level: clubForm.nude_level, bar_type: clubForm.bar_type,
      cover_charge: clubForm.cover_charge, is_featured: clubForm.is_featured,
      hours: clubForm.hours, photo_url: photoUrl || null,
    }
    if (editClub) {
      await supabase.from('clubs').update(payload).eq('id', editClub.id)
      setMessage('Club updated!')
    } else {
      await supabase.from('clubs').insert(payload)
      setMessage('Club added!')
    }
    setSaving(false)
    setShowAddClub(false)
    fetchClubs()
  }

  async function saveDancer() {
    setSaving(true)
    let photoUrl = editDancer?.photo_url || ''
    let photoUrls = editDancer?.photo_urls || []
    if (dancerPhoto) {
      const fileExt = dancerPhoto.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`
      const { error: uploadError } = await supabase.storage.from('dancer-photos').upload(fileName, dancerPhoto)
      if (uploadError) { setMessage('Photo upload failed.'); setSaving(false); return }
      const { data: urlData } = supabase.storage.from('dancer-photos').getPublicUrl(fileName)
      photoUrl = urlData.publicUrl
      photoUrls = [photoUrl, ...photoUrls.slice(0, 2)]
    }
    const payload = {
      stage_name: dancerForm.stage_name,
      fansly_url: dancerForm.fansly_url || null,
      is_featured: dancerForm.is_featured,
      club_ids: dancerForm.club_ids.length > 0 ? dancerForm.club_ids : null,
      photo_url: photoUrl || null,
      photo_urls: photoUrls.length > 0 ? photoUrls : null,
    }
    if (editDancer) {
      await supabase.from('dancers').update(payload).eq('id', editDancer.id)
      setMessage('Dancer updated!')
    } else {
      await supabase.from('dancers').insert(payload)
      setMessage('Dancer added!')
    }
    setSaving(false)
    setShowAddDancer(false)
    fetchDancers()
  }

  async function deleteClub(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return
    await supabase.from('clubs').delete().eq('id', id)
    setMessage(`${name} deleted.`)
    fetchClubs()
  }

  async function deleteDancer(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return
    await supabase.from('dancers').delete().eq('id', id)
    setMessage(`${name} deleted.`)
    fetchDancers()
  }

  async function deleteReview(id: string) {
    if (!confirm('Delete this review?')) return
    await supabase.from('reviews').delete().eq('id', id)
    setMessage('Review deleted.')
    fetchReviews()
  }

  async function submitReply(id: string) {
    const reply = replyText[id]
    if (!reply) return
    await supabase.from('reviews').update({ admin_reply: reply }).eq('id', id)
    setMessage('Reply posted!')
    setReplyText(prev => ({ ...prev, [id]: '' }))
    fetchReviews()
  }

  if (!authed) return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
      <h2 style={{ color: 'white', fontSize: 20, fontWeight: 700, marginBottom: 20 }}>Admin Access</h2>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') { if (password === ADMIN_PASSWORD) { setAuthed(true) } else { setPwError('Incorrect password') } } }}
        placeholder="Enter password"
        style={{ width: 260, background: '#131629', border: '1px solid #1e2140', borderRadius: 10, padding: '12px 14px', color: 'white', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
      {pwError && <div style={{ color: '#ff4444', fontSize: 13, marginBottom: 10 }}>{pwError}</div>}
       <button onClick={() => { if (password === ADMIN_PASSWORD) { setAuthed(true) } else { setPwError('Incorrect password') } }}
        style={{ width: 260, background: '#FF2D78', color: 'white', border: 'none', borderRadius: 10, padding: '12px', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
        Login
      </button>
    </div>
  )

  return (
    <div style={{ background: '#0D0F1E', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', paddingBottom: 80 }}>

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '12px 16px', displ
