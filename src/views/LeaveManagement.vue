<template>
    <div class="p-6 max-w-7xl mx-auto mt-6">
        <!-- HEADER DENGAN TOMBOL KEMBALI -->
        <div class="flex items-center gap-4 mb-8">
            <button @click="router.push({ name: 'Dashboard' })"
                class="flex items-center gap-2 text-gray-600 hover:text-indigo-600 bg-white border border-gray-200 hover:border-indigo-200 px-4 py-2.5 rounded-lg shadow-sm transition font-medium text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Kembali
            </button>

            <div>
                <h1 class="text-2xl font-bold text-gray-800">Manajemen Pengajuan Cuti</h1>
                <p class="text-sm text-gray-500 mt-1">Kelola permohonan cuti dan izin karyawan</p>
            </div>
        </div>

        <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                    <tr>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Karyawan</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Cuti</th>
                        <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe & Alasan</th>
                        <!-- Berubah -->
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Lampiran</th>
                        <!-- Baru -->
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 bg-white">
                    <!-- (TR loading dan empty state tetap sama) -->

                    <tr v-for="leave in leaves" :key="leave.id" class="hover:bg-gray-50">
                        <td class="px-6 py-4">
                            <div class="font-medium text-gray-900">{{ leave.employee?.nama_lengkap }}</div>
                            <div class="text-sm text-gray-500">{{ leave.employee?.nip }}</div>
                        </td>
                        <td class="px-6 py-4 text-sm text-gray-600">
                            {{ leave.start_date }} s/d {{ leave.end_date }}
                        </td>

                        <!-- Kolom Tipe & Alasan -->
                        <td class="px-6 py-4">
                            <div class="text-xs font-bold text-indigo-600 uppercase mb-1">{{ leave.leave_type ||
                                'Tahunan' }}</div>
                            <div class="text-sm text-gray-600 max-w-xs truncate" :title="leave.reason">{{ leave.reason
                                }}</div>
                        </td>

                        <!-- Kolom Tombol Unduh Lampiran -->
                        <td class="px-6 py-4 text-center">
                            <button v-if="leave.leave_type === 'Sakit' && leave.document_path"
                                @click="downloadDocument(leave.id, leave.employee?.nama_lengkap)"
                                class="text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md text-xs font-semibold transition inline-flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Unduh
                            </button>
                            <span v-else class="text-gray-400 text-xs italic">-</span>
                        </td>

                        <td class="px-6 py-4 text-center">
                            <span :class="{
                                'bg-yellow-100 text-yellow-800': leave.status === 'Pending',
                                'bg-green-100 text-green-800': leave.status === 'Approved',
                                'bg-red-100 text-red-800': leave.status === 'Rejected'
                            }" class="px-2 py-1 rounded text-xs font-semibold">
                                {{ leave.status }}
                            </span>
                        </td>

                        <td class="px-6 py-4 text-center space-x-2">
                            <!-- Tombol Aksi tetap sama... -->
                            <template v-if="leave.status === 'Pending'">
                                <button @click="updateStatus(leave.id, 'Approved', leave.employee?.nama_lengkap)"
                                    class="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition">Setujui</button>
                                <button @click="updateStatus(leave.id, 'Rejected', leave.employee?.nama_lengkap)"
                                    class="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition">Tolak</button>
                            </template>
                            <span v-else class="text-gray-400 text-sm italic">Selesai</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router'; // 1. Impor vue-router
import api from '../services/api';
import Swal from 'sweetalert2';

const router = useRouter(); // 2. Inisialisasi router
const leaves = ref([]);
const loading = ref(true);

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
    const confirmColor = status === 'Approved' ? '#16a34a' : '#dc2626'; // Hijau atau Merah

    const result = await Swal.fire({
        title: 'Konfirmasi',
        text: `Apakah Anda yakin ingin ${actionText} cuti dari ${namaKaryawan}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: confirmColor,
        cancelButtonColor: '#6b7280',
        confirmButtonText: `Ya, ${status === 'Approved' ? 'Setujui' : 'Tolak'}!`,
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

            fetchLeaves(); // Muat ulang tabel setelah status berubah
        } catch (error) {
            Swal.fire('Gagal', 'Terjadi kesalahan saat memperbarui status.', 'error');
        }
    }
};

const downloadDocument = async (leaveId, employeeName) => {
    try {
        // Tampilkan loading SweetAlert
        Swal.fire({
            title: 'Mengunduh...',
            text: 'Sedang mengambil dokumen dari server.',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // Panggil endpoint dengan responseType 'blob' agar file biner tidak rusak
        const response = await api.get(`/leaves/${leaveId}/document`, {
            responseType: 'blob'
        });

        // Dapatkan ekstensi asli file dari header Content-Type jika memungkinkan
        const contentType = response.headers['content-type'];
        let extension = 'pdf'; // Default
        if (contentType === 'image/jpeg') extension = 'jpg';
        if (contentType === 'image/png') extension = 'png';

        // Buat objek URL dari Blob
        const url = window.URL.createObjectURL(new Blob([response.data]));

        // Buat elemen <a> sementara untuk memicu unduhan browser
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Surat-Sakit-${employeeName.replace(/\s+/g, '-')}.${extension}`);
        document.body.appendChild(link);
        link.click();

        // Bersihkan memori
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.close(); // Tutup loading

    } catch (error) {
        Swal.fire('Gagal', 'Dokumen gagal diunduh atau karyawan tidak melampirkan file.', 'error');
    }
};
</script>