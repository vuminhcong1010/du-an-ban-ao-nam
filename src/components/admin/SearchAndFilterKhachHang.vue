<template>
  <div class="bg-white p-3 rounded mb-4 border">
    <h5 style="margin-bottom: 1em; color: #0a2c57;">
      <i>
        <FilterIcon></FilterIcon>
      </i> Bộ lọc
    </h5>

    <div class="px-3 mb-3">
      <input 
        v-model="searchQuery" 
        @input="search" 
        type="text" 
        class="form-control"
        placeholder="Tìm kiếm theo mã, tên, email và số điện thoại" />
    </div>

    <div class="px-3 d-flex flex-wrap gap-3">
      <div class="d-flex flex-column" style="width: 200px;">
        <label class="form-label fw-bold filter-label">Giới tính</label>
        <select class="form-select" v-model="filters.gioiTinh" @change="applyFilters">
          <option value="">Tất cả</option>
          <option value="true">Nam</option>
          <option value="false">Nữ</option>
        </select>
      </div>

      <div class="d-flex flex-column" style="width: 200px;">
        <label class="form-label fw-bold filter-label">Trạng thái</label>
        <select class="form-select" v-model="filters.trangThai" @change="applyFilters">
          <option value="">Tất cả</option>
          <option value="1">Đang hoạt động</option>
          <option value="0">Dừng hoạt động</option>
        </select>
      </div>

      <div class="d-flex flex-column" style="width: 200px;">
        <label class="form-label fw-bold filter-label">Tuổi</label>
        <select class="form-select" v-model="filters.tuoiRange" @change="applyFilters">
          <option value="">Tất cả</option>
          <option value="0,20">Dưới 20</option>
          <option value="20,35">Từ 20 đến 35</option>
          <option value="35,100">Trên 35</option>
        </select>
      </div>

      <div class="d-flex flex-column" style="width: 200px;">
        <label class="form-label fw-bold filter-label">Số đơn</label>
        <select class="form-select" v-model="filters.soDonHangRange" @change="applyFilters">
          <option value="">Tất cả</option>
          <option value="0,5">Dưới 5 đơn</option>
          <option value="5,10">Từ 5 đến 10 đơn</option>
          <option value="10,100">Trên 10 đơn</option>
        </select>
      </div>
      
      <div class="d-flex flex-column" style="width: 200px;">
        <label class="form-label fw-bold filter-label">Chi tiêu</label>
        <select class="form-select" v-model="filters.chiTieuRange" @change="applyFilters">
          <option value="">Tất cả</option>
          <option value="0,5000000">Dưới 5 triệu</option>
          <option value="5000000,10000000">Từ 5 triệu đến 10 triệu</option>
          <option value="10000000,1000000000">Trên 10 triệu</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script>
import { FilterIcon } from 'lucide-vue-next';

export default {
  components: { FilterIcon },
  name: 'SearchAndFilterKhachHang',
  props: {
    value: {
      type: String,
      default: ''
    },
    filterData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      searchQuery: this.value,
      filters: {
        gioiTinh: '',
        trangThai: '',
        tuoiRange: '',
        soDonHangRange: '',
        chiTieuRange: ''
      }
    };
  },
  methods: {
    search() {
      this.$emit('search', this.searchQuery);
    },
    applyFilters() {
      this.$emit('filterApplied', this.filters);
    },
    clearFilters() {
      this.searchQuery = '';
      this.filters = {
        gioiTinh: '',
        trangThai: '',
        tuoiRange: '',
        soDonHangRange: '',
        chiTieuRange: ''
      };
      this.search();
      this.applyFilters();
    }
  },
  watch: {
    value(newQuery) {
      this.searchQuery = newQuery;
    },
    filterData: {
      handler(newFilters) {
        this.filters = {
          gioiTinh: newFilters.gioiTinh ?? '',
          trangThai: newFilters.trangThai ?? '',
          tuoiRange: newFilters.tuoiRange ?? '',
          soDonHangRange: newFilters.soDonHangRange ?? '',
          chiTieuRange: newFilters.chiTieuRange ?? ''
        };
      },
      immediate: true
    }
  },
};
</script>

<style scoped>
.form-label.fw-bold {
  color: #0a2c57;
  transition: color 0.3s ease;
}

.filter-item:hover .form-label.fw-bold {
  color: #0a2c57;
}

/* Tên class có thể khác, ví dụ: .your-main-container */
.bg-white {
  /* Bỏ viền */
  border: none !important;

  /* Bỏ đổ bóng */
  box-shadow: none !important;

  /* Đảm bảo chiếm toàn bộ chiều ngang */
  width: 100% !important;

  /* Loại bỏ bo góc */
  border-radius: 0 !important;
}

.form-control, .form-select {
  border: 1px solid #ced4da;
  border-radius: 6px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075);
}

.form-control:focus, .form-select:focus {
  border-color: #86b7fe;
  outline: 0;
  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);
}

.d-flex.flex-wrap.gap-3 {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.d-flex.flex-column {
  display: flex;
  flex-direction: column;
}

h5, h2 i {
  margin-right: 0.5rem;
    font-weight: bold;
  color: #0a2c57;
}
</style>