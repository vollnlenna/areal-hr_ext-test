import { createRouter, createWebHistory } from 'vue-router'
import organizations from '../pages/OrganizationsPage.vue';
import departments from '../pages/DepartmentsPage.vue';
import positions from '../pages/PositionsPage.vue';
import employees from '../pages/EmployeesPage.vue';
import hrOperations from '../pages/HrOperationsPage.vue';
import changeHistory from '../pages/ChangeHistoryPage.vue';

const routes = [
  { path: '/', redirect: '/organizations' },
  { path: '/organizations', component: organizations },
  { path: '/departments', component: departments },
  { path: '/positions', component: positions },
  { path: '/employees', component: employees },
  { path: '/hrOperations', component: hrOperations },
  { path: '/change-history', component: changeHistory }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
