import { builder } from '../builder'
import { UsageInfoType, type UsageInfoData } from '../types/usage'
import { getRemainingCredits, ACTIVE_STATUSES } from '../../services/credits.service'
import { TRIAL_CREDITS } from '@razbor/shared'

builder.queryField('usageInfo', (t) =>
  t.field({
    type: UsageInfoType,
    resolve: async (_root, _args, ctx): Promise<UsageInfoData> => {
      if (!ctx.user) {
        return {
          trialCredits: TRIAL_CREDITS,
          subscriptionCredits: 0,
          totalCredits: TRIAL_CREDITS,
          hasActiveSubscription: false,
        }
      }

      const [credits, subscription] = await Promise.all([
        getRemainingCredits(ctx.prisma, ctx.user.id),
        ctx.prisma.subscription.findFirst({
          where: {
            userId: ctx.user.id,
            status: { in: ACTIVE_STATUSES },
          },
        }),
      ])

      return {
        trialCredits: credits.trial,
        subscriptionCredits: credits.subscription,
        totalCredits: credits.total,
        hasActiveSubscription: !!subscription,
      }
    },
  })
)
