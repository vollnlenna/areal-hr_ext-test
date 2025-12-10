<template>
  <div class="combobox-container">
    <input
      v-model="localQuery"
      type="text"
      :placeholder="placeholder"
      @focus="onFocus"
      @blur="onBlur"
      :disabled="disabled"
    />
    <div v-if="showDropdown" class="combobox-dropdown">
      <div
        v-for="item in items"
        :key="getUniqueId(item)"
        class="dropdown-item"
        @mousedown.prevent="selectItem(item)"
      >
        {{ formatItem(item) }}
      </div>
      <div v-if="loading" class="dropdown-item disabled">Загрузка…</div>
      <div v-if="!loading && !items.length" class="dropdown-item disabled">Ничего не найдено</div>
      <button
        v-if="hasMore && !loading && items.length"
        class="show-more"
        @mousedown.prevent="onShowMore"
      >
        Показать ещё
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

export interface EmployeeLike {
  id_employee: number
  last_name: string
  first_name: string
  middle_name?: string | null
}
export interface PositionLike {
  id_position: number
  name: string
}
export type ComboboxItem = EmployeeLike | PositionLike
export interface SearchParams {
  q: string
  limit: number
  offset: number
}
export interface SearchResult<T> {
  items: T[]
  hasMore: boolean
}
export type SearchFn<T> = (params: SearchParams) => Promise<SearchResult<T>>

const props = defineProps<{
  modelValue: ComboboxItem | null
  disabled: boolean
  placeholder: string
  itemType: 'employee' | 'position'
  searchFn: SearchFn<ComboboxItem>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ComboboxItem | null): void
}>()

const localQuery = ref('')
const showDropdown = ref(false)
const items = ref<ComboboxItem[]>([])
const loading = ref(false)
const hasMore = ref(true)
const limit = 5
const offset = ref(0)

let lastQuery = ''
let timer: number | undefined

function getUniqueId(item: ComboboxItem): number {
  return 'id_employee' in item ? item.id_employee : item.id_position
}

function formatItem(item: ComboboxItem): string {
  if ('id_employee' in item) {
    const emp = item as EmployeeLike
    const middle = emp.middle_name ? ` ${emp.middle_name}` : ''
    return `${emp.last_name} ${emp.first_name}${middle}`
  }
  const pos = item as PositionLike
  return pos.name
}

function isItemExists(newItem: ComboboxItem): boolean {
  const id = getUniqueId(newItem)
  return items.value.some(item => getUniqueId(item) === id)
}

const load = async (reset: boolean) => {
  if (loading.value || props.disabled) return
  if (reset) {
    items.value = []
    offset.value = 0
    hasMore.value = true
  }
  if (!hasMore.value) return

  loading.value = true
  try {
    const res = await props.searchFn({
      q: localQuery.value.trim(),
      limit,
      offset: offset.value,
    })
    const newItems = res.items.filter(item => !isItemExists(item))
    items.value.push(...newItems)
    hasMore.value = res.hasMore
    offset.value += limit
  } catch {
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

function onFocus() {
  if (props.disabled) return
  showDropdown.value = true
  load(true)
}

function onBlur() {
  setTimeout(() => {
    showDropdown.value = false
  }, 150)
}

watch(
  () => localQuery.value,
  (value) => {
    if (value === lastQuery) return
    lastQuery = value

    if (timer) window.clearTimeout(timer)
    timer = window.setTimeout(() => load(true), 300)
  },
)

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      localQuery.value = ''
      items.value = []
      hasMore.value = true
      offset.value = 0
    } else {
      localQuery.value = formatItem(val)
    }
  },
  { immediate: true },
)

function selectItem(item: ComboboxItem) {
  localQuery.value = formatItem(item)
  emit('update:modelValue', item)
  showDropdown.value = false
}

function onShowMore() {
  load(false)
}
</script>

<style scoped>
.combobox-container {
  position: relative;
  width: 100%;
}
.combobox-dropdown {
  position: absolute;
  z-index: 100;
  background: white;
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
  width: 100%;
  margin-top: 2px;
  border-radius: 4px;
}
.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
}
.dropdown-item.disabled {
  color: #777;
  cursor: default;
}
.show-more {
  width: 100%;
  padding: 8px 12px;
  background-color: white;
  text-align: center;
  color: #777;
  border: none;
  outline: none;
  cursor: pointer;
}
.dropdown-item:hover,
.show-more:hover {
  background-color: #f0f0f0;
}
</style>
