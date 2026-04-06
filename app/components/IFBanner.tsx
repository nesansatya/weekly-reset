'use client';

import { useState, useEffect } from 'react';

interface IFSettings {
  protocol: string;
  fastStartTime: string;
  customFastHours: number;
}

function getFastingWindows(protocol: string, fastStartTime: string, customFastHours: number) {
  const [startHour, startMin] = fastStartTime.split(':').map(Number);
  
  const fastHours = protocol === '16:8' ? 16 :
                    protocol === '18:6' ? 18 :
                    protocol === 'custom' ? customFastHours : 16;
  
  const eatHours = 24 - fastHours;
  
  // Fast starts at fastStartTime
  const fastStart = new Date();
  fastStart.setHours(startHour, startMin, 0, 0);
  
  // Eating window starts after fastHours
  const eatStart = new Date(fastStart.getTime() + fastHours * 60 * 60 * 1000);
  
  // Eating window ends when next fast starts
  const eatEnd = new Date(eatStart.getTime() + eatHours * 60 * 60 * 1000);

  return { fastStart, eatStart, eatEnd, fastHours, eatHours }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true })
}

function formatCountdown(ms: number) {
  if (ms <= 0) return '0h 0m'
  const totalMins = Math.floor(ms / 60000)
  const hours = Math.floor(totalMins / 60)
  const mins = totalMins % 60
  return `${hours}h ${mins}m`
}

export default function IFBanner({ isPro }: { isPro: boolean }) {
  const [settings, setSettings] = useState<IFSettings | null>(null)
  const [now, setNow] = useState(new Date())
  const [enabled, setEnabled] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [protocol, setProtocol] = useState('16:8')
  const [fastStartTime, setFastStartTime] = useState('20:00')
  const [customHours, setCustomHours] = useState(16)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // Load IF settings from profile
    fetch('/api/profile')
      .then(r => r.json())
      .then(({ data }) => {
        if (data?.if_mode_enabled) {
          setEnabled(true)
          setProtocol(data.if_protocol || '16:8')
          setFastStartTime(data.if_fast_start_time || '20:00')
          setCustomHours(data.if_custom_fast_hours || 16)
          setSettings({
            protocol: data.if_protocol || '16:8',
            fastStartTime: data.if_fast_start_time || '20:00',
            customFastHours: data.if_custom_fast_hours || 16,
          })
        }
      })
  }, [])

  // Live clock — updates every minute
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  async function saveSettings() {
    setSaving(true)
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          if_mode_enabled: true,
          if_protocol: protocol,
          if_fast_start_time: fastStartTime,
          if_custom_fast_hours: customHours,
        }),
      })
      setSettings({ protocol, fastStartTime, customFastHours: customHours })
      setEnabled(true)
      setShowSettings(false)
    } catch (_e) {}
    setSaving(false)
  }

  async function disableIF() {
    try {
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ if_mode_enabled: false }),
      })
      setEnabled(false)
      setSettings(null)
    } catch (_e) {}
  }

  // Settings panel
  if (showSettings) return (
    <div style={{
      margin: '16px 20px 0', background: '#1a1a18',
      borderRadius: 16, padding: 20,
      border: '1px solid #4a7c2f',
    }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 4 }}>⏱️ Set up Fasting Mode</div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 20 }}>Choose your protocol and when your fast starts</div>

      {/* Protocol */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>Fasting Protocol</div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const, marginBottom: 20 }}>
        {['16:8', '18:6', '5:2', ...(isPro ? ['custom'] : [])].map(p => (
          <button key={p} onClick={() => setProtocol(p)} style={{
            padding: '8px 14px', borderRadius: 20,
            border: `1.5px solid ${protocol === p ? '#4a7c2f' : 'rgba(255,255,255,0.15)'}`,
            background: protocol === p ? '#4a7c2f' : 'rgba(255,255,255,0.05)',
            color: protocol === p ? 'white' : 'rgba(255,255,255,0.6)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            fontFamily: "'DM Sans', Arial, sans-serif",
          }}>{p === 'custom' ? '⚙️ Custom (Pro)' : p}</button>
        ))}
      </div>

      {/* Custom hours — Pro only */}
      {protocol === 'custom' && isPro && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>Fast Duration (hours)</div>
          <input type="number" min={12} max={23} value={customHours}
            onChange={e => setCustomHours(parseInt(e.target.value))}
            style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', Arial, sans-serif", boxSizing: 'border-box' as const }}
          />
        </div>
      )}

      {/* Fast start time */}
      <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' as const, letterSpacing: '0.06em', marginBottom: 10 }}>Fast Starts At</div>
      <input type="time" value={fastStartTime}
        onChange={e => setFastStartTime(e.target.value)}
        style={{ width: '100%', padding: '10px 12px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, color: 'white', fontSize: 14, outline: 'none', marginBottom: 20, fontFamily: "'DM Sans', Arial, sans-serif", boxSizing: 'border-box' as const }}
      />

      {/* Protocol summary */}
      <div style={{ background: 'rgba(74,124,47,0.15)', border: '1px solid rgba(74,124,47,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#a8c48a', lineHeight: 1.6 }}>
        {protocol === '5:2'
          ? '5:2 — eat normally 5 days, restrict to ~500 calories on 2 non-consecutive days'
          : (() => {
              const { eatStart, eatEnd, fastHours, eatHours } = getFastingWindows(protocol, fastStartTime, customHours)
              return `Fast ${fastHours}hrs → Eating window ${formatTime(eatStart)} to ${formatTime(eatEnd)} (${eatHours} hrs)`
            })()
        }
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={saveSettings} disabled={saving} style={{ flex: 1, padding: '12px', background: '#4a7c2f', color: 'white', border: 'none', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>
          {saving ? 'Saving...' : 'Start fasting mode →'}
        </button>
        <button onClick={() => setShowSettings(false)} style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>
          Cancel
        </button>
      </div>
    </div>
  )

  // Not enabled — show enable button
  if (!enabled) return (
    <div style={{
      margin: '16px 20px 0', background: 'white',
      borderRadius: 16, padding: 16,
      border: '1px solid #e4e0d8',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a18', marginBottom: 2 }}>⏱️ Intermittent Fasting</div>
        <div style={{ fontSize: 11, color: '#7a7a72' }}>Track your fasting window</div>
      </div>
      <button onClick={() => setShowSettings(true)} style={{
        padding: '8px 14px', background: '#1a1a18', color: 'white',
        border: 'none', borderRadius: 10, fontSize: 12, fontWeight: 700,
        cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
      }}>Set up →</button>
    </div>
  )

  // Enabled — show fasting timer
  if (!settings) return null

  // 5:2 protocol — simple display
  if (settings.protocol === '5:2') return (
    <div style={{
      margin: '16px 20px 0', background: '#1a1a18',
      borderRadius: 16, padding: 16,
      border: '1px solid #4a7c2f',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>⏱️ 5:2 Fasting Mode</div>
        <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: 'none', fontSize: 11, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>Edit</button>
      </div>
      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, marginBottom: 12 }}>
        Eat normally today. On your 2 restriction days, keep meals under 500 calories.
      </div>
      <div style={{ fontSize: 12, color: '#a8c48a' }}>💧 Stay hydrated · 🥗 Protein-first meals · 😴 Sleep well</div>
      <button onClick={disableIF} style={{ marginTop: 12, background: 'none', border: 'none', fontSize: 11, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>Disable fasting mode</button>
    </div>
  )

  // 16:8 / 18:6 / custom — show live timer
  const { fastStart, eatStart, eatEnd, fastHours, eatHours } = getFastingWindows(
    settings.protocol, settings.fastStartTime, settings.customFastHours
  )

  const isFasting = now >= fastStart && now < eatStart || now >= eatEnd
  const isEating = now >= eatStart && now < eatEnd

  const timeUntilEat = eatStart.getTime() - now.getTime()
  const timeUntilFast = eatEnd.getTime() - now.getTime()

  const fastProgress = isFasting
    ? Math.min(100, ((now.getTime() - fastStart.getTime()) / (fastHours * 3600000)) * 100)
    : Math.min(100, ((now.getTime() - eatStart.getTime()) / (eatHours * 3600000)) * 100)

  return (
    <div style={{
      margin: '16px 20px 0', background: '#1a1a18',
      borderRadius: 16, padding: 16,
      border: `1px solid ${isFasting ? '#4a7c2f' : '#c4a35a'}`,
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: isFasting ? '#4a7c2f' : '#c4a35a', opacity: 0.06, top: -30, right: -30 }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>⏱️ {settings.protocol} Fasting</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Intermittent Fasting Mode</div>
          </div>
          <div style={{
            background: isFasting ? 'rgba(74,124,47,0.2)' : 'rgba(196,163,90,0.2)',
            border: `1px solid ${isFasting ? 'rgba(74,124,47,0.4)' : 'rgba(196,163,90,0.4)'}`,
            borderRadius: 20, padding: '4px 10px',
            fontSize: 11, fontWeight: 700,
            color: isFasting ? '#a8c48a' : '#f0d080',
          }}>
            {isFasting ? '🔴 Fasting' : '🟢 Eating'}
          </div>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'white', fontFamily: "'DM Serif Display', Georgia, serif", lineHeight: 1 }}>
            {isFasting ? formatCountdown(timeUntilEat) : formatCountdown(timeUntilFast)}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            {isFasting ? 'until eating window opens' : 'until next fast begins'}
          </div>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 10, overflow: 'hidden', marginBottom: 12 }}>
          <div style={{ height: '100%', borderRadius: 10, background: isFasting ? '#4a7c2f' : '#c4a35a', width: `${fastProgress}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Window times */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>EATING WINDOW</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{formatTime(eatStart)} – {formatTime(eatEnd)}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', borderRadius: 8, padding: '8px 10px' }}>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>FAST DURATION</div>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'white' }}>{fastHours} hours</div>
          </div>
        </div>

        {/* Tip */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: 10 }}>
          {isFasting
            ? '💧 Water, black coffee & tea only · No calories during fast'
            : '🍽️ Protein + vegetables first · Avoid sugar spikes'}
        </div>

        {/* Edit / Disable */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowSettings(true)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>
            Edit settings
          </button>
          <button onClick={disableIF} style={{ background: 'none', border: 'none', fontSize: 11, color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif" }}>
            Disable
          </button>
        </div>
      </div>
    </div>
  )
}