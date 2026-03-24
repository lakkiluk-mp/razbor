import { builder } from '../builder'
import { assertAdmin } from '../../utils/admin'
import { CreateAdminSearchWatchInput } from '../types/admin-search-watch'
import {
  createAdminSearchWatch,
  deleteAdminSearchWatch,
  toggleAdminSearchWatch,
} from '../../services/admin-search-watch.service'

builder.mutationField('createAdminSearchWatch', (t) =>
  t.prismaField({
    type: 'AdminSearchWatch',
    args: {
      input: t.arg({ type: CreateAdminSearchWatchInput, required: true }),
    },
    resolve: async (_query, _root, { input }, ctx) => {
      assertAdmin(ctx)
      return createAdminSearchWatch(ctx.prisma, ctx.redis, ctx.user!.id, {
        label: input.label,
        url: input.url,
      })
    },
  })
)

builder.mutationField('deleteAdminSearchWatch', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_root, { id }, ctx) => {
      assertAdmin(ctx)
      await deleteAdminSearchWatch(ctx.prisma, ctx.redis, String(id))
      return true
    },
  })
)

builder.mutationField('toggleAdminSearchWatch', (t) =>
  t.prismaField({
    type: 'AdminSearchWatch',
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (_query, _root, { id }, ctx) => {
      assertAdmin(ctx)
      return toggleAdminSearchWatch(ctx.prisma, ctx.redis, String(id))
    },
  })
)
