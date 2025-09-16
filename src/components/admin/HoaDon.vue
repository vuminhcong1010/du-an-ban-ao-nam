<script setup>
import { Eye, FilterIcon, Upload, Plus } from "lucide-vue-next";
import { onMounted, ref, watch } from "vue";
import { useToast } from "vue-toastification";
import 'vue-select/dist/vue-select.css';
import Cookies from 'js-cookie';

const token = Cookies.get('token');
const toast = useToast();

// Các tham số tìm kiếm và lọc
const searchQuery = ref("");
const statusFilter = ref("");
const startDate = ref("");
const endDate = ref("");
const orderCreationMethod = ref("");
const revenueFilter = ref(0);
const minRevenue = ref(0);
const maxRevenue = ref(10000000);

// Phân trang
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 10;
const inputPage = ref(1);

// Dữ liệu hóa đơn
const todos = ref([]);

const fetchTodos = async () => {
  try {
    const formattedStartDate = startDate.value ? `${startDate.value}T00:00:00Z` : '';
    const formattedEndDate = endDate.value ? `${endDate.value}T23:59:59Z` : '';

    const params = new URLSearchParams({
      page: currentPage.value,
      size: pageSize,
    });

    if (searchQuery.value) {
      params.append('search', searchQuery.value);
    }
    if (statusFilter.value !== "") {
      params.append('trangThai', statusFilter.value);
    }
    if (formattedStartDate) {
      params.append('startDate', formattedStartDate);
    }
    if (formattedEndDate) {
      params.append('endDate', formattedEndDate);
    }
    if (orderCreationMethod.value !== "") {
      params.append('loaiDon', orderCreationMethod.value);
    }
    if (revenueFilter.value > 0) {
      params.append('minPhi', minRevenue.value);
      params.append('maxPhi', revenueFilter.value);
    }

    const url = `http://localhost:8080/hoa-don/tim-kiem?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Server responded with status ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    todos.value = json.content;
    minRevenue.value = json.minPhi || 0;
    maxRevenue.value = json.maxPhi || 10000000;
    totalPages.value = json.totalPages;
    currentPage.value = json.number;
      
    // Đảm bảo sắp xếp hóa đơn theo thứ tự ngày tạo mới nhất ở frontend (nếu cần)
    todos.value.sort((a, b) => new Date(b.ngayTao) - new Date(a.ngayTao)); 

  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error.message);
    toast.error("Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại.");
  }
};


onMounted(() => {
  const today = new Date().toISOString().split('T')[0]; // Lấy ngày hôm nay theo định dạng YYYY-MM-DD
  startDate.value = today;
  endDate.value = today;  // Mặc định là hôm nay
  fetchTodos();
});

watch([searchQuery, statusFilter, startDate, endDate, orderCreationMethod, revenueFilter], () => {
  currentPage.value = 0;
  inputPage.value = 1;
  fetchTodos();
});

watch(currentPage, fetchTodos);

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
  }
};

const goToPage = () => {
  if (inputPage.value >= 1 && inputPage.value <= totalPages.value) {
    currentPage.value = inputPage.value - 1;
  } else {
    toast.error("Số trang không hợp lệ!");
  }
};

watch(currentPage, (newPage) => {
  inputPage.value = newPage + 1;
});

const listTrangThai = [
  "Đang xử lý",
  "Đã xác nhận",
  "Đang giao hàng",
  "Giao hàng thành công",
  "Hoàn Thành",
  "Hủy/hoàn",
];

function getStatusClass(status) {
  switch (status) {
    case 0:
      return 'processing'; // Đang xử lý
    case 1:
      return 'confirmed'; // Đã xác nhận
    case 2:
      return 'shipping'; // Đang giao hàng
    case 3:
      return 'delivered'; // Giao hàng thành công
    case 4:
      return 'completed'; // Hoàn thành
    case 5:
      return 'cancelled'; // Hủy/hoàn
    default:
      return 'inactive'; // Mặc định nếu không có trạng thái
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
</script>

<template>
  <div>
    <div class="bg-white p-3 rounded mb-4 d-flex align-items-center justify-content-between border"
      style="height: 60px; border: none; box-shadow: none">
      <h2 class="fw-bold mb-0">Quản lý hóa đơn</h2>
      <div>
        <button class="btn btn-outline-primary me-2" style="border: none; color: #0a2c57" @click="thongBao">
          <Upload class="me-1" size="16" /> Xuất file
        </button>
        <button class="btn success" style="background-color: #0a2c57; color: white" @click="thongBao">
          <Plus class="me-1" size="16" /> Tạo đơn mới
        </button>
      </div>
    </div>

    <div class="bg-white p-3 rounded mb-4 border">
      <h5 style="margin-bottom: 1em">
        <i>
          <FilterIcon></FilterIcon>
        </i> Bộ lọc
      </h5>
      <div class="px-3">
        <input type="text" class="form-control mb-3" v-model="searchQuery"
          placeholder="Tìm kiếm theo mã, tên khách hàng ..." />
        <div class="d-flex flex-wrap gap-3">
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Trạng thái</label>
            <select class="form-select" v-model="statusFilter">
              <option value="">Tất cả</option>
              <option value="0">Đang xử lý</option>
              <option value="1">Đã xác nhận</option>
              <option value="2">Đang giao hàng</option>
              <option value="3">Giao hàng thành công</option>
              <option value="4">Hoàn thành</option>
              <option value="5">Hủy/hoàn</option>
            </select>
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Loại đơn</label>
            <select class="form-select" v-model="orderCreationMethod">
              <option value="">Tất cả</option>
              <option value="0">Tại cửa hàng</option>
              <option value="1">Online</option>
            </select>
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Ngày bắt đầu</label>
            <input type="date" v-model="startDate" class="form-control" />
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Ngày kết thúc</label>
            <input type="date" v-model="endDate" class="form-control" />
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Lọc theo doanh thu: {{ revenueFilter }}</label>
            <input type="range" class="form-range custom-range" id="customRange1" v-model="revenueFilter"
              :min="minRevenue" :max="maxRevenue" step="1000" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-3 rounded mb-4 border" style="height: auto;">
      <h5 class="text-start ps-3 pt-3">Danh sách hóa đơn</h5>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Mã</th>
              <th>Khách hàng</th>
              <th>Nhân viên</th>
              <th>SDT</th>
              <th>Thời gian tạo</th>
              <th>Tổng giá trị</th>
              <th>Loại đơn</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in todos" :key="index">
              <td>{{ index + 1 }}</td>
              <td>{{ item.maHoaDon }}</td>
              <td>{{ item.tenKhachHang }}</td>
              <td>{{ item.idNhanVien && item.idNhanVien.tenNhanVien ? item.idNhanVien.tenNhanVien : 'Chưa có' }}</td>
              <td>{{ item.sdt }}</td>
              <td>{{ formatDate(item.ngayTao) }}</td>
              <td>{{ new Intl.NumberFormat("vi-VN").format(item.tongTien) }}</td>
              <td>{{ item.loaiDon === 0 ? "Tại cửa hàng" : "Online" }}</td>
              <td>
                <span :class="['status-badge', getStatusClass(item.trangThai)]">
                  {{ listTrangThai[item.trangThai] }}
                </span>
              </td>
              <td>
                <RouterLink :to="`/hoa-don-chi-tiet/${item.maHoaDon}`">
                  <Eye style="color: #0a2c57"></Eye>
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 d-flex align-items-center justify-content-center gap-2">
        <button class="btn custom-btn" @click="prevPage" :disabled="currentPage === 0">Trước</button>
        <input v-model.number="inputPage" @keyup.enter="goToPage" type="number" min="1" :max="totalPages"
          class="form-control w-auto text-center" />
        <span>/ {{ totalPages }}</span>
        <button class="btn custom-btn" @click="nextPage" :disabled="currentPage >= totalPages - 1">Tiếp</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Các kiểu CSS cho bảng khách hàng và phân trang */
.container-fixed {
  width: 1270px;
  margin: 0 auto;
}

.custom-btn {
  background-color: #f0f0f0;
  color: #0a2c57;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.custom-btn:hover {
  background-color: #0a2c57;
  color: white;
}

.custom-btn:disabled {
  cursor: not-allowed;
  background-color: #e0e0e0;
  color: #999;
  border: 1px solid #ddd;
}

/* Kiểu cho badge trạng thái */
.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.active {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-badge.inactive {
  background-color: #fbe9e7;
  color: #d32f2f;
}

/* Các trạng thái mới cho bảng Hóa đơn */
.status-badge.processing {
  background-color: #e8f7ff;
  color: #2196f3;
}

.status-badge.confirmed {
  background-color: #e7f4e8;
  color: #388e3c;
}

.status-badge.shipping {
  background-color: #fff3e0;
  color: #fb8c00;
}

.status-badge.delivered {
  background-color: #e8f5e9;
  color: #388e3c;
}

.status-badge.completed {
  background-color: #f1f8e9;
  color: #8bc34a;
}

.status-badge.cancelled {
  background-color: #fce4ec;
  color: #d32f2f;
}

h2, h5 {
  font-weight: bold;
  color: #0a2c57;
}
</style>
