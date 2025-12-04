<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ form.id ? 'Изменить операцию' : 'Добавить кадровую операцию' }}</h3>

      <div v-if="error" class="error-box">{{ error }}</div>

      <label>Сотрудник</label>
      <EmployeeCombobox
        v-model="selectedEmployee"
        :list="employeeList"
        :disabled="!!form.id"
        placeholder="ФИО"
        item-type="employee"
      />

      <label>Организация</label>
      <select v-model="form.organizationId" @change="onOrgChange" :disabled="!!form.id">
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
        :list="positionList"
        :disabled="!form.departmentId"
        placeholder="Должность"
        item-type="position"
      />

      <label>Зарплата</label>
      <input type="number" v-model.number="form.salary" step="1" @input="onSalaryInput" />

      <div v-if="form.id" class="form-row status-row">
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
import type { HrOperation, HrOperationSave } from '@/entities/hrOperation.ts'
import type { Employee } from '@/entities/employee.ts'
import type { Department } from '@/entities/department.ts'
import type { Position } from '@/entities/position.ts'
import type { Organization } from '@/entities/organization.ts'

const props = defineProps<{
  visible: boolean
  payload: HrOperation | null
  onSave: (data: HrOperationSave) => Promise<void>
  employeeList: Employee[]
  orgList: Organization[]
  departmentList: Department[]
  positionList: Position[]
  existingOperations: HrOperation[]
}>()

const emit = defineEmits<{ (e: 'cancel'): void }>()

const form = reactive({
  id: null as number | null,
  employeeId: null as number | null,
  organizationId: null as number | null,
  departmentId: null as number | null,
  positionId: null as number | null,
  salary: null as number | null,
  is_active: true
})
const error = ref('')

const selectedEmployee = ref<Employee | null>(null)
const selectedPosition = ref<Position | null>(null)

const activeOrganizations = computed(() => props.orgList.filter(o => !o.deleted_at))

const filteredDepartments = computed(() => {
  if (!form.organizationId) return []
  return props.departmentList.filter(
    d => d.id_organization === form.organizationId && !d.deleted_at
  )
})

watch(
  () => props.payload,
  (p) => {
    error.value = ''

    if (!p) {
      resetForm(true)
      return
    }

    form.id = p.id_hr_operation
    form.salary = p.salary
    form.is_active = p.is_active
    form.employeeId = p.id_employee
    form.departmentId = p.id_department
    form.positionId = p.id_position

    const emp = props.employeeList.find(e => e.id_employee === p.id_employee) ?? null
    const dept = props.departmentList.find(d => d.id_department === p.id_department) ?? null
    const pos = props.positionList.find(pos => pos.id_position === p.id_position) ?? null

    selectedEmployee.value = emp
    selectedPosition.value = pos
    form.organizationId = dept?.id_organization ?? null
  },
  { immediate: true }
)

function onOrgChange() {
  form.departmentId = null
  selectedPosition.value = null
  form.positionId = null
}

watch(selectedEmployee, (emp) => {
  form.employeeId = emp?.id_employee ?? null
})

watch(selectedPosition, (pos) => {
  form.positionId = pos?.id_position ?? null
})

function onSalaryInput(e: Event) {
  const input = e.target as HTMLInputElement
  let val = input.value
  val = val.replace(/\D/g, '')
  val = val.replace(/^0+/, '')
  input.value = val
  form.salary = val ? Number(val) : null
}

function resetForm(clearId = false) {
  if (clearId) form.id = null

  form.employeeId = null
  form.organizationId = null
  form.departmentId = null
  form.positionId = null
  form.salary = null
  form.is_active = true

  selectedEmployee.value = null
  selectedPosition.value = null

  error.value = ''
}

function hasActiveOperationForEmployee(employeeId: number): boolean {
  return props.existingOperations.some(op =>
    op.id_employee === employeeId &&
    op.is_active &&
    op.deleted_at == null &&
    op.id_hr_operation !== form.id
  )
}

async function submit() {
  error.value = ''
  if (!form.id && form.employeeId && hasActiveOperationForEmployee(form.employeeId)) {
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
      is_active: form.is_active
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
  margin-top: 15px;
}
.status-radio-group {
  margin-top: 5px;
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
  -webkit-appearance: none;
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
