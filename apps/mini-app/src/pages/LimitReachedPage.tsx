import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export function LimitReachedPage() {
  const navigate = useNavigate()

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
        <h1 className="text-2xl font-bold mb-4">Пробные расчёты закончились</h1>
        <p className="text-zinc-400 mb-8">
          Оформите подписку для продолжения
        </p>

        <div className="space-y-3">
          <Button
            className="w-full h-14 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-base font-bold rounded-2xl"
            onClick={() => navigate('/subscribe')}
          >
            Оформить Premium
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
