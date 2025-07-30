<script setup>
import { ref, onMounted, nextTick, watch, onUnmounted, computed } from 'vue';
import axios from 'axios';
import { Chart, registerables } from 'chart.js';
import Cookies from 'js-cookie'

const token = Cookies.get('token')
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
    const res = await axios.get('http://localhost:8080' + selectedMoc.value.api, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    doanhThuTheoNgay.value = {
      soHoaDonTheoNgay: res.data.soHoaDonTheoNgay || {},
      tongSanPhamTheoNgay: res.data.tongSanPhamTheoNgay || res.data.sanPhamTheoNgay || {},
      doanhThuTheoNgay: res.data.doanhThuTheoNgay || {}
    };
    doanhThuTheoGio.value = {
      soHoaDonTheoGio: res.data.soHoaDonTheoGio || {},
      tongSanPhamTheoGio: res.data.tongSanPhamTheoGio || res.data.sanPhamTheoGio || {},
      doanhThuTheoGio: res.data.doanhThuTheoGio || {}
    };
    doanhThuTheoThu.value = {
      soHoaDonTheoThu: res.data.soHoaDonTheoThu || {},
      tongSanPhamTheoThu: res.data.tongSanPhamTheoThu || res.data.sanPhamTheoThu || {},
      doanhThuTheoThu: res.data.doanhThuTheoThu || {}
    };

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
  if (activeTab.value === 'ngay') {
    // Lấy từ doanhThuTheoNgay.value.soHoaDonTheoNgay (hoặc tongSanPhamTheoNgay)
    const keys = Object.keys(
      doanhThuTheoNgay.value.soHoaDonTheoNgay ||
      doanhThuTheoNgay.value.tongSanPhamTheoNgay ||
      doanhThuTheoNgay.value.doanhThuTheoNgay ||
      {}
    );
    return keys;
  } else if (activeTab.value === 'gio') {
    const keys = Object.keys(
      doanhThuTheoGio.value.soHoaDonTheoGio ||
      doanhThuTheoGio.value.tongSanPhamTheoGio ||
      doanhThuTheoGio.value.doanhThuTheoGio ||
      {}
    );
    return keys.map(h => h.padStart(2, '0') + ':00');
  } else if (activeTab.value === 'thu') {
    const keys = Object.keys(
      doanhThuTheoThu.value.soHoaDonTheoThu ||
      doanhThuTheoThu.value.tongSanPhamTheoThu ||
      doanhThuTheoThu.value.doanhThuTheoThu ||
      {}
    );
    return keys;
  }
  return [];
}

function renderChart() {
  if (!chartRef.value) return;
  if (chartInstance) chartInstance.destroy();

  const dataObj = getChartData();
  const labels = getLabels();
  let yMax = 20000000;
  let stepSize = 10;
  if (chartViewMode.value === 'quantity') {
    if (selectedMoc.value.key === 'hom-nay' || selectedMoc.value.key === 'hom-qua') {
      yMax = 50;
      stepSize = 10;
    } else if (selectedMoc.value.key === '7-ngay-qua') {
      yMax = 200;
      stepSize = 20;
    } else if (selectedMoc.value.key === 'thang-nay' || selectedMoc.value.key === 'thang-truoc') {
      yMax = 500;
      stepSize = 50;
    }
  } else {
    if (selectedMoc.value.key === '7-ngay-qua') yMax = 100000000;
    else if (selectedMoc.value.key === 'thang-nay' || selectedMoc.value.key === 'thang-truoc') yMax = 500000000;
    // stepSize mặc định cho doanh thu (giữ nguyên)
    stepSize = yMax / 10;
  }

  // Nếu chọn số lượng thì hiển thị 2 cột: hóa đơn và sản phẩm
  let datasets = [];
  if (chartViewMode.value === 'quantity') {
    let invoiceData = [];
    let productData = [];
    if (activeTab.value === 'ngay') {
      invoiceData = Object.values(doanhThuTheoNgay.value.soHoaDonTheoNgay || {});
      productData = Object.values(doanhThuTheoNgay.value.tongSanPhamTheoNgay || doanhThuTheoNgay.value.sanPhamTheoNgay || {});
    } else if (activeTab.value === 'gio') {
      invoiceData = Object.values(doanhThuTheoGio.value.soHoaDonTheoGio || {});
      productData = Object.values(doanhThuTheoGio.value.tongSanPhamTheoGio || doanhThuTheoGio.value.sanPhamTheoGio || {});
    } else if (activeTab.value === 'thu') {
      invoiceData = Object.values(doanhThuTheoThu.value.soHoaDonTheoThu || {});
      productData = Object.values(doanhThuTheoThu.value.tongSanPhamTheoThu || doanhThuTheoThu.value.sanPhamTheoThu || {});
    }
    if (!invoiceData.length) invoiceData = Array(labels.length).fill(0);
    if (!productData.length) productData = Array(labels.length).fill(0);

    datasets = [
      {
        label: 'Hóa đơn',
        data: invoiceData,
        backgroundColor: '#1976d2',
        borderRadius: 8,
        barPercentage: 0.4,
        categoryPercentage: 0.5,
        maxBarThickness: 40,
      },
      {
        label: 'Sản phẩm',
        data: productData,
        backgroundColor: '#ff9800',
        borderRadius: 8,
        barPercentage: 0.4,
        categoryPercentage: 0.5,
        maxBarThickness: 40,
      }
    ];
  } else {
    // Doanh thu
    let data = [];
    if (activeTab.value === 'ngay') {
      data = Object.values(doanhThuTheoNgay.value.doanhThuTheoNgay || {});
    } else if (activeTab.value === 'gio') {
      data = Object.values(doanhThuTheoGio.value.doanhThuTheoGio || {});
    } else if (activeTab.value === 'thu') {
      data = Object.values(doanhThuTheoThu.value.doanhThuTheoThu || {});
    }
    datasets = [
      {
        label: 'Doanh thu',
        data,
        backgroundColor: '#1976d2',
        borderRadius: 8,
        barPercentage: 0.4,
        categoryPercentage: 0.5,
        maxBarThickness: 40,
      }
    ];
  }

  chartInstance = new Chart(chartRef.value, {
    type: 'bar',
    data: {
      labels,
      datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: {
          displayColors: true,
          callbacks: {
            title: () => '',
            label: ctx =>
              chartViewMode.value === 'revenue'
                ? ctx.parsed.y.toLocaleString('vi-VN') + ' ₫'
                : ctx.dataset.label + ': ' + ctx.parsed.y,
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
            stepSize: stepSize,
            callback: v =>
              chartViewMode.value === 'revenue'
                ? (v === 0 ? '0' : (v / 1000000) + ' tr')
                : v,
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

const startDate = ref('');
const endDate = ref('');

async function fetchByDateRange() {
  if (!startDate.value || !endDate.value) return;
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/thong-ke/khoang-ngay', {
      params: { start: startDate.value, end: endDate.value },
      headers: { Authorization: `Bearer ${token}` }
    });
    doanhThuTheoNgay.value = {
      soHoaDonTheoNgay: res.data.soHoaDonTheoNgay || {},
      tongSanPhamTheoNgay: res.data.tongSanPhamTheoNgay || res.data.sanPhamTheoNgay || {},
      doanhThuTheoNgay: res.data.doanhThuTheoNgay || {}
    };
    doanhThuTheoGio.value = {
      soHoaDonTheoGio: res.data.soHoaDonTheoGio || {},
      tongSanPhamTheoGio: res.data.tongSanPhamTheoGio || res.data.sanPhamTheoGio || {},
      doanhThuTheoGio: res.data.doanhThuTheoGio || {}
    };
    doanhThuTheoThu.value = {
      soHoaDonTheoThu: res.data.soHoaDonTheoThu || {},
      tongSanPhamTheoThu: res.data.tongSanPhamTheoThu || res.data.sanPhamTheoThu || {},
      doanhThuTheoThu: res.data.doanhThuTheoThu || {}
    };
    tongDoanhThu.value = res.data.tongDoanhThu || 0;
    await nextTick();
    renderChart();
  } catch (e) {
    error.value = 'Lỗi khi lấy dữ liệu thống kê theo khoảng ngày';
  } finally {
    loading.value = false;
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
    const res = await axios.get('http://localhost:8080' + api, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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
    const res = await axios.get('http://localhost:8080' + api, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
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

// Thêm vào đây
const chartViewMode = ref('revenue'); // 'revenue' hoặc 'quantity'

// Biểu đồ trạng thái đơn hàng tháng này
const orderStatusStats = ref(null);
const orderStatusLoading = ref(false);
const orderStatusError = ref('');
const orderStatusChartRef = ref(null);
let orderStatusChartInstance = null;

const ORDER_STATUS_COLORS = [
  '#42a5f5', // Đang xử lý
  '#7e57c2', // Đã xác nhận
  '#26a69a', // Đang giao hàng
  '#66bb6a', // Giao hàng thành công
  '#ffa726', // Hoàn thành
  '#ef5350', // Đã hủy
];
const ORDER_STATUS_LABELS = [
  'Đang xử lý',
  'Đã xác nhận',
  'Đang giao hàng',
  'Giao hàng thành công',
  'Hoàn thành',
  'Đã hủy',
];

async function fetchOrderStatusStats() {
  orderStatusLoading.value = true;
  orderStatusError.value = '';
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/thong-ke/trang-thai-trong-thang', {
      headers: { Authorization: `Bearer ${token}` }
    });
    orderStatusStats.value = res.data;
    await nextTick();
    renderOrderStatusChart();
  } catch (e) {
    orderStatusError.value = 'Lỗi khi lấy dữ liệu trạng thái đơn hàng';
  } finally {
    orderStatusLoading.value = false;
  }
}

function renderOrderStatusChart() {
  if (!orderStatusChartRef.value) return;
  if (orderStatusChartInstance) orderStatusChartInstance.destroy();
  if (!orderStatusStats.value) return;
  const data = orderStatusStats.value.tiLePhanTram || {};
  const values = ORDER_STATUS_LABELS.map(lab => parseFloat((data[lab] || '0').replace(',', '.')));
  orderStatusChartInstance = new Chart(orderStatusChartRef.value, {
    type: 'pie',
    data: {
      labels: ORDER_STATUS_LABELS,
      datasets: [{
        data: values,
        backgroundColor: ORDER_STATUS_COLORS,
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => `${ctx.label}: ${ctx.parsed.toFixed(2)}%`
          }
        }
      }
    }
  });
}

onMounted(fetchOrderStatusStats);
watch(orderStatusChartRef, (val) => { if (val) nextTick(() => renderOrderStatusChart()); });
onUnmounted(() => { if (orderStatusChartInstance) { orderStatusChartInstance.destroy(); orderStatusChartInstance = null; } });

// Thêm phần chọn khoảng ngày
const showDateRange = ref(false);
const customStartDate = ref('');
const customEndDate = ref('');

function confirmDateRange() {
  if (customStartDate.value && customEndDate.value) {
    startDate.value = customStartDate.value;
    endDate.value = customEndDate.value;
    fetchByDateRange();
    showDateRange.value = false;
  }
}

// Thống kê tăng trưởng
const growth = ref({
  doanhThuNgay: 0,
  tangTruongDoanhThuNgay: 0,
  doanhThuThang: 0,
  tangTruongDoanhThuThang: 0,
  doanhThuNam: 0,
  tangTruongDoanhThuNam: 0,
  soSanPhamThang: 0,
  tangTruongSanPhamThang: 0,
  soHoaDonNgay: 0,
  tangTruongHoaDonNgay: 0,
  soHoaDonThang: 0,
  tangTruongHoaDonThang: 0,
});
const loadingGrowth = ref(true);
const errorGrowth = ref('');

async function fetchGrowth() {
  loadingGrowth.value = true;
  errorGrowth.value = '';
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/thong-ke/tong-hop', {
      headers: { Authorization: `Bearer ${token}` }
    });
    growth.value = res.data;
  } catch (e) {
    errorGrowth.value = 'Lỗi khi lấy dữ liệu tăng trưởng';
  } finally {
    loadingGrowth.value = false;
  }
}

onMounted(() => {
  fetchGrowth();
});
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
        <!-- Thêm input chọn ngày và nút Xem -->
        <div class="thongke-bieudo-cbo d-flex align-items-center" style="gap: 8px;">
        <button class="btn btn-outline-primary" style="font-size: 15px; padding: 4px 16px;" @click="showDateRange = true">Tùy chỉnh</button>
          <select class="select-blue" :value="selectedMoc.key" @change="onChangeMoc">
            <option v-for="moc in mocThoiGianList" :key="moc.key" :value="moc.key">{{ moc.label }}</option>
          </select>
          <select class="select-blue" v-model="chartViewMode" style="margin-left: 12px;">
            <option value="revenue">Theo doanh thu thuần</option>
            <option value="quantity">Theo số lượng</option>
          </select>
        </div>
      </div>
      <div class="thongke-homqua-tabs">
        <span v-for="tab in tabList" :key="tab.key" class="tab" :class="{ active: activeTab === tab.key }"
          @click="changeTab(tab.key)">
          {{ tab.label }}
        </span>
      </div>
      <div class="thongke-homqua-chart-wrapper">
        <canvas ref="chartRef" height="80"></canvas>
        <div v-if="loading" class="chart-overlay">Đang tải...</div>
        <div v-else-if="error" class="chart-overlay" style="color: #e53935;">{{ error }}</div>
        <div v-else-if="!hasData()" class="chart-overlay">
          <svg width="48" height="48" fill="none" stroke="#bbb" stroke-width="2" viewBox="0 0 24 24"
            style="margin-bottom: 8px;">
            <rect x="4" y="7" width="16" height="10" rx="2" />
            <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
          </svg>
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
            <svg width="48" height="48" fill="none" stroke="#bbb" stroke-width="2" viewBox="0 0 24 24"
              style="margin-bottom: 8px;">
              <rect x="4" y="7" width="16" height="10" rx="2" />
              <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
            </svg>
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
            <svg width="48" height="48" fill="none" stroke="#bbb" stroke-width="2" viewBox="0 0 24 24"
              style="margin-bottom: 8px;">
              <rect x="4" y="7" width="16" height="10" rx="2" />
              <path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
            </svg>
            <div>Không có dữ liệu</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Thêm phía trên các card tổng hợp -->
    <div class="growth-row">
  <div class="order-status-pie-section growth-col">
    <div class="order-status-pie-header">
      <b>Trạng Thái Đơn Hàng Tháng Này</b>
    </div>
    <div class="order-status-pie-chart-wrapper">
      <canvas ref="orderStatusChartRef" style="max-width: 420px; height: 320px;"></canvas>
      <div v-if="orderStatusLoading" class="chart-overlay">Đang tải...</div>
      <div v-else-if="orderStatusError" class="chart-overlay" style="color: #e53935;">{{ orderStatusError }}</div>
      <div v-else-if="orderStatusStats && orderStatusStats.tongDonHang === 0" class="chart-overlay">
        <svg width="48" height="48" fill="none" stroke="#bbb" stroke-width="2" viewBox="0 0 24 24" style="margin-bottom: 8px;"><rect x="4" y="7" width="16" height="10" rx="2" /><path d="M4 7V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" /></svg>
        <div>Không có dữ liệu</div>
      </div>
    </div>
    <div class="order-status-pie-legend">
      <div class="pie-legend-row" v-for="(label, idx) in ORDER_STATUS_LABELS" :key="label">
        <span class="pie-legend-color" :style="{background: ORDER_STATUS_COLORS[idx]}" />
        <span class="pie-legend-label">{{ label }}</span>
        <span class="pie-legend-value"><b>{{ orderStatusStats?.tiLePhanTram?.[label] || '0,00' }}%</b></span>
      </div>
    </div>
  </div>
  <div class="growth-box growth-col">
    <div class="growth-title">
      <b>Tốc Độ Tăng Trưởng Cửa Hàng</b>
      <span v-if="loadingGrowth" style="font-size:13px;color:#888;margin-left:8px;">Đang tải...</span>
      <span v-if="errorGrowth" style="font-size:13px;color:#e53935;margin-left:8px;">{{ errorGrowth }}</span>
    </div>
    <div class="growth-list">
      <div class="growth-item">
        <span class="growth-icon"><i class="fa fa-calendar"></i></span>
        <span class="growth-label">Doanh thu ngày</span>
        <span class="growth-value">{{ growth.doanhThuNgay.toLocaleString('vi-VN') }} VND</span>
        <span class="growth-percent" :class="growth.tangTruongDoanhThuNgay < 0 ? 'down' : 'up'">
          <i :class="growth.tangTruongDoanhThuNgay < 0 ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i>
          {{ growth.tangTruongDoanhThuNgay }} %
        </span>
      </div>
      <div class="growth-item">
        <span class="growth-icon"><i class="fa fa-calendar"></i></span>
        <span class="growth-label">Doanh thu tháng</span>
        <span class="growth-value">{{ growth.doanhThuThang.toLocaleString('vi-VN') }} VND</span>
        <span class="growth-percent" :class="growth.tangTruongDoanhThuThang < 0 ? 'down' : 'up'">
          <i :class="growth.tangTruongDoanhThuThang < 0 ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i>
          {{ growth.tangTruongDoanhThuThang }} %
        </span>
      </div>
      <div class="growth-item">
        <span class="growth-icon"><i class="fa fa-calendar"></i></span>
        <span class="growth-label">Doanh thu năm</span>
        <span class="growth-value">{{ growth.doanhThuNam.toLocaleString('vi-VN') }} VND</span>
        <span class="growth-percent" :class="growth.tangTruongDoanhThuNam < 0 ? 'down' : 'up'">
          <i :class="growth.tangTruongDoanhThuNam < 0 ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i>
          {{ growth.tangTruongDoanhThuNam }} %
        </span>
      </div>
      <div class="growth-item">
        <span class="growth-icon"><i class="fa fa-cube"></i></span>
        <span class="growth-label">Sản phẩm tháng</span>
        <span class="growth-value">{{ growth.soSanPhamThang }} Sản phẩm</span>
        <span class="growth-percent" :class="growth.tangTruongSanPhamThang < 0 ? 'down' : 'up'">
          <i :class="growth.tangTruongSanPhamThang < 0 ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i>
          {{ growth.tangTruongSanPhamThang }} %
        </span>
      </div>
      <div class="growth-item">
        <span class="growth-icon"><i class="fa fa-calendar"></i></span>
        <span class="growth-label">Hóa đơn ngày</span>
        <span class="growth-value">{{ growth.soHoaDonNgay }} Hóa đơn</span>
        <span class="growth-percent" :class="growth.tangTruongHoaDonNgay < 0 ? 'down' : 'up'">
          <i :class="growth.tangTruongHoaDonNgay < 0 ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i>
          {{ growth.tangTruongHoaDonNgay }} %
        </span>
      </div>
      <div class="growth-item">
        <span class="growth-icon"><i class="fa fa-calendar"></i></span>
        <span class="growth-label">Hóa đơn tháng</span>
        <span class="growth-value">{{ growth.soHoaDonThang }} Hóa đơn</span>
        <span class="growth-percent" :class="growth.tangTruongHoaDonThang < 0 ? 'down' : 'up'">
          <i :class="growth.tangTruongHoaDonThang < 0 ? 'fa fa-arrow-down' : 'fa fa-arrow-up'"></i>
          {{ growth.tangTruongHoaDonThang }} %
        </span>
      </div>
    </div>
  </div>
</div>
  </div>

  <!-- Phần chọn khoảng ngày -->
  <div v-if="showDateRange" class="date-range-popup">
    <div class="date-range-content">
      <div style="margin-bottom: 10px;">
        <label>Bắt đầu:</label>
        <input type="date" v-model="customStartDate" class="form-control" style="width: 160px;" />
      </div>
      <div style="margin-bottom: 10px;">
        <label>Kết thúc:</label>
        <input type="date" v-model="customEndDate" class="form-control" style="width: 160px;" />
      </div>
      <div style="display: flex; gap: 10px; justify-content: flex-end;">
        <button class="btn btn-primary" @click="confirmDateRange">Xác nhận</button>
        <button class="btn btn-secondary" @click="showDateRange = false">Hủy</button>
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
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
}
.order-status-pie-legend {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 32px;
  margin-top: 18px;
  justify-content: center;
}
.pie-legend-row {
  display: flex;
  align-items: center;
  gap: 7px;
  min-width: 220px;
}
.pie-legend-label {
  flex: 1 1 0;
  text-align: left;
}
.pie-legend-value {
  min-width: 60px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.pie-legend-color {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  display: inline-block;
  margin-right: 3px;
  border: 1.5px solid #eee;
}

/* Thêm style cho phần chọn khoảng ngày */
.date-range-popup {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.date-range-content {
  background: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 400px;
  margin: 0 auto;
}

.date-range-content label {
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
}

.date-range-content input[type="date"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 100%;
  margin-bottom: 16px;
  font-size: 15px;
}

.date-range-content .btn {
  padding: 10px 16px;
  border-radius: 4px;
  font-size: 15px;
  min-width: 100px;
}


.growth-row {
  display: flex;
  gap: 24px;
  margin-top: 32px;
  margin-bottom: 32px;
  align-items: stretch;
}
.growth-col {
  flex: 1 1 0;
  min-width: 340px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}
.order-status-pie-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 8px #0001;
  padding: 18px 18px 18px 18px;
  min-width: 340px;
  max-width: 520px;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}
.growth-box {
    background: #fff;
  border-radius: 16px;
  padding: 18px 18px 10px 18px;
  box-shadow: 0 2px 8px #0001;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
  width: 100%;        
  max-width: 800px;   
  min-width: 0;        
  flex: 1 1 0; 
  
}
.growth-title {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 12px;
  color: #111;
}

.growth-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.growth-item {
  background: #111;
  color: #fff;
  border-radius: 18px;
  padding: 18px 32px;
  display: flex;
  align-items: center;
  gap: 18px;
  font-size: 18px;
  box-shadow: 0 2px 8px #0002;
}

.growth-icon {
  font-size: 26px;
  margin-right: 8px;
  color: #fff;
  width: 38px;
  display: flex;
  justify-content: center;
}

.growth-label {
  font-weight: 600;
  min-width: 160px;
}

.growth-value {
  font-weight: bold;
  min-width: 140px;
}

.growth-percent {
  margin-left: auto;
  font-weight: bold;
  font-size: 18px;
  color: #22b34c;
  display: flex;
  align-items: center;
  gap: 4px;
}
.growth-percent.down {
  color: #e53935;
}
.growth-percent i {
  font-size: 18px;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto auto;
  gap: 24px;
  margin: 32px 0;
}
.dashboard-cell {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}
</style>