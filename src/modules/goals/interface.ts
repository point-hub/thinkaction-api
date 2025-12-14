export interface IGoalEntity {
  _id?: string
  smart?: string
  specific?: string
  measurable?: string
  achievable?: string
  relevant?: string
  time?: Date
  thumbnail_url?: string
  visibility?: 'public' | 'private' | 'supporters'
  status?: 'in-progress' | 'achieved' | 'failed'
  progress?: {
    _id: string
    goal_id: string
    caption: string
    media_url: string
    thumbnail_url: string
    created_at: Date
  }[]
  created_by_id?: string
  created_at?: Date
  updated_at?: Date
}
