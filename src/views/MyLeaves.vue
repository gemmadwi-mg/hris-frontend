<template>
    <div class="max-w-5xl mx-auto space-y-8">
        <!-- HEADER HALAMAN -->
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Manajemen Cuti</h1>
            <p class="text-gray-500 text-sm mt-1">Ajukan cuti baru dan pantau status persetujuan Manajer Anda di sini.
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- KIRI: FORM PENGAJUAN (Porsi 5/12) -->
            <div class="lg:col-span-5">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24">
                    <div class="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                        <h2 class="text-xl font-bold text-gray-800">Form Pengajuan</h2>
                        <span
                            class="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold border border-indigo-100">
                            Sisa: 12 Hari
                        </span>
                    </div>

                    <form @submit.prevent="submitLeaveRequest" class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Tipe Cuti</label>
                            <select v-model="leaveForm.leave_type" required
                                class="w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2.5 border bg-white">
                                <option value="Tahunan">Cuti Tahunan</option>
                                <option value="Sakit">Cuti Sakit</option>
                                <option value="Penting">Cuti Alasan Penting</option>
                            </select>
                        </div>
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Mulai</label>
                                <input type="date" v-model="leaveForm.start_date" :min="todayDate" required
                                    class="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Selesai</label>
                                <input type="date" v-model="leaveForm.end_date" :min="leaveForm.start_date || todayDate"
                                    required
                                    class="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" />
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Alasan</label>
                            <textarea v-model="leaveForm.reason" required rows="3"
                                placeholder="Tuliskan alasan detail..."
                                class="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500"></textarea>
                        </div>

                        <!-- Upload Surat Dokter (Otomatis muncul jika Cuti Sakit) -->
                        <div v-if="leaveForm.leave_type === 'Sakit'"
                            class="bg-blue-50 p-4 rounded-lg border border-blue-100 mt-2">
                            <label class="block text-sm font-medium text-blue-800 mb-1">Upload Surat Dokter
                                (Wajib)</label>
                            <input type="file" @change="handleFileUpload" accept=".pdf,.jpg,.jpeg,.png" required
                                class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition" />
                        </div>

                        <div class="pt-4">
                            <button type="submit" :disabled="isSubmittingLeave"
                                class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-md disabled:opacity-50 flex justify-center items-center gap-2">
                                <svg v-if="!isSubmittingLeave" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5"
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                {{ isSubmittingLeave ? 'Mengirim Data...' : 'Kirim Pengajuan' }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- KANAN: RIWAYAT CUTI (Porsi 7/12) -->
            <div class="lg:col-span-7">
                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                    <h2 class="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">Riwayat Pengajuan
                        Saya</h2>

                    <div v-if="myLeaves.length === 0"
                        class="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <span class="text-4xl block mb-3">🏖️</span>
                        <p class="text-gray-500 font-medium">Belum ada riwayat cuti.</p>
                        <p class="text-gray-400 text-sm">Waktunya merencanakan liburan Anda!</p>
                    </div>

                    <div v-else class="space-y-4">
                        <!-- Desain Card (Lebih modern daripada tabel kaku) -->
                        <div v-for="leave in myLeaves" :key="leave.id"
                            class="p-5 border border-gray-100 rounded-xl hover:shadow-md transition bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <div class="flex items-center gap-3 mb-2">
                                    <span class="font-bold text-gray-800">{{ leave.leave_type }}</span>
                                    <span class="text-gray-400 text-xs text-sm">&bull;</span>
                                    <span class="text-gray-600 font-medium text-sm">{{ leave.start_date }} s/d {{
                                        leave.end_date }}</span>
                                </div>
                                <p class="text-gray-500 text-sm line-clamp-2" :title="leave.reason">{{ leave.reason }}
                                </p>
                            </div>

                            <div class="flex-shrink-0 w-full sm:w-auto text-right">
                                <span :class="{
                                    'bg-yellow-100 text-yellow-800 border border-yellow-200': leave.status === 'Pending',
                                    'bg-green-100 text-green-800 border border-green-200': leave.status === 'Approved',
                                    'bg-red-100 text-red-800 border border-red-200': leave.status === 'Rejected'
                                }"
                                    class="inline-block px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm text-center w-full sm:w-auto">
                                    {{ leave.status }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue';
import api from '../services/api';
import Swal from 'sweetalert2';

const isSubmittingLeave = ref(false);
const myLeaves = ref([]);

// Validasi Tanggal (Tidak bisa memilih hari kemarin)
const todayDate = computed(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
});

const leaveForm = reactive({
    leave_type: 'Tahunan',
    start_date: '',
    end_date: '',
    reason: '',
    document: null
});

const fetchMyLeaves = async () => {
    try {
        const response = await api.get('/leaves/my-requests');
        myLeaves.value = response.data.data;
    } catch (error) {
        console.error('Gagal mengambil riwayat cuti:', error);
    }
};

const handleFileUpload = (event) => {
    leaveForm.document = event.target.files[0];
};

const submitLeaveRequest = async () => {
    isSubmittingLeave.value = true;
    try {
        const formData = new FormData();
        formData.append('leave_type', leaveForm.leave_type);
        formData.append('start_date', leaveForm.start_date);
        formData.append('end_date', leaveForm.end_date);
        formData.append('reason', leaveForm.reason);
        if (leaveForm.document) formData.append('document', leaveForm.document);

        await api.post('/leaves', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

        Swal.fire({
            icon: 'success',
            title: 'Berhasil!',
            text: 'Pengajuan cuti Anda telah terkirim dan sedang menunggu persetujuan Manajer.',
            confirmButtonColor: '#4f46e5'
        });

        // Reset Form
        leaveForm.leave_type = 'Tahunan';
        leaveForm.start_date = '';
        leaveForm.end_date = '';
        leaveForm.reason = '';
        leaveForm.document = null;

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';

        fetchMyLeaves(); // Muat ulang data terbaru
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.response?.data?.message || 'Terjadi kesalahan saat mengirim pengajuan cuti.',
            confirmButtonColor: '#ef4444'
        });
    } finally {
        isSubmittingLeave.value = false;
    }
};

onMounted(() => {
    fetchMyLeaves();
});
</script>