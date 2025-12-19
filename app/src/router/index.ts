import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '@/composables/useAuth';

import organizations from '../pages/OrganizationsPage.vue';
import departments from '../pages/DepartmentsPage.vue';
import positions from '../pages/PositionsPage.vue';
import employees from '../pages/EmployeesPage.vue';
import hrOperations from '../pages/HrOperationsPage.vue';
import changeHistory from '../pages/ChangeHistoryPage.vue';
import users from '../pages/UsersPage.vue';
import login from '../pages/LoginPage.vue';

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: login, meta: { public: true } },
  { path: '/organizations', component: organizations },
  { path: '/departments', component: departments },
  { path: '/positions', component: positions },
  { path: '/employees', component: employees },
  { path: '/hrOperations', component: hrOperations },
  { path: '/change-history', component: changeHistory },
  { path: '/users', component: users, meta: { role: 'admin' } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const auth = useAuth();
  if (!auth.initializing.value && !auth.currentUser.value) {
    await auth.fetchMe();
  }
  if (to.meta.public) {
    return true;
  }
  if (!auth.isAuthenticated.value) {
    return '/login';
  }
  return true;
});

export default router;
