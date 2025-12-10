<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ form.id ? 'Изменить операцию' : 'Добавить кадровую операцию' }}</h3>

      <div v-if="error" class="error-box">{{ error }}</div>

      <label>Сотрудник</label>
      <EmployeeCombobox
        v-model="selectedEmployee"
        :disabled="!!form.id && !!selectedEmployee?.id_employee"
        placeholder="ФИО"
        item-type="employee"
        :searchFn="employeeSearchFn"
      />

      <label>Организация</label>
      <select v-model="form.organizationId" @change="onOrgChange" :disabled="!!form.id && !!form.organizationId">
      <option :value="null" disabled>Выберите организацию</option>
        <option v-for="o in activeOrganizations" :key="o.id_organization" :value="o.id_organization">
          {{ o.name }}
        </option>
      </select>

      <label>Отдел</label>
      <select v-model="form.departmentId" :disabled="!form.organizationId">
        <option :value="null" disabled>Выберите отдел</option>
        <option v-for="d in filteredDepartments" :key="d.id_department" :value="d.id_department">
          {{ d.name }}
        </option>
      </select>

      <label>Должность</label>
      <EmployeeCombobox
        v-model="selectedPosition"
        :disabled="!form.departmentId"
        placeholder="Должность"
        item-type="position"
        :searchFn="positionSearchFn"
      />

      <label>Зарплата</label>
      <input type="number" v-model.number="form.salary" step="1" @input="onSalaryInput" />

      <div v-if="form.id" class="status-row">
        <label>Статус</label>
        <div class="status-radio-group">
          <label class="status-option">
            <input type="radio" :value="true" v-model="form.is_active" />
            <span>Работает</span>
          </label>
          <label class="status-option">
            <input type="radio" :value="false" v-model="form.is_active" />
            <span>Уволен</span>
          </label>
        </div>
      </div>

      <div class="modal-actions">
        <button class="btn-save" @click="submit">Сохранить</button>
        <button class="btn-cancel" @click="onCancel">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, computed } from 'vue'
import { isAxiosError } from 'axios'
import EmployeeCombobox from '../common/EmployeeCombobox.vue'
import type { SearchFn, ComboboxItem, EmployeeLike, PositionLike } from '../common/EmployeeCombobox.vue'
import { useOrganizations } from '@/composables/useOrganizations'
import { useDepartments } from '@/composables/useDepartments'
import { useEmployees } from '@/composables/useEmployees'
import { usePositions } from '@/composables/usePositions'
import type { HrOperation, HrOperationSave } from '@/entities/hrOperation'

const props = defineProps<{
  visible: boolean
  payload: HrOperation | null
  onSave: (data: HrOperationSave) => Promise<void>
  existingOperations: HrOperation[]
}>()

const emit = defineEmits<{ (e: 'cancel'): void }>()

const { actualList: organizations, loadOrganizations } = useOrganizations()
const { actualList: departments, loadDepartments } = useDepartments()
const { searchEmployees, getEmployeeById } = useEmployees()
const { searchPositions, getPositionById } = usePositions()

const employeeSearchFn: SearchFn<ComboboxItem> = ({ q, limit, offset }) => searchEmployees(q, limit, offset)
const positionSearchFn: SearchFn<ComboboxItem> = ({ q, limit, offset }) => searchPositions(q, limit, offset)

const form = reactive({
  id: null as number | null,
  employeeId: null as number | null,
  organizationId: null as number | null,
  departmentId: null as number | null,
  positionId: null as number | null,
  salary: null as number | null,
  is_active: true,
})

const error = ref('')
const selectedEmployee = ref<EmployeeLike | null>(null)
const selectedPosition = ref<PositionLike | null>(null)

watch(() => props.visible, async (visible) => {
  if (visible) {
    await Promise.all([
      loadOrganizations(),
      loadDepartments(),
    ])

    const p = props.payload
    if (p) {
      error.value = ''

      form.id = p.id_hr_operation
      form.salary = p.salary
      form.is_active = p.is_active
      form.employeeId = p.id_employee
      form.departmentId = p.id_department
      form.positionId = p.id_position

      form.organizationId = departments.value
        .find(d => d.id_department === p.id_department)?.id_organization ?? null

      if (p.id_employee) {
        const emp = await getEmployeeById(p.id_employee)
        if (emp) {
          selectedEmployee.value = {
            id_employee: emp.id_employee,
            last_name: emp.last_name,
            first_name: emp.first_name,
            middle_name: emp.middle_name ?? null,
          }
        }
      }
      if (p.id_position) {
        const pos = await getPositionById(p.id_position)
        if (pos) {
          selectedPosition.value = {
            id_position: pos.id_position,
            name: pos.name,
          }
        }
      }
    }
  } else {
    resetForm(true)
  }
})

const activeOrganizations = computed(() => organizations.value.filter(o => !o.deleted_at))
const filteredDepartments = computed(() =>
  form.organizationId
    ? departments.value.filter(d => d.id_organization === form.organizationId && !d.deleted_at)
    : []
)

watch(selectedEmployee, (emp) => {
  form.employeeId = emp?.id_employee ?? null
})
watch(selectedPosition, (pos) => {
  form.positionId = pos?.id_position ?? null
})

function onOrgChange() {
  form.departmentId = null
  selectedPosition.value = null
  form.positionId = null
}

function onSalaryInput(e: Event) {
  const input = e.target as HTMLInputElement
  const cleaned = input.value.replace(/\D/g, '').replace(/^0+/, '')
  input.value = cleaned
  form.salary = cleaned ? Number(cleaned) : null
}

function resetForm(clearId = false) {
  if (clearId) form.id = null

  form.employeeId = form.organizationId = form.departmentId = form.positionId = form.salary = null
  form.is_active = true
  selectedEmployee.value = selectedPosition.value = null
  error.value = ''
}

function hasActiveOperation(employeeId: number): boolean {
  return props.existingOperations.some(op =>
    op.id_employee === employeeId && op.is_active && !op.deleted_at && op.id_hr_operation !== form.id
  )
}

async function submit() {
  error.value = ''
  if (!form.id && form.employeeId && hasActiveOperation(form.employeeId)) {
    error.value = 'Этот сотрудник уже работает!'
    return
  }
  try {
    await props.onSave({
      id_hr_operation: form.id ?? undefined,
      id_employee: form.employeeId ?? undefined,
      id_department: form.departmentId ?? undefined,
      id_position: form.positionId ?? undefined,
      salary: form.salary ?? undefined,
      is_active: form.is_active,
    })
  } catch (e) {
    if (isAxiosError(e)) {
      const msg = e.response?.data?.message ?? 'Ошибка сохранения'
      error.value = Array.isArray(msg) ? msg.join(', ') : msg
    } else {
      error.value = 'Неизвестная ошибка'
    }
  }
}

function onCancel() {
  resetForm(false)
  emit('cancel')
}
</script>

<style scoped>
.status-row {
  margin: 15px 0 5px;
}
.status-radio-group {
  display: flex;
  gap: 20px;
  align-items: center;
}
.status-option {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.status-option input[type='radio'] {
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid black;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 0;
  margin: 0;
}
.status-option input[type='radio']::before {
  content: '';
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: black;
  transform: scale(0);
}
.status-option input[type='radio']:checked::before {
  transform: scale(1);
}
</style>
