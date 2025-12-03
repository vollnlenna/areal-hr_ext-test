export interface FileRecord {
  id_file: number
  file_name: string
  file_path: string
  created_at: string
  updated_at?: string | null
}

export interface FileUploadResponse {
  id_file: number
  file_name: string
  file_path: string
}
