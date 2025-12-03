<template>
  <div class="card">
    <div class="card-body">
      <div class="card-title">{{ row.name }}</div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Комментарий:</div>
        <div class="comment-content" :title="row.comment ?? 'нет'">
          <em v-if="!row.comment">нет</em>
          <div v-else class="comment-scroll">{{ row.comment }}</div>
        </div>
      </div>

      <div class="sep" />

      <div class="card-actions">
        <button
          class="btn-edit"
          :disabled="!!row.deleted_at"
          @click="$emit('edit', row)"
        >
          Изменить
        </button>

        <button
          class="btn-delete"
          :disabled="!!row.deleted_at"
          @click="onDelete"
        >
          Удалить
        </button>
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
import type { Organization } from '@/entities/organization.ts'

const props = defineProps<{ row: Organization }>()
const emit = defineEmits<{
  (e: 'edit', row: Organization): void
  (e: 'delete', row: Organization): void
  (e: 'restore', row: Organization): void
}>()

function onDelete() {
  if (!confirm('Вы точно хотите удалить эту организацию?')) return
  emit('delete', props.row)
}

function onRestore() {
  if (!confirm('Восстановить эту организацию?')) return
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
