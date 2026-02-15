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
