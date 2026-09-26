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

    // 3. Return semua variabel dan fungsi agar bisa dipakai di komponen Vue
    return {
        employees,
        loading,
        error,
        fetchEmployees
    };
});