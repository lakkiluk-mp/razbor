import { builder } from '../builder'

builder.queryField('generation', (t) =>
  t.prismaField({
    type: 'Generation',
    nullable: true,
    args: {
      brandSlug: t.arg.string({ required: true }),
      modelSlug: t.arg.string({ required: true }),
      generationSlug: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      const model = await ctx.prisma.model.findFirst({
        where: {
          slug: args.modelSlug,
          brand: { slug: args.brandSlug },
        },
      })
      if (!model) return null

      return ctx.prisma.generation.findFirst({
        ...query,
        where: {
          modelId: model.id,
          slug: args.generationSlug,
          isActive: true,
        },
      })
    },
  })
)

builder.queryField('generationById', (t) =>
  t.prismaField({
    type: 'Generation',
    nullable: true,
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (query, _root, args, ctx) => {
      return ctx.prisma.generation.findFirst({
        ...query,
        where: {
          id: args.id,
          isActive: true,
        },
      })
    },
  })
)
