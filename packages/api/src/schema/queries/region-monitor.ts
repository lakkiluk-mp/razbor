import { GraphQLError } from 'graphql'
import { MONITOR_REGIONS } from '@razbor/shared'
import { builder } from '../builder'
import { MonitorRegionType, RegionListingSortByEnum } from '../types/region-listing'

function requireAuth(ctx: { user: { id: string } | null }) {
  if (!ctx.user) {
    throw new GraphQLError('Требуется авторизация', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }
}

builder.queryField('monitorRegions', (t) =>
  t.field({
    type: [MonitorRegionType],
    resolve: (_root, _args, ctx) => {
      requireAuth(ctx)
      return MONITOR_REGIONS
    },
  })
)

builder.queryField('regionListings', (t) =>
  t.prismaField({
    type: ['MonitorListing'],
    args: {
      regionSlug: t.arg.string({ required: true }),
      limit: t.arg.int({ required: false, defaultValue: 20 }),
      offset: t.arg.int({ required: false, defaultValue: 0 }),
      brand: t.arg.string({ required: false }),
      minProfit: t.arg.int({ required: false }),
      hideDamaged: t.arg.boolean({ required: false, defaultValue: false }),
      hideInactive: t.arg.boolean({ required: false, defaultValue: false }),
      sortBy: t.arg({
        type: RegionListingSortByEnum,
        required: false,
        defaultValue: 'DATE_DESC',
      }),
    },
    resolve: async (query, _root, args, ctx) => {
      requireAuth(ctx)

      const regionExists = MONITOR_REGIONS.some((r) => r.slug === args.regionSlug)
      if (!regionExists) {
        throw new GraphQLError('Регион не найден', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const where: Record<string, unknown> = {
        regionSlug: args.regionSlug,
        estimateAvg: { not: null },
      }

      if (args.brand) {
        where.brand = args.brand
      }

      if (args.minProfit != null) {
        where.profit = { gte: args.minProfit }
      }

      if (args.hideDamaged) {
        where.isDamaged = false
      }

      if (args.hideInactive) {
        where.isActive = true
      }

      let orderBy: Record<string, unknown>
      switch (args.sortBy) {
        case 'PRICE_ASC':
          orderBy = { price: 'asc' }
          break
        case 'PRICE_DESC':
          orderBy = { price: 'desc' }
          break
        case 'PROFIT_DESC':
          orderBy = { profit: { sort: 'desc', nulls: 'last' } }
          if (args.minProfit == null) {
            where.profit = { gt: 0 }
          }
          break
        default:
          orderBy = { publishedAt: 'desc' }
      }

      return ctx.prisma.monitorListing.findMany({
        ...query,
        where,
        orderBy: [orderBy, { id: 'desc' }],
        take: Math.min(Math.max(args.limit ?? 20, 1), 100),
        skip: Math.max(args.offset ?? 0, 0),
      })
    },
  })
)

builder.queryField('regionBrands', (t) =>
  t.stringList({
    args: {
      regionSlug: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      requireAuth(ctx)

      const regionExists = MONITOR_REGIONS.some((r) => r.slug === args.regionSlug)
      if (!regionExists) {
        throw new GraphQLError('Регион не найден', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }

      const result = await ctx.prisma.monitorListing.findMany({
        where: { regionSlug: args.regionSlug, isActive: true, brand: { not: '' } },
        distinct: ['brand'],
        select: { brand: true },
        orderBy: { brand: 'asc' },
      })

      return result.map((r) => r.brand)
    },
  })
)
