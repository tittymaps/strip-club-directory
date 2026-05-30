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
      width: 140,
      overflow: 'hidden',
      zIndex: 99,
      boxShadow: '0 2px 16px rgba(255,45,120,0.15)',
    }}>
      <button onClick={dismiss} style={{ position: 'absolute', top: 7, right: 9, background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: 13, cursor: 'pointer', lineHeight: 1, padding: 0, zIndex: 1 }}>✕</button>

      <div style={{ background: '#FF2D78', padding: '10px 14px', textAlign: 'center' }}>
        <div style={{ color: 'white', fontSize: 11, fontWeight: 700, fontFamily: 'sans-serif', lineHeight: 1.4 }}>TittyMaps works best on mobile</div>
      </div>

      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <div style={{ background: 'white', borderRadius: 8, padding: 5, width: 90, height: 90, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://tittymaps.com&bgcolor=ffffff&color=000000&margin=2"
            alt="QR code for tittymaps.com"
            style={{ width: 80, height: 80 }}
          />
        </div>
        <div style={{ color: '#8890c0', fontSize: 10, fontFamily: 'sans-serif', textAlign: 'center', lineHeight: 1.4 }}>Scan to use on your phone</div>
      </div>
    </div>
  )
}
