<template>
  <div class="page">
    <div class="top-row">
      <input
        v-model="searchQuery"
        class="search-input"
        placeholder="Поиск..."
      />

      <select v-model="filterObjectType" class="object-select">
        <option value="Все объекты">Все объекты</option>
        <option
          v-for="(obj, key) in OBJECT_MAP"
          :key="key"
          :value="obj.name"
        >
          {{ obj.plural }}
        </option>
      </select>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
        <tr>
          <th>Объект</th>
          <th>ID объекта</th>
          <th>Поле</th>
          <th>Старое значение</th>
          <th>Новое значение</th>
          <th>Дата и время операции</th>
          <th>Кто изменил</th>
        </tr>
        </thead>

        <tbody>
        <tr v-for="row in finalList" :key="row.id_change_history">
          <td>{{ row.objectType }}</td>
          <td>{{ row.objectId ?? 'N/A' }}</td>
          <td>{{ row.field_name ?? 'N/A' }}</td>
          <td>{{ formatValue(row.old_value, row.field_name) }}</td>
          <td>{{ formatValue(row.new_value, row.field_name) }}</td>
          <td>{{ formatDate(row.changed_at) }}</td>
          <td>{{ row.userName }}</td>
        </tr>
        </tbody>
      </table>

      <div v-if="!loading && !finalList.length" class="no-data">
        Нет записей
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useChangeHistory } from '../composables/useChangeHistory'

const searchQuery = ref('')
const filterObjectType = ref('Все объекты')

const {
  historyList,
  loadHistory,
  loadUsers,
  loading,
  OBJECT_MAP
} = useChangeHistory()

function formatValue(
  val: string | null | undefined,
  field?: string | null
): string {
  if (!val) return '—'

  if (field?.startsWith('id_')) return val

  const dateFields = new Set([
    'birth_date',
    'passport_issue_date',
    'deleted_at'
  ])
  if (!dateFields.has(field ?? '')) return val

  const parsed = new Date(val)
  if (!isNaN(parsed.getTime())) {
    if (field === 'deleted_at') {
      return parsed.toLocaleString('ru-RU')
    }
    return parsed.toLocaleDateString('ru-RU')
  }

  return val
}

function formatDate(date: unknown) {
  return new Date(String(date)).toLocaleString('ru-RU')
}

const finalList = computed(() => {
  let list = historyList.value
  const q = searchQuery.value.toLowerCase().trim()

  if (filterObjectType.value !== 'Все объекты') {
    list = list.filter(x => x.objectType === filterObjectType.value)
  }
  if (q) {
    list = list.filter(x =>
      JSON.stringify(x).toLowerCase().includes(q)
    )
  }
  return list
})

onMounted(async () => {
  await Promise.all([loadUsers(), loadHistory()])
})
</script>

<style scoped>
.top-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 15px;
}
.top-row select,
.top-row input {
  padding: 8px;
  margin: 0;
  border-radius: 8px;
}
.object-select {
  width: 220px;
}
.table-wrap {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
th {
  background: #f4f4f4;
  padding: 8px;
}
td {
  padding: 8px;
  border-top: 1px solid #eee;
}
.no-data {
  margin-top: 15px;
  text-align: center;
  color: #777;
}
</style>
