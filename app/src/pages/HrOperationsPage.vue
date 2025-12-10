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
import type { HrOperation, HrOperationSave } from '../entities/hrOperation'

const {
  loadOperations,
  actualList,
  deletedList,
  saveOperation,
  deleteOperation,
  restoreOperation
} = useHrOperations()

const searchQuery = ref('')
const showDeleted = ref(false)
const showOnlyInactive = ref(false)

const currentList = computed(() =>
  showDeleted.value ? deletedList.value : actualList.value
)

const filtered = computed(() => {
  let list = currentList.value

  if (showOnlyInactive.value) {
    list = list.filter(op => !op.is_active)
  } else if (!showDeleted.value) {
    list = list.filter(op => op.is_active)
  }

  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return list

  return list.filter(op =>
    (op.employee_name?.toLowerCase().includes(q) || '') ||
    (op.organization_name?.toLowerCase().includes(q) || '') ||
    (op.department_name?.toLowerCase().includes(q) || '') ||
    (op.position_name?.toLowerCase().includes(q) || '')
  )
})

async function loadLists() {
  await loadOperations()
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
