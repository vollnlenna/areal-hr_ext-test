export interface Position {
  id_position: number
  name: string
  deleted_at?: string | null
}

export interface PositionSave {
  id_position?: number | null
  name?: string
}
