import { builder } from '../builder'

export interface PriceData {
  median: number
  min: number
  max: number
  count: number
  updatedAt: Date
}

export const PriceType = builder.objectRef<PriceData>('Price')

builder.objectType(PriceType, {
  fields: (t) => ({
    median: t.exposeInt('median'),
    min: t.exposeInt('min'),
    max: t.exposeInt('max'),
    count: t.exposeInt('count'),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (price) => price.updatedAt,
    }),
  }),
})
