<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useEmployeeStore } from '../stores/employeeStore';
import api from '../services/api';
import Swal from 'sweetalert2';

const router = useRouter();
const route = useRoute(); // Untuk mengambil ID dari URL
const employeeStore = useEmployeeStore();

const positions = ref([]);
const isFetching = ref(true);

const form = reactive({
    nip: '', nama_lengkap: '', email: '', tanggal_bergabung: '', position_id: ''
});

onMounted(async () => {
    // 1. Ambil data jabatan
    const posRes = await api.get('/positions');
    positions.value = posRes.data;

    // 2. Ambil data karyawan berdasarkan ID di URL
    const empData = await employeeStore.getEmployee(route.params.id);
    if (empData) {
        form.nip = empData.nip;
        form.nama_lengkap = empData.nama_lengkap;
        form.email = empData.email;
        form.tanggal_bergabung = empData.tanggal_bergabung;
        form.position_id = empData.position_id;
    }
    isFetching.value = false;
});

const handleUpdate = async () => {
    const success = await employeeStore.updateEmployee(route.params.id, form);
    if (success) {
        Swal.fire('Diperbarui!', 'Data karyawan berhasil diubah.', 'success');
        await employeeStore.fetchEmployees();
        router.push({ name: 'Dashboard' });
    } else {
        Swal.fire('Gagal!', employeeStore.error, 'error');
    }
};
</script>

<!-- Bagian <template> sama persis dengan AddEmployee.vue, 
     hanya ubah teks judul menjadi "Edit Data Karyawan" dan 
     @submit.prevent="handleUpdate" -->
<template>
    <div class="min-h-screen bg-gray-100 p-6">
        <div class="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8 border border-gray-200">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">Edit Data Karyawan</h2>
                <button @click="router.push({ name: 'Dashboard' })" class="text-gray-500 hover:text-gray-700">
                    Batal & Kembali
                </button>
            </div>

            <!-- Tampilkan pesan error validasi jika ada -->
            <div v-if="employeeStore.error"
                class="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                {{ employeeStore.error }}
            </div>

            <form @submit.prevent="handleUpdate" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">NIP (Nomor Induk Pegawai)</label>
                        <input v-model="form.nip" type="text" required placeholder="Contoh: NIP-2026"
                            class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none">
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Tanggal Bergabung</label>
                        <input v-model="form.tanggal_bergabung" type="date" required
                            class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                    <input v-model="form.nama_lengkap" type="text" required
                        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Karyawan</label>
                    <input v-model="form.email" type="email" required
                        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Pilih Jabatan & Departemen</label>
                    <select v-model="form.position_id" required
                        class="w-full px-4 py-2 border rounded-lg focus:ring-blue-500 outline-none bg-white">
                        <option value="" disabled>{{ isFetchingPositions ? 'Memuat jabatan...' : '-- Pilih Jabatan --'
                            }}</option>
                        <option v-for="pos in positions" :key="pos.id" :value="pos.id">
                            {{ pos.nama_jabatan }} (Dept. {{ pos.department?.nama_departemen }})
                        </option>
                    </select>
                </div>

                <button type="submit" :disabled="employeeStore.loading"
                    class="w-full mt-6 bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                    {{ employeeStore.loading ? 'Menyimpan...' : 'Simpan Data Karyawan' }}
                </button>
            </form>
        </div>
    </div>
</template>