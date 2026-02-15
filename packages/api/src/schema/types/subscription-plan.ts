import { builder } from '../builder'

export interface SubscriptionPlanInfoData {
  plan: string
  price: number
  label: string
  days: number
  credits: number
}

export const SubscriptionPlanInfoType = builder.objectRef<SubscriptionPlanInfoData>('SubscriptionPlanInfo')

builder.objectType(SubscriptionPlanInfoType, {
  fields: (t) => ({
    plan: t.exposeString('plan'),
    price: t.exposeInt('price'),
    label: t.exposeString('label'),
    days: t.exposeInt('days'),
    credits: t.exposeInt('credits'),
  }),
})
