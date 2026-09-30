import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import AddEmployee from '../views/AddEmployee.vue'; // Tambahkan ini
import EditEmployee from '@/views/EditEmployee.vue';
import LeaveManagement from '@/views/LeaveManagement.vue';
import EmployeeDirectory from '../views/EmployeeDirectory.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'Login', component: Login, meta: { guest: true } },

    // DASHBOARD SEKARANG BERTINDAK SEBAGAI MASTER LAYOUT
    {
      path: '/',
      component: Dashboard,
      meta: { requiresAuth: true },
      // SEMUA HALAMAN DI DALAM CHILDREN AKAN MENDAPATKAN SIDEBAR & NAVBAR
      children: [
        {
          path: '', // Ini akan terbuka otomatis saat user masuk ke URL '/'
          name: 'Dashboard', // Pindahkan name 'Dashboard' ke anak ini
          component: () => import('../views/HomeContent.vue')
        },
        { path: 'employees', name: 'EmployeeDirectory', component: EmployeeDirectory },
        {
          path: 'employees/create',
          name: 'AddEmployee',
          component: AddEmployee
        },
        {
          path: 'employees/edit/:id',
          name: 'EditEmployee',
          component: EditEmployee
        },
        {
          path: '/payroll',
          name: 'PayrollManagement',
          component: () => import('../views/PayrollManagement.vue'),
          meta: { requiresAuth: true, role: ['HR', 'Manager'] }
        },
        {
          path: 'my-payslip',
          name: 'MyPayslip',
          component: () => import('../views/MyPayslip.vue')
        },
        {
          path: 'my-leaves',
          name: 'MyLeaves',
          component: () => import('../views/MyLeaves.vue')
        },
        {
          path: 'manager/leaves',
          name: 'LeaveManagement',
          component: LeaveManagement,
          meta: { roles: ['HR', 'Manager'] }
        },
        {
          path: 'manager/attendance-management',
          name: 'AttendanceManagement',
          component: () => import('../views/AttendanceManagement.vue'),
          meta: { roles: ['HR', 'Manager'] }
        }
      ]
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