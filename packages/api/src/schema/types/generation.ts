import { builder } from '../builder'
import { BodyTypeEnum } from './enums'
import type { PartWithPriceData } from './part'
import { PartWithPriceType } from './part'

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

        const prices = await ctx.prisma.price.findMany({
          where: { generationId: generation.id },
        })

        const priceMap = new Map(prices.map((p) => [p.partId, p]))

        const partsWithPrice: PartWithPriceData[] = modelParts.map((mp) => {
          const priceRecord = priceMap.get(mp.partId)
          return {
            id: mp.part.id,
            name: mp.part.name,
            category: mp.part.category,
            schematicZone: mp.part.schematicZone,
            price: priceRecord
              ? {
                  median: priceRecord.median,
                  min: priceRecord.minPrice,
                  max: priceRecord.maxPrice,
                  count: priceRecord.sampleSize,
                  updatedAt: priceRecord.fetchedAt,
                }
              : null,
          }
        })

        return partsWithPrice
      },
    }),
  }),
})
