import { builder } from '../builder'

builder.prismaObject('MonitorSubscription', {
  fields: (t) => ({
    id: t.exposeID('id'),
    label: t.exposeString('label'),
    brandSlug: t.exposeString('brandSlug'),
    modelSlug: t.exposeString('modelSlug'),
    city: t.exposeString('city', { nullable: true }),
    priceMin: t.exposeInt('priceMin', { nullable: true }),
    priceMax: t.exposeInt('priceMax', { nullable: true }),
    yearMin: t.exposeInt('yearMin', { nullable: true }),
    yearMax: t.exposeInt('yearMax', { nullable: true }),
    mileageMax: t.exposeInt('mileageMax', { nullable: true }),
    isActive: t.exposeBoolean('isActive'),
    notificationsSent: t.exposeInt('notificationsSent'),
    lastNotifiedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (parent) => parent.lastNotifiedAt,
    }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
    updatedAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.updatedAt,
    }),
  }),
})

export const CreateMonitorSubscriptionInput = builder.inputType('CreateMonitorSubscriptionInput', {
  fields: (t) => ({
    label: t.string({ required: true }),
    brandSlug: t.string({ required: true }),
    modelSlug: t.string({ required: true }),
    city: t.string(),
    priceMin: t.int(),
    priceMax: t.int(),
    yearMin: t.int(),
    yearMax: t.int(),
    mileageMax: t.int(),
  }),
})

export const UpdateMonitorSubscriptionInput = builder.inputType('UpdateMonitorSubscriptionInput', {
  fields: (t) => ({
    label: t.string(),
    isActive: t.boolean(),
    city: t.string(),
    priceMin: t.int(),
    priceMax: t.int(),
    yearMin: t.int(),
    yearMax: t.int(),
    mileageMax: t.int(),
  }),
})
