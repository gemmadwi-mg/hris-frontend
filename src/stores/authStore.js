import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
    const user = ref(null);
    const error = ref(null);

    const login = async (email, password) => {
        error.value = null;
        try {
            // Gunakan 'api' yang sama agar Cookie XSRF diikat pada instance ini
            await api.get('http://localhost:8000/sanctum/csrf-cookie');

            // Lanjut POST ke http://localhost:8000/api/login
            const response = await api.post('/login', { email, password });

            user.value = response.data.user;
            return true;
        } catch (err) {
            error.value = err.response?.data?.message || 'Login gagal';
            return false;
        }
    };

    const logout = async () => {
        try {
            // Coba beri tahu server untuk menghapus sesi
            await api.post('/logout');
        } catch (err) {
            // Jika server error (misal: 401 Unauthenticated karena sesi sudah habis duluan), 
            // kita tangkap error-nya agar aplikasi tidak 'hang'
            console.error('Logout di server gagal atau sesi sudah habis:', err);
        } finally {
            // Blok finally AKAN SELALU DIJALANKAN entah try sukses atau catch error.
            // Ini memaksa frontend untuk tetap membersihkan data user.
            user.value = null;
        }
    };

    const checkAuth = async () => {
        try {
            const response = await api.get('/me');
            user.value = response.data;
        } catch (err) {
            user.value = null;
        }
    };

    return { user, error, login, logout, checkAuth };
});