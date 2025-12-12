export interface Position {
  id_position: number
  name: string
  created_at: string
  updated_at?: string | null
  deleted_at?: string | null
}

export interface PositionSave {
  id_position?: number | null
  name?: string
}
