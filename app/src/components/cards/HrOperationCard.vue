<template>
  <div class="card" style="height: 450px">
    <div class="card-body">
      <div class="card-title">
        {{ formatEmployeeName(row.employee_name) }}
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Организация:</div>
        <div class="comment-content">{{ row.organization_name || '[Не найдена]' }}</div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Отдел:</div>
        <div class="comment-content">{{ row.department_name || '[Не найден]' }}</div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Должность:</div>
        <div class="comment-content">{{ row.position_name || '[Не найдена]' }}</div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Зарплата:</div>
        <div class="comment-content">{{ formatCurrency(row.salary) }}</div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Статус:</div>
        <div class="comment-content">
          <em :class="{ 'status-inactive': !row.is_active }">
            {{ row.is_active ? 'Работает' : 'Уволен' }}
          </em>
        </div>
      </div>

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
import type { HrOperation } from '@/entities/hrOperation.ts'

const props = defineProps<{ row: HrOperation }>()
const emit = defineEmits<{
  (e: 'edit', row: HrOperation): void
  (e: 'delete', row: HrOperation): void
  (e: 'restore', row: HrOperation): void
}>()

function onDelete() {
  if (!confirm('Вы уверены, что хотите удалить эту запись?')) return
  emit('delete', props.row)
}

function onRestore() {
  if (!confirm('Восстановить эту запись?')) return
  emit('restore', props.row)
}

function formatEmployeeName(val: unknown): string {
  if (!val || String(val).trim() === '' || val === 'null') {
    return '[Сотрудник не найден]'
  }
  return String(val)
}

function formatDate(val: unknown) {
  if (!val) return ''
  const d = new Date(String(val))
  return isNaN(d.getTime()) ? String(val) : d.toLocaleString('ru-RU')
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(value)
}
</script>

<style scoped>
.status-inactive {
  color: red;
}
</style>
