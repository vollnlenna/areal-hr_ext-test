<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ mode === 'add' ? 'Добавить подразделение' : 'Переименовать подразделение' }}</h3>

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
import type { Department } from '@/entities/department.ts'

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'rename'
  parent: Department | null
  target: Department | null
  onSave: (mode: 'add' | 'rename', name: string, parent?: Department, target?: Department) => Promise<void>
}>()

const emit = defineEmits<{ (e: 'cancel'): void; (e: 'saved'): void }>()

const form = reactive({ name: '' })
const error = ref('')

watch(
  () => [props.visible, props.mode, props.parent, props.target] as const,
  () => {
    error.value = ''
    form.name = props.mode === 'rename' ? (props.target?.name ?? '') : ''
  },
  { immediate: true }
)

async function submit() {
  error.value = ''
  const name = form.name.trim()
  try {
    await props.onSave(props.mode, name, props.parent ?? undefined, props.target ?? undefined)
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

function onCancel() { emit('cancel') }
</script>
