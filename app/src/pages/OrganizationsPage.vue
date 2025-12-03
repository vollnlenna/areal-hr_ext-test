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
import OrganizationCard from '../components/cards/OrganizationCard.vue'
import OrgModal from '../components/modals/OrgModal.vue'
import { useOrganizations } from '../composables/useOrganizations'
import type { Organization, OrganizationSave } from '../entities/organization'

const { actualList, deletedList, loadOrganizations, saveOrganization, deleteOrganization, restoreOrganization } = useOrganizations()

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

onMounted(loadOrganizations)

const form = reactive<{ visible: boolean; current: Organization | null }>({ visible: false, current: null })

function openForm(row?: Organization) {
  form.current = row ?? null
  form.visible = true
}

function closeForm() {
  form.visible = false
  form.current = null
}

async function saveForm(payload: OrganizationSave) {
  await saveOrganization(payload)
  closeForm()
}

async function deleteRow(row: Organization) {
  await deleteOrganization(row.id_organization)
}

async function restoreRow(row: Organization) {
  await restoreOrganization(row.id_organization)
}
</script>
