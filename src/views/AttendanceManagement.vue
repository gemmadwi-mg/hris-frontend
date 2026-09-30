<template>
    <div class="max-w-7xl mx-auto space-y-8">

        <!-- HEADER HALAMAN -->
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Manajemen Kehadiran</h1>
            <p class="text-gray-500 text-sm mt-1">Pantau absensi harian, tinjau riwayat bulanan, dan import data sidik
                jari massal.</p>
        </div>

        <!-- 1. PANGGIL KOMPONEN IMPORT EXCEL DI SINI -->
        <ImportAttendance />

        <!-- 2. TABEL REKAP KEHADIRAN & FILTER -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

            <!-- HEADER TABEL & KONTROL FILTER -->
            <div
                class="px-6 py-5 border-b border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 class="text-lg font-bold text-gray-800">Laporan Kehadiran Karyawan</h2>
                    <p class="text-sm text-gray-500">
                        Menampilkan data untuk: <span class="font-bold text-indigo-600">{{ displayPeriodLabel }}</span>
                    </p>
                </div>

                <!-- FILTER TOOLS -->
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <!-- Pilihan Tipe Filter -->
                        <select v-model="filterType" @change="resetAndFetch"
                            class="border border-gray-300 text-sm rounded-l-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                            <option value="today">Hari Ini</option>
                            <option value="date">Per Tanggal</option>
                            <option value="month">Per Bulan</option>
                        </select>

                        <!-- Input berdasarkan Tipe Filter -->
                        <input v-if="filterType === 'date'" type="date" v-model="filterDateValue"
                            @change="fetchAttendances"
                            class="border-y border-r border-gray-300 text-sm rounded-r-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <input v-if="filterType === 'month'" type="month" v-model="filterMonthValue"
                            @change="fetchAttendances"
                            class="border-y border-r border-gray-300 text-sm rounded-r-lg px-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <button v-if="filterType === 'today'" @click="fetchAttendances"
                            class="border-y border-r border-gray-300 text-sm rounded-r-lg px-4 py-2 bg-gray-100 hover:bg-gray-200 transition font-medium text-gray-700 focus:outline-none">Muat
                            Ulang</button>
                    </div>
                </div>
            </div>

            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-white border-b border-gray-100">
                    <tr>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Tanggal
                        </th>
                        <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Karyawan</th>
                        <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu
                            Masuk</th>
                        <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Waktu
                            Keluar</th>
                        <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Status</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 bg-white">
                    <tr v-if="loading" class="animate-pulse">
                        <td colspan="5" class="px-6 py-12 text-center text-gray-400 font-medium">Sedang mengambil data
                            absensi...</td>
                    </tr>
                    <tr v-else-if="attendances.length === 0">
                        <td colspan="5" class="px-6 py-12 text-center text-gray-500">
                            Tidak ada data kehadiran ditemukan untuk periode ini.
                        </td>
                    </tr>

                    <template v-else>
                        <tr v-for="absen in attendances" :key="absen.id" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4 text-gray-600 text-sm whitespace-nowrap">{{ formatDate(absen.tanggal)
                            }}</td>
                            <td class="px-6 py-4 font-medium text-gray-900">{{ absen.employee?.nama_lengkap ||
                                'KaryawanDihapus' }}</td>
                            <td class="px-6 py-4 text-center font-mono font-bold text-emerald-600">{{ absen.clock_in ?
                                formatTime(absen.clock_in) : '-' }}</td>
                            <td class="px-6 py-4 text-center font-mono text-gray-500">{{ absen.clock_out ?
                                formatTime(absen.clock_out) : 'Belum Pulang' }}</td>
                            <td class="px-6 py-4 text-center">
                                <span v-if="isLate(absen.clock_in)"
                                    class="bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Terlambat</span>
                                <span v-else
                                    class="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">Tepat
                                    Waktu</span>
                            </td>
                        </tr>
                    </template>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import ImportAttendance from '../components/ImportAttendance.vue';

// State Data
const attendances = ref([]);
const loading = ref(false);

// State Filter
const filterType = ref('today'); // Pilihan: 'today', 'date', 'month'

// Mengambil waktu saat ini di Surabaya
const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
const currentYear = now.getFullYear();
const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
const currentDate = String(now.getDate()).padStart(2, '0');

// Nilai default filter diisi dengan hari ini & bulan ini
const filterDateValue = ref(`${currentYear}-${currentMonth}-${currentDate}`);
const filterMonthValue = ref(`${currentYear}-${currentMonth}`);

// Menghasilkan teks dinamis untuk label tabel ("Menampilkan data untuk: ...")
const displayPeriodLabel = computed(() => {
    if (filterType.value === 'today') return 'Hari Ini';
    if (filterType.value === 'date') return formatDate(filterDateValue.value);
    if (filterType.value === 'month') {
        const dateObj = new Date(filterMonthValue.value + '-01');
        return dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    }
    return 'Semua';
});

// Fungsi Utama: Mengambil data absensi dari API berdasarkan filter
const fetchAttendances = async () => {
    loading.value = true;
    try {
        let endpoint = '/attendances/filtered';

        // Membangun Query String berdasarkan pilihan HRD
        if (filterType.value === 'date') {
            endpoint += `?date=${filterDateValue.value}`;
        } else if (filterType.value === 'month') {
            endpoint += `?month=${filterMonthValue.value}`;
        }

        const response = await api.get(endpoint);
        attendances.value = response.data;
    } catch (error) {
        console.error('Gagal memuat absensi', error);
    } finally {
        loading.value = false;
    }
};

// Mereset nilai input kalender agar terlihat rapi setiap berpindah tipe
const resetAndFetch = () => {
    fetchAttendances();
};

// --- FUNGSI FORMATTING TAMPILAN ---

const formatTime = (datetimeStr) => {
    if (!datetimeStr) return '';
    // Memecah "YYYY-MM-DD HH:MM:SS" menjadi bagian jamnya saja
    const parts = datetimeStr.split(' ');
    if (parts.length > 1) {
        return parts[1].substring(0, 5); // Mengambil HH:MM
    }
    return datetimeStr;
};

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
};

// Cek keterlambatan (batas jam 08:15)
const isLate = (clockInDatetime) => {
    if (!clockInDatetime) return false;
    const timeStr = formatTime(clockInDatetime); // Ambil HH:MM nya
    if (!timeStr) return false;

    // Perbandingan numerik sederhana tanpa mengandalkan objek Date utuh
    const [hours, minutes] = timeStr.split(':').map(Number);
    if (hours > 8) return true;
    if (hours === 8 && minutes > 15) return true;
    return false;
};

onMounted(() => {
    fetchAttendances();
});
</script>