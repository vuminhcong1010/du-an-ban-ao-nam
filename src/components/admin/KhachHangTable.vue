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
            <th>SDT</th>
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
            <td>{{ kh.gioiTinh ? "Nam" : "Nữ" }}</td>
            <td>
              {{
                kh.ngaySinh
                  ? new Date(kh.ngaySinh).toLocaleDateString("vi-VN")
                  : "Chưa cập nhật"
              }}
            </td>
            <td>{{ kh.soDienThoai }}</td>
            <td>{{ kh.email || "Chưa cập nhật" }}</td>
            <td>{{ kh.soHoaDonDaMua || 0 }}</td>
            <td>{{ kh.tongTien ? formatCurrency(kh.tongTien) : "0" }}</td>
            <td>
              <span
                :class="{
                  'badge badge-success': kh.trangThai === 1,
                  'badge badge-danger': kh.trangThai === 0,
                }"
              >
                {{ kh.trangThai === 1 ? "Đang hoạt động" : "Dừng hoạt động" }}
              </span>
            </td>
            <td>
              <button
                class="btn btn-view-update mr-2"
                @click="navigateToEditCustomer(kh.id)"
              >
                <Edit style="color: #66ff99" />
              </button>
              <button
                class="btn btn-view-update mr-2"
                @click="confirmDeleteCustomer(kh.id)"
              >
                <Trash style="color: #cc0000" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- phân trang -->

  <nav class="mt-4">
  <ul class="pagination justify-content-center">
    <!-- Nút quay về -->
    <li class="page-item" :class="{ disabled: page === 0 }">
      <a class="page-link" href="#" @click.prevent="prevPage">«</a>
    </li>

    <!-- Danh sách số trang -->
    <li
      class="page-item"
      v-for="p in totalPages"
      :key="p"
      :class="{ active: p - 1 === page }"
    >
      <a class="page-link" href="#" @click.prevent="goToPage(p - 1)">{{ p }}</a>
    </li>

    <!-- Nút tiếp theo -->
    <li class="page-item" :class="{ disabled: page >= totalPages - 1 }">
      <a class="page-link" href="#" @click.prevent="nextPage">»</a>
    </li>
  </ul>

  <!-- Input nhập trang -->
  <!-- <div class="d-flex justify-content-center mt-2">
    <input
      v-model.number="inputPage"
      @keyup.enter="goToPage(inputPage - 1)"
      type="number"
      min="1"
      :max="totalPages"
      class="form-control w-auto text-center"
      style="width: 70px;"
    />
    <span class="ms-2">/ {{ totalPages }}</span>
  </div> -->
</nav>
</template>

<script>
import axios from "axios";
// import AddressModal from "../admin/AddressModal.vue"; // Có thể bỏ nếu AddressModal không được dùng trực tiếp ở đây nữa
import { Edit, Trash } from "lucide-vue-next";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification"; // Import useToast

export default {
  name: "KhachHangTable",
  components: { Edit, Trash /*, AddressModal */ }, // Bỏ AddressModal nếu không dùng
  props: {
    searchQuery: {
      type: String,
      default: "",
    },
    filterData: {
      type: Object,
      default: () => ({}),
    },
    reload: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const router = useRouter();
    const toast = useToast(); // Khởi tạo toast

    const navigateToEditCustomer = (customerId) => {
      router.push({ name: "EditKhachHang", params: { id: customerId } });
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
      },
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
      },
    },
  },
  methods: {
    fetchKhachHang() {
      const params = {
        page: this.page,
        size: this.size,
        keyword: this.searchQuery,
        ...this.filterData,
      };

      axios
        .get("/api/khach-hang/search-and-filter", { params })
        .then((response) => {
          console.log(response.data);
          this.khachHangs = response.data.content;
          this.totalPages = response.data.totalPages;
        })
        .catch((error) => {
          console.error("Lỗi khi lấy khách hàng:", error);
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

    confirmDeleteCustomer(customerId) {
      if (confirm("Bạn có chắc chắn muốn xóa khách hàng này không?")) {
        // Logic xóa khách hàng sẽ được thực hiện ở đây.
        // Hiện tại chỉ là thông báo "Chức năng xóa khách hàng chưa được triển khai!"
        this.showToastMessage(
          "Chức năng xóa khách hàng chưa được triển khai!",
          "info"
        );
        // Sau khi xóa thành công, gọi lại fetchKhachHang()
        // this.fetchKhachHang();
      }
    },
    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN").format(val);
    },
  },
};
</script>

<style scoped>
/* Các kiểu CSS cho bảng khách hàng và phân trang */
/* .table {
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
} */

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

/* Loại bỏ các styles liên quan đến modal cũ và địa chỉ */
/* .modal-backdrop, .modal-box, .modal-header, .modal-footer, .modal-body, .modal-close,
.gender-row, .gender-group, .address-section, .address-content, .default-label,
.address-checkbox, .address-actions, .btn-edit, .btn-delete,
.toast-container, .toast-notification, .toast-notification.success, .toast-notification.error,
@keyframes slideInOut, .grid, .grid-cols-2, .space-y-4, .popup-actions,
.btn-clear-filter, .address-list, .address-item, .address-wrapper */

/* Nếu bạn đã chuyển sang dùng vue-toastification, thì không cần các style .toast-container và .toast-notification nữa. */
/* Tôi sẽ giữ lại một số style cơ bản của button nếu chúng được dùng chung. */

/* Các kiểu CSS cho button (có thể giữ lại nếu dùng chung) */
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
</style>
