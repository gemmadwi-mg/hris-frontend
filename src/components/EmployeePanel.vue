<template>
    <div class="max-w-5xl mx-auto space-y-6">

        <!-- KOTAK REKAM KEHADIRAN (FOKUS UTAMA) -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-10 text-center relative overflow-hidden">
            <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

            <div class="mb-10 mt-2">
                <h2 class="text-3xl font-black text-gray-800">Rekam Kehadiran</h2>
                <p class="text-gray-500 mt-2">Selamat bekerja! Pastikan GPS Anda aktif.</p>

                <div class="mt-8 inline-block bg-gray-50 border border-gray-100 rounded-2xl px-10 py-6 shadow-inner">
                    <p class="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">{{ currentDate }}</p>
                    <p class="text-6xl font-black text-gray-800 tracking-tighter font-mono">{{ currentTime }}</p>
                </div>
            </div>

            <div class="flex flex-col sm:flex-row justify-center items-center gap-6">
                <button @click="clockIn" :disabled="loading"
                    class="w-full sm:w-64 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3">
                    <span class="text-2xl">🌤️</span> Clock In
                </button>

                <button @click="clockOut" :disabled="loading"
                    class="w-full sm:w-64 py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:opacity-50 flex items-center justify-center gap-3">
                    <span class="text-2xl">🌙</span> Clock Out
                </button>
            </div>
        </div>

        <!-- WIDGET STATISTIK CEPAT -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div class="p-4 bg-indigo-50 text-indigo-600 rounded-xl text-2xl">📅</div>
                <div>
                    <p class="text-sm font-medium text-gray-500">Sisa Cuti Tahunan</p>
                    <h3 class="text-2xl font-bold text-gray-800">12 <span
                            class="text-sm font-normal text-gray-400">Hari</span></h3>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div class="p-4 bg-green-50 text-green-600 rounded-xl text-2xl">✅</div>
                <div>
                    <p class="text-sm font-medium text-gray-500">Kehadiran Bulan Ini</p>
                    <h3 class="text-2xl font-bold text-gray-800">18 <span
                            class="text-sm font-normal text-gray-400">Hari</span></h3>
                </div>
            </div>
            <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                <div class="p-4 bg-red-50 text-red-600 rounded-xl text-2xl">⏰</div>
                <div>
                    <p class="text-sm font-medium text-gray-500">Keterlambatan</p>
                    <h3 class="text-2xl font-bold text-gray-800">0 <span
                            class="text-sm font-normal text-gray-400">Kali</span></h3>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import api from '../services/api';
import Swal from 'sweetalert2';

const loading = ref(false);
const currentTime = ref('');
const currentDate = ref('');
let timer;

const updateClock = () => {
    const now = new Date();
    currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
};

// --- FUNGSI MENDAPATKAN KOORDINAT GPS ---
const getEmployeeLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject('Browser Anda tidak mendukung fitur lokasi GPS.');
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Berhasil mendapatkan koordinat
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                // Kita format menjadi string "Lat: -7.xxx, Lng: 112.xxx"
                resolve(`${lat}, ${lng}`);
            },
            (error) => {
                // Menangani error jika karyawan menolak izin lokasi
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        reject("Anda menolak akses lokasi. Absen dibatalkan.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        reject("Informasi lokasi GPS tidak tersedia saat ini.");
                        break;
                    case error.TIMEOUT:
                        reject("Waktu permintaan lokasi habis (Timeout).");
                        break;
                    default:
                        reject("Terjadi kesalahan sistem yang tidak diketahui.");
                        break;
                }
            },
            {
                enableHighAccuracy: true, // Memaksa browser menggunakan GPS (bukan sekadar IP Internet)
                timeout: 10000,           // Batas waktu tunggu 10 detik
                maximumAge: 0             // Jangan gunakan cache lokasi lama
            }
        );
    });
};

// --- FUNGSI CLOCK IN ---
// --- FUNGSI CLOCK IN ---
// --- FUNGSI CLOCK IN (DENGAN GPS) ---
const clockIn = async () => {
    loading.value = true;
    try {
        // 1. Tampilkan loading SweetAlert karena mencari GPS butuh beberapa detik
        Swal.fire({
            title: 'Mencari Lokasi GPS...',
            html: 'Mohon izinkan akses lokasi pada browser Anda.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // 2. Ambil koordinat menggunakan fungsi yang kita buat
        const lokasiKaryawan = await getEmployeeLocation();

        // 3. Kirim koordinat asli ke Laravel
        const response = await api.post('/attendances/clock-in', {
            location: lokasiKaryawan
        });

        // 4. Tampilkan pesan sukses
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Clock-In!',
            html: `${response.data.message}<br><br><b>Lokasi:</b> ${lokasiKaryawan}`,
            timer: 4000,
            showConfirmButton: false
        });
    } catch (error) {
        // Jika gagal karena tolak akses GPS atau error server
        Swal.fire({
            icon: 'error',
            title: 'Gagal Clock-In',
            // Cek apakah error dari string (GPS) atau dari server Laravel
            text: typeof error === 'string' ? error : (error.response?.data?.message || 'Terjadi kesalahan sistem.')
        });
    } finally {
        loading.value = false;
    }
};

// --- FUNGSI CLOCK OUT (DENGAN GPS) ---
const clockOut = async () => {
    loading.value = true;
    try {
        // 1. Tampilkan loading SweetAlert
        Swal.fire({
            title: 'Mencari Lokasi GPS...',
            html: 'Memverifikasi titik lokasi pulang Anda...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        // 2. Ambil koordinat GPS
        const lokasiKaryawan = await getEmployeeLocation();

        // 3. Kirim koordinat ke Laravel
        const response = await api.post('/attendances/clock-out', {
            location_out: lokasiKaryawan // Kita kirim dengan nama variabel berbeda jika backend membutuhkannya nanti
        });

        // 4. Tampilkan pesan sukses
        Swal.fire({
            icon: 'success',
            title: 'Berhasil Clock-Out!',
            html: `${response.data.message}<br><br><b>Lokasi Pulang:</b> ${lokasiKaryawan}<br>Selamat beristirahat!`,
            timer: 4000,
            showConfirmButton: false
        });
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal Clock-Out',
            text: typeof error === 'string' ? error : (error.response?.data?.message || 'Terjadi kesalahan pada server.')
        });
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    updateClock();
    timer = setInterval(updateClock, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>