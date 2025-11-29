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
      <OrganizationCard
        v-for="row in filtered"
        :key="row.id_organization"
        :row="row"
        @edit="openForm"
        @delete="deleteRow"
        @restore="restoreRow"
      />
    </div>

    <OrgModal
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
import OrganizationCard from '../components/OrganizationCard.vue'
import OrgModal from '../components/OrgModal.vue'

type Org = { id_organization: number; name: string; comment?: string | null; deleted_at?: string | null }

const list = ref<Org[]>([])
const searchQuery = ref('')

const filtered = computed(() =>
  list.value.filter(x => x.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
)

async function loadList() {
  const res = await http.get<Org[]>('/organizations')
  list.value = res.data
}
onMounted(loadList)

const form = reactive<{ visible: boolean; current: Org | null }>({ visible: false, current: null })
function openForm(row?: Org) { form.current = row ?? null; form.visible = true }
function closeForm() { form.visible = false; form.current = null }

async function saveForm(payload: { id_organization?: number | null; name?: string; comment?: string | null }) {
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
  await loadList()
  closeForm()
}

async function deleteRow(row: Org) {
  await http.delete(`/organizations/${row.id_organization}`)
  await loadList()
}

async function restoreRow(row: Org) {
  await http.patch(`/organizations/restore/${row.id_organization}`)
  await loadList()
}
</script>
