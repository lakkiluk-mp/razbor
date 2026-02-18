import { builder } from '../builder'
import { VinDecodeResultType } from '../types/vin-decode'
import { decodeVin } from '../../services/vin-decoder.service'

builder.queryField('decodeVin', (t) =>
  t.field({
    type: VinDecodeResultType,
    args: {
      vin: t.arg.string({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      return decodeVin(args.vin, ctx.prisma)
    },
  })
)
