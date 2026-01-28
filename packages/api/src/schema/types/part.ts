import type { PartCategory, SchematicZone } from '@razbor/db'
import { builder } from '../builder'
import { PartCategoryEnum } from './enums'
import type { PriceData } from './price'
import { PriceType } from './price'
import { SchematicZoneRef } from './schematic-zone'

builder.prismaObject('Part', {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    slug: t.exposeString('slug'),
    category: t.field({
      type: PartCategoryEnum,
      resolve: (part) => part.category,
    }),
    schematicZone: t.relation('schematicZone', { nullable: true }),
  }),
})

export interface PartWithPriceData {
  id: string
  name: string
  category: PartCategory
  schematicZone: SchematicZone | null
  price: PriceData | null
}

export const PartWithPriceType = builder.objectRef<PartWithPriceData>('PartWithPrice')

builder.objectType(PartWithPriceType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    category: t.field({
      type: PartCategoryEnum,
      resolve: (part) => part.category,
    }),
    schematicZone: t.field({
      type: SchematicZoneRef,
      nullable: true,
      resolve: (part) => part.schematicZone,
    }),
    price: t.field({
      type: PriceType,
      nullable: true,
      resolve: (part) => part.price,
    }),
  }),
})
