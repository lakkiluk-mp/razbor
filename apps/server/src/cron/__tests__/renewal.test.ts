import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

vi.mock('@razbor/api', () => ({
  renewSubscription: vi.fn(),
  expireSubscription: vi.fn(),
  createRecurringPayment: vi.fn(),
  ACTIVE_STATUSES: ['active', 'past_due'],
}))

vi.mock('@razbor/shared', () => ({
  SUBSCRIPTION_PLANS: {
    weekly: { price: 249, label: '1 неделя', days: 7, credits: 5, graceDays: 1 },
    monthly: { price: 788, label: '1 месяц', days: 30, credits: 25, graceDays: 3 },
  },
  SUBSCRIPTION_MAX_RETRIES: 3,
}))

import { renewSubscription, expireSubscription, createRecurringPayment } from '@razbor/api'
import { processRenewals, cleanupStalePendingPayments } from '../renewal'

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
      findFirst: vi.fn().mockResolvedValue(null),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
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
      findFirst: ReturnType<typeof vi.fn>
      updateMany: ReturnType<typeof vi.fn>
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
  it('should query expired active and all past_due subscriptions', async () => {
    prisma.subscription.findMany.mockResolvedValue([])

    await processRenewals(prisma)

    expect(prisma.subscription.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { currentPeriodEnd: { lt: expect.any(Date) }, status: 'active' },
          { status: 'past_due' },
        ],
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

  it('should move to past_due with grace period when charge fails for active subscription', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockRejectedValue(new Error('Payment failed'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await processRenewals(prisma)

    const expectedGraceEnd = new Date('2026-02-16T12:00:00Z')
    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: {
        status: 'past_due',
        retryCount: 1,
        lastRetryAt: expect.any(Date),
        currentPeriodEnd: expectedGraceEnd,
      },
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

  it('should expire subscription when past_due retries exceed max and grace expired', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 3,
        lastRetryAt: new Date('2026-02-14T12:00:00Z'),
        currentPeriodEnd: new Date('2026-02-14T00:00:00Z'),
      },
    ])

    await processRenewals(prisma)

    expect(mockExpireSubscription).toHaveBeenCalledWith(prisma, 'sub-1')
  })

  it('should not expire subscription when max retries but grace period still active', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 3,
        lastRetryAt: new Date('2026-02-14T12:00:00Z'),
        currentPeriodEnd: new Date('2026-02-16T12:00:00Z'),
      },
    ])

    await processRenewals(prisma)

    expect(mockExpireSubscription).not.toHaveBeenCalled()
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
        currentPeriodEnd: new Date('2026-02-14T00:00:00Z'),
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

  it('should set grace period currentPeriodEnd +1 day for weekly when charge returns canceled', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.paymentMethod.findFirst.mockResolvedValue({ yooPaymentMethodId: 'pm-1' })
    mockCreateRecurringPayment.mockResolvedValue({
      yooPaymentId: 'yoo-1',
      status: 'canceled',
      idempotencyKey: 'key-1',
    })

    await processRenewals(prisma)

    const expectedGraceEnd = new Date('2026-02-16T12:00:00Z')
    expect(prisma.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: expect.objectContaining({
        status: 'past_due',
        currentPeriodEnd: expectedGraceEnd,
      }),
    })
  })

  it('should find past_due subscriptions with future currentPeriodEnd but not expire if grace active', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      {
        id: 'sub-1',
        userId: 'user-1',
        cancelAtPeriodEnd: false,
        status: 'past_due',
        plan: 'weekly',
        retryCount: 3,
        lastRetryAt: new Date('2026-02-14T12:00:00Z'),
        currentPeriodEnd: new Date('2026-02-20T12:00:00Z'),
      },
    ])

    await processRenewals(prisma)

    expect(mockExpireSubscription).not.toHaveBeenCalled()
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

  it('should skip charge and not move to grace period when pending recurring payment exists', async () => {
    prisma.subscription.findMany.mockResolvedValue([
      { id: 'sub-1', userId: 'user-1', cancelAtPeriodEnd: false, status: 'active', plan: 'weekly' },
    ])
    prisma.yooPayment.findFirst.mockResolvedValue({ id: 'yp-1', status: 'pending' })
    vi.spyOn(console, 'log').mockImplementation(() => {})

    await processRenewals(prisma)

    expect(mockCreateRecurringPayment).not.toHaveBeenCalled()
    expect(prisma.subscription.update).not.toHaveBeenCalled()
  })

  it('should call cleanupStalePendingPayments before processing renewals', async () => {
    prisma.subscription.findMany.mockResolvedValue([])

    await processRenewals(prisma)

    expect(prisma.yooPayment.updateMany).toHaveBeenCalled()
    expect(prisma.subscription.findMany).toHaveBeenCalled()
  })
})

describe('cleanupStalePendingPayments', () => {
  it('should cancel pending non-recurring payments older than 24 hours', async () => {
    prisma.yooPayment.updateMany.mockResolvedValue({ count: 3 })
    vi.spyOn(console, 'log').mockImplementation(() => {})

    await cleanupStalePendingPayments(prisma)

    expect(prisma.yooPayment.updateMany).toHaveBeenCalledWith({
      where: {
        status: 'pending',
        isRecurring: false,
        createdAt: { lt: new Date('2026-02-14T12:00:00Z') },
      },
      data: { status: 'canceled' },
    })
  })

  it('should log count when payments are canceled', async () => {
    prisma.yooPayment.updateMany.mockResolvedValue({ count: 5 })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await cleanupStalePendingPayments(prisma)

    expect(logSpy).toHaveBeenCalledWith('[Cleanup] Canceled 5 stale pending payment(s)')
  })

  it('should not log when no payments are canceled', async () => {
    prisma.yooPayment.updateMany.mockResolvedValue({ count: 0 })
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await cleanupStalePendingPayments(prisma)

    expect(logSpy).not.toHaveBeenCalledWith(expect.stringContaining('[Cleanup]'))
  })

  it('should not crash on database error', async () => {
    prisma.yooPayment.updateMany.mockRejectedValue(new Error('DB error'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(cleanupStalePendingPayments(prisma)).resolves.toBeUndefined()
  })

  it('should log error on database failure', async () => {
    const dbError = new Error('DB connection lost')
    prisma.yooPayment.updateMany.mockRejectedValue(dbError)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await cleanupStalePendingPayments(prisma)

    expect(errorSpy).toHaveBeenCalledWith('[Cleanup] Failed to cleanup stale pending payments:', dbError)
  })
})
