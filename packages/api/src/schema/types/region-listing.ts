import { builder } from '../builder'

builder.prismaObject('MonitorListing', {
  name: 'RegionListing',
  fields: (t) => ({
    id: t.exposeID('id'),
    extId: t.exposeString('extId'),
    title: t.exposeString('title'),
    brand: t.exposeString('brand'),
    model: t.exposeString('model'),
    engineVolume: t.exposeString('engineVolume'),
    transmission: t.exposeString('transmission'),
    price: t.exposeInt('price'),
    year: t.exposeInt('year', { nullable: true }),
    url: t.exposeString('url'),
    city: t.exposeString('city'),
    imageUrl: t.exposeString('imageUrl'),
    publishedAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.publishedAt,
    }),
    sellerType: t.exposeString('sellerType'),
    mileage: t.exposeInt('mileage', { nullable: true }),
    isDamaged: t.exposeBoolean('isDamaged'),
    isActive: t.exposeBoolean('isActive'),
    generationId: t.exposeString('generationId', { nullable: true }),
    estimateMin: t.exposeInt('estimateMin', { nullable: true }),
    estimateMax: t.exposeInt('estimateMax', { nullable: true }),
    estimateAvg: t.exposeInt('estimateAvg', { nullable: true }),
    estimateExact: t.exposeBoolean('estimateExact'),
    profit: t.exposeInt('profit', { nullable: true }),
    regionSlug: t.exposeString('regionSlug'),
    configGroups: t.exposeString('configGroups'),
    lastSeenAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.lastSeenAt,
    }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
    profitPercent: t.float({
      nullable: true,
      resolve: (parent) => {
        if (parent.estimateAvg == null || parent.estimateAvg <= 0) return null
        if (parent.price <= 0) return null
        const result = ((parent.estimateAvg - parent.price) / parent.price) * 100
        return Math.round(result * 10) / 10
      },
    }),
  }),
})

export const MonitorRegionType = builder.objectType(
  builder.objectRef<{ name: string; slug: string }>('MonitorRegion'),
  {
    fields: (t) => ({
      name: t.exposeString('name'),
      slug: t.exposeString('slug'),
      enabled: t.boolean({
        resolve: () => true,
      }),
    }),
  },
)

export const RegionListingSortByEnum = builder.enumType('RegionListingSortBy', {
  values: {
    DATE_DESC: { value: 'DATE_DESC' },
    PROFIT_DESC: { value: 'PROFIT_DESC' },
    PRICE_ASC: { value: 'PRICE_ASC' },
    PRICE_DESC: { value: 'PRICE_DESC' },
  } as const,
})
