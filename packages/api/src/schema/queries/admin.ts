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
  AdminUserAnalyticsType,
  AdminRetentionType,
  type AdminStatsData,
  type AdminUserDetailData,
  type AdminUsersListData,
  type AdminPaymentsListData,
  type AdminSubscriptionsListData,
  type AdminCalculationsListData,
  type AdminUserAnalyticsData,
  type AdminRetentionData,
  type AdminRetentionCohortData,
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
          searchRadius: ms.searchRadius,
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

builder.queryField('adminUserAnalytics', (t) =>
  t.field({
    type: AdminUserAnalyticsType,
    args: {
      days: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminUserAnalyticsData> => {
      assertAdmin(ctx)

      const days = Math.min(Math.max(args.days ?? 14, 1), 90)
      const fetchDays = Math.max(days, 30)
      const since = new Date()
      since.setDate(since.getDate() - fetchDays)
      since.setHours(0, 0, 0, 0)

      const todayStart = new Date()
      todayStart.setHours(0, 0, 0, 0)

      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      weekAgo.setHours(0, 0, 0, 0)

      const monthAgo = new Date()
      monthAgo.setDate(monthAgo.getDate() - 30)
      monthAgo.setHours(0, 0, 0, 0)

      const [users, calculations, usageLogs, todayUsers, weekUsers, monthUsers] = await Promise.all([
        ctx.prisma.user.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
        }),
        ctx.prisma.calculation.findMany({
          where: { createdAt: { gte: since } },
          select: { createdAt: true },
        }),
        ctx.prisma.usageLog.findMany({
          where: { createdAt: { gte: since } },
          select: { userId: true, createdAt: true, action: true },
        }),
        ctx.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
        ctx.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
        ctx.prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      ])

      const dateMap = new Map<string, {
        newUsers: number
        calculations: number
        activeUserIds: Set<string>
        appOpenUserIds: Set<string>
        calculateUserIds: Set<string>
      }>()

      for (let i = 0; i < days; i++) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const key = d.toISOString().slice(0, 10)
        dateMap.set(key, {
          newUsers: 0,
          calculations: 0,
          activeUserIds: new Set(),
          appOpenUserIds: new Set(),
          calculateUserIds: new Set(),
        })
      }

      for (const u of users) {
        const key = u.createdAt.toISOString().slice(0, 10)
        const entry = dateMap.get(key)
        if (entry) entry.newUsers++
      }

      for (const c of calculations) {
        const key = c.createdAt.toISOString().slice(0, 10)
        const entry = dateMap.get(key)
        if (entry) entry.calculations++
      }

      const dauSet = new Set<string>()
      const wauSet = new Set<string>()
      const mauSet = new Set<string>()

      for (const l of usageLogs) {
        const key = l.createdAt.toISOString().slice(0, 10)
        const entry = dateMap.get(key)
        if (entry) {
          entry.activeUserIds.add(l.userId)
          if (l.action === 'APP_OPEN') entry.appOpenUserIds.add(l.userId)
          if (l.action === 'CALCULATE') entry.calculateUserIds.add(l.userId)
        }

        if (l.createdAt >= todayStart) dauSet.add(l.userId)
        if (l.createdAt >= weekAgo) wauSet.add(l.userId)
        if (l.createdAt >= monthAgo) mauSet.add(l.userId)
      }

      const dailyStats = Array.from(dateMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, data]) => {
          const activeUsers = data.activeUserIds.size
          const calcs = data.calculations
          const appOpenCount = data.appOpenUserIds.size
          const calcUserCount = data.calculateUserIds.size

          return {
            date,
            newUsers: data.newUsers,
            calculations: calcs,
            activeUsers,
            calculationsPerUser: calcUserCount > 0
              ? Math.round((calcs / calcUserCount) * 10) / 10
              : 0,
            conversionRate: appOpenCount > 0
              ? Math.round((calcUserCount / appOpenCount) * 1000) / 10
              : 0,
          }
        })

      return {
        dailyStats,
        totals: {
          dau: dauSet.size,
          wau: wauSet.size,
          mau: mauSet.size,
          newToday: todayUsers,
          newWeek: weekUsers,
          newMonth: monthUsers,
        },
      }
    },
  })
)

builder.queryField('adminRetention', (t) =>
  t.field({
    type: AdminRetentionType,
    args: {
      cohortDays: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminRetentionData> => {
      assertAdmin(ctx)

      const cohortDays = Math.min(Math.max(args.cohortDays ?? 30, 1), 60)
      const since = new Date()
      since.setDate(since.getDate() - (cohortDays + 30))
      since.setHours(0, 0, 0, 0)

      const [users, usageLogs] = await Promise.all([
        ctx.prisma.user.findMany({
          where: { createdAt: { gte: since } },
          select: { id: true, createdAt: true },
        }),
        ctx.prisma.usageLog.findMany({
          where: { createdAt: { gte: since } },
          select: { userId: true, createdAt: true },
        }),
      ])

      const userLogDates = new Map<string, Set<string>>()
      for (const l of usageLogs) {
        const dates = userLogDates.get(l.userId)
        const dateKey = l.createdAt.toISOString().slice(0, 10)
        if (dates) {
          dates.add(dateKey)
        } else {
          userLogDates.set(l.userId, new Set([dateKey]))
        }
      }

      const now = new Date()
      now.setHours(0, 0, 0, 0)
      const nowTime = now.getTime()

      const cohortMap = new Map<string, string[]>()
      for (const u of users) {
        const key = u.createdAt.toISOString().slice(0, 10)
        const arr = cohortMap.get(key)
        if (arr) {
          arr.push(u.id)
        } else {
          cohortMap.set(key, [u.id])
        }
      }

      const cohorts: AdminRetentionCohortData[] = []
      let retainedSumDay1 = 0, retainedSumDay7 = 0, retainedSumDay30 = 0
      let sizeSumDay1 = 0, sizeSumDay7 = 0, sizeSumDay30 = 0

      for (let i = cohortDays - 1; i >= 0; i--) {
        const d = new Date(nowTime)
        d.setDate(d.getDate() - i)
        const cohortDate = d.toISOString().slice(0, 10)
        const userIds = cohortMap.get(cohortDate) ?? []
        const cohortSize = userIds.length

        if (cohortSize === 0) {
          cohorts.push({
            cohortDate,
            cohortSize: 0,
            retainedDay1: 0, retainedDay7: 0, retainedDay30: 0,
            rateDay1: -1, rateDay7: -1, rateDay30: -1,
          })
          continue
        }

        const daysAgo = i
        let retainedDay1 = 0, retainedDay7 = 0, retainedDay30 = 0

        const day1Date = new Date(d)
        day1Date.setDate(day1Date.getDate() + 1)
        const day1Key = day1Date.toISOString().slice(0, 10)

        const day7Date = new Date(d)
        day7Date.setDate(day7Date.getDate() + 7)
        const day7Key = day7Date.toISOString().slice(0, 10)

        const day30Date = new Date(d)
        day30Date.setDate(day30Date.getDate() + 30)
        const day30Key = day30Date.toISOString().slice(0, 10)

        for (const userId of userIds) {
          const dates = userLogDates.get(userId)
          if (!dates) continue
          if (dates.has(day1Key)) retainedDay1++
          if (dates.has(day7Key)) retainedDay7++
          if (dates.has(day30Key)) retainedDay30++
        }

        const rateDay1 = daysAgo >= 1
          ? Math.round((retainedDay1 / cohortSize) * 1000) / 10
          : -1
        const rateDay7 = daysAgo >= 7
          ? Math.round((retainedDay7 / cohortSize) * 1000) / 10
          : -1
        const rateDay30 = daysAgo >= 30
          ? Math.round((retainedDay30 / cohortSize) * 1000) / 10
          : -1

        if (rateDay1 >= 0) { retainedSumDay1 += retainedDay1; sizeSumDay1 += cohortSize }
        if (rateDay7 >= 0) { retainedSumDay7 += retainedDay7; sizeSumDay7 += cohortSize }
        if (rateDay30 >= 0) { retainedSumDay30 += retainedDay30; sizeSumDay30 += cohortSize }

        cohorts.push({
          cohortDate,
          cohortSize,
          retainedDay1, retainedDay7, retainedDay30,
          rateDay1, rateDay7, rateDay30,
        })
      }

      return {
        cohorts,
        averageDay1: sizeSumDay1 > 0 ? Math.round((retainedSumDay1 / sizeSumDay1) * 1000) / 10 : 0,
        averageDay7: sizeSumDay7 > 0 ? Math.round((retainedSumDay7 / sizeSumDay7) * 1000) / 10 : 0,
        averageDay30: sizeSumDay30 > 0 ? Math.round((retainedSumDay30 / sizeSumDay30) * 1000) / 10 : 0,
      }
    },
  })
)
