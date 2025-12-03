export interface Employee {
  id_employee: number
  last_name: string
  first_name: string
  middle_name?: string | null
  birth_date: string
  passport_data: string
  registration_address: string
  created_at: string
  updated_at?: string | null
  deleted_at?: string | null
}

export interface EmployeeSave {
  id_employee?: number | null
  last_name?: string
  first_name?: string
  middle_name?: string | null
  birth_date?: string
  passport_data?: string
  registration_address?: string
}

export interface PassportScan {
  id_passport_scan: number
  id_employee: number
  id_file: number
  file_name: string
  file_path: string
}
