import { ref, computed } from 'vue';
import http from '../api/http';
import type { User } from '@/entities/user';

const currentUser = ref<User | null>(null);
const initializing = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => !!currentUser.value);
  const isAdmin = computed(() => currentUser.value?.id_role === 1);
  const isManager = computed(() => currentUser.value?.id_role === 2);

  async function login(login: string, password: string) {
    const res = await http.post<User>('/auth/login', { login, password });
    currentUser.value = res.data;
  }

  async function logout() {
    try {
      await http.post('/auth/logout');
    } catch {
    } finally {
      currentUser.value = null;
    }
  }

  async function fetchMe() {
    if (initializing.value) return;
    initializing.value = true;
    try {
      const res = await http.get<User | null>('/auth/me');
      currentUser.value = res.data ?? null;
    } catch {
      currentUser.value = null;
    } finally {
      initializing.value = false;
    }
  }

  return {
    currentUser,
    initializing,
    isAuthenticated,
    isAdmin,
    isManager,
    login,
    logout,
    fetchMe,
  };
}
