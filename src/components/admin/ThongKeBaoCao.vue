<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'


const token = Cookies.get('token')

const selectedReport = ref('cuoi-ngay')
const selectedDate = ref('2025-07-23')
const baoCaoData = ref([])
const ngayLap = ref('')
const hienChiTiet = ref(false)
const chonThoiGian = ref("mac-dinh")

// Chọn ngày mặc định (1 ngày)
const ngayMacDinh = ref()

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

const nhanVienDuocChon = ref([])
const danhSachNhanVien = ref([
  { id: 1, ten: "Lê Thị Bảo Trân" },
  { id: 2, ten: "Nguyễn Văn A" },
  // ...
])

const nguoiTaoDuocChon = ref([])
const danhSachNguoiTao = ref([
  { id: 1, ten: "tuyen" },
  { id: 2, ten: "Nguyễn Thị Thái Hòa" },
  // ...
])

const phuongThucThanhToan = ref("")
const danhSachPhuongThuc = ref(["Tiền mặt", "Chuyển khoản", "Momo", "VNPay"])
async function fetchBaoCaoCuoiNgay() {
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/bao-cao/cuoi-ngay', {
      params: { date: selectedDate.value },
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    baoCaoData.value = res.data
  } catch (err) {
    console.error('Lỗi tải báo cáo cuối ngày:', err)
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

onMounted(() => {
  const now = new Date()
  const pad = (n) => (n < 10 ? '0' + n : n)
  ngayLap.value = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`
})
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

          <!-- Ngày mặc định -->
          <div class="time-option">
            <input type="radio" id="mac-dinh" value="mac-dinh" v-model="chonThoiGian" />
            <Datepicker v-model="ngayMacDinh" :enable-time-picker="false" :format="'dd/MM/yyyy'" placeholder="Chọn ngày"
              style="margin-left: 10px; width: 150px;" />
          </div>

          <!-- Tùy chỉnh (khoảng ngày) -->
          <div class="time-option" style="margin-top: 10px;">
            <input type="radio" id="tuy-chinh" value="tuy-chinh" v-model="chonThoiGian" />
            <Datepicker v-model="ngayKhoang" :range="true" :enable-time-picker="false" :format="'dd/MM/yyyy'"
              placeholder="Chọn khoảng ngày" style="margin-left: 10px; width: 220px;" />
          </div>

          <!-- Input giờ luôn hiển thị cho cả 2 -->
          <div class="time-range" style="margin-left: 30px; margin-top: 5px;">
            <input type="time" v-model="gioBatDau" placeholder="" />
            <input type="time" v-model="gioKetThuc" placeholder="" />
          </div>
        </div>

        <!-- Nhân viên -->
        <label>Nhân Viên  <span class="dot-xanh">●</span></label>
        <select v-model="nhanVienDuocChon">
          <option value="">Chọn nhân viên</option>
          <option v-for="nv in danhSachNhanVien" :key="nv.id" :value="nv.ten">
            {{ nv.ten }}
          </option>
        </select>

        <!-- Người tạo -->
        <label>Người tạo  <span class="dot-xanh">●</span></label>
        <select v-model="nguoiTaoDuocChon">
          <option value="">Chọn người tạo</option>
          <option v-for="nt in danhSachNguoiTao" :key="nt.id" :value="nt.ten">
            {{ nt.ten }}
          </option>
        </select>


        <!-- Phương thức thanh toán -->
        <div class="bo-loc-item">
          <label>Phương thức thanh toán</label>
          <select v-model="phuongThucThanhToan">
            <option value="">Chọn phương thức thanh toán</option>
            <option v-for="pt in danhSachPhuongThuc" :key="pt" :value="pt">
              {{ pt }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <!-- BÁO CÁO CUỐI NGÀY -->
    <div class="bao-cao-wrapper" v-if="selectedReport === 'cuoi-ngay'">
      <div class="ngay-lap">
        Ngày lập: {{ ngayLap }}
      </div>
      <div class="report-header">
        <h2>Báo cáo cuối ngày về bán hàng</h2>
        <p><strong>Ngày bán:</strong> {{ selectedDate }}</p>
        <p><strong>Ngày thanh toán:</strong> {{ selectedDate }}</p>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th>Mã giao dịch</th>
            <th>Thời gian</th>
            <th>SL</th>
            <th>Doanh thu</th>
          </tr>
        </thead>
        <tbody>
          <tr class="row-tong" @click="hienChiTiet = !hienChiTiet" style="cursor: pointer;"
            v-if="baoCaoData.length > 1">
            <td><strong>Hóa đơn: {{ baoCaoData.length - 1 }}</strong></td>
            <td>-</td>
            <td><strong>{{ baoCaoData.at(-1)?.tongSoLuong ?? 0 }}</strong></td>
            <td><strong>{{ formatCurrency(baoCaoData.at(-1)?.tongDoanhThu) }}</strong></td>
          </tr>

          <!-- DÒNG CHI TIẾT - chỉ hiện nếu hienChiTiet = true -->
          <tr v-for="(item, index) in baoCaoData.slice(0, -1)" :key="index" v-show="hienChiTiet">
            <td>{{ item.maHoaDon }}</td>
            <td>{{ item.thoiGian }}</td>
            <td>{{ item.soLuong }}</td>
            <td>{{ formatCurrency(item.doanhThu) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style>
.time-option input[type="radio"] {
  accent-color: #007aff;
  /* Bo tròn xanh khi chọn */
}

.time-option input[type="radio"]:checked+label+.dp__main {
  border: 1.5px solid #007aff !important;
  border-radius: 6px;
}

.time-option input[type="radio"]:checked+.dp__main {
  border: 1.5px solid #007aff !important;
  border-radius: 6px;
}

.dp__main:focus-within {
  border-color: #007aff !important;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  border-radius: 6px;
}

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
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
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
  align-items: flex-end;
}

.bo-loc-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 200px;
  flex: 1;
}

.bo-loc-item label {
  font-weight: 600;
  font-size: 14px;
  color: #444;
  margin-bottom: 4px;
}

.bo-loc-item select,
input[type="time"],
.dp__main {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
  font-size: 14px;
  transition: border-color 0.2s;
}

.bo-loc-item select:focus,
input[type="time"]:focus,
.dp__main:focus-within {
  border-color: #007aff;
  outline: none;
  box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
}

.time-option {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 5px;
}

.time-range {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}

.thoi-gian-filter {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 280px;
  flex: 1.2;
}

.thoi-gian-filter label {
  font-weight: 600;
  margin-bottom: 6px;
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
</style>
