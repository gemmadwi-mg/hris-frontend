<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const email = ref('');
const password = ref('');
const loading = ref(false);

const authStore = useAuthStore();
const router = useRouter();

// Contoh jika logika ini ada di Login.vue setelah memanggil authStore.login()
const handleLogin = async () => {
    loading.value = true;
    try {
        const success = await authStore.login(email.value, password.value);
        if (success) {
            // Semua pengguna (HR, Manager, Karyawan) diarahkan ke pintu utama Dasbor
            router.push('/');
        } else {
            // Error biasanya sudah di-handle oleh store Pinia
        }
    } finally {
        loading.value = false;
    }
};

</script>

<template>
    <div class="min-h-screen bg-gray-50 flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">HRIS Login</h2>

            <div v-if="authStore.error"
                class="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                {{ authStore.error }}
            </div>

            <form @submit.prevent="handleLogin" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Email Karyawan</label>
                    <input v-model="email" type="email" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="admin@hris.com">
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input v-model="password" type="password" required
                        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        placeholder="••••••••">
                </div>

                <button type="submit" :disabled="loading"
                    class="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                    {{ loading ? 'Memproses...' : 'Masuk ke Sistem' }}
                </button>
            </form>
        </div>
    </div>
</template>