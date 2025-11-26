<template>
  <div class="card" style="height: 400px">
    <div class="card-body">
      <div class="card-title">{{ row.name }}</div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Организация:</div>
        <div class="comment-content" :title="organizationName || 'нет'">
          <em v-if="!organizationName">нет</em>
          <div v-else class="comment-scroll">{{ organizationName }}</div>
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Вышестоящий отдел:</div>
        <div class="comment-content" :title="parentDepartmentName || 'нет'">
          <em v-if="!parentDepartmentName">нет</em>
          <div v-else class="comment-scroll">{{ parentDepartmentName }}</div>
        </div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Комментарий:</div>
        <div class="comment-content" :title="row.comment || 'нет'">
          <em v-if="!row.comment">нет</em>
          <div v-else class="comment-scroll">{{ row.comment }}</div>
        </div>
      </div>

      <div class="sep" />

      <div class="card-actions">
        <button class="btn-edit" :disabled="!!row.deleted_at" @click="$emit('edit', row)">Изменить</button>
        <button class="btn-delete" :disabled="!!row.deleted_at" @click="onDelete">Удалить</button>
      </div>
    </div>

    <div v-if="row.deleted_at" class="deleted-overlay">
      <div>Удалено: {{ formatDate(row.deleted_at) }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type Dept = {
  id_department: number
  name: string
  id_organization: number
  id_parent_department?: number | null
  comment?: string | null
  deleted_at?: string | null
}

type Props = {
  row: Dept
  organizations: { id_organization: number; name: string }[]
  departments: { id_department: number; name: string }[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'edit', row: Dept): void
  (e: 'delete', row: Dept): void
}>()

const organizationName = computed(
  () => props.organizations.find(o => o.id_organization === props.row.id_organization)?.name ?? null
)

const parentDepartmentName = computed(() =>
  props.row.id_parent_department
    ? props.departments.find(d => d.id_department === props.row.id_parent_department)?.name ?? null
    : null
)

function onDelete() {
  if (!confirm('Вы точно хотите удалить этот отдел?')) return
  emit('delete', props.row)
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
