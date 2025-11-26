<template>
  <div class="page">
    <div class="page-controls">
      <button class="btn-add" @click="open()">Добавить</button>
    </div>

    <div class="cards-wrap">
      <DepartmentCard
        v-for="row in list"
        :key="row.id_department"
        :row="row"
        :organizations="organizations"
        :departments="list"
        @edit="open"
        @delete="doDelete"
      />
    </div>

    <DeptModal
      :visible="modalVisible"
      :payload="editingPayload"
      :org-list="organizations"
      :dept-list="list"
      :on-save="onModalSave"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '../api/http'
import DepartmentCard from '../components/DepartmentCard.vue'
import DeptModal from '../components/DeptModal.vue'

type Department = {
  id_department: number
  name: string
  id_organization: number
  id_parent_department?: number | null
  comment?: string | null
  deleted_at?: string | null
}

type Organization = { id_organization: number; name: string }

const list = ref<Department[]>([])
const organizations = ref<Organization[]>([])

const modalVisible = ref(false)
const editingPayload = ref<Department | null>(null)

async function loadAll() {
  const [orgRes, deptRes] = await Promise.all([
    http.get<Organization[]>('/organizations'),
    http.get<Department[]>('/departments')
  ])
  organizations.value = orgRes.data
  list.value = deptRes.data
}

function open(row?: Department) {
  editingPayload.value = row ?? null
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  editingPayload.value = null
}

async function onModalSave(payload: {
  id_department?: number | null
  name?: string
  organizationId?: number | null
  parentDeptId?: number | null
  comment?: string | null
}) {
  const body = {
    name: payload.name,
    id_organization: payload.organizationId ?? null,
    id_parent_department: payload.parentDeptId ?? null,
    comment: payload.comment ?? null
  }

  if (payload.id_department) {
    const { data: updated } = await http.patch<Department>(`/departments/${payload.id_department}`, body)
    const i = list.value.findIndex(x => x.id_department === updated.id_department)
    if (i !== -1) list.value[i] = updated
  } else {
    const { data: created } = await http.post<Department>('/departments', body)
    list.value = [created, ...list.value]
  }

  closeModal()
}

async function doDelete(row: Department) {
  await http.delete(`/departments/${row.id_department}`)
  await loadAll()
}

onMounted(loadAll)
</script>
