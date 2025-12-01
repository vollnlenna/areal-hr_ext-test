<template>
  <div class="page">
    <div class="search-row">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по отделу или организации..."
        class="search-input"
      />

      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="showDeleted"
          class="checkbox-input"
        />
        Удаленные отделы
      </label>
    </div>

    <div class="page-controls" v-if="!showDeleted">
      <button class="btn-add" @click="openForm()">Добавить</button>
    </div>

    <div class="cards-wrap four-cols">
      <DepartmentCard
        v-for="row in filtered"
        :key="row.id_department"
        :row="row"
        :organizations="organizations"
        :departments="currentList"
        @edit="openForm"
        @delete="deleteRow"
        @restore="restoreRow"
        @sub-add="openSubAdd"
        @sub-rename="openSubRename"
        @sub-delete="deleteSub"
      />
    </div>

    <DeptModal
      :visible="form.visible"
      :payload="form.current"
      :org-list="organizations"
      :on-save="saveForm"
      @cancel="closeForm"
    />

    <SubDeptModal
      :visible="sub.visible"
      :mode="sub.mode"
      :parent="sub.parent"
      :target="sub.target"
      @saved="afterSubSaved"
      @cancel="closeSub"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import http from '../api/http'
import DepartmentCard from '../components/DepartmentCard.vue'
import DeptModal from '../components/DeptModal.vue'
import SubDeptModal from '../components/SubDeptModal.vue'

type Department = {
  id_department: number
  name: string
  id_organization: number
  id_parent_department?: number | null
  comment?: string | null
  deleted_at?: string | null
}
type Organization = { id_organization: number; name: string }

const actualList = ref<Department[]>([])
const deletedList = ref<Department[]>([])
const organizations = ref<Organization[]>([])
const searchQuery = ref('')
const showDeleted = ref(false)

const currentList = computed(() =>
  showDeleted.value ? deletedList.value : actualList.value
)

const orgIndex = computed(() => {
  const m = new Map<number, string>()
  organizations.value.forEach(o => m.set(o.id_organization, o.name.toLowerCase()))
  return m
})

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const parentDepartments = currentList.value.filter(d => !d.id_parent_department)

  if (!q) return parentDepartments

  return parentDepartments.filter(d =>
    d.name.toLowerCase().includes(q) ||
    (orgIndex.value.get(d.id_organization) ?? '').includes(q)
  )
})

async function loadLists() {
  const [orgRes, orgDeletedRes, actualRes, deletedRes] = await Promise.all([
    http.get<Organization[]>('/organizations'),
    http.get('/organizations/deleted'),
    http.get<Department[]>('/departments'),
    http.get<Department[]>('/departments/deleted')
  ])
  organizations.value = [...orgRes.data, ...orgDeletedRes.data]
  actualList.value = actualRes.data
  deletedList.value = deletedRes.data
}

onMounted(loadLists)

const form = reactive<{ visible: boolean; current: Department | null }>({
  visible: false,
  current: null
})
function openForm(row?: Department) {
  form.current = row ?? null
  form.visible = true
}
function closeForm() {
  form.visible = false
  form.current = null
}
async function saveForm(payload: {
  id_department?: number | null
  name?: string
  organizationId?: number | null
  comment?: string | null
}) {
  const body = {
    name: payload.name,
    id_organization: payload.organizationId ?? null,
    id_parent_department: null,
    comment: payload.comment ?? null
  }
  if (payload.id_department) {
    await http.patch(`/departments/${payload.id_department}`, body)
  } else {
    await http.post('/departments', body)
  }
  await loadLists()
  closeForm()
}

const sub = reactive<{
  visible: boolean
  mode: 'add' | 'rename'
  parent: Department | null
  target: Department | null
}>({
  visible: false,
  mode: 'add',
  parent: null,
  target: null
})

function openSubAdd(parentId: number) {
  sub.mode = 'add'
  sub.parent = currentList.value.find(x => x.id_department === parentId) ?? null
  sub.target = null
  sub.visible = true
}
function openSubRename(nodeId: number) {
  sub.mode = 'rename'
  sub.target = currentList.value.find(x => x.id_department === nodeId) ?? null
  sub.parent = null
  sub.visible = true
}
function closeSub() {
  sub.visible = false
  sub.parent = null
  sub.target = null
}
async function afterSubSaved() {
  await loadLists()
  closeSub()
}

async function deleteRow(row: Department) {
  await http.delete(`/departments/${row.id_department}`)
  await loadLists()
}
async function deleteSub(id: number) {
  await http.delete(`/departments/${id}`)
  await loadLists()
}
async function restoreRow(row: Department) {
  await http.patch(`/departments/restore/${row.id_department}`)
  await loadLists()
}
</script>

<style scoped>
.four-cols { grid-template-columns: repeat(4, 1fr); }
</style>
