<template>
  <div class="text-muted text-center bg-light rounded">
    <div class="table-responsive">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>STT</th>
            <th>Mã KH</th>
            <th>Họ tên</th>
            <th>Giới tính</th>
            <th>Ngày sinh</th>
            <th>Số điện thoại</th>
            <th>Email</th>
            <th>Số đơn đã mua</th>
            <th>Tổng tiền</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(kh, index) in khachHangs" :key="index">
            <td>{{ index + 1 + page * size }}</td>
            <td>{{ kh.maKhachHang }}</td>
            <td>{{ kh.tenKhachHang }}</td>
            <td>{{ kh.gioiTinh ? 'Nam' : 'Nữ' }}</td>
            <td>{{ kh.ngaySinh ? new Date(kh.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật' }}</td>
            <td>{{ kh.soDienThoai }}</td>
            <td>{{ kh.email || 'Chưa cập nhật' }}</td>
            <td>{{ kh.soHoaDonDaMua || 0 }}</td>
            <td>{{ kh.tongTien ? formatCurrency(kh.tongTien) : 'Chưa cập nhật' }}</td>
            <td>
              <span :class="{
                'badge rounded-pill text-bg-success': kh.trangThai === 1,
                'badge rounded-pill text-bg-danger': kh.trangThai === 0
              }" :style="{
                backgroundColor: kh.trangThai === 1 ? '#10B981' : '#DC3545'
              }">
                {{ kh.trangThai === 1 ? 'Đang hoạt động' : 'Dừng hoạt động' }}
              </span>
            </td>
            <td>
              <!-- Chức năng chỉnh sửa (nếu cần) -->
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Phân trang -->
  <nav class="d-flex justify-content-center mt-3">
    <ul class="pagination">
      <li class="page-item" :class="{ disabled: page === 0 }">
        <button class="page-link" @click="goToPreviousPage">Trước</button>
      </li>

      <li v-for="pageNumber in pageNumbers" :key="pageNumber" class="page-item"
          :class="{ active: pageNumber === page + 1 }">
        <button class="page-link" @click="goToPage(pageNumber - 1)">
          {{ pageNumber }}
        </button>
      </li>

      <li class="page-item" :class="{ disabled: page === totalPages - 1 }">
        <button class="page-link" @click="goToNextPage">Tiếp</button>
      </li>
    </ul>
  </nav>
</template>

<script>
import { fetchCustomers } from '@/api/KhachHangApi';
import LocKhachHang from "../admin/LocKhachHang.vue";
import SearchKhachHang from "../admin/SearchKhachHang.vue";

export default {
  name: "BangKhachHang",
  components: { LocKhachHang, SearchKhachHang },
  props: {
    reload: {
      type: Boolean,
      default: false
    },
    searchQuery: {
      type: String,
      default: "",
    },
    khachHangsInput: {
      type: Array,
      default: null
    }
  },
  data() {
    return {
      khachHangs: [], // Danh sách khách hàng
      page: 0,  // Trang hiện tại
      size: 10, // Số lượng khách hàng mỗi trang
      totalItems: 0, // Tổng số khách hàng (để tính tổng số trang)
      totalPages: 0, // Tổng số trang
      filterData: {}, // Bộ lọc
    };
  },
  computed: {
    // Tạo danh sách các số trang
    pageNumbers() {
      const numbers = [];
      for (let i = 1; i <= this.totalPages; i++) {
        numbers.push(i);
      }
      return numbers;
    }
  },
  watch: {
    searchQuery(newVal) {
      this.page = 0; // Reset trang khi có thay đổi tìm kiếm
      this.loadCustomers(); // Tải lại khách hàng với từ khóa tìm kiếm
    },
    khachHangsInput(newList) {
      if (newList) {
        this.khachHangs = newList;
        this.totalItems = newList.length;
        this.totalPages = 1;
         console.log("Danh sách khách hàng sau khi lọc: ", newList);  // Log dữ liệu nhận được
      }
    },
  },
  mounted() {
    this.loadCustomers(); // Tải khách hàng ban đầu
  },
  methods: {
    // Gọi API để tải khách hàng với phân trang và lọc
    async loadCustomers() {
      try {
          console.log("Dữ liệu bộ lọc: ", this.filterData);  // Log bộ lọc khi gọi API
        const response = await fetchCustomers(this.page, this.size, this.searchQuery, this.filterData);
        this.khachHangs = response.data.content;
        this.totalItems = response.data.totalElements;  // Lưu tổng số khách hàng
        this.totalPages = Math.ceil(this.totalItems / this.size); // Tính tổng số trang
      } catch (error) {
        console.error("Lỗi khi tải danh sách khách hàng:", error);
      }
    },
    // Nhận bộ lọc từ LocKhachHang và tải lại khách hàng với bộ lọc mới
    handleFilterApplied(filter) {
      this.filterData = filter;  // Nhận bộ lọc từ LocKhachHang
      this.page = 0;  // Reset trang khi thay đổi bộ lọc
      this.loadCustomers(); // Tải lại dữ liệu với bộ lọc mới
    },
    formatCurrency(value) {
      return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    },
    goToPreviousPage() {
      if (this.page > 0) {
        this.page--;
        this.loadCustomers();
      }
    },
    goToNextPage() {
      if (this.page < this.totalPages - 1) {
        this.page++;
        this.loadCustomers();
      }
    },
    goToPage(pageIndex) {
      this.page = pageIndex;
      this.loadCustomers();
    }
  }
};
</script>

<style scoped>
.page-item {
    display: inline-block;
    margin: 0 2px;
}

.page-link {
    padding: 6px 12px;
    border: 1px solid #dee2e6;
    background-color: white;
    color: #007bff;
    border-radius: 4px;
    cursor: pointer;
}

.page-item.disabled .page-link {
    color: #6c757d;
    pointer-events: none;
    background-color: #f8f9fa;
}

.page-item.active .page-link {
    background-color: #007bff;
    color: white;
    border-color: #007bff;
}

.page-link:hover {
    background-color: #e2e6ea;
}
</style>
