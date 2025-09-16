<template>
  <div class="full-width-container">
    <div class="d-flex align-items-center justify-content-between bg-white p-3 rounded mb-3 border">
      <h2 class="fw-bold mb-0">Quản lý phiếu giảm giá</h2>
      <router-link to="/phieu-giam-gia/them" class="btn"
     style="background-color: #0a2c57; color: white">
     <Plus class="me-1" size="16" />Thêm phiếu giảm giá
</router-link>
    </div>

    <div class="bg-white p-3 rounded mb-3 border">
      <h5 class="d-flex align-items-center gap-2 mb-3">
        <FilterIcon size="20" /> Bộ lọc
      </h5>
      <div class="px-3">
        <input v-model="keyword" type="text" class="form-control mb-3" placeholder="Tìm kiếm theo mã, tên" />
        <div class="d-flex flex-wrap gap-3">
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Trạng thái</label>
            <select v-model="trangThai" class="form-select">
              <option value="">Tất cả</option>
              <option value="0">Đã hủy</option>
              <option value="1">Đang diễn ra</option>
              <option value="2">Chưa diễn ra</option>
              <option value="3">Đã kết thúc</option>
            </select>
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Loại phiếu giảm giá</label>
            <select v-model="loaiPhieu" class="form-select">
              <option value="">Tất cả</option>
              <option value="Công khai">Công khai</option>
              <option value="Cá nhân">Cá nhân</option>
            </select>
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Ngày bắt đầu</label>
            <input type="date" v-model="ngayBatDau" class="form-control" />
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Ngày kết thúc</label>
            <input type="date" v-model="ngayKetThuc" class="form-control" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-3 rounded border mb-4">
      <h5 class="text-start ps-3 pt-3">Danh sách phiếu giảm giá</h5>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th scope="col">STT</th>
              <th scope="col">Mã</th>
              <th scope="col">Tên</th>
              <th scope="col">Giá trị giảm</th>
              <th scope="col">Loại</th>
              <th scope="col">Giảm tối thiểu</th>
              <th scope="col">Giảm tối đa</th>
              <th scope="col">Số lượng</th>
              <th scope="col">Ngày bắt đầu</th>
              <th scope="col">Ngày kết thúc</th>
              <th scope="col">Trạng thái</th>
              <th scope="col">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(phieu, index) in paginatedPhieuGiamGias" :key="phieu.id">
              <td>{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
              <td>{{ phieu.maPhieuGiamGia }}</td>
              <td>{{ phieu.tenPhieu }}</td>
              <td>
                {{
                  phieu.phamTramGiamGia
                    ? phieu.phamTramGiamGia + "%"
                    : formatCurrency(phieu.soTienGiam)
                }}
              </td>
              <td>
                <span :class="getLoaiPhieuClass(phieu.loaiPhieu)">{{ phieu.loaiPhieu }}</span>
              </td>
              <td>{{ formatCurrency(phieu.giamToiThieu) }}</td>
              <td>{{ formatCurrency(phieu.giamToiDa) }}</td>
              <td>{{ phieu.soLuong ?? "N/A" }}</td>
              <td>{{ formatDate(phieu.ngayBatDau) }}</td>
              <td>{{ formatDate(phieu.ngayKetThuc) }}</td>
              <td>
                <span :class="['status-badge', getTrangThaiClass(phieu.trangThai)]">
                  {{ getTrangThaiText(phieu.trangThai) }}
                </span>
              </td>
              <td class="d-flex align-items-center justify-content-center gap-2">
                <router-link :to="{ name: 'SuaPhieuGiamGia', params: { id: phieu.id } }" class="btn btn-flat btn-sm"
                  title="Chỉnh sửa phiếu giảm giá" data-bs-toggle="tooltip" data-bs-placement="top">
                  <Edit style="color: #4ccc7a;" />
                </router-link>
                <div v-if="isSwitchVisible(phieu.ngayKetThuc)" class="form-check form-switch"
                  :title="phieu.trangThai === 0 ? 'Kích hoạt lại phiếu giảm giá' : 'Hủy phiếu giảm giá'"
                  data-bs-toggle="tooltip" data-bs-placement="top">
                  <input class="form-check-input" type="checkbox" :id="'switchCheckbox-' + phieu.id"
                    v-model="phieu.isChecked" @change="toggleStatus(phieu)" :disabled="phieu.loading" />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="mt-4 d-flex align-items-center justify-content-center gap-2">
        <button class="btn custom-btn" @click="prevPage" :disabled="currentPage === 1">Trước</button>
        <input v-model.number="inputPage" @keyup.enter="goToPage" type="number" min="1" :max="totalPages"
          class="form-control w-auto text-center" />
        <span>/ {{ totalPages }}</span>
        <button class="btn custom-btn" @click="nextPage" :disabled="currentPage >= totalPages">Tiếp</button>
      </div>
    </div>
  </div>
</template>

<script>
import { FilterIcon, Edit, Plus} from "lucide-vue-next";
import { useToast } from "vue-toastification";
import * as bootstrap from "bootstrap";
import Swal from "sweetalert2";
import Cookies from 'js-cookie'

export default {
  name: "PhieuGiamGia",
  components: {
    FilterIcon,
    Edit,
    Plus
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      token: Cookies.get('token'),
      phieuGiamGias: [],
      allPhieuGiamGias: [],
      currentPage: 1,
      itemsPerPage: 5,
      inputPage: 1, // Thêm biến inputPage
      keyword: "",
      ngayBatDau: "",
      ngayKetThuc: "",
      trangThai: "",
      loaiPhieu: "",
      pollingInterval: null,
    };
  },
  computed: {
    paginatedPhieuGiamGias() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredPhieuGiamGias.slice(start, end);
    },
    filteredPhieuGiamGias() {
      let filtered = this.allPhieuGiamGias;

      if (this.keyword) {
        const keywordLower = this.keyword.toLowerCase();
        filtered = filtered.filter(
          (phieu) =>
            phieu.maPhieuGiamGia.toLowerCase().includes(keywordLower) ||
            phieu.tenPhieu.toLowerCase().includes(keywordLower) ||
            (phieu.phamTramGiamGia &&
              phieu.phamTramGiamGia.toString().includes(keywordLower)) ||
            (phieu.soTienGiam &&
              phieu.soTienGiam.toString().includes(keywordLower)) ||
            (phieu.soLuong &&
              phieu.soLuong.toString().includes(keywordLower)) ||
            (phieu.giamToiThieu &&
              phieu.giamToiThieu.toString().includes(keywordLower)) ||
            (phieu.giamToiDa &&
              phieu.giamToiDa.toString().includes(keywordLower))
        );
      }

      if (this.ngayBatDau) {
        filtered = filtered.filter(
          (phieu) => new Date(phieu.ngayBatDau) >= new Date(this.ngayBatDau)
        );
      }

      if (this.ngayKetThuc) {
        filtered = filtered.filter(
          (phieu) => new Date(phieu.ngayKetThuc) <= new Date(this.ngayKetThuc)
        );
      }

      if (this.trangThai !== "") {
        filtered = filtered.filter(
          (phieu) => phieu.trangThai === parseInt(this.trangThai)
        );
      }

      if (this.loaiPhieu) {
        filtered = filtered.filter(
          (phieu) => phieu.loaiPhieu === this.loaiPhieu
        );
      }

      return filtered;
    },
    totalPages() {
      return Math.ceil(this.filteredPhieuGiamGias.length / this.itemsPerPage);
    },
  },
  methods: {
    async getPhieuGiamGias() {
      try {
        const response = await fetch("http://localhost:8080/phieuGiamGias", {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        if (!response.ok) {
          throw new Error("Không thể tải danh sách phiếu giảm giá");
        }
        const data = await response.json();
        this.allPhieuGiamGias = data.map((phieu) => ({
          ...phieu,
          isChecked: phieu.trangThai !== 0, // Switch ON if not "Đã hủy"
          loading: false, // Initialize loading state
        }));
        this.phieuGiamGias = [...this.allPhieuGiamGias];
        this.applyFilter(); // Cập nhật lại danh sách khi tải dữ liệu
      } catch (err) {
        console.error("Lỗi khi lấy danh sách phiếu giảm giá:", err);
        this.toast.error("Không thể tải danh sách phiếu giảm giá: " + err.message);
      }
    },
    startPolling() {
      this.pollingInterval = setInterval(() => {
        this.getPhieuGiamGias();
      }, 60000); // Refresh every 60 seconds
    },
    stopPolling() {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    },
    applyFilter() {
      this.currentPage = 1;
      this.inputPage = 1; // Reset input page on filter change
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
    prevPage() {
      if (this.currentPage > 1) {
        this.currentPage--;
      }
    },
    nextPage() {
      if (this.currentPage < this.totalPages) {
        this.currentPage++;
      }
    },
    goToPage() {
      if (this.inputPage >= 1 && this.inputPage <= this.totalPages) {
        this.currentPage = this.inputPage;
      } else {
        this.toast.error("Số trang không hợp lệ!");
      }
    },
    formatCurrency(val) {
      return val ? val.toLocaleString("vi-VN") + " VNĐ" : "";
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString("vi-VN") : "";
    },
    getTrangThaiText(trangThai) {
      switch (trangThai) {
        case 0:
          return "Đã hủy";
        case 1:
          return "Đang diễn ra";
        case 2:
          return "Chưa diễn ra";
        case 3:
          return "Đã kết thúc";
        default:
          return "Không xác định";
      }
    },
    getTrangThaiClass(trangThai) {
      switch (trangThai) {
        case 0: // Đã hủy
          return "cancelled";
        case 1: // Đang diễn ra
          return "confirmed";
        case 2: // Chưa diễn ra
          return "shipping";
        case 3: // Đã kết thúc
          return "completed";
        default:
          return "inactive";
      }
    },
    getLoaiPhieuClass(loaiPhieu) {
      // Bạn có thể định nghĩa các class riêng cho loại phiếu nếu cần
      return "badge bg-secondary";
    },
    isSwitchVisible(ngayKetThuc) {
      const currentDate = new Date('2025-07-01T23:48:00+07:00');
      return new Date(ngayKetThuc) >= currentDate;
    },
    calculateStatus(ngayBatDau, ngayKetThuc) {
      const now = new Date('2025-07-01T23:48:00+07:00');
      const start = new Date(ngayBatDau);
      const end = new Date(ngayKetThuc);
      if (now < start) {
        return 2; // Chưa diễn ra
      } else if (now > end) {
        return 3; // Đã kết thúc
      } else {
        return 1; // Đang diễn ra
      }
    },
    async toggleStatus(phieu) {
      const originalStatus = phieu.isChecked; // Store original state
      const actionText = phieu.isChecked
        ? "Kích hoạt lại phiếu giảm giá"
        : "Hủy phiếu giảm giá";
      const successMessage = phieu.isChecked
        ? "Kích hoạt lại phiếu giảm giá thành công"
        : "Hủy phiếu giảm giá thành công";
      const loadingMessage = phieu.isChecked
        ? "Đang kích hoạt lại phiếu giảm giá và gửi email..."
        : "Đang hủy phiếu giảm giá và gửi email...";

      const result = await Swal.fire({
        title: "Xác nhận",
        text: `Bạn có muốn ${actionText} không?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Đồng ý",
        cancelButtonText: "Hủy",
        buttonsStyling: true,
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger me-2'
        }
      });

      if (!result.isConfirmed) {
        phieu.isChecked = !phieu.isChecked; // Revert switch state
        return;
      }

      // Set loading state and show toast
      phieu.loading = true;
      const toastId = this.toast.info(loadingMessage, {
        timeout: false, // Keep toast until manually dismissed
        icon: '<div class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></div>',
      });

      try {
        const newStatus = phieu.isChecked ? this.calculateStatus(phieu.ngayBatDau, phieu.ngayKetThuc) : 0;
        const response = await fetch(`http://localhost:8080/phieuGiamGias/${phieu.id}/status`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${this.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ trangThai: newStatus }),
        });
        const responseData = await response.json();
        if (response.ok) {
          this.toast.dismiss(toastId); // Dismiss loading toast
          this.toast.success(successMessage);
          phieu.trangThai = newStatus;
        } else {
          this.toast.dismiss(toastId); // Dismiss loading toast
          this.toast.error(`Có lỗi xảy ra: ${responseData.message}`);
          phieu.isChecked = !phieu.isChecked; // Revert switch state
        }
      } catch (err) {
        console.error("Lỗi khi cập nhật trạng thái phiếu giảm giá:", err);
        this.toast.dismiss(toastId); // Dismiss loading toast
        this.toast.error("Có lỗi xảy ra: " + err.message);
        phieu.isChecked = !phieu.isChecked; // Revert switch state
      } finally {
        phieu.loading = false; // Clear loading state
      }
    },
  },
  watch: {
    // Watch for changes in filter inputs and apply filter
    keyword() { this.applyFilter() },
    ngayBatDau() { this.applyFilter() },
    ngayKetThuc() { this.applyFilter() },
    trangThai() { this.applyFilter() },
    loaiPhieu() { this.applyFilter() },
    // Watch for page changes from input and go to that page
    inputPage(newPage) {
      if (newPage !== this.currentPage) {
        this.goToPage();
      }
    },
    currentPage(newPage) {
      this.inputPage = newPage;
    }
  },
  mounted() {
    this.getPhieuGiamGias();
    this.startPolling();
    this.$nextTick(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });
    });
  },
  beforeDestroy() {
    this.stopPolling();
  },
};
</script>

<style scoped>
/* Các kiểu chung */
h2,
h5 {
  font-weight: bold;
  color: #0a2c57;
}

.table th,
.table td {
  vertical-align: middle;
  text-align: center;
}

/* Kiểu cho phân trang mới */
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

/* Các trạng thái mới */
.status-badge.cancelled {
  background-color: #fce4ec;
  color: #d32f2f;
}

.status-badge.confirmed {
  background-color: #e7f4e8;
  color: #388e3c;
}

.status-badge.shipping {
  background-color: #fff3e0;
  color: #fb8c00;
}

.status-badge.completed {
  background-color: #f1f8e9;
  color: #8bc34a;
}

.bg-danger-subtle {
  background-color: #f8d7da !important;
}

.text-danger-emphasis {
  color: #842029 !important;
}

.bg-success-subtle {
  background-color: #d1e7dd !important;
}

.text-success-emphasis {
  color: #0f5132 !important;
}

.bg-secondary-subtle {
  background-color: #e2e3e5 !important;
}

.text-secondary-emphasis {
  color: #41464b !important;
}

.bg-warning-subtle {
  background-color: #fff3cd !important;
}

.text-warning-emphasis {
  color: #664d03 !important;
}

.badge {
  font-size: 0.85rem;
}
</style>