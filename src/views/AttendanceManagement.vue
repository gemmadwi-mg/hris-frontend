<template>
    <div class="p-6 max-w-7xl mx-auto">
        <!-- HEADER DENGAN TOMBOL KEMBALI -->
        <div class="flex items-center gap-4 mb-6">
            <button @click="router.push({ name: 'Dashboard' })"
                class="flex items-center gap-2 text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-200 px-4 py-2.5 rounded-lg shadow-sm transition font-medium text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
            </button>

            <h1 class="text-2xl font-bold text-gray-800">Rekap Kehadiran Hari Ini</h1>
        </div>

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Waktu Masuk</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Waktu Keluar</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                    <tr v-for="absen in attendances" :key="absen.id">
                        <td class="px-6 py-4 font-medium">{{ absen.employee.nama_lengkap }}</td>
                        <td class="px-6 py-4 text-center font-mono text-green-600">{{ absen.clock_in }}</td>
                        <td class="px-6 py-4 text-center font-mono text-gray-500">{{ absen.clock_out || 'Belum Pulang'
                            }}</td>
                        <td class="px-6 py-4 text-center">
                            <!-- Contoh logika status sederhana -->
                            <span v-if="isLate(absen.clock_in)"
                                class="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">Terlambat</span>
                            <span v-else class="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Tepat
                                Waktu</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // 1. Impor Vue Router
import api from '../services/api';

const router = useRouter(); // 2. Inisialisasi router
const attendances = ref([]);


const fetchTodayAttendances = async () => {
    try {
        const response = await api.get('/attendances/today');
        attendances.value = response.data;
    } catch (error) {
        console.error('Gagal memuat absensi', error);
    }
};

// Fungsi sederhana cek keterlambatan (misal batas jam 08:15)
const isLate = (clockInTime) => {
    if (!clockInTime) return false;
    const time = new Date(`2000-01-01 ${clockInTime}`);
    const limit = new Date(`2000-01-01 08:15:00`);
    return time > limit;
};

onMounted(fetchTodayAttendances);
</script>