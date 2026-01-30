import { builder } from '../builder'

interface ConfigOptionData {
  configGroup: string
  name: string
  price: number
}

const ConfigOptionType = builder.objectRef<ConfigOptionData>('ConfigOption')

builder.objectType(ConfigOptionType, {
  fields: (t) => ({
    configGroup: t.exposeString('configGroup'),
    name: t.exposeString('name'),
    price: t.exposeInt('price'),
  }),
})

interface GenerationConfigsData {
  engines: ConfigOptionData[]
  transmissions: ConfigOptionData[]
  drivetrains: ConfigOptionData[]
}

const GenerationConfigsType = builder.objectRef<GenerationConfigsData>('GenerationConfigs')

builder.objectType(GenerationConfigsType, {
  fields: (t) => ({
    engines: t.field({
      type: [ConfigOptionType],
      resolve: (data) => data.engines,
    }),
    transmissions: t.field({
      type: [ConfigOptionType],
      resolve: (data) => data.transmissions,
    }),
    drivetrains: t.field({
      type: [ConfigOptionType],
      resolve: (data) => data.drivetrains,
    }),
  }),
})

builder.queryField('generationConfigs', (t) =>
  t.field({
    type: GenerationConfigsType,
    args: {
      generationId: t.arg.id({ required: true }),
    },
    resolve: async (_root, args, ctx) => {
      const modelParts = await ctx.prisma.modelPart.findMany({
        where: {
          generationId: args.generationId,
          part: {
            is: {
              configGroup: { not: null },
            },
          },
        },
        include: {
          part: {
            include: {
              prices: {
                where: { generationId: args.generationId },
                take: 1,
              },
            },
          },
        },
      })

      const engines: ConfigOptionData[] = []
      const transmissions: ConfigOptionData[] = []
      const drivetrainMap = new Map<string, { name: string; totalPrice: number }>()

      const drivetrainLabels: Record<string, string> = {
        'drivetrain:fwd': 'Передний (FWD)',
        'drivetrain:rwd': 'Задний (RWD)',
        'drivetrain:awd': 'Полный (AWD)',
      }

      for (const modelPart of modelParts) {
        const { part } = modelPart
        if (!part.configGroup) continue

        const price = part.prices[0]?.median ?? 0

        if (part.configGroup.startsWith('engine:')) {
          engines.push({ configGroup: part.configGroup, name: part.name, price })
        } else if (part.configGroup.startsWith('transmission:')) {
          transmissions.push({ configGroup: part.configGroup, name: part.name, price })
        } else if (part.configGroup.startsWith('drivetrain:')) {
          const existing = drivetrainMap.get(part.configGroup)
          if (existing) {
            existing.totalPrice += price
          } else {
            drivetrainMap.set(part.configGroup, {
              name: drivetrainLabels[part.configGroup] ?? part.configGroup,
              totalPrice: price,
            })
          }
        }
      }

      const drivetrains = Array.from(drivetrainMap.entries()).map(([configGroup, data]) => ({
        configGroup,
        name: data.name,
        price: data.totalPrice,
      }))

      engines.sort((a, b) => b.price - a.price)
      transmissions.sort((a, b) => b.price - a.price)
      drivetrains.sort((a, b) => b.price - a.price)

      return { engines, transmissions, drivetrains }
    },
  })
)
