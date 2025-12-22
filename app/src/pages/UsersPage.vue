<template>
  <div class="page">
    <div class="search-row top">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по ФИО пользователя..."
        class="search-input"
      />

      <select v-model="roleFilter" class="role-select">
        <option value="all">Все пользователи</option>
        <option value="admin">Администраторы</option>
        <option value="manager">Менеджеры</option>
      </select>

      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="showDeleted"
          class="checkbox-input"
        />
        Удаленные пользователи
      </label>
    </div>

    <div class="page-controls" v-if="!showDeleted">
      <button class="btn-add" @click="openForm()">Добавить</button>
    </div>

    <div class="cards-wrap four-cols">
      <UserCard
        v-for="row in filtered"
        :key="row.id_user"
        :row="row"
        :roles="roles"
        :get-role-name="getRoleName"
        @edit="openForm"
        @delete="deleteRow"
        @restore="restoreRow"
        @change-password="openPasswordModal"
      />
    </div>

    <UserModal
      :visible="form.visible"
      :payload="form.current"
      :roles="roles"
      :on-save="saveForm"
      @cancel="closeForm"
    />

    <PasswordModal
      :visible="passwordModal.visible"
      :user-id="passwordModal.userId"
      :change-password="changePassword"
      @saved="closePasswordModal"
      @cancel="closePasswordModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth' // твой useAuth
import UserCard from '../components/cards/UserCard.vue'
import UserModal from '../components/modals/UserModal.vue'
import PasswordModal from '../components/modals/PasswordModal.vue'
import { useUsers } from '../composables/useUsers'
import type { User, UserSave } from '../entities/user'

const router = useRouter()
const auth = useAuth()

const {
  actualList,
  deletedList,
  roles,
  getRoleName,
  loadRoles,
  loadUsers,
  saveUser,
  deleteUser,
  restoreUser,
  changePassword
} = useUsers()

const searchQuery = ref('')
const showDeleted = ref(false)
const roleFilter = ref<'all' | 'admin' | 'manager'>('all')

const currentList = computed(() =>
  showDeleted.value ? deletedList.value : actualList.value
)

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  return currentList.value
    .filter(user => {
      if (roleFilter.value === 'admin') {
        return user.id_role === 1
      }
      if (roleFilter.value === 'manager') {
        return user.id_role === 2
      }
      return true
    })
    .filter(user => {
      if (!q) return true
      const fio = `${user.last_name} ${user.first_name} ${user.middle_name ?? ''}`
        .toLowerCase()
      return fio.includes(q)
    })
})

onMounted(async () => {
  await Promise.all([loadUsers(), loadRoles()])
})

const form = reactive<{ visible: boolean; current: User | null }>({
  visible: false,
  current: null
})

const passwordModal = reactive<{ visible: boolean; userId: number | null }>({
  visible: false,
  userId: null
})

function openForm(row?: User) {
  form.current = row ?? null
  form.visible = true
}

function closeForm() {
  form.visible = false
  form.current = null
}

async function saveForm(payload: UserSave) {
  await saveUser(payload)
  closeForm()
}

async function deleteRow(row: User) {
  await deleteUser(row.id_user)
  if (auth.currentUser.value?.id_user === row.id_user) {
    await auth.logout()
    await router.push('/login')
  }
}

async function restoreRow(row: User) {
  await restoreUser(row.id_user)
}

function openPasswordModal(userId: number) {
  passwordModal.userId = userId
  passwordModal.visible = true
}

function closePasswordModal() {
  passwordModal.visible = false
  passwordModal.userId = null
}
</script>

<style scoped>
.role-select {
  width: 260px;
}
</style>
