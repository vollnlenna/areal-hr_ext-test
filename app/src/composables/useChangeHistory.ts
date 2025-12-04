import { ref, computed } from 'vue'
import http from '../api/http'
import type { ChangeHistory, ChangeHistoryView } from '../entities/changeHistory'
import type { User } from '../entities/user'

const OBJECT_MAP = {
  id_organization: { name: 'Организация', plural: 'Организации' },
  id_department: { name: 'Отдел', plural: 'Отделы' },
  id_position: { name: 'Должность', plural: 'Должности' },
  id_employee: { name: 'Сотрудник', plural: 'Сотрудники' },
  id_hr_operation: { name: 'Кадровая операция', plural: 'Кадровые операции' },
} as const

const getObjectType = (record: ChangeHistory): string => {
  if (record.id_organization) return OBJECT_MAP.id_organization.name
  if (record.id_department) return OBJECT_MAP.id_department.name
  if (record.id_position) return OBJECT_MAP.id_position.name
  if (record.id_employee) return OBJECT_MAP.id_employee.name
  if (record.id_hr_operation) return OBJECT_MAP.id_hr_operation.name
  return 'Неизвестно'
}

const buildFullName = (u: User): string =>
  [u.last_name, u.first_name, u.middle_name ?? '']
    .filter(Boolean)
    .join(' ')
    .trim()

export function useChangeHistory() {
  const rawHistory = ref<ChangeHistory[]>([])
  const users = ref<Map<number, User & { fullName: string }>>(new Map())
  const loading = ref(false)

  const loadUsers = async () => {
    const res = await http.get<User[]>('/users')

    const list = res.data.map((u) => ({
      ...u,
      fullName: buildFullName(u),
    }))
    users.value = new Map(list.map((u) => [u.id_user, u]))
  }

  const loadHistory = async () => {
    loading.value = true
    try {
      const res = await http.get<ChangeHistory[]>('/change-history')
      rawHistory.value = res.data
    } finally {
      loading.value = false
    }
  }

  const processed = computed<ChangeHistoryView[]>(() =>
    rawHistory.value.map((record) => {
      const objectId =
        record.id_organization ??
        record.id_department ??
        record.id_position ??
        record.id_employee ??
        record.id_hr_operation ??
        null

      const user = users.value.get(record.id_user)

      return {
        ...record,
        objectType: getObjectType(record),
        objectId,
        userName: user?.fullName ?? 'Неизвестный пользователь',
      }
    })
  )

  return {
    historyList: processed,
    loadHistory,
    loadUsers,
    loading,
    OBJECT_MAP,
  }
}
