import { builder } from '../builder'

export const BroadcastStatusEnum = builder.enumType('BroadcastStatus', {
  values: ['draft', 'sending', 'completed', 'failed', 'cancelled'] as const,
})

export interface BroadcastData {
  id: string
  message: string | null
  imageUrls: string[]
  status: 'draft' | 'sending' | 'completed' | 'failed' | 'cancelled'
  totalUsers: number
  sentCount: number
  failedCount: number
  createdAt: Date
  updatedAt: Date
}

export const BroadcastType = builder.objectRef<BroadcastData>('Broadcast')

builder.objectType(BroadcastType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    message: t.exposeString('message', { nullable: true }),
    imageUrls: t.exposeStringList('imageUrls'),
    status: t.field({
      type: BroadcastStatusEnum,
      resolve: (parent) => parent.status,
    }),
    totalUsers: t.exposeInt('totalUsers'),
    sentCount: t.exposeInt('sentCount'),
    failedCount: t.exposeInt('failedCount'),
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

export interface BroadcastsListData {
  items: BroadcastData[]
  totalCount: number
}

export const BroadcastsListType =
  builder.objectRef<BroadcastsListData>('BroadcastsList')

builder.objectType(BroadcastsListType, {
  fields: (t) => ({
    items: t.field({ type: [BroadcastType], resolve: (parent) => parent.items }),
    totalCount: t.exposeInt('totalCount'),
  }),
})
