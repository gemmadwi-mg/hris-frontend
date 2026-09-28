import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import AddEmployee from '../views/AddEmployee.vue'; // Tambahkan ini
import EditEmployee from '@/views/EditEmployee.vue';
import LeaveManagement from '@/views/LeaveManagement.vue';
import EmployeeDashboard from '@/views/EmployeeDashboard.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: Login, meta: { guest: true } },
    { path: '/', name: 'Dashboard', component: Dashboard, meta: { requiresAuth: true } },
    {
      path: '/employees/create',
      name: 'AddEmployee',
      component: AddEmployee,
      meta: { requiresAuth: true }
    },
    {
      path: '/employees/edit/:id',
      name: 'EditEmployee',
      component: EditEmployee,
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/payroll',
      name: 'PayrollAdmin',
      component: () => import('../views/PayrollAdmin.vue'),
      meta: {
        requiresAuth: true,
        roles: ['HR', 'Superadmin'] // Hanya role ini yang boleh masuk
      }
    },
    {
      path: '/my-payslip',
      name: 'MyPayslip',
      component: () => import('../views/MyPayslip.vue'),
      meta: { requiresAuth: true } // Bebas untuk semua role yang sudah login
    },
    {
      path: '/manager/leaves',
      name: 'LeaveManagement',
      component: LeaveManagement,
      meta: {
        requiresAuth: true,
        roles: ['HR', 'Manager'] // Hanya role ini yang diizinkan
      }
    },
    {
      path: '/karyawan/dashboard',
      name: 'EmployeeDashboard',
      component: EmployeeDashboard,
      meta: {
        requiresAuth: true,
        roles: ['Karyawan'] // Hanya role ini yang diizinkan
      }
    }
  ]
});

router.beforeEach((to, from) => {
  const authStore = useAuthStore();

  // 1. Cek apakah harus login
  if (to.meta.requiresAuth && !authStore.user) {
    return { name: 'Login' };
  }

  // 2. PENJAGA GERBANG RBAC (Pengecekan Role)
  if (to.meta.roles && authStore.user) {
    // Jika role user saat ini TIDAK ADA di dalam daftar izin rute tersebut
    if (!to.meta.roles.includes(authStore.user.role)) {
      console.warn('Akses ditolak: Anda tidak memiliki izin.');
      return { name: 'Dashboard' }; // Lempar kembali ke dasbor
    }
  }
});

export default router;