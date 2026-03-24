import { builder } from '../builder'

builder.prismaObject('AdminSearchWatch', {
  fields: (t) => ({
    id: t.exposeID('id'),
    label: t.exposeString('label'),
    url: t.exposeString('url'),
    isActive: t.exposeBoolean('isActive'),
    notificationsSent: t.exposeInt('notificationsSent'),
    lastNotifiedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (parent) => parent.lastNotifiedAt,
    }),
    lastCrawledAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (parent) => parent.lastCrawledAt,
    }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
  }),
})

export const CreateAdminSearchWatchInput = builder.inputType('CreateAdminSearchWatchInput', {
  fields: (t) => ({
    label: t.string({ required: true }),
    url: t.string({ required: true }),
  }),
})
