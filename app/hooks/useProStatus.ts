'use client'
import { useState, useEffect } from 'react'

export function useProStatus() {
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch('/api/profile')
        const { data } = await res.json()
        setIsPro(data?.is_pro || false)
      } catch (e) {
        setIsPro(false)
      }
      setLoading(false)
    }
    check()
  }, [])

  return { isPro, loading }
}