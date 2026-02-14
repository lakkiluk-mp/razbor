import { builder } from '../builder'
import {
  CalculationHistoryItemType,
  type CalculationHistoryItemData,
} from '../types/calculation-history'

builder.queryField('myCalculations', (t) =>
  t.field({
    type: [CalculationHistoryItemType],
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<CalculationHistoryItemData[]> => {
      if (!ctx.user) {
        return []
      }

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const calculations = await ctx.prisma.calculation.findMany({
        where: { userId: ctx.user.id },
        include: {
          generation: {
            include: {
              model: {
                include: {
                  brand: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      })

      return calculations.map((calc) => ({
        id: calc.id,
        totalPrice: calc.totalPrice,
        damagedZonesCount: calc.damagedZones.length,
        createdAt: calc.createdAt,
        brandName: calc.generation.model.brand.name,
        brandSlug: calc.generation.model.brand.slug,
        modelName: calc.generation.model.name,
        generationName: calc.generation.name,
        bodyType: calc.generation.bodyType,
      }))
    },
  })
)
