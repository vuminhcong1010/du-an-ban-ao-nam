<template>
  <div class="full-width-container">
    <div class="bg-white p-3 rounded border mb-4 d-flex justify-content-between align-items-center"
      style="height: 60px;">
      <h2 class="fw-bold mb-0">Quản lý đợt giảm giá</h2>
      <router-link to="/dot-giam-gia/them" class="btn btn-primary"
        style="background-color: #0a2c57; color: white; border: none;">
        <Plus class="me-1" size="16" />Thêm đợt giảm giá
      </router-link>
    </div>

    <div class="bg-white p-3 rounded mb-4 border">
      <h5 style="margin-bottom: 1em">
        <i>
          <FilterIcon></FilterIcon>
        </i> Bộ lọc
      </h5>
      <div class="px-3">
        <input v-model="searchQuery" @keyup.enter="filterDotGiamGia" type="text" class="form-control mb-3"
          placeholder="Tìm kiếm theo mã, tên" />
        <div class="d-flex flex-wrap gap-3">
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Trạng thái</label>
            <select v-model="filterStatus" class="form-select">
              <option value="">Tất cả</option>
              <option value="0">Đã hủy</option>
              <option value="1">Đang diễn ra</option>
              <option value="2">Chưa diễn ra</option>
              <option value="3">Đã kết thúc</option>
            </select>
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Loại giảm</label>
            <select class="form-select" v-model="filterDiscountType">
              <option value="">Tất cả</option>
              <option value="0">%</option>
              <option value="1">VND</option>
            </select>
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Ngày bắt đầu</label>
            <input type="date" v-model="filterStartDate" class="form-control" />
          </div>
          <div class="d-flex flex-column" style="width: 250px;">
            <label class="form-label fw-bold" style="color: #0a2c57;">Ngày kết thúc</label>
            <input type="date" v-model="filterEndDate" class="form-control" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white p-3 rounded border mb-4">
      <h5 class="text-start ps-3 pt-3">Danh sách đợt giảm giá</h5>
      <div class="table-responsive">
        <table class="table table-hover">
          <thead class="table-light">
            <tr>
              <th scope="col" class="text-center">STT</th>
              <th scope="col">Mã</th>
              <th scope="col">Tên</th>
              <th scope="col">Giá trị giảm</th>
              <th scope="col">Ngày bắt đầu</th>
              <th scope="col">Ngày kết thúc</th>
              <th scope="col">Trạng thái</th>
              <th scope="col" class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(dot, index) in paginatedDoiGiamGia" :key="dot.id">
              <td class="text-center">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ dot.maDotGiamGia }}</td>
              <td>{{ dot.tenDotGiamGia }}</td>
              <td>
                {{ dot.phamTramGiam ? dot.phamTramGiam + "%" : formatCurrency(dot.soTienGiam) }}
              </td>
              <td>{{ formatDate(dot.ngayBatDau) }}</td>
              <td>{{ formatDate(dot.ngayKetThuc) }}</td>
              <td>
                <span :class="['status-badge', getTrangThaiClass(dot.trangThai)]">{{ getTrangThaiText(dot.trangThai)
                }}</span>
              </td>
              <td class="d-flex align-items-center justify-content-center gap-2">
                <RouterLink :to="{ name: 'suadoigiamgia', params: { id: dot.id } }" title="Chỉnh sửa đợt giảm giá"
                  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip">
                  <Edit style="color: #4ccc7a;" />
                </RouterLink>
                <div class="form-check form-switch ms-2" v-if="dot.trangThai !== 3"
                  :title="dot.trangThai === 0 ? 'Kích hoạt lại đợt giảm giá' : 'Hủy đợt giảm giá'"
                  data-bs-toggle="tooltip" data-bs-placement="top" data-bs-custom-class="custom-tooltip">
                  <input class="form-check-input" type="checkbox" v-model="dot.isChecked"
                    @change="toggleStatus(dot.id, dot.isChecked)" :disabled="dot.loading" />
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
import { FilterIcon, Edit, Plus } from "lucide-vue-next";
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie'
import * as bootstrap from 'bootstrap';

export default {
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
      allDoiGiamGia: [],
      filteredDoiGiamGia: [],
      searchQuery: '',
      filterStartDate: '',
      filterEndDate: '',
      filterStatus: '',
      filterDiscountType: '',
      currentPage: 1,
      pageSize: 5,
      inputPage: 1,
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.filteredDoiGiamGia.length / this.pageSize);
    },
    paginatedDoiGiamGia() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return this.filteredDoiGiamGia.slice(start, end);
    }
  },
  methods: {
    async getAllDotGiamGia() {
      try {
        const response = await fetch("http://localhost:8080/doi-giam-gia", {
          headers: {
            Authorization: `Bearer ${this.token}`
          }
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const json = await response.json();
        this.allDoiGiamGia = json.map(dot => ({
          ...dot,
          ngayBatDau: new Date(dot.ngayBatDau),
          ngayKetThuc: new Date(dot.ngayKetThuc),
          isChecked: dot.trangThai !== 0,
          loading: false
        }));
        this.filterDotGiamGia();
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đợt giảm giá:", error);
        this.toast.error("Không thể tải danh sách đợt giảm giá. Vui lòng thử lại sau.", { timeout: 1800 });
      }
    },
    async toggleStatus(id, isActive) {
      const dot = this.allDoiGiamGia.find(dot => dot.id === id);
      if (!dot) return;

      const confirmText = isActive
        ? 'Bạn có muốn kích hoạt đợt giảm giá?'
        : 'Bạn có muốn hủy đợt giảm giá không?';

      const result = await Swal.fire({
        title: 'Xác nhận ?',
        text: confirmText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Hủy'
      });

      if (!result.isConfirmed) {
        dot.isChecked = !isActive;
        return;
      }

      dot.loading = true;
      const previousChecked = dot.isChecked;
      try {
        const response = await fetch(`http://localhost:8080/doi-giam-gia/toggle/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ active: isActive })
        });
        const result = await response.json();
        if (response.ok) {
          const index = this.allDoiGiamGia.findIndex(dot => dot.id === id);
          if (index !== -1) {
            this.allDoiGiamGia[index] = {
              ...result.data,
              ngayBatDau: new Date(result.data.ngayBatDau),
              ngayKetThuc: new Date(result.data.ngayKetThuc),
              isChecked: result.data.trangThai !== 0,
              loading: false
            };
            this.filterDotGiamGia();
            if (result.data.trangThai !== 0) {
              this.toast.success('Kích hoạt đợt giảm giá thành công!', { timeout: 1000 });
            } else {
              this.toast.success('Hủy đợt giảm giá thành công!', { timeout: 1000 });
            }
          }
        } else {
          console.error("Lỗi khi cập nhật trạng thái:", result.message);
          dot.isChecked = previousChecked;
          this.toast.error(`Lỗi: ${result.message}`, { timeout: 1800 });
        }
      } catch (error) {
        console.error("Lỗi khi gọi API toggle status:", error);
        dot.isChecked = previousChecked;
        this.toast.error("Lỗi hệ thống. Vui lòng thử lại sau.", { timeout: 1800 });
      } finally {
        dot.loading = false;
      }
    },
    filterDotGiamGia() {
      this.currentPage = 1;
      this.inputPage = 1;
      this.filteredDoiGiamGia = this.allDoiGiamGia.filter(dot => {
        const matchesSearch = !this.searchQuery ||
          dot.maDotGiamGia.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          dot.tenDotGiamGia.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          (dot.moTa && dot.moTa.toLowerCase().includes(this.searchQuery.toLowerCase()));
        const matchesStartDate = !this.filterStartDate ||
          new Date(dot.ngayBatDau).toISOString().split('T')[0] >= this.filterStartDate;
        const matchesEndDate = !this.filterEndDate ||
          new Date(dot.ngayKetThuc).toISOString().split('T')[0] <= this.filterEndDate;
        const matchesStatus = !this.filterStatus ||
          dot.trangThai.toString() === this.filterStatus;
        const matchesDiscountType = !this.filterDiscountType ||
          (this.filterDiscountType === '0' && dot.phamTramGiam) ||
          (this.filterDiscountType === '1' && dot.soTienGiam);
        return matchesSearch && matchesStartDate && matchesEndDate && matchesStatus && matchesDiscountType;
      });
    },
    getTrangThaiClass(trangThai) {
      switch (trangThai) {
        case 0: return "cancelled";
        case 1: return "confirmed";
        case 2: return "shipping";
        case 3: return "completed";
        default: return "inactive";
      }
    },
    formatCurrency(val) {
      return val ? val.toLocaleString("vi-VN") + " VNĐ" : "";
    },
    formatDate(date) {
      return date ? new Date(date).toLocaleString("vi-VN", {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }) : "";
    },
    getTrangThaiText(status) {
      switch (status) {
        case 0: return 'Đã hủy';
        case 1: return 'Đang diễn ra';
        case 2: return 'Chưa diễn ra';
        case 3: return 'Đã kết thúc';
        default: return 'Không rõ';
      }
    },
    goToPage() {
      if (this.inputPage >= 1 && this.inputPage <= this.totalPages) {
        this.currentPage = this.inputPage;
      } else {
        this.toast.error("Số trang không hợp lệ!");
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
  },
  watch: {
    searchQuery() { this.filterDotGiamGia() },
    filterStartDate() { this.filterDotGiamGia() },
    filterEndDate() { this.filterDotGiamGia() },
    filterStatus() { this.filterDotGiamGia() },
    filterDiscountType() { this.filterDotGiamGia() },
    currentPage(newPage) {
      this.inputPage = newPage;
    },
  },
  mounted() {
    this.getAllDotGiamGia();
    this.$nextTick(() => {
      const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipTriggerList.forEach(tooltipTriggerEl => {
        new bootstrap.Tooltip(tooltipTriggerEl);
      });
    });
  }
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

</style>