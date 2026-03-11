export interface AdminStatsResponse {
  adminStats: {
    totalUsers: number
    totalCalculations: number
    totalRevenue: number
    activeSubscriptions: number
    newUsersToday: number
    calculationsToday: number
  }
}

export interface AdminMonitorStats {
  totalMonitorUsers: number
  totalSubscriptions: number
  activeSubscriptions: number
  totalNotificationsSent: number
  uniqueGroups: number
}

export interface AdminMonitorStatsResponse {
  adminMonitorStats: AdminMonitorStats
}

export interface AdminMonitorSubscriptionItem {
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
  isActive: boolean
  notificationsSent: number
  lastNotifiedAt: string | null
  createdAt: string
  userId: string
  userFirstName: string | null
  userUsername: string | null
  userTelegramId: string
}

export interface AdminMonitorSubscriptionsResponse {
  adminMonitorSubscriptions: {
    items: AdminMonitorSubscriptionItem[]
    totalCount: number
  }
}

export interface AdminMonitorLogItem {
  id: string
  type: string
  level: string
  brandSlug: string | null
  modelSlug: string | null
  message: string
  meta: string | null
  createdAt: string
}

export interface AdminMonitorLogsResponse {
  adminMonitorLogs: {
    items: AdminMonitorLogItem[]
    totalCount: number
  }
}

export interface AdminMonitorSettings {
  freeSlotsClosed: boolean
  freeSlotsBlocked: boolean
}

export interface AdminMonitorSettingsResponse {
  adminMonitorSettings: AdminMonitorSettings
}

export interface AdminSetFreeSlotsClosed {
  adminSetFreeSlotsClosed: AdminMonitorSettings
}

export interface AdminStopFreeSlotsResponse {
  adminStopFreeSlots: {
    deactivatedCount: number
    settings: AdminMonitorSettings
  }
}

export interface AdminResumeFreeSlotsResponse {
  adminResumeFreeSlots: AdminMonitorSettings
}

export interface AdminToggleMonitorSubscriptionResponse {
  adminToggleMonitorSubscription: boolean
}
