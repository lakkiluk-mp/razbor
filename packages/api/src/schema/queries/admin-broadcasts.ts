import { builder } from '../builder'
import { assertAdmin } from '../../utils/admin'
import {
  BroadcastsListType,
  type BroadcastsListData,
} from '../types/broadcast'

builder.queryField('adminBroadcasts', (t) =>
  t.field({
    type: BroadcastsListType,
    args: {
      limit: t.arg.int({ required: false }),
      offset: t.arg.int({ required: false }),
    },
    resolve: async (_root, args, ctx): Promise<BroadcastsListData> => {
      assertAdmin(ctx)

      const limit = Math.min(Math.max(args.limit ?? 50, 1), 100)
      const offset = Math.max(args.offset ?? 0, 0)

      const [items, totalCount] = await Promise.all([
        ctx.prisma.broadcast.findMany({
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        ctx.prisma.broadcast.count(),
      ])

      return {
        items: items.map((b) => ({
          id: b.id,
          message: b.message,
          imageUrls: b.imageUrls,
          status: b.status,
          totalUsers: b.totalUsers,
          sentCount: b.sentCount,
          failedCount: b.failedCount,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
        })),
        totalCount,
      }
    },
  })
)
