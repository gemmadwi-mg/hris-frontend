<template>
    <div class="w-full space-y-6">

        <!-- AREA KHUSUS MANAJER / HR -->
        <template v-if="['HR', 'Manager'].includes(authStore.user?.role)">

            <!-- LOADING STATE UNTUK DASHBOARD -->
            <div v-if="loadingDashboard" class="flex justify-center items-center h-40">
                <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            </div>

            <!-- KONTEN DASHBOARD DINAMIS -->
            <div v-else class="space-y-6">

                <!-- 1. WIDGET STATISTIK DINAMIS DARI API -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    <!-- Kartu 1: Total Karyawan -->
                    <div
                        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                        <div class="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Total Karyawan</p>
                            <h3 class="text-2xl font-bold text-gray-800">{{ summary?.cards.total_employees }} <span
                                    class="text-sm font-normal text-gray-400">orang</span></h3>
                        </div>
                    </div>

                    <!-- Kartu 2: Hadir Hari Ini -->
                    <div
                        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                        <div class="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Hadir Hari Ini</p>
                            <h3 class="text-2xl font-bold text-gray-800">{{ summary?.cards.present_today }} <span
                                    class="text-sm font-normal text-gray-400">orang</span></h3>
                        </div>
                    </div>

                    <!-- Kartu 3: Cuti Pending -->
                    <div
                        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                        <div class="p-3 bg-yellow-50 text-yellow-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Cuti Menunggu</p>
                            <h3 class="text-2xl font-bold text-gray-800">{{ summary?.cards.pending_leaves }} <span
                                    class="text-sm font-normal text-gray-400">pengajuan</span></h3>
                        </div>
                    </div>

                    <!-- Kartu 4: Beban Gaji (Rupiah) -->
                    <div
                        class="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                        <div class="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="text-sm font-medium text-gray-500">Beban Gaji (Bulan Ini)</p>
                            <h3 class="text-lg font-bold text-gray-800 mt-1">{{
                                formatRupiah(summary?.cards.payroll_expense) }}</h3>
                        </div>
                    </div>
                </div>

                <!-- 1.5. GRAFIK ANALITIK (APEXCHARTS) -->
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
                            <apexchart type="donut" width="100%" :options="donutChartOptions"
                                :series="donutChartSeries"></apexchart>
                        </div>
                    </div>
                </div>

            </div>
        </template>

        <!-- AREA KHUSUS KARYAWAN -->
        <template v-else>
            <EmployeePanel />
        </template>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';
import EmployeePanel from '../components/EmployeePanel.vue';

// --- IMPORT APEXCHARTS ---
import VueApexCharts from 'vue3-apexcharts';
const apexchart = VueApexCharts;

const authStore = useAuthStore();

// --- FITUR DASHBOARD (GRAFIK & KARTU) ---
const loadingDashboard = ref(true);
const summary = ref(null);

const areaChartSeries = ref([]);
const areaChartOptions = ref({
    chart: { type: 'area', toolbar: { show: false }, fontFamily: 'inherit' },
    colors: ['#4f46e5'],
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { categories: [] },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } }
});

const donutChartSeries = ref([]);
const donutChartOptions = ref({
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: ['Disetujui', 'Pending', 'Ditolak'],
    colors: ['#10b981', '#f59e0b', '#ef4444'],
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
        areaChartSeries.value = [{ name: 'Karyawan Hadir', data: data.charts.attendance_trend.data }];
        areaChartOptions.value = { ...areaChartOptions.value, xaxis: { categories: data.charts.attendance_trend.categories } };
        donutChartSeries.value = data.charts.leave_distribution;
    } catch (error) {
        console.error('Gagal mengambil data dasbor', error);
    } finally {
        loadingDashboard.value = false;
    }
};

// --- EKSEKUSI API SAAT HALAMAN DIMUAT ---
onMounted(() => {
    // Hanya muat data dasbor jika yang login adalah HR/Manager
    if (['HR', 'Manager'].includes(authStore.user?.role)) {
        fetchDashboardData();
    }
});
</script>