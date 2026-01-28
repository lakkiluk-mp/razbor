import { builder } from '../builder'

builder.queryField('model', (t) =>
  t.prismaField({
    type: 'Model',
    nullable: true,
    args: {
      brandSlug: t.arg.string({ required: true }),
      modelSlug: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.model.findFirst({
        ...query,
        where: {
          slug: args.modelSlug,
          brand: { slug: args.brandSlug },
        },
      }),
  })
)
