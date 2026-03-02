export type BroadcastStatus = 'draft' | 'sending' | 'completed' | 'failed' | 'cancelled'

export interface Broadcast {
  id: string
  message: string | null
  imageUrls: string[]
  status: BroadcastStatus
  totalUsers: number
  sentCount: number
  failedCount: number
  createdAt: string
}

export interface AdminBroadcastsResponse {
  adminBroadcasts: {
    items: Broadcast[]
    totalCount: number
  }
}

export interface CreateBroadcastResponse {
  createBroadcast: Broadcast
}

export interface SendBroadcastResponse {
  sendBroadcast: Broadcast
}

export interface CancelBroadcastResponse {
  cancelBroadcast: Broadcast
}
