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

      return createMonitorSubscription(ctx.prisma, ctx.redis, ctx.user.id, {
        label: input.label,
        brandSlug: input.brandSlug,
        modelSlug: input.modelSlug,
        city: input.city,
        priceMin: input.priceMin,
        priceMax: input.priceMax,
        yearMin: input.yearMin,
        yearMax: input.yearMax,
        mileageMax: input.mileageMax,
      })
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
