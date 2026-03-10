import { builder } from '../builder'
import { assertAdmin } from '../../utils/admin'
import { parseSortOrder, validateSortField, type SortOrder } from '../../utils/sort'
import {
  AdminStatsType,
  AdminUserDetailType,
  AdminUsersListType,
  AdminPaymentsListType,
  AdminSubscriptionsListType,
  AdminCalculationsListType,
  type AdminStatsData,
  type AdminUserDetailData,
  type AdminUsersListData,
  type AdminPaymentsListData,
  type AdminSubscriptionsListData,
  type AdminCalculationsListData,
} from '../types/admin'

const SORT_FIELDS = {
  adminUsers: ['createdAt', 'firstName', 'totalCalculations', 'activeMonitorCount'],
  adminPayments: ['createdAt', 'amount', 'status'],
  adminSubscriptions: ['createdAt', 'plan', 'status', 'credits', 'currentPeriodEnd'],
  adminCalculations: ['createdAt', 'totalPrice'],
} as const

function buildUserOrderBy(sortBy: string | null | undefined, sortOrder: string | null | undefined) {
  const order = parseSortOrder(sortOrder)
  const field = validateSortField(SORT_FIELDS.adminUsers, sortBy)

  if (field === 'totalCalculations') return { calculations: { _count: order } }
  if (field === 'activeMonitorCount') return { monitorSubscriptions: { _count: order } }
  return { [field]: order }
}

function buildSimpleOrderBy(
  whitelist: readonly string[],
  sortBy: string | null | undefined,
  sortOrder: string | null | undefined,
): Record<string, SortOrder> {
  const order = parseSortOrder(sortOrder)
  const field = validateSortField(whitelist, sortBy)
  return { [field]: order }
}

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
        totalRevenue: yooRevenueResult._sum.amount ?? 0,
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
      sortBy: t.arg.string({ required: false }),
      sortOrder: t.arg.string({ required: false }),
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

      const orderBy = buildUserOrderBy(args.sortBy, args.sortOrder)

      const [users, totalCount] = await Promise.all([
        ctx.prisma.user.findMany({
          where,
          include: {
            _count: {
              select: {
                calculations: true,
                yooPayments: true,
                monitorSubscriptions: { where: { isActive: true } },
              },
            },
            subscriptions: {
              where: { status: 'active' },
              take: 1,
            },
          },
          orderBy,
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
          totalPayments: u._count.yooPayments,
          activeSubscription: u.subscriptions.length > 0,
          activeMonitorCount: u._count.monitorSubscriptions,
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
              monitorSubscriptions: { where: { isActive: true } },
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
          subscriptions: {
            orderBy: { createdAt: 'desc' },
          },
          usageLogs: {
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
          monitorSubscriptions: {
            orderBy: { createdAt: 'desc' },
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
        totalPayments: user._count.yooPayments,
        activeSubscription: user.subscriptions.some((s) => s.status === 'active'),
        activeMonitorCount: user._count.monitorSubscriptions,
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
        monitorSubscriptions: user.monitorSubscriptions.map((ms) => ({
          id: ms.id,
          label: ms.label,
          brandSlug: ms.brandSlug,
          modelSlug: ms.modelSlug,
          city: ms.city,
          priceMin: ms.priceMin,
          priceMax: ms.priceMax,
          yearMin: ms.yearMin,
          yearMax: ms.yearMax,
          mileageMax: ms.mileageMax,
          isActive: ms.isActive,
          notificationsSent: ms.notificationsSent,
          lastNotifiedAt: ms.lastNotifiedAt,
          createdAt: ms.createdAt,
          userId: ms.userId,
          userFirstName: user.firstName,
          userUsername: user.username,
          userTelegramId: user.telegramId.toString(),
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
      sortBy: t.arg.string({ required: false }),
      sortOrder: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminPaymentsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)
      const orderBy = buildSimpleOrderBy(SORT_FIELDS.adminPayments, args.sortBy, args.sortOrder)

      const [payments, totalCount] = await Promise.all([
        ctx.prisma.yooPayment.findMany({
          include: { user: { select: { firstName: true, username: true } } },
          orderBy,
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

builder.queryField('adminSubscriptions', (t) =>
  t.field({
    type: AdminSubscriptionsListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      status: t.arg.string({ required: false }),
      sortBy: t.arg.string({ required: false }),
      sortOrder: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminSubscriptionsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const where = args.status
        ? { status: args.status as 'active' | 'past_due' | 'canceled' | 'expired' }
        : {}

      const orderBy = buildSimpleOrderBy(SORT_FIELDS.adminSubscriptions, args.sortBy, args.sortOrder)

      const [subscriptions, totalCount] = await Promise.all([
        ctx.prisma.subscription.findMany({
          where,
          include: { user: { select: { firstName: true, username: true } } },
          orderBy,
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
      sortBy: t.arg.string({ required: false }),
      sortOrder: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminCalculationsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const where = args.userId ? { userId: String(args.userId) } : {}
      const orderBy = buildSimpleOrderBy(SORT_FIELDS.adminCalculations, args.sortBy, args.sortOrder)

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
          orderBy,
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
