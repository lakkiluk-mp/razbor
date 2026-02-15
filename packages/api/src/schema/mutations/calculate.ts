import { GraphQLError } from 'graphql'
import { builder } from '../builder'
import { CalculationResultType } from '../types/calculation'
import { calculatorService } from '../../services/calculator.service'
import { useCredit, refundCredit } from '../../services/credits.service'
import { logUsage } from '../../services/usage.service'

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
      if (!ctx.user) {
        throw new GraphQLError('Требуется авторизация')
      }

      const creditSource = await useCredit(ctx.prisma, ctx.user.id)

      let result
      try {
        result = await calculatorService.calculate({
          generationId: input.generationId,
          damagedZones: input.damagedZones,
          excludedParts: input.excludedParts ?? [],
          selectedEngine: input.selectedEngine ?? null,
          selectedTransmission: input.selectedTransmission ?? null,
          selectedDrivetrain: input.selectedDrivetrain ?? null,
          prisma: ctx.prisma,
        })
      } catch (err) {
        await refundCredit(ctx.prisma, ctx.user.id, creditSource).catch((refundErr) =>
          console.error('[REFUND] Failed to refund credit:', refundErr)
        )
        throw err
      }

      await ctx.prisma.calculation.create({
        data: {
          userId: ctx.user.id,
          generationId: input.generationId,
          totalPrice: result.totalPrice,
          damagedZones: input.damagedZones,
          details: {
            parts: result.parts.map((p) => ({
              name: p.part.name,
              category: p.part.category,
              price: p.price,
              included: p.included,
              isDamaged: p.isDamaged,
            })),
          },
        },
      })

      logUsage(ctx.prisma, ctx.user.id, 'CALCULATE', {
        generationId: input.generationId,
        totalPrice: result.totalPrice,
        damagedZones: input.damagedZones,
      }).catch((err) => console.error('[USAGE_LOG] Failed:', err))

      return result
    },
  })
)
