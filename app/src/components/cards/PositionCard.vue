<template>
  <div class="card" style="height: 150px">
    <div class="card-body">
      <div class="card-title">{{ row.name }}</div>

      <div class="sep" />

      <div class="card-actions">
        <button class="btn-edit" :disabled="!!row.deleted_at" @click="$emit('edit', row)">Изменить</button>
        <button v-if="isAdmin" class="btn-delete" :disabled="!!row.deleted_at" @click="onDelete">Удалить</button>
      </div>
    </div>

    <div v-if="row.deleted_at" class="deleted-overlay">
      <div class="deleted-content">
        <div>Удалено: {{ formatDate(row.deleted_at) }}</div>
        <button v-if="isAdmin" class="btn-restore" @click="onRestore">Восстановить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Position } from '@/entities/position.ts'
import { useAuth } from '@/composables/useAuth'

const { isAdmin } = useAuth();

const props = defineProps<{ row: Position }>()
const emit = defineEmits<{
  (e: 'edit', row: Position): void
  (e: 'delete', row: Position): void
  (e: 'restore', row: Position): void
}>()

function onDelete() {
  if (!confirm('Вы точно хотите удалить эту должность?')) return
  emit('delete', props.row)
}

function onRestore() {
  if (!confirm('Восстановить эту должность?')) return
  emit('restore', props.row)
}

function formatDate(val: unknown) {
  if (!val) return ''
  try {
    return new Date(String(val)).toLocaleString()
  } catch {
    return String(val)
  }
}
</script>
