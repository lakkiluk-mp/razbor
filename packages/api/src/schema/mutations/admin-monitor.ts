import { GraphQLError } from 'graphql'
import { builder } from '../builder'
import { assertAdmin } from '../../utils/admin'
import {
  AdminMonitorSettingsType,
  AdminStopFreeSlotsResultType,
  type AdminMonitorSettingsData,
  type AdminStopFreeSlotsResultData,
} from '../types/admin-monitor'
import {
  getMonitorSettings,
  setFreeSlotsClosed,
  setFreeSlotsBlocked,
} from '../../services/monitor-settings.service'
import { MONITOR_SUBSCRIPTIONS_CHANNEL } from '@razbor/shared'

builder.mutationField('adminSetFreeSlotsClosed', (t) =>
  t.field({
    type: AdminMonitorSettingsType,
    args: {
      closed: t.arg.boolean({ required: true }),
    },
    resolve: async (_root, args, ctx): Promise<AdminMonitorSettingsData> => {
      assertAdmin(ctx)
      await setFreeSlotsClosed(ctx.redis, args.closed)
      return getMonitorSettings(ctx.redis)
    },
  }),
)

builder.mutationField('adminStopFreeSlots', (t) =>
  t.field({
    type: AdminStopFreeSlotsResultType,
    resolve: async (_root, _args, ctx): Promise<AdminStopFreeSlotsResultData> => {
      assertAdmin(ctx)

      if (!ctx.redis) {
        throw new GraphQLError('Redis недоступен. Операция невозможна.')
      }

      await setFreeSlotsBlocked(ctx.redis, true)

      const affectedSubs = await ctx.prisma.monitorSubscription.findMany({
        where: { isActive: true, user: { isPremium: false } },
        select: { user: { select: { telegramId: true } } },
        distinct: ['userId'],
      })

      const result = await ctx.prisma.monitorSubscription.updateMany({
        where: { isActive: true, user: { isPremium: false } },
        data: { isActive: false },
      })

      if (ctx.telegram && affectedSubs.length > 0) {
        const message =
          '⚠️ Мониторинг приостановлен\n\n' +
          'Из-за высокой нагрузки бесплатный мониторинг временно недоступен.\n\n' +
          'Оформите подписку — и получите 3 слота мониторинга без ограничений.'

        const telegram = ctx.telegram
        Promise.allSettled(
          affectedSubs.map(({ user }) =>
            telegram.sendMessage(user.telegramId.toString(), message),
          ),
        ).catch((err) => {
          console.error('[Monitor] Failed to notify users about free slots stop:', err)
        })
      }

      if (ctx.redis) {
        try {
          await ctx.redis.publish(
            MONITOR_SUBSCRIPTIONS_CHANNEL,
            JSON.stringify({ action: 'free_slots_stopped' }),
          )
        } catch (err) {
          console.error('[Monitor] Failed to publish Redis event:', err)
        }
      }

      const settings = await getMonitorSettings(ctx.redis)
      return { settings, deactivatedCount: result.count }
    },
  }),
)

builder.mutationField('adminResumeFreeSlots', (t) =>
  t.field({
    type: AdminMonitorSettingsType,
    resolve: async (_root, _args, ctx): Promise<AdminMonitorSettingsData> => {
      assertAdmin(ctx)
      await setFreeSlotsClosed(ctx.redis, false)
      await setFreeSlotsBlocked(ctx.redis, false)
      return getMonitorSettings(ctx.redis)
    },
  }),
)

builder.mutationField('adminToggleMonitorSubscription', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_root, args, ctx): Promise<boolean> => {
      assertAdmin(ctx)

      const sub = await ctx.prisma.monitorSubscription.findUniqueOrThrow({
        where: { id: String(args.id) },
        include: { user: { select: { telegramId: true } } },
      })

      const newIsActive = !sub.isActive

      await ctx.prisma.monitorSubscription.update({
        where: { id: sub.id },
        data: { isActive: newIsActive },
      })

      if (!newIsActive && ctx.telegram) {
        const message =
          '⚠️ Мониторинг приостановлен\n\n' +
          `Подписка «${sub.label}» (${sub.brandSlug}/${sub.modelSlug}) приостановлена.\n\n` +
          'Из-за высокой нагрузки мониторинг временно недоступен.\n' +
          'Оформите подписку — и получите слоты мониторинга без ограничений.'

        ctx.telegram
          .sendMessage(sub.user.telegramId.toString(), message)
          .catch((err: unknown) => {
            console.error('[Monitor] Failed to notify user about subscription toggle:', err)
          })
      }

      if (ctx.redis) {
        try {
          await ctx.redis.publish(
            MONITOR_SUBSCRIPTIONS_CHANNEL,
            JSON.stringify({
              action: newIsActive ? 'resumed' : 'paused',
              subscriptionId: sub.id,
            }),
          )
        } catch (err) {
          console.error('[Monitor] Failed to publish Redis event:', err)
        }
      }

      return newIsActive
    },
  }),
)
