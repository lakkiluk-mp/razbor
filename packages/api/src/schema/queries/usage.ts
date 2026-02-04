import { builder } from '../builder'
import { UsageInfoType, type UsageInfoData } from '../types/usage'
import { getRemainingCredits } from '../../services/usage.service'
import { FREE_CALCULATIONS_LIMIT } from '@razbor/shared'

builder.queryField('usageInfo', (t) =>
  t.field({
    type: UsageInfoType,
    resolve: async (_root, _args, ctx): Promise<UsageInfoData> => {
      const now = new Date()

      if (!ctx.user) {
        return {
          freeRemaining: FREE_CALCULATIONS_LIMIT,
          freeResetAt: now,
        }
      }

      const { remaining, oldestCalcAt } = await getRemainingCredits(ctx.prisma, ctx.user.id)

      let freeResetAt: Date
      if (oldestCalcAt) {
        freeResetAt = new Date(oldestCalcAt.getTime() + 24 * 60 * 60 * 1000)
      } else {
        freeResetAt = now
      }

      return {
        freeRemaining: remaining,
        freeResetAt,
      }
    },
  })
)
