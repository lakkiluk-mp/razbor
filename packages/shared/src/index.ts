export function formatPrice(value: number): string {
  return value.toLocaleString('ru-RU')
}

export const ROUTES = {
  home: '/',
  brand: (brandSlug: string) => `/${brandSlug}`,
  model: (brandSlug: string, modelSlug: string) => `/${brandSlug}/${modelSlug}`,
  calculator: (generationSlug: string) => `/calculator/${generationSlug}`,
  result: (calcId: string) => `/result/${calcId}`,
} as const

export const FREE_CALCULATIONS_LIMIT = Number(process.env.NEXT_PUBLIC_FREE_CALCULATIONS_LIMIT) || 3

export const CACHE_TTL = {
  prices: 14 * 24 * 60 * 60,
} as const
