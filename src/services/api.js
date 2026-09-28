import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    // withCredentials dan withXSRFToken DIHAPUS SAJA!
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
});

// PENJAGA GERBANG 1: Menyuntikkan Token ke setiap Request
api.interceptors.request.use(config => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// PENJAGA GERBANG 2: Menendang user jika Token tidak valid (401)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isLoginRequest = error.config.url.includes('/login');
        if (error.response && error.response.status === 401 && !isLoginRequest) {
            localStorage.removeItem('user_data');
            localStorage.removeItem('access_token'); // Hapus token
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;