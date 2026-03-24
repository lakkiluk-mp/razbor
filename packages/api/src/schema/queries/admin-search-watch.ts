import { builder } from '../builder'
import { assertAdmin } from '../../utils/admin'

builder.queryField('adminSearchWatches', (t) =>
  t.prismaField({
    type: ['AdminSearchWatch'],
    resolve: async (query, _root, _args, ctx) => {
      assertAdmin(ctx)
      return ctx.prisma.adminSearchWatch.findMany({
        ...query,
        orderBy: { createdAt: 'desc' },
      })
    },
  })
)
