import { SUBSCRIPTION_PLANS } from '@razbor/shared'
import { builder } from '../builder'
import { SubscriptionInfoType } from '../types/subscription'
import { SubscriptionPlanInfoType } from '../types/subscription-plan'
import { PaymentMethodInfoType } from '../types/payment-method'
import { getActiveSubscription } from '../../services/subscription.service'

builder.queryField('mySubscription', (t) =>
  t.field({
    type: SubscriptionInfoType,
    nullable: true,
    resolve: async (_root, _args, ctx) => {
      if (!ctx.user) {
        return null
      }

      return getActiveSubscription(ctx.prisma, ctx.user.id)
    },
  })
)

builder.queryField('subscriptionPlans', (t) =>
  t.field({
    type: [SubscriptionPlanInfoType],
    resolve: () =>
      Object.entries(SUBSCRIPTION_PLANS).map(([plan, data]) => ({
        plan,
        ...data,
      })),
  })
)

builder.queryField('myPaymentMethods', (t) =>
  t.field({
    type: [PaymentMethodInfoType],
    resolve: async (_root, _args, ctx) => {
      if (!ctx.user) {
        return []
      }

      return ctx.prisma.paymentMethod.findMany({
        where: { userId: ctx.user.id },
      })
    },
  })
)
