<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ form.id ? 'Изменить должность' : 'Добавить должность' }}</h3>

      <div v-if="error" class="error-box">{{ error }}</div>

      <label>Название</label>
      <input v-model="form.name" />

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
import type { Position, PositionSave } from '@/entities/position.ts'

const props = defineProps<{
  visible: boolean
  payload: Position | null
  onSave: (data: PositionSave) => Promise<void>
}>()

const emit = defineEmits<{ (e: 'cancel'): void }>()

const form = reactive({ id: null as number | null, name: '' })
const error = ref('')

watch(() => props.payload, (p) => {
  error.value = ''
  form.id = p?.id_position ?? null
  form.name = p?.name ?? ''
}, { immediate: true })

async function submit() {
  error.value = ''
  try {
    await props.onSave({ id_position: form.id, name: form.name })
  } catch (e) {
    if (isAxiosError(e)) {
      const msg = e.response?.data?.message ?? 'Ошибка сохранения'
      error.value = Array.isArray(msg) ? msg.join(', ') : msg
    } else error.value = 'Неизвестная ошибка'
  }
}
function onCancel() { emit('cancel') }
</script>
