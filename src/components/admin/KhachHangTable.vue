<template>
  <table class="table table-hover">
    <thead class="table-light">
      <tr>
        <th>STT</th>
        <th>Mã khách hàng</th>
        <th>Họ tên</th>
        <th>Giới tính</th>
        <th>Ngày sinh</th>
        <th>Số điện thoại</th>
        <th>Email</th>
        <!-- <th>Số đơn đã mua</th>
        <th>Tổng chi tiêu</th> -->
        <th>Trạng thái</th>
        <th>Hành động</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(kh, index) in khachHangs" :key="index">
        <td>{{ index + 1 + page * size }}</td>
        <td>{{ kh.maKhachHang }}</td>
        <td>{{ kh.tenKhachHang }}</td>
        <td>{{ kh.gioiTinh === null ? '' : (kh.gioiTinh ? 'Nam' : 'Nữ') }}</td>
        <td>{{ kh.ngaySinh ? new Date(kh.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật' }}</td>
        <td>{{ kh.soDienThoai }}</td>
        <td>{{ kh.email || 'Chưa cập nhật' }}</td>
        <!-- <td>{{ kh.soHoaDonDaMua || 0 }}</td>
        <td>{{ kh.tongTien ? formatCurrency(kh.tongTien) : '0' }}</td> -->
        <td>
          <span :class="['status-badge', kh.trangThai === 1 ? 'active' : 'inactive']">
            {{ kh.trangThai === 1 ? 'Đang hoạt động' : 'Dừng hoạt động' }}
          </span>
        </td>
        <td>
          <button class="btn btn-view-update mr-2" @click="navigateToEditCustomer(kh.id)">
            <Edit style="color: #4ccc7a;" />
          </button>
          <button class="btn btn-view-update mr-2" @click="$emit('delete-customer', kh.id)">
            <Trash style="color: #CC0000;" />
          </button>
        </td>
      </tr>
    </tbody>
  </table>
  <div class="mt-4 d-flex align-items-center justify-content-center gap-2">
  <button 
    class="btn custom-btn" 
    @click="prevPage" 
    :disabled="page === 0">
    Trước
  </button>
  <input 
    v-model.number="inputPage" 
    @keyup.enter="goToPage" 
    type="number" 
    min="1" 
    :max="totalPages"
    class="form-control w-auto text-center" />
  <span>/ {{ totalPages }}</span>
  <button 
    class="btn custom-btn" 
    @click="nextPage" 
    :disabled="page >= totalPages - 1">
    Tiếp
  </button>
</div>

</template>


<script>
import axios from "axios";
// import AddressModal from "../admin/AddressModal.vue"; // Có thể bỏ nếu AddressModal không được dùng trực tiếp ở đây nữa
import { Edit, Trash } from 'lucide-vue-next';
import { useRouter } from 'vue-router';
import { useToast } from "vue-toastification"; // Import useToast
import Cookies from 'js-cookie'

const token = Cookies.get('token')

export default {
  name: "KhachHangTable",
  components: { Edit, Trash /*, AddressModal */ }, // Bỏ AddressModal nếu không dùng
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    filterData: {
      type: Object,
      default: () => ({})
    },
    reload: {
      type: Boolean,
      default: false
    },
  },
  setup() {
    const router = useRouter();
    const toast = useToast(); // Khởi tạo toast


    const navigateToEditCustomer = (customerId) => {
      router.push({ name: 'EditKhachHang', params: { id: customerId } });
    };


    // Hàm showToastMessage mới dùng useToast (như trong AddKhachHang)
    const showToastMessage = (message, type = "success") => {
      if (type === "success") {
        toast.success(message);
      } else if (type === "error") {
        toast.error(message);
      } else if (type === "info") {
        toast.info(message);
      } else if (type === "warning") {
        toast.warning(message);
      }
    };


    return { navigateToEditCustomer, showToastMessage }; // Trả về showToastMessage
  },
  mounted() {
    this.fetchKhachHang();
  },
  emits: ['delete-customer'],
  data() {
    return {
      khachHangs: [],
      page: 0,
      size: 10,
      totalPages: 1,
      inputPage: 1,
      // toastList: [], // THỪA: Đã chuyển sang dùng useToast
      // form: { ... } // THỪA: Form này chỉ dùng trong modal chỉnh sửa khách hàng cũ, không dùng cho bảng
      // addresses: [], // THỪA: Dữ liệu địa chỉ giờ được quản lý trong AddressModal hoặc trang EditKhachHang
      // showAddressModal: false, // THỪA: Logic modal địa chỉ đã chuyển sang AddressModal và trang EditKhachHang
      // selectedAddressForEdit: null, // THỪA: Logic modal địa chỉ đã chuyển
      // isAddingAddress: false, // THỪA
      // isEditingAddress: false, // THỪA
      // showAddressSection: false, // THỪA
      // showEditAddressSection: false, // THỪA: Đây là biến nội bộ của modal khách hàng cũ
      // tinhThanhList: [], // THỪA: Dùng trong modal địa chỉ, không dùng ở bảng
      // quanHuyenList: [], // THỪA
      // xaPhuongList: [], // THỪA
      // selectedTinh: null, // THỪA
      // selectedQuan: null, // THỪA
      // selectedXa: null, // THỪA
      // newAddress: { ... }, // THỪA
    };
  },
  watch: {
    searchQuery: {
      immediate: true,
      handler() {
        this.page = 0;
        this.fetchKhachHang();
      }
    },
    reload(newVal) {
      if (newVal) {
        this.fetchKhachHang();
      }
    },
    filterData: {
      deep: true,
      immediate: true,
      handler() {
        this.page = 0;
        this.fetchKhachHang();
      }
    }
  },
  methods: {
    fetchKhachHang() {
      const params = {
        page: this.page,
        size: this.size,
        keyword: this.searchQuery,
        ...this.filterData
      };


      axios.get('/api/khach-hang/search-and-filter', {
      params ,
      headers: {
      Authorization: `Bearer ${token}`
    }
  
      })
        .then(response => {
          console.log(response.data);
          this.khachHangs = response.data.content;
          this.totalPages = response.data.totalPages;
        })
        .catch(error => {
          console.error('Lỗi khi lấy khách hàng:', error);
          this.showToastMessage("Lỗi khi tải danh sách khách hàng.", "error"); // Sử dụng showToastMessage
        });
    },
    prevPage() {
      if (this.page > 0) {
        this.page--;
        this.inputPage = this.page + 1;
        this.fetchKhachHang();
      }
    },
    nextPage() {
      if (this.page < this.totalPages - 1) {
        this.page++;
        this.inputPage = this.page + 1;
        this.fetchKhachHang();
      }
    },
    goToPage() {
      if (this.inputPage >= 1 && this.inputPage <= this.totalPages) {
        this.page = this.inputPage - 1;
        this.fetchKhachHang();
      }
    },
    // Các hàm liên quan đến modal chỉnh sửa khách hàng cũ và địa chỉ đã bị loại bỏ:
    // openEditModal, closeModal, handleSubmit, setDefaultAddress, addAddressToPopup,
    // editAddressInPopup, deleteAddress, fetchAddresses, handleAddressSaved,
    // openAddressModal, closeAddressModal, loadTinhThanh, loadQuanHuyen, loadXaPhuong


    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN").format(val);
    },
  }
};
</script>


<style scoped>
/* Các kiểu CSS cho bảng khách hàng và phân trang */
.table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}


.table th,
.table td {
  padding: 0.75rem;
  vertical-align: top;
  border-top: 1px solid #dee2e6;
}

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

.table th {
  text-align: left;
  font-weight: 600;
  background-color: #f8f9fa;
}


.table-hover tbody tr:hover {
  background-color: #f5f5f5;
}


.table-light thead {
  background-color: #f8f9fa;
}


.badge {
  display: inline-block;
  padding: 0.35em 0.65em;
  font-size: 0.75em;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}


.badge-success {
  background-color: #28a745 !important;
}


.badge-danger {
  background-color: #dc3545 !important;
}


.btn-view-update {
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}


.btn-view-update:hover {
  opacity: 0.8;
}


.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}


.btn-secondary {
  background-color: #6c757d;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
}


.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}


.form-control.w-auto {
  width: auto;
  max-width: 80px;
  text-align: center;
}


.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}


/* Các style cho badge (giữ lại vì đang dùng trong bảng) */
.badge-success {
  background-color: #28a745 !important;
}


.badge-danger {
  background-color: #dc3545 !important;
}

/* THÊM KIỂU MỚI CHO ẢNH ĐẠI DIỆN */
.avatar-container {
  width: 50px;
  /* Kích thước container */
  height: 50px;
  overflow: hidden;
  /* Cắt bỏ phần thừa */
  border-radius: 50%;
  /* Bo tròn container */
  display: flex;
  /* Căn giữa ảnh */
  justify-content: center;
  align-items: center;
  border: 1px solid #eee;
  /* Đường viền nhẹ */
}


.customer-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Đảm bảo ảnh đầy đủ trong container mà không bị méo */
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
</style>



