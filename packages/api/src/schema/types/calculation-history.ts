import { BodyType } from '@razbor/db'
import { builder } from '../builder'
import { BodyTypeEnum } from './enums'

export interface CalculationHistoryItemData {
  id: string
  totalPrice: number
  damagedZonesCount: number
  createdAt: Date
  brandName: string
  brandSlug: string
  modelName: string
  generationName: string
  bodyType: BodyType
}

export const CalculationHistoryItemType =
  builder.objectRef<CalculationHistoryItemData>('CalculationHistoryItem')

builder.objectType(CalculationHistoryItemType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    totalPrice: t.exposeInt('totalPrice'),
    damagedZonesCount: t.exposeInt('damagedZonesCount'),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
    brandName: t.exposeString('brandName'),
    brandSlug: t.exposeString('brandSlug'),
    modelName: t.exposeString('modelName'),
    generationName: t.exposeString('generationName'),
    bodyType: t.field({
      type: BodyTypeEnum,
      resolve: (parent) => parent.bodyType,
    }),
  }),
})
