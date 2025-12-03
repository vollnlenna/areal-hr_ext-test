<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ form.id ? 'Изменить организацию' : 'Добавить организацию' }}</h3>

      <div v-if="error" class="error-box">{{ error }}</div>

      <label>Название</label>
      <input v-model="form.name" />

      <label>Комментарий</label>
      <textarea v-model="form.comment" rows="4" />

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
import type { Organization, OrganizationSave } from '@/entities/organization.ts'

const props = defineProps<{
  visible: boolean
  payload: Organization | null
  onSave: (data: OrganizationSave) => Promise<void>
}>()

const emit = defineEmits<{ (e: 'cancel'): void }>()

const form = reactive({ id: null as number | null, name: '', comment: null as string | null })
const error = ref('')

function resetForm() {
  Object.assign(form, {
    id: null,
    name: '',
    comment: null
  })
  error.value = ''
}

watch(
  () => props.payload,
  (p) => {
    if (!p) {
      resetForm()
      return
    }
    error.value = ''
    form.id = p.id_organization
    form.name = p.name
    form.comment = p.comment ?? null
  },
  { immediate: true }
)

async function submit() {
  error.value = ''
  try {
    await props.onSave({
      id_organization: form.id,
      name: form.name,
      comment: form.comment
    })
    resetForm()
  } catch (e) {
    if (isAxiosError(e)) {
      const msg = e.response?.data?.message ?? 'Ошибка сохранения'
      error.value = Array.isArray(msg) ? msg.join(', ') : msg
    } else error.value = 'Неизвестная ошибка'
  }
}
function onCancel() {
  resetForm()
  emit('cancel')
}
</script>
