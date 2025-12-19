<template>
  <div v-if="$route.path === '/login'">
    <router-view />
  </div>
  <div v-else-if="!initializing" class="container">
    <nav v-if="isAuthenticated">
      <button class="tab logout" @click="handleLogout">Выход</button>
      <router-link to="/organizations" class="tab" :class="{ active: $route.path === '/organizations' }">Организации</router-link>
      <router-link to="/departments" class="tab" :class="{ active: $route.path === '/departments' }">Отделы</router-link>
      <router-link to="/positions" class="tab" :class="{ active: $route.path === '/positions' }">Должности</router-link>
      <router-link to="/employees" class="tab" :class="{ active: $route.path === '/employees' }">Сотрудники</router-link>
      <router-link to="/hrOperations" class="tab" :class="{ active: $route.path === '/hrOperations' }">Кадровые операции</router-link>
      <router-link to="/change-history" class="tab" :class="{ active: $route.path === '/change-history' }">История изменений</router-link>
      <router-link v-if="isAdmin" to="/users" class="tab" :class="{ active: $route.path === '/users' }">Пользователи</router-link>
    </nav>
    <router-view />
  </div>

  <div v-else class="loader">
    Загрузка...
  </div>
</template>

<script setup lang="ts">
import { useAuth } from './composables/useAuth';
import { useRouter } from 'vue-router';

const { isAuthenticated, isAdmin, logout, initializing } = useAuth();
const router = useRouter();

async function handleLogout() {
  await logout();
  await router.push('/login');
}
</script>

<style scoped>
.loader {
  display: flex;
  justify-content: center;
  padding: 50px;
  font-size: 20px;
}
</style>
