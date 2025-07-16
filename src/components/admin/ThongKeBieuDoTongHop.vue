<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

const chartRef = ref(null);
let chartInstance = null;

const mocThoiGianList = [
  { key: 'hom-nay', label: 'Hôm nay', api: '/hoa-don/thong-ke/hom-nay-chi-tiet' },
  { key: 'hom-qua', label: 'Hôm qua', api: '/hoa-don/thong-ke/hom-qua' },
  { key: '7-ngay-qua', label: '7 ngày qua', api: '/hoa-don/thong-ke/7-ngay-qua' },
  { key: 'thang-nay', label: 'Tháng này', api: '/hoa-don/thang-hien-tai' },
  { key: 'thang-truoc', label: 'Tháng trước', api: '/hoa-don/thang-truoc' },
];
const selectedMoc = ref(mocThoiGianList[0]);
const loading = ref(true);
const error = ref('');
const tongDoanhThu = ref(0);

const doanhThuTheoNgay = ref({});
const doanhThuTheoGio = ref({});
const doanhThuTheoThu = ref({});
const activeTab = ref('ngay'); // 'ngay', 'gio', 'thu'

const tabList = [
  { key: 'ngay', label: 'Theo ngày' },
  { key: 'gio', label: 'Theo giờ' },
  { key: 'thu', label: 'Theo thứ' },
];

const fetchData = async () => {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.get('http://localhost:8080' + selectedMoc.value.api);
    doanhThuTheoNgay.value = res.data.doanhThuTheoNgay || {};
    doanhThuTheoGio.value = res.data.doanhThuTheoGio || {};
    doanhThuTheoThu.value = res.data.doanhThuTheoThu || {};

    // Lấy đúng trường tổng doanh thu theo từng mốc
    if (selectedMoc.value.key === 'thang-truoc' && res.data.tongDoanhThuThangTruoc !== undefined) {
      tongDoanhThu.value = res.data.tongDoanhThuThangTruoc;
    } else if (selectedMoc.value.key === 'thang-nay' && res.data.tongDoanhThuThang !== undefined) {
      tongDoanhThu.value = res.data.tongDoanhThuThang;
    } else if (selectedMoc.value.key === '7-ngay-qua' && res.data.tongDoanhThu7Ngay !== undefined) {
      tongDoanhThu.value = res.data.tongDoanhThu7Ngay;
    } else {
      tongDoanhThu.value = res.data.tongDoanhThuHomNay
        || res.data.tongDoanhThuHomQua
        || res.data.tongDoanhThu
        || 0;
    }
    await nextTick();
    renderChart();
  } catch (e) {
    error.value = 'Lỗi khi lấy dữ liệu thống kê';
  } finally {
    loading.value = false;
  }
};

function getChartData() {
  if (activeTab.value === 'ngay') return doanhThuTheoNgay.value;
  if (activeTab.value === 'gio') return doanhThuTheoGio.value;
  if (activeTab.value === 'thu') return doanhThuTheoThu.value;
  return {};
}

function getLabels() {
  const dataObj = getChartData();
  if (activeTab.value === 'ngay') {
    return Object.keys(dataObj).map(date => {
      const parts = date.split('-');
      return parts[2] || date;
    });
  } else if (activeTab.value === 'gio') {
    return Object.keys(dataObj).map(h => h.padStart(2, '0') + ':00');
  } else if (activeTab.value === 'thu') {
    // Trả về đúng key: "T2", "T3", ..., "CN"
    return Object.keys(dataObj);
  }
  return Object.keys(dataObj);
}

function renderChart() {
  if (!chartRef.value) return;
  if (chartInstance) chartInstance.destroy();
  const dataObj = getChartData();
  const labels = getLabels();
  const data = Object.values(dataObj);

  // Xác định max trục tung theo mốc thời gian
  let yMax = 20000000; // mặc định
  if (selectedMoc.value.key === '7-ngay-qua') {
    yMax = 100000000; // 100 triệu
  } else if (
    selectedMoc.value.key === 'thang-nay' ||
    selectedMoc.value.key === 'thang-truoc'
  ) {
    yMax = 500000000; // 500 triệu
  }

  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Doanh thu',
          data,
          backgroundColor: '#1976d2',
          borderRadius: 8,
          barPercentage: 0.4,
          categoryPercentage: 0.5,
          maxBarThickness: 40,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            title: () => '',
            label: ctx => ctx.parsed.y.toLocaleString('vi-VN') + ' ₫',
          },
          backgroundColor: '#1976d2',
          titleColor: '#fff',
          bodyColor: '#fff',
          bodyFont: { weight: 'bold', size: 15 },
          padding: 10,
        },
      },
      scales: {
        y: {
          min: 0,
          max: yMax,
          ticks: {
            stepSize: yMax / 10,
            callback: v => v === 0 ? '0' : (v/1000000) + ' tr',
            color: '#888',
            font: { size: 13 },
          },
          grid: { color: '#eee' },
        },
        x: {
          ticks: { color: '#888', font: { size: 15, weight: 'bold' } },
          grid: { display: false },
        },
      },
    },
  });
}

function changeTab(tab) {
  if (activeTab.value !== tab) {
    activeTab.value = tab;
    nextTick(() => renderChart());
  }
}

function onChangeMoc(e) {
  // e là event, nên phải tìm moc theo key
  const moc = mocThoiGianList.find(m => m.key === e.target.value);
  if (moc) {
    selectedMoc.value = moc;
    fetchData();
  }
}

const topTimeOptions = [
  { label: 'Hôm nay', value: 'hom-nay', api: '/hoa-don/thong-ke/top-ban-chay/hom-nay' },
  { label: 'Hôm qua', value: 'hom-qua', api: '/hoa-don/thong-ke/top-ban-chay/hom-qua' },
  { label: '7 ngày qua', value: '7-ngay-qua', api: '/hoa-don/thong-ke/top-ban-chay/7-ngay-qua' },
  { label: 'Tháng này', value: 'thang-nay', api: '/hoa-don/thong-ke/top-ban-chay/thang-nay' },
  { label: 'Tháng trước', value: 'thang-truoc', api: '/hoa-don/thong-ke/top-ban-chay/thang-truoc' }
];
const topViewOptions = [
  { label: 'Theo doanh thu thuần', value: 'doanh-thu' },
  { label: 'Theo số lượng', value: 'so-luong' }
];
const selectedTopTime = ref('thang-nay');
const selectedTopView = ref('doanh-thu');
const topProducts = ref([]);
const topProductLoading = ref(false);
const topProductError = ref('');
const topProductChartRef = ref(null);
let topProductChartInstance = null;

async function fetchTopProducts() {
  topProductLoading.value = true;
  topProductError.value = '';
  try {
    const api = topTimeOptions.find(opt => opt.value === selectedTopTime.value).api;
    const res = await axios.get('http://localhost:8080' + api);
    topProducts.value = res.data;
    await nextTick(); // Đảm bảo DOM đã cập nhật
    renderTopProductChart();
  } catch (e) {
    topProductError.value = 'Lỗi khi lấy dữ liệu top sản phẩm';
  } finally {
    topProductLoading.value = false;
  }
}
watch([selectedTopTime, selectedTopView], fetchTopProducts);
onMounted(fetchTopProducts);

function renderTopProductChart() {
  if (!topProductChartRef.value) return;
  if (topProductChartInstance) topProductChartInstance.destroy();

  // Luôn render chart, kể cả khi không có data (để giữ layout)
  const labels = topProducts.value.map(p => p.tenSanPham || p.ten || p.name);
  let dataArr = [];
  if (selectedTopView.value === 'doanh-thu') {
    dataArr = topProducts.value.map(p => p.doanhThu || p.tongTien || 0);
  } else {
    dataArr = topProducts.value.map(p => p.soLuong || 0);
  }

  // Nếu không có data, vẽ chart với data 0 (ẩn trục, không bar)
  const isEmpty = labels.length === 0 || dataArr.every(v => v === 0);

  topProductChartInstance = new Chart(topProductChartRef.value, {
    type: 'bar',
    data: {
      labels: isEmpty ? [''] : labels,
      datasets: [{
        data: isEmpty ? [0] : dataArr,
        backgroundColor: '#1976d2',
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
        maxBarThickness: 36,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          backgroundColor: '#1976d2',
          titleColor: '#fff',
          bodyColor: '#fff',
          bodyFont: { weight: 'bold', size: 15 },
          padding: 10,
          borderRadius: 8,
          callbacks: {
            title: ctx => ctx[0]?.label || '',
            label: ctx => selectedTopView.value === 'doanh-thu'
              ? ctx.parsed.x.toLocaleString('vi-VN') + ' ₫'
              : ctx.parsed.x + ' sp'
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: getTopProductXMax(),
          ticks: {
            callback: value => selectedTopView.value === 'doanh-thu'
              ? (value / 1000000).toFixed(1) + ' tr'
              : value
          }
        },
        y: {
          display: !isEmpty
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

// Thêm các option cho top khách hàng
const topCustomerTimeOptions = [
  { label: 'Hôm nay', value: 'hom-nay', api: '/hoa-don/top-khach-hang/hom-nay' },
  { label: 'Hôm qua', value: 'hom-qua', api: '/hoa-don/top-khach-hang/hom-qua' },
  { label: '7 ngày qua', value: '7-ngay-qua', api: '/hoa-don/top-khach-hang/7-ngay-qua' },
  { label: 'Tháng này', value: 'thang-nay', api: '/hoa-don/top-khach-hang/thang-nay' },
  { label: 'Tháng trước', value: 'thang-truoc', api: '/hoa-don/top-khach-hang/thang-truoc' }
];
const selectedTopCustomerTime = ref('thang-nay');
const topCustomers = ref([]);
const topCustomerLoading = ref(false);
const topCustomerError = ref('');
const topCustomerChartRef = ref(null);
let topCustomerChartInstance = null;

async function fetchTopCustomers() {
  topCustomerLoading.value = true;
  topCustomerError.value = '';
  try {
    const api = topCustomerTimeOptions.find(opt => opt.value === selectedTopCustomerTime.value).api;
    const res = await axios.get('http://localhost:8080' + api);
    // API trả về { data: [...], message: ... }
    topCustomers.value = res.data.data || [];
    await nextTick();
    renderTopCustomerChart();
  } catch (e) {
    topCustomerError.value = 'Lỗi khi lấy dữ liệu top khách hàng';
  } finally {
    topCustomerLoading.value = false;
  }
}

watch(selectedTopCustomerTime, fetchTopCustomers);
onMounted(fetchTopCustomers);

const hasTopCustomerData = computed(() => {
  if (!topCustomers.value || topCustomers.value.length === 0) return false;
  return topCustomers.value.some(c => (c.tongTien || 0) > 0);
});

function renderTopCustomerChart() {
  if (!topCustomerChartRef.value) return;
  if (topCustomerChartInstance) topCustomerChartInstance.destroy();
  const labels = topCustomers.value.map(c => c.tenKhachHang || c.ten || c.name);
  const dataArr = topCustomers.value.map(c => c.tongTien || 0);
  const isEmpty = labels.length === 0 || dataArr.every(v => v === 0);
  topCustomerChartInstance = new Chart(topCustomerChartRef.value, {
    type: 'bar',
    data: {
      labels: isEmpty ? [''] : labels,
      datasets: [{
        data: isEmpty ? [0] : dataArr,
        backgroundColor: '#1976d2',
        borderRadius: 8,
        barPercentage: 0.5,
        categoryPercentage: 0.6,
        maxBarThickness: 36,
      }]
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          backgroundColor: '#1976d2',
          titleColor: '#fff',
          bodyColor: '#fff',
          bodyFont: { weight: 'bold', size: 15 },
          padding: 10,
          borderRadius: 8,
          callbacks: {
            title: ctx => ctx[0]?.label || '',
            label: ctx => ctx.parsed.x.toLocaleString('vi-VN') + ' ₫'
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: getTopCustomerXMax(),
          ticks: {
            callback: value => (value / 1000000).toFixed(1) + ' tr'
          }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });
}

onMounted(fetchData);

watch(chartRef, (val) => {
  if (val) nextTick(() => renderChart());
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }
});

// Thêm hàm kiểm tra có dữ liệu không
function hasData() {
  const dataObj = getChartData();
  if (!dataObj || Object.keys(dataObj).length === 0) return false;
  // Nếu tất cả value đều 0 thì cũng coi là không có dữ liệu
  return Object.values(dataObj).some(v => v !== 0);
}

const hasTopProductData = computed(() => {
  if (!topProducts.value || topProducts.value.length === 0) return false;
  if (selectedTopView.value === 'doanh-thu') {
    return topProducts.value.some(p => (p.doanhThu || p.tongTien || 0) > 0);
  } else {
    return topProducts.value.some(p => (p.soLuong || 0) > 0);
  }
});

function getTopProductXMax() {
  if (selectedTopView.value === 'so-luong') {
    if (selectedTopTime.value === 'hom-nay' || selectedTopTime.value === 'hom-qua') return 100;
    if (selectedTopTime.value === '7-ngay-qua') return 350;
    return 500; // tháng này, tháng trước
  } else {
    if (selectedTopTime.value === 'hom-nay' || selectedTopTime.value === 'hom-qua') return 100_000_000;
    if (selectedTopTime.value === '7-ngay-qua') return 300_000_000;
    return 500_000_000; // tháng này, tháng trước
  }
}

function getTopCustomerXMax() {
  if (selectedTopCustomerTime.value === 'hom-nay' || selectedTopCustomerTime.value === 'hom-qua') return 100_000_000;
  if (selectedTopCustomerTime.value === '7-ngay-qua') return 300_000_000;
  return 500_000_000;
}
</script>

<template>
  <div>
    <!-- Card doanh thu + biểu đồ -->
    <div class="thongke-homqua-container">
      <div class="thongke-homqua-header">
        <div class="thongke-homqua-title-group">
          <span class="thongke-homqua-title">DOANH THU THUẦN</span>
          <span class="thongke-homqua-moc">({{ selectedMoc.label }})</span>
          <span class="thongke-homqua-total">{{ tongDoanhThu.toLocaleString('vi-VN') }} ₫</span>
        </div>
        <div class="thongke-bieudo-cbo">
          <select class="select-blue" :value="selectedMoc.key" @change="onChangeMoc">
            <option v-for="moc in mocThoiGianList" :key="moc.key" :value="moc.key">{{ moc.label }}</option>
          </select>
        </div>
      </div>
      <div class="thongke-homqua-tabs">
        <span v-for="tab in tabList" :key="tab.key"
          class="tab"
          :class="{active: activeTab===tab.key}"
          @click="changeTab(tab.key)"
        >
          {{ tab.label }}
        </span>
      </div>
      <div class="thongke-homqua-chart-wrapper">
        <canvas ref="chartRef" height="80"></canvas>
        <div v-if="loading" class="chart-overlay">Đang tải...</div>
        <div v-else-if="error" class="chart-overlay" style="color: #e53935;">{{ error }}</div>
        <div v-else-if="!hasData()" class="chart-overlay">
          <svg width="48" height="48" fill="none" stroke="#bbb" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom: 8px;"><rect x="4" y="7" width="16" height="10" rx="2"/><path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/></svg>
          <div>Không có dữ liệu</div>
        </div>
      </div>
    </div>
    <!-- Hai card top song song -->
    <div class="top-row">
      <div class="top-product-section top-col">
        <div class="top-product-header">
          <b>Top 10 hàng bán chạy</b>
          <select class="select-blue" v-model="selectedTopView">
            <option v-for="opt in topViewOptions" :value="opt.value">{{ opt.label }}</option>
          </select>
          <select class="select-blue" v-model="selectedTopTime">
            <option v-for="opt in topTimeOptions" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="top-product-chart-wrapper">
          <canvas ref="topProductChartRef" style="height: 340px;"></canvas>
          <div v-if="topProductLoading" class="chart-overlay" style="color: #888;">Đang tải...</div>
          <div v-else-if="topProductError" class="chart-overlay" style="color: #e53935;">{{ topProductError }}</div>
          <div v-else-if="!hasTopProductData" class="chart-overlay">
            <svg width="48" height="48" fill="none" stroke="#bbb" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom: 8px;"><rect x="4" y="7" width="16" height="10" rx="2"/><path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/></svg>
            <div>Không có dữ liệu</div>
          </div>
        </div>
      </div>
      <div class="top-customer-section top-col">
        <div class="top-product-header">
          <b>Top 10 khách mua nhiều nhất</b>
          <select class="select-blue" v-model="selectedTopCustomerTime">
            <option v-for="opt in topCustomerTimeOptions" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
        <div class="top-product-chart-wrapper">
          <canvas ref="topCustomerChartRef" style="height: 340px;"></canvas>
          <div v-if="topCustomerLoading" class="chart-overlay" style="color: #888;">Đang tải...</div>
          <div v-else-if="topCustomerError" class="chart-overlay" style="color: #e53935;">{{ topCustomerError }}</div>
          <div v-else-if="!hasTopCustomerData" class="chart-overlay">
            <svg width="48" height="48" fill="none" stroke="#bbb" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom: 8px;"><rect x="4" y="7" width="16" height="10" rx="2"/><path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2"/></svg>
            <div>Không có dữ liệu</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.thongke-homqua-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0001;
  padding: 24px 32px 18px 32px;
  margin: 24px auto 0 auto;
  max-width: 1400px;
}
.thongke-homqua-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 16px;
  font-weight: bold;
  color: #222;
  margin-bottom: 8px;
  gap: 12px;
}
.thongke-homqua-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
.thongke-homqua-title {
  font-size: 18px;
  font-weight: bold;
  color: #222;
}
.thongke-homqua-moc {
  font-size: 15px;
  color: #1976d2;
  font-weight: 500;
  margin-left: 4px;
}
.thongke-homqua-total {
  color: #1976d2;
  font-size: 20px;
  font-weight: bold;
  margin-left: 12px;
}
.thongke-bieudo-cbo select {
  font-size: 15px;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1px solid #1976d2;
  color: #1976d2;
  font-weight: bold;
  outline: none;
  background: #f8fbff;
  cursor: pointer;
  margin-left: 16px;
}
.thongke-homqua-tabs {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 8px;
  margin-top: 8px;
}
.tab {
  font-size: 14px;
  color: #444;
  font-weight: 500;
  padding-bottom: 2px;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: border-color 0.18s, color 0.18s, font-size 0.18s, font-weight 0.18s;
  display: inline-block;
}
.tab.active {
  border-bottom: 2.5px solid #1976d2;
  color: #222;
  font-size: 14px;
  font-weight: bold;
}
.thongke-homqua-chart-wrapper {
  width: 100%;
  min-height: 340px;
  height: 340px;
  position: relative;
}
.top-row {
  display: flex;
  gap: 24px;
  margin-top: 32px;
}
.top-col {
  flex: 1 1 0;
  min-width: 0;
}
.top-product-section {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 18px 18px 18px 18px;
  min-width: 340px;
  max-width: 520px;
}
.top-customer-section {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 18px 18px 18px 18px;
  min-width: 340px;
}
.top-product-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}
.top-product-header select {
  border-radius: 6px;
  border: 1px solid #ddd;
  padding: 4px 12px;
  font-size: 15px;
  background: #f8fafd;
  outline: none;
}
.top-product-chart-wrapper {
  position: relative;
  min-height: 340px;
  height: 340px;
  width: 100%;
}
.chart-overlay {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.85);
  font-size: 18px;
  z-index: 2;
  pointer-events: none;
}
.select-blue {
  font-size: 15px;
  padding: 4px 12px;
  border-radius: 6px;
  border: 1.5px solid #1976d2;
  color: #1976d2;
  font-weight: bold;
  outline: none;
  background: #f8fbff;
  cursor: pointer;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.select-blue:focus {
  border-color: #1565c0;
  box-shadow: 0 0 0 2px #1976d233;
}
</style>