<template>
  
    <h4 class="mb-4 text-primary">🎯 Bộ lọc nâng cao</h4>
    <div class="row g-3">

      <!-- Khoảng năm sinh -->
      <div class="col-md-4">
        <label class="form-label">Khoảng năm sinh</label>
        <div class="input-group">
          <input type="number" class="form-control" v-model="filter.tuoiFrom" placeholder="Từ" @input="applyFilter" />
          <span class="input-group-text">-</span>
          <input type="number" class="form-control" v-model="filter.tuoiTo" placeholder="Đến" @input="applyFilter" />
        </div>
      </div>

      <!-- Khoảng số đơn hàng -->
      <div class="col-md-4">
        <label class="form-label">Khoảng số đơn hàng</label>
        <div class="input-group">
          <input type="number" class="form-control" v-model="filter.soDonHangFrom" placeholder="Từ" @input="applyFilter" />
          <span class="input-group-text">-</span>
          <input type="number" class="form-control" v-model="filter.soDonHangTo" placeholder="Đến" @input="applyFilter" />
        </div>
      </div>

      <!-- Khoảng tổng chi tiêu -->
      <div class="col-md-4">
        <label class="form-label">Khoảng tổng chi tiêu (₫)</label>
        <div class="input-group">
          <span class="input-group-text">₫</span>
          <input type="number" class="form-control" v-model="filter.tongTienFrom" placeholder="Từ" @input="applyFilter" />
          <span class="input-group-text">-</span>
          <input type="number" class="form-control" v-model="filter.tongTienTo" placeholder="Đến" @input="applyFilter" />
        </div>
      </div>

      <!-- Giới tính -->
      <div class="col-md-3">
        <label class="form-label">Giới tính</label>
        <select class="form-select" v-model="filter.gioiTinh" @change="applyFilter">
          <option value="">Tất cả</option>
          <option value="true">Nam</option>
          <option value="false">Nữ</option>
        </select>
      </div>

      <!-- Trạng thái tài khoản -->
      <div class="col-md-5">
        <label class="form-label d-block">Trạng thái tài khoản</label>
        <div class="btn-group w-100" role="group">
          <input type="radio" class="btn-check" name="trangThai" id="tatCa" value="" v-model="filter.trangThai" @change="applyFilter">
          <label class="btn btn-outline-secondary" for="tatCa">Tất cả</label>

          <input type="radio" class="btn-check" name="trangThai" id="hoatDong" value="1" v-model="filter.trangThai" @change="applyFilter">
          <label class="btn btn-outline-success" for="hoatDong">Hoạt động</label>

          <input type="radio" class="btn-check" name="trangThai" id="ngung" value="0" v-model="filter.trangThai" @change="applyFilter">
          <label class="btn btn-outline-danger" for="ngung">Ngừng</label>
        </div>
      </div>

      <!-- Nút clear -->
      <div class="col-4 d-flex justify-content-end">
  <button class="btn btn-clear-filter px-3 py-2" style="width: auto;" @click="clearFilter">
    🧹 Xóa bộ lọc
  </button>
</div>

    </div>

</template>

<script>
export default {
  name: 'FilterKhachHang',
  data() {
    return {
      filter: {
        tuoiFrom: null,
        tuoiTo: null,
        soDonHangFrom: null,
        soDonHangTo: null,
        tongTienFrom: null,
        tongTienTo: null,
        gioiTinh: '',
        trangThai: '',
      }
    };
  },
  methods: {
    applyFilter() {
      const filterToSend = { ...this.filter };

      // Chuyển đổi kiểu cho giới tính
      if (filterToSend.gioiTinh !== '') {
        filterToSend.gioiTinh = filterToSend.gioiTinh === 'true';
      } else {
        delete filterToSend.gioiTinh;
      }

      // Chuyển đổi kiểu cho trạng thái
      if (filterToSend.trangThai !== '') {
        filterToSend.trangThai = parseInt(filterToSend.trangThai);
      } else {
        delete filterToSend.trangThai;
      }

      // Kiểm tra và loại bỏ các trường không hợp lệ
      ['tuoiFrom', 'tuoiTo', 'soDonHangFrom', 'soDonHangTo', 'tongTienFrom', 'tongTienTo'].forEach(field => {
        if (filterToSend[field] === null || filterToSend[field] === '' || isNaN(filterToSend[field])) {
          delete filterToSend[field];
        }
      });

      // Gửi dữ liệu lọc cho component cha
      this.$emit('filterApplied', filterToSend);
    },
    clearFilter() {
      // Reset các trường filter về giá trị mặc định
      this.filter = {
        tuoiFrom: null,
        tuoiTo: null,
        soDonHangFrom: null,
        soDonHangTo: null,
        tongTienFrom: null,
        tongTienTo: null,
        gioiTinh: '',
        trangThai: '',
      };
      this.applyFilter();  // Gửi filter rỗng để reset
    }
  }
};
</script>

<style scoped>
.container {
  background-color: #fff;
}

h5 {
  font-weight: bold;
  color: #0a2c57;
}

.btn-clear-filter {
  background-color: #e0e0e0; /* màu nền mặc định */
  color: #333;
  border: none;
  padding: 8px 20px;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

.btn-clear-filter:hover {
  background-color: #0a2c57;
  color: #fff;
}
</style>
