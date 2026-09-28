<template>
    <div class="w-full space-y-6">

        <!-- AREA KHUSUS MANAJER / HR -->
        <template v-if="['HR', 'Manager'].includes(authStore.user?.role)">

            <!-- 1. WIDGET STATISTIK (SUMMARY CARDS) -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Total Karyawan (Data Asli) -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-blue-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Total Karyawan</p>
                        <h3 class="text-2xl font-bold text-gray-800">{{ totalEmployees }} <span
                                class="text-sm font-normal text-gray-400">orang</span></h3>
                    </div>
                </div>

                <!-- Kehadiran Hari Ini (Contoh UI) -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-3 bg-green-50 text-green-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
                        <h3 class="text-2xl font-bold text-gray-800">85<span
                                class="text-sm font-normal text-gray-400">%</span></h3>
                    </div>
                </div>

                <!-- Cuti Menunggu (Contoh UI) -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Cuti Pending</p>
                        <h3 class="text-2xl font-bold text-gray-800">3 <span
                                class="text-sm font-normal text-gray-400">pengajuan</span></h3>
                    </div>
                </div>

                <!-- Pengeluaran Gaji (Contoh UI) -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Status Gaji</p>
                        <h3 class="text-lg font-bold text-gray-800 mt-1">Siap Proses</h3>
                    </div>
                </div>
            </div>

            <!-- 2. TABEL DIREKTORI DENGAN SEARCH & EXPORT -->
            <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div
                    class="px-6 py-5 border-b border-gray-200 bg-gray-50 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div>
                        <h2 class="text-lg font-bold text-gray-800">Direktori Karyawan</h2>
                        <p class="text-sm text-gray-500">Kelola data, gaji, dan informasi staf</p>
                    </div>

                    <!-- Search Bar & Ekspor -->
                    <div class="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        <div class="relative w-full sm:w-64">
                            <input v-model="searchQuery" @input="resetPage" type="text"
                                placeholder="Cari nama atau NIP..."
                                class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none">
                            <svg xmlns="http://www.w3.org/2000/svg"
                                class="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>

                        <button @click="exportToCSV"
                            class="bg-white border border-gray-300 text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 shadow-sm transition flex items-center justify-center gap-2 font-medium">
                            📊 Export CSV
                        </button>
                        <button @click="prosesGaji"
                            class="bg-emerald-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-emerald-700 shadow-sm transition flex items-center justify-center gap-2 font-medium">
                            💰 Generate Gaji
                        </button>
                        <button @click="router.push({ name: 'AddEmployee' })"
                            class="bg-indigo-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-indigo-700 shadow-sm transition flex items-center justify-center font-medium">
                            + Tambah Karyawan
                        </button>
                    </div>
                </div>

                <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead>
                            <tr class="bg-white text-sm text-gray-500 border-b">
                                <th class="px-6 py-4 font-medium">NIP & Nama</th>
                                <th class="px-6 py-4 font-medium">Jabatan & Departemen</th>
                                <th class="px-6 py-4 font-medium">Bergabung</th>
                                <th class="px-6 py-4 font-medium text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100 text-sm">
                            <template v-if="employeeStore.loading">
                                <tr v-for="i in 5" :key="i" class="animate-pulse bg-white">
                                    <td class="px-6 py-4">
                                        <div class="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="h-4 bg-gray-200 rounded w-24"></div>
                                    </td>
                                    <td class="px-6 py-4 text-right">
                                        <div class="h-8 bg-gray-200 rounded w-24 ml-auto"></div>
                                    </td>
                                </tr>
                            </template>

                            <!-- JIKA HASIL PENCARIAN KOSONG -->
                            <template v-else-if="paginatedEmployees.length === 0">
                                <tr>
                                    <td colspan="4" class="px-6 py-12 text-center text-gray-500">
                                        Data karyawan tidak ditemukan.
                                    </td>
                                </tr>
                            </template>

                            <template v-else>
                                <!-- MENGGUNAKAN paginatedEmployees BUKAN employeeStore.employees -->
                                <tr v-for="emp in paginatedEmployees" :key="emp.id" class="hover:bg-gray-50 transition">
                                    <td class="px-6 py-4">
                                        <div class="font-bold text-gray-900">{{ emp.nama_lengkap }}</div>
                                        <div class="text-gray-500 text-xs">{{ emp.nip }}</div>
                                    </td>
                                    <td class="px-6 py-4">
                                        <div class="text-gray-900 font-medium">{{ emp.jabatan?.nama_jabatan || '-' }}
                                        </div>
                                        <div class="text-gray-500 text-xs">{{ emp.jabatan?.departemen || '-' }}</div>
                                    </td>
                                    <td class="px-6 py-4 text-gray-600">{{ emp.tanggal_bergabung }}</td>
                                    <td class="px-6 py-4 text-right space-x-3">
                                        <button @click="router.push(`/employees/edit/${emp.id}`)"
                                            class="text-blue-600 font-medium transition hover:underline">Edit</button>
                                        <button @click="hapusKaryawan(emp.id, emp.nama_lengkap)"
                                            class="text-red-600 font-medium transition hover:underline">Hapus</button>
                                        <button @click="downloadSlip(emp.id, emp.nama_lengkap)"
                                            :disabled="isDownloading"
                                            class="bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-xs font-semibold hover:bg-gray-200 transition disabled:opacity-50 border border-gray-200">
                                            📄 Slip
                                        </button>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </div>

                <!-- 3. PAGINATION CONTROLS -->
                <div class="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
                    <span class="text-sm text-gray-600">
                        Menampilkan <span class="font-bold">{{ paginatedEmployees.length > 0 ? (currentPage - 1) *
                            itemsPerPage + 1 : 0
                            }}</span>
                        sampai <span class="font-bold">{{ Math.min(currentPage * itemsPerPage, filteredEmployees.length)
                            }}</span>
                        dari <span class="font-bold">{{ filteredEmployees.length }}</span> karyawan
                    </span>
                    <div class="flex gap-2">
                        <button @click="prevPage" :disabled="currentPage === 1"
                            class="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 transition">
                            Sebelumnya
                        </button>
                        <button @click="nextPage" :disabled="currentPage >= totalPages"
                            class="px-3 py-1.5 border border-gray-300 rounded text-sm font-medium bg-white hover:bg-gray-50 disabled:opacity-50 transition">
                            Selanjutnya
                        </button>
                    </div>
                </div>

            </div>
        </template>

        <!-- AREA KHUSUS KARYAWAN -->
        <template v-else>
            <EmployeePanel />
        </template>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useEmployeeStore } from '../stores/employeeStore';
import api from '../services/api';
import Swal from 'sweetalert2';
import EmployeePanel from '../components/EmployeePanel.vue';

const authStore = useAuthStore();
const employeeStore = useEmployeeStore();
const router = useRouter();
const isDownloading = ref(false);

// --- FITUR BARU: SEARCH & PAGINATION ---
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 5; // Tampilkan 5 karyawan per halaman

// Menghitung Total Karyawan untuk Widget
const totalEmployees = computed(() => employeeStore.employees.length);

// Logika Pencarian
const filteredEmployees = computed(() => {
    if (!searchQuery.value) return employeeStore.employees;

    const keyword = searchQuery.value.toLowerCase();
    return employeeStore.employees.filter(emp =>
        emp.nama_lengkap.toLowerCase().includes(keyword) ||
        emp.nip.toLowerCase().includes(keyword) ||
        (emp.jabatan?.nama_jabatan && emp.jabatan.nama_jabatan.toLowerCase().includes(keyword))
    );
});

// Logika Paginasi
const totalPages = computed(() => Math.ceil(filteredEmployees.value.length / itemsPerPage));

const paginatedEmployees = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredEmployees.value.slice(start, end);
});

const prevPage = () => { if (currentPage.value > 1) currentPage.value--; };
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++; };
const resetPage = () => { currentPage.value = 1; }; // Kembalikan ke halaman 1 saat mengetik pencarian

// --- FITUR BARU: EXPORT CSV ---
const exportToCSV = () => {
    if (employeeStore.employees.length === 0) {
        return Swal.fire('Data Kosong', 'Tidak ada data karyawan untuk diekspor.', 'info');
    }

    // 1. Buat Header Kolom
    const headers = ['NIP', 'Nama Lengkap', 'Jabatan', 'Departemen', 'Tanggal Bergabung'];

    // 2. Petakan Data (Ambil data dari search filter agar data yang diekspor sesuai dengan yang tampil di layar)
    const rows = filteredEmployees.value.map(emp => [
        `"${emp.nip}"`, // Bungkus dengan kutipan ganda untuk menghindari masalah koma di CSV
        `"${emp.nama_lengkap}"`,
        `"${emp.jabatan?.nama_jabatan || '-'}"`,
        `"${emp.jabatan?.departemen || '-'}"`,
        `"${emp.tanggal_bergabung}"`
    ]);

    // 3. Gabungkan Header dan Baris
    const csvContent = "data:text/csv;charset=utf-8,"
        + headers.join(',') + "\n"
        + rows.map(e => e.join(',')).join("\n");

    // 4. Proses Unduhan di Browser
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Data_Karyawan_HRIS.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

// --- FUNGSI LAMA (Tetap Dipertahankan) ---
onMounted(() => {
    employeeStore.fetchEmployees();
});

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
</script>