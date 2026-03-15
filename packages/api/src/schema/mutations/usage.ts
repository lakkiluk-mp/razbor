import { builder } from '../builder'
import { logUsage } from '../../services/usage.service'

const APP_OPEN_THROTTLE_MS = 60 * 60 * 1000

builder.mutationField('logAppOpen', (t) =>
  t.field({
    type: 'Boolean',
    resolve: async (_root, _args, ctx): Promise<boolean> => {
      if (!ctx.user) return false

      const lastLog = await ctx.prisma.usageLog.findFirst({
        where: {
          userId: ctx.user.id,
          action: 'APP_OPEN',
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      })

      if (lastLog && Date.now() - lastLog.createdAt.getTime() < APP_OPEN_THROTTLE_MS) {
        return false
      }

      await logUsage(ctx.prisma, ctx.user.id, 'APP_OPEN')
      return true
    },
  })
)
