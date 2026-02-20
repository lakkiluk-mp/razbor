import { builder } from '../builder'
import { VinDecodeResultType } from '../types/vin-decode'
import { decodeVin } from '../../services/vin-decoder.service'
import { logUsage } from '../../services/usage.service'

builder.queryField('decodeVin', (t) =>
  t.field({
    type: VinDecodeResultType,
    args: {
      vin: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const result = await decodeVin(args.vin, ctx.prisma)

      if (ctx.user) {
        logUsage(ctx.prisma, ctx.user.id, 'vin_search', {
          vin: args.vin,
          success: result.success,
          brand: result.brand?.slug ?? null,
          model: result.model?.slug ?? null,
          generation: result.generation?.slug ?? null,
        }).catch(() => {})
      }

      return result
    },
  })
)
