<template>
  <div class="card" :class="{ deleted: !!row.deleted_at }" style="height: 150px">
    <div class="card-body">
      <div class="card-title">{{ row.name }}</div>

      <div class="sep" />

      <div class="card-actions">
        <button class="btn-edit" :disabled="!!row.deleted_at" @click="$emit('edit', row)">Изменить</button>
        <button class="btn-delete" :disabled="!!row.deleted_at" @click="onDelete">Удалить</button>
      </div>
    </div>

    <div v-if="row.deleted_at" class="deleted-overlay">
      <div class="deleted-content">
        <div>Удалено: {{ formatDate(row.deleted_at) }}</div>
        <button class="btn-restore" @click="onRestore">Восстановить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
type PositionRow = {
  id_position: number
  name: string
  deleted_at?: string | null
}

const props = defineProps<{ row: PositionRow }>()
const emit = defineEmits<{
  (e: 'edit', row: PositionRow): void
  (e: 'delete', row: PositionRow): void
  (e: 'restore', row: PositionRow): void
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
