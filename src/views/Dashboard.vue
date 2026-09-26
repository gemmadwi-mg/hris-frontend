<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useEmployeeStore } from '../stores/employeeStore';

const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const router = useRouter();

onMounted(() => {
    employeeStore.fetchEmployees();
});

const handleLogout = async () => {
    // Tunggu proses pembersihan state selesai
    await authStore.logout();

    // Lempar paksa pengguna ke halaman Login
    router.push({ name: 'Login' });
};
</script>

<template>
    <div class="min-h-screen bg-gray-100">
        <!-- Navbar -->
        <nav class="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
            <h1 class="text-xl font-bold text-gray-800">HRIS Enterprise</h1>
            <div class="flex items-center space-x-4">
                <span class="text-sm text-gray-600">Halo, {{ authStore.user?.name }}</span>
                <button @click="handleLogout"
                    class="text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition">Logout</button>
            </div>
        </nav>

        <!-- Main Content (Tabel Data) -->
        <main class="p-6 max-w-7xl mx-auto">
            <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 class="text-lg font-semibold text-gray-700">Direktori Karyawan</h2>
                    <button class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 shadow-sm">+
                        Tambah Karyawan</button>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white text-sm text-gray-500 border-b">
                                <th class="px-6 py-3 font-medium">NIP & Nama</th>
                                <th class="px-6 py-3 font-medium">Jabatan & Departemen</th>
                                <th class="px-6 py-3 font-medium">Bergabung</th>
                                <th class="px-6 py-3 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-sm">
                            <tr v-if="employeeStore.loading">
                                <td colspan="4" class="px-6 py-8 text-center text-gray-500 animate-pulse">Memuat data
                                    karyawan...</td>
                            </tr>

                            <tr v-else v-for="emp in employeeStore.employees" :key="emp.id"
                                class="hover:bg-gray-50 transition">
                                <td class="px-6 py-4">
                                    <div class="font-medium text-gray-900">{{ emp.nama_lengkap }}</div>
                                    <div class="text-gray-500 text-xs">{{ emp.nip }}</div>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-gray-900">{{ emp.jabatan?.nama_jabatan || '-' }}</div>
                                    <div class="text-gray-500 text-xs">{{ emp.jabatan?.departemen || '-' }}</div>
                                </td>
                                <td class="px-6 py-4 text-gray-600">{{ emp.tanggal_bergabung }}</td>
                                <td class="px-6 py-4 text-right space-x-2">
                                    <button class="text-blue-600 hover:underline">Edit</button>
                                    <button class="text-red-600 hover:underline">Hapus</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</template>