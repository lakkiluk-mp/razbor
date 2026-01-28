import { builder } from '../builder'

builder.prismaObject('Brand', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    logo: t.exposeString('logo', { nullable: true }),
    models: t.relation('models', {
      query: { orderBy: { sortOrder: 'asc' } },
    }),
  }),
})
