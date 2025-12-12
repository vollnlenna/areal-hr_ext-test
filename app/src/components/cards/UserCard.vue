<template>
  <div class="card" style="height: 320px">
    <div class="card-body">
      <div class="card-title">{{ row.fullName }}</div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Роль:</div>
        <div class="comment-content">{{ getRoleName(row.id_role) }}</div>
      </div>

      <div class="sep" />

      <div class="card-comment">
        <div class="comment-label">Логин:</div>
        <div class="comment-content">{{ row.login }}</div>
      </div>

      <div class="sep" />

      <div class="password-block">
        <button
          class="change-password-btn"
          @click="$emit('change-password', row.id_user)"
          :disabled="!!row.deleted_at"
        >
          <Icon icon="mdi:pencil" width="16" />
          Поменять пароль
        </button>
      </div>

      <div class="sep" />

      <div class="card-actions">
        <button class="btn-edit" :disabled="!!row.deleted_at" @click="$emit('edit', row)">Изменить</button>
        <button class="btn-delete" :disabled="!!row.deleted_at" @click="onDeleteCard">Удалить</button>
      </div>
    </div>

    <div v-if="row.deleted_at" class="deleted-overlay">
      <div class="deleted-content">
        <div>Удалено: {{ formatDateTime(row.deleted_at) }}</div>
        <button class="btn-restore" @click="onRestore">Восстановить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import type { User, Role } from '@/entities/user'

const props = defineProps<{
  row: User
  roles: Role[]
  getRoleName: (id: number) => string
}>()

const emit = defineEmits<{
  (e: 'edit', row: User): void
  (e: 'delete', row: User): void
  (e: 'restore', row: User): void
  (e: 'change-password', id: number): void
}>()

function formatDateTime(val: string | undefined): string {
  if (!val) return ''
  return new Date(val).toLocaleString('ru-RU')
}

function onDeleteCard() {
  if (!confirm('Вы точно хотите удалить этого пользователя?')) return
  emit('delete', props.row)
}

function onRestore() {
  if (!confirm('Восстановить этого пользователя?')) return
  emit('restore', props.row)
}
</script>

<style scoped>
.password-block {
  padding: 12px 0;
}

.change-password-btn {
  width: 100%;
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
}
</style>
