<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ form.id ? 'Изменить отдел' : 'Добавить корневой отдел структуры' }}</h3>

      <div v-if="error" class="error-box">{{ error }}</div>

      <label>Название</label>
      <input v-model="form.name" />

      <label>Организация</label>
      <select v-model="form.organizationId">
        <option :value="null" disabled>Выберите организацию</option>
        <option
          v-for="o in activeOrganizations"
          :key="o.id_organization"
          :value="o.id_organization"
        >
          {{ o.name }}
        </option>
      </select>

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
import { reactive, ref, watch, computed } from 'vue'
import { isAxiosError } from 'axios'
import type { Department, DepartmentSave } from '@/entities/department.ts'
import type { Organization } from '@/entities/organization.ts'

const props = defineProps<{
  visible: boolean
  payload: Department | null
  onSave: (data: DepartmentSave) => Promise<void>
  orgList: Organization[]
}>()

const emit = defineEmits<{ (e: 'cancel'): void }>()

const form = reactive({
  id: null as number | null,
  name: '',
  organizationId: null as number | null,
  comment: null as string | null
})
const error = ref('')

function resetForm() {
  Object.assign(form, {
    id: null,
    name: '',
    organizationId: null,
    comment: null
  })
  error.value = ''
}

const activeOrganizations = computed(() =>
  props.orgList.filter(o => !o.deleted_at)
)

watch(
  () => props.payload,
  (p) => {
    if (!p) {
      resetForm()
      return
    }
    error.value = ''
    form.id = p.id_department
    form.name = p.name
    form.organizationId = p.id_organization
    form.comment = p.comment ?? null
  },
  { immediate: true }
)

async function submit() {
  error.value = ''
  try {
    await props.onSave({
      id_department: form.id,
      name: form.name,
      id_organization: form.organizationId,
      comment: form.comment
    })
    resetForm()
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
