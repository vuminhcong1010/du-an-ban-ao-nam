<template>
  <div class="modal-backdrop">
    <div class="modal-box">
      <!-- Header -->
      <div class="modal-header">
        <h3>Bộ lọc khách hàng</h3>
        <button class="close-btn" @click="$emit('close')">✖</button>
      </div>

      <!-- Body -->
      <div class="modal-body">
        <div class="filter-row">
          <label>Tuổi từ</label>
          <input type="number" v-model="filter.tuoiFrom" placeholder="Nhập tuổi từ" />
        </div>
        <div class="filter-row">
          <label>Tuổi đến</label>
          <input type="number" v-model="filter.tuoiTo" placeholder="Nhập tuổi đến" />
        </div>
        <div class="filter-row">
          <label>Số đơn từ</label>
          <input type="number" v-model="filter.soDonHangFrom" placeholder="Nhập số đơn từ" />
        </div>
        <div class="filter-row">
          <label>Số đơn đến</label>
          <input type="number" v-model="filter.soDonHangTo" placeholder="Nhập số đơn đến" />
        </div>
        <div class="filter-row">
          <label>Tổng tiền từ</label>
          <input type="number" v-model="filter.tongTienFrom" placeholder="Nhập tổng tiền từ" />
        </div>
        <div class="filter-row">
          <label>Tổng tiền đến</label>
          <input type="number" v-model="filter.tongTienTo" placeholder="Nhập tổng tiền đến" />
        </div>
        <div class="filter-row">
          <label>Giới tính</label>
          <select v-model="filter.gioiTinh">
            <option value="">Chọn giới tính</option>
            <option value="true">Nam</option>
            <option value="false">Nữ</option>
          </select>
        </div>
        <div class="filter-row">
          <label>Trạng thái</label>
          <div class="radio-group">
            <label><input type="radio" value="" v-model="filter.trangThai" /> Tất cả</label>
            <label><input type="radio" value="1" v-model="filter.trangThai" /> Đang hoạt động</label>
            <label><input type="radio" value="0" v-model="filter.trangThai" /> Ngừng hoạt động</label>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="modal-footer">
        <button class="clear-btn" @click="clearFilter">Clear all</button>
        <div>
          <button class="cancel-btn" @click="$emit('close')">Cancel</button>
          <button class="apply-btn" @click="applyFilter">Apply</button>
        </div>
      </div>
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

      if (filterToSend.gioiTinh !== '') {
        filterToSend.gioiTinh = filterToSend.gioiTinh === 'true';
      } else {
        delete filterToSend.gioiTinh;
      }

      if (filterToSend.trangThai !== '') {
        filterToSend.trangThai = parseInt(filterToSend.trangThai);
      } else {
        delete filterToSend.trangThai;
      }

      ['tuoiFrom', 'tuoiTo', 'soDonHangFrom', 'soDonHangTo', 'tongTienFrom', 'tongTienTo'].forEach(field => {
        if (filterToSend[field] === null || filterToSend[field] === '' || isNaN(filterToSend[field])) {
          delete filterToSend[field];
        }
      });

      this.$emit('filterApplied', filterToSend);
      this.$emit('close');
    },
    clearFilter() {
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
      this.filter = { ...defaultValue }; // reset giá trị
  this.$emit('filterApplied', {}); // gửi object rỗng để reset
  this.$emit('close');
    }
  }
};
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9999;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 2rem;
}

.modal-box {
  background: #fff;
  border-radius: 10px;
  width: 600px;
  padding: 24px;
  max-height: 90vh;
  overflow-y: auto;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.filter-row {
  display: flex;
  flex-direction: column;
}

.filter-row label {
  font-weight: 500;
  margin-bottom: 6px;
}

.filter-row input,
.filter-row select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.radio-group {
  display: flex;
  gap: 12px;
  align-items: center;
  padding-top: 4px;
}

.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
}

.clear-btn {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
}

.cancel-btn {
  background: #f0f0f0;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  margin-right: 8px;
  cursor: pointer;
}

.apply-btn {
  background: #007bff;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
</style>
