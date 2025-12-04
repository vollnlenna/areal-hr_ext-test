<template>
  <div class="container">
    <nav>
      <router-link to="/organizations" class="tab" :class="{ active: $route.path === '/organizations' }">Организации</router-link>
      <router-link to="/departments" class="tab" :class="{ active: $route.path === '/departments' }">Отделы</router-link>
      <router-link to="/positions" class="tab" :class="{ active: $route.path === '/positions' }">Должности</router-link>
      <router-link to="/employees" class="tab" :class="{ active: $route.path === '/employees' }">Сотрудники</router-link>
      <router-link to="/hrOperations" class="tab" :class="{ active: $route.path === '/hrOperations' }">Кадровые операции</router-link>
      <router-link to="/change-history" class="tab" :class="{ active: $route.path === '/change-history' }">История изменений</router-link>
    </nav>

    <router-view />
  </div>
</template>
