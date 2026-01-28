import { builder } from '../builder'
import { ZoneTypeEnum } from './enums'

export const SchematicZoneRef = builder.prismaObject('SchematicZone', {
  fields: (t) => ({
    id: t.exposeID('id'),
    code: t.exposeString('code'),
    name: t.exposeString('name'),
    type: t.field({
      type: ZoneTypeEnum,
      resolve: (zone) => zone.zoneType,
    }),
  }),
})
