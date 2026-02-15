import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../__mocks__/prisma'

vi.mock('../yookassa.service', () => ({
  getPaymentInfo: vi.fn(),
}))

vi.mock('../subscription.service', () => ({
  createSubscription: vi.fn(),
  renewSubscription: vi.fn(),
}))

import { getPaymentInfo } from '../yookassa.service'
import { createSubscription, renewSubscription } from '../subscription.service'
import { handlePaymentSucceeded, handlePaymentCanceled } from '../yookassa-webhook.service'

const mockGetPaymentInfo = vi.mocked(getPaymentInfo)
const mockCreateSubscription = vi.mocked(createSubscription)
const mockRenewSubscription = vi.mocked(renewSubscription)

beforeEach(() => {
  vi.clearAllMocks()
})

describe('handlePaymentSucceeded', () => {
  const basePaymentObject = {
    id: 'yoo-pay-1',
    metadata: { type: 'subscription', plan: 'weekly' },
  }

  const baseYooPayment = {
    id: 'db-pay-1',
    yooPaymentId: 'yoo-pay-1',
    userId: 'user-1',
    status: 'pending',
  }

  it('should find yooPayment with retry when not found initially', async () => {
    vi.useFakeTimers()
    let callCount = 0
    prismaMock.yooPayment.findUnique.mockImplementation(async () => {
      callCount++
      if (callCount < 3) return null
      return baseYooPayment
    })
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-1' } as never)

    const promise = handlePaymentSucceeded(prismaMock, basePaymentObject)
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(5000)
    await promise

    expect(prismaMock.yooPayment.findUnique).toHaveBeenCalledTimes(3)
    vi.useRealTimers()
  })

  it('should return early when yooPayment not found after retries', async () => {
    vi.useFakeTimers()
    prismaMock.yooPayment.findUnique.mockResolvedValue(null)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const promise = handlePaymentSucceeded(prismaMock, basePaymentObject)
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(5000)
    await promise

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('YooPayment not found'))
    expect(mockGetPaymentInfo).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
    vi.useRealTimers()
  })

  it('should verify payment status via API', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-1' } as never)

    await handlePaymentSucceeded(prismaMock, basePaymentObject)

    expect(mockGetPaymentInfo).toHaveBeenCalledWith('yoo-pay-1')
  })

  it('should return early when API verification fails', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'pending' } as never)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await handlePaymentSucceeded(prismaMock, basePaymentObject)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('API verification failed'))
    expect(prismaMock.yooPayment.updateMany).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should reject payment when amount is less than plan price', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '1.00' } } as never)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    await handlePaymentSucceeded(prismaMock, basePaymentObject)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Amount mismatch'))
    expect(prismaMock.yooPayment.updateMany).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should skip when payment already processed (idempotency)', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 0 })

    await handlePaymentSucceeded(prismaMock, basePaymentObject)

    expect(mockCreateSubscription).not.toHaveBeenCalled()
  })

  it('should save payment method when saved is true', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.paymentMethod.findUnique.mockResolvedValue(null)
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-1' } as never)

    const txMock = {
      paymentMethod: {
        updateMany: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const paymentObject = {
      ...basePaymentObject,
      payment_method: {
        id: 'pm-1',
        saved: true,
        card: { last4: '4242', card_type: 'Visa', expiry_month: 12, expiry_year: 2027 },
      },
    }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(txMock.paymentMethod.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        yooPaymentMethodId: 'pm-1',
        cardLast4: '4242',
        cardType: 'Visa',
        isDefault: true,
      }),
    })
  })

  it('should not save payment method when it already exists', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.paymentMethod.findUnique.mockResolvedValue({ id: 'existing-pm' })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-1' } as never)

    const paymentObject = {
      ...basePaymentObject,
      payment_method: {
        id: 'pm-1',
        saved: true,
        card: { last4: '4242', card_type: 'Visa' },
      },
    }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('should reset existing default payment methods before creating new one', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.paymentMethod.findUnique.mockResolvedValue(null)
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-1' } as never)

    const txMock = {
      paymentMethod: {
        updateMany: vi.fn().mockResolvedValue({}),
        create: vi.fn().mockResolvedValue({}),
      },
    }
    prismaMock.$transaction.mockImplementation((cb: (tx: typeof txMock) => Promise<unknown>) => cb(txMock))

    const paymentObject = {
      ...basePaymentObject,
      payment_method: {
        id: 'pm-1',
        saved: true,
        card: { last4: '4242', card_type: 'Visa' },
      },
    }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(txMock.paymentMethod.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { isDefault: false },
    })
  })

  it('should create subscription for subscription type payment', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-1' } as never)

    await handlePaymentSucceeded(prismaMock, basePaymentObject)

    expect(mockCreateSubscription).toHaveBeenCalledWith(prismaMock, 'user-1', 'weekly')
  })

  it('should link subscription to yooPayment after creation', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-new' } as never)

    await handlePaymentSucceeded(prismaMock, basePaymentObject)

    expect(prismaMock.yooPayment.update).toHaveBeenCalledWith({
      where: { id: 'db-pay-1' },
      data: { subscriptionId: 'sub-new' },
    })
  })

  it('should log error for unknown plan', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const paymentObject = {
      id: 'yoo-pay-1',
      metadata: { type: 'subscription', plan: 'unknown_plan' },
    }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Unknown plan'))
    expect(mockCreateSubscription).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should renew subscription for recurring type payment', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockRenewSubscription.mockResolvedValue(undefined)

    const paymentObject = {
      id: 'yoo-pay-1',
      metadata: { type: 'recurring', subscriptionId: 'sub-1' },
    }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(mockRenewSubscription).toHaveBeenCalledWith(prismaMock, 'sub-1')
  })

  it('should link subscription to yooPayment for recurring payment', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockRenewSubscription.mockResolvedValue(undefined)

    const paymentObject = {
      id: 'yoo-pay-1',
      metadata: { type: 'recurring', subscriptionId: 'sub-1' },
    }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(prismaMock.yooPayment.update).toHaveBeenCalledWith({
      where: { id: 'db-pay-1' },
      data: { subscriptionId: 'sub-1' },
    })
  })

  it('should log error when recurring payment missing subscriptionId', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const paymentObject = {
      id: 'yoo-pay-1',
      metadata: { type: 'recurring' },
    }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Missing subscriptionId'))
    expect(mockRenewSubscription).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  it('should return early when metadata is missing', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })

    const paymentObject = { id: 'yoo-pay-1' }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(mockCreateSubscription).not.toHaveBeenCalled()
    expect(mockRenewSubscription).not.toHaveBeenCalled()
  })

  it('should not save payment method when saved is not true', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-1' } as never)

    const paymentObject = {
      ...basePaymentObject,
      payment_method: { id: 'pm-1', saved: false },
    }

    await handlePaymentSucceeded(prismaMock, paymentObject)

    expect(prismaMock.paymentMethod.findUnique).not.toHaveBeenCalled()
  })

  it('should update yooPayment status to succeeded', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue(baseYooPayment)
    mockGetPaymentInfo.mockResolvedValue({ status: 'succeeded', amount: { value: '249.00' } } as never)
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })
    prismaMock.yooPayment.update.mockResolvedValue({})
    mockCreateSubscription.mockResolvedValue({ id: 'sub-1' } as never)

    await handlePaymentSucceeded(prismaMock, basePaymentObject)

    expect(prismaMock.yooPayment.updateMany).toHaveBeenCalledWith({
      where: { id: 'db-pay-1', status: 'pending' },
      data: { status: 'succeeded' },
    })
  })
})

describe('handlePaymentCanceled', () => {
  it('should update yooPayment status to canceled', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue({
      id: 'db-pay-1',
      yooPaymentId: 'yoo-pay-1',
      status: 'pending',
    })
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 1 })

    await handlePaymentCanceled(prismaMock, { id: 'yoo-pay-1' })

    expect(prismaMock.yooPayment.updateMany).toHaveBeenCalledWith({
      where: { id: 'db-pay-1', status: 'pending' },
      data: { status: 'canceled' },
    })
  })

  it('should return early when yooPayment not found', async () => {
    vi.useFakeTimers()
    prismaMock.yooPayment.findUnique.mockResolvedValue(null)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const promise = handlePaymentCanceled(prismaMock, { id: 'yoo-pay-fake' })
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(5000)
    await vi.advanceTimersByTimeAsync(5000)
    await promise

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('YooPayment not found for cancel'))
    expect(prismaMock.yooPayment.updateMany).not.toHaveBeenCalled()
    consoleSpy.mockRestore()
    vi.useRealTimers()
  })

  it('should skip when payment already processed', async () => {
    prismaMock.yooPayment.findUnique.mockResolvedValue({
      id: 'db-pay-1',
      yooPaymentId: 'yoo-pay-1',
    })
    prismaMock.yooPayment.updateMany.mockResolvedValue({ count: 0 })
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

    await handlePaymentCanceled(prismaMock, { id: 'yoo-pay-1' })

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('already processed'))
    consoleSpy.mockRestore()
  })
})
