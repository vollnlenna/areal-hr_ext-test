import { ref, computed } from 'vue'
import http from '../api/http'
import type { HrOperation, HrOperationSave } from '../entities/hrOperation'

export function useHrOperations() {
  const actualList = ref<HrOperation[]>([])
  const deletedList = ref<HrOperation[]>([])

  const loadOperations = async () => {
    const [actualRes, deletedRes] = await Promise.all([
      http.get<HrOperation[]>('/hr-operations'),
      http.get<HrOperation[]>('/hr-operations/deleted')
    ])
    actualList.value = actualRes.data
    deletedList.value = deletedRes.data
  }

  const saveOperation = async (payload: HrOperationSave) => {
    const body = {
      id_employee: payload.id_employee,
      id_department: payload.id_department,
      id_position: payload.id_position,
      salary: payload.salary,
      is_active: payload.is_active ?? true
    }

    if (payload.id_hr_operation) {
      await http.patch(`/hr-operations/${payload.id_hr_operation}`, body)
    } else {
      await http.post('/hr-operations', body)
    }
    await loadOperations()
  }

  const deleteOperation = async (id: number) => {
    await http.delete(`/hr-operations/${id}`)
    await loadOperations()
  }

  const restoreOperation = async (id: number) => {
    await http.patch(`/hr-operations/restore/${id}`)
    await loadOperations()
  }

  return {
    actualList: computed(() => actualList.value),
    deletedList: computed(() => deletedList.value),
    loadOperations,
    saveOperation,
    deleteOperation,
    restoreOperation
  }
}
