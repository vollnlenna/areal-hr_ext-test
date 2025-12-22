import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

import organizations from '@/pages/OrganizationsPage.vue';
import departments from '@/pages/DepartmentsPage.vue';
import positions from '@/pages/PositionsPage.vue';
import employees from '@/pages/EmployeesPage.vue';
import hrOperations from '@/pages/HrOperationsPage.vue';
import changeHistory from '@/pages/ChangeHistoryPage.vue';
import users from '@/pages/UsersPage.vue';
import login from '@/pages/LoginPage.vue';

const routes = [
  { path: '/', redirect: '/organizations' },
  { path: '/login', component: login, meta: { requiresAuth: false } },
  { path: '/organizations', component: organizations, meta: { requiresAuth: true } },
  { path: '/departments', component: departments, meta: { requiresAuth: true } },
  { path: '/positions', component: positions, meta: { requiresAuth: true } },
  { path: '/employees', component: employees, meta: { requiresAuth: true } },
  { path: '/hrOperations', component: hrOperations, meta: { requiresAuth: true } },
  { path: '/change-history', component: changeHistory, meta: { requiresAuth: true } },
  { path: '/users', component: users, meta: { requiresAuth: true, role: 'admin' } },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuth();
  if (!auth.currentUser.value && !auth.initializing.value) {
    await auth.fetchMe();
  }
  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return '/login';
  }
  if (to.path === '/login' && auth.isAuthenticated.value) {
    return '/organizations';
  }
  if (to.meta.role === 'admin' && !auth.isAdmin.value) {
    return '/organizations';
  }
  return true;
});

export default router;
