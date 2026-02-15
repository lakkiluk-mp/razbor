import { builder } from '../builder'
import { UserProfileType, type UserProfileData } from '../types/user'
import { getRemainingCredits } from '../../services/credits.service'
import { getActiveSubscription } from '../../services/subscription.service'

builder.queryField('me', (t) =>
  t.field({
    type: UserProfileType,
    nullable: true,
    resolve: async (_root, _args, ctx): Promise<UserProfileData | null> => {
      if (!ctx.user) {
        return null
      }

      const [user, totalCalculations, credits, subscription] = await Promise.all([
        ctx.prisma.user.findUnique({
          where: { id: ctx.user.id },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            username: true,
            isPremium: true,
          },
        }),
        ctx.prisma.calculation.count({
          where: { userId: ctx.user.id },
        }),
        getRemainingCredits(ctx.prisma, ctx.user.id),
        getActiveSubscription(ctx.prisma, ctx.user.id),
      ])

      if (!user) {
        return null
      }

      return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isPremium: user.isPremium,
        totalCalculations,
        trialCredits: credits.trial,
        subscriptionCredits: credits.subscription,
        totalCredits: credits.total,
        subscription: subscription
          ? {
              id: subscription.id,
              plan: subscription.plan,
              status: subscription.status,
              credits: subscription.credits,
              creditsTotal: subscription.creditsTotal,
              currentPeriodStart: subscription.currentPeriodStart,
              currentPeriodEnd: subscription.currentPeriodEnd,
              cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            }
          : null,
      }
    },
  })
)
