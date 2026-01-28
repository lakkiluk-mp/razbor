'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { STORAGE_KEY, SUPPORT_EMAIL, FREE_ESTIMATES_LIMIT } from '@/lib/constants'

function getTimeUntilReset(): string {
  if (typeof window === 'undefined') return ''

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return ''

  try {
    const data = JSON.parse(stored)
    const msLeft = data.resetAt - Date.now()

    if (msLeft <= 0) return ''

    const days = Math.floor(msLeft / (24 * 60 * 60 * 1000))
    const hours = Math.floor((msLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))

    if (days > 0) {
      return `${days} дн. ${hours} ч.`
    }
    return `${hours} ч.`
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return ''
  }
}

export default function LimitReachedPage() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    setTimeLeft(getTimeUntilReset())

    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilReset())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl mb-6">😔</div>
        <h1 className="text-2xl font-bold mb-4">Лимит исчерпан</h1>
        <p className="text-zinc-400 mb-2">
          Вы использовали {FREE_ESTIMATES_LIMIT} бесплатных оценки на этой неделе.
        </p>
        {timeLeft && (
          <p className="text-zinc-500 mb-8">
            Новые оценки будут доступны через:{' '}
            <span className="text-amber-400 font-semibold">{timeLeft}</span>
          </p>
        )}

        <div className="space-y-3">
          <Button
            asChild
            className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-zinc-900 text-base font-semibold rounded-2xl"
          >
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Хочу больше оценок`}>
              Хочу больше оценок
            </a>
          </Button>

          <Link href="/">
            <Button
              variant="outline"
              className="w-full h-14 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-2xl"
            >
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
