<template>
  <div class="container">
    <nav>
      <router-link to="/organizations" class="tab" :class="{ active: $route.path === '/organizations' }">Организации</router-link>
      <router-link to="/departments" class="tab" :class="{ active: $route.path === '/departments' }">Отделы</router-link>
      <router-link to="/positions" class="tab" :class="{ active: $route.path === '/positions' }">Должности</router-link>
    </nav>

    <router-view />
  </div>
</template>
