export function formatPrice(value: number): string {
  return value.toLocaleString('ru-RU')
}

export const ROUTES = {
  home: '/',
  brand: (brandSlug: string) => `/${brandSlug}`,
  model: (brandSlug: string, modelSlug: string) => `/${brandSlug}/${modelSlug}`,
  estimation: (generationSlug: string) => `/estimation/${generationSlug}`,
  result: (calcId: string) => `/result/${calcId}`,
  subscribe: '/subscribe',
  payment: '/payment',
  paymentSuccess: '/payment/success',
  limitReached: '/limit-reached',
} as const

export const TRIAL_CREDITS = 3

export const SUBSCRIPTION_PLANS = {
  weekly: { price: 249, label: '1 неделя', days: 7, credits: 5, graceDays: 1, maxRetries: 2 },
  monthly: { price: 799, label: '1 месяц', days: 30, credits: 25, graceDays: 3, maxRetries: 3 },
} as const

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS

export const SUBSCRIPTION_MAX_RETRIES = 3

export const FATAL_CANCELLATION_REASONS = [
  'card_expired',
  'fraud_suspected',
  'permission_revoked',
  'payment_method_restricted',
] as const

export const PLAN_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SUBSCRIPTION_PLANS).map(([key, val]) => [key, val.label])
)

export function pluralCredits(n: number): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 19) return 'расчётов'
  if (mod10 === 1) return 'расчёт'
  if (mod10 >= 2 && mod10 <= 4) return 'расчёта'
  return 'расчётов'
}

export const CACHE_TTL = {
  prices: 14 * 24 * 60 * 60,
} as const

export { MONITOR_CITIES, type MonitorCity } from './cities'

export function getMonitorSlotLimits(): { trial: number; premium: number } {
  return {
    trial: Number((typeof process !== 'undefined' && process.env?.MONITOR_SLOTS_TRIAL) || 1),
    premium: Number((typeof process !== 'undefined' && process.env?.MONITOR_SLOTS_PREMIUM) || 3),
  }
}

export const MONITOR_SUBSCRIPTIONS_CHANNEL = 'monitor:subscriptions:changed'

export { parseAvitoUrl, type AvitoUrlParseResult } from './avito-url-parser'
