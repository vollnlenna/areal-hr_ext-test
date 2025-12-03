<template>
  <div class="page">
    <div class="search-row">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск по названию..."
        class="search-input"
      />

      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="showDeleted"
          class="checkbox-input"
        />
        Удаленные должности
      </label>
    </div>

    <div class="page-controls" v-if="!showDeleted">
      <button class="btn-add" @click="openForm()">Добавить</button>
    </div>

    <div class="cards-wrap">
      <PositionCard
        v-for="row in filtered"
        :key="row.id_position"
        :row="row"
        @edit="openForm"
        @delete="deleteRow"
        @restore="restoreRow"
      />
    </div>

    <PositionModal
      :visible="form.visible"
      :payload="form.current"
      :on-save="saveForm"
      @cancel="closeForm"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, reactive } from 'vue'
import PositionCard from '../components/cards/PositionCard.vue'
import PositionModal from '../components/modals/PositionModal.vue'
import { usePositions } from '../composables/usePositions'
import type { Position, PositionSave } from '../entities/position'

const { actualList, deletedList, loadPositions, savePosition, deletePosition, restorePosition } = usePositions()

const searchQuery = ref('')
const showDeleted = ref(false)

const currentList = computed(() =>
  showDeleted.value ? deletedList.value : actualList.value
)

const filtered = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return currentList.value
  return currentList.value.filter(x => x.name.toLowerCase().includes(q))
})

onMounted(loadPositions)

const form = reactive<{ visible: boolean; current: Position | null }>({ visible: false, current: null })

function openForm(row?: Position) {
  form.current = row ?? null
  form.visible = true
}

function closeForm() {
  form.visible = false
  form.current = null
}

async function saveForm(payload: PositionSave) {
  await savePosition(payload)
  closeForm()
}

async function deleteRow(row: Position) {
  await deletePosition(row.id_position)
}

async function restoreRow(row: Position) {
  await restorePosition(row.id_position)
}
</script>
