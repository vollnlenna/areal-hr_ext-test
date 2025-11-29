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
import http from '../api/http'

type Dept = {
  id_department: number
  name: string
  id_organization: number
  id_parent_department?: number | null
  comment?: string | null
}

const props = defineProps<{
  visible: boolean
  mode: 'add' | 'rename'
  parent: Dept | null
  target: Dept | null
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
    if (props.mode === 'add') {
      await http.post('/departments', {
        name,
        id_organization: props.parent!.id_organization,
        id_parent_department: props.parent!.id_department,
        comment: null
      })
    } else {
      await http.patch(`/departments/${props.target!.id_department}`, {
        name,
        id_organization: props.target!.id_organization,
        id_parent_department: props.target!.id_parent_department ?? null
      })
    }
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
