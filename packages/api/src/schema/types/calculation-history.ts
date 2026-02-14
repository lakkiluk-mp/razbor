import { BodyType } from '@razbor/db'
import { builder } from '../builder'
import { BodyTypeEnum } from './enums'

export interface CalculationDetailPart {
  name: string
  category: string
  included: boolean
  isDamaged: boolean
  price: number
}

export interface CalculationDetails {
  parts: CalculationDetailPart[]
}

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
  details: CalculationDetails | null
}

const CalculationDetailPartType =
  builder.objectRef<CalculationDetailPart>('CalculationDetailPart')

builder.objectType(CalculationDetailPartType, {
  fields: (t) => ({
    name: t.exposeString('name'),
    category: t.exposeString('category'),
    included: t.exposeBoolean('included'),
    isDamaged: t.exposeBoolean('isDamaged'),
    price: t.exposeInt('price'),
  }),
})

const CalculationDetailsType =
  builder.objectRef<CalculationDetails>('CalculationDetails')

builder.objectType(CalculationDetailsType, {
  fields: (t) => ({
    parts: t.field({
      type: [CalculationDetailPartType],
      resolve: (parent) => parent.parts,
    }),
  }),
})

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
    details: t.field({
      type: CalculationDetailsType,
      nullable: true,
      resolve: (parent) => parent.details,
    }),
  }),
})
