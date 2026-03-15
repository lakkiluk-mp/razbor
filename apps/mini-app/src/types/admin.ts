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

export interface AdminRegionCrawlStat {
  regionSlug: string
  regionName: string
  totalListings: number
  activeListings: number
  lastSeenAt: string | null
}

export interface AdminRegionCrawlStatsResponse {
  adminRegionCrawlStats: AdminRegionCrawlStat[]
}

export interface AdminMonitorSettings {
  freeSlotsClosed: boolean
  freeSlotsBlocked: boolean
  regionCrawlPaused: boolean
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

export interface AdminSetRegionCrawlPausedResponse {
  adminSetRegionCrawlPaused: AdminMonitorSettings
}

export interface AdminDailyStat {
  date: string
  newUsers: number
  calculations: number
  activeUsers: number
}

export interface AdminUserAnalytics {
  dailyStats: AdminDailyStat[]
  totals: {
    today: number
    week: number
    month: number
  }
}

export interface AdminUserAnalyticsResponse {
  adminUserAnalytics: AdminUserAnalytics
}
