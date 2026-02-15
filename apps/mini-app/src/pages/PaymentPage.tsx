import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { fetchGraphQL, mutations } from '@/lib/graphql-client'

interface CreateSubscriptionResponse {
  createSubscription: {
    confirmationToken: string | null
    subscriptionId: string
    paymentId: string
  }
}

export function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const hasFired = useRef(false)

  const plan = (location.state as { plan?: string } | null)?.plan

  const { mutate, isPending, isError, reset } = useMutation({
    mutationFn: (selectedPlan: string) =>
      fetchGraphQL<CreateSubscriptionResponse>(mutations.createSubscription, {
        plan: selectedPlan,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] })
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] })
      queryClient.invalidateQueries({ queryKey: ['usageInfo'] })
      navigate('/payment/success', { replace: true })
    },
  })

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    tg?.BackButton?.hide()
    return () => { tg?.BackButton?.hide() }
  }, [])

  useEffect(() => {
    if (!plan) {
      navigate('/subscribe', { replace: true })
      return
    }
    if (!hasFired.current) {
      hasFired.current = true
      mutate(plan)
    }
  }, [plan, navigate, mutate])

  if (isError) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold">Ошибка создания платежа</h1>
          <p className="text-zinc-400 text-sm">
            Не удалось оформить подписку. Попробуйте ещё раз.
          </p>
          <Button
            onClick={() => {
              hasFired.current = false
              reset()
              if (plan) mutate(plan)
            }}
            disabled={isPending}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
          >
            {isPending ? 'Обработка...' : 'Попробовать снова'}
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/subscribe', { replace: true })}
            className="w-full h-14 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-2xl"
          >
            Назад
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 mx-auto border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-400 text-lg">Обработка платежа...</p>
      </div>
    </div>
  )
}
