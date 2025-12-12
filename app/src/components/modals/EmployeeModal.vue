<template>
  <div v-if="visible" class="modal-backdrop" @click.self="onCancel">
    <div class="modal">
      <h3>{{ form.id ? 'Изменить сотрудника' : 'Добавить сотрудника' }}</h3>

      <div class="form-row">
        <label>Фамилия</label>
        <input v-model="form.last_name" />
      </div>

      <div class="form-row">
        <label>Имя</label>
        <input v-model="form.first_name" />
      </div>

      <div class="form-row">
        <label>Отчество</label>
        <input v-model="form.middle_name" />
      </div>

      <div class="form-row">
        <label>Дата рождения</label>
        <input v-model="form.birth_date" type="date" />
      </div>

      <div class="form-group">
        <h4>Паспортные данные</h4>

        <div class="form-row-group">
          <div class="form-row small">
            <label>Серия</label>
            <input
              v-model="form.passport_series"
              type="text"
              maxlength="4"
              placeholder="1234"
              @input="onSeriesInput"
              :class="{ 'input-error': fieldErrors.passport_series }"
            />
          </div>
          <div class="form-row small">
            <label>Номер</label>
            <input
              v-model="form.passport_number"
              type="text"
              maxlength="6"
              placeholder="567890"
              @input="onNumberInput"
              :class="{ 'input-error': fieldErrors.passport_number }"
            />
          </div>
        </div>

        <div class="form-row">
          <label>Кем выдан</label>
          <input
            v-model="form.passport_issued_by"
            @input="onTextInput('passport_issued_by')"
            :class="{ 'input-error': fieldErrors.passport_issued_by }"
          />
        </div>

        <div class="form-row">
          <label>Дата выдачи</label>
          <input
            v-model="form.passport_issue_date"
            type="date"
            @input="onTextInput('passport_issue_date')"
            :class="{ 'input-error': fieldErrors.passport_issue_date }"
          />
        </div>

        <div class="form-row small">
          <label>Код подразделения</label>
          <input
            v-model="form.passport_issuer_code"
            type="text"
            placeholder="123-456"
            @input="onUnitCodeInput"
            :class="{ 'input-error': fieldErrors.passport_issuer_code }"
          />
        </div>
      </div>

      <div class="form-group">
        <h4>Адрес регистрации</h4>

        <div class="form-row">
          <label>Область</label>
          <input
            v-model="address.region"
            @input="onTextInput('region')"
            :class="{ 'input-error': fieldErrors.region }"
          />
        </div>

        <div class="form-row">
          <label>Населенный пункт</label>
          <input
            v-model="address.locality"
            @input="onTextInput('locality')"
            :class="{ 'input-error': fieldErrors.locality }"
          />
        </div>

        <div class="form-row">
          <label>Улица</label>
          <input
            v-model="address.street"
            @input="onTextInput('street')"
            :class="{ 'input-error': fieldErrors.street }"
          />
        </div>

        <div class="form-row-group">
          <div class="form-row small">
            <label>Дом</label>
            <input
              v-model="address.house"
              type="text"
              @input="onPositiveIntInput('house', true)"
              :class="{ 'input-error': fieldErrors.house }"
            />
          </div>
          <div class="form-row small">
            <label>Корпус</label>
            <input
              v-model="address.building"
              type="text"
              @input="onPositiveIntInput('building', false)"
            />
          </div>
          <div class="form-row small">
            <label>Квартира</label>
            <input
              v-model="address.apartment"
              type="text"
              @input="onPositiveIntInput('apartment', true)"
              :class="{ 'input-error': fieldErrors.apartment }"
            />
          </div>
        </div>
      </div>

      <div v-if="errorBox" class="error-box">{{ errorBox }}</div>

      <div class="modal-actions">
        <button class="btn-save" @click="submit">Сохранить</button>
        <button class="btn-cancel" @click="onCancel">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import type { Employee, EmployeeSave } from '@/entities/employee.ts'

const props = defineProps<{
  visible: boolean
  payload: Employee | null
  onSave: (data: EmployeeSave) => Promise<void>
}>()

const emit = defineEmits<{ (e: 'cancel'): void }>()

const form = reactive({
  id: null as number | null,
  last_name: '',
  first_name: '',
  middle_name: '',
  birth_date: '',
  passport_series: '',
  passport_number: '',
  passport_issued_by: '',
  passport_issue_date: '',
  passport_issuer_code: ''
})

const address = reactive({
  region: '',
  locality: '',
  street: '',
  house: '',
  building: '',
  apartment: ''
})

const errorBox = ref('')

const fieldErrors = reactive<Record<string, boolean>>({
  passport_series: false,
  passport_number: false,
  passport_issued_by: false,
  passport_issue_date: false,
  passport_issuer_code: false,
  region: false,
  locality: false,
  street: false,
  house: false,
  apartment: false
})

function onTextInput(field: string) {
  if (field === 'passport_issued_by') {
    fieldErrors.passport_issued_by = !form.passport_issued_by.trim()
  } else if (field === 'passport_issue_date') {
    fieldErrors.passport_issue_date = !form.passport_issue_date
  } else if (field === 'region') {
    fieldErrors.region = !address.region.trim()
  } else if (field === 'locality') {
    fieldErrors.locality = !address.locality.trim()
  } else if (field === 'street') {
    fieldErrors.street = !address.street.trim()
  }
}

watch(
  () => props.payload,
  (p) => {
    errorBox.value = ''
    Object.keys(fieldErrors).forEach(k => (fieldErrors[k] = false))

    if (!p) {
      resetForm()
      return
    }

    form.id = p.id_employee
    form.last_name = p.last_name
    form.first_name = p.first_name
    form.middle_name = p.middle_name ?? ''
    if (p.birth_date) {
      const date = new Date(p.birth_date)
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        form.birth_date = `${year}-${month}-${day}`
      } else {
        form.birth_date = ''
      }
    } else {
      form.birth_date = ''
    }

    const passportMatch = p.passport_data.match(
      /(\d{4})\s* (\d{6})\s*, выдан (.+)\s* (.+)\s*, код подразделения ([\d-]+)/
    )
    if (passportMatch) {
      form.passport_series = passportMatch[1] || ''
      form.passport_number = passportMatch[2] || ''
      form.passport_issued_by = passportMatch[3] || ''

      const issueDateStr = passportMatch[4]
      if (issueDateStr) {
        const date = new Date(issueDateStr)
        form.passport_issue_date = !isNaN(date.getTime())
          ? date.toISOString().split('T')[0] ?? ''
          : ''
      } else {
        form.passport_issue_date = ''
      }

      form.passport_issuer_code = passportMatch[5] || ''
    } else {
      form.passport_series = ''
      form.passport_number = ''
      form.passport_issued_by = ''
      form.passport_issue_date = ''
      form.passport_issuer_code = ''
    }

    const parts = p.registration_address.split(',').map(x => x.trim());

    address.region   = parts[0] || "";
    address.locality = parts[1] || "";
    address.street   = parts[2] || "";
    address.house = parts[3]?.replace(/^д\.\s*/, "") || "";
    address.building = "";
    address.apartment = "";

    if (parts[4]?.startsWith("корп.")) {
      address.building = parts[4].replace(/^корп\.\s*/, "");
      address.apartment = parts[5]?.replace(/^кв\.\s*/, "") || "";
    }
    else if (parts[4]?.startsWith("кв.")) {
      address.apartment = parts[4].replace(/^кв\.\s*/, "");
    }
  },
  { immediate: true }
)

function resetForm() {
  Object.assign(form, {
    id: null,
    last_name: '',
    first_name: '',
    middle_name: '',
    birth_date: '',
    passport_series: '',
    passport_number: '',
    passport_issued_by: '',
    passport_issue_date: '',
    passport_issuer_code: ''
  })
  Object.assign(address, {
    region: '',
    locality: '',
    street: '',
    house: '',
    building: '',
    apartment: ''
  })
  errorBox.value = ''
}

function onSeriesInput() {
  form.passport_series = form.passport_series.replace(/\D/g, '').slice(0, 4)
  fieldErrors.passport_series = !form.passport_series.trim()
}

function onNumberInput() {
  form.passport_number = form.passport_number.replace(/\D/g, '').slice(0, 6)
  fieldErrors.passport_number = !form.passport_number.trim()
}

function onUnitCodeInput() {
  const digits = form.passport_issuer_code.replace(/\D/g, '').slice(0, 6)
  if (digits.length <= 3) {
    form.passport_issuer_code = digits
  } else {
    form.passport_issuer_code = `${digits.slice(0, 3)}-${digits.slice(3)}`
  }
  fieldErrors.passport_issuer_code = !form.passport_issuer_code.trim()
}

function onPositiveIntInput(field: 'house' | 'building' | 'apartment', required: boolean) {
  let val = address[field].replace(/\D/g, '')
  if (val && val.startsWith('0')) {
    val = val.replace(/^0+/, '')
  }
  address[field] = val
  if (!required) return
  fieldErrors[field] = !val.trim()
}

function buildPassportData(): string {
  const s = form.passport_series.trim()
  const n = form.passport_number.trim()
  const by = form.passport_issued_by.trim()
  const date = form.passport_issue_date.trim()
  const code = form.passport_issuer_code.trim()

  if (!s || !n || !by || !date || !code) {
    return ''
  }
  return `${s} ${n}, выдан ${by} ${date}, код подразделения ${code}`
}

function buildRegistrationAddress(): string {
  const region = address.region.trim()
  const locality = address.locality.trim()
  const street = address.street.trim()
  const house = address.house.trim()
  const flat = address.apartment.trim()

  if (!region || !locality || !street || !house) {
    return ''
  }

  const building = address.building.trim()
  return (
    `${region}, ` +
    `${locality}, ` +
    `${street}, ` +
    `д. ${house}` +
    (building ? `, корп. ${building}` : ``) +
    (flat ? `, кв. ${flat}` : ``)
  );
}

async function submit() {
  errorBox.value = ''

  const payload: EmployeeSave = {
    id_employee: form.id,
    last_name: form.last_name,
    first_name: form.first_name,
    middle_name: form.middle_name || null,
    birth_date: form.birth_date,
    passport_data: buildPassportData(),
    registration_address: buildRegistrationAddress()
  }

  try {
    await props.onSave(payload)

  } catch (e) {
    if (isAxiosError(e)) {
      const msg = e.response?.data?.message ?? 'Ошибка сохранения'
      errorBox.value = Array.isArray(msg) ? msg.join(', ') : msg
    } else {
      errorBox.value = 'Неизвестная ошибка'
    }
  }
}

function onCancel() {
  resetForm()
  emit('cancel')
}
</script>

<style scoped>
.form-group {
  margin-top: 20px;
}
.form-group h4 {
  margin-bottom: 10px;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 5px;
}
.form-row-group {
  display: flex;
  gap: 15px;
}
.form-row.small {
  flex: 1;
}
.error-box {
  margin-top: 20px;
  margin-bottom: auto;
}
.input-error {
  border-color: red;
}
</style>
