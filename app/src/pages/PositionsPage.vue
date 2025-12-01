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
import http from '../api/http'
import PositionCard from '../components/PositionCard.vue'
import PositionModal from '../components/PositionModal.vue'

type Position = { id_position: number; name: string; deleted_at?: string | null }

const actualList = ref<Position[]>([])
const deletedList = ref<Position[]>([])
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

async function loadLists() {
  const [actualRes, deletedRes] = await Promise.all([
    http.get<Position[]>('/positions'),
    http.get<Position[]>('/positions/deleted')
  ])
  actualList.value = actualRes.data
  deletedList.value = deletedRes.data
}
onMounted(loadLists)

const form = reactive<{ visible: boolean; current: Position | null }>({ visible: false, current: null })
function openForm(row?: Position) { form.current = row ?? null; form.visible = true }
function closeForm() { form.visible = false; form.current = null }

async function saveForm(payload: { id_position?: number | null; name?: string }) {
  if (payload.id_position) {
    await http.patch(`/positions/${payload.id_position}`, { name: payload.name })
  } else {
    await http.post('/positions', { name: payload.name })
  }
  await loadLists()
  closeForm()
}

async function deleteRow(row: Position) {
  await http.delete(`/positions/${row.id_position}`)
  await loadLists()
}

async function restoreRow(row: Position) {
  await http.patch(`/positions/restore/${row.id_position}`)
  await loadLists()
}
</script>
