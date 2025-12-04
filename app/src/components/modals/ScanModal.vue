<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>Добавить скан паспорта</h3>

      <div v-if="error" class="error-box">{{ error }}</div>

      <div class="form-row">
        <label>Файл</label>
        <input type="file" @change="onFileChange" accept=".jpg,.jpeg,.png,.pdf,.webp" />
      </div>

      <div class="form-row">
        <label>Название файла</label>
        <input v-model="form.name" />
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
import http from '../../api/http'
import { useFiles } from '@/composables/useFiles.ts'

const props = defineProps<{
  visible: boolean
  employeeId: number | null
}>()

const emit = defineEmits<{
  (e: 'cancel'): void
  (e: 'saved'): void
}>()

const { uploadFile } = useFiles()

const form = reactive({
  name: '',
  file: null as File | null,
})
const error = ref('')

watch(
  () => props.visible,
  (val) => {
    if (val) {
      form.name = ''
      form.file = null
      error.value = ''
    }
  }
)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0] ?? null
  form.file = file
  if (file && !form.name) {
    form.name = file.name.replace(/\.[^.]+$/, '')
  }
}

async function submit() {
  error.value = ''
  if (!form.file) {
    error.value = 'Выберите файл'
    return
  }
  try {
    const uploadResult = await uploadFile(form.file, form.name.trim())
    if (!uploadResult) {
      error.value = 'Ошибка загрузки файла'
      return
    }
    await http.post('/passport-scans', {
      id_employee: props.employeeId,
      id_file: uploadResult.id_file,
    })
    emit('saved')
  } catch (e) {
    if (isAxiosError(e)) {
      error.value = e.response?.data?.message ?? 'Ошибка сохранения'
    } else {
      error.value = 'Неизвестная ошибка'
    }
  }
}

function onCancel() {
  emit('cancel')
}
</script>
