import { useEffect, useState } from 'react'
import { FREE_ESTIMATES_LIMIT, STORAGE_KEY, DAY_MS } from '@/lib/constants'

interface UsageData {
  count: number
  resetAt: number
}

function getUsageData(): UsageData {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    const data = { count: 0, resetAt: Date.now() + DAY_MS }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data
  }

  try {
    const data: UsageData = JSON.parse(stored)

    if (Date.now() > data.resetAt) {
      const newData = { count: 0, resetAt: Date.now() + DAY_MS }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newData))
      return newData
    }

    return data
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    const data = { count: 0, resetAt: Date.now() + DAY_MS }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return data
  }
}

export function incrementUsage(): boolean {
  const now = Date.now()
  const stored = localStorage.getItem(STORAGE_KEY)

  let data: UsageData
  try {
    data = stored ? JSON.parse(stored) : { count: 0, resetAt: now + DAY_MS }
    if (now > data.resetAt) {
      data = { count: 0, resetAt: now + DAY_MS }
    }
  } catch {
    data = { count: 0, resetAt: now + DAY_MS }
  }

  if (data.count >= FREE_ESTIMATES_LIMIT) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return false
  }

  data.count++
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  return true
}

export function getRemainingEstimates(): number {
  const data = getUsageData()
  return Math.max(0, FREE_ESTIMATES_LIMIT - data.count)
}

export function UsageCounter() {
  const [remaining, setRemaining] = useState(FREE_ESTIMATES_LIMIT)

  useEffect(() => {
    setRemaining(getRemainingEstimates())
  }, [])

  return (
    <div className="px-4 pb-8">
      <div className="bg-zinc-900 rounded-xl px-4 py-3 text-center">
        <span className="text-zinc-400 text-sm">
          Осталось{' '}
          <span className="text-amber-400 font-semibold">{remaining}</span>{' '}
          бесплатных оценки
        </span>
      </div>
    </div>
  )
}
