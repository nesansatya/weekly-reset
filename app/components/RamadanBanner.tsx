'use client';

import { useRamadan } from '../lib/RamadanContext';

// Kuala Lumpur prayer times (approximate for Ramadan 2027)
const getSahurIftar = () => {
  return {
    sahur: '5:30 AM',
    iftar: '7:15 PM',
    fajr: '5:45 AM',
    maghrib: '7:15 PM',
    isha: '8:30 PM',
    tarawikh: '9:00 PM',
  };
};

const getRamadanDay = () => {
  // For testing purposes, returns day 1
  // Will auto-calculate once Ramadan 2027 starts
  const ramadanStart = new Date(2027, 1, 18);
  const today = new Date();
  const diff = Math.floor((today.getTime() - ramadanStart.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(30, diff + 1));
};

export default function RamadanBanner() {
  const { isRamadanMode } = useRamadan();

  if (!isRamadanMode) return null;

  const times = getSahurIftar();
  const day = getRamadanDay();

  return (
    <div style={{
      margin: '16px 20px 0',
      background: '#1a1a18',
      borderRadius: 16,
      padding: 16,
      border: '1px solid #c4a35a',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'absolute', width: 120, height: 120,
        borderRadius: '50%', background: '#c4a35a',
        opacity: 0.06, top: -30, right: -30,
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#f0d080', fontFamily: "'DM Serif Display', Georgia, serif" }}>
            🌙 Ramadan Mubarak
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
            Day {day} of 30 · Kuala Lumpur
          </div>
        </div>
        <div style={{
          background: 'rgba(196,163,90,0.15)',
          border: '1px solid rgba(196,163,90,0.3)',
          borderRadius: 20, padding: '4px 10px',
          fontSize: 11, fontWeight: 600, color: '#c4a35a',
        }}>
          Fasting 🤲
        </div>
      </div>

      {/* Sahur & Iftar times */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <div style={{
          flex: 1, background: 'rgba(255,255,255,0.05)',
          borderRadius: 10, padding: '10px 12px',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Sahur ends</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>{times.sahur}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Fajr {times.fajr}</div>
        </div>
        <div style={{
          flex: 1, background: 'rgba(196,163,90,0.1)',
          borderRadius: 10, padding: '10px 12px',
          border: '1px solid rgba(196,163,90,0.2)',
        }}>
          <div style={{ fontSize: 10, color: 'rgba(196,163,90,0.7)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Iftar</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f0d080' }}>{times.iftar}</div>
          <div style={{ fontSize: 10, color: 'rgba(196,163,90,0.5)', marginTop: 2 }}>Maghrib {times.maghrib}</div>
        </div>
      </div>

      {/* Tarawikh & hydration tip */}
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 10, padding: '10px 12px',
        border: '1px solid rgba(255,255,255,0.06)',
        fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5,
      }}>
        💧 Drink 2–3 glasses right after Iftar · 🕌 Tarawikh at {times.tarawikh} · 💪 Light workout after Isha only
      </div>
    </div>
  );
}