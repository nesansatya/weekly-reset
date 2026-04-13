// Shared bottom nav — Today / Meals / Workout / Progress
// Usage: <BottomNav active="meals" router={router} />

import React from 'react'

type NavItem = 'today' | 'meals' | 'workout' | 'progress'

interface BottomNavProps {
  active: NavItem
  router: ReturnType<typeof import('next/navigation').useRouter>
}

const navItems = [
  {
    key: 'today' as NavItem,
    label: 'Today',
    path: '/dashboard',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 9.5L11 3L19 9.5V19C19 19.55 18.55 20 18 20H14V14H8V20H4C3.45 20 3 19.55 3 19V9.5Z"
          stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6" strokeLinejoin="round"
          fill={active ? 'rgba(74,124,47,0.12)' : 'none'}/>
      </svg>
    ),
  },
  {
    key: 'meals' as NavItem,
    label: 'Meals',
    path: '/dashboard/meals',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M4 6C4 5.45 4.45 5 5 5H17C17.55 5 18 5.45 18 6V8C18 10.76 15.31 13 12 13H10C6.69 13 4 10.76 4 8V6Z" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6"/>
        <path d="M11 13V18M8 18H14" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M4 7H3C2.45 7 2 7.45 2 8V9C2 10.1 2.9 11 4 11" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M18 7H19C19.55 7 20 7.45 20 8V9C20 10.1 19.1 11 18 11" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'workout' as NavItem,
    label: 'Workout',
    path: '/dashboard/workout',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <rect x="2" y="9" width="4" height="4" rx="1" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6"/>
        <rect x="16" y="9" width="4" height="4" rx="1" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6"/>
        <path d="M6 11H16" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6" strokeLinecap="round"/>
        <path d="M8 7V15M14 7V15" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: 'progress' as NavItem,
    label: 'Progress',
    path: '/dashboard/progress',
    icon: (active: boolean) => (
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        <path d="M3 16L8 10L12 13L16 7L19 9" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M16 7H19V10" stroke={active ? '#4a7c2f' : '#9a9a92'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
]

export default function BottomNav({ active, router }: BottomNavProps) {
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'white', borderTop: '1px solid #e4e0d8',
      display: 'flex', paddingTop: 10,
      paddingBottom: 'calc(env(safe-area-inset-bottom) + 10px)',
      zIndex: 100,
    }}>
      {navItems.map(n => {
        const isActive = n.key === active
        return (
          <button
            key={n.key}
            onClick={() => router.push(n.path)}
            style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, cursor: 'pointer', padding: '4px 0', background: 'none', border: 'none',
            }}
          >
            {n.icon(isActive)}
            <div style={{
              fontSize: 10, fontWeight: isActive ? 700 : 500,
              color: isActive ? '#4a7c2f' : '#7a7a72',
              fontFamily: "'DM Sans', Arial, sans-serif",
            }}>{n.label}</div>
            {isActive && <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#4a7c2f' }}/>}
          </button>
        )
      })}
    </div>
  )
}
