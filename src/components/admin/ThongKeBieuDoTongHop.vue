<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue';
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
</script>

<template>
  <div class="thongke-homqua-container">
    <div class="thongke-homqua-header">
      <div class="thongke-homqua-title-group">
        <span class="thongke-homqua-title">DOANH THU THUẦN</span>
        <span class="thongke-homqua-moc">({{ selectedMoc.label }})</span>
        <span class="thongke-homqua-total">{{ tongDoanhThu.toLocaleString('vi-VN') }} ₫</span>
      </div>
      <div class="thongke-bieudo-cbo">
        <select :value="selectedMoc.key" @change="onChangeMoc">
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
    <div v-if="loading" style="padding: 32px 0; text-align: center; color: #888;">Đang tải...</div>
    <div v-else-if="error" style="padding: 32px 0; text-align: center; color: #e53935;">{{ error }}</div>
    <div v-else class="thongke-homqua-chart-wrapper">
      <canvas ref="chartRef" height="80"></canvas>
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
  min-height: 200px;
  margin-top: 12px;
}
</style>