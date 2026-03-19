'use client'
import { useEffect, useState } from 'react'

const CURRENT_VERSION = '1.0.0'

export default function VersionCheck() {
  const [outdated, setOutdated] = useState(false)

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/version')
        const { version } = await res.json()
        if (version && version !== CURRENT_VERSION) setOutdated(true)
      } catch (_e) { }
    }
    check()
  }, [])

  if (!outdated) return null

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', fontFamily: "'DM Sans', Arial, sans-serif",
    }}>
      <div style={{
        background: '#faf8f4', borderRadius: 20, padding: 28,
        maxWidth: 340, width: '100%', textAlign: 'center',
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌿</div>
        <div style={{
          fontSize: 20, fontWeight: 700, color: '#1a1a18', marginBottom: 8,
          fontFamily: "'DM Serif Display', Georgia, serif",
        }}>New version available</div>
        <div style={{ fontSize: 13, color: '#7a7a72', lineHeight: 1.6, marginBottom: 20 }}>
          A new version of Weekly Reset is available. Please update to continue using the app.
        </div>
        <a href='https://play.google.com/store/apps/details?id=com.weeklyresat.app'
          style={{
            display: 'block', padding: '14px',
            background: '#4a7c2f', color: 'white',
            borderRadius: 14, fontSize: 14, fontWeight: 700,
            textDecoration: 'none',
          }}>
          Update now
        </a>
      </div>
    </div>
  )
}