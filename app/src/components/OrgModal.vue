<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ local.id !== null ? 'Изменить организацию' : 'Добавить организацию' }}</h3>

      <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>

      <label>Название</label>
      <input v-model="local.name" />

      <label>Комментарий</label>
      <textarea v-model="local.comment" rows="4" />

      <div class="modal-actions">
        <button class="btn-save" @click="handleSave">Сохранить</button>
        <button class="btn-cancel" @click="onCancel">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { isAxiosError } from 'axios'

type SavePayload = {
  id_organization?: number | null
  name?: string
  comment?: string | null
}

const errorMessage = ref('')

const props = defineProps<{
  visible: boolean
  payload: SavePayload | null
  onSave: (data: SavePayload) => Promise<void>
}>()

const emits = defineEmits<{
  (e: 'cancel'): void
}>()

const local = reactive({
  id: null as number | null,
  name: '',
  comment: null as string | null
})

watch(
  () => props.payload,
  (p) => {
    errorMessage.value = ''
    if (p) {
      local.id = p.id_organization ?? null
      local.name = p.name ?? ''
      local.comment = p.comment ?? null
    } else {
      local.id = null
      local.name = ''
      local.comment = null
    }
  },
  { immediate: true }
)

async function handleSave() {
  errorMessage.value = ''
  try {
    await props.onSave({
      id_organization: local.id,
      name: local.name,
      comment: local.comment
    })
  } catch (err) {
    if (isAxiosError(err)) {
      const msg = err.response?.data?.message ?? 'Ошибка сохранения'
      errorMessage.value = Array.isArray(msg) ? msg.join(', ') : msg
    } else {
      errorMessage.value = 'Неизвестная ошибка'
    }
  }
}

function onCancel() {
  emits('cancel')
}
</script>

