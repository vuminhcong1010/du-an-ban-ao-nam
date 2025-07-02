<template>
  <div class="">
    <!-- Thanh tìm kiếm -->
    <!-- Thanh tìm kiếm + các nút -->
    <div
      class="d-flex align-items-center justify-content-between bg-white p-3 rounded border mb-4 gap-2"
    >
      <h5 class="fw-bold mb-0">Quản lý khách hàng</h5>

      <div class="d-flex gap-2">
        <button class="btn-export excel" @click="exportExcel">
          📊 Xuất Excel
        </button>
        <button class="btn-export pdf" @click="exportPDF">📄 Xuất PDF</button>
        <!-- <AddKhachHang class="add" @added="handleAdded" /> -->
        <button
          @click="navigateToAddCustomer"
          style="
            background-color: #0a2c57;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
          "
        >
          <i class="fa-solid fa-plus"></i> Thêm khách hàng
        </button>
      </div>
    </div>

    <div
      class="d-flex align-items-center justify-content-between bg-white p-3 rounded border mb-4 gap-2"
    >
      <SearchAndFilterKhachHang
        :value="searchQuery"
        :filter-data="filterData"
        @search="handleSearch"
        @filterApplied="handleFilter"
      />
    </div>

    <!-- Bảng khách hàng -->
    <div class="bg-white p-3 rounded border mb-4">
      <h5 class="mb-0">Danh sách khách hàng</h5> <br>
      <KhachHangTable
        :reload="reloadTable"
        :search-query="searchQuery"
        :filter-data="filterData"
      />
    </div>
  </div>
</template>

<script>
import KhachHangTable from "../components/admin/KhachHangTable.vue";
import SearchAndFilterKhachHang from "@/components/admin/SearchAndFilterKhachHang.vue";
import { useRouter } from "vue-router";

const router = useRouter(); // Khởi tạo router instance

export default {
  name: "CustomerManagement",
  components: {
    KhachHangTable,
    // AddKhachHang,
    SearchAndFilterKhachHang,
  },
  setup() {
    const router = useRouter(); // Khởi tạo router instance trong setup
    const navigateToAddCustomer = () => {
      router.push({ name: "AddKhachHang" }); // Chuyển hướng đến route 'AddCustomer'
    };
    return { navigateToAddCustomer }; // Trả về để template có thể sử dụng
  },
  data() {
    return {
      reloadTable: false,
      searchQuery: "",
      filterData: {},
    };
  },
  methods: {
    handleAdded() {
      this.reloadTable = true;
      setTimeout(() => {
        this.reloadTable = false;
      }, 100);
    },
    handleSearch(query) {
      this.searchQuery = query;
    },
    handleFilter(filter) {
      this.filterData = filter;
    },
  },
};
</script>

<style scoped>
/* ❌ Không cần phần này nếu bạn dùng Bootstrap gap-2 */
.d-flex .SearchKhachHang {
  flex-grow: 1;
  margin-right: 10px;
}

/* Loại bỏ outline và viền khi nút được nhấn hoặc focus */
.btn:focus,
.btn:active {
  outline: none;
  /* Loại bỏ outline */
  border: none;
  /* Loại bỏ viền nếu có */
  box-shadow: none;
  /* Loại bỏ bóng đổ khi nút được focus hoặc nhấn */
}

/* Thêm hiệu ứng hover cho icon */
.icon {
  width: 32px;
  height: 32px;
  transition: transform 0.3s ease, background-color 0.3s ease,
    border-radius 0.3s ease;
  /* Thêm hiệu ứng mượt mà */
  padding: 5px;
  border-radius: 50%;
  /* Ban đầu là hình tròn */
}

/* Hiệu ứng hover khi di chuột qua icon */
.icon:hover {
  background-color: gray;
  /* Màu nền khi hover */
  transform: scale(1.3);
  /* Phóng to icon khi hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* Thêm bóng đổ khi hover */
}

.add {
  margin-left: auto;
  /* Đẩy nút thêm sang bên phải */
}

.btn-export {
  padding: 6px 16px;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  color: white;
  cursor: pointer;
  background-color: #0a2c57;
  transition: background-color 0.3s ease;
}

.btn-export:hover {
  background-color: #061a38; /* màu đậm hơn khi hover */
}
</style>
