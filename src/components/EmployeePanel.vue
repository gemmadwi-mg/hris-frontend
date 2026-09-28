<template>
    <div class="max-w-5xl mx-auto space-y-8">
        <!-- KOTAK REKAM KEHADIRAN -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
            <div class="mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Rekam Kehadiran Harian</h2>
                <p class="text-gray-500 text-sm mt-1">Pastikan lokasi GPS peramban Anda aktif.</p>
            </div>

            <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
                <button @click="clockIn" :disabled="loading"
                    class="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-2">
                    <span>🌤️</span> Clock In (Masuk)
                </button>

                <button @click="clockOut" :disabled="loading"
                    class="w-full sm:w-auto px-8 py-3 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-2">
                    <span>🌙</span> Clock Out (Pulang)
                </button>
            </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <!-- KOTAK FORM PENGAJUAN CUTI -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                <h2 class="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Pengajuan Cuti</h2>
                <form @submit.prevent="submitLeaveRequest" class="space-y-4">
                    <!-- ... (KODE FORM CUTI ANDA TETAP SAMA PERSIS SEPERTI SEBELUMNYA) ... -->
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Cuti</label>
                        <select v-model="leaveForm.leave_type" required
                            class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 p-2.5 border bg-white">
                            <option value="Tahunan">Cuti Tahunan</option>
                            <option value="Sakit">Cuti Sakit</option>
                            <option value="Penting">Cuti Alasan Penting</option>
                        </select>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                            <input type="date" v-model="leaveForm.start_date" required
                                class="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border" />
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
                            <input type="date" v-model="leaveForm.end_date" required
                                class="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border" />
                        </div>
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
                        <textarea v-model="leaveForm.reason" required rows="2"
                            class="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border"></textarea>
                    </div>
                    <div v-if="leaveForm.leave_type === 'Sakit'"
                        class="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <label class="block text-sm font-medium text-blue-800 mb-1">Upload Surat Dokter (Wajib)</label>
                        <input type="file" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png" required
                            class="w-full text-sm text-gray-500" />
                    </div>
                    <div class="flex justify-end pt-2">
                        <button type="submit" :disabled="isSubmittingLeave"
                            class="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-6 rounded-lg transition disabled:opacity-50">
                            {{ isSubmittingLeave ? 'Mengirim...' : 'Kirim Pengajuan' }}
                        </button>
                    </div>
                </form>
            </div>

            <div class="space-y-8">
                <!-- KOTAK RIWAYAT PENGAJUAN -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 class="text-lg font-bold text-gray-800 mb-4">Riwayat Cuti</h2>
                    <!-- ... (KODE TABEL RIWAYAT CUTI ANDA TETAP SAMA) ... -->
                    <div v-if="myLeaves.length === 0"
                        class="text-center text-gray-500 py-4 bg-gray-50 rounded-lg text-sm">Belum ada riwayat pengajuan
                        cuti.</div>
                    <div v-else class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Periode
                                    </th>
                                    <th class="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase">Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr v-for="leave in myLeaves" :key="leave.id">
                                    <td class="px-4 py-2 text-gray-900 whitespace-nowrap">{{ leave.start_date }} s/d {{
                                        leave.end_date }}</td>
                                    <td class="px-4 py-2 text-center">
                                        <span
                                            :class="{ 'bg-yellow-100 text-yellow-800': leave.status === 'Pending', 'bg-green-100 text-green-800': leave.status === 'Approved', 'bg-red-100 text-red-800': leave.status === 'Rejected' }"
                                            class="px-2 py-1 rounded text-xs font-semibold">{{ leave.status }}</span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- KOTAK SLIP GAJI -->
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 class="text-lg font-bold text-gray-800 mb-4">Slip Gaji Terakhir</h2>
                    <!-- ... (KODE TABEL SLIP GAJI ANDA TETAP SAMA) ... -->
                    <div v-if="myPayslips.length === 0"
                        class="text-center text-gray-500 py-4 bg-gray-50 rounded-lg text-sm">Belum ada data slip gaji.
                    </div>
                    <div v-else class="overflow-x-auto">
                        <table class="min-w-full divide-y divide-gray-200 text-sm">
                            <thead class="bg-gray-50">
                                <tr>
                                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Periode
                                    </th>
                                    <th class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                        Diterima</th>
                                </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-200">
                                <tr v-for="slip in myPayslips" :key="slip.id">
                                    <td class="px-4 py-2 font-medium"><span
                                            class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">Bulan {{
                                                slip.bulan }}/{{ slip.tahun }}</span></td>
                                    <td class="px-4 py-2 font-bold text-green-600 text-right">{{
                                        formatRupiah(slip.total_gaji_bersih) }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
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

        // 1. TAMBAHKAN ALERT SUKSES DI SINI
        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Pengajuan cuti Anda telah terkirim dan sedang menunggu persetujuan Manajer.',
            confirmButtonColor: '#4f46e5', // Warna indigo
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
        console.error('Gagal mengajukan cuti:', error);

        // 3. TAMBAHKAN ALERT GAGAL DI SINI
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.response?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan cuti. Silakan coba lagi.',
            confirmButtonColor: '#ef4444', // Warna merah
        });
    } finally {
        isSubmittingLeave.value = false;
    }
};

// Muat riwayat cuti saat halaman pertama kali dibuka
onMounted(() => {
    fetchMyLeaves();
    fetchMyPayslips(); // <--- Panggil fungsi baru di sini
});
// KODE FUNGSI ANDA (clockIn, clockOut, fetchMyLeaves, submitLeaveRequest, fetchMyPayslips) 
// MASUKKAN SEMUANYA DI SINI TANPA ADA PERUBAHAN.

// HAPUS FUNGSI handleLogout() KARENA SUDAH ADA DI SIDEBAR.
</script>