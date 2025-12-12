<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>Изменить пароль</h3>

      <div v-if="error" class="error-box">{{ error }}</div>

      <div class="form-row">
        <label>Новый пароль</label>
        <div class="password-input-wrapper">
          <input
            :type="showPassword ? 'text' : 'password'"
            v-model="newPassword"
            autocomplete="new-password"
          />
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
import { ref } from 'vue'
import { isAxiosError } from 'axios'
import { Icon } from '@iconify/vue'

const props = defineProps<{
  visible: boolean
  userId: number | null
  changePassword: (id: number, password: string) => Promise<void>
}>()

const emit = defineEmits<{
  (e: 'saved'): void
  (e: 'cancel'): void
}>()

const newPassword = ref('')
const error = ref('')
const showPassword = ref(false)

async function submit() {
  error.value = ''

  try {
    await props.changePassword(props.userId!, newPassword.value)
    emit('saved')
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
  newPassword.value = ''
  error.value = ''
  emit('cancel')
}
</script>

