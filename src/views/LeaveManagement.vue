<template>
    <div class="max-w-7xl mx-auto space-y-8">

        <!-- HEADER HALAMAN (Tanpa Tombol Kembali) -->
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Manajemen Pengajuan Cuti</h1>
                <p class="text-sm text-gray-500 mt-1">Kelola permohonan cuti dan izin karyawan secara terpusat.</p>
            </div>

            <!-- Tab Filter Cepat (Hanya Frontend) -->
            <div class="flex bg-gray-100 p-1 rounded-lg">
                <button @click="statusFilter = 'All'"
                    :class="statusFilter === 'All' ? 'bg-white text-gray-800 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'"
                    class="px-4 py-2 text-sm rounded-md transition">Semua</button>
                <button @click="statusFilter = 'Pending'"
                    :class="statusFilter === 'Pending' ? 'bg-white text-yellow-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'"
                    class="px-4 py-2 text-sm rounded-md transition flex items-center gap-1"><span
                        v-if="pendingCount > 0"
                        class="bg-yellow-100 text-yellow-800 text-[10px] px-1.5 py-0.5 rounded-full">{{ pendingCount
                        }}</span> Pending</button>
                <button @click="statusFilter = 'Approved'"
                    :class="statusFilter === 'Approved' ? 'bg-white text-green-600 shadow-sm font-bold' : 'text-gray-500 hover:text-gray-700'"
                    class="px-4 py-2 text-sm rounded-md transition">Disetujui</button>
            </div>
        </div>

        <!-- TABEL DATA -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Karyawan</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Periode Cuti</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Detail Permohonan</th>
                            <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Lampiran</th>
                            <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Status</th>
                            <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white">
                        <!-- Loading State -->
                        <tr v-if="loading">
                            <td colspan="6" class="px-6 py-12 text-center text-gray-500 animate-pulse">
                                Memuat data pengajuan cuti...
                            </td>
                        </tr>

                        <!-- Empty State -->
                        <tr v-else-if="filteredLeaves.length === 0">
                            <td colspan="6" class="px-6 py-12 text-center">
                                <span class="text-4xl block mb-3">🏖️</span>
                                <p class="text-gray-500 font-medium">Tidak ada data cuti yang ditemukan.</p>
                            </td>
                        </tr>

                        <!-- Data Row -->
                        <tr v-for="leave in filteredLeaves" :key="leave.id" class="hover:bg-gray-50 transition">
                            <!-- Karyawan -->
                            <td class="px-6 py-5">
                                <div class="font-bold text-gray-900">{{ leave.employee?.nama_lengkap }}</div>
                                <div class="text-xs text-gray-500 mt-0.5">NIP: {{ leave.employee?.nip }}</div>
                            </td>

                            <!-- Periode Cuti -->
                            <td class="px-6 py-5 text-sm text-gray-600 font-medium whitespace-nowrap">
                                <div class="flex flex-col">
                                    <span>Mulai: <span class="text-gray-900">{{ leave.start_date }}</span></span>
                                    <span>Akhir: <span class="text-gray-900">{{ leave.end_date }}</span></span>
                                </div>
                            </td>

                            <!-- Detail Permohonan -->
                            <td class="px-6 py-5">
                                <div class="inline-flex items-center gap-1.5 text-xs font-bold uppercase mb-1"
                                    :class="leave.leave_type === 'Sakit' ? 'text-red-600' : 'text-indigo-600'">
                                    <span>{{ leave.leave_type === 'Sakit' ? '💊' : '🌴' }}</span>
                                    {{ leave.leave_type || 'Tahunan' }}
                                </div>
                                <p class="text-sm text-gray-600 line-clamp-2" :title="leave.reason">{{ leave.reason }}
                                </p>
                            </td>

                            <!-- Lampiran -->
                            <td class="px-6 py-5 text-center">
                                <button v-if="leave.leave_type === 'Sakit' && leave.document_path"
                                    @click="downloadDocument(leave.id, leave.employee?.nama_lengkap)"
                                    class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-bold transition inline-flex items-center gap-1.5 border border-blue-200 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Surat Dokter
                                </button>
                                <span v-else class="text-gray-300 text-sm italic">-</span>
                            </td>

                            <!-- Status -->
                            <td class="px-6 py-5 text-center">
                                <span :class="{
                                    'bg-yellow-50 text-yellow-700 border border-yellow-200': leave.status === 'Pending',
                                    'bg-green-50 text-green-700 border border-green-200': leave.status === 'Approved',
                                    'bg-red-50 text-red-700 border border-red-200': leave.status === 'Rejected'
                                }" class="px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                                    {{ leave.status }}
                                </span>
                            </td>

                            <!-- Aksi -->
                            <td class="px-6 py-5 text-center">
                                <div class="flex justify-center gap-2" v-if="leave.status === 'Pending'">
                                    <button @click="updateStatus(leave.id, 'Approved', leave.employee?.nama_lengkap)"
                                        class="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition">
                                        Setujui
                                    </button>
                                    <button @click="updateStatus(leave.id, 'Rejected', leave.employee?.nama_lengkap)"
                                        class="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm transition">
                                        Tolak
                                    </button>
                                </div>
                                <span v-else class="text-gray-400 text-xs font-medium italic">Telah Diproses</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import api from '../services/api';
import Swal from 'sweetalert2';

const leaves = ref([]);
const loading = ref(true);
const statusFilter = ref('All'); // State untuk filter tab

// Computed property untuk memfilter data berdasarkan tab yang aktif
const filteredLeaves = computed(() => {
    if (statusFilter.value === 'All') return leaves.value;
    return leaves.value.filter(leave => leave.status === statusFilter.value);
});

// Menghitung jumlah cuti yang butuh persetujuan untuk ditampilkan di tab (badge angka)
const pendingCount = computed(() => {
    return leaves.value.filter(leave => leave.status === 'Pending').length;
});

const fetchLeaves = async () => {
    loading.value = true;
    try {
        const response = await api.get('/leaves/all');
        leaves.value = response.data.data;
    } catch (error) {
        console.error('Gagal memuat data cuti', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchLeaves);

const updateStatus = async (id, status, namaKaryawan) => {
    const actionText = status === 'Approved' ? 'menyetujui' : 'menolak';
    const confirmColor = status === 'Approved' ? '#10b981' : '#ef4444'; // Emerald atau Red

    const result = await Swal.fire({
        title: 'Konfirmasi Keputusan',
        text: `Apakah Anda yakin ingin ${actionText} permohonan cuti dari ${namaKaryawan}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: '#9ca3af',
        confirmButtonText: `Ya, ${status === 'Approved' ? 'Setujui' : 'Tolak'}`,
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            await api.patch(`/leaves/${id}/status`, { status });

            Swal.fire({
                icon: 'success',
                title: 'Berhasil',
                text: `Pengajuan cuti telah ${status === 'Approved' ? 'disetujui' : 'ditolak'}.`,
                timer: 2000,
                showConfirmButton: false
            });

            fetchLeaves();
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat memperbarui status.', 'error');
        }
    }
};

const downloadDocument = async (leaveId, employeeName) => {
    try {
        Swal.fire({
            title: 'Mengunduh Dokumen...',
            text: 'Harap tunggu sebentar.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        const response = await api.get(`/leaves/${leaveId}/document`, {
            responseType: 'blob'
        });

        const contentType = response.headers['content-type'];
        let extension = 'pdf';
        if (contentType === 'image/jpeg') extension = 'jpg';
        if (contentType === 'image/png') extension = 'png';

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Surat-Sakit-${employeeName.replace(/\s+/g, '-')}.${extension}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.close();
    } catch (error) {
        Swal.fire('Gagal', 'Dokumen gagal diunduh atau karyawan tidak melampirkan file.', 'error');
    }
};
</script>