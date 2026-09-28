<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useEmployeeStore } from '../stores/employeeStore';
import api from '../services/api';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import Swal from 'sweetalert2';

import AppSidebar from '../components/AppSidebar.vue';
import EmployeePanel from '../components/EmployeePanel.vue';

// State Notifikasi & UI
const unreadNotifications = ref(0);
const notificationsList = ref([]);
const showDropdown = ref(false);
const isDownloading = ref(false);

const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const router = useRouter();

// 1. FUNGSI NOTIFIKASI
const fetchNotifications = async () => {
    try {
        const response = await api.get('/notifications');
        unreadNotifications.value = response.data.unread_count;
        notificationsList.value = response.data.notifications.map(notif => ({
            id: notif.id,
            message: notif.data.message,
            time: new Date(notif.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            read: notif.read_at !== null
        }));
    } catch (error) {
        console.error('Gagal mengambil notifikasi', error);
    }
};

const toggleNotifications = async () => {
    showDropdown.value = !showDropdown.value;
    if (showDropdown.value && unreadNotifications.value > 0) {
        try {
            await api.post('/notifications/mark-read');
            unreadNotifications.value = 0;
            notificationsList.value.forEach(n => n.read = true);
        } catch (error) { }
    }
};

const clearReadNotifications = async () => {
    try {
        await api.delete('/notifications/clear');
        notificationsList.value = notificationsList.value.filter(notif => notif.read === false);
        Swal.fire({
            toast: true, position: 'top-end', icon: 'success', title: 'Dibersihkan',
            text: 'Notifikasi lama telah dihapus.', showConfirmButton: false, timer: 2000
        });
    } catch (error) {
        console.error('Gagal membersihkan notifikasi', error);
    }
};

// 2. FUNGSI AKSI MANAJER/HR
const prosesGaji = async () => {
    const now = new Date();
    const periode = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

    const result = await Swal.fire({
        title: 'Proses Gaji Bulanan?',
        text: `Sistem akan menghitung gaji pokok dan potongan absensi seluruh karyawan untuk periode ${periode}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Proses Sekarang!'
    });

    if (result.isConfirmed) {
        try {
            Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });
            const response = await api.post('/payrolls/generate', { periode });
            Swal.fire('Berhasil!', response.data.message, 'success');
        } catch (error) {
            Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan.', 'error');
        }
    }
};

const downloadSlip = async (id, nama) => {
    isDownloading.value = true;
    try {
        const response = await api.get(`/employees/${id}/payslip`, { responseType: 'blob' });
        const namaAman = nama ? String(nama).replace(/\s+/g, '_') : 'Karyawan';
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Slip_Gaji_${namaAman}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.fire({ icon: 'success', title: 'Berhasil!', text: `Slip gaji diunduh.`, timer: 2000, showConfirmButton: false });
    } catch (error) {
        Swal.fire({ icon: 'error', title: 'Unduhan Gagal', text: 'Terjadi kesalahan saat memproses PDF.' });
    } finally {
        isDownloading.value = false;
    }
};

const hapusKaryawan = async (id, nama) => {
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?', text: `Data ${nama} akan dihapus permanen!`, icon: 'warning',
        showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#3085d6', confirmButtonText: 'Ya, Hapus!'
    });

    if (result.isConfirmed) {
        const sukses = await employeeStore.deleteEmployee(id);
        if (sukses) Swal.fire('Terhapus!', 'Data telah dihapus.', 'success');
        else Swal.fire('Gagal!', 'Terjadi kesalahan.', 'error');
    }
};

onMounted(() => {
    fetchNotifications();
    window.Pusher = Pusher;
    const echo = new Echo({
        broadcaster: 'reverb',
        key: import.meta.env.VITE_REVERB_APP_KEY,
        wsHost: import.meta.env.VITE_REVERB_HOST ?? '127.0.0.1',
        wsPort: import.meta.env.VITE_REVERB_PORT ?? 8080,
        forceTLS: false,
        disableStats: true,
        enabledTransports: ['ws', 'wss'],
    });

    echo.channel('hris-notifications').listen('.leave.requested', (event) => {
        fetchNotifications();
        Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'Cuti Masuk!', text: event.message, showConfirmButton: false, timer: 4000 });
    });

    employeeStore.fetchEmployees();
});
</script>

<template>
    <!-- TAMBAHKAN 'pl-64' (Padding Left 256px) AGAR KONTEN MENGGESER KE KANAN -->
    <div class="min-h-screen bg-gray-50 flex flex-col pl-64">

        <!-- Panggil Sidebar (Posisi tidak masalah di mana karena dia Fixed) -->
        <AppSidebar />

        <!-- NAVBAR ATAS -->
        <nav class="bg-white shadow-sm border-b px-8 py-4 flex justify-between items-center sticky top-0 z-40 w-full">
            <h1 class="text-xl font-black text-indigo-700 tracking-tight">HRIS<span
                    class="text-gray-800">Enterprise</span></h1>

            <!-- LONCENG NOTIFIKASI -->
            <div class="relative">
                <div class="cursor-pointer p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"
                    @click="toggleNotifications">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-700" fill="none"
                        viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    <!-- Indikator Angka -->
                    <span v-if="unreadNotifications > 0" class="absolute -top-1 -right-1 flex h-5 w-5">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span
                            class="relative inline-flex rounded-full h-5 w-5 bg-red-500 text-white text-[10px] items-center justify-center font-bold">
                            {{ unreadNotifications }}
                        </span>
                    </span>
                </div>

                <!-- DROPDOWN NOTIFIKASI -->
                <div v-if="showDropdown"
                    class="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden transform transition-all">
                    <div class="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                        <span class="text-sm font-bold text-gray-700">Notifikasi</span>
                        <button v-if="notificationsList.length > 0" @click.stop="clearReadNotifications"
                            class="text-xs text-red-600 hover:text-red-800 font-semibold bg-red-50 px-2 py-1 rounded">Bersihkan</button>
                    </div>
                    <div class="max-h-72 overflow-y-auto">
                        <div v-if="notificationsList.length === 0" class="p-6 text-center text-gray-500 text-sm">Belum
                            ada notifikasi baru.</div>
                        <div v-else v-for="notif in notificationsList" :key="notif.id"
                            class="p-4 border-b border-gray-50" :class="notif.read ? 'bg-white' : 'bg-blue-50/50'">
                            <div class="flex gap-3">
                                <div class="flex-shrink-0 mt-1"><span v-if="!notif.read"
                                        class="w-2 h-2 bg-blue-600 rounded-full inline-block"></span></div>
                                <div>
                                    <p class="text-sm text-gray-800 font-medium">{{ notif.message }}</p>
                                    <span class="text-xs text-gray-400 mt-1 block">{{ notif.time }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- KONTEN UTAMA -->
        <!-- HAPUS CLASS GRID, ganti menjadi lebar penuh yang rapi -->
        <main class="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8">

            <!-- PORTAL AJAIB VUE ROUTER -->
            <!-- Semua halaman (Cuti, Absen, Tabel Karyawan) akan muncul di dalam tag ini -->
            <router-view></router-view>


        </main>
    </div>
</template>