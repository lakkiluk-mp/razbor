import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MONITOR_SUBSCRIPTIONS_CHANNEL } from '@razbor/shared'
import { prismaMock } from '../../__mocks__/prisma'
import {
  getActiveSubscription,
  createSubscription,
  switchSubscription,
  cancelSubscription,
  resumeSubscription,
  renewSubscription,
  expireSubscription,
} from '../subscription.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getActiveSubscription', () => {
  it('should return active subscription when exists', async () => {
    const sub = { id: 'sub-1', status: 'active', userId: 'user-1' }
    prismaMock.subscription.findFirst.mockResolvedValue(sub)

    const result = await getActiveSubscription(prismaMock, 'user-1')

    expect(result).toEqual(sub)
    expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', status: { in: ['active', 'past_due'] } },
      orderBy: { createdAt: 'desc' },
    })
  })

  it('should return null when no active subscription exists', async () => {
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await getActiveSubscription(prismaMock, 'user-1')

    expect(result).toBeNull()
  })

  it('should return past_due subscription', async () => {
    const sub = { id: 'sub-1', status: 'past_due', userId: 'user-1' }
    prismaMock.subscription.findFirst.mockResolvedValue(sub)

    const result = await getActiveSubscription(prismaMock, 'user-1')

    expect(result).toEqual(sub)
  })

  it('should return latest subscription when multiple exist', async () => {
    const sub = { id: 'sub-latest', status: 'active', userId: 'user-1' }
    prismaMock.subscription.findFirst.mockResolvedValue(sub)

    const result = await getActiveSubscription(prismaMock, 'user-1')

    expect(result).toEqual(sub)
    expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } }),
    )
  })
})

describe('createSubscription', () => {
  it('should create weekly subscription with correct credits and period', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'sub-new', plan: 'weekly', credits: 5 }),
      },
      user: { update: vi.fn().mockResolvedValue({}) },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await createSubscription(prismaMock, 'user-1', 'weekly')

    expect(result).toEqual({ id: 'sub-new', plan: 'weekly', credits: 5 })
    expect(txMock.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        plan: 'weekly',
        status: 'active',
        credits: 5,
        creditsTotal: 5,
      }),
    })
  })

  it('should create monthly subscription with correct credits and period', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'sub-new', plan: 'monthly', credits: 25 }),
      },
      user: { update: vi.fn().mockResolvedValue({}) },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await createSubscription(prismaMock, 'user-1', 'monthly')

    expect(result).toEqual({ id: 'sub-new', plan: 'monthly', credits: 25 })
    expect(txMock.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        credits: 25,
        creditsTotal: 25,
      }),
    })
  })

  it('should set isPremium to true on user', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'sub-new' }),
      },
      user: { update: vi.fn().mockResolvedValue({}) },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    await createSubscription(prismaMock, 'user-1', 'weekly')

    expect(txMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPremium: true },
    })
  })

  it('should throw when user already has active subscription', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue({ id: 'existing-sub', status: 'active' }),
        create: vi.fn(),
      },
      user: { update: vi.fn() },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    await expect(createSubscription(prismaMock, 'user-1', 'weekly')).rejects.toThrow(
      'У вас уже есть активная подписка',
    )
    expect(txMock.subscription.create).not.toHaveBeenCalled()
  })

  it('should set currentPeriodEnd 7 days ahead for weekly plan', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => {
          const diff = data.currentPeriodEnd.getTime() - data.currentPeriodStart.getTime()
          const days = diff / (24 * 60 * 60 * 1000)
          expect(days).toBe(7)
          return { id: 'sub-new' }
        }),
      },
      user: { update: vi.fn().mockResolvedValue({}) },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    await createSubscription(prismaMock, 'user-1', 'weekly')
  })

  it('should set currentPeriodEnd 30 days ahead for monthly plan', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockImplementation(({ data }) => {
          const diff = data.currentPeriodEnd.getTime() - data.currentPeriodStart.getTime()
          const days = diff / (24 * 60 * 60 * 1000)
          expect(days).toBe(30)
          return { id: 'sub-new' }
        }),
      },
      user: { update: vi.fn().mockResolvedValue({}) },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    await createSubscription(prismaMock, 'user-1', 'monthly')
  })
})

describe('switchSubscription', () => {
  it('should create subscription when no existing subscription', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({ id: 'sub-new', plan: 'weekly', credits: 5 }),
        update: vi.fn(),
      },
      user: { update: vi.fn().mockResolvedValue({}) },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await switchSubscription(prismaMock, 'user-1', 'weekly')

    expect(result).toEqual({ id: 'sub-new', plan: 'weekly', credits: 5 })
    expect(txMock.subscription.update).not.toHaveBeenCalled()
    expect(txMock.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        plan: 'weekly',
        status: 'active',
        credits: 5,
        creditsTotal: 5,
      }),
    })
  })

  it('should expire old subscription and create new one when cancelAtPeriodEnd is true', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'old-sub',
          status: 'active',
          cancelAtPeriodEnd: true,
        }),
        create: vi.fn().mockResolvedValue({ id: 'sub-new', plan: 'monthly', credits: 25 }),
        update: vi.fn().mockResolvedValue({}),
      },
      user: { update: vi.fn().mockResolvedValue({}) },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await switchSubscription(prismaMock, 'user-1', 'monthly')

    expect(result).toEqual({ id: 'sub-new', plan: 'monthly', credits: 25 })
    expect(txMock.subscription.update).toHaveBeenCalledWith({
      where: { id: 'old-sub' },
      data: { status: 'expired', credits: 0 },
    })
    expect(txMock.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        plan: 'monthly',
        status: 'active',
        credits: 25,
      }),
    })
  })

  it('should keep isPremium true during switch', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'old-sub',
          status: 'active',
          cancelAtPeriodEnd: true,
        }),
        create: vi.fn().mockResolvedValue({ id: 'sub-new' }),
        update: vi.fn().mockResolvedValue({}),
      },
      user: { update: vi.fn().mockResolvedValue({}) },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    await switchSubscription(prismaMock, 'user-1', 'weekly')

    expect(txMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPremium: true },
    })
  })

  it('should throw when active subscription without cancelAtPeriodEnd', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue({
          id: 'existing-sub',
          status: 'active',
          cancelAtPeriodEnd: false,
        }),
        create: vi.fn(),
        update: vi.fn(),
      },
      user: { update: vi.fn() },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    await expect(switchSubscription(prismaMock, 'user-1', 'weekly')).rejects.toThrow(
      'У вас уже есть активная подписка',
    )
    expect(txMock.subscription.create).not.toHaveBeenCalled()
  })
})

describe('cancelSubscription', () => {
  it('should set cancelAtPeriodEnd to true', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({ id: 'sub-1', userId: 'user-1' })
    prismaMock.subscription.update.mockResolvedValue({ id: 'sub-1', cancelAtPeriodEnd: true })

    const result = await cancelSubscription(prismaMock, 'sub-1', 'user-1')

    expect(result).toEqual({ id: 'sub-1', cancelAtPeriodEnd: true })
    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { cancelAtPeriodEnd: true },
    })
  })

  it('should throw when subscription not found', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null)

    await expect(cancelSubscription(prismaMock, 'sub-fake', 'user-1')).rejects.toThrow('Подписка не найдена')
  })

  it('should throw when subscription belongs to different user', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({ id: 'sub-1', userId: 'other-user' })

    await expect(cancelSubscription(prismaMock, 'sub-1', 'user-1')).rejects.toThrow('Подписка не найдена')
  })
})

describe('resumeSubscription', () => {
  it('should set cancelAtPeriodEnd to false', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      cancelAtPeriodEnd: true,
    })
    prismaMock.subscription.update.mockResolvedValue({ id: 'sub-1', cancelAtPeriodEnd: false })

    const result = await resumeSubscription(prismaMock, 'sub-1', 'user-1')

    expect(result).toEqual({ id: 'sub-1', cancelAtPeriodEnd: false })
    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { cancelAtPeriodEnd: false },
    })
  })

  it('should throw when subscription not found', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null)

    await expect(resumeSubscription(prismaMock, 'sub-fake', 'user-1')).rejects.toThrow('Подписка не найдена')
  })

  it('should throw when subscription belongs to different user', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({ id: 'sub-1', userId: 'other-user' })

    await expect(resumeSubscription(prismaMock, 'sub-1', 'user-1')).rejects.toThrow('Подписка не найдена')
  })

  it('should throw when subscription is not marked for cancellation', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      userId: 'user-1',
      cancelAtPeriodEnd: false,
    })

    await expect(resumeSubscription(prismaMock, 'sub-1', 'user-1')).rejects.toThrow(
      'Подписка не была отменена',
    )
  })
})

describe('renewSubscription', () => {
  it('should reset credits and period for active subscription', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'active',
      plan: 'weekly',
      creditsTotal: 5,
    })
    prismaMock.subscription.update.mockResolvedValue({})

    await renewSubscription(prismaMock, 'sub-1')

    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: expect.objectContaining({
        credits: 5,
        retryCount: 0,
        lastRetryAt: null,
        status: 'active',
        cancelAtPeriodEnd: false,
      }),
    })
  })

  it('should renew past_due subscription', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'past_due',
      plan: 'monthly',
      creditsTotal: 25,
    })
    prismaMock.subscription.update.mockResolvedValue({})

    await renewSubscription(prismaMock, 'sub-1')

    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: expect.objectContaining({
        credits: 25,
        status: 'active',
      }),
    })
  })

  it('should throw when subscription not found', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null)

    await expect(renewSubscription(prismaMock, 'sub-fake')).rejects.toThrow('Подписка не найдена')
  })

  it('should throw when subscription is canceled', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'canceled',
      plan: 'weekly',
    })

    await expect(renewSubscription(prismaMock, 'sub-1')).rejects.toThrow(
      'Невозможно продлить подписку в статусе canceled',
    )
  })

  it('should throw when subscription is expired', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'expired',
      plan: 'weekly',
    })

    await expect(renewSubscription(prismaMock, 'sub-1')).rejects.toThrow(
      'Невозможно продлить подписку в статусе expired',
    )
  })

  it('should set correct period end for weekly plan', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'active',
      plan: 'weekly',
      creditsTotal: 5,
    })
    prismaMock.subscription.update.mockResolvedValue({})

    await renewSubscription(prismaMock, 'sub-1')

    const callData = prismaMock.subscription.update.mock.calls[0][0].data
    const diff = callData.currentPeriodEnd.getTime() - callData.currentPeriodStart.getTime()
    expect(diff / (24 * 60 * 60 * 1000)).toBe(7)
  })

  it('should set correct period end for monthly plan', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: 'active',
      plan: 'monthly',
      creditsTotal: 25,
    })
    prismaMock.subscription.update.mockResolvedValue({})

    await renewSubscription(prismaMock, 'sub-1')

    const callData = prismaMock.subscription.update.mock.calls[0][0].data
    const diff = callData.currentPeriodEnd.getTime() - callData.currentPeriodStart.getTime()
    expect(diff / (24 * 60 * 60 * 1000)).toBe(30)
  })
})

describe('expireSubscription', () => {
  it('should set status to expired and credits to 0', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({ userId: 'user-1' })
    prismaMock.$transaction.mockResolvedValue([])
    prismaMock.monitorSubscription.findMany.mockResolvedValue([])

    await expireSubscription(prismaMock, 'sub-1')

    expect(prismaMock.$transaction).toHaveBeenCalledWith([
      prismaMock.subscription.update({
        where: { id: 'sub-1' },
        data: { status: 'expired', credits: 0 },
      }),
      prismaMock.user.update({
        where: { id: 'user-1' },
        data: { isPremium: false },
      }),
    ])
  })

  it('should set isPremium to false on user', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({ userId: 'user-1' })
    prismaMock.$transaction.mockResolvedValue([])
    prismaMock.monitorSubscription.findMany.mockResolvedValue([])

    await expireSubscription(prismaMock, 'sub-1')

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPremium: false },
    })
  })

  it('should throw when subscription not found', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue(null)

    await expect(expireSubscription(prismaMock, 'sub-fake')).rejects.toThrow('Подписка не найдена')
  })

  it('should deactivate monitor subscriptions exceeding trial limit', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({ userId: 'user-1' })
    prismaMock.$transaction.mockResolvedValue([])
    prismaMock.monitorSubscription.findMany.mockResolvedValue([
      { id: 'mon-1', userId: 'user-1', isActive: true, createdAt: new Date('2026-01-01') },
      { id: 'mon-2', userId: 'user-1', isActive: true, createdAt: new Date('2026-01-02') },
      { id: 'mon-3', userId: 'user-1', isActive: true, createdAt: new Date('2026-01-03') },
    ])
    prismaMock.monitorSubscription.updateMany.mockResolvedValue({ count: 2 })

    await expireSubscription(prismaMock, 'sub-1')

    expect(prismaMock.monitorSubscription.updateMany).toHaveBeenCalledWith({
      where: { id: { in: ['mon-2', 'mon-3'] } },
      data: { isActive: false },
    })
  })

  it('should not deactivate monitor subscriptions within trial limit', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({ userId: 'user-1' })
    prismaMock.$transaction.mockResolvedValue([])
    prismaMock.monitorSubscription.findMany.mockResolvedValue([
      { id: 'mon-1', userId: 'user-1', isActive: true, createdAt: new Date('2026-01-01') },
    ])

    await expireSubscription(prismaMock, 'sub-1')

    expect(prismaMock.monitorSubscription.updateMany).not.toHaveBeenCalled()
  })

  it('should publish Redis events for deactivated monitor subscriptions', async () => {
    prismaMock.subscription.findUnique.mockResolvedValue({ userId: 'user-1' })
    prismaMock.$transaction.mockResolvedValue([])
    prismaMock.monitorSubscription.findMany.mockResolvedValue([
      { id: 'mon-1', userId: 'user-1', isActive: true, createdAt: new Date('2026-01-01') },
      { id: 'mon-2', userId: 'user-1', isActive: true, createdAt: new Date('2026-01-02') },
    ])
    prismaMock.monitorSubscription.updateMany.mockResolvedValue({ count: 1 })

    const redisMock = { publish: vi.fn().mockResolvedValue(1) } as unknown as import('ioredis').default

    await expireSubscription(prismaMock, 'sub-1', redisMock)

    expect(redisMock.publish).toHaveBeenCalledWith(
      MONITOR_SUBSCRIPTIONS_CHANNEL,
      JSON.stringify({ action: 'deactivated', subscriptionId: 'mon-2' }),
    )
  })
})
