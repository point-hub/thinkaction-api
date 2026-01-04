export interface ICommentEntity {
  _id?: string
  goal_id?: string
  parent_id?: string
  comment?: string
  mentions?: {
    _id: string
    label: string
    link?: string
  }[]
  created_by_id?: string
  created_at?: Date
  updated_at?: Date
}
