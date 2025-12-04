<template>
  <div class="page">
    <div class="search-row">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по ФИО, организации, отделу, должности..."
        class="search-input"
      />

      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="showOnlyInactive"
          class="checkbox-input"
        />
        Уволенные сотрудники
      </label>

      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="showDeleted"
          class="checkbox-input"
        />
        Удаленные операции
      </label>
    </div>

    <div class="page-controls" v-if="!showDeleted && !showOnlyInactive">
      <button class="btn-add" @click="openForm()">Добавить</button>
    </div>

    <div class="cards-wrap four-cols">
      <HrOperationCard
        v-for="row in filtered"
        :key="row.id_hr_operation"
        :row="row"
        @edit="openForm"
        @delete="deleteRow"
        @restore="restoreRow"
      />
    </div>

    <HrOperationModal
      :visible="form.visible"
      :payload="form.current"
      :on-save="saveForm"
      :employee-list="employeeList"
      :org-list="organizations"
      :department-list="departmentList"
      :position-list="positionList"
      :existing-operations="actualList"
      @cancel="closeForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import HrOperationCard from '../components/cards/HrOperationCard.vue'
import HrOperationModal from '../components/modals/HrOperationModal.vue'
import { useHrOperations } from '../composables/useHrOperations'
import { useEmployees } from '../composables/useEmployees'
import { useOrganizations } from '../composables/useOrganizations'
import { useDepartments } from '../composables/useDepartments'
import { usePositions } from '../composables/usePositions'
import type { HrOperation, HrOperationSave, HrOperationView } from '../entities/hrOperation'

const {
  loadOperations,
  actualList,
  deletedList,
  saveOperation,
  deleteOperation,
  restoreOperation
} = useHrOperations()
const { loadEmployees, actualList: employeeActualList } = useEmployees()
const { loadOrganizations, actualList: orgActualList } = useOrganizations()
const { loadDepartments, actualList: deptActualList } = useDepartments()
const { loadPositions, actualList: positionActualList } = usePositions()

const searchQuery = ref('')
const showDeleted = ref(false)
const showOnlyInactive = ref(false)

const organizations = orgActualList
const employeeList = computed(() => employeeActualList.value.filter(e => !e.deleted_at))
const departmentList = deptActualList
const positionList = computed(() => positionActualList.value.filter(p => !p.deleted_at))

const currentList = computed(() =>
  showDeleted.value ? deletedList.value : actualList.value
)

const combinedData = computed<HrOperationView[]>(() => {
  const empMap = new Map(employeeList.value.map(e => [e.id_employee, e]))
  const orgMap = new Map(organizations.value.map(o => [o.id_organization, o]))
  const deptMap = new Map(departmentList.value.map(d => [d.id_department, d]))
  const posMap = new Map(positionList.value.map(p => [p.id_position, p]))

  return currentList.value.map(op => {
    const emp = empMap.get(op.id_employee)
    const dept = deptMap.get(op.id_department)
    const org = dept ? orgMap.get(dept.id_organization) : null
    const pos = posMap.get(op.id_position) ?? null

    return {
      ...op,
      employeeName: emp
        ? `${emp.last_name} ${emp.first_name}${emp.middle_name ? ' ' + emp.middle_name : ''}`
        : `[ID: ${op.id_employee}]`,
      organizationName: org ? org.name : '[Не найдена]',
      departmentName: dept ? dept.name : '[Не найден]',
      positionName: pos ? pos.name : '[Не найдена]'
    }
  })
})

const filtered = computed(() => {
  let list = combinedData.value

  if (showOnlyInactive.value) {
    list = list.filter(op => !op.is_active)
  } else {
    list = list.filter(op => op.is_active)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list

  return list.filter(op =>
    op.employeeName.toLowerCase().includes(q) ||
    op.organizationName.toLowerCase().includes(q) ||
    op.departmentName.toLowerCase().includes(q) ||
    op.positionName.toLowerCase().includes(q)
  )
})

async function loadLists() {
  await Promise.all([
    loadEmployees(),
    loadOrganizations(),
    loadDepartments(),
    loadPositions(),
    loadOperations()
  ])
}

onMounted(loadLists)

const form = reactive<{ visible: boolean; current: HrOperation | null }>({
  visible: false,
  current: null
})

function openForm(row?: HrOperation) {
  form.current = row ?? null
  form.visible = true
}

function closeForm() {
  form.visible = false
  form.current = null
}

async function saveForm(payload: HrOperationSave) {
  await saveOperation(payload)
  closeForm()
}

async function deleteRow(row: HrOperation) {
  await deleteOperation(row.id_hr_operation)
}

async function restoreRow(row: HrOperation) {
  await restoreOperation(row.id_hr_operation)
}
</script>

