import { builder } from '../builder'
import { assertAdmin } from '../../utils/admin'
import {
  AdminStatsType,
  AdminUserDetailType,
  AdminUsersListType,
  AdminPaymentsListType,
  AdminTelegramPaymentsListType,
  AdminSubscriptionsListType,
  AdminCalculationsListType,
  type AdminStatsData,
  type AdminUserDetailData,
  type AdminUsersListData,
  type AdminPaymentsListData,
  type AdminTelegramPaymentsListData,
  type AdminSubscriptionsListData,
  type AdminCalculationsListData,
} from '../types/admin'

builder.queryField('adminStats', (t) =>
  t.field({
    type: AdminStatsType,
    resolve: async (_root, _args, ctx): Promise<AdminStatsData> => {
      assertAdmin(ctx)

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const [
        totalUsers,
        totalCalculations,
        activeSubscriptions,
        yooRevenueResult,
        telegramRevenueResult,
        newUsersToday,
        calculationsToday,
      ] = await Promise.all([
        ctx.prisma.user.count(),
        ctx.prisma.calculation.count(),
        ctx.prisma.subscription.count({ where: { status: 'active' } }),
        ctx.prisma.yooPayment.aggregate({
          _sum: { amount: true },
          where: { status: 'succeeded' },
        }),
        ctx.prisma.payment.aggregate({
          _sum: { amount: true },
        }),
        ctx.prisma.user.count({
          where: { createdAt: { gte: todayStart } },
        }),
        ctx.prisma.calculation.count({
          where: { createdAt: { gte: todayStart } },
        }),
      ])

      return {
        totalUsers,
        totalCalculations,
        totalRevenue:
          (yooRevenueResult._sum.amount ?? 0) +
          (telegramRevenueResult._sum.amount ?? 0),
        activeSubscriptions,
        newUsersToday,
        calculationsToday,
      }
    },
  })
)

builder.queryField('adminUsers', (t) =>
  t.field({
    type: AdminUsersListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      search: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminUsersListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const where = args.search
        ? {
            OR: [
              { firstName: { contains: args.search, mode: 'insensitive' as const } },
              { lastName: { contains: args.search, mode: 'insensitive' as const } },
              { username: { contains: args.search, mode: 'insensitive' as const } },
              ...(/^\d+$/.test(args.search)
                ? [{ telegramId: BigInt(args.search) }]
                : []),
            ],
          }
        : {}

      const [users, totalCount] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          include: {
            _count: {
              select: {
                calculations: true,
                yooPayments: true,
                payments: true,
              },
            },
            subscriptions: {
              where: { status: 'active' },
              take: 1,
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.user.count({ where }),
      ])

      return {
        items: users.map((u) => ({
          id: u.id,
          telegramId: u.telegramId,
          firstName: u.firstName,
          lastName: u.lastName,
          username: u.username,
          isPremium: u.isPremium,
          trialCredits: u.trialCredits,
          createdAt: u.createdAt,
          totalCalculations: u._count.calculations,
          totalPayments: u._count.yooPayments + u._count.payments,
          activeSubscription: u.subscriptions.length > 0,
        })),
        totalCount,
      }
    },
  })
)

builder.queryField('adminUser', (t) =>
  t.field({
    type: AdminUserDetailType,
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_root, args, ctx): Promise<AdminUserDetailData | null> => {
      assertAdmin(ctx)

      const user = await ctx.prisma.user.findUnique({
        where: { id: String(args.id) },
        include: {
          _count: {
            select: {
              calculations: true,
              yooPayments: true,
              payments: true,
            },
          },
          calculations: {
            include: {
              generation: {
                include: {
                  model: {
                    include: { brand: true },
                  },
                },
              },
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
          yooPayments: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
          payments: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
          subscriptions: {
            orderBy: { createdAt: 'desc' },
          },
          usageLogs: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
      })

      if (!user) return null

      return {
        id: user.id,
        telegramId: user.telegramId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        isPremium: user.isPremium,
        trialCredits: user.trialCredits,
        createdAt: user.createdAt,
        totalCalculations: user._count.calculations,
        totalPayments: user._count.yooPayments + user._count.payments,
        activeSubscription: user.subscriptions.some((s) => s.status === 'active'),
        calculations: user.calculations.map((c) => ({
          id: c.id,
          userId: c.userId,
          totalPrice: c.totalPrice,
          damagedZonesCount: c.damagedZones.length,
          createdAt: c.createdAt,
          userName: user.firstName,
          userUsername: user.username,
          brandName: c.generation.model.brand.name,
          modelName: c.generation.model.name,
          generationName: c.generation.name,
        })),
        yooPayments: user.yooPayments.map((p) => ({
          id: p.id,
          userId: p.userId,
          yooPaymentId: p.yooPaymentId,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          isRecurring: p.isRecurring,
          createdAt: p.createdAt,
          userName: user.firstName,
          userUsername: user.username,
        })),
        telegramPayments: user.payments.map((p) => ({
          id: p.id,
          userId: p.userId,
          telegramPaymentId: p.telegramPaymentId,
          amount: p.amount,
          calculationsCount: p.calculationsCount,
          createdAt: p.createdAt,
          userName: user.firstName,
          userUsername: user.username,
        })),
        subscriptions: user.subscriptions.map((s) => ({
          id: s.id,
          userId: s.userId,
          plan: s.plan,
          status: s.status,
          credits: s.credits,
          creditsTotal: s.creditsTotal,
          currentPeriodStart: s.currentPeriodStart,
          currentPeriodEnd: s.currentPeriodEnd,
          cancelAtPeriodEnd: s.cancelAtPeriodEnd,
          createdAt: s.createdAt,
          userName: user.firstName,
          userUsername: user.username,
        })),
        recentUsageLogs: user.usageLogs.map((l) => ({
          id: l.id,
          action: l.action,
          metadata: l.metadata,
          createdAt: l.createdAt,
        })),
      }
    },
  })
)

builder.queryField('adminPayments', (t) =>
  t.field({
    type: AdminPaymentsListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminPaymentsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const [payments, totalCount] = await Promise.all([
        ctx.prisma.yooPayment.findMany({
          include: { user: { select: { firstName: true, username: true } } },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.yooPayment.count(),
      ])

      return {
        items: payments.map((p) => ({
          id: p.id,
          userId: p.userId,
          yooPaymentId: p.yooPaymentId,
          amount: p.amount,
          currency: p.currency,
          status: p.status,
          isRecurring: p.isRecurring,
          createdAt: p.createdAt,
          userName: p.user.firstName,
          userUsername: p.user.username,
        })),
        totalCount,
      }
    },
  })
)

builder.queryField('adminTelegramPayments', (t) =>
  t.field({
    type: AdminTelegramPaymentsListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminTelegramPaymentsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const [payments, totalCount] = await Promise.all([
        ctx.prisma.payment.findMany({
          include: { user: { select: { firstName: true, username: true } } },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.payment.count(),
      ])

      return {
        items: payments.map((p) => ({
          id: p.id,
          userId: p.userId,
          telegramPaymentId: p.telegramPaymentId,
          amount: p.amount,
          calculationsCount: p.calculationsCount,
          createdAt: p.createdAt,
          userName: p.user.firstName,
          userUsername: p.user.username,
        })),
        totalCount,
      }
    },
  })
)

builder.queryField('adminSubscriptions', (t) =>
  t.field({
    type: AdminSubscriptionsListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      status: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminSubscriptionsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const where = args.status
        ? { status: args.status as 'active' | 'past_due' | 'canceled' | 'expired' }
        : {}

      const [subscriptions, totalCount] = await Promise.all([
        ctx.prisma.subscription.findMany({
          where,
          include: { user: { select: { firstName: true, username: true } } },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.subscription.count({ where }),
      ])

      return {
        items: subscriptions.map((s) => ({
          id: s.id,
          userId: s.userId,
          plan: s.plan,
          status: s.status,
          credits: s.credits,
          creditsTotal: s.creditsTotal,
          currentPeriodStart: s.currentPeriodStart,
          currentPeriodEnd: s.currentPeriodEnd,
          cancelAtPeriodEnd: s.cancelAtPeriodEnd,
          createdAt: s.createdAt,
          userName: s.user.firstName,
          userUsername: s.user.username,
        })),
        totalCount,
      }
    },
  })
)

builder.queryField('adminCalculations', (t) =>
  t.field({
    type: AdminCalculationsListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      userId: t.arg.id({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminCalculationsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const where = args.userId ? { userId: String(args.userId) } : {}

      const [calculations, totalCount] = await Promise.all([
        ctx.prisma.calculation.findMany({
          where,
          include: {
            user: { select: { firstName: true, username: true } },
            generation: {
              include: {
                model: {
                  include: { brand: true },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.calculation.count({ where }),
      ])

      return {
        items: calculations.map((c) => ({
          id: c.id,
          userId: c.userId,
          totalPrice: c.totalPrice,
          damagedZonesCount: c.damagedZones.length,
          createdAt: c.createdAt,
          userName: c.user.firstName,
          userUsername: c.user.username,
          brandName: c.generation.model.brand.name,
          modelName: c.generation.model.name,
          generationName: c.generation.name,
        })),
        totalCount,
      }
    },
  })
)
