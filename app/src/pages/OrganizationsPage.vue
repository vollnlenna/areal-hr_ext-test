<template>
  <div class="page">
    <div class="page-controls">
      <button class="btn-add" @click="openAdd">Добавить</button>
    </div>

    <div class="cards-wrap">
      <OrganizationCard
        v-for="row in list"
        :key="row.id_organization"
        :row="row"
        @edit="openEdit"
        @delete="doDelete"
      />
    </div>

    <OrgModal
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
import OrganizationCard from '../components/OrganizationCard.vue'
import OrgModal from '../components/OrgModal.vue'

type Org = {
  id_organization: number
  name: string
  comment?: string | null
  deleted_at?: string | null
}

const list = ref<Org[]>([])
const modalVisible = ref(false)
const editingPayload = ref<Org | null>(null)

async function load() {
  const res = await http.get<Org[]>('/organizations')
  list.value = res.data
}

function openAdd() {
  editingPayload.value = null
  modalVisible.value = true
}

function openEdit(row: Org) {
  editingPayload.value = row
  modalVisible.value = true
}

function closeModal() {
  modalVisible.value = false
  editingPayload.value = null
}

async function onModalSave(payload: {
  id_organization?: number | null
  name?: string
  comment?: string | null
}) {
  if (payload.id_organization) {
    await http.patch(`/organizations/${payload.id_organization}`, {
      name: payload.name,
      comment: payload.comment ?? null
    })
  } else {
    await http.post('/organizations', {
      name: payload.name,
      comment: payload.comment ?? null
    })
  }
  await load()
  closeModal()
}

async function doDelete(row: Org) {
  await http.delete(`/organizations/${row.id_organization}`)
  await load()
}

onMounted(load)
</script>
