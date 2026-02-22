import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeQuery, executeAsAnonymous } from '../../../test-utils/execute-query'
import { prismaMock } from '../../../__mocks__/prisma'

vi.mock('../../../services/credits.service', () => ({
  useCredit: vi.fn(),
  refundCredit: vi.fn(),
  ACTIVE_STATUSES: ['active', 'past_due'],
}))

vi.mock('../../../services/estimation.service', () => ({
  estimationService: {
    calculate: vi.fn(),
  },
}))

vi.mock('../../../services/usage.service', () => ({
  logUsage: vi.fn().mockResolvedValue(undefined),
}))

import { useCredit, refundCredit } from '../../../services/credits.service'
import { estimationService } from '../../../services/estimation.service'

const useCreditMock = vi.mocked(useCredit)
const refundCreditMock = vi.mocked(refundCredit)
const calculateMock = vi.mocked(estimationService.calculate)

beforeEach(() => {
  vi.clearAllMocks()
})

const CALCULATE_MUTATION = `
  mutation Calculate($input: CalculateInput!) {
    calculate(input: $input) {
      totalPrice
      parts {
        included
        isDamaged
        price
        part {
          id
          name
        }
      }
    }
  }
`

const defaultInput = {
  generationId: 'gen-1',
  damagedZones: ['front_bumper'],
  excludedParts: [],
}

describe('calculate', () => {
  it('should use credit and return calculation result', async () => {
    useCreditMock.mockResolvedValue({ type: 'trial' })
    calculateMock.mockResolvedValue({
      totalPrice: 150000,
      parts: [
        {
          part: {
            id: 'part-1',
            name: 'Бампер передний',
            category: 'body',
            schematicZone: null,
            configGroup: null,
            isShared: false,
            oemCode: null,
            price: { median: 5000, min: 3000, max: 7000, sampleSize: 10 },
          },
          included: true,
          isDamaged: false,
          price: 5000,
        },
      ],
    })
    prismaMock.calculation.create.mockResolvedValue({ id: 'calc-1' })

    const result = await executeQuery(CALCULATE_MUTATION, { input: defaultInput })

    expect(result.errors).toBeUndefined()
    expect(result.data?.calculate.totalPrice).toBe(150000)
    expect(result.data?.calculate.parts).toHaveLength(1)
    expect(result.data?.calculate.parts[0].part.name).toBe('Бампер передний')
    expect(useCreditMock).toHaveBeenCalledWith(prismaMock, 'test-user-id')
    expect(prismaMock.calculation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'test-user-id',
        generationId: 'gen-1',
        totalPrice: 150000,
      }),
    })
  })

  it('should throw when user has no credits', async () => {
    useCreditMock.mockRejectedValue(new Error('Лимит расчётов исчерпан'))

    const result = await executeQuery(CALCULATE_MUTATION, { input: defaultInput })

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Лимит расчётов исчерпан')
  })

  it('should refund credit when estimation throws error', async () => {
    const creditSource = { type: 'trial' as const }
    useCreditMock.mockResolvedValue(creditSource)
    calculateMock.mockRejectedValue(new Error('GENERATION_NOT_FOUND: Поколение не найдено'))
    refundCreditMock.mockResolvedValue(undefined)

    const result = await executeQuery(CALCULATE_MUTATION, { input: defaultInput })

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toContain('Поколение не найдено')
    expect(refundCreditMock).toHaveBeenCalledWith(prismaMock, 'test-user-id', creditSource)
  })

  it('should throw when not authenticated', async () => {
    const result = await executeAsAnonymous(CALCULATE_MUTATION, { input: defaultInput })

    expect(result.errors).toBeDefined()
    expect(result.errors![0].message).toBe('Требуется авторизация')
    expect(useCreditMock).not.toHaveBeenCalled()
  })
})
