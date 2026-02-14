import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { SUPPORT_EMAIL } from '@/lib/constants'
import { useUsageInfo } from '@/components/features/usage-counter'

function formatTimeLeft(resetAt: string): string {
  const msLeft = new Date(resetAt).getTime() - Date.now()
  if (msLeft <= 0) return ''

  const hours = Math.floor(msLeft / (60 * 60 * 1000))
  const minutes = Math.floor((msLeft % (60 * 60 * 1000)) / (60 * 1000))

  if (hours > 0) {
    return `${hours} ч. ${minutes} мин.`
  }
  return `${minutes} мин.`
}

export function LimitReachedPage() {
  const navigate = useNavigate()
  const { data } = useUsageInfo()

  const timeLeft = data ? formatTimeLeft(data.usageInfo.freeResetAt) : ''

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    tg.BackButton.show()
    const handleBack = () => navigate(-1)
    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
      tg.BackButton.hide()
    }
  }, [navigate])

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <h1 className="text-2xl font-bold mb-4">Лимит исчерпан</h1>
        <p className="text-zinc-400 mb-2">
          Вы использовали все бесплатные оценки на сегодня.
        </p>
        {timeLeft && (
          <p className="text-zinc-500 mb-8">
            Новые оценки будут доступны через:{' '}
            <span className="text-amber-500 font-semibold">{timeLeft}</span>
          </p>
        )}

        <div className="space-y-3">
          <Button
            asChild
            className="w-full h-14 bg-amber-500 hover:bg-amber-500 text-zinc-900 text-base font-semibold rounded-2xl"
          >
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Хочу больше оценок`}>
              Хочу больше оценок
            </a>
          </Button>

          <Link to="/">
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
