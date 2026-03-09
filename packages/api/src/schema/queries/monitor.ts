import { GraphQLError } from 'graphql'
import { MONITOR_CITIES } from '@razbor/shared'
import { builder } from '../builder'

const MonitorCityType = builder.objectRef<{ name: string; slug: string }>('MonitorCity')

builder.objectType(MonitorCityType, {
  fields: (t) => ({
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
  }),
})

builder.queryField('monitorSubscriptions', (t) =>
  t.prismaField({
    type: ['MonitorSubscription'],
    resolve: async (query, _root, _args, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      return ctx.prisma.monitorSubscription.findMany({
        ...query,
        where: { userId: ctx.user.id },
        orderBy: { createdAt: 'desc' },
      })
    },
  })
)

builder.queryField('monitorSubscription', (t) =>
  t.prismaField({
    type: 'MonitorSubscription',
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация', {
          extensions: { code: 'UNAUTHENTICATED' },
        })
      }

      return ctx.prisma.monitorSubscription.findFirst({
        ...query,
        where: { id: String(args.id), userId: ctx.user.id },
      })
    },
  })
)

builder.queryField('monitorCities', (t) =>
  t.field({
    type: [MonitorCityType],
    resolve: () => MONITOR_CITIES,
  })
)
