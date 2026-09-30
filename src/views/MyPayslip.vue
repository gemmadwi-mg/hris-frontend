<template>
    <div class="max-w-5xl mx-auto space-y-6">
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Slip Gaji Saya</h1>
            <p class="text-gray-500 text-sm mt-1">Transparansi riwayat penggajian dan potongan absensi Anda setiap
                bulan.</p>
        </div>

        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div class="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h2 class="text-lg font-bold text-gray-800">Daftar Penerimaan Gaji</h2>
            </div>

            <div v-if="myPayslips.length === 0" class="text-center py-12">
                <span class="text-4xl block mb-3">💸</span>
                <p class="text-gray-500 font-medium">Belum ada data slip gaji.</p>
                <p class="text-gray-400 text-sm mt-1">Gaji Anda akan diproses oleh HR di akhir periode.</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-white text-xs text-gray-500 border-b border-gray-100 uppercase tracking-wider">
                            <th class="px-6 py-4 font-bold">Periode Bulan</th>
                            <th class="px-6 py-4 font-bold text-right">Gaji Pokok</th>
                            <th class="px-6 py-4 font-bold text-right">Potongan Absen</th>
                            <th class="px-6 py-4 font-bold text-right text-emerald-600">Total Bersih</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100">
                        <tr v-for="slip in myPayslips" :key="slip.id" class="hover:bg-gray-50 transition">
                            <td class="px-6 py-4">
                                <span
                                    class="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold border border-blue-100">
                                    {{ slip.bulan }} / {{ slip.tahun }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-right text-gray-600 font-medium">
                                {{ formatRupiah(slip.gaji_pokok) }}
                            </td>
                            <td class="px-6 py-4 text-right text-red-500 font-medium">
                                - {{ formatRupiah(slip.potongan) }}
                            </td>
                            <td class="px-6 py-4 text-right text-lg font-black text-emerald-600">
                                {{ formatRupiah(slip.total_gaji_bersih) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import api from '../services/api';

const myPayslips = ref([]);

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka);
};

const fetchMyPayslips = async () => {
    try {
        const response = await api.get('/my-payslips');
        myPayslips.value = response.data.data;
    } catch (error) {
        console.error('Gagal mengambil riwayat gaji:', error);
    }
};

onMounted(() => {
    fetchMyPayslips();
});
</script>