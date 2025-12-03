import { ref, computed } from 'vue'
import http from '../api/http'
import type { Department, DepartmentSave } from '../entities/department'

export function useDepartments() {
  const actualList = ref<Department[]>([])
  const deletedList = ref<Department[]>([])

  const loadDepartments = async () => {
    const [actualRes, deletedRes] = await Promise.all([
      http.get<Department[]>('/departments'),
      http.get<Department[]>('/departments/deleted')
    ])
    actualList.value = actualRes.data
    deletedList.value = deletedRes.data
  }

  const saveDepartment = async (payload: DepartmentSave) => {
    const body = {
      name: payload.name,
      id_organization: payload.id_organization ?? null,
      id_parent_department: payload.id_parent_department ?? null,
      comment: payload.comment ?? null
    }
    if (payload.id_department) {
      await http.patch(`/departments/${payload.id_department}`, body)
    } else {
      await http.post('/departments', body)
    }
    await loadDepartments()
  }

  const deleteDepartment = async (id: number) => {
    await http.delete(`/departments/${id}`)
    await loadDepartments()
  }

  const restoreDepartment = async (id: number) => {
    await http.patch(`/departments/restore/${id}`)
    await loadDepartments()
  }

  const addSubDepartment = async (name: string, parentId: number, organizationId: number) => {
    await http.post('/departments', {
      name,
      id_organization: organizationId,
      id_parent_department: parentId,
      comment: null
    })
    await loadDepartments()
  }

  const renameSubDepartment = async (id: number, name: string, organizationId: number, parentId?: number | null) => {
    await http.patch(`/departments/${id}`, {
      name,
      id_organization: organizationId,
      id_parent_department: parentId ?? null
    })
    await loadDepartments()
  }

  return {
    actualList: computed(() => actualList.value),
    deletedList: computed(() => deletedList.value),
    loadDepartments,
    saveDepartment,
    deleteDepartment,
    restoreDepartment,
    addSubDepartment,
    renameSubDepartment
  }
}
