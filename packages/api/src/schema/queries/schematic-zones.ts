import { builder } from '../builder'
import { BodyTypeEnum } from '../types/enums'

// MVP: bodyType принимается для API совместимости, но пока не влияет на фильтрацию
// TODO: В будущем добавить связь SchematicZone <-> BodyType
builder.queryField('schematicZones', (t) =>
  t.prismaField({
    type: ['SchematicZone'],
    args: {
      bodyType: t.arg({ type: BodyTypeEnum, required: true }),
    },
    resolve: (query, _root, _args, ctx) =>
      ctx.prisma.schematicZone.findMany({
        ...query,
        orderBy: { sortOrder: 'asc' },
      }),
  })
)
