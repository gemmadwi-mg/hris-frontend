<template>
    <div class="max-w-7xl mx-auto space-y-8">

        <!-- HEADER HALAMAN -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-800">Manajemen Penggajian (Payroll)</h1>
                <p class="text-gray-500 text-sm mt-1">Kelola perhitungan gaji bulanan, cetak slip, dan cairkan dana
                    langsung ke rekening karyawan.</p>
            </div>

            <div class="flex gap-3">
                <button @click="generateGaji" :disabled="isGenerating"
                    class="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl transition shadow-md disabled:opacity-50 flex items-center gap-2 text-sm">
                    <span class="text-lg">💰</span> {{ isGenerating ? 'Memproses...' : 'Kalkulasi Gaji Bulan Ini' }}
                </button>
            </div>
        </div>

        <!-- TABEL PAYROLL -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="px-6 py-5 border-b border-gray-100 bg-gray-50">
                <h2 class="text-lg font-bold text-gray-800">Daftar Gaji Karyawan</h2>
            </div>

            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-white border-b border-gray-100">
                        <tr>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Periode</th>
                            <th class="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Karyawan</th>
                            <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Pendapatan</th>
                            <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Potongan</th>
                            <th class="px-6 py-4 text-right text-xs font-bold text-gray-800 uppercase tracking-wider">
                                Total Bersih</th>
                            <th class="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Status Pembayaran</th>
                            <th class="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">
                                Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 bg-white text-sm">

                        <tr v-if="loading" class="animate-pulse">
                            <td colspan="7" class="px-6 py-12 text-center text-gray-400 font-medium">Memuat data gaji...
                            </td>
                        </tr>
                        <tr v-else-if="payrolls.length === 0">
                            <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                                Belum ada data gaji. Silakan klik "Kalkulasi Gaji Bulan Ini".
                            </td>
                        </tr>

                        <template v-else>
                            <tr v-for="payroll in payrolls" :key="payroll.id" class="hover:bg-gray-50 transition">
                                <!-- Periode -->
                                <td class="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                                    {{ getBulan(payroll.bulan) }} {{ payroll.tahun }}
                                </td>

                                <!-- Karyawan -->
                                <td class="px-6 py-4">
                                    <div class="font-bold text-gray-900">{{ payroll.employee?.nama_lengkap }}</div>
                                    <div class="text-xs text-gray-500">{{ payroll.employee?.nama_bank }} - {{
                                        payroll.employee?.nomor_rekening }}</div>
                                </td>

                                <!-- Pendapatan -->
                                <td class="px-6 py-4 text-right text-green-600 font-medium">
                                    {{ formatRupiah(Number(payroll.gaji_pokok) + Number(payroll.tunjangan)) }}
                                </td>

                                <!-- Potongan -->
                                <td class="px-6 py-4 text-right text-red-600 font-medium">
                                    -{{ formatRupiah(payroll.potongan) }}
                                </td>

                                <!-- Gaji Bersih -->
                                <td class="px-6 py-4 text-right font-black text-gray-800 bg-gray-50/50">
                                    {{ formatRupiah(payroll.total_gaji_bersih) }}
                                </td>

                                <!-- Status (Logika Xendit Terpasang) -->
                                <td class="px-6 py-4 text-center">
                                    <span v-if="payroll.status === 'pending' && !payroll.xendit_disbursement_id"
                                        class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-gray-200 shadow-sm">
                                        Belum Cair
                                    </span>
                                    <span v-else-if="payroll.status === 'pending' && payroll.xendit_disbursement_id"
                                        class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-blue-200 shadow-sm animate-pulse flex items-center justify-center gap-1 w-max mx-auto">
                                        <svg class="animate-spin h-3 w-3 text-blue-600"
                                            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                                stroke-width="4"></circle>
                                            <path class="opacity-75" fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                            </path>
                                        </svg>
                                        Diproses Bank
                                    </span>
                                    <span v-else-if="payroll.status === 'paid'"
                                        class="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-emerald-200 shadow-sm">
                                        Berhasil Cair ✅
                                    </span>
                                    <span v-else-if="payroll.status === 'failed'"
                                        class="bg-red-50 text-red-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-red-200 shadow-sm">
                                        Gagal ❌
                                    </span>
                                </td>

                                <!-- Aksi -->
                                <td class="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                    <button v-if="payroll.status === 'pending' && !payroll.xendit_disbursement_id"
                                        @click="cairkanGaji(payroll)"
                                        class="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm">
                                        💸 Cairkan
                                    </button>

                                    <button @click="downloadSlip(payroll.employee_id, payroll.employee.nama_lengkap)"
                                        class="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded text-xs font-bold transition shadow-sm">
                                        📄 Slip
                                    </button>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import Swal from 'sweetalert2';

const payrolls = ref([]);
const loading = ref(true);
const isGenerating = ref(false);

const getBulan = (angka) => {
    const bulan = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return bulan[angka - 1] || '-';
};

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
};

// AMBIL SEMUA DATA GAJI DARI LARAVEL
const fetchPayrolls = async () => {
    loading.value = true;
    try {
        const response = await api.get('/payrolls');
        payrolls.value = response.data;
    } catch (error) {
        console.error('Gagal mengambil data payroll:', error);
    } finally {
        loading.value = false;
    }
};

// FUNGSI KALKULASI GAJI (Dipindah dari Dashboard ke sini)
const generateGaji = async () => {
    const now = new Date();
    const periode = `${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;

    const result = await Swal.fire({
        title: 'Kalkulasi Gaji Bulanan?',
        text: `Sistem akan menghitung gaji pokok dan potongan absen untuk periode ${periode}.`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Ya, Kalkulasi!'
    });

    if (result.isConfirmed) {
        isGenerating.value = true;
        try {
            Swal.fire({ title: 'Memproses...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

            const response = await api.post('/payrolls/generate', { periode });

            Swal.fire('Berhasil!', response.data.message, 'success');
            fetchPayrolls(); // Refresh tabel setelah generate
        } catch (error) {
            Swal.fire('Gagal', error.response?.data?.message || 'Terjadi kesalahan.', 'error');
        } finally {
            isGenerating.value = false;
        }
    }
};

// FUNGSI INTEGRASI DISBURSEMENT XENDIT
const cairkanGaji = async (payroll) => {
    if (!payroll.employee?.nama_bank || !payroll.employee?.nomor_rekening) {
        return Swal.fire('Data Rekening Kosong!', 'Karyawan ini belum memiliki data Bank & Nomor Rekening. Gaji tidak bisa dicairkan.', 'error');
    }

    const result = await Swal.fire({
        title: 'Konfirmasi Pencairan',
        html: `Transfer <b>${formatRupiah(payroll.total_gaji_bersih)}</b> <br>ke Rekening <b>${payroll.employee.nama_bank}</b>: <b>${payroll.employee.nomor_rekening}</b> <br>atas nama <b>${payroll.employee.nama_lengkap}</b>?<br><br>*(Tindakan ini akan menghubungi pihak Bank)*`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ya, Cairkan Sekarang!'
    });

    if (result.isConfirmed) {
        try {
            Swal.fire({
                title: 'Menghubungi Bank...',
                html: 'Mohon tunggu, sedang memproses transfer ke Xendit.',
                allowOutsideClick: false,
                didOpen: () => { Swal.showLoading(); }
            });

            // Tembak endpoint Xendit kita di Laravel
            const response = await api.post(`/payrolls/${payroll.id}/disburse`);

            Swal.fire({
                icon: 'success',
                title: 'Diproses!',
                text: 'Perintah transfer dikirim ke Bank. Status akan otomatis berubah menjadi "Berhasil Cair" saat dana mendarat di rekening.',
                confirmButtonColor: '#10b981'
            });

            fetchPayrolls(); // Refresh agar badge berubah jadi kuning/loading
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Transfer Gagal',
                text: error.response?.data?.message || 'Terjadi kesalahan komunikasi dengan server bank.',
            });
        }
    }
};

// FUNGSI DOWNLOAD SLIP PDF
const downloadSlip = async (employeeId, nama) => {
    try {
        Swal.fire({ title: 'Menyiapkan Dokumen...', allowOutsideClick: false, didOpen: () => { Swal.showLoading(); } });

        const response = await api.get(`/employees/${employeeId}/payslip`, { responseType: 'blob' });
        const namaAman = nama ? String(nama).replace(/\s+/g, '_') : 'Karyawan';

        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Slip_Gaji_${namaAman}.pdf`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        Swal.close();
    } catch (error) {
        Swal.fire('Gagal', 'Terjadi kesalahan saat memproses slip PDF.', 'error');
    }
};

onMounted(() => {
    fetchPayrolls();
});
</script>