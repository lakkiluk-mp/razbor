import { builder } from '../builder'
import { BodyTypeEnum } from './enums'
import type { PartWithPriceData } from './part'
import { PartWithPriceType } from './part'
import { aggregatePrices } from '../../utils/aggregate-prices'
import { cacheGet, cacheSet } from '@razbor/cache'

const PARTS_CACHE_TTL = 86400

builder.prismaObject('Generation', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    yearStart: t.exposeInt('yearStart'),
    yearEnd: t.exposeInt('yearEnd', { nullable: true }),
    bodyType: t.field({
      type: BodyTypeEnum,
      resolve: (generation) => generation.bodyType,
    }),
    model: t.relation('model'),
    parts: t.field({
      type: [PartWithPriceType],
      resolve: async (generation, _args, ctx) => {
        const cacheKey = `gen:parts:${generation.id}`
        const cached = await cacheGet<PartWithPriceData[]>(cacheKey)
        if (cached) return cached

        const modelParts = await ctx.prisma.modelPart.findMany({
          where: { generationId: generation.id },
          include: {
            part: {
              include: {
                schematicZone: true,
              },
            },
          },
          orderBy: { part: { category: 'asc' } },
        })

        const sharedPartIds = modelParts.filter((mp) => mp.part.isShared).map((mp) => mp.partId)
        const regularPartIds = modelParts.filter((mp) => !mp.part.isShared).map((mp) => mp.partId)

        const [regularPrices, sharedPrices] = await Promise.all([
          regularPartIds.length > 0
            ? ctx.prisma.price.findMany({ where: { generationId: generation.id, partId: { in: regularPartIds } } })
            : Promise.resolve([]),
          sharedPartIds.length > 0
            ? ctx.prisma.price.findMany({ where: { partId: { in: sharedPartIds }, generationId: null } })
            : Promise.resolve([]),
        ])

        const regularPriceMap = aggregatePrices(regularPrices)
        const sharedPriceMap = aggregatePrices(sharedPrices)

        const partsWithPrice: PartWithPriceData[] = modelParts.map((mp) => {
          const priceMap = mp.part.isShared ? sharedPriceMap : regularPriceMap
          const aggregated = priceMap.get(mp.partId)
          return {
            id: mp.part.id,
            name: mp.part.name,
            category: mp.part.category,
            schematicZone: mp.part.schematicZone,
            configGroup: mp.part.configGroup,
            isShared: mp.part.isShared,
            oemCode: mp.part.oemCode ?? null,
            price: aggregated ?? null,
          }
        })

        await cacheSet(cacheKey, partsWithPrice, PARTS_CACHE_TTL)

        return partsWithPrice
      },
    }),
  }),
})
