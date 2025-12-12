import { ref } from 'vue'
import http from '../api/http'
import type { User, UserSave, Role } from '../entities/user'

export function useUsers() {
  const actualList = ref<User[]>([])
  const deletedList = ref<User[]>([])

  const roles = ref<Role[]>([])

  const loadRoles = async () => {
    const res = await http.get<Role[]>('/users/roles')
    roles.value = res.data
  }

  const getRoleName = (id_role: number | string) => {
    const id = Number(id_role)
    return roles.value.find(r => r.id === id)?.name || 'Неизвестно'
  }

  const loadUsers = async () => {
    const [actualRes, deletedRes] = await Promise.all([
      http.get<User[]>('/users'),
      http.get<User[]>('/users/deleted'),
    ])

    actualList.value = actualRes.data.map(attachFullName)
    deletedList.value = deletedRes.data.map(attachFullName)
  }

  const getUserById = async (id: number): Promise<User | null> => {
    const res = await http.get<User>(`/users/${id}`)
    const data = res.data
    return data ? attachFullName(data) : null
  }

  const saveUser = async (payload: UserSave) => {
    const { id_user, ...body } = payload

    if (id_user) {
      await http.patch(`/users/${id_user}`, body)
    } else {
      await http.post('/users', body)
    }

    await loadUsers()
  }

  const changePassword = async (id: number, password: string) => {
    await http.patch(`/users/${id}/password`, { password })
    await loadUsers()
  }

  const deleteUser = async (id: number) => {
    await http.delete(`/users/${id}`)
    await loadUsers()
  }

  const restoreUser = async (id: number) => {
    await http.patch(`/users/restore/${id}`)
    await loadUsers()
  }

  return {
    actualList,
    deletedList,
    roles,
    getRoleName,
    loadRoles,
    loadUsers,
    getUserById,
    saveUser,
    changePassword,
    deleteUser,
    restoreUser,
  }
}

function attachFullName(user: User): User {
  const fullName = `${user.last_name} ${user.first_name}${
    user.middle_name ? ` ${user.middle_name}` : ''
  }`
  return { ...user, fullName }
}
