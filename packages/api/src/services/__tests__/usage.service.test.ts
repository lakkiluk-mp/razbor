import { describe, it, expect, vi, beforeEach } from 'vitest'
import { prismaMock } from '../../__mocks__/prisma'
import { logUsage } from '../usage.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('logUsage', () => {
  it('should create usage log with action and userId', async () => {
    prismaMock.usageLog.create.mockResolvedValue({})

    await logUsage(prismaMock, 'user-1', 'calculation')

    expect(prismaMock.usageLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        action: 'calculation',
        metadata: undefined,
      },
    })
  })

  it('should create usage log with metadata when provided', async () => {
    prismaMock.usageLog.create.mockResolvedValue({})
    const metadata = { generationId: 'gen-1', totalPrice: 100000 }

    await logUsage(prismaMock, 'user-1', 'calculation', metadata)

    expect(prismaMock.usageLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        action: 'calculation',
        metadata,
      },
    })
  })

  it('should propagate database errors', async () => {
    prismaMock.usageLog.create.mockRejectedValue(new Error('DB connection failed'))

    await expect(logUsage(prismaMock, 'user-1', 'calculation')).rejects.toThrow('DB connection failed')
  })
})
