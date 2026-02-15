import { GraphQLError } from 'graphql'
import { SUBSCRIPTION_PLANS } from '@razbor/shared'
import { builder } from '../builder'
import { SubscriptionPlanEnum, SubscriptionInfoType } from '../types/subscription'
import {
  cancelSubscription,
  resumeSubscription,
  getActiveSubscription,
} from '../../services/subscription.service'
import { createSubscriptionPayment } from '../../services/yookassa.service'

interface CreateSubscriptionResultData {
  confirmationToken: string
  subscriptionId: string
  paymentId: string
}

const CreateSubscriptionResultType = builder.objectRef<CreateSubscriptionResultData>('CreateSubscriptionResult')

builder.objectType(CreateSubscriptionResultType, {
  fields: (t) => ({
    confirmationToken: t.exposeString('confirmationToken'),
    subscriptionId: t.exposeString('subscriptionId'),
    paymentId: t.exposeString('paymentId'),
  }),
})

builder.mutationField('createSubscription', (t) =>
  t.field({
    type: CreateSubscriptionResultType,
    args: {
      plan: t.arg({ type: SubscriptionPlanEnum, required: true }),
    },
    resolve: async (_root, { plan }, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация')
      }

      const existing = await getActiveSubscription(ctx.prisma, ctx.user.id)
      if (existing && !existing.cancelAtPeriodEnd) {
        throw new GraphQLError('У вас уже есть активная подписка', {
          extensions: { code: 'ACTIVE_SUBSCRIPTION' },
        })
      }

      const recentCount = await ctx.prisma.yooPayment.count({
        where: {
          userId: ctx.user.id,
          isRecurring: { not: true },
          createdAt: { gt: new Date(Date.now() - 60 * 1000) },
        },
      })
      if (recentCount >= 3) {
        const oldest = await ctx.prisma.yooPayment.findFirst({
          where: {
            userId: ctx.user.id,
            isRecurring: { not: true },
            createdAt: { gt: new Date(Date.now() - 60 * 1000) },
          },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true },
        })
        const retryAfter = oldest ? Math.ceil((oldest.createdAt.getTime() + 60000 - Date.now()) / 1000) : 60
        throw new GraphQLError(`Слишком много попыток. Повторите через ${retryAfter} сек.`, {
          extensions: { code: 'RATE_LIMITED', retryAfter },
        })
      }

      await ctx.prisma.yooPayment.deleteMany({
        where: {
          userId: ctx.user.id,
          status: 'pending',
          isRecurring: { not: true },
        },
      })

      const planData = SUBSCRIPTION_PLANS[plan]

      const { confirmationToken, yooPaymentId, idempotencyKey } = await createSubscriptionPayment({
        userId: ctx.user.id,
        plan,
        amount: planData.price,
        description: `Подписка Razbor — ${planData.label}`,
      })

      const yooPayment = await ctx.prisma.yooPayment.create({
        data: {
          userId: ctx.user.id,
          yooPaymentId,
          idempotencyKey,
          amount: planData.price,
          status: 'pending',
        },
      })

      return {
        confirmationToken,
        subscriptionId: '',
        paymentId: yooPayment.id,
      }
    },
  })
)

builder.mutationField('cancelSubscription', (t) =>
  t.field({
    type: SubscriptionInfoType,
    resolve: async (_root, _args, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация')
      }

      const subscription = await getActiveSubscription(ctx.prisma, ctx.user.id)
      if (!subscription) {
        throw new GraphQLError('Активная подписка не найдена')
      }

      const updated = await cancelSubscription(ctx.prisma, subscription.id, ctx.user.id)

      return {
        id: updated.id,
        plan: updated.plan,
        status: updated.status,
        credits: updated.credits,
        creditsTotal: updated.creditsTotal,
        currentPeriodStart: updated.currentPeriodStart,
        currentPeriodEnd: updated.currentPeriodEnd,
        cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
      }
    },
  })
)

builder.mutationField('resumeSubscription', (t) =>
  t.field({
    type: SubscriptionInfoType,
    resolve: async (_root, _args, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация')
      }

      const subscription = await getActiveSubscription(ctx.prisma, ctx.user.id)
      if (!subscription) {
        throw new GraphQLError('Активная подписка не найдена')
      }

      const updated = await resumeSubscription(ctx.prisma, subscription.id, ctx.user.id)

      return {
        id: updated.id,
        plan: updated.plan,
        status: updated.status,
        credits: updated.credits,
        creditsTotal: updated.creditsTotal,
        currentPeriodStart: updated.currentPeriodStart,
        currentPeriodEnd: updated.currentPeriodEnd,
        cancelAtPeriodEnd: updated.cancelAtPeriodEnd,
      }
    },
  })
)

builder.mutationField('removePaymentMethod', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      paymentMethodId: t.arg.id({ required: true }),
    },
    resolve: async (_root, { paymentMethodId }, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация')
      }

      const method = await ctx.prisma.paymentMethod.findFirst({
        where: {
          id: String(paymentMethodId),
          userId: ctx.user.id,
        },
      })

      if (!method) {
        throw new GraphQLError('Способ оплаты не найден')
      }

      await ctx.prisma.$transaction(async (tx) => {
        const methodCount = await tx.paymentMethod.count({
          where: { userId: ctx.user!.id },
        })

        if (methodCount <= 1) {
          const activeSubscription = await tx.subscription.findFirst({
            where: {
              userId: ctx.user!.id,
              status: { in: ['active', 'past_due'] },
            },
            orderBy: { createdAt: 'desc' },
            select: { id: true },
          })
          if (activeSubscription) {
            await tx.subscription.update({
              where: { id: activeSubscription.id },
              data: { cancelAtPeriodEnd: true },
            })
          }
        }

        await tx.paymentMethod.delete({
          where: { id: method.id },
        })
      })

      return true
    },
  })
)
