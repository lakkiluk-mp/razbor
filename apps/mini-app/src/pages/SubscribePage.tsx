import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import { Crown, Sparkles, AlertTriangle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { PlanCard } from '@/components/features/plan-card'
import { SubscriptionStatus } from '@/components/features/subscription-status'
import { PaymentMethodCard } from '@/components/features/payment-method-card'
import { fetchGraphQL, queries, mutations } from '@/lib/graphql-client'

interface SubscriptionPlan {
  plan: string
  price: number
  label: string
  days: number
  credits: number
}

interface Subscription {
  id: string
  plan: string
  status: string
  credits: number
  creditsTotal: number
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  daysRemaining: number
}

interface PaymentMethod {
  id: string
  cardLast4: string
  cardType: string
  expiryMonth: string
  expiryYear: string
  isDefault: boolean
}

interface PlansResponse {
  subscriptionPlans: SubscriptionPlan[]
}

interface SubscriptionResponse {
  mySubscription: Subscription | null
}

interface PaymentMethodsResponse {
  myPaymentMethods: PaymentMethod[]
}

const PLAN_BADGES: Record<string, string> = {
  monthly: 'Выгодно',
}

export function SubscribePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const returnTo = (location.state as { returnTo?: string } | null)?.returnTo
  const [selectedPlan, setSelectedPlan] = useState('weekly')
  const [showPlans, setShowPlans] = useState(false)
  const [cancelDrawerOpen, setCancelDrawerOpen] = useState(false)
  const [resumeDrawerOpen, setResumeDrawerOpen] = useState(false)
  const [removeCardDrawerOpen, setRemoveCardDrawerOpen] = useState(false)
  const [cardToRemove, setCardToRemove] = useState<PaymentMethod | null>(null)

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

  const {
    data: plansData,
    isLoading: plansLoading,
  } = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: () => fetchGraphQL<PlansResponse>(queries.subscriptionPlans),
  })

  const {
    data: subData,
    isLoading: subLoading,
  } = useQuery({
    queryKey: ['mySubscription'],
    queryFn: () => fetchGraphQL<SubscriptionResponse>(queries.mySubscription),
  })

  const {
    data: methodsData,
    isLoading: methodsLoading,
  } = useQuery({
    queryKey: ['myPaymentMethods'],
    queryFn: () => fetchGraphQL<PaymentMethodsResponse>(queries.myPaymentMethods),
  })

  const cancelMutation = useMutation({
    mutationFn: () => fetchGraphQL(mutations.cancelSubscription),
    onSuccess: () => {
      setCancelDrawerOpen(false)
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => {
      window.Telegram?.WebApp?.showPopup?.({
        title: 'Ошибка',
        message: 'Произошла ошибка. Попробуйте позже.',
        buttons: [{ type: 'ok' }],
      })
    },
  })

  const resumeMutation = useMutation({
    mutationFn: () => fetchGraphQL(mutations.resumeSubscription),
    onSuccess: () => {
      setResumeDrawerOpen(false)
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] })
      queryClient.invalidateQueries({ queryKey: ['me'] })
    },
    onError: () => {
      window.Telegram?.WebApp?.showPopup?.({
        title: 'Ошибка',
        message: 'Произошла ошибка. Попробуйте позже.',
        buttons: [{ type: 'ok' }],
      })
    },
  })

  const removeMethodMutation = useMutation({
    mutationFn: (paymentMethodId: string) =>
      fetchGraphQL(mutations.removePaymentMethod, { paymentMethodId }),
    onSuccess: () => {
      setRemoveCardDrawerOpen(false)
      setCardToRemove(null)
      queryClient.invalidateQueries({ queryKey: ['myPaymentMethods'] })
      queryClient.invalidateQueries({ queryKey: ['mySubscription'] })
    },
    onError: () => {
      window.Telegram?.WebApp?.showPopup?.({
        title: 'Ошибка',
        message: 'Произошла ошибка. Попробуйте позже.',
        buttons: [{ type: 'ok' }],
      })
    },
  })

  const isLoading = plansLoading || subLoading || methodsLoading
  const subscription = subData?.mySubscription
  const hasSubscription = subscription && (subscription.status === 'active' || subscription.status === 'past_due')
  const plans = plansData?.subscriptionPlans ?? []
  const paymentMethods = methodsData?.myPaymentMethods ?? []

  const selectedPlanData = plans.find((p) => p.plan === selectedPlan) ?? plans[0]

  if (isLoading) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col px-4 pt-8 pb-6">
        <div className="space-y-4">
          <div className="h-8 w-48 bg-zinc-800 rounded-lg animate-pulse mx-auto" />
          <div className="h-24 bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-20 bg-zinc-800 rounded-2xl animate-pulse" />
          <div className="h-20 bg-zinc-800 rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (hasSubscription && !showPlans) {
    return (
      <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col px-4 pt-8 pb-6">
        <div className="text-center mb-6">
          <Crown className="w-10 h-10 text-amber-500 mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Premium подписка</h1>
        </div>

        <SubscriptionStatus
          subscription={subscription}
        />

        {paymentMethods.length > 0 && (
          <div className="mt-4 space-y-3">
            <p className="text-zinc-400 text-sm">Способ оплаты</p>
            {paymentMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                cardLast4={method.cardLast4}
                cardType={method.cardType}
                expiryMonth={method.expiryMonth}
                expiryYear={method.expiryYear}
                onRemove={() => {
                  setCardToRemove(method)
                  setRemoveCardDrawerOpen(true)
                }}
              />
            ))}
          </div>
        )}

        <div className="mt-auto pt-6 space-y-3">
          {subscription.cancelAtPeriodEnd ? (
            <>
              {paymentMethods.length > 0 && (
                <Button
                  onClick={() => setResumeDrawerOpen(true)}
                  className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
                >
                  Возобновить автопродление
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => setShowPlans(true)}
                className="w-full h-14 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-2xl"
              >
                {paymentMethods.length > 0 ? 'Сменить план' : 'Оформить новую подписку'}
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => setShowPlans(true)}
                className="w-full h-14 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-2xl"
              >
                Изменить подписку
              </Button>
              <Button
                variant="outline"
                onClick={() => setCancelDrawerOpen(true)}
                className="w-full h-14 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500 rounded-2xl"
              >
                Отменить подписку
              </Button>
            </>
          )}
        </div>

        <Drawer open={resumeDrawerOpen} onOpenChange={setResumeDrawerOpen}>
          <DrawerContent>
            <DrawerHeader className="text-center">
              <Crown className="w-10 h-10 text-amber-500 mx-auto mb-1" />
              <DrawerTitle>Возобновить подписку?</DrawerTitle>
              <DrawerDescription>
                Автопродление будет включено. Подписка продлится автоматически после окончания текущего периода.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button
                onClick={() => resumeMutation.mutate()}
                disabled={resumeMutation.isPending}
                className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
              >
                {resumeMutation.isPending ? 'Восстановление...' : 'Да, возобновить'}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="w-full h-14 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-2xl"
                >
                  Отмена
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer open={cancelDrawerOpen} onOpenChange={setCancelDrawerOpen}>
          <DrawerContent>
            <DrawerHeader className="text-center">
              <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-1" />
              <DrawerTitle>Отменить подписку?</DrawerTitle>
              <DrawerDescription>
                Подписка останется активной до конца оплаченного периода. После этого доступ к Premium будет ограничен.
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white text-base font-semibold rounded-2xl"
              >
                {cancelMutation.isPending ? 'Отмена...' : 'Да, отменить'}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="w-full h-14 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-2xl"
                >
                  Оставить подписку
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Drawer open={removeCardDrawerOpen} onOpenChange={(open) => {
          setRemoveCardDrawerOpen(open)
          if (!open) setCardToRemove(null)
        }}>
          <DrawerContent>
            <DrawerHeader className="text-center">
              <CreditCard className="w-10 h-10 text-red-500 mx-auto mb-1" />
              <DrawerTitle>Удалить карту?</DrawerTitle>
              <DrawerDescription>
                {cardToRemove && `${cardToRemove.cardType} •••• ${cardToRemove.cardLast4}`}
                {paymentMethods.length <= 1
                  ? '. Это единственный способ оплаты — подписка будет отменена после окончания текущего периода.'
                  : ''}
              </DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <Button
                onClick={() => cardToRemove && removeMethodMutation.mutate(cardToRemove.id)}
                disabled={removeMethodMutation.isPending}
                className="w-full h-14 bg-red-500 hover:bg-red-600 text-white text-base font-semibold rounded-2xl"
              >
                {removeMethodMutation.isPending ? 'Удаление...' : 'Да, удалить'}
              </Button>
              <DrawerClose asChild>
                <Button
                  variant="outline"
                  className="w-full h-14 border-zinc-700 text-zinc-300 hover:bg-zinc-800 rounded-2xl"
                >
                  Отмена
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>
    )
  }

  return (
    <div className="h-full bg-zinc-950 text-zinc-100 flex flex-col px-4 pt-8 pb-6">
      <div className="text-center mb-6">
        <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-2" />
        <h1 className="text-2xl font-bold">Premium подписка</h1>
      </div>

      <div className="bg-zinc-900 rounded-2xl p-4 mb-6">
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            До 25 расчётов в месячной подписке
          </li>
          <li className="flex items-center gap-2 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Доступ к истории расчётов
          </li>
          <li className="flex items-center gap-2 text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
            Прямые ссылки на объявления по запчастям
          </li>
        </ul>
      </div>

      <p className="text-zinc-400 text-sm mb-3">Выберите план:</p>

      <div className="space-y-3 mb-6">
        {plans.map((plan) => (
          <PlanCard
            key={plan.plan}
            plan={plan.plan}
            price={plan.price}
            label={plan.label}
            credits={plan.credits}
            isSelected={selectedPlan === plan.plan}
            badge={PLAN_BADGES[plan.plan]}
            onSelect={() => setSelectedPlan(plan.plan)}
          />
        ))}
      </div>

      <div className="mt-auto">
        <Button
          onClick={() => navigate('/payment', { state: { plan: selectedPlan, returnTo } })}
          className="w-full h-14 bg-amber-500 hover:bg-amber-600 text-zinc-900 text-base font-semibold rounded-2xl"
        >
          Оформить подписку {selectedPlanData ? `${selectedPlanData.price} ₽` : ''}
        </Button>
      </div>
    </div>
  )
}
