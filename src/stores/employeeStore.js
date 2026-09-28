import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api'; // Import Axios global yang baru dibuat

export const useEmployeeStore = defineStore('employee', () => {
    // 1. State (Variabel reaktif)
    const employees = ref([]);
    const loading = ref(false);
    const error = ref(null);

    // 2. Actions (Fungsi untuk memanipulasi state)
    const fetchEmployees = async () => {
        loading.value = true;
        error.value = null;
        try {
            // Cukup panggil '/employees', baseURL otomatis ditambahkan oleh Axios
            const response = await api.get('/employees');

            // Perhatikan: response.data.data karena Laravel API Resource 
            // secara otomatis membungkus array ke dalam properti 'data'
            employees.value = response.data.data;
        } catch (err) {
            error.value = err.response?.data?.message || 'Gagal mengambil data dari server';
            console.error(err);
        } finally {
            loading.value = false;
        }
    };

    const addEmployee = async (formData) => {
        loading.value = true;
        error.value = null;
        try {
            await api.post('/employees', formData);
            return true; // Berhasil
        } catch (err) {
            // Tangkap pesan error validasi dari Laravel (misal: "Email sudah digunakan")
            if (err.response?.status === 422) {
                // Mengambil pesan error pertama dari object errors
                const validationErrors = err.response.data.errors;
                error.value = Object.values(validationErrors)[0][0];
            } else {
                error.value = err.response?.data?.message || 'Gagal menyimpan data';
            }
            return false; // Gagal
        } finally {
            loading.value = false;
        }
    };

    // ... fungsi yang sudah ada (fetchEmployees, addEmployee)

    const getEmployee = async (id) => {
        try {
            const response = await api.get(`/employees/${id}`);
            return response.data.data || response.data;
        } catch (err) {
            console.error('Gagal mengambil data karyawan', err);
            return null;
        }
    };

    const updateEmployee = async (id, formData) => {
        loading.value = true;
        try {
            // Gunakan metode PUT/PATCH untuk update
            await api.put(`/employees/${id}`, formData);
            return true;
        } catch (err) {
            error.value = err.response?.data?.message || 'Gagal memperbarui data';
            return false;
        } finally {
            loading.value = false;
        }
    };

    const deleteEmployee = async (id) => {
        try {
            await api.delete(`/employees/${id}`);
            // Hapus data dari state lokal tanpa harus memanggil fetchEmployees() lagi
            employees.value = employees.value.filter(emp => emp.id !== id);
            return true;
        } catch (err) {
            console.error('Gagal menghapus data', err);
            return false;
        }
    };

    // 3. Return semua variabel dan fungsi agar bisa dipakai di komponen Vue
    return {
        employees,
        loading,
        error,
        fetchEmployees,
        addEmployee,
        getEmployee,
        updateEmployee,
        deleteEmployee
    };
});