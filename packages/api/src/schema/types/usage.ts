import { builder } from '../builder'

export interface UsageInfoData {
  freeRemaining: number
  freeResetAt: Date
  dailyLimit: number
}

export const UsageInfoType = builder.objectRef<UsageInfoData>('UsageInfo')

builder.objectType(UsageInfoType, {
  fields: (t) => ({
    freeRemaining: t.exposeInt('freeRemaining'),
    freeResetAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.freeResetAt,
    }),
    dailyLimit: t.exposeInt('dailyLimit'),
  }),
})
