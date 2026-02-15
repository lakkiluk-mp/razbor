import { builder } from '../builder'

export interface UsageInfoData {
  trialCredits: number
  subscriptionCredits: number
  totalCredits: number
  hasActiveSubscription: boolean
}

export const UsageInfoType = builder.objectRef<UsageInfoData>('UsageInfo')

builder.objectType(UsageInfoType, {
  fields: (t) => ({
    trialCredits: t.exposeInt('trialCredits'),
    subscriptionCredits: t.exposeInt('subscriptionCredits'),
    totalCredits: t.exposeInt('totalCredits'),
    hasActiveSubscription: t.exposeBoolean('hasActiveSubscription'),
  }),
})
