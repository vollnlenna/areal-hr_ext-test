<template>
  <div class="card" style="height: 500px">
    <div class="card-body">
      <div class="card-title">{{ row.name }}</div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Организация:</div>
        <div class="comment-content org-block" :class="{ 'org-deleted': orgIsDeleted }" :title="orgTitle">
          <div class="comment-scroll">
            <template v-if="org && !orgIsDeleted">
              {{ org.name }}
            </template>
            <template v-else-if="orgIsDeleted">
              Организация удалена (<span class="org-deleted-name">{{ org?.name }}</span>)
            </template>
            <template v-else>
              Организация #{{ row.id_organization }} (не найдена)
            </template>
          </div>
        </div>
      </div>

      <div class="sep" />

      <div class="subtree-block">
        <div class="subtree-header">
          <div class="comment-label">Подразделения:</div>
          <div class="tree-toolbar">
            <button class="icon-btn" title="Добавить" @click="$emit('sub-add', selectedId ?? row.id_department)">
              <Icon icon="mdi:plus" width="16" />
            </button>
            <button class="icon-btn" title="Переименовать" :disabled="!selectedId" @click="selectedId && $emit('sub-rename', selectedId!)">
              <Icon icon="mdi:pencil-outline" width="16" />
            </button>
            <button v-if="isAdmin" class="icon-btn" title="Удалить" :disabled="!selectedId" @click="selectedId && onDeleteSub(selectedId!)">
              <Icon icon="mdi:trash-can-outline" width="16" />
            </button>
          </div>
        </div>

        <div class="subtree-content">
          <em class="card-tree-font" v-if="!flatTree.length">нет</em>
          <ul v-else class="tree-list">
            <li v-for="item in flatTree" :key="item.id">
              <div class="tree-row">
                <span class="tree-indent" :style="{ width: item.level * 16 + 'px' }"></span>
                <button class="toggle" v-if="item.hasChildren" @click.stop="toggle(item.id)" :title="expandedSet.has(item.id) ? 'Свернуть' : 'Развернуть'">
                  <Icon v-if="expandedSet.has(item.id)" icon="mdi:chevron-down" width="14" />
                  <Icon v-else icon="mdi:chevron-right" width="14" />
                </button>
                <span v-else class="toggle placeholder" />
                <div class="tree-item card-tree-font" :class="{ selected: selectedId === item.id }" :title="item.name" @click="select(item.id)">
                  {{ item.name }}
                </div>
              </div>
            </li>
          </ul>
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
        <button v-if="isAdmin" class="btn-delete" :disabled="!!row.deleted_at" @click="onDeleteCard">Удалить</button>
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
import { computed, ref, watch, watchEffect } from 'vue'
import { Icon } from '@iconify/vue'
import type { Department } from '@/entities/department.ts'
import type { Organization } from '@/entities/organization.ts'
import { useAuth } from '@/composables/useAuth'

const { isAdmin } = useAuth();

type FlatItem = { id: number; name: string; level: number; hasChildren: boolean }

const props = defineProps<{
  row: Department
  organizations: Organization[]
  departments: Department[]
}>()

const emit = defineEmits<{
  (e: 'edit', row: Department): void
  (e: 'delete', row: Department): void
  (e: 'restore', row: Department): void
  (e: 'sub-add', parentId: number): void
  (e: 'sub-rename', id: number): void
  (e: 'sub-delete', id: number): void
}>()

const org = computed<Organization | null>(
  () => props.organizations.find(o => o.id_organization === props.row.id_organization) ?? null
)
const orgIsDeleted = computed(() => !!org.value?.deleted_at)
const orgTitle = computed(() => {
  if (!org.value) return `Организация #${props.row.id_organization} (не найдена)`
  return orgIsDeleted.value ? `Организация удалена (${org.value.name})` : org.value.name
})

const childrenMap = computed(() => {
  const m = new Map<number, Department[]>()
  for (const d of props.departments) {
    if (d.deleted_at) continue
    if (d.id_parent_department) {
      const arr = m.get(d.id_parent_department) ?? []
      arr.push(d)
      m.set(d.id_parent_department, arr)
    }
  }
  for (const [k, arr] of m) m.set(k, [...arr].sort((a, b) => a.name.localeCompare(b.name)))
  return m
})

const expandedSet = ref<Set<number>>(new Set())
watchEffect(() => {
  const set = new Set<number>()
  const m = childrenMap.value
  ;(function mark(id: number) {
    const kids = m.get(id) ?? []
    if (kids.length) {
      set.add(id)
      for (const k of kids) mark(k.id_department)
    }
  })(props.row.id_department)
  expandedSet.value = set
})

const flatTree = computed<FlatItem[]>(() => {
  const res: FlatItem[] = []
  const m = childrenMap.value
  ;(function walk(parentId: number, level: number) {
    const kids = m.get(parentId) ?? []
    for (const child of kids) {
      const hasChildren = (m.get(child.id_department)?.length ?? 0) > 0
      res.push({ id: child.id_department, name: child.name, level, hasChildren })
      if (expandedSet.value.has(child.id_department)) walk(child.id_department, level + 1)
    }
  })(props.row.id_department, 0)
  return res
})

function toggle(id: number) {
  const s = new Set(expandedSet.value)
  if (s.has(id)) s.delete(id)
  else s.add(id)
  expandedSet.value = s
}

const selectedId = ref<number | null>(null)
function select(id: number) {
  selectedId.value = selectedId.value === id ? null : id
}

function onDeleteSub(id: number) {
  if (!confirm('Удалить выбранный подраздел?')) return
  selectedId.value = null
  emit('sub-delete', id)
}

watch(
  () => props.departments,
  (arr) => {
    if (selectedId.value == null) return
    const exists = arr.some(d => d.id_department === selectedId.value && !d.deleted_at)
    if (!exists) selectedId.value = null
  },
  { deep: true }
)

function onDeleteCard() {
  if (!confirm('Вы точно хотите удалить этот отдел?')) return
  emit('delete', props.row)
}
function onRestore() {
  if (!confirm('Восстановить этот отдел?')) return
  emit('restore', props.row)
}
function formatDate(val: unknown) {
  if (!val) return ''
  try { return new Date(String(val)).toLocaleString() } catch { return String(val) }
}
</script>

<style scoped>
.card-tree-font { font-size: 11px; }
.subtree-block {  height: 200px; }
.tree-toolbar { display: flex; gap: 6px; }
.tree-list { margin: 0; padding: 0; list-style: none; min-width: max-content; }
.tree-row { display: flex; align-items: center; gap: 6px; margin: 4px 0; white-space: nowrap; width: 100%; }
.tree-indent { display: inline-block; height: 1px; }
.toggle {
  width: 18px; height: 18px; border-radius: 50%;
  border: 1px solid #aaa; background: #fff; cursor: pointer;
  display: inline-flex; align-items: center; justify-content: center; padding: 0;
}
.toggle.placeholder { visibility: hidden; }
.tree-item {
  border: 1px solid #e6e6e6;
  background: #f7f7f7;
  border-radius: 6px;
  padding: 4px 8px;
  color: #222;
  cursor: pointer;
}
.tree-item:hover { background: #f0f0f0; }
.tree-item.selected { background: #e9e9e9; border-color: #aaa; }
.org-block.org-deleted { color: red; }
.org-deleted-name { font-style: italic; }
</style>
