<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Plus } from 'lucide-vue-next';
import { useToast } from "vue-toastification"; // Import useToast

// --- Props và Emits ---
const props = defineEmits(['customerSelected', 'close']);

// --- Biến State ---
const khachHangs = ref([]);
const selectedCustomerInPopup = ref(null); // Giữ nguyên ref cho 1 khách hàng được chọn

// Biến cho phân trang (giống ThemSanPhamHoaDon)
const currentPage = ref(0);
const pageSize = ref(5);
const totalPages = ref(0);

// Biến cho tìm kiếm và lọc
const searchQuery = ref('');
const filterGioiTinh = ref(null);

const hienThiFormThemKhachHang = ref(false);
const newKhachHang = ref({
  tenKhachHang: "",
  soDienThoai: "",
  email: "",
  gioiTinh: null,
});

// Validation errors for quick add form
const newKhachHangErrors = ref({
  tenKhachHang: false,
  soDienThoai: false,
  email: false,
  emailExists: false,
  soDienThoaiExists: false,
});

const toast = useToast(); // Initialize toast

// --- Lifecycle Hooks ---
onMounted(() => {
  fetchKhachHangPaginated();
  // Khởi tạo selectedCustomerInPopup nếu có khách hàng được truyền vào từ props
  selectedCustomerInPopup.value = props.currentSelectedCustomer ? { ...props.currentSelectedCustomer } : null;
});

// Watch để cập nhật selectedCustomerInPopup khi currentSelectedCustomer từ props thay đổi
watch(() => props.currentSelectedCustomer, (newVal) => {
  selectedCustomerInPopup.value = newVal ? { ...newVal } : null;
});

// --- Watchers for quick add form validation (client-side for instant feedback) ---
watch(() => newKhachHang.value.email, async (newEmail) => {
  newKhachHangErrors.value.email = false;
  newKhachHangErrors.value.emailExists = false;
  if (newEmail && !validateEmail(newEmail)) {
    newKhachHangErrors.value.email = true;
  } else if (newEmail) {
    // Check for email existence only if format is valid
    try {
      const response = await axios.get(`http://localhost:8080/api/khach-hang/check-email?email=${newEmail}`);
      if (response.data.exists) {
        newKhachHangErrors.value.emailExists = true;
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra trùng email:", err);
      // Don't block form submission for connectivity errors during check
    }
  }
});

watch(() => newKhachHang.value.soDienThoai, async (newPhone) => {
  newKhachHangErrors.value.soDienThoai = false;
  newKhachHangErrors.value.soDienThoaiExists = false;
  if (newPhone && !validatePhone(newPhone)) {
    newKhachHangErrors.value.soDienThoai = true;
  } else if (newPhone) {
    // Check for phone existence only if format is valid
    try {
      const response = await axios.get(`http://localhost:8080/api/khach-hang/check-phone?phone=${newPhone}`);
      if (response.data.exists) {
        newKhachHangErrors.value.soDienThoaiExists = true;
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra trùng số điện thoại:", err);
    }
  }
});


// --- Hàm Fetch Dữ liệu (phân trang kết hợp tìm kiếm và lọc) ---
const fetchKhachHangPaginated = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
    };

    if (searchQuery.value) {
      params.keyword = searchQuery.value;
    }
    if (filterGioiTinh.value !== null && filterGioiTinh.value !== '') {
      params.gioiTinh = filterGioiTinh.value;
    }

    for (const key in params) {
      if (params.hasOwnProperty(key) && (params[key] === null || params[key] === '')) {
        delete params[key];
      }
    }
    console.log("Fetching customers with params:", params);

    const response = await axios.get('http://localhost:8080/api/khach-hang/search-and-filter', { params });
    console.log("Customer API data:", response.data);
    khachHangs.value = response.data.content;
    totalPages.value = response.data.totalPages;

  } catch (error) {
    console.error('Lỗi khi lấy khách hàng:', error);
    toast.error('Lỗi khi tải danh sách khách hàng. Vui lòng kiểm tra console để biết chi tiết.');
  }
};

// --- Hàm Phân Trang (giống ThemSanPhamHoaDon) ---
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchKhachHangPaginated();
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchKhachHangPaginated();
  }
};

// --- Hàm kích hoạt tìm kiếm và lọc khi nhấn nút ---
const handleSearchAndFilter = () => {
  currentPage.value = 0;
  fetchKhachHangPaginated();
};

// --- Hàm xóa bộ lọc ---
const clearFilters = () => {
  searchQuery.value = '';
  filterGioiTinh.value = null;
  currentPage.value = 0;
  fetchKhachHangPaginated();
};

// --- Hàm chọn khách hàng (radio button) ---
const selectCustomer = (khachHang) => {
  selectedCustomerInPopup.value = khachHang;
};

// --- Hàm xác nhận chọn khách hàng ---
const confirmAndSelectCustomer = () => {
  if (selectedCustomerInPopup.value) {
    props('customerSelected', selectedCustomerInPopup.value);
    props('close');
  } else {
    toast.warning('Vui lòng chọn một khách hàng.');
  }
};

// --- Hàm đóng popup tổng thể ---
const closePopup = () => {
  props('close');
};

// --- Logic thêm khách hàng nhanh ---
const openAddCustomerForm = () => {
  hienThiFormThemKhachHang.value = true;
  newKhachHang.value = { tenKhachHang: "", soDienThoai: "", email: "", gioiTinh: null };
  // Reset errors when opening the form
  newKhachHangErrors.value = {
    tenKhachHang: false,
    soDienThoai: false,
    email: false,
    emailExists: false,
    soDienThoaiExists: false,
  };
};

const closeAddCustomerForm = () => {
  hienThiFormThemKhachHang.value = false;
};

// Validation functions
const validatePhone = (phone) => /^(0|\+84)([3|5|7|8|9])[0-9]{8}$/.test(phone);
const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
  return emailRegex.test(email);
};
const isFullName = (name) => {
  const regex = /^[a-zA-Z\u00C0-\u1EF9\s'-]+$/;
  return name && name.trim().length > 0 && regex.test(name);
};


const themKhachHang = async () => {
  let formIsValid = true;

  // Reset errors
  newKhachHangErrors.value = {
    tenKhachHang: false,
    soDienThoai: false,
    email: false,
    emailExists: false,
    soDienThoaiExists: false,
  };

  // Validate tenKhachHang
  if (!newKhachHang.value.tenKhachHang || !isFullName(newKhachHang.value.tenKhachHang)) {
    newKhachHangErrors.value.tenKhachHang = true;
    formIsValid = false;
  }

  // Validate soDienThoai
  if (!newKhachHang.value.soDienThoai) {
    newKhachHangErrors.value.soDienThoai = true;
    formIsValid = false;
  } else if (!validatePhone(newKhachHang.value.soDienThoai)) {
    newKhachHangErrors.value.soDienThoai = true;
    formIsValid = false;
  } else {
    // Check for phone existence
    try {
      const response = await axios.get(`http://localhost:8080/api/khach-hang/check-phone?phone=${newKhachHang.value.soDienThoai}`);
      if (response.data.exists) {
        newKhachHangErrors.value.soDienThoaiExists = true;
        formIsValid = false;
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra trùng số điện thoại (submit):", err);
      // Decide if this error should prevent submission or not
    }
  }

  // Validate email (if provided)
  if (newKhachHang.value.email && !validateEmail(newKhachHang.value.email)) {
    newKhachHangErrors.value.email = true;
    formIsValid = false;
  } else if (newKhachHang.value.email) {
    // Check for email existence
    try {
      const response = await axios.get(`http://localhost:8080/api/khach-hang/check-email?email=${newKhachHang.value.email}`);
      if (response.data.exists) {
        newKhachHangErrors.value.emailExists = true;
        formIsValid = false;
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra trùng email (submit):", err);
    }
  }


  if (!formIsValid) {
    toast.error("Vui lòng kiểm tra lại thông tin khách hàng!");
    return;
  }

  try {
    const payload = {
      tenKhachHang: newKhachHang.value.tenKhachHang,
      soDienThoai: newKhachHang.value.soDienThoai,
      email: newKhachHang.value.email || null, // Send null if empty string
      gioiTinh: newKhachHang.value.gioiTinh,
    };

    const response = await axios.post('http://localhost:8080/api/khach-hang', payload);
    const addedKhachHang = response.data;
    console.log("Khách hàng đã thêm:", addedKhachHang);

    selectedCustomerInPopup.value = addedKhachHang; // Tự động chọn khách hàng vừa thêm
    toast.success("Thêm khách hàng thành công!");
    hienThiFormThemKhachHang.value = false;
    // Re-fetch customer list to include the newly added customer
    fetchKhachHangPaginated();

  } catch (error) {
    console.error("Lỗi khi thêm khách hàng:", error);
    let errorMessage = "Lỗi khi thêm khách hàng. Vui lòng thử lại.";
    if (error.response) {
      const errorData = error.response.data;
      const status = error.response.status;

      if (status === 400) {
        if (typeof errorData === 'string') {
          errorMessage = errorData;
          if (errorData.includes("Email đã tồn tại")) newKhachHangErrors.value.emailExists = true;
          if (errorData.includes("Số điện thoại đã tồn tại")) newKhachHangErrors.value.soDienThoaiExists = true;
        } else if (typeof errorData === 'object' && errorData !== null) {
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Spring Boot @Valid errors
            errorData.errors.forEach(e => {
              if (e.field === 'tenKhachHang') newKhachHangErrors.value.tenKhachHang = true;
              else if (e.field === 'email') newKhachHangErrors.value.email = true;
              else if (e.field === 'soDienThoai') newKhachHangErrors.value.soDienThoai = true;
            });
            errorMessage = "Thông tin không hợp lệ: " + errorData.errors.map(e => e.defaultMessage || e.field).join("; ");
          } else if (Object.keys(errorData).length > 0) {
            // Other object-based errors (e.g., custom exceptions)
            if (errorData.message) errorMessage = errorData.message;
            if (errorData.message && errorData.message.includes("Email đã tồn tại")) newKhachHangErrors.value.emailExists = true;
            if (errorData.message && errorData.message.includes("Số điện thoại đã tồn tại")) newKhachHangErrors.value.soDienThoaiExists = true;
          }
        }
      } else {
        errorMessage = `Lỗi từ máy chủ (${status}): ` + (errorData.message || JSON.stringify(errorData));
      }
    } else if (error.request) {
      errorMessage = "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.";
    } else {
      errorMessage = "Đã xảy ra lỗi trong quá trình gửi yêu cầu.";
    }
    toast.error(errorMessage);
  }
};

</script>

<template>
  <div class="popup-overlay">
    <div class="modal-dialog custom-modal modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chọn khách hàng</h5>
          <button type="button" class="btn-close" @click="closePopup"></button>
        </div>
        <div class="modal-body">
          <div class="filter-section mb-3">
            <div class="row g-2 align-items-end">
              <div class="col-md-6">
                <input
                  type="text"
                  class="form-control" v-model="searchQuery"
                  @keyup.enter="handleSearchAndFilter"
                  placeholder="Tìm theo tên, mã khách hàng, SĐT, email"
                />
              </div>
              <div class="col-md-2">
                <select class="form-select" v-model="filterGioiTinh">
                  <option :value="null">Giới tính</option>
                  <option :value="true">Nam</option>
                  <option :value="false">Nữ</option>
                </select>
                
              </div>
              <div class="col-md-2">
                <button type="button" class="btn btn-primary w-100" @click="handleSearchAndFilter">Tìm kiếm</button>
              </div>
              
              <div class="col-md-2">
                <button type="button" class="btn btn-outline-secondary w-100" @click="clearFilters">Xóa bộ lọc</button>
              </div>
            </div>
          </div>

          <div class="table-responsive" style="max-height: 350px; overflow-y: auto;">
            <table class="table table-striped align-middle">
              <thead>
                <tr>
                  <th style="width: 30px;"></th> <th>STT</th>
                  <th>Mã khách hàng</th>
                  <th>Họ tên</th>
                  <th>Giới tính</th>
                  <th>Ngày sinh</th>
                  <th>Số điện thoại</th>
                  <th>Email</th>
                  </tr>
              </thead>
              <tbody>
                <tr v-if="khachHangs.length === 0">
                  <td colspan="9" class="text-center">Không tìm thấy khách hàng nào.</td>
                </tr>
                <tr v-for="(kh, index) in khachHangs" :key="kh.id || index"
                    @click="selectCustomer(kh)"
                    :class="{'table-info': selectedCustomerInPopup?.id === kh.id}"
                >
                  <td>
                    <input type="radio" :value="kh" v-model="selectedCustomerInPopup" @click.stop/>
                  </td>
                  <td>{{ index + 1 + currentPage * pageSize }}</td>
                  <td>{{ kh.maKhachHang }}</td>
                  <td>{{ kh.tenKhachHang }}</td>
                  <td>{{ kh.gioiTinh ? 'Nam' : 'Nữ' }}</td>
                  <td>{{ kh.ngaySinh ? new Date(kh.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật' }}</td>
                  <td>{{ kh.soDienThoai }}</td>
                  <td>{{ kh.email || 'Chưa cập nhật' }}</td>
                  </tr>
              </tbody>
            </table>
          </div>

          <div class="d-flex justify-content-between align-items-center mt-3">
            <button
              class="btn btn-outline-primary"
              :disabled="currentPage === 0"
              @click="prevPage"
            >
              Trang trước
            </button>
            <span>Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
            <button
              class="btn btn-outline-primary"
              :disabled="currentPage >= totalPages - 1"
              @click="nextPage"
            >
              Trang sau
            </button>
          </div>
        </div>

        <div class="modal-footer d-flex justify-content-between">
          <button @click="openAddCustomerForm" class="btn btn-primary">
              <Plus size="16" class="me-1"/> Thêm khách hàng nhanh
          </button>
          <div>
            <button type="button" class="btn btn-secondary me-2" @click="closePopup">Hủy</button>
            <button type="button" class="btn btn-primary" @click="confirmAndSelectCustomer" :disabled="!selectedCustomerInPopup">Áp dụng</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="hienThiFormThemKhachHang" class="popup-overlay" style="z-index: 10000;">
      <div class="modal-dialog custom-modal modal-dialog-centered" style="max-width: 500px;">
        <div class="modal-content">
          <div class="modal-header">
              <h5 class="modal-title">Thêm khách hàng mới</h5>
              <button type="button" class="btn-close" @click="closeAddCustomerForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="themKhachHang">
              <div class="mb-2">
                <label for="new_tenKhachHang" class="form-label">Tên khách hàng <span class="text-danger">*</span></label>
                <input
  type="text"
  id="new_tenKhachHang"
  v-model="newKhachHang.tenKhachHang"
  class="form-control"
  :class="{'is-invalid': newKhachHangErrors.tenKhachHang}"
/>
                <div v-if="newKhachHangErrors.tenKhachHang" class="invalid-feedback">
                  Tên khách hàng không hợp lệ.
                </div>
              </div>
              <div class="mb-2">
                <label for="new_soDienThoai" class="form-label">Số điện thoại <span class="text-danger">*</span></label>
               <input
  type="text"
  id="new_soDienThoai"
  v-model="newKhachHang.soDienThoai"
  class="form-control"
  :class="{'is-invalid': newKhachHangErrors.soDienThoai || newKhachHangErrors.soDienThoaiExists}"
/>
                <div v-if="newKhachHangErrors.soDienThoai" class="invalid-feedback">
                  Số điện thoại không hợp lệ (ví dụ: 0912345678).
                </div>
                <div v-if="newKhachHangErrors.soDienThoaiExists" class="invalid-feedback">
                  Số điện thoại này đã tồn tại.
                </div>
              </div>
              <div class="mb-2">
                <label for="new_email" class="form-label">Email</label>
                <input
                  type="email"
                  id="new_email"
                  v-model="newKhachHang.email"
                  class="form-control"
                  :class="{'is-invalid': newKhachHangErrors.email || newKhachHangErrors.emailExists}"
                />
                <div v-if="newKhachHangErrors.email" class="invalid-feedback">
                  Email không hợp lệ (chỉ chấp nhận @gmail.com).
                </div>
                <div v-if="newKhachHangErrors.emailExists" class="invalid-feedback">
                  Email này đã tồn tại.
                </div>
              </div>
              <div class="mb-2">
  <label class="form-label">Giới tính</label>
  <div class="gender-options d-flex gap-3"> <label class="radio-label">
      <input type="radio" v-model="newKhachHang.gioiTinh" :value="true" name="gender" class="radio-input"> Nam
    </label>
    <label class="radio-label">
      <input type="radio" v-model="newKhachHang.gioiTinh" :value="false" name="gender" class="radio-input"> Nữ
    </label>
  </div>
</div>
        
              <div class="d-flex justify-content-end gap-2 mt-3">
                <button type="submit" class="btn btn-primary">
                  <Plus size="16" class="me-1"/> Thêm và chọn
                </button>
                <button type="button" class="btn btn-secondary" @click="closeAddCustomerForm">Hủy</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Overlay nền mờ */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6) !important;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Modal chính */
.modal-dialog.custom-modal {
    max-width: 80vw; /* Kích thước khớp với ThemSanPhamHoaDon.vue */
    width: 95%;
    margin: 1.75rem auto;
}

.modal-content {
    background-color: white !important;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    max-height: 90vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  flex-shrink: 0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 500;
}

.modal-body {
  padding: 1.5rem;
  flex-grow: 1;
  overflow-y: auto;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

/* Styles cho phần bộ lọc */
.filter-section h6 {
  font-weight: 600;
  color: #333;
}

.form-control, .form-select {
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    border-radius: 0.25rem;
}

.btn {
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    border-radius: 0.25rem;
}

/* Styles cho bảng */
.table {
  --bs-table-hover-bg: transparent; /* Loại bỏ hover mặc định của Bootstrap */
}
.table th, .table td {
    white-space: nowrap;
    vertical-align: middle;
}
.table th:first-child, .table td:first-child {
    padding-left: 1.5rem;
}
.table th:last-child, .table td:last-child {
    padding-right: 1.5rem;
}

/* Style cho hàng được chọn trong bảng khách hàng (với radio button) */
.table-info {
  background-color: #dbe9f9 !important; /* Màu xanh nhẹ khi được chọn */
}

/* Màu sắc nút chính */
.btn-primary {
  background-color: #0a2c57;
  border-color: #0a2c57;
}
.btn-primary:hover {
  background-color: #08244a;
  border-color: #08244a;
}

/* Invalid feedback style */
.is-invalid {
  border-color: #dc3545 !important;
}
.invalid-feedback {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}

.is-invalid {
  border-color: #dc3545 !important;
}
.invalid-feedback {
  display: block; /* Important for showing the message */
  width: 100%;
  margin-top: 0.25rem;
  font-size: 0.875em;
  color: #dc3545;
}
</style>