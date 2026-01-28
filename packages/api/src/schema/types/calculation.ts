import { builder } from '../builder'
import type { PartWithPriceData } from './part'
import { PartWithPriceType } from './part'

export interface CalculationPartData {
  part: PartWithPriceData
  included: boolean
  isDamaged: boolean
  price: number
}

export interface CalculationResultData {
  totalPrice: number
  parts: CalculationPartData[]
}

export const CalculationPartType = builder.objectRef<CalculationPartData>('CalculationPart')

builder.objectType(CalculationPartType, {
  fields: (t) => ({
    part: t.field({
      type: PartWithPriceType,
      resolve: (parent) => parent.part,
    }),
    included: t.exposeBoolean('included'),
    isDamaged: t.exposeBoolean('isDamaged'),
    price: t.exposeInt('price'),
  }),
})

export const CalculationResultType = builder.objectRef<CalculationResultData>('CalculationResult')

builder.objectType(CalculationResultType, {
  fields: (t) => ({
    totalPrice: t.exposeInt('totalPrice'),
    parts: t.field({
      type: [CalculationPartType],
      resolve: (parent) => parent.parts,
    }),
  }),
})
