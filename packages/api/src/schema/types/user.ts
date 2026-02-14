import { builder } from '../builder'

export interface UserProfileData {
  id: string
  firstName: string
  lastName: string | null
  username: string | null
  isPremium: boolean
  dailyLimit: number
  totalCalculations: number
  freeRemaining: number
  freeResetAt: Date
}

export const UserProfileType = builder.objectRef<UserProfileData>('UserProfile')

builder.objectType(UserProfileType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName', { nullable: true }),
    username: t.exposeString('username', { nullable: true }),
    isPremium: t.exposeBoolean('isPremium'),
    dailyLimit: t.exposeInt('dailyLimit'),
    totalCalculations: t.exposeInt('totalCalculations'),
    freeRemaining: t.exposeInt('freeRemaining'),
    freeResetAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.freeResetAt,
    }),
  }),
})
