import { builder } from '../builder'

export interface AdminMonitorStatsData {
  totalMonitorUsers: number
  totalSubscriptions: number
  activeSubscriptions: number
  totalNotificationsSent: number
  uniqueGroups: number
}

export const AdminMonitorStatsType =
  builder.objectRef<AdminMonitorStatsData>('AdminMonitorStats')

builder.objectType(AdminMonitorStatsType, {
  fields: (t) => ({
    totalMonitorUsers: t.exposeInt('totalMonitorUsers'),
    totalSubscriptions: t.exposeInt('totalSubscriptions'),
    activeSubscriptions: t.exposeInt('activeSubscriptions'),
    totalNotificationsSent: t.exposeInt('totalNotificationsSent'),
    uniqueGroups: t.exposeInt('uniqueGroups'),
  }),
})

export interface AdminMonitorSubscriptionItemData {
  id: string
  label: string
  brandSlug: string
  modelSlug: string
  city: string | null
  priceMin: number | null
  priceMax: number | null
  yearMin: number | null
  yearMax: number | null
  mileageMax: number | null
  searchRadius: number | null
  isActive: boolean
  notificationsSent: number
  lastNotifiedAt: Date | null
  createdAt: Date
  userId: string
  userFirstName: string
  userUsername: string | null
  userTelegramId: string
}

export const AdminMonitorSubscriptionItemType =
  builder.objectRef<AdminMonitorSubscriptionItemData>('AdminMonitorSubscriptionItem')

builder.objectType(AdminMonitorSubscriptionItemType, {
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
    searchRadius: t.exposeInt('searchRadius', { nullable: true }),
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
    userId: t.exposeString('userId'),
    userFirstName: t.exposeString('userFirstName'),
    userUsername: t.exposeString('userUsername', { nullable: true }),
    userTelegramId: t.exposeString('userTelegramId'),
  }),
})

export interface AdminMonitorLogItemData {
  id: string
  type: string
  level: string
  brandSlug: string | null
  modelSlug: string | null
  message: string
  meta: unknown
  createdAt: Date
}

export const AdminMonitorLogItemType =
  builder.objectRef<AdminMonitorLogItemData>('AdminMonitorLogItem')

builder.objectType(AdminMonitorLogItemType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    type: t.exposeString('type'),
    level: t.exposeString('level'),
    brandSlug: t.exposeString('brandSlug', { nullable: true }),
    modelSlug: t.exposeString('modelSlug', { nullable: true }),
    message: t.exposeString('message'),
    meta: t.string({
      nullable: true,
      resolve: (parent) => (parent.meta ? JSON.stringify(parent.meta) : null),
    }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
  }),
})

export interface AdminMonitorSubscriptionsListData {
  items: AdminMonitorSubscriptionItemData[]
  totalCount: number
}

export const AdminMonitorSubscriptionsListType =
  builder.objectRef<AdminMonitorSubscriptionsListData>('AdminMonitorSubscriptionsList')

builder.objectType(AdminMonitorSubscriptionsListType, {
  fields: (t) => ({
    items: t.field({
      type: [AdminMonitorSubscriptionItemType],
      resolve: (parent) => parent.items,
    }),
    totalCount: t.exposeInt('totalCount'),
  }),
})

export interface AdminMonitorLogsListData {
  items: AdminMonitorLogItemData[]
  totalCount: number
}

export const AdminMonitorLogsListType =
  builder.objectRef<AdminMonitorLogsListData>('AdminMonitorLogsList')

builder.objectType(AdminMonitorLogsListType, {
  fields: (t) => ({
    items: t.field({
      type: [AdminMonitorLogItemType],
      resolve: (parent) => parent.items,
    }),
    totalCount: t.exposeInt('totalCount'),
  }),
})

export interface AdminMonitorSettingsData {
  freeSlotsClosed: boolean
  freeSlotsBlocked: boolean
}

export const AdminMonitorSettingsType =
  builder.objectRef<AdminMonitorSettingsData>('AdminMonitorSettings')

builder.objectType(AdminMonitorSettingsType, {
  fields: (t) => ({
    freeSlotsClosed: t.exposeBoolean('freeSlotsClosed'),
    freeSlotsBlocked: t.exposeBoolean('freeSlotsBlocked'),
  }),
})

export interface AdminStopFreeSlotsResultData {
  settings: AdminMonitorSettingsData
  deactivatedCount: number
}

export const AdminStopFreeSlotsResultType =
  builder.objectRef<AdminStopFreeSlotsResultData>('AdminStopFreeSlotsResult')

builder.objectType(AdminStopFreeSlotsResultType, {
  fields: (t) => ({
    settings: t.field({
      type: AdminMonitorSettingsType,
      resolve: (parent) => parent.settings,
    }),
    deactivatedCount: t.exposeInt('deactivatedCount'),
  }),
})
