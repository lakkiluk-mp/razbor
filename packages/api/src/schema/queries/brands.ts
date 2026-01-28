import { builder } from '../builder'

builder.queryField('brands', (t) =>
  t.prismaField({
    type: ['Brand'],
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.brand.findMany({
        ...query,
        orderBy: { sortOrder: 'asc' },
      }),
  })
)

builder.queryField('brand', (t) =>
  t.prismaField({
    type: 'Brand',
    nullable: true,
    args: {
      slug: t.arg.string({ required: true }),
    },
    resolve: (query, _root, args, ctx) =>
      ctx.prisma.brand.findUnique({
        ...query,
        where: { slug: args.slug },
      }),
  })
)
