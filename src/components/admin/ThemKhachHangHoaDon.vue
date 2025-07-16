<script setup>

import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { useToast } from "vue-toastification";

// --- Props và Emits ---
const props = defineEmits(["customerSelected", "close"]);

// --- Biến State ---
const khachHangs = ref([]);
const selectedCustomerInPopup = ref(null);

// Phân trang

const currentPage = ref(0);
const pageSize = ref(5);
const totalPages = ref(0);


// Tìm kiếm và lọc
const searchQuery = ref("");
const filterGioiTinh = ref(null);

const toast = useToast();

// --- Lifecycle ---
onMounted(() => {
  fetchKhachHangPaginated();
  selectedCustomerInPopup.value = props.currentSelectedCustomer
    ? { ...props.currentSelectedCustomer }
    : null;
});

watch(
  () => props.currentSelectedCustomer,
  (newVal) => {
    selectedCustomerInPopup.value = newVal ? { ...newVal } : null;
  }
);

// --- Fetch Khách Hàng ---

const fetchKhachHangPaginated = async () => {
  try {
    const params = {
      page: currentPage.value,
      size: pageSize.value,
    };

    if (searchQuery.value) {
      params.keyword = searchQuery.value;
    }
    if (filterGioiTinh.value !== null && filterGioiTinh.value !== "") {
      params.gioiTinh = filterGioiTinh.value;
    }

    // Xóa params rỗng
    for (const key in params) {
      if (
        params.hasOwnProperty(key) &&
        (params[key] === null || params[key] === "")
      ) {
        delete params[key];
      }
    }

    const response = await axios.get(
      "http://localhost:8080/api/khach-hang/search-and-filter",
      { params }
    );
    khachHangs.value = response.data.content;
    totalPages.value = response.data.totalPages;
  } catch (error) {
    console.error("Lỗi khi lấy khách hàng:", error);
    toast.error("Không thể tải danh sách khách hàng.");
  }
};

// --- Phân trang ---

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


// --- Tìm kiếm và lọc ---

const handleSearchAndFilter = () => {
  currentPage.value = 0;
  fetchKhachHangPaginated();
};


const clearFilters = () => {
  searchQuery.value = "";

  filterGioiTinh.value = null;
  currentPage.value = 0;
  fetchKhachHangPaginated();
};


// --- Chọn khách hàng ---

const selectCustomer = (khachHang) => {
  selectedCustomerInPopup.value = khachHang;
};
const confirmAndSelectCustomer = () => {
  if (selectedCustomerInPopup.value) {
    props("customerSelected", selectedCustomerInPopup.value);
    props("close");
  } else {
    toast.warning("Vui lòng chọn một khách hàng.");
  }
};

// --- Đóng popup ---
const closePopup = () => {
  props("close");
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
                  class="form-control"
                  v-model="searchQuery"

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
                <button
                  type="button"
                  class="btn btn-primary w-100"
                  @click="handleSearchAndFilter"
                >
                  Tìm kiếm
                </button>
              </div>
              <div class="col-md-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary w-100"
                  @click="clearFilters"
                >
                  Xóa bộ lọc
                </button>
              </div>
            </div>
          </div>
          <div
            class="table-responsive"
            style="max-height: 350px; overflow-y: auto"
          >
            <table class="table table-striped align-middle">
              <thead>
                <tr>
                  <th style="width: 30px"></th>
                  <th>STT</th>
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
                  <td colspan="9" class="text-center">
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
                <tr
                  v-for="(kh, index) in khachHangs"
                  :key="kh.id || index"
                  @click="selectCustomer(kh)"
                  :class="{
                    'table-info': selectedCustomerInPopup?.id === kh.id,
                  }"
                >
                  <td>
                    <input
                      type="radio"
                      :value="kh"
                      v-model="selectedCustomerInPopup"
                      @click.stop
                    />
                  </td>
                  <td>{{ index + 1 + currentPage * pageSize }}</td>
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
        <div class="modal-footer d-flex justify-content-end">
          <button
            type="button"
            class="btn btn-secondary me-2"
            @click="closePopup"
          >
            Hủy
          </button>
          <button
            type="button"
            class="btn btn-primary"
            @click="confirmAndSelectCustomer"
            :disabled="!selectedCustomerInPopup"
          >
            Áp dụng
          </button>

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
.form-control,
.form-select {
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
.table th,
.table td {
  white-space: nowrap;
  vertical-align: middle;
}
.table th:first-child,
.table td:first-child {
  padding-left: 1.5rem;
}
.table th:last-child,
.table td:last-child {
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

