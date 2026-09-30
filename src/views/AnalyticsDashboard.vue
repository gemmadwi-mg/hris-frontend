<template>
    <div class="max-w-7xl mx-auto space-y-6">

        <!-- HEADER -->
        <div>
            <h1 class="text-2xl font-bold text-gray-800">Dasbor Analitik HRIS</h1>
            <p class="text-sm text-gray-500 mt-1">Ringkasan operasional dan metrik sumber daya manusia hari ini.</p>
        </div>

        <!-- LOADING STATE -->
        <div v-if="loading" class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>

        <div v-else class="space-y-6">
            <!-- 4 KARTU METRIK UTAMA -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <!-- Kartu 1: Total Karyawan -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-3 bg-blue-50 text-blue-600 rounded-lg text-2xl">👥</div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Total Karyawan</p>
                        <h3 class="text-2xl font-bold text-gray-800">{{ summary.cards.total_employees }}</h3>
                    </div>
                </div>

                <!-- Kartu 2: Hadir Hari Ini -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg text-2xl">✅</div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
                        <h3 class="text-2xl font-bold text-gray-800">{{ summary.cards.present_today }}</h3>
                    </div>
                </div>

                <!-- Kartu 3: Cuti Pending -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-3 bg-yellow-50 text-yellow-600 rounded-lg text-2xl">⏳</div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Cuti Menunggu</p>
                        <h3 class="text-2xl font-bold text-gray-800">{{ summary.cards.pending_leaves }}</h3>
                    </div>
                </div>

                <!-- Kartu 4: Beban Gaji (Rupiah) -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div class="p-3 bg-indigo-50 text-indigo-600 rounded-lg text-2xl">💰</div>
                    <div>
                        <p class="text-sm font-medium text-gray-500">Beban Gaji Bulan Ini</p>
                        <h3 class="text-lg font-bold text-gray-800">{{ formatRupiah(summary.cards.payroll_expense) }}
                        </h3>
                    </div>
                </div>
            </div>

            <!-- AREA GRAFIK (CHARTS) -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <!-- Grafik Area: Tren Kehadiran -->
                <div class="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Tren Kehadiran (7 Hari Terakhir)</h3>
                    <apexchart type="area" height="300" :options="areaChartOptions" :series="areaChartSeries">
                    </apexchart>
                </div>

                <!-- Grafik Donat: Distribusi Cuti -->
                <div class="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 class="text-lg font-bold text-gray-800 mb-4">Status Cuti (Bulan Ini)</h3>
                    <div class="flex justify-center mt-4">
                        <apexchart type="donut" width="100%" :options="donutChartOptions" :series="donutChartSeries">
                        </apexchart>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
// Import komponen ApexCharts
import VueApexCharts from 'vue3-apexcharts';

// Daftarkan komponen agar bisa dipakai di template dengan tag <apexchart>
const apexchart = VueApexCharts;

const loading = ref(true);
const summary = ref(null);

// State untuk Grafik Area (Kehadiran)
const areaChartSeries = ref([]);
const areaChartOptions = ref({
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#4f46e5'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: [] },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } }
});

// State untuk Grafik Donat (Cuti)
const donutChartSeries = ref([]);
const donutChartOptions = ref({
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: ['Disetujui', 'Pending', 'Ditolak'],
    colors: ['#10b981', '#f59e0b', '#ef4444'], // Hijau, Kuning, Merah
    dataLabels: { enabled: false },
    plotOptions: { pie: { donut: { size: '70%' } } },
    legend: { position: 'bottom' }
});

const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka || 0);
};

const fetchDashboardData = async () => {
    try {
        const response = await api.get('/dashboard/summary');
        const data = response.data;

        summary.value = data;

        // Isi data ke Grafik Area
        areaChartSeries.value = [{ name: 'Karyawan Hadir', data: data.charts.attendance_trend.data }];
        areaChartOptions.value = { ...areaChartOptions.value, xaxis: { categories: data.charts.attendance_trend.categories } };

        // Isi data ke Grafik Donat
        donutChartSeries.value = data.charts.leave_distribution;

    } catch (error) {
        console.error('Gagal mengambil data dasbor', error);
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDashboardData);
</script>