import http from '../api/http'
import type { FileRecord, FileUploadResponse } from '../entities/file'

export function useFiles() {
  const uploadFile = async (file: File, fileName: string): Promise<FileUploadResponse> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_name', fileName)

    const response = await http.post<FileUploadResponse>('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return response.data
  }

  const deleteFile = async (fileId: number): Promise<void> => {
    await http.delete(`/files/${fileId}`)
  }

  const getFile = async (fileId: number): Promise<FileRecord> => {
    const response = await http.get<FileRecord>(`/files/${fileId}`)
    return response.data
  }

  const getFileUrl = (filePath: string): string => {
    return `/api/files/storage/${filePath}`
  }

  return {
    uploadFile,
    deleteFile,
    getFile,
    getFileUrl
  }
}
