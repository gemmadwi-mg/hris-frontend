import { defineStore } from 'pinia';
import { ref } from 'vue';
import api from '../services/api';

export const useAuthStore = defineStore('auth', () => {
    // Saat aplikasi pertama kali dimuat (atau di-refresh), cek apakah ada data di Local Storage
    const savedUser = localStorage.getItem('user_data');
    const user = ref(savedUser ? JSON.parse(savedUser) : null);

    const error = ref(null);

    const login = async (email, password) => {
        error.value = null;
        try {
            // LANGSUNG TEMBAK API LOGIN SAJA
            const response = await api.post('/login', { email, password });

            user.value = response.data.user;

            // Simpan Data & TOKEN ke Local Storage
            localStorage.setItem('user_data', JSON.stringify(user.value));
            localStorage.setItem('access_token', response.data.token); // Simpan Token

            return true;
        } catch (err) {
            error.value = err.response?.data?.message || 'Login gagal';
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/logout');
        } catch (err) {
            console.error('Logout error', err);
        } finally {
            user.value = null;
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token'); // Bersihkan Token
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