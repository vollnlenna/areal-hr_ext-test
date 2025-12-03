export interface Organization {
  id_organization: number
  name: string
  comment?: string | null
  deleted_at?: string | null
}

export interface OrganizationSave {
  id_organization?: number | null
  name?: string
  comment?: string | null
}
