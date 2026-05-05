'use client'

import { useEffect, useState } from 'react'

export function useInputHistory(storageKey: string, maxItems = 10) {
  const [history, setHistory] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) setHistory(JSON.parse(stored))
    } catch {}
  }, [storageKey])

  function addToHistory(value: string) {
    const trimmed = value.trim()
    if (!trimmed) return
    setHistory((prev) => {
      const next = [trimmed, ...prev.filter((v) => v !== trimmed)].slice(0, maxItems)
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      return next
    })
  }

  return { history, addToHistory }
}
