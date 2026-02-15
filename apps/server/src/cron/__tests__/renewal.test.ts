import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@razbor/api', () => ({
  renewSubscription: vi.fn(),
  expireSubscription: vi.fn(),
  createRecurringPayment: vi.fn(),
  ACTIVE_STATUSES: ['active', 'past_due'],
}))

vi.mock('@razbor/shared', () => ({
  SUBSCRIPTION_PLANS: {
    weekly: { price: 249, label: '1 неделя', days: 7, credits: 5 },
    monthly: { price: 788, label: '1 месяц', days: 30, credits: 25 },
  },
  SUBSCRIPTION_MAX_RETRIES: 3,
}))

import { renewSubscription, expireSubscription, createRecurringPayment } from '@razbor/api'
import { processRenewals } from '../renewal'

const mockRenewSubscription = vi.mocked(renewSubscription)
const mockExpireSubscription = vi.mocked(expireSubscription)
const mockCreateRecurringPayment = vi.mocked(createRecurringPayment)

function createMockPrisma() {
  return {
    subscription: {
      findMany: vi.fn().mockResolvedValue([]),
      update: vi.fn().mockResolvedValue({}),
    },
    paymentMethod: {
      findFirst: vi.fn(),
    },
    yooPayment: {
      create: vi.fn().mockResolvedValue({}),
    },
    user: {
      update: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockResolvedValue([]),
  } as unknown as import('@razbor/db').PrismaClient & {
    subscription: {
      findMany: ReturnType<typeof vi.fn>
      update: ReturnType<typeof vi.fn>
    }
    paymentMethod: {
      findFirst: ReturnType<typeof vi.fn>
    }
    yooPayment: {
      create: ReturnType<typeof vi.fn>
    }
    user: {
      update: ReturnType<typeof vi.fn>
    }
    $transaction: ReturnType<typeof vi.fn>
  }
}

let prisma: ReturnType<typeof createMockPrisma>

beforeEach(() => {
  vi.clearAllMocks()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-02-15T12:00:00Z'))
  prisma = createMockPrisma()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('processRenewals', () => {
  it('should query expired subscriptions with active statuses', async () => {
    prisma.subscription.findMany.mockResolvedValue([])

    await processRenewals(prisma)

    expect(prisma.subscription.findMany).toHaveBeenCalledWith({
      where: {
        currentPeriodEnd: { lt: expect.any(Date) },
        status: { in: ['active', 'past_due'] },
      },
    })
  })

  it('should cancel subscription when cancelAtPeriodEnd is true', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: true, status: 'active', plan: 'weekly' },
    ])

    await processRenewals(prisma)

    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('should set isPremium to false when canceling at period end', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: true, status: 'active', plan: 'weekly' },
    ])

    await processRenewals(prisma)

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPremium: false },
    })
  })

  it('should attempt charge when active subscription expires', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({
      yooPaymentMethodId: 'pm-1',
    })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'succeeded',
      idempotencyKey: 'key-1',
    })

    await processRenewals(prisma)

    expect(mockCreateRecurringPayment).toHaveBeenCalledWith({
      userId: 'user-1',
      subscriptionId: 'sub-1',
      paymentMethodId: 'pm-1',
      amount: 249,
      description: expect.stringContaining('Автопродление'),
    })
  })

  it('should renew subscription when charge succeeds', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'succeeded',
      idempotencyKey: 'key-1',
    })

    await processRenewals(prisma)

    expect(mockRenewSubscription).toHaveBeenCalledWith(prisma, 'sub-1')
  })

  it('should move to past_due when charge fails for active subscription', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockRejectedValue(new Error('Payment failed'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await processRenewals(prisma)

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { status: 'past_due', retryCount: 1, lastRetryAt: expect.any(Date) },
    })
  })

  it('should expire subscription when no payment method exists', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue(null)
    vi.spyOn(console, 'log').mockImplementation(() => {})

    await processRenewals(prisma)

    expect(mockExpireSubscription).toHaveBeenCalledWith(prisma, 'sub-1')
  })

  it('should expire subscription when past_due retries exceed max', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 3,
        lastRetryAt: new Date('2026-02-14T12:00:00Z'),
      },
    ])

    await processRenewals(prisma)

    expect(mockExpireSubscription).toHaveBeenCalledWith(prisma, 'sub-1')
  })

  it('should retry charge for past_due subscription when delay has passed', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 1,
        lastRetryAt: new Date('2026-02-14T00:00:00Z'),
      },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'succeeded',
      idempotencyKey: 'key-1',
    })

    await processRenewals(prisma)

    expect(mockCreateRecurringPayment).toHaveBeenCalled()
    expect(mockRenewSubscription).toHaveBeenCalledWith(prisma, 'sub-1')
  })

  it('should not retry charge when delay has not passed', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 2,
        lastRetryAt: new Date('2026-02-14T12:00:00Z'),
      },
    ])

    await processRenewals(prisma)

    expect(mockCreateRecurringPayment).not.toHaveBeenCalled()
  })

  it('should increment retryCount when past_due retry charge fails', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 1,
        lastRetryAt: new Date('2026-02-14T00:00:00Z'),
      },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'canceled',
      idempotencyKey: 'key-1',
    })

    await processRenewals(prisma)

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { retryCount: { increment: 1 }, lastRetryAt: expect.any(Date) },
    })
  })

  it('should increment retryCount when past_due retry throws error', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 1,
        lastRetryAt: new Date('2026-02-14T00:00:00Z'),
      },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockRejectedValue(new Error('Network error'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await processRenewals(prisma)

    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { retryCount: { increment: 1 }, lastRetryAt: expect.any(Date) },
    })
  })

  it('should use backoff delay based on retryCount', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 2,
        lastRetryAt: new Date('2026-02-13T13:00:00Z'),
      },
    ])

    await processRenewals(prisma)

    expect(mockCreateRecurringPayment).not.toHaveBeenCalled()
  })

  it('should retry when retryCount is 1 and >= 1 day has passed', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 1,
        lastRetryAt: new Date('2026-02-14T10:00:00Z'),
      },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'succeeded',
      idempotencyKey: 'key-1',
    })

    await processRenewals(prisma)

    expect(mockCreateRecurringPayment).toHaveBeenCalled()
  })

  it('should process multiple subscriptions independently', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: true, status: 'active', plan: 'weekly' },
      {
        id: 'sub-2',
        userId: 'user-2',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'monthly',
        retryCount: 3,
        lastRetryAt: new Date('2026-02-14T12:00:00Z'),
      },
    ])

    await processRenewals(prisma)

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(mockExpireSubscription).toHaveBeenCalledWith(prisma, 'sub-2')
  })

  it('should continue processing other subscriptions when one fails', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: true, status: 'active', plan: 'weekly' },
      { id: 'sub-2', userId: 'user-2', cancelAtPeriodEnd: true, status: 'active', plan: 'monthly' },
    ])
    prisma.$transaction
      .mockRejectedValueOnce(new Error('DB error'))
      .mockResolvedValueOnce([])
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await processRenewals(prisma)

    expect(prisma.$transaction).toHaveBeenCalledTimes(2)
  })

  it('should use Infinity for daysSinceLastRetry when lastRetryAt is null', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 1,
        lastRetryAt: null,
      },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'succeeded',
      idempotencyKey: 'key-1',
    })

    await processRenewals(prisma)

    expect(mockCreateRecurringPayment).toHaveBeenCalled()
  })

  it('should create yooPayment record for recurring charge', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'succeeded',
      idempotencyKey: 'key-1',
    })

    await processRenewals(prisma)

    expect(prisma.yooPayment.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        subscriptionId: 'sub-1',
        yooPaymentId: 'yoo-1',
        idempotencyKey: 'key-1',
        amount: 249,
        status: 'succeeded',
        isRecurring: true,
      },
    })
  })

  it('should set yooPayment status to canceled when charge result is canceled', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'canceled',
      idempotencyKey: 'key-1',
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await processRenewals(prisma)

    expect(prisma.yooPayment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'canceled' }),
    })
  })

  it('should set yooPayment status to pending for unknown statuses', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'pending',
      idempotencyKey: 'key-1',
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await processRenewals(prisma)

    expect(prisma.yooPayment.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ status: 'pending' }),
    })
  })
})
