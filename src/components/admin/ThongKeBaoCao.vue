<script setup>
import { ref, onMounted, watch, computed, nextTick } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';


const token = Cookies.get('token')

const selectedReport = ref('cuoi-ngay')
const selectedDate = ref(new Date().toISOString().slice(0, 10)) // yyyy-mm-dd
const baoCaoData = ref([])
const ngayLap = ref('')
const hienChiTiet = ref(false)
const chonThoiGian = ref("mac-dinh")

// Chọn ngày mặc định (1 ngày)
const ngayMacDinh = ref(new Date())

// Giờ bắt đầu và kết thúc
const gioBatDau = ref("")
const gioKetThuc = ref("")

// Khoảng ngày tùy chỉnh (range)
const ngayKhoang = ref([new Date(), new Date()])

function selectReport(type) {
  selectedReport.value = type
  if (type === 'cuoi-ngay') {
    fetchBaoCaoCuoiNgay()
  } else {
    baoCaoData.value = []
  }
}
const nhanVienDuocChon = ref("")
const danhSachNhanVien = ref([])

const phuongThucThanhToan = ref("") // chỉ chọn 1 phương thức
const danhSachPhuongThuc = ref([]) // lấy từ API

// Hàm ánh xạ mã sang tên tiếng Việt cho phương thức thanh toán
const getTenPhuongThuc = (ma) => {
  if (!ma) return '';
  switch (ma) {
    case 'tien_mat':
      return 'Tiền mặt';
    case 'chuyen_khoan':
      return 'Chuyển khoản';
    case 'the_tin_dung':
      return 'Thẻ tín dụng';
    // Thêm các trường hợp khác nếu có
    default:
      return ma;
  }
};

async function fetchPhuongThucThanhToan() {
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/api/HinhThuThanhToan', {
      headers: { Authorization: `Bearer ${token}` }
    });
    // Map lại dữ liệu để lấy tên tiếng Việt, bỏ các bản ghi null
    danhSachPhuongThuc.value = Array.isArray(res.data)
      ? res.data
          .filter(pt => pt.phuongThucThanhToan) // Bỏ các bản ghi null
          .map(pt => ({
            id: pt.id,
            ma: pt.phuongThucThanhToan,
            ten: getTenPhuongThuc(pt.phuongThucThanhToan)
          }))
      : [];
  } catch (err) {
    console.error('Lỗi tải phương thức thanh toán:', err)
  }
}
async function fetchBaoCaoCuoiNgay() {
  try {
    let params = { date: selectedDate.value }
    if (chonThoiGian.value === 'mac-dinh' && gioBatDau.value && gioKetThuc.value) {
      params.startTime = gioBatDau.value
      params.endTime = gioKetThuc.value
    }
    if (nhanVienDuocChon.value) {
      // Tìm id theo tên
      const nv = danhSachNhanVien.value.find(nv => nv.ten === nhanVienDuocChon.value)
      if (nv) params.idNhanVien = nv.id
    }
    if (phuongThucThanhToan.value) {
      params.idPhuongThucThanhToan = phuongThucThanhToan.value
    }
    const res = await axios.get('http://localhost:8080/hoa-don/bao-cao/cuoi-ngay', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    })
    baoCaoData.value = res.data
    await nextTick() // Đảm bảo computed được cập nhật
  } catch (err) {
    console.error('Lỗi tải báo cáo cuối ngày:', err)
    baoCaoData.value = [] // Reset về mảng rỗng nếu có lỗi
    await nextTick()
  }
}

// Theo dõi thay đổi ngày hoặc giờ để tự động gọi API
watch([ngayMacDinh, gioBatDau, gioKetThuc, chonThoiGian, ngayKhoang], ([ngay, start, end, mode, khoang]) => {
  if (selectedReport.value !== 'cuoi-ngay') return
  if (mode === 'mac-dinh') {
    selectedDate.value = ngay instanceof Date ? ngay.toISOString().slice(0, 10) : ngay
    fetchBaoCaoCuoiNgay()
  } else if (mode === 'tuy-chinh' && Array.isArray(khoang) && khoang[0] && khoang[1]) {
    fetchBaoCaoKhoangNgay(khoang[0], khoang[1])
  }
}, { immediate: true })

// Sắp xếp theo ngày tạo mới nhất lên đầu (bỏ dòng tổng cuối)
function sortByNgayTaoDesc(data) {
  if (!Array.isArray(data) || data.length === 0) return data;
  const chiTiet = data.slice(0, -1);
  const tong = data.at(-1);
  chiTiet.sort((a, b) => {
    if (a.ngayTao && b.ngayTao) {
      return new Date(b.ngayTao) - new Date(a.ngayTao);
    }
    return 0;
  });
  return [...chiTiet, tong];
}

async function fetchBaoCaoKhoangNgay(start, end) {
  try {
    // start, end là Date object
    const startDate = start instanceof Date ? start.toISOString().slice(0, 10) : start
    const endDate = end instanceof Date ? end.toISOString().slice(0, 10) : end
    let params = { startDate, endDate }
    if (nhanVienDuocChon.value) {
      const nv = danhSachNhanVien.value.find(nv => nv.ten === nhanVienDuocChon.value)
      if (nv) params.idNhanVien = nv.id
    }
    if (phuongThucThanhToan.value) {
      params.idPhuongThucThanhToan = phuongThucThanhToan.value
    }
    const res = await axios.get('http://localhost:8080/hoa-don/bao-cao/khoang-ngay', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    })
    baoCaoData.value = sortByNgayTaoDesc(res.data)
    await nextTick() // Đảm bảo computed được cập nhật
  } catch (err) {
    console.error('Lỗi tải báo cáo theo khoảng ngày:', err)
    baoCaoData.value = [] // Reset về mảng rỗng nếu có lỗi
    await nextTick()
  }
}

function formatCurrency(value) {
  if (!value) return '0'
  return Number(value).toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  })
}

const toast = useToast();
const showExporting = ref(false);
const showExportSuccess = ref(false);

async function exportToPDF() {
  showExporting.value = true;
  showExportSuccess.value = false;
  // Chọn vùng cần xuất PDF (báo cáo)
  const reportEl = document.querySelector('.bao-cao-wrapper');
  if (!reportEl) {
    showExporting.value = false;
    toast.error('Không tìm thấy nội dung báo cáo để xuất PDF!');
    return;
  }
  try {
    const canvas = await html2canvas(reportEl, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    // Tính toán kích thước ảnh phù hợp
    const imgWidth = pageWidth - 40;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
    // Hiện hộp thoại lưu file
    pdf.save('bao-cao-ban-hang.pdf');
    showExportSuccess.value = true;
    toast.success('Xuất file PDF thành công!');
  } catch (e) {
    toast.error('Có lỗi khi xuất PDF: ' + e.message);
  } finally {
    showExporting.value = false;
  }
}
function formatDate(date) {
  const d = new Date(date)
  const pad = (n) => (n < 10 ? '0' + n : n)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`
}

async function confirmExportPDF() {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Xác nhận xuất PDF?',
    text: 'Bạn có chắc chắn muốn xuất báo cáo ra file PDF không?',
    showCancelButton: true,
    confirmButtonText: 'Có, xuất ngay!',
    cancelButtonText: 'Hủy bỏ',
    reverseButtons: true,
    customClass: {
      confirmButton: 'swal2-confirm btn-save',
      cancelButton: 'swal2-cancel btn-cancel'
    }
  });
  if (result.isConfirmed) {
    await exportToPDF();
  }
}

onMounted(() => {
  const now = new Date()
  const pad = (n) => (n < 10 ? '0' + n : n)
  ngayLap.value = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  // Gọi báo cáo ngay khi vào view
  fetchBaoCaoCuoiNgay()
  fetchNhanVienList()
  fetchPhuongThucThanhToan();
})

async function fetchNhanVienList() {
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/api/NhanVien', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    // Map dữ liệu trả về thành { id, ten }
    const mapped = Array.isArray(res.data) ? res.data.map(nv => ({ id: nv.id, ten: nv.tenNhanVien })) : []
    danhSachNhanVien.value = mapped
  } catch (err) {
    console.error('Lỗi tải danh sách nhân viên:', err)
  }
}

// Thêm biến computed cho ngày bán/ngày thanh toán
const ngayBanHienThi = computed(() => {
  if (chonThoiGian.value === 'tuy-chinh' && Array.isArray(ngayKhoang.value) && ngayKhoang.value[0] && ngayKhoang.value[1]) {
    return `Từ ngày ${formatDate(ngayKhoang.value[0])} đến ngày ${formatDate(ngayKhoang.value[1])}`;
  } else if (chonThoiGian.value === 'mac-dinh' && ngayMacDinh.value) {
    return formatDate(ngayMacDinh.value);
  } else {
    return '';
  }
});

watch([nhanVienDuocChon, phuongThucThanhToan], () => {
  if (selectedReport.value !== 'cuoi-ngay') return;
  if (chonThoiGian.value === 'mac-dinh') {
    fetchBaoCaoCuoiNgay();
  } else if (chonThoiGian.value === 'tuy-chinh' && Array.isArray(ngayKhoang.value) && ngayKhoang.value[0] && ngayKhoang.value[1]) {
    fetchBaoCaoKhoangNgay(ngayKhoang.value[0], ngayKhoang.value[1]);
  }
});

const hasChiTiet = computed(() => baoCaoData.value.some(item => item.maHoaDon));
</script>

<template>
  <div>
    <!-- MENU NGANG -->
    <div class="submenu-horizontal">
      <button @click="selectReport('cuoi-ngay')">Báo cáo cuối ngày</button>/
      <button @click="selectReport('tai-chinh')">Báo cáo tài chính</button>
    </div>

    <!-- BỘ LỌC - CHỈ HIỆN KHI CHỌN "cuoi-ngay" -->
    <div v-if="selectedReport === 'cuoi-ngay'" class="bo-loc-wrapper">
      <div class="bo-loc-header">
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" class="feather feather-filter">
          <polygon points="22 3 2 3 10 13 10 19 14 19 14 13 22 3"></polygon>
        </svg>
        <h3>Bộ lọc</h3>
      </div>

      <div class="bo-loc-row">
        <div class="thoi-gian-filter">
          <label>Thời gian <span class="dot-xanh">●</span></label>

          <div class="thoi-gian-noi-dung">
            <div class="chon-ngay">
              <div class="time-option">
                <input type="radio" id="mac-dinh" value="mac-dinh" v-model="chonThoiGian" />
                <Datepicker v-model="ngayMacDinh" :enable-time-picker="false" :format="'dd/MM/yyyy'"
                  placeholder="Chọn ngày" class="bo-loc-input" />
              </div>

              <div class="time-option" style="margin-top: 6px;">
                <input type="radio" id="tuy-chinh" value="tuy-chinh" v-model="chonThoiGian" />
                <Datepicker v-model="ngayKhoang" :range="true" :enable-time-picker="false" :format="'dd/MM/yyyy'"
                  placeholder="Chọn khoảng ngày" class="bo-loc-input" />
              </div>
            </div>

            <div class="time-range" v-if="chonThoiGian === 'mac-dinh'">
              <input type="time" v-model="gioBatDau" class="bo-loc-input" />
              <input type="time" v-model="gioKetThuc" class="bo-loc-input" />
            </div>
          </div>
        </div>

        <!-- Nhân viên -->
        <div class="bo-loc-item">
          <label>Nhân Viên <span class="dot-xanh">●</span></label>
          <select v-model="nhanVienDuocChon" class="bo-loc-input">
            <option value="">Chọn nhân viên</option>
            <option v-for="nv in danhSachNhanVien" :key="nv.id" :value="nv.ten">
              {{ nv.ten }}
            </option>
          </select>
        </div>
        <!-- Phương thức thanh toán -->
        <div class="bo-loc-item">
          <label>Phương thức thanh toán<span class="dot-xanh">●</span></label>
          <select v-model="phuongThucThanhToan" class="bo-loc-input">
            <option value="">Chọn phương thức thanh toán</option>
            <option v-for="pt in danhSachPhuongThuc" :key="pt.id" :value="pt.id">
              {{ pt.ten }}
            </option>
          </select>
        </div>
      </div>
      <!-- Nút xuất PDF -->
      <button class="export-pdf-btn" @click="confirmExportPDF">Xuất PDF</button>
    </div>
    <!-- BÁO CÁO CUỐI NGÀY -->
    <div class="bao-cao-wrapper" v-if="selectedReport === 'cuoi-ngay'">
      <div class="ngay-lap">
        Ngày lập: {{ ngayLap }}
      </div>
      <div class="report-header">
        <h2>Báo cáo cuối ngày về bán hàng</h2>
        <p><strong>Ngày bán:</strong> {{ ngayBanHienThi }}</p>
        <p><strong>Ngày thanh toán:</strong> {{ ngayBanHienThi }}</p>
        <p v-if="nhanVienDuocChon"><strong>Nhân viên:</strong> {{ nhanVienDuocChon }}</p>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>Mã giao dịch</th>
            <th>Thời gian</th>
            <th>SL</th>
            <th>Doanh thu</th>
            <th>Phí vận chuyển</th>
            <th>Thực Thu</th>
          </tr>
        </thead>
        <tbody v-if="hasChiTiet">
          <tr class="row-tong" @click="hienChiTiet = !hienChiTiet" style="cursor: pointer;"
            v-if="baoCaoData.length > 1">
            <td><strong>Hóa đơn: {{ baoCaoData.length - 1 }}</strong></td>
            <td>-</td>
            <td><strong>{{ baoCaoData.at(-1)?.tongSoLuong ?? 0 }}</strong></td>
            <td><strong>{{ formatCurrency(baoCaoData.at(-1)?.tongDoanhThu) }}</strong></td>
            <td><strong>{{ formatCurrency(baoCaoData.at(-1)?.tongPhiVanChuyen) }}</strong></td>
            <td>
              <strong>
                {{
                  formatCurrency(
                    (baoCaoData.at(-1)?.tongDoanhThu || 0) -
                    (baoCaoData.at(-1)?.tongPhiVanChuyen || 0)
                  )
                }}
              </strong>
            </td>
          </tr>

          <!-- Chi tiết -->
          <tr v-for="(item, index) in baoCaoData.slice(0, -1)" :key="index" v-show="hienChiTiet">
            <td>{{ item.maHoaDon }}</td>
            <td>{{ item.ngayTao ? item.ngayTao : item.thoiGian }}</td>
            <td>{{ item.soLuong }}</td>
            <td>{{ formatCurrency(item.doanhThu) }}</td>
            <td>{{ formatCurrency(item.phiVanChuyen) }}</td>
            <td>{{ formatCurrency((item.doanhThu || 0) - (item.phiVanChuyen || 0)) }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td colspan="6" style="background: #f7f3e3; color: #3a2d0c; text-align: center; font-style: italic; font-size: 20px; padding: 32px;">
              Báo cáo không có dữ liệu
            </td>
          </tr>
        </tbody>
      </table>

    </div>
  </div>
</template>

<style>
.thoi-gian-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.bo-loc-item select {
  width: 200px;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.time-option {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-range {
  display: flex;
  gap: 10px;
  margin-left: 30px;
  margin-top: 5px;
}

.thoi-gian-filter input[type="time"] {
  width: 110px !important;
  min-width: 110px;
  max-width: 110px;
  height: 38px;
  padding: 6px 10px;
  font-size: 14px;
}

.dot-xanh {
  color: #007aff;
  margin-left: 4px;
}

/* phần style khác giữ nguyên */
.ngay-lap {
  margin-bottom: 10px;
  color: #333;
  font-size: 14px;
}

.bao-cao-wrapper {
  background-color: #f0f8ff;
  color: #000;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.report-header {
  text-align: center;
  margin-bottom: 20px;
  color: #000;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.report-table th {
  background-color: #87ceeb;
  color: #000;
  padding: 10px;
  border: 1px solid #a9a9a9;
  text-align: center;
  font-weight: bold;
}

.report-table td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: center;
  background-color: #fff;
  color: #000;
}

:deep(.row-tong) {
  background-color: #fff8dc !important;
  font-weight: bold;
  color: #000;
  transition: background-color 0.2s ease;
}

:deep(.row-tong:hover) {
  background-color: #ffefc1;
}

.report-table tbody tr:not(.row-tong) {
  border-bottom: 1px solid #ddd;
}

.bo-loc-wrapper {
  background: #fff;
  padding: 24px;
  border-radius: 10px;
  margin: 20px 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  font-family: 'Segoe UI', sans-serif;
  position: relative; /* Thêm để đặt nút xuất PDF */
}

.bo-loc-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
}

.bo-loc-header h3 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.bo-loc-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: stretch;
  justify-content: flex-start;
}

.bo-loc-item, .thoi-gian-filter {
  flex: 1 1 0;
  min-width: 220px;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  justify-content: stretch;
}

.bo-loc-item label {
  font-weight: 600;
  font-size: 14px;
  color: #444;
  margin-bottom: 4px;
}


.time-range {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

/* Chiều rộng cho tất cả bộ lọc */
.bo-loc-input,
.bo-loc-item select,
.dp__main {
  width: 200px !important;
  min-width: 200px;
  max-width: 200px;
  height: 38px;
  padding: 6px 10px;
  font-size: 14px;
}

.dot-xanh {
  color: #007aff;
  margin-left: 4px;
}


.submenu-horizontal {
  justify-content: left;
  margin-top: -20px;
  display: flex;
  gap: 10px;
  border-bottom: 2px solid #ccc;
}

.submenu-horizontal button {
  background-color: #F7F8F9;
  color: rgb(0, 0, 0);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.submenu-horizontal button:hover {
  color: #0056b3;
}

.bo-loc-input,
.bo-loc-item select,
input[type="time"],
.dp__main {
  height: 40px !important;
  min-height: 40px !important;
  max-height: 40px !important;
  font-size: 16px;
  box-sizing: border-box;
  padding: 6px 10px;
}

/* Nút xuất PDF */
.export-pdf-btn {
  position: absolute;
  right: 30px;
  bottom: 20px;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 10px 24px;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  z-index: 10;
  transition: background 0.2s;
}
.export-pdf-btn:hover {
  background: #0056b3;
}

/* Toast thông báo xuất file */
.export-toast {
  position: fixed;
  right: 40px;
  bottom: 40px;
  background: #fff;
  color: #333;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  padding: 18px 32px;
  font-size: 18px;
  z-index: 9999;
  display: flex;
  align-items: center;
  gap: 10px;
}
.export-toast.exporting {
  border-left: 6px solid #007aff;
}
.export-toast.success {
  border-left: 6px solid #28a745;
}
</style>
