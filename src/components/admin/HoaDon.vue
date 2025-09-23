<script setup>
// code mới 

import { Eye, FilterIcon, Upload, Plus } from "lucide-vue-next";
import { onMounted, ref, computed, watch } from "vue";
import { useToast } from "vue-toastification";
import 'vue-select/dist/vue-select.css';
import Cookies from 'js-cookie'

import Swal from "sweetalert2";
const test = () => {
  Swal.fire({
    title: "Xác nhận",
    text: "Bạn có chắc chắn muốn hoàn tất đơn hàng này không?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Đồng ý",
    cancelButtonText: "Hủy",
    reverseButtons: true, // đổi vị trí nút
  }).then((result) => {
    if (result.isConfirmed) {
      // 👉 Nếu người dùng bấm "Đồng ý"
      console.log("✅ Đơn hàng đã hoàn tất");
      // Gọi API hoàn tất ở đây
    } else {
      console.log("❌ Người dùng đã hủy");
    }
  });
};


const token = Cookies.get('token')
const toast = useToast();
const deliveryMethod = ref("");
const orderCreationMethod = ref("");
const searchQuery = ref("");
const startDate = ref("");
const endDate = ref("");

const todos = ref([]);
const revenueFilter = ref(0);

// phân trang :
const currentPage = ref(0);
const totalPages = ref(0);
const pageSize = 5;

const fetchTodos = async () => {
  try {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    startDate.value = todayStr;
    endDate.value = todayStr;

    const response = await fetch(
      `http://localhost:8080/hoa-don/phan-trang?page=${currentPage.value}&size=${pageSize}`, {
  headers: {
    Authorization: `Bearer ${token}` 
  }
});
    const json = await response.json();
    todos.value = json.content;
    totalPages.value = json.totalPages;

    revenueFilter.value = Math.max(...json.content.map((i) => i.tongTien));
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error);
  }
};

onMounted(() => {
  fetchTodos();
});

watch(currentPage, fetchTodos);

const listTrangThai = [
  "Đang xử lý",
  "Đã xác nhận",
  "Đang giao hàng",
  "Giao hàng thành công",
  "Hoàn Thành",
  "Hủy/hoàn",
];

const minRevenue = computed(() =>
  todos.value.length ? Math.min(...todos.value.map((i) => i.tongTien)) : 0
);
const maxRevenue = computed(() =>
  todos.value.length ? Math.max(...todos.value.map((i) => i.tongTien)) : 100000
);

// const filteredTodos = computed(() => {
//   return todos.value
//     .filter((item) => {
//       if (!startDate.value && !endDate.value) return true;
//       const createdDate = new Date(item.ngayTao);
//       const start = startDate.value
//         ? new Date(startDate.value + "T00:00:00")
//         : null;
//       const end = endDate.value ? new Date(endDate.value + "T23:59:59") : null;

//       if (start && createdDate < start) return false;
//       if (end && createdDate > end) return false;
//       return true;
//     })
//     .filter((item) => item.tongTien <= revenueFilter.value)
//     .filter((item) => {
//       if (!deliveryMethod.value) return true;
//       return listTrangThai[item.trangThai] === deliveryMethod.value;
//     })
//     .filter((item) => {
//       if (!orderCreationMethod.value) return true;
//       return item.loaiDon === orderCreationMethod.value;
//     })
//     .filter((item) => {
//       const query = searchQuery.value.toLowerCase();
//       return (
//         item.maHoaDon?.toLowerCase().includes(query) ||
//         item.tenKhachHang?.toLowerCase().includes(query) ||
//         item.sdt?.toLowerCase().includes(query)
//       );
//     });
// });
const filteredTodos = computed(() => {
  return todos.value
    .slice() // tạo bản sao để không ảnh hưởng đến dữ liệu gốc
    .sort((a, b) => new Date(a.ngayTao) - new Date(b.ngayTao)) // Sắp xếp từ cũ đến mới
    .filter((item) => {
      if (!startDate.value && !endDate.value) return true;
      const createdDate = new Date(item.ngayTao);
      const start = startDate.value
        ? new Date(startDate.value + "T00:00:00")
        : null;
      const end = endDate.value ? new Date(endDate.value + "T23:59:59") : null;

      if (start && createdDate < start) return false;
      if (end && createdDate > end) return false;
      return true;
    })
    .filter((item) => item.tongTien <= revenueFilter.value)
    .filter((item) => {
      if (!deliveryMethod.value) return true;
      return listTrangThai[item.trangThai] === deliveryMethod.value;
    })
    .filter((item) => {
      if (!orderCreationMethod.value) return true;
      return item.loaiDon === orderCreationMethod.value;
    })
    .filter((item) => {
      const query = searchQuery.value.toLowerCase();
      return (
        item.maHoaDon?.toLowerCase().includes(query) ||
        item.tenKhachHang?.toLowerCase().includes(query) ||
        item.sdt?.toLowerCase().includes(query)
      );
    });
});


function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
</script>

<template>
  <div
    class="bg-white p-3 rounded mb-4 d-flex align-items-center justify-content-between border"
    style="height: 60px; border: none; box-shadow: none"
  >
    <h5 class="fw-bold mb-0">Quản lý hóa đơn</h5>
    <div>
      <button
        class="btn btn-outline-primary me-2"
        style="border: none; color: #0a2c57"
        @click="test"
      >
        <Upload class="me-1" size="16" /> Xuất file
      </button>
      <RouterLink to="/ban-hang"
        class="btn success"
        style="background-color: #0a2c57; color: white"
        @click="thongBao"
      >
        <Plus class="me-1" size="16" /> Tạo đơn mới
      </RouterLink>
    </div>
  </div>

  <div
    class="bg-white p-3 rounded mb-4 align-items-center border"
    style="height: 700px"
  >
    <h6 style="margin-bottom: 1em">
      <i> <FilterIcon></FilterIcon> </i> Bộ lọc
    </h6>

    <!-- bo loc -->
    <!-- Bộ lọc -->
    <div class="px-3">
      <!-- Thêm padding hai bên -->
      <div class="row gx-3 gy-2">
        <!-- gx: khoảng cách ngang, gy: khoảng cách dọc -->
        <!-- Tìm kiếm -->
        <div class="col-md-3">
          <label class="form-label">Tìm kiếm</label>
          <input
            type="text"
            class="form-control"
            placeholder="Tìm kiếm theo mã, tên nhân viên, tên khách hàng ..."
            v-model="searchQuery"
          />
        </div>

        <!-- Khoảng ngày -->
        <div class="col-md-4">
          <label class="form-label">Lọc theo khoảng ngày</label>
          <div class="d-flex gap-2">
            <input type="date" v-model="startDate" class="form-control" />
            <input type="date" v-model="endDate" class="form-control" />
          </div>
        </div>

        <!-- Trạng thái -->
        <div class="col-md-2">
          <label class="form-label">Trạng thái</label>
          <select class="form-select" v-model="deliveryMethod">
            <option value="">Tất cả</option>
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Đang giao hàng">Đang giao hàng</option>
            <option value="Giao hàng thành công">Giao hàng thành công</option>
            <option value="Hủy/hoàn">Hủy/hoàn</option>
          </select>
        </div>

        <!-- Loại đơn -->
        <div class="col-md-3">
          <label class="form-label">Loại đơn</label>
          <select class="form-select" v-model="orderCreationMethod">
            <option value="">Tất cả</option>
            <option value="auto">Tại cửa hàng</option>
            <option value="manual">Website</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Lọc theo thanh tăng giảm -->
    <div class="d-flex justify-content-end my-3">
      <div style="width: 400px">
        <label for="customRange1" class="form-label">
          Lọc theo doanh thu: {{ revenueFilter }}
        </label>
        <input
          type="range"
          class="form-range custom-range"
          id="customRange1"
          v-model="revenueFilter"
          :min="minRevenue"
          :max="maxRevenue"
          step="1000"
        />
      </div>
    </div>

    <!-- menu chuyen tab -->
    <div class="">
      <!-- Tab: tat ca -->
      <div class="text-muted text-center bg-light rounded">
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
              <tr v-for="(item, index) in filteredTodos" :key="index">
                <td>{{ index + 1 }}</td>
                <td>{{ item.maHoaDon }}</td>
                <td>{{ item.tenKhachHang }}</td>
                <td>Vũ Minh Công</td>
                <td>{{ item.sdt }}</td>
                <td>{{ formatDate(item.ngayTao) }}</td>
                <td>
                  <span>{{
                    new Intl.NumberFormat("vi-VN").format(item.tongTien)
                  }}</span>
                </td>
                <td>
                  {{ item.loaiDon === 0 ? "Tại cửa hàng" : "Online" }}
                </td>
                <td>
                  <span
                    class="badge rounded-pill text-bg"
                    style="background-color: #10b981"
                  >
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
      </div>
      <div class="d-flex justify-content-center mt-2">
        <!-- Phân trang -->
        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 0 }">
              <a class="page-link" href="#" @click.prevent="currentPage--">«</a>
            </li>
            <li
              class="page-item"
              v-for="p in totalPages"
              :key="p"
              :class="{ active: p - 1 === currentPage }"
            >
              <a
                class="page-link"
                href="#"
                @click.prevent="currentPage = p - 1"
                >{{ p }}</a
              >
            </li>
            <li
              class="page-item"
              :class="{ disabled: currentPage === totalPages - 1 }"
            >
              <a class="page-link" href="#" @click.prevent="currentPage++">»</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container-fixed {
  width: 1270px; /* hoặc max-width: 800px; nếu bạn muốn giới hạn tối đa */
  margin: 0 auto; /* căn giữa */
}
.custom-range::-webkit-slider-thumb {
  appearance: none;
  background: url("@/assets/icon.svg") no-repeat center center;
  background-color: #3b82f6; /* Bỏ màu nền nếu không cần màu */
  border-radius: 50%;
  height: 40px; /* Tăng kích thước */
  width: 40px;
  cursor: pointer;
  border: none; /* Bỏ border */
  background-size: 80%; /* Làm icon to hơn */
  margin-top: -12px; /* Canh chỉnh lại nếu cần */
}
</style>