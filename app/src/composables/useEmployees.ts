import { ref, computed } from 'vue'
import http from '../api/http'
import type { Employee, EmployeeSave } from '../entities/employee'

export function useEmployees() {
  const actualList = ref<Employee[]>([])
  const deletedList = ref<Employee[]>([])

  const loadEmployees = async () => {
    const [actualRes, deletedRes] = await Promise.all([
      http.get<Employee[]>('/employees'),
      http.get<Employee[]>('/employees/deleted')
    ])
    actualList.value = actualRes.data
    deletedList.value = deletedRes.data
  }

  const saveEmployee = async (payload: EmployeeSave) => {
    const { id_employee, ...body } = payload
    if (id_employee) {
      await http.patch(`/employees/${id_employee}`, body)
    } else {
      await http.post('/employees', body)
    }
    await loadEmployees()
  }

  const deleteEmployee = async (id: number) => {
    await http.delete(`/employees/${id}`)
    await loadEmployees()
  }

  const restoreEmployee = async (id: number) => {
    await http.patch(`/employees/restore/${id}`)
    await loadEmployees()
  }

  return {
    actualList: computed(() => actualList.value),
    deletedList: computed(() => deletedList.value),
    loadEmployees,
    saveEmployee,
    deleteEmployee,
    restoreEmployee
  }
}
