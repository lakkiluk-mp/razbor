import { builder } from '../builder'
import { CalculationResultType } from '../types/calculation'
import { calculatorService } from '../../services/calculator.service'

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
      return calculatorService.calculate({
        generationId: input.generationId,
        damagedZones: input.damagedZones,
        excludedParts: input.excludedParts ?? [],
        selectedEngine: input.selectedEngine ?? null,
        selectedTransmission: input.selectedTransmission ?? null,
        selectedDrivetrain: input.selectedDrivetrain ?? null,
        prisma: ctx.prisma,
      })
    },
  })
)
