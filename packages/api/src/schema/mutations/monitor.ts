import { GraphQLError } from 'graphql'
import { builder } from '../builder'
import { CreateMonitorSubscriptionInput, UpdateMonitorSubscriptionInput } from '../types/monitor-subscription'
import {
  createMonitorSubscription,
  updateMonitorSubscription,
  deleteMonitorSubscription,
  pauseMonitorSubscription,
} from '../../services/monitor.service'

builder.mutationField('createMonitorSubscription', (t) =>
  t.prismaField({
    type: 'MonitorSubscription',
    args: {
      input: t.arg({ type: CreateMonitorSubscriptionInput, required: true }),
    },
    resolve: async (_query, _root, { input }, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      const subscription = await createMonitorSubscription(ctx.prisma, ctx.redis, ctx.user.id, {
        label: input.label,
        brandSlug: input.brandSlug,
        modelSlug: input.modelSlug,
        city: input.city,
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        yearMin: input.yearMin,
        yearMax: input.yearMax,
        mileageMax: input.mileageMax,
        searchRadius: input.searchRadius,
      })

      if (ctx.telegram && ctx.user) {
        const filters: string[] = []
        if (input.city) {
          filters.push(input.city.split(/[-_]/).map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '))
        }
        if (input.yearMin || input.yearMax) {
          filters.push(`${input.yearMin ?? '...'}-${input.yearMax ?? '...'} г.`)
        }
        if (input.priceMin || input.priceMax) {
          const min = input.priceMin ? `${Math.round(input.priceMin / 1000)}т` : '...'
          const max = input.priceMax ? `${Math.round(input.priceMax / 1000)}т` : '...'
          filters.push(`${min}-${max} ₽`)
        }
        if (input.mileageMax) {
          filters.push(`до ${Math.round(input.mileageMax / 1000)}т км`)
        }
        if (input.searchRadius) {
          filters.push(`+${input.searchRadius} км`)
        }

        const filtersLine = filters.length > 0 ? `\n${filters.join(' · ')}` : ''
        const message = `✅ Мониторинг запущен\n\n${input.label}${filtersLine}\n\nНовые объявления будут приходить в этот чат.`

        const telegram = ctx.telegram
        const chatId = ctx.user.telegramId.toString()
        telegram.sendMessage(chatId, message).catch((err) => {
          console.error('[Monitor] Failed to send start notification:', err)
        })
      }

      return subscription
    },
  })
)

builder.mutationField('updateMonitorSubscription', (t) =>
  t.prismaField({
    type: 'MonitorSubscription',
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: UpdateMonitorSubscriptionInput, required: true }),
    },
    resolve: async (_query, _root, { id, input }, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      return updateMonitorSubscription(ctx.prisma, ctx.redis, ctx.user.id, String(id), {
        label: input.label,
        isActive: input.isActive,
        city: input.city,
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        yearMin: input.yearMin,
        yearMax: input.yearMax,
        mileageMax: input.mileageMax,
        searchRadius: input.searchRadius,
      })
    },
  })
)

builder.mutationField('deleteMonitorSubscription', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_root, { id }, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      await deleteMonitorSubscription(ctx.prisma, ctx.redis, ctx.user.id, String(id))
      return true
    },
  })
)

builder.mutationField('pauseMonitorSubscription', (t) =>
  t.prismaField({
    type: 'MonitorSubscription',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_query, _root, { id }, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      return pauseMonitorSubscription(ctx.prisma, ctx.redis, ctx.user.id, String(id))
    },
  })
)
