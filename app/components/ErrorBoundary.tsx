'use client'
import React from 'react'

interface State { hasError: boolean }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error('App error:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100dvh', background: '#faf8f4',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem', fontFamily: "'DM Sans', Arial, sans-serif",
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🌿</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a18', marginBottom: 8, fontFamily: "'DM Serif Display', Georgia, serif" }}>
            Something went wrong
          </div>
          <div style={{ fontSize: 14, color: '#7a7a72', marginBottom: 24, lineHeight: 1.6 }}>
            Don't worry — your data is safe. Try refreshing the page.
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px', background: '#4a7c2f', color: 'white',
              border: 'none', borderRadius: 14, fontSize: 14, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'DM Sans', Arial, sans-serif",
            }}>
            Refresh page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}