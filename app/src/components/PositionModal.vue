<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ local.id !== null ? 'Изменить должность' : 'Добавить должность' }}</h3>

      <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>

      <label>Название</label>
      <input v-model="local.name" />

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

type SavePayload = { id_position?: number | null; name?: string }

const errorMessage = ref('')

const props = defineProps<{
  visible: boolean
  payload: SavePayload | null
  onSave: (data: SavePayload) => Promise<void>
}>()

const emits = defineEmits<{ (e: 'cancel'): void }>()

const local = reactive({ id: null as number | null, name: '' })

function sync(p: SavePayload | null) {
  errorMessage.value = ''
  local.id = p?.id_position ?? null
  local.name = p?.name ?? ''
}
watch(() => props.payload, sync, { immediate: true })

async function handleSave() {
  errorMessage.value = ''
  try {
    await props.onSave({ id_position: local.id, name: local.name })
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
