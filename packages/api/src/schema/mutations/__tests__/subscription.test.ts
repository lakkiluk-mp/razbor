import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeQuery, executeAsAnonymous } from '../../../test-utils/execute-query'
import { prismaMock } from '../../../__mocks__/prisma'

vi.mock('../../../services/subscription.service', () => ({
  getActiveSubscription: vi.fn(),
  cancelSubscription: vi.fn(),
  resumeSubscription: vi.fn(),
}))

vi.mock('../../../services/yookassa.service', () => ({
  createSubscriptionPayment: vi.fn(),
}))

import { getActiveSubscription, cancelSubscription, resumeSubscription } from '../../../services/subscription.service'
import { createSubscriptionPayment } from '../../../services/yookassa.service'

const getActiveSubscriptionMock = vi.mocked(getActiveSubscription)
const cancelSubscriptionMock = vi.mocked(cancelSubscription)
const resumeSubscriptionMock = vi.mocked(resumeSubscription)
const createSubscriptionPaymentMock = vi.mocked(createSubscriptionPayment)

beforeEach(() => {
  vi.clearAllMocks()
})

const CREATE_SUBSCRIPTION = `
  mutation CreateSubscription($plan: SubscriptionPlan!) {
    createSubscription(plan: $plan) {
      confirmationToken
      subscriptionId
      paymentId
    }
  }
`

const CANCEL_SUBSCRIPTION = `
  mutation {
    cancelSubscription {
      id
      plan
      status
      credits
      creditsTotal
      cancelAtPeriodEnd
    }
  }
`

const RESUME_SUBSCRIPTION = `
  mutation {
    resumeSubscription {
      id
      plan
      status
      credits
      creditsTotal
      cancelAtPeriodEnd
    }
  }
`

const REMOVE_PAYMENT_METHOD = `
  mutation RemovePaymentMethod($paymentMethodId: ID!) {
    removePaymentMethod(paymentMethodId: $paymentMethodId)
  }
`

function mockSubscription(overrides = {}) {
  const now = new Date()
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  return {
    id: 'sub-1',
    plan: 'weekly' as const,
    status: 'active' as const,
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
    ...overrides,
  }
}

describe('createSubscription', () => {
  it('should return confirmation token when authenticated and no active subscription', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)
    prismaMock.yooPayment.findFirst.mockResolvedValue(null)
    prismaMock.yooPayment.deleteMany.mockResolvedValue({ count: 0 })
    createSubscriptionPaymentMock.mockResolvedValue({
      confirmationToken: 'ct_test_token',
      yooPaymentId: 'yoo-123',
      idempotencyKey: 'idem-key',
    })
    prismaMock.yooPayment.create.mockResolvedValue({
      id: 'payment-1',
      userId: 'test-user-id',
      yooPaymentId: 'yoo-123',
      idempotencyKey: 'idem-key',
      amount: 249,
      status: 'pending',
    })

    const result = await executeQuery(CREATE_SUBSCRIPTION, { plan: 'weekly' })

    expect(result.errors).toBeUndefined()
    expect(result.data?.createSubscription).toEqual({
      confirmationToken: 'ct_test_token',
      subscriptionId: '',
      paymentId: 'payment-1',
    })
    expect(prismaMock.yooPayment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'test-user-id',
        yooPaymentId: 'yoo-123',
        idempotencyKey: 'idem-key',
        status: 'pending',
      }),
    })
  })

  it('should throw when not authenticated', async () => {
    const result = await executeAsAnonymous(CREATE_SUBSCRIPTION, { plan: 'weekly' })

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Требуется авторизация')
  })

  it('should throw when user already has active subscription without cancelAtPeriodEnd', async () => {
    getActiveSubscriptionMock.mockResolvedValue(mockSubscription({ cancelAtPeriodEnd: false }))

    const result = await executeQuery(CREATE_SUBSCRIPTION, { plan: 'weekly' })

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('У вас уже есть активная подписка')
    expect(result.errors![0].extensions?.code).toBe('ACTIVE_SUBSCRIPTION')
  })

  it('should allow creating payment when subscription has cancelAtPeriodEnd: true', async () => {
    getActiveSubscriptionMock.mockResolvedValue(mockSubscription({ cancelAtPeriodEnd: true }))
    prismaMock.yooPayment.findFirst.mockResolvedValue(null)
    prismaMock.yooPayment.deleteMany.mockResolvedValue({ count: 0 })
    createSubscriptionPaymentMock.mockResolvedValue({
      confirmationToken: 'ct_switch',
      yooPaymentId: 'yoo-switch',
      idempotencyKey: 'idem-switch',
    })
    prismaMock.yooPayment.create.mockResolvedValue({
      id: 'payment-switch',
      userId: 'test-user-id',
      yooPaymentId: 'yoo-switch',
      idempotencyKey: 'idem-switch',
      amount: 788,
      status: 'pending',
    })

    const result = await executeQuery(CREATE_SUBSCRIPTION, { plan: 'monthly' })

    expect(result.errors).toBeUndefined()
    expect(result.data?.createSubscription).toEqual({
      confirmationToken: 'ct_switch',
      subscriptionId: '',
      paymentId: 'payment-switch',
    })
    expect(createSubscriptionPaymentMock).toHaveBeenCalled()
  })

  it('should throw when rate limit exceeded (3+ payments in 1 minute)', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)
    prismaMock.yooPayment.count.mockResolvedValueOnce(3)
    prismaMock.yooPayment.findFirst.mockResolvedValue({
      id: 'recent-payment',
      createdAt: new Date(Date.now() - 30000),
    })

    const result = await executeQuery(CREATE_SUBSCRIPTION, { plan: 'weekly' })

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toContain('Слишком много попыток')
  })

  it('should delete pending payments before creating new one', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)
    prismaMock.yooPayment.findFirst.mockResolvedValue(null)
    prismaMock.yooPayment.deleteMany.mockResolvedValue({ count: 2 })
    createSubscriptionPaymentMock.mockResolvedValue({
      confirmationToken: 'ct_test',
      yooPaymentId: 'yoo-del',
      idempotencyKey: 'idem-del',
    })
    prismaMock.yooPayment.create.mockResolvedValue({
      id: 'p-del',
      userId: 'test-user-id',
      yooPaymentId: 'yoo-del',
      idempotencyKey: 'idem-del',
      amount: 249,
      status: 'pending',
    })

    await executeQuery(CREATE_SUBSCRIPTION, { plan: 'weekly' })

    expect(prismaMock.yooPayment.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'test-user-id',
        status: 'pending',
        isRecurring: { not: true },
      },
    })
  })

  it('should pass weekly amount (249) to payment service', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)
    prismaMock.yooPayment.findFirst.mockResolvedValue(null)
    prismaMock.yooPayment.deleteMany.mockResolvedValue({ count: 0 })
    createSubscriptionPaymentMock.mockResolvedValue({
      confirmationToken: 'ct_weekly',
      yooPaymentId: 'yoo-w',
      idempotencyKey: 'idem-w',
    })
    prismaMock.yooPayment.create.mockResolvedValue({
      id: 'p-w',
      userId: 'test-user-id',
      yooPaymentId: 'yoo-w',
      idempotencyKey: 'idem-w',
      amount: 249,
      status: 'pending',
    })

    await executeQuery(CREATE_SUBSCRIPTION, { plan: 'weekly' })

    expect(createSubscriptionPaymentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 249,
        plan: 'weekly',
      }),
    )
  })

  it('should pass monthly amount (788) to payment service', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)
    prismaMock.yooPayment.findFirst.mockResolvedValue(null)
    prismaMock.yooPayment.deleteMany.mockResolvedValue({ count: 0 })
    createSubscriptionPaymentMock.mockResolvedValue({
      confirmationToken: 'ct_monthly',
      yooPaymentId: 'yoo-m',
      idempotencyKey: 'idem-m',
    })
    prismaMock.yooPayment.create.mockResolvedValue({
      id: 'p-m',
      userId: 'test-user-id',
      yooPaymentId: 'yoo-m',
      idempotencyKey: 'idem-m',
      amount: 788,
      status: 'pending',
    })

    await executeQuery(CREATE_SUBSCRIPTION, { plan: 'monthly' })

    expect(createSubscriptionPaymentMock).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 788,
        plan: 'monthly',
      }),
    )
  })
})

describe('cancelSubscription', () => {
  it('should cancel subscription and return updated data', async () => {
    const sub = mockSubscription()
    getActiveSubscriptionMock.mockResolvedValue(sub)
    cancelSubscriptionMock.mockResolvedValue({
      ...sub,
      cancelAtPeriodEnd: true,
    })

    const result = await executeQuery(CANCEL_SUBSCRIPTION)

    expect(result.errors).toBeUndefined()
    expect(result.data?.cancelSubscription).toMatchObject({
      id: 'sub-1',
      cancelAtPeriodEnd: true,
    })
  })

  it('should throw when not authenticated', async () => {
    const result = await executeAsAnonymous(CANCEL_SUBSCRIPTION)

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Требуется авторизация')
  })

  it('should throw when user has no active subscription', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)

    const result = await executeQuery(CANCEL_SUBSCRIPTION)

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Активная подписка не найдена')
  })
})

describe('resumeSubscription', () => {
  it('should resume canceled subscription', async () => {
    const sub = mockSubscription({ cancelAtPeriodEnd: true })
    getActiveSubscriptionMock.mockResolvedValue(sub)
    resumeSubscriptionMock.mockResolvedValue({
      ...sub,
      cancelAtPeriodEnd: false,
    })

    const result = await executeQuery(RESUME_SUBSCRIPTION)

    expect(result.errors).toBeUndefined()
    expect(result.data?.resumeSubscription).toMatchObject({
      id: 'sub-1',
      cancelAtPeriodEnd: false,
    })
  })

  it('should throw when not authenticated', async () => {
    const result = await executeAsAnonymous(RESUME_SUBSCRIPTION)

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Требуется авторизация')
  })

  it('should throw when no active subscription', async () => {
    getActiveSubscriptionMock.mockResolvedValue(null)

    const result = await executeQuery(RESUME_SUBSCRIPTION)

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Активная подписка не найдена')
  })

  it('should throw when subscription is not canceled (via service)', async () => {
    const sub = mockSubscription({ cancelAtPeriodEnd: false })
    getActiveSubscriptionMock.mockResolvedValue(sub)
    resumeSubscriptionMock.mockRejectedValue(new Error('Подписка не была отменена'))

    const result = await executeQuery(RESUME_SUBSCRIPTION)

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Подписка не была отменена')
  })
})

describe('removePaymentMethod', () => {
  it('should delete payment method owned by user', async () => {
    prismaMock.paymentMethod.findFirst.mockResolvedValue({
      id: 'pm-1',
      userId: 'test-user-id',
      cardLast4: '4242',
      cardType: 'Visa',
      expiryMonth: '12',
      expiryYear: '2027',
      isDefault: true,
    })
    const deleteMock = vi.fn().mockResolvedValue({})
    const countMock = vi.fn().mockResolvedValue(2)
    prismaMock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        paymentMethod: {
          count: countMock,
          delete: deleteMock,
        },
        subscription: {
          findFirst: vi.fn(),
          update: vi.fn(),
        },
      }
      return cb(tx)
    })

    const result = await executeQuery(REMOVE_PAYMENT_METHOD, { paymentMethodId: 'pm-1' })

    expect(result.errors).toBeUndefined()
    expect(result.data?.removePaymentMethod).toBe(true)
    expect(deleteMock).toHaveBeenCalledWith({ where: { id: 'pm-1' } })
    expect(countMock).toHaveBeenCalledWith({ where: { userId: 'test-user-id' } })
  })

  it('should throw when payment method not found', async () => {
    prismaMock.paymentMethod.findFirst.mockResolvedValue(null)

    const result = await executeQuery(REMOVE_PAYMENT_METHOD, { paymentMethodId: 'pm-unknown' })

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Способ оплаты не найден')
  })

  it('should throw when not authenticated', async () => {
    const result = await executeAsAnonymous(REMOVE_PAYMENT_METHOD, { paymentMethodId: 'pm-1' })

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Требуется авторизация')
  })

  it('should cancel subscription when removing last payment method', async () => {
    prismaMock.paymentMethod.findFirst.mockResolvedValue({
      id: 'pm-1',
      userId: 'test-user-id',
      cardLast4: '4242',
      cardType: 'Visa',
      expiryMonth: '12',
      expiryYear: '2027',
      isDefault: true,
    })

    const subscriptionUpdateMock = vi.fn().mockResolvedValue({})
    prismaMock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        paymentMethod: {
          count: vi.fn().mockResolvedValue(1),
          delete: vi.fn().mockResolvedValue({}),
        },
        subscription: {
          findFirst: vi.fn().mockResolvedValue({ id: 'sub-active' }),
          update: subscriptionUpdateMock,
        },
      }
      return cb(tx)
    })

    const result = await executeQuery(REMOVE_PAYMENT_METHOD, { paymentMethodId: 'pm-1' })

    expect(result.errors).toBeUndefined()
    expect(result.data?.removePaymentMethod).toBe(true)
    expect(subscriptionUpdateMock).toHaveBeenCalledWith({
      where: { id: 'sub-active' },
      data: { cancelAtPeriodEnd: true },
    })
  })

  it('should not cancel subscription when removing non-last payment method', async () => {
    prismaMock.paymentMethod.findFirst.mockResolvedValue({
      id: 'pm-1',
      userId: 'test-user-id',
      cardLast4: '4242',
      cardType: 'Visa',
      expiryMonth: '12',
      expiryYear: '2027',
      isDefault: true,
    })

    const subscriptionFindMock = vi.fn()
    prismaMock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        paymentMethod: {
          count: vi.fn().mockResolvedValue(3),
          delete: vi.fn().mockResolvedValue({}),
        },
        subscription: {
          findFirst: subscriptionFindMock,
          update: vi.fn(),
        },
      }
      return cb(tx)
    })

    const result = await executeQuery(REMOVE_PAYMENT_METHOD, { paymentMethodId: 'pm-1' })

    expect(result.errors).toBeUndefined()
    expect(subscriptionFindMock).not.toHaveBeenCalled()
  })

  it('should not cancel subscription when last method but no active subscription', async () => {
    prismaMock.paymentMethod.findFirst.mockResolvedValue({
      id: 'pm-1',
      userId: 'test-user-id',
      cardLast4: '4242',
      cardType: 'Visa',
      expiryMonth: '12',
      expiryYear: '2027',
      isDefault: true,
    })

    const subscriptionUpdateMock = vi.fn()
    prismaMock.$transaction.mockImplementation(async (cb: (tx: unknown) => Promise<unknown>) => {
      const tx = {
        paymentMethod: {
          count: vi.fn().mockResolvedValue(1),
          delete: vi.fn().mockResolvedValue({}),
        },
        subscription: {
          findFirst: vi.fn().mockResolvedValue(null),
          update: subscriptionUpdateMock,
        },
      }
      return cb(tx)
    })

    const result = await executeQuery(REMOVE_PAYMENT_METHOD, { paymentMethodId: 'pm-1' })

    expect(result.errors).toBeUndefined()
    expect(subscriptionUpdateMock).not.toHaveBeenCalled()
  })
})
