<template>
    <!-- KELAS 'fixed top-0 left-0 h-screen w-64' ADALAH KUNCI MENTOK KIRI & SCROLL-PROOF -->
    <div
        class="fixed top-0 left-0 w-64 h-screen bg-white shadow-xl border-r border-gray-100 z-50 flex flex-col overflow-y-auto">

        <!-- Header Profil -->
        <div class="p-6 border-b border-gray-100 text-center">
            <div
                class="h-16 w-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {{ authStore.user?.name?.charAt(0) || 'U' }}
            </div>
            <h2 class="text-lg font-bold text-gray-800">{{ authStore.user?.name || authStore.user?.nama_lengkap }}</h2>
            <span class="inline-block mt-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                Role: {{ authStore.user?.role || 'Karyawan' }}
            </span>
        </div>

        <!-- Area Menu -->
        <div class="flex-1 p-4 space-y-1">
            <h3 class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2 mt-2">Menu Utama</h3>

            <!-- MENU: DASBOR UTAMA -->
            <button @click="router.push({ name: 'Dashboard' })"
                :class="route.name === 'Dashboard' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-gray-600 hover:bg-indigo-50 hover:text-indigo-700 font-medium'"
                class="w-full flex items-center gap-3 p-3 text-left rounded-lg transition">
                <span>🏠 Dasbor Utama</span>
            </button>

            <!-- MENU KHUSUS MANAJER / HR -->
            <template v-if="['HR', 'Manager'].includes(authStore.user?.role)">

                <!-- MENU: REKAP KEHADIRAN -->
                <button @click="router.push({ name: 'AttendanceManagement' })"
                    :class="route.name === 'AttendanceManagement' ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-green-50 hover:text-green-700 font-medium'"
                    class="w-full flex items-center gap-3 p-3 text-left rounded-lg transition">
                    <span>⏱️ Rekap Kehadiran</span>
                </button>

                <!-- MENU: KELOLA CUTI -->
                <button @click="router.push({ name: 'LeaveManagement' })"
                    :class="route.name === 'LeaveManagement' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 font-medium'"
                    class="w-full flex items-center gap-3 p-3 text-left rounded-lg transition">
                    <span>📅 Kelola Cuti</span>
                </button>
            </template>

            <!-- MENU KHUSUS KARYAWAN -->
            <template v-else>
                <!-- MENU: SLIP GAJI SAYA -->
                <button @click="router.push({ name: 'MyPayslip' })"
                    :class="route.name === 'MyPayslip' ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700 font-medium'"
                    class="w-full flex items-center gap-3 p-3 text-left rounded-lg transition">
                    <span>📄 Slip Gaji Saya</span>
                </button>
            </template>
        </div>

        <!-- Tombol Logout (Menempel di dasar layar) -->
        <div class="p-4 border-t border-gray-100">
            <button @click="handleLogout"
                class="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-red-50 text-red-600 font-medium transition">
                <span>🚪 Keluar Sistem</span>
            </button>
        </div>
    </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const route = useRoute(); // 2. Inisialisasi route
const authStore = useAuthStore();


const handleLogout = async () => {
    await authStore.logout();
    router.push({ name: 'Login' });
};
</script>