<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ form.id ? 'Изменить пользователя' : 'Добавить пользователя' }}</h3>

      <div v-if="error" class="error-box">{{ error }}</div>

      <div class="form-row">
        <label>Фамилия</label>
        <input v-model="form.last_name" />
      </div>

      <div class="form-row">
        <label>Имя</label>
        <input v-model="form.first_name" />
      </div>

      <div class="form-row">
        <label>Отчество</label>
        <input v-model="form.middle_name" />
      </div>

      <div class="form-row">
        <label>Логин</label>
        <input v-model="form.login" />
      </div>

      <div class="form-row">
        <label>Роль</label>
        <select v-model="form.id_role">
          <option value="" disabled>Выберите роль</option>
          <option v-for="role in roles" :key="role.id" :value="role.id">
            {{ role.name }}
          </option>
        </select>
      </div>

      <div v-if="!form.id" class="form-row">
        <label>Пароль</label>
        <div class="password-input-wrapper">
          <input :type="showPassword ? 'text' : 'password'" v-model="form.password" />
          <button
            type="button"
            class="password-toggle"
            @click="showPassword = !showPassword"
            :aria-label="showPassword ? 'Показать пароль' : 'Скрыть пароль'"
          >
            <Icon :icon="showPassword ? 'mdi:eye' : 'mdi:eye-off'" width="16" />
          </button>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-save" @click="submit">Сохранить</button>
        <button class="btn-cancel" @click="onCancel">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { Icon } from '@iconify/vue'
import type { User, UserSave, Role } from '@/entities/user'

const props = defineProps<{
  visible: boolean
  payload: User | null
  roles: Role[]
  onSave: (data: UserSave) => Promise<void>
}>()

const emit = defineEmits<{ (e: 'cancel'): void }>()

const form = reactive({
  id: null as number | null,
  last_name: '',
  first_name: '',
  middle_name: '',
  login: '',
  id_role: '',
  password: ''
})

const error = ref('')
const showPassword = ref(false)

watch(
  () => props.payload,
  (p) => {
    error.value = ''
    if (!p) {
      resetForm()
      return
    }
    form.id = p.id_user
    form.last_name = p.last_name
    form.first_name = p.first_name
    form.middle_name = p.middle_name ?? ''
    form.login = p.login
    form.id_role = p.id_role.toString()
    form.password = ''
  },
  { immediate: true }
)

function resetForm() {
  Object.assign(form, {
    id: null,
    last_name: '',
    first_name: '',
    middle_name: '',
    login: '',
    id_role: '',
    password: ''
  })
  error.value = ''
}

async function submit() {
  error.value = ''

  const payload: UserSave = {
    id_user: form.id ?? undefined,
    last_name: form.last_name || undefined,
    first_name: form.first_name || undefined,
    middle_name: form.middle_name || null,
    login: form.login || undefined,
    id_role: parseInt(form.id_role),
    ...(form.id ? {} : { password: form.password }),
  }

  try {
    await props.onSave(payload)
  } catch (e) {
    if (isAxiosError(e)) {
      const msg = e.response?.data?.message ?? 'Ошибка сохранения'
      error.value = Array.isArray(msg) ? msg.join(', ') : msg
    } else {
      error.value = 'Неизвестная ошибка'
    }
  }
}

function onCancel() {
  resetForm()
  emit('cancel')
}
</script>

