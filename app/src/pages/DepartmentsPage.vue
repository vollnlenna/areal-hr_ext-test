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
      :on-save="saveSubDepartment"
      @saved="afterSubSaved"
      @cancel="closeSub"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import DepartmentCard from '../components/cards/DepartmentCard.vue'
import DeptModal from '../components/modals/DeptModal.vue'
import SubDeptModal from '../components/modals/SubDeptModal.vue'
import { useDepartments } from '../composables/useDepartments'
import { useOrganizations } from '../composables/useOrganizations'
import type { Department, DepartmentSave } from '../entities/department'
import type { Organization } from '../entities/organization'

const {
  actualList,
  deletedList,
  loadDepartments,
  saveDepartment,
  deleteDepartment,
  restoreDepartment,
  addSubDepartment,
  renameSubDepartment
} = useDepartments()

const { loadAllOrganizations } = useOrganizations()

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
  organizations.value = await loadAllOrganizations()
  await loadDepartments()
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

async function saveForm(payload: DepartmentSave) {
  await saveDepartment(payload)
  closeForm()
}

async function saveSubDepartment(mode: 'add' | 'rename', name: string, parent?: Department, target?: Department) {
  if (mode === 'add' && parent) {
    await addSubDepartment(name, parent.id_department, parent.id_organization)
  } else if (mode === 'rename' && target) {
    await renameSubDepartment(
      target.id_department,
      name,
      target.id_organization,
      target.id_parent_department
    )
  }
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
  await loadDepartments()
  closeSub()
}

async function deleteRow(row: Department) {
  await deleteDepartment(row.id_department)
}

async function deleteSub(id: number) {
  await deleteDepartment(id)
}

async function restoreRow(row: Department) {
  await restoreDepartment(row.id_department)
}
</script>

