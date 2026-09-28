<template>
    <div class="p-6 max-w-4xl mx-auto mt-10">
        <!-- HEADER DENGAN TOMBOL LOGOUT -->
        <div class="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">Dasbor Karyawan</h1>
                <p class="text-gray-600 mt-2">Selamat datang, <strong>{{ authStore.user?.name }}</strong>! Jangan lupa
                    merekam kehadiran Anda hari ini.</p>
            </div>

            <button @click="handleLogout"
                class="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-4 py-2.5 rounded-lg font-semibold transition border border-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Keluar
            </button>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center">
            <div class="mb-8">
                <h2 class="text-2xl font-semibold text-gray-700">Rekam Kehadiran Harian</h2>
                <p class="text-gray-500 text-sm mt-1">Pastikan lokasi GPS peramban Anda aktif (jika diperlukan).</p>
            </div>

            <div class="flex flex-col sm:flex-row justify-center items-center gap-6">
                <!-- Tombol Clock In -->
                <button @click="clockIn" :disabled="loading"
                    class="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <span class="text-2xl">🌤️</span> Clock In (Masuk)
                </button>

                <!-- Tombol Clock Out -->
                <button @click="clockOut" :disabled="loading"
                    class="w-full sm:w-auto px-10 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <span class="text-2xl">🌙</span> Clock Out (Pulang)
                </button>
            </div>
        </div>

        <!-- (KODE ABSENSI SEBELUMNYA DI ATAS SINI) -->

        <!-- KOTAK FORM PENGAJUAN CUTI -->
        <div class="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-2xl font-semibold text-gray-700 mb-6 border-b pb-4">Pengajuan Cuti</h2>

            <form @submit.prevent="submitLeaveRequest" class="space-y-5">

                <!-- 1. DROPDOWN TIPE CUTI -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Cuti</label>
                    <select v-model="leaveForm.leave_type" required
                        class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-white">
                        <option value="Tahunan">Cuti Tahunan</option>
                        <option value="Sakit">Cuti Sakit</option>
                        <option value="Penting">Cuti Alasan Penting</option>
                    </select>
                </div>

                <!-- 2. TANGGAL MULAI & SELESAI -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                        <input type="date" v-model="leaveForm.start_date" required
                            class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border" />
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                        <input type="date" v-model="leaveForm.end_date" required
                            class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border" />
                    </div>
                </div>

                <!-- 3. ALASAN CUTI -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Alasan Detail</label>
                    <textarea v-model="leaveForm.reason" required rows="3"
                        placeholder="Jelaskan alasan pengajuan Anda..."
                        class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border"></textarea>
                </div>

                <!-- 4. UPLOAD DOKUMEN (HANYA MUNCUL JIKA CUTI SAKIT) -->
                <div v-if="leaveForm.leave_type === 'Sakit'" class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <label class="block text-sm font-medium text-blue-800 mb-1">Upload Surat Dokter (Wajib)</label>
                    <p class="text-xs text-blue-600 mb-2">Format yang diizinkan: PDF, JPG, PNG (Maksimal 2MB).</p>
                    <input type="file" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png" required
                        class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                </div>

                <!-- TOMBOL SUBMIT -->
                <div class="flex justify-end pt-2">
                    <button type="submit" :disabled="isSubmittingLeave"
                        class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50">
                        {{ isSubmittingLeave ? 'Mengirim...' : 'Kirim Pengajuan' }}
                    </button>
                </div>

            </form>
        </div>

        <!-- KOTAK RIWAYAT PENGAJUAN -->
        <div class="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Riwayat Pengajuan Saya</h2>

            <div v-if="myLeaves.length === 0" class="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">
                Belum ada riwayat pengajuan cuti.
            </div>

            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Alasan</th>
                            <th class="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        <tr v-for="leave in myLeaves" :key="leave.id">
                            <td class="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{{ leave.start_date }} s/d {{
                                leave.end_date }}</td>
                            <td class="px-4 py-3 text-sm text-gray-600 max-w-xs truncate" :title="leave.reason">{{
                                leave.reason }}</td>
                            <td class="px-4 py-3 text-center">
                                <span :class="{
                                    'bg-yellow-100 text-yellow-800': leave.status === 'Pending',
                                    'bg-green-100 text-green-800': leave.status === 'Approved',
                                    'bg-red-100 text-red-800': leave.status === 'Rejected'
                                }" class="px-2 py-1 rounded text-xs font-semibold">
                                    {{ leave.status }}
                                </span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- KOTAK RIWAYAT PENGGAJIAN -->
        <div class="mt-8 mb-10 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <h2 class="text-xl font-semibold text-gray-700 mb-4">Slip Gaji Saya</h2>

            <div v-if="myPayslips.length === 0" class="text-center text-gray-500 py-6 bg-gray-50 rounded-lg">
                Belum ada data slip gaji untuk ditampilkan.
            </div>

            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Gaji Pokok</th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Potongan Absen
                            </th>
                            <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Diterima
                            </th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="slip in myPayslips" :key="slip.id" class="hover:bg-gray-50">
                            <td class="px-4 py-3 text-sm text-gray-900 font-medium">
                                <!-- Menggunakan slip.bulan dan slip.tahun -->
                                <span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                    Bulan {{ slip.bulan }} / {{ slip.tahun }}
                                </span>
                            </td>
                            <td class="px-4 py-3 text-sm text-gray-600 text-right">{{ formatRupiah(slip.gaji_pokok) }}
                            </td>

                            <!-- Menggunakan slip.potongan -->
                            <td class="px-4 py-3 text-sm text-red-500 text-right">- {{ formatRupiah(slip.potongan) }}
                            </td>

                            <td class="px-4 py-3 text-sm font-bold text-green-600 text-right">{{
                                formatRupiah(slip.total_gaji_bersih) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const loading = ref(false);
const router = useRouter();


// State untuk Form Cuti & Riwayat
const isSubmittingLeave = ref(false);
const myLeaves = ref([]);
// ... tambahkan state baru di bawah state myLeaves
const myPayslips = ref([]);



// Fungsi format Rupiah
const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
};

const fetchMyPayslips = async () => {
    try {
        const response = await api.get('/my-payslips');
        myPayslips.value = response.data.data;
    } catch (error) {
        console.error('Gagal mengambil riwayat gaji:', error);
    }
};

const clockIn = async () => {
    loading.value = true;
    try {
        await api.post('/attendances/clock-in', {
            location: 'Kantor Pusat Surabaya' // Bisa diganti dengan Geolocation API peramban nanti
        });

        Swal.fire({
            icon: 'success',
            title: 'Berhasil Masuk!',
            text: 'Kehadiran Anda hari ini telah tercatat. Selamat bekerja!',
            timer: 2500,
            showConfirmButton: false
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Clock In',
            text: error.response?.data?.message || 'Terjadi kesalahan pada server.',
            confirmButtonColor: '#2563eb'
        });
    } finally {
        loading.value = false;
    }
};

const clockOut = async () => {
    loading.value = true;
    try {
        await api.post('/attendances/clock-out');

        Swal.fire({
            icon: 'success',
            title: 'Berhasil Pulang!',
            text: 'Waktu pulang Anda telah tercatat. Hati-hati di jalan!',
            timer: 2500,
            showConfirmButton: false
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Clock Out',
            text: error.response?.data?.message || 'Terjadi kesalahan pada server.',
            confirmButtonColor: '#2563eb'
        });
    } finally {
        loading.value = false;

    }
};

// --- FUNGSI CUTI ---
const fetchMyLeaves = async () => {
    try {
        const response = await api.get('/leaves/my-requests');
        myLeaves.value = response.data.data;
    } catch (error) {
        console.error('Gagal mengambil riwayat cuti:', error);
    }
};

const leaveForm = reactive({
    leave_type: 'Tahunan', // Default
    start_date: '',
    end_date: '',
    reason: '',
    document: null // Untuk menyimpan file
});

const handleFileUpload = (event) => {
    leaveForm.document = event.target.files[0];
};

const submitLeaveRequest = async () => {
    isSubmittingLeave.value = true;
    try {
        // Gunakan FormData karena ada file
        const formData = new FormData();
        formData.append('leave_type', leaveForm.leave_type);
        formData.append('start_date', leaveForm.start_date);
        formData.append('end_date', leaveForm.end_date);
        formData.append('reason', leaveForm.reason);
        if (leaveForm.document) {
            formData.append('document', leaveForm.document);
        }

        // Tambahkan header multipart/form-data
        await api.post('/leaves', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // ... (SweetAlert sukses dan reset form seperti biasa)
        // Kosongkan form setelah sukses
        leaveForm.leave_type = 'Tahunan'; // Kembalikan ke default
        leaveForm.start_date = '';
        leaveForm.end_date = '';
        leaveForm.reason = '';
        leaveForm.document = null;

        // Reset elemen input file HTML (karena input file tidak sepenuhnya bisa direset lewat v-model)
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';

        fetchMyLeaves(); // Muat ulang tabel
    } catch (error) {
        // ... (SweetAlert error)
    } finally {
        isSubmittingLeave.value = false;
    }
};

// 3. Tambahkan fungsi Logout ini
const handleLogout = () => {
    Swal.fire({
        title: 'Konfirmasi',
        text: 'Apakah Anda yakin ingin keluar?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Keluar',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            authStore.logout(); // Memanggil fungsi hapus token di Pinia
            router.push({ name: 'Login' }); // Sesuaikan nama rute login Anda
        }
    });
};



// Muat riwayat cuti saat halaman pertama kali dibuka
onMounted(() => {
    fetchMyLeaves();
    fetchMyPayslips(); // <--- Panggil fungsi baru di sini
});
</script>