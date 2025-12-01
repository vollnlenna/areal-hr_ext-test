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
        Удаленные организации
      </label>
    </div>

    <div class="page-controls" v-if="!showDeleted">
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

const actualList = ref<Org[]>([])
const deletedList = ref<Org[]>([])
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
    http.get<Org[]>('/organizations'),
    http.get<Org[]>('/organizations/deleted')
  ])
  actualList.value = actualRes.data
  deletedList.value = deletedRes.data
}
onMounted(loadLists)

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
  await loadLists()
  closeForm()
}

async function deleteRow(row: Org) {
  await http.delete(`/organizations/${row.id_organization}`)
  await loadLists()
}

async function restoreRow(row: Org) {
  await http.patch(`/organizations/restore/${row.id_organization}`)
  await loadLists()
}
</script>
