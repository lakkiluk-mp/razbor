import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../__mocks__/prisma'
import {
  getRemainingCredits,
  useCredit,
  refundCredit,
  hasCredits,
  ACTIVE_STATUSES,
} from '../credits.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ACTIVE_STATUSES', () => {
  it('should contain active and past_due', () => {
    expect(ACTIVE_STATUSES).toEqual(['active', 'past_due'])
  })
})

describe('getRemainingCredits', () => {
  it('should return trial and subscription credits when user has both', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 3 })
    prismaMock.subscription.findFirst.mockResolvedValue({ id: 'sub-1', credits: 10 })

    const result = await getRemainingCredits(prismaMock, 'user-1')

    expect(result).toEqual({ trial: 3, subscription: 10, total: 13 })
  })

  it('should return 0 trial and subscription credits when user has 0 trial and active sub', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 0 })
    prismaMock.subscription.findFirst.mockResolvedValue({ id: 'sub-1', credits: 5 })

    const result = await getRemainingCredits(prismaMock, 'user-1')

    expect(result).toEqual({ trial: 0, subscription: 5, total: 5 })
  })

  it('should return trial credits when user has trial but no subscription', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 3 })
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await getRemainingCredits(prismaMock, 'user-1')

    expect(result).toEqual({ trial: 3, subscription: 0, total: 3 })
  })

  it('should return zero total when user has 0 trial and no subscription', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 0 })
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await getRemainingCredits(prismaMock, 'user-1')

    expect(result).toEqual({ trial: 0, subscription: 0, total: 0 })
  })

  it('should return zero total when user is not found', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await getRemainingCredits(prismaMock, 'nonexistent')

    expect(result).toEqual({ trial: 0, subscription: 0, total: 0 })
  })

  it('should include past_due subscription credits', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 0 })
    prismaMock.subscription.findFirst.mockResolvedValue({ id: 'sub-1', credits: 7 })

    const result = await getRemainingCredits(prismaMock, 'user-1')

    expect(result).toEqual({ trial: 0, subscription: 7, total: 7 })
    expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['active', 'past_due'] },
        }),
      }),
    )
  })

  it('should not include canceled subscription credits', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 2 })
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await getRemainingCredits(prismaMock, 'user-1')

    expect(result).toEqual({ trial: 2, subscription: 0, total: 2 })
  })

  it('should not include expired subscription credits', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 1 })
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await getRemainingCredits(prismaMock, 'user-1')

    expect(result).toEqual({ trial: 1, subscription: 0, total: 1 })
  })

  it('should return latest subscription credits when multiple active subs exist', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 0 })
    prismaMock.subscription.findFirst.mockResolvedValue({ id: 'sub-latest', credits: 15 })

    const result = await getRemainingCredits(prismaMock, 'user-1')

    expect(result).toEqual({ trial: 0, subscription: 15, total: 15 })
    expect(prismaMock.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { createdAt: 'desc' },
      }),
    )
  })
})

describe('useCredit', () => {
  it('should decrement subscription credit when sub has credits > 0', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue({ id: 'sub-1' }),
        update: vi.fn().mockResolvedValue({}),
      },
      user: {
        updateMany: vi.fn(),
      },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await useCredit(prismaMock, 'user-1')

    expect(result).toEqual({ type: 'subscription', subscriptionId: 'sub-1' })
    expect(txMock.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { credits: { decrement: 1 } },
    })
  })

  it('should decrement trial credit when sub has 0 credits and trial > 0', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      user: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await useCredit(prismaMock, 'user-1')

    expect(result).toEqual({ type: 'trial' })
    expect(txMock.user.updateMany).toHaveBeenCalledWith({
      where: { id: 'user-1', trialCredits: { gt: 0 } },
      data: { trialCredits: { decrement: 1 } },
    })
  })

  it('should use past_due subscription credits', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue({ id: 'sub-pastdue' }),
        update: vi.fn().mockResolvedValue({}),
      },
      user: { updateMany: vi.fn() },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await useCredit(prismaMock, 'user-1')

    expect(result).toEqual({ type: 'subscription', subscriptionId: 'sub-pastdue' })
    expect(txMock.subscription.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: { in: ['active', 'past_due'] },
          credits: { gt: 0 },
        }),
      }),
    )
  })

  it('should use trial credits when no subscription exists and trial > 0', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      user: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
      },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await useCredit(prismaMock, 'user-1')

    expect(result).toEqual({ type: 'trial' })
  })

  it('should throw when both subscription and trial credits are 0', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: vi.fn(),
      },
      user: {
        updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    await expect(useCredit(prismaMock, 'user-1')).rejects.toThrow('Лимит расчётов исчерпан')
  })

  it('should prefer subscription credits over trial credits', async () => {
    const txMock = {
      subscription: {
        findFirst: vi.fn().mockResolvedValue({ id: 'sub-1' }),
        update: vi.fn().mockResolvedValue({}),
      },
      user: {
        updateMany: vi.fn(),
      },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const result = await useCredit(prismaMock, 'user-1')

    expect(result.type).toBe('subscription')
    expect(txMock.user.updateMany).not.toHaveBeenCalled()
  })

  it('should handle race condition via transaction', async () => {
    prismaMock.$transaction.mockImplementation((cb: (tx: unknown) => Promise<unknown>) =>
      cb({
        subscription: {
          findFirst: vi.fn().mockResolvedValue(null),
          update: vi.fn(),
        },
        user: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
        },
      }),
    )

    await expect(useCredit(prismaMock, 'user-1')).rejects.toThrow('Лимит расчётов исчерпан')
    expect(prismaMock.$transaction).toHaveBeenCalledWith(expect.any(Function))
  })
})

describe('refundCredit', () => {
  it('should increment subscription credit when source is subscription', async () => {
    prismaMock.subscription.update.mockResolvedValue({})

    await refundCredit(prismaMock, 'user-1', { type: 'subscription', subscriptionId: 'sub-1' })

    expect(prismaMock.subscription.update).toHaveBeenCalledWith({
      where: { id: 'sub-1' },
      data: { credits: { increment: 1 } },
    })
  })

  it('should increment trial credit when source is trial', async () => {
    prismaMock.user.update.mockResolvedValue({})

    await refundCredit(prismaMock, 'user-1', { type: 'trial' })

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { trialCredits: { increment: 1 } },
    })
  })
})

describe('hasCredits', () => {
  it('should return true when total credits > 0', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 1 })
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await hasCredits(prismaMock, 'user-1')

    expect(result).toBe(true)
  })

  it('should return false when total credits = 0', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ trialCredits: 0 })
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await hasCredits(prismaMock, 'user-1')

    expect(result).toBe(false)
  })
})
