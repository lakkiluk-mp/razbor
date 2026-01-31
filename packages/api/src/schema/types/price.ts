import { builder } from '../builder'

export interface PriceData {
  median: number
  min: number
  max: number
  count: number
  updatedAt: Date
  minPriceUrl: string | null
  maxPriceUrl: string | null
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
    minPriceUrl: t.string({ nullable: true, resolve: (price) => price.minPriceUrl }),
    maxPriceUrl: t.string({ nullable: true, resolve: (price) => price.maxPriceUrl }),
  }),
})
