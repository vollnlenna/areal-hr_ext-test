<template>
  <div class="page">
    <input
      v-model="searchQuery"
      type="text"
      placeholder="Поиск по названию..."
      class="search-input"
    />

    <div class="page-controls">
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

const list = ref<Position[]>([])
const searchQuery = ref('')

const filtered = computed(() =>
  list.value.filter(x => x.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)

async function loadList() {
  const res = await http.get<Position[]>('/positions')
  list.value = res.data
}
onMounted(loadList)

const form = reactive<{ visible: boolean; current: Position | null }>({ visible: false, current: null })
function openForm(row?: Position) { form.current = row ?? null; form.visible = true }
function closeForm() { form.visible = false; form.current = null }

async function saveForm(payload: { id_position?: number | null; name?: string }) {
  if (payload.id_position) {
    await http.patch(`/positions/${payload.id_position}`, { name: payload.name })
  } else {
    await http.post('/positions', { name: payload.name })
  }
  await loadList()
  closeForm()
}

async function deleteRow(row: Position) {
  await http.delete(`/positions/${row.id_position}`)
  await loadList()
}

async function restoreRow(row: Position) {
  await http.patch(`/positions/restore/${row.id_position}`)
  await loadList()
}
</script>
