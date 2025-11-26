<template>
  <div class="page">
    <div class="page-controls">
      <button class="btn-add" @click="open()">Добавить</button>
    </div>

    <div class="cards-wrap">
      <PositionCard
        v-for="row in list"
        :key="row.id_position"
        :row="row"
        @edit="open"
        @delete="doDelete"
      />
    </div>

    <PositionModal
      :visible="modalVisible"
      :payload="editingPayload"
      :on-save="onModalSave"
      @cancel="closeModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import http from '../api/http'
import PositionCard from '../components/PositionCard.vue'
import PositionModal from '../components/PositionModal.vue'

type Position = {
  id_position: number
  name: string
  deleted_at?: string | null
}

const list = ref<Position[]>([])
const modalVisible = ref(false)
const editingPayload = ref<Position | null>(null)

async function load() {
  const res = await http.get<Position[]>('/positions')
  list.value = res.data
}

function open(row?: Position) {
  editingPayload.value = row ?? null
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  editingPayload.value = null
}

async function onModalSave(payload: { id_position?: number | null; name?: string }) {
  if (payload.id_position) {
    await http.patch(`/positions/${payload.id_position}`, { name: payload.name })
  } else {
    await http.post('/positions', { name: payload.name })
  }
  await load()
  closeModal()
}

async function doDelete(row: Position) {
  await http.delete(`/positions/${row.id_position}`)
  await load()
}

onMounted(load)
</script>
