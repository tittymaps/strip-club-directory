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
  const [tab, setTab] = useState<'applications' | 'clubs' | 'dancers'>('applications')
  const [applications, setApplications] = useState<any[]>([])
  const [clubs, setClubs] = useState<any[]>([])
  const [dancers, setDancers] = useState<any[]>([])
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
    setMessage(`${app.stage_name} approved — confirmation email sent!`)
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

      <div style={{ background: '#0D0F1E', borderBottom: '1px solid #1e2140', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ flex: 1 }}>
          <span style={{ color: '#FF2D78', fontWeight: 700, fontSize: 16 }}>Titty</span>
          <span style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Maps</span>
          <span style={{ color: '#FFD700', fontSize: 11 }}>.com</span>
          <span style={{ color: '#8890c0', fontSize: 12 }}> — Admin</span>
        </div>
        <a href="/" style={{ color: '#8890c0', fontSize: 12, textDecoration: 'none' }}>← Back to site</a>
      </div>

      {message && (
        <div style={{ background: '#1a2e1a', border: '1px solid #3acd60', borderRadius: 10, margin: '12px 16px', padding: '10px 14px', color: '#7aff9a', fontSize: 13, display: 'flex', justifyContent: 'space-between' }}>
          {message}
          <span onClick={() => setMessage('')} style={{ cursor: 'pointer' }}>✕</span>
        </div>
      )}

      <div style={{ display: 'flex', borderBottom: '1px solid #1e2140', margin: '0 16px' }}>
        {(['applications', 'clubs', 'dancers'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ flex: 1, padding: '12px 4px', background: 'transparent', border: 'none', borderBottom: `2px solid ${tab === t ? '#FF2D78' : 'transparent'}`, color: tab === t ? '#FF2D78' : '#8890c0', fontSize: 13, cursor: 'pointer', textTransform: 'capitalize' }}>
            {t === 'applications' ? `Applications (${applications.filter(a => a.status === 'pending').length})` : t === 'clubs' ? `Clubs (${clubs.length})` : `Dancers (${dancers.length})`}
          </button>
        ))}
      </div>

      {tab === 'applications' && (
        <div style={{ padding: '16px' }}>
          {applications.length === 0 ? (
            <div style={{ background: '#131629', borderRadius: 12, border: '1px solid #1e2140', padding: 28, textAlign: 'center' }}>
              <div style={{ color: '#8890c0', fontSize: 14 }}>No applications yet</div>
            </div>
          ) : applications.map(app => (
            <div key={app.id} style={{ background: '#131629', borderRadius: 12, border: `1px solid ${app.status === 'approved' ? '#3acd60' : app.status === 'rejected' ? '#ff4444' : '#1e2140'}`, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                {app.photo_url && <img src={app.photo_url} alt={app.stage_name} style={{ width: 56, height: 56, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{app.stage_name}</div>
                  <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 2 }}>Fansly: {app.fansly_url}</div>
                  <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 2 }}>Email: {app.email}</div>
                  <div style={{ color: '#8890c0', fontSize: 12 }}>Clubs: {app.club_names?.join(', ')}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 11, color: app.status === 'approved' ? '#7aff9a' : app.status === 'rejected' ? '#ff4444' : '#FFD700', textTransform: 'uppercase', letterSpacing: 1 }}>{app.status}</span>
                {app.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => rejectApplication(app.id)} style={{ background: 'transparent', border: '1px solid #ff4444', borderRadius: 8, color: '#ff4444', padding: '6px 14px', fontSize: 12, cursor: 'pointer' }}>Reject</button>
                    <button onClick={() => approveApplication(app)} style={{ background: '#3acd60', border: 'none', borderRadius: 8, color: 'white', padding: '6px 14px', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>Approve</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'clubs' && (
        <div style={{ padding: '16px' }}>
          <button onClick={openAddClub} style={{ width: '100%', background: '#FF2D78', color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
            + Add New Club
          </button>
          {clubs.map(club => (
            <div key={club.id} style={{ background: '#131629', borderRadius: 12, border: `1px solid ${club.is_featured ? '#FFD700' : '#1e2140'}`, padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              {club.photo_url && <img src={club.photo_url} alt={club.name} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <div style={{ color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{club.name}</div>
                <div style={{ color: '#8890c0', fontSize: 12 }}>{club.city}, {club.state}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEditClub(club)} style={{ background: 'transparent', border: '1px solid #3a3d60', borderRadius: 8, color: '#8890c0', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => deleteClub(club.id, club.name)} style={{ background: 'transparent', border: '1px solid #ff4444', borderRadius: 8, color: '#ff4444', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'dancers' && (
        <div style={{ padding: '16px' }}>
          <button onClick={openAddDancer} style={{ width: '100%', background: '#FF2D78', color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: 'pointer', marginBottom: 16 }}>
            + Add New Dancer
          </button>
          {dancers.map(dancer => (
            <div key={dancer.id} style={{ background: '#131629', borderRadius: 12, border: `1px solid ${dancer.is_featured ? '#FFD700' : '#1e2140'}`, padding: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#2a1a40', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {dancer.photo_url
                  ? <img src={dancer.photo_url} alt={dancer.stage_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : '💃'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <div style={{ color: 'white', fontSize: 14, fontWeight: 600 }}>{dancer.stage_name}</div>
                  {dancer.is_featured && <span style={{ background: '#3d3000', color: '#FFD700', border: '1px solid #FFD700', borderRadius: 20, padding: '1px 6px', fontSize: 10 }}>★ Featured</span>}
                </div>
                {dancer.fansly_url && <div style={{ color: '#8890c0', fontSize: 11 }}>{dancer.fansly_url}</div>}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEditDancer(dancer)} style={{ background: 'transparent', border: '1px solid #3a3d60', borderRadius: 8, color: '#8890c0', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Edit</button>
                <button onClick={() => deleteDancer(dancer.id, dancer.stage_name)} style={{ background: 'transparent', border: '1px solid #ff4444', borderRadius: 8, color: '#ff4444', padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddClub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, overflowY: 'auto', padding: 16 }}>
          <div style={{ background: '#0D0F1E', borderRadius: 16, border: '1px solid #1e2140', padding: 20, maxWidth: 500, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>{editClub ? 'Edit Club' : 'Add New Club'}</h2>
              <button onClick={() => setShowAddClub(false)} style={{ background: 'transparent', border: 'none', color: '#8890c0', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Club photo</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 72, height: 72, borderRadius: 10, background: '#131629', border: `2px dashed ${clubPhotoPreview || editClub?.photo_url ? '#FF2D78' : '#3a3d60'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {clubPhotoPreview ? <img src={clubPhotoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : editClub?.photo_url ? <img src={editClub.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28 }}>📷</span>}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: 13, marginBottom: 2 }}>{clubPhotoPreview || editClub?.photo_url ? 'Change photo' : 'Tap to upload'}</div>
                  <div style={{ color: '#8890c0', fontSize: 11 }}>Appears on club card and profile</div>
                </div>
                <input type="file" accept="image/*" onChange={handleClubPhotoChange} style={{ display: 'none' }} />
              </label>
            </div>
            {[
              { label: 'Club name', key: 'name', placeholder: 'e.g. Platinum Palace' },
              { label: 'Address', key: 'address', placeholder: 'Street address' },
              { label: 'City', key: 'city', placeholder: 'City' },
              { label: 'State', key: 'state', placeholder: 'e.g. ME' },
              { label: 'Latitude', key: 'latitude', placeholder: 'e.g. 43.6591' },
              { label: 'Longitude', key: 'longitude', placeholder: 'e.g. -70.2568' },
              { label: 'Cover charge', key: 'cover_charge', placeholder: 'e.g. $10 weekdays' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 12 }}>
                <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>{field.label}</div>
                <input value={(clubForm as any)[field.key]} onChange={e => setClubForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                  placeholder={field.placeholder}
                  style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Nude level</div>
              <select value={clubForm.nude_level} onChange={e => setClubForm(prev => ({ ...prev, nude_level: e.target.value }))}
                style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13 }}>
                <option value="full_nude">Full nude</option>
                <option value="topless">Topless</option>
                <option value="bikini">Bikini</option>
              </select>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Bar type</div>
              <select value={clubForm.bar_type} onChange={e => setClubForm(prev => ({ ...prev, bar_type: e.target.value }))}
         style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13 }}>
         <option value="full_bar">Full bar</option>
         <option value="byob">BYOB</option>
         <option value="cafe">Cafe</option>
         <option value="none">No bar</option>
          </select>
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 8 }}>Hours</div>
              {DAYS.map(day => (
                <div key={day} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: '#8890c0', fontSize: 12, width: 30 }}>{day}</span>
                  <input value={clubForm.hours[day as keyof typeof clubForm.hours]}
                    onChange={e => setClubForm(prev => ({ ...prev, hours: { ...prev.hours, [day]: e.target.value } }))}
                    placeholder="e.g. 8pm-2am or Closed"
                    style={{ flex: 1, background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '7px 10px', color: 'white', fontSize: 12 }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <input type="checkbox" id="clubFeatured" checked={clubForm.is_featured} onChange={e => setClubForm(prev => ({ ...prev, is_featured: e.target.checked }))} />
              <label htmlFor="clubFeatured" style={{ color: '#FFD700', fontSize: 13, cursor: 'pointer' }}>★ Mark as Featured</label>
            </div>
            <button onClick={saveClub} disabled={saving}
              style={{ width: '100%', background: saving ? '#333' : '#FF2D78', color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : editClub ? 'Save Changes' : 'Add Club'}
            </button>
          </div>
        </div>
      )}

      {showAddDancer && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 200, overflowY: 'auto', padding: 16 }}>
          <div style={{ background: '#0D0F1E', borderRadius: 16, border: '1px solid #1e2140', padding: 20, maxWidth: 500, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ color: 'white', fontSize: 18, fontWeight: 700, margin: 0 }}>{editDancer ? 'Edit Dancer' : 'Add New Dancer'}</h2>
              <button onClick={() => setShowAddDancer(false)} style={{ background: 'transparent', border: 'none', color: '#8890c0', fontSize: 20, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 6 }}>Profile photo</div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#131629', border: `2px dashed ${dancerPhotoPreview || editDancer?.photo_url ? '#FF2D78' : '#3a3d60'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
                  {dancerPhotoPreview ? <img src={dancerPhotoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : editDancer?.photo_url ? <img src={editDancer.photo_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 28 }}>📷</span>}
                </div>
                <div>
                  <div style={{ color: 'white', fontSize: 13, marginBottom: 2 }}>{dancerPhotoPreview || editDancer?.photo_url ? 'Change photo' : 'Tap to upload'}</div>
                  <div style={{ color: '#8890c0', fontSize: 11 }}>Profile picture</div>
                </div>
                <input type="file" accept="image/*" onChange={handleDancerPhotoChange} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Stage name</div>
              <input value={dancerForm.stage_name} onChange={e => setDancerForm(prev => ({ ...prev, stage_name: e.target.value }))}
                placeholder="Stage name"
                style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 4 }}>Fansly profile link</div>
              <input value={dancerForm.fansly_url} onChange={e => setDancerForm(prev => ({ ...prev, fansly_url: e.target.value }))}
                placeholder="https://fansly.com/yourname"
                style={{ width: '100%', background: '#131629', border: '1px solid #1e2140', borderRadius: 8, padding: '10px 12px', color: 'white', fontSize: 13, boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <div style={{ color: '#8890c0', fontSize: 12, marginBottom: 8 }}>Clubs</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 200, overflowY: 'auto' }}>
                {clubs.map(club => {
                  const selected = dancerForm.club_ids.includes(club.id)
                  return (
                    <div key={club.id} onClick={() => toggleDancerClub(club.id)}
                      style={{ background: selected ? '#1a0d2e' : '#131629', border: `1px solid ${selected ? '#FF2D78' : '#1e2140'}`, borderRadius: 8, padding: '8px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ color: 'white', fontSize: 13 }}>{club.name}</div>
                        <div style={{ color: '#8890c0', fontSize: 11 }}>{club.city}, {club.state}</div>
                      </div>
                      {selected && <span style={{ color: '#FF2D78' }}>✓</span>}
                    </div>
                  )
                })}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <input type="checkbox" id="dancerFeatured" checked={dancerForm.is_featured} onChange={e => setDancerForm(prev => ({ ...prev, is_featured: e.target.checked }))} />
              <label htmlFor="dancerFeatured" style={{ color: '#FFD700', fontSize: 13, cursor: 'pointer' }}>★ Mark as Featured (signed up via Fansly link)</label>
            </div>
            <button onClick={saveDancer} disabled={saving}
              style={{ width: '100%', background: saving ? '#333' : '#FF2D78', color: 'white', border: 'none', borderRadius: 12, padding: '13px', fontSize: 15, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Saving...' : editDancer ? 'Save Changes' : 'Add Dancer'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
