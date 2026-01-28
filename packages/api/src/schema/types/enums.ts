import { BodyType, PartCategory, ZoneType } from '@razbor/db'
import { builder } from '../builder'

export const BodyTypeEnum = builder.enumType(BodyType, {
  name: 'BodyType',
})

export const PartCategoryEnum = builder.enumType(PartCategory, {
  name: 'PartCategory',
})

export const ZoneTypeEnum = builder.enumType(ZoneType, {
  name: 'ZoneType',
})
