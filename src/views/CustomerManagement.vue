<template>
  <div class="mt-4 px-3">
    <!-- Thanh tìm kiếm + Nút lọc -->
    <div class="d-flex align-items-center bg-white p-3 rounded shadow mb-4 gap-2">
      <SearchKhachHang :value="searchQuery" @search="handleSearch" />
      <button class="btn " @click="handleFilterButtonClick">
        <!-- <i class="fas fa-filter"></i> -->
        <img src="../assets/icons8-filter-24.png" alt="Filter Icon" class="icon" />
      </button>
       <AddKhachHang class="add" @added="handleAdded" />
    </div>

    <!-- Popup lọc -->
    <FilterKhachHang v-if="showFilter" @filterApplied="handleFilter" @close="showFilter = false" />

    <!-- Thêm khách hàng -->
    <!-- <div class="bg-white p-3 rounded shadow mb-4">
     
    </div> -->

    <!-- Bảng khách hàng -->
    <div class=" bg-white p-3 rounded shadow mb-4 ">
      <h4>Quản lý khách hàng</h4>
      <KhachHangTable :reload="reloadTable" :search-query="searchQuery" :filter-data="filterData" />
    </div>
  </div>
</template>

<script>
import KhachHangTable from '../components/admin/KhachHangTable.vue';
import AddKhachHang from '../components/admin/AddKhachHang.vue';
import SearchKhachHang from '../components/admin/SearchKhachHang.vue';
import FilterKhachHang from '../components/admin/FilterKhachHang.vue';

import { Filter } from 'lucide-vue-next';

export default {
  name: 'CustomerManagement',
  components: {
    KhachHangTable,
    AddKhachHang,
    SearchKhachHang,
    FilterKhachHang,
  },
  data() {
    return {
      reloadTable: false, // Biến để reload bảng khách hàng
      searchQuery: '',  // Biến để lưu trữ truy vấn tìm kiếm  

      showFilter: false, // Biến để điều khiển hiển thị popup lọc
      filterData: {} // Biến để lưu trữ dữ liệu lọc
    };
  },
  methods: {
    // Hàm này sẽ được gọi khi thêm khách hàng thành công
    handleAdded() {
      this.reloadTable = true;
      // Reset reload sau 1 chút để KhachHangTable detect được thay đổi
      setTimeout(() => {
        this.reloadTable = false;
      }, 100);
    },
    handleSearch(query) {
      console.log('Từ khóa tìm kiếm:', query);
      this.searchQuery = query;  // Cập nhật giá trị tìm kiếm
    },
    toggleFilter() {
      this.showFilterPopup = !this.showFilterPopup;
    },
    handleFilter(filter) {
      this.filterData = filter;
      this.showFilterPopup = false;
    },
    handleClearFilter() {
      this.filterData = {};
      this.searchQuery = '';
    },
    // Hàm xử lý khi click vào nút lọc
    handleFilterButtonClick() {
      // Khi người dùng click nút lọc, làm trống thanh tìm kiếm
      this.searchQuery = '';
      this.showFilter = true;  // Hiển thị popup lọc
    }
  }
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
  transition: transform 0.3s ease, background-color 0.3s ease, border-radius 0.3s ease;
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
</style>
