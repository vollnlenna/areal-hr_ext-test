import { createRouter, createWebHistory } from 'vue-router'
import organizations from '../pages/OrganizationsPage.vue';
import departments from '../pages/DepartmentsPage.vue';
import positions from '../pages/PositionsPage.vue';

const routes = [
  { path: '/', redirect: '/organizations' },
  { path: '/organizations', component: organizations },
  { path: '/departments', component: departments },
  { path: '/positions', component: positions },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
