<template>
  <div class="page">
    <div class="search-row">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по ФИО сотрудника..."
        class="search-input"
      />

      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="showDeleted"
          class="checkbox-input"
        />
        Удаленные сотрудники
      </label>
    </div>

    <div class="page-controls" v-if="!showDeleted">
      <button class="btn-add" @click="openForm()">Добавить</button>
    </div>

    <div class="cards-wrap four-cols">
      <EmployeeCard
        v-for="row in filtered"
        :key="row.id_employee"
        :row="row"
        @edit="openForm"
        @delete="deleteRow"
        @restore="restoreRow"
      />
    </div>

    <EmployeeModal
      :visible="form.visible"
      :payload="form.current"
      :on-save="saveForm"
      @cancel="closeForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import EmployeeCard from '../components/cards/EmployeeCard.vue'
import EmployeeModal from '../components/modals/EmployeeModal.vue'
import { useEmployees } from '../composables/useEmployees'
import type { Employee, EmployeeSave } from '../entities/employee'

const { actualList, deletedList, loadEmployees, saveEmployee, deleteEmployee, restoreEmployee } = useEmployees()

const searchQuery = ref('')
const showDeleted = ref(false)

const currentList = computed(() =>
  showDeleted.value ? deletedList.value : actualList.value
)

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return currentList.value
  return currentList.value.filter(d =>
    `${d.last_name} ${d.first_name} ${d.middle_name}`.toLowerCase().includes(q)
  )
})

onMounted(loadEmployees)

const form = reactive<{ visible: boolean; current: Employee | null }>({
  visible: false,
  current: null
})

function openForm(row?: Employee) {
  form.current = row ?? null
  form.visible = true
}

function closeForm() {
  form.visible = false
  form.current = null
}

async function saveForm(payload: EmployeeSave) {
  await saveEmployee(payload)
  closeForm()
}

async function deleteRow(row: Employee) {
  await deleteEmployee(row.id_employee)
}

async function restoreRow(row: Employee) {
  await restoreEmployee(row.id_employee)
}
</script>

<style scoped>
.four-cols {
  grid-template-columns: repeat(4, 1fr);
}
</style>
