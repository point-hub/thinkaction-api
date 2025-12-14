export interface INotificationEntity {
  _id?: string
  type?: string
  actor_id?: string
  recipient_id?: string
  message?: string
  is_read?: string
  entities?: {
    type: string
    type_id: string
  }[]
  created_at?: Date
}
