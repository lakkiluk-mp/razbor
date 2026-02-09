import { builder } from '../builder'

builder.prismaObject('Model', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    brand: t.relation('brand'),
    generations: t.relation('generations', {
      query: { where: { isActive: true }, orderBy: { yearStart: 'desc' } },
    }),
  }),
})
