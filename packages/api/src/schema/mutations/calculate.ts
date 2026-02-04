import { GraphQLError } from 'graphql'
import { builder } from '../builder'
import { CalculationResultType } from '../types/calculation'
import { calculatorService } from '../../services/calculator.service'
import { getRemainingCredits, logUsage } from '../../services/usage.service'

const CalculateInput = builder.inputType('CalculateInput', {
  fields: (t) => ({
    generationId: t.id({ required: true }),
    damagedZones: t.stringList({ required: true }),
    excludedParts: t.idList({ required: false }),
    selectedEngine: t.string({ required: false }),
    selectedTransmission: t.string({ required: false }),
    selectedDrivetrain: t.string({ required: false }),
  }),
})

builder.mutationField('calculate', (t) =>
  t.field({
    type: CalculationResultType,
    args: {
      input: t.arg({ type: CalculateInput, required: true }),
    },
    resolve: async (_root, { input }, ctx) => {
      if (ctx.user) {
        const { remaining } = await getRemainingCredits(ctx.prisma, ctx.user.id)
        if (remaining <= 0) {
          throw new GraphQLError('Лимит расчётов исчерпан')
        }
      }

      const result = await calculatorService.calculate({
        generationId: input.generationId,
        damagedZones: input.damagedZones,
        excludedParts: input.excludedParts ?? [],
        selectedEngine: input.selectedEngine ?? null,
        selectedTransmission: input.selectedTransmission ?? null,
        selectedDrivetrain: input.selectedDrivetrain ?? null,
        prisma: ctx.prisma,
      })

      if (ctx.user) {
        await ctx.prisma.calculation.create({
          data: {
            userId: ctx.user.id,
            generationId: input.generationId,
            totalPrice: result.totalPrice,
            damagedZones: input.damagedZones,
          },
        })

        logUsage(ctx.prisma, ctx.user.id, 'CALCULATE', {
          generationId: input.generationId,
          totalPrice: result.totalPrice,
          damagedZones: input.damagedZones,
        }).catch((err) => console.error('[USAGE_LOG] Failed:', err))
      }

      return result
    },
  })
)
