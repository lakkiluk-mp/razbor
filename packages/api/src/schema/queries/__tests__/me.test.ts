import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeQuery, executeAsAnonymous } from '../../../test-utils/execute-query'
import { prismaMock } from '../../../__mocks__/prisma'

vi.mock('../../../services/credits.service', () => ({
  getRemainingCredits: vi.fn(),
  ACTIVE_STATUSES: ['active', 'past_due'],
}))

vi.mock('../../../services/subscription.service', () => ({
  getActiveSubscription: vi.fn(),
}))

import { getRemainingCredits } from '../../../services/credits.service'
import { getActiveSubscription } from '../../../services/subscription.service'

const getRemainingCreditsMock = vi.mocked(getRemainingCredits)
const getActiveSubscriptionMock = vi.mocked(getActiveSubscription)

beforeEach(() => {
  vi.clearAllMocks()
})

const ME_QUERY = `
  query {
    me {
      id
      firstName
      lastName
      username
      isPremium
      totalCalculations
      trialCredits
      subscriptionCredits
      totalCredits
      subscription {
        id
        plan
        status
        credits
        creditsTotal
        cancelAtPeriodEnd
        daysRemaining
      }
    }
  }
`

const now = new Date()
const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

describe('me', () => {
  it('should return user profile without subscription when no active sub', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      firstName: 'Тест',
      lastName: 'Юзер',
      username: 'testuser',
      isPremium: false,
    })
    prismaMock.calculation.count.mockResolvedValue(5)
    getRemainingCreditsMock.mockResolvedValue({ trial: 2, subscription: 0, total: 2 })
    getActiveSubscriptionMock.mockResolvedValue(null)

    const result = await executeQuery(ME_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.me).toMatchObject({
      id: 'test-user-id',
      firstName: 'Тест',
      lastName: 'Юзер',
      username: 'testuser',
      isPremium: false,
      totalCalculations: 5,
      trialCredits: 2,
      subscriptionCredits: 0,
      totalCredits: 2,
      subscription: null,
    })
  })

  it('should return user profile with subscription data when active sub exists', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      firstName: 'Тест',
      lastName: null,
      username: null,
      isPremium: true,
    })
    prismaMock.calculation.count.mockResolvedValue(15)
    getRemainingCreditsMock.mockResolvedValue({ trial: 0, subscription: 20, total: 20 })
    getActiveSubscriptionMock.mockResolvedValue({
      id: 'sub-1',
      plan: 'monthly',
      status: 'active',
      credits: 20,
      creditsTotal: 25,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      userId: 'test-user-id',
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
      lastRetryAt: null,
    })

    const result = await executeQuery(ME_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.me.subscription).toMatchObject({
      id: 'sub-1',
      plan: 'monthly',
      status: 'active',
      credits: 20,
      creditsTotal: 25,
      cancelAtPeriodEnd: false,
    })
    expect(result.data?.me.isPremium).toBe(true)
  })

  it('should return null when user not found in database', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.calculation.count.mockResolvedValue(0)
    getRemainingCreditsMock.mockResolvedValue({ trial: 0, subscription: 0, total: 0 })
    getActiveSubscriptionMock.mockResolvedValue(null)

    const result = await executeQuery(ME_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.me).toBeNull()
  })

  it('should return null when not authenticated', async () => {
    const result = await executeAsAnonymous(ME_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.me).toBeNull()
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled()
  })

  it('should correctly report isPremium', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      firstName: 'Premium',
      lastName: null,
      username: null,
      isPremium: true,
    })
    prismaMock.calculation.count.mockResolvedValue(0)
    getRemainingCreditsMock.mockResolvedValue({ trial: 3, subscription: 5, total: 8 })
    getActiveSubscriptionMock.mockResolvedValue({
      id: 'sub-p',
      plan: 'weekly',
      status: 'active',
      credits: 5,
      creditsTotal: 5,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      userId: 'test-user-id',
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
      lastRetryAt: null,
    })

    const result = await executeQuery(ME_QUERY)

    expect(result.data?.me.isPremium).toBe(true)
  })

  it('should count total calculations correctly', async () => {
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      firstName: 'Counter',
      lastName: null,
      username: null,
      isPremium: false,
    })
    prismaMock.calculation.count.mockResolvedValue(42)
    getRemainingCreditsMock.mockResolvedValue({ trial: 1, subscription: 0, total: 1 })
    getActiveSubscriptionMock.mockResolvedValue(null)

    const result = await executeQuery(ME_QUERY)

    expect(result.data?.me.totalCalculations).toBe(42)
  })

  it('should compute daysRemaining on subscription', async () => {
    const futureEnd = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'test-user-id',
      firstName: 'Days',
      lastName: null,
      username: null,
      isPremium: true,
    })
    prismaMock.calculation.count.mockResolvedValue(0)
    getRemainingCreditsMock.mockResolvedValue({ trial: 0, subscription: 3, total: 3 })
    getActiveSubscriptionMock.mockResolvedValue({
      id: 'sub-days',
      plan: 'weekly',
      status: 'active',
      credits: 3,
      creditsTotal: 5,
      currentPeriodStart: now,
      currentPeriodEnd: futureEnd,
      cancelAtPeriodEnd: false,
      userId: 'test-user-id',
      createdAt: now,
      updatedAt: now,
      retryCount: 0,
      lastRetryAt: null,
    })

    const result = await executeQuery(ME_QUERY)

    expect(result.data?.me.subscription.daysRemaining).toBeGreaterThanOrEqual(4)
    expect(result.data?.me.subscription.daysRemaining).toBeLessThanOrEqual(5)
  })
})
