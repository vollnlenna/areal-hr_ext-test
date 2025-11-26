<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ local.id ? 'Изменить отдел' : 'Добавить отдел' }}</h3>

      <div v-if="errorMessage" class="error-box">{{ errorMessage }}</div>

      <label>Название</label>
      <input v-model="local.name" />

      <label>Организация</label>
      <select v-model="local.organizationId">
        <option :value="null" disabled>Выберите организацию</option>
        <option v-for="org in orgList" :key="org.id_organization" :value="org.id_organization">
          {{ org.name }}
        </option>
      </select>

      <label>Вышестоящий отдел</label>
      <select v-model="local.parentDeptId">
        <option :value="null">Нет</option>
        <option
          v-for="d in deptList"
          :key="d.id_department"
          :value="d.id_department"
          :disabled="d.id_department === local.id"
        >
          {{ d.name }}
        </option>
      </select>

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

const errorMessage = ref('')

type Save = {
  id_department?: number | null
  name?: string
  organizationId?: number | null
  parentDeptId?: number | null
  comment?: string | null
}

type DeptPayload = {
  id_department: number
  name: string
  id_organization: number
  id_parent_department?: number | null
  comment?: string | null
}

type OrgOption = { id_organization: number; name: string }
type DeptOption = { id_department: number; name: string }

const props = defineProps<{
  visible: boolean
  payload: DeptPayload | null
  onSave: (data: Save) => Promise<void>
  orgList: OrgOption[]
  deptList: DeptOption[]
}>()

const emit = defineEmits(['cancel'])

const local = reactive({
  id: null as number | null,
  name: '',
  organizationId: null as number | null,
  parentDeptId: null as number | null,
  comment: null as string | null
})

function syncFromPayload(p: DeptPayload | null) {
  errorMessage.value = ''
  local.id = p?.id_department ?? null
  local.name = p?.name ?? ''
  local.organizationId = p?.id_organization ?? null
  local.parentDeptId = p?.id_parent_department ?? null
  local.comment = p?.comment ?? null
}

watch(() => props.payload, syncFromPayload, { immediate: true })

async function handleSave() {
  errorMessage.value = ''
  try {
    await props.onSave({
      id_department: local.id,
      name: local.name,
      organizationId: local.organizationId,
      parentDeptId: local.parentDeptId,
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
  emit('cancel')
}
</script>
