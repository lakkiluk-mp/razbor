import { builder } from '../builder'
import { assertAdmin } from '../../utils/admin'
import { parseSortOrder, validateSortField } from '../../utils/sort'
import {
  AdminMonitorStatsType,
  AdminMonitorSubscriptionsListType,
  AdminMonitorLogsListType,
  AdminMonitorSettingsType,
  type AdminMonitorStatsData,
  type AdminMonitorSubscriptionsListData,
  type AdminMonitorLogsListData,
  type AdminMonitorSettingsData,
} from '../types/admin-monitor'
import { getMonitorSettings } from '../../services/monitor-settings.service'

const MONITOR_SORT_FIELDS = {
  subscriptions: ['createdAt', 'notificationsSent', 'isActive', 'brandSlug', 'label', 'lastNotifiedAt'],
  logs: ['createdAt', 'type', 'level'],
} as const

builder.queryField('adminMonitorStats', (t) =>
  t.field({
    type: AdminMonitorStatsType,
    resolve: async (_root, _args, ctx): Promise<AdminMonitorStatsData> => {
      assertAdmin(ctx)

      const [
        totalMonitorUsers,
        totalSubscriptions,
        activeSubscriptions,
        notificationsResult,
        groupsResult,
      ] = await Promise.all([
        ctx.prisma.monitorSubscription
          .groupBy({ by: ['userId'] })
          .then((r) => r.length),
        ctx.prisma.monitorSubscription.count(),
        ctx.prisma.monitorSubscription.count({ where: { isActive: true } }),
        ctx.prisma.monitorSubscription.aggregate({
          _sum: { notificationsSent: true },
        }),
        ctx.prisma.monitorSubscription
          .groupBy({ by: ['brandSlug', 'modelSlug', 'city'] })
          .then((r) => r.length),
      ])

      return {
        totalMonitorUsers,
        totalSubscriptions,
        activeSubscriptions,
        totalNotificationsSent: notificationsResult._sum.notificationsSent ?? 0,
        uniqueGroups: groupsResult,
      }
    },
  }),
)

builder.queryField('adminMonitorSubscriptions', (t) =>
  t.field({
    type: AdminMonitorSubscriptionsListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      isActive: t.arg.boolean({ required: false }),
      search: t.arg.string({ required: false }),
      sortBy: t.arg.string({ required: false }),
      sortOrder: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminMonitorSubscriptionsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const order = parseSortOrder(args.sortOrder)
      const field = validateSortField(MONITOR_SORT_FIELDS.subscriptions, args.sortBy)
      const orderBy = { [field]: order }

      const where: Record<string, unknown> = {}

      if (args.isActive !== null && args.isActive !== undefined) {
        where.isActive = args.isActive
      }

      if (args.search) {
        where.OR = [
          { label: { contains: args.search, mode: 'insensitive' } },
          { brandSlug: { contains: args.search, mode: 'insensitive' } },
          { modelSlug: { contains: args.search, mode: 'insensitive' } },
          { user: { firstName: { contains: args.search, mode: 'insensitive' } } },
          { user: { username: { contains: args.search, mode: 'insensitive' } } },
        ]
      }

      const [subscriptions, totalCount] = await Promise.all([
        ctx.prisma.monitorSubscription.findMany({
          where,
          include: {
            user: {
              select: { firstName: true, username: true, telegramId: true },
            },
          },
          orderBy,
          take: limit,
          skip: offset,
        }),
        ctx.prisma.monitorSubscription.count({ where }),
      ])

      return {
        items: subscriptions.map((s) => ({
          id: s.id,
          label: s.label,
          brandSlug: s.brandSlug,
          modelSlug: s.modelSlug,
          city: s.city,
          priceMin: s.priceMin,
          priceMax: s.priceMax,
          yearMin: s.yearMin,
          yearMax: s.yearMax,
          mileageMax: s.mileageMax,
          searchRadius: s.searchRadius,
          isActive: s.isActive,
          notificationsSent: s.notificationsSent,
          lastNotifiedAt: s.lastNotifiedAt,
          createdAt: s.createdAt,
          userId: s.userId,
          userFirstName: s.user.firstName,
          userUsername: s.user.username,
          userTelegramId: s.user.telegramId.toString(),
        })),
        totalCount,
      }
    },
  }),
)

builder.queryField('adminMonitorLogs', (t) =>
  t.field({
    type: AdminMonitorLogsListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
      level: t.arg.string({ required: false }),
      type: t.arg.string({ required: false }),
      sortBy: t.arg.string({ required: false }),
      sortOrder: t.arg.string({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<AdminMonitorLogsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const order = parseSortOrder(args.sortOrder)
      const field = validateSortField(MONITOR_SORT_FIELDS.logs, args.sortBy)
      const orderBy = { [field]: order }

      const where: Record<string, unknown> = {}

      if (args.level) {
        where.level = args.level
      }

      if (args.type) {
        where.type = args.type
      }

      const [logs, totalCount] = await Promise.all([
        ctx.prisma.monitorLog.findMany({
          where,
          orderBy,
          take: limit,
          skip: offset,
        }),
        ctx.prisma.monitorLog.count({ where }),
      ])

      return {
        items: logs.map((l) => ({
          id: l.id,
          type: l.type,
          level: l.level,
          brandSlug: l.brandSlug,
          modelSlug: l.modelSlug,
          message: l.message,
          meta: l.meta,
          createdAt: l.createdAt,
        })),
        totalCount,
      }
    },
  }),
)

builder.queryField('adminMonitorSettings', (t) =>
  t.field({
    type: AdminMonitorSettingsType,
    resolve: async (_root, _args, ctx): Promise<AdminMonitorSettingsData> => {
      assertAdmin(ctx)
      return getMonitorSettings(ctx.redis)
    },
  }),
)
