import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeQuery, executeAsAnonymous } from '../../../test-utils/execute-query'
import { prismaMock } from '../../../__mocks__/prisma'

vi.mock('../../../services/subscription.service', () => ({
  getActiveSubscription: vi.fn(),
}))

import { getActiveSubscription } from '../../../services/subscription.service'
const getActiveSubscriptionMock = vi.mocked(getActiveSubscription)

beforeEach(() => {
  vi.clearAllMocks()
})

const MY_SUBSCRIPTION_QUERY = `
  query {
    mySubscription {
      id
      plan
      status
      credits
      creditsTotal
      currentPeriodStart
      currentPeriodEnd
      cancelAtPeriodEnd
      daysRemaining
    }
  }
`

const SUBSCRIPTION_PLANS_QUERY = `
  query {
    subscriptionPlans {
      plan
      price
      label
      days
      credits
    }
  }
`

const MY_PAYMENT_METHODS_QUERY = `
  query {
    myPaymentMethods {
      id
      cardLast4
      cardType
      expiryMonth
      expiryYear
      isDefault
    }
  }
`

describe('mySubscription', () => {
  it('should return subscription data when user has active subscription', async () => {
    const now = new Date()
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    getActiveSubscriptionMock.mockResolvedValue({
      id: 'sub-1',
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

    const result = await executeQuery(MY_SUBSCRIPTION_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.mySubscription).toMatchObject({
      id: 'sub-1',
      plan: 'weekly',
      status: 'active',
      credits: 5,
      creditsTotal: 5,
      cancelAtPeriodEnd: false,
    })
    expect(result.data?.mySubscription.daysRemaining).toBeGreaterThanOrEqual(6)
  })

  it('should return null when user has no subscription', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)

    const result = await executeQuery(MY_SUBSCRIPTION_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.mySubscription).toBeNull()
  })

  it('should return null when user is not authenticated', async () => {
    const result = await executeAsAnonymous(MY_SUBSCRIPTION_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.mySubscription).toBeNull()
    expect(getActiveSubscriptionMock).not.toHaveBeenCalled()
  })

  it('should return subscription data when status is past_due', async () => {
    const now = new Date()
    const end = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
    getActiveSubscriptionMock.mockResolvedValue({
      id: 'sub-2',
      plan: 'monthly',
      status: 'past_due',
      credits: 20,
      creditsTotal: 25,
      currentPeriodStart: now,
      currentPeriodEnd: end,
      cancelAtPeriodEnd: false,
      userId: 'test-user-id',
      createdAt: now,
      updatedAt: now,
      retryCount: 1,
      lastRetryAt: now,
    })

    const result = await executeQuery(MY_SUBSCRIPTION_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.mySubscription).toMatchObject({
      id: 'sub-2',
      plan: 'monthly',
      status: 'past_due',
      credits: 20,
    })
  })

  it('should return null when subscription is expired (not in active statuses)', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)

    const result = await executeQuery(MY_SUBSCRIPTION_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.mySubscription).toBeNull()
  })

  it('should return daysRemaining=0 when period has ended', async () => {
    const past = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    const pastEnd = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    getActiveSubscriptionMock.mockResolvedValue({
      id: 'sub-expired',
      plan: 'weekly',
      status: 'past_due',
      credits: 0,
      creditsTotal: 5,
      currentPeriodStart: past,
      currentPeriodEnd: pastEnd,
      cancelAtPeriodEnd: false,
      userId: 'test-user-id',
      createdAt: past,
      updatedAt: past,
      retryCount: 2,
      lastRetryAt: past,
    })

    const result = await executeQuery(MY_SUBSCRIPTION_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.mySubscription.daysRemaining).toBe(0)
  })

  it('should pass user id to getActiveSubscription service', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)

    await executeQuery(MY_SUBSCRIPTION_QUERY)

    expect(getActiveSubscriptionMock).toHaveBeenCalledWith(expect.anything(), 'test-user-id')
  })
})

describe('subscriptionPlans', () => {
  it('should return 2 plans with correct data', async () => {
    const result = await executeQuery(SUBSCRIPTION_PLANS_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.subscriptionPlans).toHaveLength(2)

    const weekly = result.data?.subscriptionPlans.find((p: { plan: string }) => p.plan === 'weekly')
    expect(weekly).toEqual({
      plan: 'weekly',
      price: 249,
      label: '1 неделя',
      days: 7,
      credits: 5,
    })

    const monthly = result.data?.subscriptionPlans.find((p: { plan: string }) => p.plan === 'monthly')
    expect(monthly).toEqual({
      plan: 'monthly',
      price: 788,
      label: '1 месяц',
      days: 30,
      credits: 25,
    })
  })

  it('should not require authentication', async () => {
    const result = await executeAsAnonymous(SUBSCRIPTION_PLANS_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.subscriptionPlans).toHaveLength(2)
  })
})

describe('myPaymentMethods', () => {
  it('should return payment methods when user has them', async () => {
    prismaMock.paymentMethod.findMany.mockResolvedValue([
      {
        id: 'pm-1',
        cardLast4: '4242',
        cardType: 'Visa',
        expiryMonth: '12',
        expiryYear: '2027',
        isDefault: true,
        userId: 'test-user-id',
      },
      {
        id: 'pm-2',
        cardLast4: '1234',
        cardType: 'MasterCard',
        expiryMonth: '06',
        expiryYear: '2028',
        isDefault: false,
        userId: 'test-user-id',
      },
    ])

    const result = await executeQuery(MY_PAYMENT_METHODS_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.myPaymentMethods).toHaveLength(2)
    expect(result.data?.myPaymentMethods[0]).toMatchObject({
      id: 'pm-1',
      cardLast4: '4242',
      cardType: 'Visa',
      isDefault: true,
    })
  })

  it('should return empty array when user has no payment methods', async () => {
    prismaMock.paymentMethod.findMany.mockResolvedValue([])

    const result = await executeQuery(MY_PAYMENT_METHODS_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.myPaymentMethods).toEqual([])
  })

  it('should return empty array when not authenticated', async () => {
    const result = await executeAsAnonymous(MY_PAYMENT_METHODS_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.myPaymentMethods).toEqual([])
    expect(prismaMock.paymentMethod.findMany).not.toHaveBeenCalled()
  })
})
