import { builder } from '../builder'
import { type SubscriptionInfoData, SubscriptionInfoType } from './subscription'

export interface UserProfileData {
  id: string
  firstName: string
  lastName: string | null
  username: string | null
  isPremium: boolean
  totalCalculations: number
  trialCredits: number
  subscriptionCredits: number
  totalCredits: number
  subscription: SubscriptionInfoData | null
}

export const UserProfileType = builder.objectRef<UserProfileData>('UserProfile')

builder.objectType(UserProfileType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName', { nullable: true }),
    username: t.exposeString('username', { nullable: true }),
    isPremium: t.exposeBoolean('isPremium'),
    totalCalculations: t.exposeInt('totalCalculations'),
    trialCredits: t.exposeInt('trialCredits'),
    subscriptionCredits: t.exposeInt('subscriptionCredits'),
    totalCredits: t.exposeInt('totalCredits'),
    subscription: t.field({
      type: SubscriptionInfoType,
      nullable: true,
      resolve: (parent) => parent.subscription,
    }),
  }),
})
