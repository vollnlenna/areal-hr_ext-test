export interface Department {
  id_department: number
  name: string
  id_organization: number
  id_parent_department?: number | null
  comment?: string | null
  created_at: string
  updated_at?: string | null
  deleted_at?: string | null
}

export interface DepartmentSave {
  id_department?: number | null
  name?: string
  id_organization?: number | null
  id_parent_department?: number | null
  comment?: string | null
}
