<template>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h2 class="text-xl font-bold text-gray-800 mb-2">Import Data Absensi</h2>
        <p class="text-sm text-gray-500 mb-6">Unggah file Excel (.xlsx, .csv) dari mesin fingerprint.</p>

        <!-- Area Drag & Drop / Upload -->
        <div v-if="!isUploading"
            class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative"
            @dragover.prevent="dragover = true" @dragleave.prevent="dragover = false" @drop.prevent="handleDrop"
            :class="{ 'bg-indigo-50 border-indigo-400': dragover }">

            <input type="file" ref="fileInput" @change="handleFileSelect" accept=".xlsx, .xls, .csv"
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />

            <div class="text-indigo-500 mb-3 text-4xl">📄</div>
            <p class="text-gray-700 font-medium mb-1">Tarik & Lepas file Excel di sini</p>
            <p class="text-xs text-gray-400">Atau klik untuk memilih file (Maks. 10MB)</p>

            <div v-if="selectedFile"
                class="mt-4 inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold">
                <span>{{ selectedFile.name }}</span>
            </div>
        </div>

        <!-- Tombol Proses -->
        <div v-if="!isUploading && selectedFile" class="mt-4 flex justify-end">
            <button @click="uploadExcel"
                class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-lg transition shadow-md flex items-center gap-2">
                🚀 Mulai Import Data
            </button>
        </div>

        <!-- Animasi Loading (Menggantikan Progress Bar) -->
        <div v-if="isUploading"
            class="mt-4 bg-indigo-50 rounded-xl p-8 border border-indigo-100 text-center animate-pulse">
            <div
                class="inline-block w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4">
            </div>
            <h3 class="text-lg font-bold text-indigo-800">Sedang Memproses Data...</h3>
            <p class="text-sm text-indigo-600 mt-1">Mohon tunggu dan jangan tutup halaman ini. Proses ini mungkin
                memakan waktu beberapa detik.</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';
import Swal from 'sweetalert2';

const fileInput = ref(null);
const selectedFile = ref(null);
const dragover = ref(false);

const isUploading = ref(false);

const handleDrop = (e) => {
    dragover.value = false;
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles.length > 0) selectedFile.value = droppedFiles[0];
};

const handleFileSelect = (e) => {
    if (e.target.files.length > 0) selectedFile.value = e.target.files[0];
};

const uploadExcel = async () => {
    if (!selectedFile.value) return;

    isUploading.value = true; // Munculkan animasi loading

    const formData = new FormData();
    formData.append('file', selectedFile.value);

    try {
        // Sistem akan 'menunggu' (await) sampai Laravel selesai membaca semua baris
        await api.post('/attendances/import', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        // Jika sukses melewari await, berarti import selesai 100%
        Swal.fire({
            icon: 'success',
            title: 'Import Selesai!',
            text: 'Seluruh data absensi berhasil dimasukkan ke sistem.',
            confirmButtonColor: '#4f46e5'
        });

        selectedFile.value = null;
        if (fileInput.value) fileInput.value.value = '';

        // [Opsional] Emit event ke komponen induk untuk mereload tabel kehadiran di bawahnya

    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Gagal',
            text: error.response?.data?.message || 'Terjadi kesalahan saat mengunggah file.'
        });
    } finally {
        isUploading.value = false; // Matikan animasi loading, baik sukses maupun gagal
    }
};
</script>