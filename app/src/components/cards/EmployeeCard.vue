<template>
  <div class="card" style="height: 550px">
    <div class="card-body">
      <div class="card-title">{{ fullName }}</div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Дата рождения:</div>
        <div class="comment-content">{{ formatDate(row.birth_date) }}</div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Паспортные данные:</div>
        <div class="comment-content">
          <div class="comment-scroll">{{ row.passport_data }}</div>
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Адрес регистрации:</div>
        <div class="comment-content">
          <div class="comment-scroll">{{ row.registration_address }}</div>
        </div>
      </div>

      <div class="sep" />

      <div class="subtree-block">
        <div class="subtree-header">
          <div class="comment-label">Скан паспорта:</div>
          <button class="icon-btn" title="Добавить скан" @click="openScanModal" :disabled="!!row.deleted_at">
            <Icon icon="mdi:plus" width="16" />
          </button>
        </div>

        <div class="subtree-content comment-content">
          <em v-if="!scans.length">нет</em>
          <ul v-else class="scan-list">
            <li v-for="scan in scans" :key="scan.id_passport_scan" class="scan-item">
              <div class="scan-info" :title="scan.file_name">
                <Icon icon="mdi:file-outline" width="16" class="file-icon" />
                <a :href="getFileUrl(scan.file_path)" target="_blank" class="scan-link">
                  {{ scan.file_name }}
                </a>
              </div>
              <button class="icon-btn" title="Удалить скан" @click="onDeleteScan(scan)" :disabled="!!row.deleted_at">
                <Icon icon="mdi:close" width="14" />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <div class="sep" />

      <div class="card-actions">
        <button class="btn-edit" :disabled="!!row.deleted_at" @click="$emit('edit', row)">Изменить</button>
        <button class="btn-delete" :disabled="!!row.deleted_at" @click="onDeleteCard">Удалить</button>
      </div>
    </div>

    <div v-if="row.deleted_at" class="deleted-overlay">
      <div class="deleted-content">
        <div>Удалено: {{ formatDateTime(row.deleted_at) }}</div>
        <button class="btn-restore" @click="onRestore">Восстановить</button>
      </div>
    </div>

    <ScanModal
      :visible="scanModal.visible"
      :employee-id="row.id_employee"
      @saved="afterScanSaved"
      @cancel="closeScanModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, reactive } from 'vue'
import { Icon } from '@iconify/vue'
import http from '../../api/http'
import ScanModal from '../modals/ScanModal.vue'
import type { Employee, PassportScan } from '@/entities/employee.ts'

const props = defineProps<{ row: Employee }>()
const emit = defineEmits<{
  (e: 'edit', row: Employee): void
  (e: 'delete', row: Employee): void
  (e: 'restore', row: Employee): void
}>()

const scans = ref<PassportScan[]>([])

const fullName = computed(() => {
  const { last_name, first_name, middle_name } = props.row
  return `${last_name} ${first_name}${middle_name ? ` ${middle_name}` : ''}`
})

function formatDate(val: string | undefined) {
  if (!val) return ''
  return new Date(val).toLocaleDateString('ru-RU')
}

function formatDateTime(val: string | undefined) {
  if (!val) return ''
  return new Date(val).toLocaleString('ru-RU')
}

function getFileUrl(filePath: string): string {
  return `/api/files/storage/${filePath}`;
}

async function loadScans() {
  try {
    const res = await http.get<PassportScan[]>(
      `/passport-scans/employee/${props.row.id_employee}`
    )
    scans.value = res.data
  } catch {
    scans.value = []
  }
}

watch(
  () => props.row.id_employee,
  () => void loadScans(),
  { immediate: true }
)

const scanModal = reactive({ visible: false })
function openScanModal() {
  scanModal.visible = true
}
function closeScanModal() {
  scanModal.visible = false
}
async function afterScanSaved() {
  scanModal.visible = false
  await loadScans()
}

async function onDeleteScan(scan: PassportScan) {
  if (!confirm('Удалить этот скан?')) return
  try {
    await http.delete(`/files/${scan.id_file}`)
    await loadScans()
  } catch { }
}

function onDeleteCard() {
  if (!confirm('Вы точно хотите удалить этого сотрудника?')) return
  emit('delete', props.row)
}

function onRestore() {
  if (!confirm('Восстановить этого сотрудника?')) return
  emit('restore', props.row)
}
</script>

<style scoped>
.scan-list {
  margin: 0;
  padding: 0;
  list-style: none;
  min-width: 100%;
}
.scan-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 8px;
  margin-bottom: 4px;
  border: 1px solid #e6e6e6;
  background: #f7f7f7;
  border-radius: 6px;
  transition: background 0.15s;
}
.scan-item:hover {
  background: #f0f0f0;
}
.scan-info {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  flex: 1;
}
.file-icon {
  color: #555;
}
.scan-link {
  font-size: 12px;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
  min-width: 0;
}
.scan-link:hover {
  text-decoration: underline;
}
</style>
