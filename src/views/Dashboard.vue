<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useEmployeeStore } from '../stores/employeeStore';
import api from '../services/api';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import Swal from 'sweetalert2';

// State untuk menghitung notifikasi yang masuk
const unreadNotifications = ref(0);
const notificationsList = ref([]); // Menyimpan daftar riwayat
const showDropdown = ref(false);   // Mengontrol buka/tutup dropdown

const isDownloading = ref(false);

const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const router = useRouter();

// 1. Fungsi mengambil data asli dari Database
const fetchNotifications = async () => {
    try {
        const response = await api.get('/notifications');

        // Cek wujud asli data di Inspect Element -> Console
        console.log("Data Notifikasi dari Server:", response.data);

        unreadNotifications.value = response.data.unread_count;

        // Format ulang data dari DB agar sesuai dengan desain kita
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

// Fungsi saat ikon lonceng diklik
// 2. Fungsi membuka dropdown sekaligus menandai "Sudah Dibaca" di Database
const toggleNotifications = async () => {
    showDropdown.value = !showDropdown.value;

    // Jika dropdown dibuka dan ada notif belum dibaca, laporkan ke backend
    if (showDropdown.value && unreadNotifications.value > 0) {
        try {
            await api.post('/notifications/mark-read');
            unreadNotifications.value = 0;

            // Ubah visual di daftar menjadi 'sudah dibaca' (hilangkan titik biru)
            notificationsList.value.forEach(n => n.read = true);
        } catch (error) { }
    }
};


onMounted(() => {
    // Ambil data pertama kali dari DB
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

    echo.channel('hris-notifications')
        .listen('.leave.requested', (event) => {
            // Jika ada cuti baru, refresh data dari DB agar akurat
            fetchNotifications();

            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'info',
                title: 'Cuti Masuk!',
                text: event.message,
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true
            });
        });

    employeeStore.fetchEmployees();
});

const prosesGaji = async () => {
    // Dapatkan bulan dan tahun saat ini (Format: MM-YYYY)
    const now = new Date();
    const bulan = String(now.getMonth() + 1).padStart(2, '0');
    const tahun = now.getFullYear();
    const periode = `${bulan}-${tahun}`;

    const result = await Swal.fire({
        title: 'Proses Gaji Bulanan?',
        text: `Sistem akan menghitung gaji pokok dan potongan absensi seluruh karyawan untuk periode ${periode}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#16a34a',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Proses Sekarang!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            // Tampilkan loading spinner bawaan SweetAlert
            Swal.fire({
                title: 'Memproses...',
                text: 'Mohon tunggu, jangan tutup halaman ini.',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            const response = await api.post('/payrolls/generate', { periode });

            Swal.fire('Berhasil!', response.data.message, 'success');
        } catch (error) {
            Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan saat memproses gaji.', 'error');
        }
    }
};

// Fungsi canggih untuk mengunduh file biner (PDF) lewat API Authenticated
const downloadSlip = async (id, nama) => {
    isDownloading.value = true;
    try {
        const response = await api.get(`/employees/${id}/payslip`, {
            responseType: 'blob'
        });

        // 1. PENGAMANAN NAMA: 
        // Jika 'nama' kosong, gunakan kata 'Karyawan' sebagai pengganti 
        // agar fungsi .replace() tidak menyebabkan aplikasi crash.
        const namaAman = nama ? String(nama).replace(/\s+/g, '_') : 'Karyawan';

        // 2. Pastikan browser mengenali ini sebagai file PDF
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Slip_Gaji_${namaAman}.pdf`);

        // 3. Eksekusi unduhan
        document.body.appendChild(link);
        link.click();

        // 4. Bersihkan memori (menggunakan removeChild lebih aman dari error)
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // 2. Tambahkan Notifikasi Sukses
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: `Slip gaji ${nama} berhasil diunduh.`,
            timer: 2000,
            showConfirmButton: false
        });

    } catch (error) {
        console.error('DETAIL ERROR:', error);

        // 3. Ganti alert() dengan SweetAlert Error
        Swal.fire({
            icon: 'error',
            title: 'Unduhan Gagal',
            text: 'Terjadi kesalahan saat memproses PDF di server. Pastikan data karyawan lengkap.',
            confirmButtonColor: '#2563eb' // Warna biru Tailwind (blue-600)
        });

    } finally {
        isDownloading.value = false;
    }
};

const hapusKaryawan = async (id, nama) => {
    // Munculkan dialog konfirmasi SweetAlert2
    const result = await Swal.fire({
        title: 'Apakah Anda yakin?',
        text: `Data karyawan ${nama} akan dihapus secara permanen!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        const sukses = await employeeStore.deleteEmployee(id);
        if (sukses) {
            Swal.fire('Terhapus!', 'Data karyawan telah dihapus.', 'success');
        } else {
            Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
    }
};

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
                <!-- Hanya tampilkan untuk HR atau Manager -->
                <button v-if="['HR', 'Manager'].includes(authStore.user?.role)" @click="router.push('/manager/leaves')"
                    class="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition">
                    Kelola Cuti
                </button>
                <button @click="handleLogout"
                    class="text-sm bg-red-50 text-red-600 px-3 py-1 rounded hover:bg-red-100 transition">Logout</button>
            </div>
        </nav>

        <!-- Main Content (Tabel Data) -->
        <main class="p-6 max-w-7xl mx-auto">
            <div class="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 class="text-lg font-semibold text-gray-700">Direktori Karyawan</h2>
                    <!-- ICON LONCENG -->
                    <!-- ICON LONCENG -->
                    <div class="relative mr-4">

                        <!-- Tombol Lonceng -->
                        <div class="cursor-pointer" @click="toggleNotifications">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="h-7 w-7 text-gray-600 hover:text-indigo-600 transition" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <span v-if="unreadNotifications > 0" class="absolute -top-1 -right-1 flex h-4 w-4">
                                <span
                                    class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span
                                    class="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-[10px] items-center justify-center font-bold">
                                    {{ unreadNotifications }}
                                </span>
                            </span>
                        </div>

                        <!-- KOTAK DROPDOWN RIWAYAT NOTIFIKASI -->
                        <div v-if="showDropdown"
                            class="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden transform transition-all">

                            <!-- Header Dropdown (Tanpa tombol bersihkan karena sudah permanen di DB) -->
                            <div
                                class="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">
                                <span class="text-sm font-bold text-gray-700">Notifikasi</span>
                            </div>

                            <!-- Isi Dropdown -->
                            <div class="max-h-72 overflow-y-auto">
                                <div v-if="notificationsList.length === 0"
                                    class="p-6 text-center text-gray-500 text-sm">
                                    Belum ada notifikasi baru.
                                </div>

                                <!-- v-for DI SINI: Variabel 'notif' hanya hidup di dalam blok div ini -->
                                <div v-else v-for="notif in notificationsList" :key="notif.id"
                                    class="p-4 border-b border-gray-50 transition cursor-default"
                                    :class="notif.read ? 'bg-white' : 'bg-blue-50/50'">
                                    <div class="flex gap-3">
                                        <div class="flex-shrink-0 mt-1">
                                            <!-- Titik biru penanda 'Belum Dibaca' dipanggil di dalam v-for -->
                                            <span v-if="!notif.read"
                                                class="w-2 h-2 bg-blue-600 rounded-full inline-block"></span>
                                        </div>
                                        <div>
                                            <p class="text-sm text-gray-800 font-medium">{{ notif.message }}</p>
                                            <span class="text-xs text-gray-400 mt-1 block">{{ notif.time }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                    <!-- Tombol Generate Gaji -->
                    <button v-if="['HR', 'Manager'].includes(authStore.user?.role)" @click="prosesGaji"
                        class="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700 transition flex items-center gap-2">
                        💰 Generate Gaji Bulan Ini
                    </button>
                    <button v-if="['HR', 'Manager'].includes(authStore.user?.role)"
                        @click="router.push({ name: 'AddEmployee' })"
                        class="bg-blue-600 text-white text-sm px-4 py-2 rounded hover:bg-blue-700 shadow-sm transition">
                        + Tambah Karyawan
                    </button>
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
                            <!-- SKELETON LOADING -->
                            <template v-if="employeeStore.loading">
                                <tr v-for="i in 5" :key="i" class="animate-pulse bg-white">
                                    <td class="px-6 py-4">
                                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div class="h-3 bg-gray-100 rounded w-1/2"></div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                        <div class="h-3 bg-gray-100 rounded w-1/3"></div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                                    </td>
                                </tr>
                            </template>

                            <!-- DATA ASLI (Ganti v-else-if menjadi v-else karena template loading di atas dibungkus terpisah) -->
                            <template v-else>
                                <tr v-for="emp in employeeStore.employees" :key="emp.id"
                                    class="hover:bg-gray-50 transition">
                                    <!-- ... isi td asli Anda tetap sama ... -->
                                    <td class="px-6 py-4">
                                        <div class="font-medium text-gray-900">{{ emp.nama_lengkap }}</div>
                                        <div class="text-gray-500 text-xs">{{ emp.nip }}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-gray-900">{{ emp.jabatan?.nama_jabatan || '-' }}</div>
                                        <div class="text-gray-500 text-xs">{{ emp.jabatan?.departemen || '-' }}</div>
                                    </td>
                                    <td class="px-6 py-4 text-gray-600">{{ emp.tanggal_bergabung }}</td>
                                    <!-- Cari baris td untuk aksi (Edit/Hapus) dan ubah menjadi ini: -->
                                    <td class="px-6 py-4 text-right space-x-2">
                                        <!-- Tombol Edit (akan mengarah ke halaman Edit) -->
                                        <button @click="router.push(`/employees/edit/${emp.id}`)"
                                            class="text-blue-600 hover:underline font-medium">Edit</button>

                                        <!-- Tombol Hapus -->
                                        <button @click="hapusKaryawan(emp.id, emp.nama_lengkap)"
                                            class="text-red-600 hover:underline font-medium">Hapus</button>
                                        <button @click="downloadSlip(emp.id, emp.nama_lengkap)"
                                            :disabled="isDownloading"
                                            class="bg-green-100 text-green-700 px-3 py-1 rounded text-xs font-medium hover:bg-green-200 transition disabled:opacity-50">
                                            📄 Download Slip
                                        </button>
                                    </td>
                                </tr>
                            </template>


                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    </div>
</template>