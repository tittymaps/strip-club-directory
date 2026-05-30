'use client'
import { useEffect, useState } from 'react'

export default function DesktopQR() {
  const [isDesktop, setIsDesktop] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768)
    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    const wasDismissed = localStorage.getItem('qr_dismissed')
    if (wasDismissed) setDismissed(true)

    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  function dismiss() {
    setDismissed(true)
    localStorage.setItem('qr_dismissed', 'true')
  }

  if (!isDesktop || dismissed) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 110,
      right: 20,
      background: '#131629',
      border: '1px solid #FF2D78',
      borderRadius: 14,
      padding: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      zIndex: 99,
      boxShadow: '0 2px 16px rgba(255,45,120,0.15)',
    }}>
      <button onClick={dismiss} style={{ position: 'absolute', top: 6, right: 8, background: 'transparent', border: 'none', color: '#3a3d60', fontSize: 14, cursor: 'pointer', lineHeight: 1, padding: 0 }}>✕</button>
      <img
        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://tittymaps.com&bgcolor=ffffff&color=000000&margin=4`}
        alt="QR code for tittymaps.com"
        style={{ width: 90, height: 90, borderRadius: 8 }}
      />
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: 11, fontWeight: 600, fontFamily: 'sans-serif', marginBottom: 2 }}>TittyMaps works best on mobile</div>
        <div style={{ color: '#8890c0', fontSize: 10, fontFamily: 'sans-serif' }}>Scan to use on your phone</div>
      </div>
    </div>
  )
}
