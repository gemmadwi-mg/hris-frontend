import axios from 'axios';

// Membuat instansiasi Axios khusus
const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withXSRFToken: true, // <--- TAMBAHKAN BARIS INI (Wajib untuk Axios 1.6+)
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    },
    // withCredentials SANGAT PENTING untuk aplikasi SPA Laravel.
    // Ini mengizinkan Axios mengirimkan cookie/sesi Sanctum di setiap request.
    withCredentials: true
});

// (Opsional) Interceptor untuk menangani error global, 
// misalnya jika token kedaluwarsa, otomatis arahkan ke halaman login
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            console.error('Sesi habis, silakan login kembali.');
            // Logika logout / redirect bisa ditaruh di sini nanti
        }
        return Promise.reject(error);
    }
);

export default api;