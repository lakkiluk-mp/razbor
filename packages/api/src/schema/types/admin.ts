import { SubscriptionPlan, SubscriptionStatus } from '@razbor/db'
import { builder } from '../builder'
import { SubscriptionPlanEnum, SubscriptionStatusEnum } from './subscription'

export interface AdminStatsData {
  totalUsers: number
  totalCalculations: number
  totalRevenue: number
  activeSubscriptions: number
  newUsersToday: number
  calculationsToday: number
}

export const AdminStatsType = builder.objectRef<AdminStatsData>('AdminStats')

builder.objectType(AdminStatsType, {
  fields: (t) => ({
    totalUsers: t.exposeInt('totalUsers'),
    totalCalculations: t.exposeInt('totalCalculations'),
    totalRevenue: t.exposeInt('totalRevenue'),
    activeSubscriptions: t.exposeInt('activeSubscriptions'),
    newUsersToday: t.exposeInt('newUsersToday'),
    calculationsToday: t.exposeInt('calculationsToday'),
  }),
})

export interface AdminUserData {
  id: string
  telegramId: bigint
  firstName: string
  lastName: string | null
  username: string | null
  isPremium: boolean
  trialCredits: number
  createdAt: Date
  totalCalculations: number
  totalPayments: number
  activeSubscription: boolean
}

export const AdminUserType = builder.objectRef<AdminUserData>('AdminUser')

builder.objectType(AdminUserType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    telegramId: t.string({ resolve: (parent) => parent.telegramId.toString() }),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName', { nullable: true }),
    username: t.exposeString('username', { nullable: true }),
    isPremium: t.exposeBoolean('isPremium'),
    trialCredits: t.exposeInt('trialCredits'),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
    totalCalculations: t.exposeInt('totalCalculations'),
    totalPayments: t.exposeInt('totalPayments'),
    activeSubscription: t.exposeBoolean('activeSubscription'),
  }),
})

export interface AdminPaymentData {
  id: string
  userId: string
  yooPaymentId: string
  amount: number
  currency: string
  status: string
  isRecurring: boolean
  createdAt: Date
  userName: string
  userUsername: string | null
}

export const AdminPaymentType = builder.objectRef<AdminPaymentData>('AdminPayment')

builder.objectType(AdminPaymentType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeString('userId'),
    yooPaymentId: t.exposeString('yooPaymentId'),
    amount: t.exposeInt('amount'),
    currency: t.exposeString('currency'),
    status: t.exposeString('status'),
    isRecurring: t.exposeBoolean('isRecurring'),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
    userName: t.exposeString('userName'),
    userUsername: t.exposeString('userUsername', { nullable: true }),
  }),
})

export interface AdminSubscriptionData {
  id: string
  userId: string
  plan: SubscriptionPlan
  status: SubscriptionStatus
  credits: number
  creditsTotal: number
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  createdAt: Date
  userName: string
  userUsername: string | null
}

export const AdminSubscriptionType =
  builder.objectRef<AdminSubscriptionData>('AdminSubscription')

builder.objectType(AdminSubscriptionType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeString('userId'),
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
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
    userName: t.exposeString('userName'),
    userUsername: t.exposeString('userUsername', { nullable: true }),
  }),
})

export interface AdminCalculationData {
  id: string
  userId: string
  totalPrice: number
  damagedZonesCount: number
  createdAt: Date
  userName: string
  userUsername: string | null
  brandName: string
  modelName: string
  generationName: string
}

export const AdminCalculationType =
  builder.objectRef<AdminCalculationData>('AdminCalculation')

builder.objectType(AdminCalculationType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeString('userId'),
    totalPrice: t.exposeInt('totalPrice'),
    damagedZonesCount: t.exposeInt('damagedZonesCount'),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
    userName: t.exposeString('userName'),
    userUsername: t.exposeString('userUsername', { nullable: true }),
    brandName: t.exposeString('brandName'),
    modelName: t.exposeString('modelName'),
    generationName: t.exposeString('generationName'),
  }),
})

export interface AdminUsersListData {
  items: AdminUserData[]
  totalCount: number
}

export const AdminUsersListType =
  builder.objectRef<AdminUsersListData>('AdminUsersList')

builder.objectType(AdminUsersListType, {
  fields: (t) => ({
    items: t.field({ type: [AdminUserType], resolve: (parent) => parent.items }),
    totalCount: t.exposeInt('totalCount'),
  }),
})

export interface AdminPaymentsListData {
  items: AdminPaymentData[]
  totalCount: number
}

export const AdminPaymentsListType =
  builder.objectRef<AdminPaymentsListData>('AdminPaymentsList')

builder.objectType(AdminPaymentsListType, {
  fields: (t) => ({
    items: t.field({ type: [AdminPaymentType], resolve: (parent) => parent.items }),
    totalCount: t.exposeInt('totalCount'),
  }),
})

export interface AdminSubscriptionsListData {
  items: AdminSubscriptionData[]
  totalCount: number
}

export const AdminSubscriptionsListType =
  builder.objectRef<AdminSubscriptionsListData>('AdminSubscriptionsList')

builder.objectType(AdminSubscriptionsListType, {
  fields: (t) => ({
    items: t.field({
      type: [AdminSubscriptionType],
      resolve: (parent) => parent.items,
    }),
    totalCount: t.exposeInt('totalCount'),
  }),
})

export interface AdminCalculationsListData {
  items: AdminCalculationData[]
  totalCount: number
}

export const AdminCalculationsListType =
  builder.objectRef<AdminCalculationsListData>('AdminCalculationsList')

builder.objectType(AdminCalculationsListType, {
  fields: (t) => ({
    items: t.field({
      type: [AdminCalculationType],
      resolve: (parent) => parent.items,
    }),
    totalCount: t.exposeInt('totalCount'),
  }),
})

export interface AdminUserDetailData extends AdminUserData {
  calculations: AdminCalculationData[]
  yooPayments: AdminPaymentData[]
  subscriptions: AdminSubscriptionData[]
  recentUsageLogs: AdminUsageLogData[]
}

export interface AdminUsageLogData {
  id: string
  action: string
  metadata: unknown
  createdAt: Date
}

export const AdminUsageLogType = builder.objectRef<AdminUsageLogData>('AdminUsageLog')

builder.objectType(AdminUsageLogType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    action: t.exposeString('action'),
    metadata: t.string({
      nullable: true,
      resolve: (parent) => (parent.metadata ? JSON.stringify(parent.metadata) : null),
    }),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
  }),
})

export const AdminUserDetailType =
  builder.objectRef<AdminUserDetailData>('AdminUserDetail')

builder.objectType(AdminUserDetailType, {
  fields: (t) => ({
    id: t.exposeID('id'),
    telegramId: t.string({ resolve: (parent) => parent.telegramId.toString() }),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName', { nullable: true }),
    username: t.exposeString('username', { nullable: true }),
    isPremium: t.exposeBoolean('isPremium'),
    trialCredits: t.exposeInt('trialCredits'),
    createdAt: t.field({
      type: 'DateTime',
      resolve: (parent) => parent.createdAt,
    }),
    totalCalculations: t.exposeInt('totalCalculations'),
    totalPayments: t.exposeInt('totalPayments'),
    activeSubscription: t.exposeBoolean('activeSubscription'),
    calculations: t.field({
      type: [AdminCalculationType],
      resolve: (parent) => parent.calculations,
    }),
    yooPayments: t.field({
      type: [AdminPaymentType],
      resolve: (parent) => parent.yooPayments,
    }),
    subscriptions: t.field({
      type: [AdminSubscriptionType],
      resolve: (parent) => parent.subscriptions,
    }),
    recentUsageLogs: t.field({
      type: [AdminUsageLogType],
      resolve: (parent) => parent.recentUsageLogs,
    }),
  }),
})
