import { ref, computed } from 'vue'
import http from '../api/http'
import type { Organization, OrganizationSave } from '../entities/organization'

export function useOrganizations() {
  const actualList = ref<Organization[]>([])
  const deletedList = ref<Organization[]>([])

  const loadOrganizations = async () => {
    const [actualRes, deletedRes] = await Promise.all([
      http.get<Organization[]>('/organizations'),
      http.get<Organization[]>('/organizations/deleted')
    ])
    actualList.value = actualRes.data
    deletedList.value = deletedRes.data
  }

  const loadAllOrganizations = async () => {
    const [orgRes, orgDeletedRes] = await Promise.all([
      http.get<Organization[]>('/organizations'),
      http.get<Organization[]>('/organizations/deleted')
    ])
    return [...orgRes.data, ...orgDeletedRes.data]
  }

  const saveOrganization = async (payload: OrganizationSave) => {
    const body = {
      name: payload.name,
      comment: payload.comment ?? null
    }
    if (payload.id_organization) {
      await http.patch(`/organizations/${payload.id_organization}`, body)
    } else {
      await http.post('/organizations', body)
    }
    await loadOrganizations()
  }

  const deleteOrganization = async (id: number) => {
    await http.delete(`/organizations/${id}`)
    await loadOrganizations()
  }

  const restoreOrganization = async (id: number) => {
    await http.patch(`/organizations/restore/${id}`)
    await loadOrganizations()
  }

  return {
    actualList: computed(() => actualList.value),
    deletedList: computed(() => deletedList.value),
    loadOrganizations,
    loadAllOrganizations,
    saveOrganization,
    deleteOrganization,
    restoreOrganization
  }
}
