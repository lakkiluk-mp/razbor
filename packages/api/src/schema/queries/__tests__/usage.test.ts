import { describe, it, expect, vi, beforeEach } from 'vitest'
import { executeQuery, executeAsAnonymous } from '../../../test-utils/execute-query'
import { prismaMock } from '../../../__mocks__/prisma'

vi.mock('../../../services/credits.service', () => ({
  getRemainingCredits: vi.fn(),
  ACTIVE_STATUSES: ['active', 'past_due'],
}))

import { getRemainingCredits } from '../../../services/credits.service'
const getRemainingCreditsMock = vi.mocked(getRemainingCredits)

beforeEach(() => {
  vi.clearAllMocks()
})

const USAGE_QUERY = `
  query {
    usageInfo {
      trialCredits
      subscriptionCredits
      totalCredits
      hasActiveSubscription
    }
  }
`

describe('usageInfo', () => {
  it('should return all fields when authenticated with trial and subscription', async () => {
    getRemainingCreditsMock.mockResolvedValue({ trial: 2, subscription: 10, total: 12 })
    prismaMock.subscription.findFirst.mockResolvedValue({
      id: 'sub-1',
      status: 'active',
      userId: 'test-user-id',
    })

    const result = await executeQuery(USAGE_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.usageInfo).toEqual({
      trialCredits: 2,
      subscriptionCredits: 10,
      totalCredits: 12,
      hasActiveSubscription: true,
    })
  })

  it('should return subscriptionCredits=0 when authenticated but no subscription', async () => {
    getRemainingCreditsMock.mockResolvedValue({ trial: 3, subscription: 0, total: 3 })
    prismaMock.subscription.findFirst.mockResolvedValue(null)

    const result = await executeQuery(USAGE_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.usageInfo).toEqual({
      trialCredits: 3,
      subscriptionCredits: 0,
      totalCredits: 3,
      hasActiveSubscription: false,
    })
  })

  it('should return defaults when not authenticated', async () => {
    const result = await executeAsAnonymous(USAGE_QUERY)

    expect(result.errors).toBeUndefined()
    expect(result.data?.usageInfo).toEqual({
      trialCredits: 3,
      subscriptionCredits: 0,
      totalCredits: 3,
      hasActiveSubscription: false,
    })
    expect(getRemainingCreditsMock).not.toHaveBeenCalled()
  })
})
