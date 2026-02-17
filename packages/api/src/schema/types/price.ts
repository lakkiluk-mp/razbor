import { builder } from '../builder'

export interface SourcePriceData {
  source: string
  min: number
  max: number
  minPriceUrl: string | null
  maxPriceUrl: string | null
  searchUrl: string | null
  sampleSize: number
}

export interface PriceData {
  median: number
  min: number
  max: number
  count: number
  updatedAt: Date
  minPriceUrl: string | null
  maxPriceUrl: string | null
  medianPriceUrl: string | null
  sources: SourcePriceData[]
}

export const SourcePriceType = builder.objectRef<SourcePriceData>('SourcePrice')

builder.objectType(SourcePriceType, {
  fields: (t) => ({
    source: t.exposeString('source'),
    min: t.exposeInt('min'),
    max: t.exposeInt('max'),
    minPriceUrl: t.string({ nullable: true, resolve: (sp) => sp.minPriceUrl }),
    maxPriceUrl: t.string({ nullable: true, resolve: (sp) => sp.maxPriceUrl }),
    searchUrl: t.string({ nullable: true, resolve: (sp) => sp.searchUrl }),
    sampleSize: t.exposeInt('sampleSize'),
  }),
})

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
    medianPriceUrl: t.string({ nullable: true, resolve: (price) => price.medianPriceUrl }),
    sources: t.field({
      type: [SourcePriceType],
      resolve: (price) => price.sources,
    }),
  }),
})
