import { SubscriptionPlan, SubscriptionStatus } from '@razbor/db'
import { builder } from '../builder'

export const SubscriptionPlanEnum = builder.enumType(SubscriptionPlan, {
  name: 'SubscriptionPlan',
})

export const SubscriptionStatusEnum = builder.enumType(SubscriptionStatus, {
  name: 'SubscriptionStatus',
})

export interface SubscriptionInfoData {
  id: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  credits: number
  creditsTotal: number
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
}

export const SubscriptionInfoType = builder.objectRef<SubscriptionInfoData>('SubscriptionInfo')

builder.objectType(SubscriptionInfoType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    plan: t.field({
      type: SubscriptionPlanEnum,
      resolve: (parent) => parent.plan,
    }),
    status: t.field({
      type: SubscriptionStatusEnum,
      resolve: (parent) => parent.status,
    }),
    credits: t.exposeInt('credits'),
    creditsTotal: t.exposeInt('creditsTotal'),
    currentPeriodStart: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.currentPeriodStart,
    }),
    currentPeriodEnd: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.currentPeriodEnd,
    }),
    cancelAtPeriodEnd: t.exposeBoolean('cancelAtPeriodEnd'),
    daysRemaining: t.int({
      resolve: (parent) =>
        Math.max(0, Math.ceil((new Date(parent.currentPeriodEnd).getTime() - Date.now()) / (24 * 60 * 60 * 1000))),
    }),
  }),
})
