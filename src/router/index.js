import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
    { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } }
  ]
});

router.beforeEach(async (to, from) => {
  const authStore = useAuthStore();

  // Cek sesi ke backend saat aplikasi pertama kali dimuat ulang (refresh)
  if (authStore.user === null) {
    await authStore.checkAuth();
  }

  // Jika rute butuh login tapi user belum login -> tendang ke /login
  if (to.meta.requiresAuth && !authStore.user) {
    return { name: 'Login' };
  }

  // Jika rute khusus tamu (login) tapi user sudah login -> tendang ke Dasbor
  if (to.meta.guest && authStore.user) {
    return { name: 'Dashboard' };
  }
});

export default router;