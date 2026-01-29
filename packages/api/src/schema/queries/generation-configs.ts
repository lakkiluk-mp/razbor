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

      for (const modelPart of modelParts) {
        const { part } = modelPart
        if (!part.configGroup) continue

        const price = part.prices[0]?.median ?? 0

        const option: ConfigOptionData = {
          configGroup: part.configGroup,
          name: part.name,
          price,
        }

        if (part.configGroup.startsWith('engine:')) {
          engines.push(option)
        } else if (part.configGroup.startsWith('transmission:')) {
          transmissions.push(option)
        }
      }

      engines.sort((a, b) => b.price - a.price)
      transmissions.sort((a, b) => b.price - a.price)

      return { engines, transmissions }
    },
  })
)
