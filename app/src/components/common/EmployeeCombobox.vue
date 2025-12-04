<template>
  <div class="combobox-container">
    <input
      v-model="searchQuery"
      type="text"
      :placeholder="placeholder"
      @focus="showDropdown = true"
      @blur="onBlur"
      :disabled="disabled"
    />
    <div v-if="showDropdown && filteredList.length" class="combobox-dropdown">
      <div
        v-for="item in filteredList"
        :key="getUniqueId(item)"
        class="dropdown-item"
        @mousedown.prevent="selectItem(item)"
      >
        {{ formatItem(item) }}
      </div>
    </div>
    <div v-else-if="showDropdown && searchQuery.length && !filteredList.length" class="combobox-dropdown">
      <div class="dropdown-item disabled">Ничего не найдено</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface EmployeeLike {
  id_employee: number
  last_name: string
  first_name: string
  middle_name?: string | null
  name?: never
}

interface PositionLike {
  id_position: number
  name: string
  last_name?: never
  first_name?: never
}

type ComboboxItem = EmployeeLike | PositionLike

const props = defineProps<{
  modelValue: ComboboxItem | null
  list: ComboboxItem[]
  disabled: boolean
  placeholder: string
  itemType: 'employee' | 'position'
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: ComboboxItem | null): void
}>()

const searchQuery = ref('')
const showDropdown = ref(false)

function getUniqueId(item: ComboboxItem): number {
  if ('id_employee' in item) return item.id_employee
  return item.id_position
}

function formatItem(item: ComboboxItem): string {
  if (props.itemType === 'employee') {
    const emp = item as EmployeeLike
    const middle = emp.middle_name ? ` ${emp.middle_name}` : ''
    return `${emp.last_name} ${emp.first_name}${middle}`
  }
  const pos = item as PositionLike
  return pos.name
}

watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      searchQuery.value = ''
    } else {
      searchQuery.value = formatItem(val)
    }
  },
  { immediate: true }
)

function selectItem(item: ComboboxItem) {
  searchQuery.value = formatItem(item)
  emit('update:modelValue', item)
  showDropdown.value = false
}

const filteredList = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) return props.list
  return props.list.filter(item =>
    formatItem(item).toLowerCase().includes(query)
  )
})

watch(searchQuery, (newQuery) => {
  const trimmed = newQuery.trim()
  if (!trimmed) {
    emit('update:modelValue', null)
    return
  }

  const exactMatch = props.list.find(item => formatItem(item) === trimmed)
  if (exactMatch) {
    emit('update:modelValue', exactMatch)
  } else {
    emit('update:modelValue', null)
  }
})

function onBlur() {
  setTimeout(() => {
    if (!props.modelValue && searchQuery.value.length > 0) {
      searchQuery.value = ''
    } else if (props.modelValue && formatItem(props.modelValue) !== searchQuery.value) {
      searchQuery.value = formatItem(props.modelValue)
    }
    showDropdown.value = false
  }, 200)
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
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
.dropdown-item:hover {
  background-color: #f0f0f0;
}
.dropdown-item.disabled {
  cursor: default;
  color: #999;
  background-color: #fff;
}
</style>
