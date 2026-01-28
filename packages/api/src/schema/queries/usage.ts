import { builder } from '../builder'
import { UsageInfoType, type UsageInfoData } from '../types/usage'

builder.queryField('usageInfo', (t) =>
  t.field({
    type: UsageInfoType,
    resolve: (): UsageInfoData => {
      const now = new Date()
      const resetAt = new Date(now)
      resetAt.setHours(24, 0, 0, 0)

      return {
        freeRemaining: 3,
        freeResetAt: resetAt,
      }
    },
  })
)
