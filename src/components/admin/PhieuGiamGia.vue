<template>
  <div class="">
    <div class="bg-white p-3 rounded border mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0">Quản lý phiếu giảm giá</h5>
        <router-link to="/phieu-giam-gia/them" class="btn btn-primary btn-sm">
          <i class="fa-solid fa-plus me-2"></i><span class="fw-bold">Thêm phiếu giảm giá</span>
        </router-link>
      </div>
    </div>
    <!-- Voucher List Section -->
    <div class="bg-white p-3 rounded border mb-4">
      <!-- Filter Section -->
      <div class="card-body">
        <h6 style="margin-bottom: 1em">
          <i><FilterIcon></FilterIcon></i> Bộ lọc
        </h6>
        <div class="row g-3 align-items-end">
          <!-- Keyword Search -->
          <div class="col-md-6">
            <label class="form-label">Tìm kiếm</label>
            <input v-model="keyword" @keyup.enter="applyFilter" type="text" class="form-control"
              placeholder="Nhập tên, mã hoặc giá trị giảm" />
          </div>
          <!-- Status -->
          <div class="col-md-6">
            <label class="form-label">Trạng thái</label>
            <select v-model="trangThai" class="form-select">
              <option value="">Tất cả</option>
              <option value="0">Đã hủy</option>
              <option value="1">Đang diễn ra</option>
              <option value="2">Chưa diễn ra</option>
              <option value="3">Đã kết thúc</option>
            </select>
          </div>
        </div>
        <div class="row g-3 align-items-end mt-2">
          <!-- Start Date -->
          <div class="col-md-4">
            <label class="form-label">Ngày bắt đầu</label>
            <input type="date" v-model="ngayBatDau" class="form-control" />
          </div>
          <!-- End Date -->
          <div class="col-md-4">
            <label class="form-label">Ngày kết thúc</label>
            <input type="date" v-model="ngayKetThuc" class="form-control" />
          </div>
          <!-- Voucher Type -->
          <div class="col-md-4">
            <label class="form-label">Loại phiếu giảm giá</label>
            <div class="d-flex gap-2">
              <div class="form-check">
                <input type="radio" v-model="loaiPhieu" value="" id="loaiTatCa" class="form-check-input" />
                <label class="form-check-label" for="loaiTatCa">Tất cả</label>
              </div>
              <div class="form-check">
                <input type="radio" v-model="loaiPhieu" value="Công khai" id="loaiCongKhai" class="form-check-input" />
                <label class="form-check-label" for="loaiCongKhai">Công khai</label>
              </div>
              <div class="form-check">
                <input type="radio" v-model="loaiPhieu" value="Cá nhân" id="loaiCaNhan" class="form-check-input" />
                <label class="form-check-label" for="loaiCaNhan">Cá nhân</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br><br>
      <div class="card-body">
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
                  <span :class="getLoaiPhieuClass(phieu.loaiPhieu)">{{
                    phieu.loaiPhieu
                  }}</span>
                </td>
                <td>{{ formatCurrency(phieu.giamToiThieu) }}</td>
                <td>{{ formatCurrency(phieu.giamToiDa) }}</td>
                <td>{{ phieu.soLuong ?? "N/A" }}</td>
                <td>{{ formatDate(phieu.ngayBatDau) }}</td>
                <td>{{ formatDate(phieu.ngayKetThuc) }}</td>
                <td>
                  <span :class="getTrangThaiClass(phieu.trangThai)">
                    {{ getTrangThaiText(phieu.trangThai) }}
                  </span>
                </td>
                <td class="d-flex align-items-center justify-content-center gap-2">
                  <router-link :to="{ name: 'SuaPhieuGiamGia', params: { id: phieu.id } }" class="btn btn-flat btn-sm"
                    title="Chỉnh sửa phiếu giảm giá" data-bs-toggle="tooltip" data-bs-placement="top">
                    <Edit :size="18" class="edit-icon" />
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

        <!-- Pagination -->
        <nav class="d-flex justify-content-center mt-3">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">«</a>
            </li>
            <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">»</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
import { FilterIcon, Edit } from "lucide-vue-next";
import { useToast } from "vue-toastification";
import * as bootstrap from "bootstrap";
import Swal from "sweetalert2";

export default {
  name: "PhieuGiamGia",
  components: {
    FilterIcon,
    Edit,
  },
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      phieuGiamGias: [],
      allPhieuGiamGias: [],
      currentPage: 1,
      itemsPerPage: 5,
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
        const response = await fetch("http://localhost:8080/phieuGiamGias");
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
      this.phieuGiamGias = [...this.filteredPhieuGiamGias];
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
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
          return "badge custom-primary";
        case 1: // Đang diễn ra
          return "badge custom-accent";
        case 2: // Chưa diễn ra
          return "badge custom-accent1";
        case 3: // Đã kết thúc
          return "badge custom-primary1";
        default:
          return "badge custom-primary";
      }
    },
    getLoaiPhieuClass(loaiPhieu) {
      return "badge custom-accent1";
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
    totalPages(newTotalPages) {
      if (this.currentPage > newTotalPages && newTotalPages > 0) {
        this.currentPage = 1;
      }
    },
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
.card {
  border-radius: 0.5rem;
}

.btn-primary {
  background-color: #0a2c57;
  border-color: #0a2c57;
  color: white;
}

.btn-primary:hover {
  background-color: #08203e;
  border-color: #08203e;
}

.badge {
  font-size: 0.85rem;
  padding: 0.5em 1em;
}

.custom-primary {
  background-color: #cc0000;
  color: white;
  border-radius: 50rem !important;
}

.custom-primary1 {
  background-color: #0a2c57;
  color: white;
  border-radius: 50rem !important;
}

.custom-accent {
  background-color: #66ff99;
  color: #0a2c57;
  border-radius: 50rem !important;
}

.custom-accent1 {
  background-color: #66ff99;
  color: white;
  border-radius: 50rem !important;
}

.btn-flat {
  background: none;
  border: none;
  padding: 0.25rem;
}

.btn-flat:hover .edit-icon {
  color: #4ccc7a;
}

.edit-icon {
  color: #66ff99;
}

.form-check-input {
  cursor: pointer;
}

.form-check-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.table th,
.table td {
  vertical-align: middle;
  text-align: center;
}
</style>