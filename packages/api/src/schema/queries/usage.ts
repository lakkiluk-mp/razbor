import { builder } from '../builder'
import { UsageInfoType, type UsageInfoData } from '../types/usage'
import { getRemainingCredits } from '../../services/usage.service'
import { FREE_CALCULATIONS_LIMIT } from '@razbor/shared'

builder.queryField('usageInfo', (t) =>
  t.field({
    type: UsageInfoType,
    resolve: async (_root, _args, ctx): Promise<UsageInfoData> => {
      if (!ctx.user) {
        return {
          freeRemaining: FREE_CALCULATIONS_LIMIT,
          freeResetAt: new Date(),
          dailyLimit: FREE_CALCULATIONS_LIMIT,
        }
      }

      const { remaining, nextReset, dailyLimit } = await getRemainingCredits(ctx.prisma, ctx.user.id)

      return {
        freeRemaining: remaining,
        freeResetAt: nextReset,
        dailyLimit,
      }
    },
  })
)
