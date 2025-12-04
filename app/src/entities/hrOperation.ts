export interface HrOperation {
  id_hr_operation: number
  id_employee: number
  id_department: number
  id_position: number
  is_active: boolean
  salary: number
  created_at: Date
  updated_at?: Date | null
  deleted_at?: Date | null
}

export interface HrOperationSave {
  id_hr_operation?: number | null
  id_employee?: number
  id_department?: number
  id_position?: number
  salary?: number
  is_active?: boolean
}

export interface HrOperationView extends HrOperation {
  employeeName: string
  organizationName: string
  departmentName: string
  positionName: string
}
