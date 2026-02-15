import { describe, it, expect } from 'vitest'
import {
  SUBSCRIPTION_PLANS,
  TRIAL_CREDITS,
  pluralCredits,
  PLAN_LABELS,
  SUBSCRIPTION_MAX_RETRIES,
  FATAL_CANCELLATION_REASONS,
  CACHE_TTL,
  ROUTES,
  formatPrice,
} from '../index'

describe('SUBSCRIPTION_PLANS', () => {
  it('should have weekly plan with correct price', () => {
    expect(SUBSCRIPTION_PLANS.weekly.price).toBe(249)
  })

  it('should have weekly plan with 7 days', () => {
    expect(SUBSCRIPTION_PLANS.weekly.days).toBe(7)
  })

  it('should have weekly plan with 5 credits', () => {
    expect(SUBSCRIPTION_PLANS.weekly.credits).toBe(5)
  })

  it('should have monthly plan with correct price', () => {
    expect(SUBSCRIPTION_PLANS.monthly.price).toBe(788)
  })

  it('should have monthly plan with 30 days', () => {
    expect(SUBSCRIPTION_PLANS.monthly.days).toBe(30)
  })

  it('should have monthly plan with 25 credits', () => {
    expect(SUBSCRIPTION_PLANS.monthly.credits).toBe(25)
  })

  it('should have labels for both plans', () => {
    expect(SUBSCRIPTION_PLANS.weekly.label).toBe('1 неделя')
    expect(SUBSCRIPTION_PLANS.monthly.label).toBe('1 месяц')
  })

  it('should have graceDays per plan', () => {
    expect(SUBSCRIPTION_PLANS.weekly.graceDays).toBe(1)
    expect(SUBSCRIPTION_PLANS.monthly.graceDays).toBe(3)
  })

  it('should have exactly two plans', () => {
    expect(Object.keys(SUBSCRIPTION_PLANS)).toHaveLength(2)
    expect(Object.keys(SUBSCRIPTION_PLANS)).toEqual(['weekly', 'monthly'])
  })
})

describe('TRIAL_CREDITS', () => {
  it('should be 3', () => {
    expect(TRIAL_CREDITS).toBe(3)
  })
})

describe('pluralCredits', () => {
  it('should return "расчёт" for 1', () => {
    expect(pluralCredits(1)).toBe('расчёт')
  })

  it('should return "расчёта" for 2', () => {
    expect(pluralCredits(2)).toBe('расчёта')
  })

  it('should return "расчёта" for 3', () => {
    expect(pluralCredits(3)).toBe('расчёта')
  })

  it('should return "расчёта" for 4', () => {
    expect(pluralCredits(4)).toBe('расчёта')
  })

  it('should return "расчётов" for 5', () => {
    expect(pluralCredits(5)).toBe('расчётов')
  })

  it('should return "расчётов" for 11', () => {
    expect(pluralCredits(11)).toBe('расчётов')
  })

  it('should return "расчётов" for 12', () => {
    expect(pluralCredits(12)).toBe('расчётов')
  })

  it('should return "расчётов" for 0', () => {
    expect(pluralCredits(0)).toBe('расчётов')
  })

  it('should return "расчёт" for 21', () => {
    expect(pluralCredits(21)).toBe('расчёт')
  })

  it('should return "расчётов" for 111', () => {
    expect(pluralCredits(111)).toBe('расчётов')
  })
})

describe('PLAN_LABELS', () => {
  it('should map weekly to label', () => {
    expect(PLAN_LABELS['weekly']).toBe('1 неделя')
  })

  it('should map monthly to label', () => {
    expect(PLAN_LABELS['monthly']).toBe('1 месяц')
  })
})

describe('SUBSCRIPTION_MAX_RETRIES', () => {
  it('should be 3', () => {
    expect(SUBSCRIPTION_MAX_RETRIES).toBe(3)
  })
})

describe('FATAL_CANCELLATION_REASONS', () => {
  it('should contain card_expired', () => {
    expect(FATAL_CANCELLATION_REASONS).toContain('card_expired')
  })

  it('should contain fraud_suspected', () => {
    expect(FATAL_CANCELLATION_REASONS).toContain('fraud_suspected')
  })

  it('should contain permission_revoked', () => {
    expect(FATAL_CANCELLATION_REASONS).toContain('permission_revoked')
  })

  it('should contain payment_method_restricted', () => {
    expect(FATAL_CANCELLATION_REASONS).toContain('payment_method_restricted')
  })

  it('should have exactly 4 reasons', () => {
    expect(FATAL_CANCELLATION_REASONS).toHaveLength(4)
  })
})

describe('CACHE_TTL', () => {
  it('should have prices TTL of 14 days in seconds', () => {
    expect(CACHE_TTL.prices).toBe(14 * 24 * 60 * 60)
  })
})

describe('ROUTES', () => {
  it('should have home route', () => {
    expect(ROUTES.home).toBe('/')
  })

  it('should generate brand route', () => {
    expect(ROUTES.brand('toyota')).toBe('/toyota')
  })

  it('should generate model route', () => {
    expect(ROUTES.model('toyota', 'camry')).toBe('/toyota/camry')
  })
})

describe('formatPrice', () => {
  it('should format number with locale', () => {
    const result = formatPrice(100000)
    expect(result).toContain('100')
  })
})
