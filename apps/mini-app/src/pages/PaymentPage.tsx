import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { fetchGraphQL, mutations } from '@/lib/graphql-client'
import { PLAN_LABELS, SUBSCRIPTION_PLANS, pluralCredits } from '@razbor/shared'
import { useYooKassaWidget } from '@/hooks/use-yookassa-widget'

interface CreateSubscriptionResponse {
  createSubscription: {
    confirmationToken: string | null
    subscriptionId: string
    paymentId: string
  }
}

const PAYMENT_CONTAINER_ID = 'payment-form'

export function PaymentPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const hasFired = useRef(false)
  const [confirmationToken, setConfirmationToken] = useState<string | null>(null)
  const [widgetFailed, setWidgetFailed] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const [isActiveSubscription, setIsActiveSubscription] = useState(false)

  const plan = (location.state as { plan?: string } | null)?.plan
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const planConfig = plan ? SUBSCRIPTION_PLANS[plan as keyof typeof SUBSCRIPTION_PLANS] : null

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((v) => v - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const { mutate, isPending, isError, reset } = useMutation({
    mutationFn: (selectedPlan: string) =>
      fetchGraphQL<CreateSubscriptionResponse>(mutations.createSubscription, {
        plan: selectedPlan,
      }),
    onSuccess: (data) => {
      const token = data.createSubscription.confirmationToken
      if (token) {
        setConfirmationToken(token)
        setWidgetFailed(false)
      } else {
        queryClient.invalidateQueries({ queryKey: ['me'] })
        queryClient.invalidateQueries({ queryKey: ['mySubscription'] })
        queryClient.invalidateQueries({ queryKey: ['usageInfo'] })
        navigate('/payment/success', { replace: true, state: { returnTo } })
      }
    },
    onError: (err: unknown) => {
      const code = (err as Error & { code?: string }).code
      if (code === 'ACTIVE_SUBSCRIPTION') {
        setIsActiveSubscription(true)
        return
      }
      const msg = err instanceof Error ? err.message : String(err)
      const match = msg.match(/через (\d+) сек/)
      if (match) {
        setCooldown(Number(match[1]))
      }
    },
  })

  const handleWidgetSuccess = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['me'] })
    queryClient.invalidateQueries({ queryKey: ['mySubscription'] })
    queryClient.invalidateQueries({ queryKey: ['usageInfo'] })
    navigate('/payment/success', { replace: true, state: { returnTo } })
  }, [queryClient, navigate, returnTo])

  const handleWidgetFail = useCallback(() => {
    setWidgetFailed(true)
    setConfirmationToken(null)
  }, [])

  const { isReady, error: widgetError } = useYooKassaWidget({
    confirmationToken,
    containerId: PAYMENT_CONTAINER_ID,
    onSuccess: handleWidgetSuccess,
    onFail: handleWidgetFail,
  })

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (!tg) return
    const handleBack = () => navigate('/subscribe', { replace: true, state: { returnTo } })
    tg.BackButton.show()
    tg.BackButton.onClick(handleBack)
    return () => {
      tg.BackButton.offClick(handleBack)
      tg.BackButton.hide()
    }
  }, [navigate, returnTo])

  useEffect(() => {
    if (!plan) {
      navigate('/subscribe', { replace: true, state: { returnTo } })
      return
    }
    if (!hasFired.current) {
      hasFired.current = true
      mutate(plan)
    }
  }, [plan, navigate, mutate, returnTo])

  const cancelMutation = useMutation({
    mutationFn: () => fetchGraphQL(mutations.cancelSubscription),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
      setIsActiveSubscription(false)
      reset()
      if (plan) mutate(plan)
    },
  })

  const handleRetry = () => {
    hasFired.current = false
    setConfirmationToken(null)
    setWidgetFailed(false)
    reset()
    if (plan) mutate(plan)
  }

  if (isActiveSubscription) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 flex items-center justify-center">
            <span className="text-amber-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold">Подписка уже активна</h1>
          <p className="text-zinc-400 text-sm">
            Отмените текущую подписку, чтобы оформить новую. Оставшиеся оценки будут заменены новым тарифом.
          </p>
          <Button
            onClick={() => cancelMutation.mutate()}
            disabled={cancelMutation.isPending}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
          >
            {cancelMutation.isPending ? 'Отмена подписки...' : 'Отменить и оформить новую'}
          </Button>
          {cancelMutation.isError && (
            <p className="text-red-400 text-sm">Не удалось отменить. Попробуйте позже.</p>
          )}
          <Button
            onClick={() => navigate('/subscribe', { replace: true, state: { returnTo } })}
            variant="ghost"
            className="w-full h-12 text-zinc-400 text-sm"
          >
            Назад
          </Button>
        </div>
      </div>
    )
  }

  if (isError) {
    const isRateLimited = cooldown > 0
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold">
            {isRateLimited ? 'Слишком много попыток' : 'Ошибка создания платежа'}
          </h1>
          <p className="text-zinc-400 text-sm">
            {isRateLimited
              ? `Доступно через ${cooldown} сек.`
              : 'Не удалось оформить подписку. Попробуйте ещё раз.'}
          </p>
          <Button
            onClick={handleRetry}
            disabled={isPending || isRateLimited}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
          >
            {isPending ? 'Обработка...' : isRateLimited ? `Подождите ${cooldown} сек.` : 'Попробовать снова'}
          </Button>
        </div>
      </div>
    )
  }

  if (widgetFailed || widgetError) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-sm space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 flex items-center justify-center">
            <span className="text-red-500 text-2xl font-bold">!</span>
          </div>
          <h1 className="text-xl font-bold">Ошибка оплаты</h1>
          <p className="text-zinc-400 text-sm">
            {widgetError ?? 'Платёж не удался. Попробуйте ещё раз.'}
          </p>
          <Button
            onClick={handleRetry}
            disabled={isPending}
            className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
          >
            {isPending ? 'Обработка...' : 'Попробовать снова'}
          </Button>
        </div>
      </div>
    )
  }

  if (!confirmationToken) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 mx-auto border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-lg">Подготовка платежа...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col px-4 pt-4 pb-6">
      <h1 className="text-2xl font-bold mb-4">Оплата</h1>

      {planConfig && plan && (
        <div className="bg-zinc-900 rounded-2xl p-4 mb-4 flex items-center justify-between">
          <div>
            <p className="text-zinc-100 font-semibold">
              Premium &middot; {PLAN_LABELS[plan] ?? plan}
            </p>
            <p className="text-zinc-400 text-sm">
              {planConfig.credits} {pluralCredits(planConfig.credits)}
            </p>
          </div>
          <p className="text-zinc-100 font-bold text-lg">{planConfig.price} &#8381;</p>
        </div>
      )}

      <div className="relative">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/80 rounded-2xl z-10">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <div id={PAYMENT_CONTAINER_ID} className="min-h-[400px] rounded-2xl overflow-hidden" />
      </div>
    </div>
  )
}
