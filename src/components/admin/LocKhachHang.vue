<template>
  <div class="filter-bar">
    <div class="filter-item">
      <label for="tuoiFrom">Tuổi từ</label>
      <input type="number" v-model="filter.tuoiFrom" min="0" placeholder="Từ" />
      <label for="tuoiTo">Tuổi đến</label>
      <input type="number" v-model="filter.tuoiTo" min="0" placeholder="Đến" />
    </div>

    <div class="filter-item">
      <label for="soDonHangFrom">Số đơn từ</label>
      <input type="number" v-model="filter.soDonHangFrom" min="0" placeholder="Từ" />
      <label for="soDonHangTo">Số đơn đến</label>
      <input type="number" v-model="filter.soDonHangTo" min="0" placeholder="Đến" />
    </div>

    <div class="filter-item">
      <label for="tongTienFrom">Tổng tiền từ</label>
      <input type="number" v-model="filter.tongTienFrom" min="0" placeholder="Từ" />
      <label for="tongTienTo">Tổng tiền đến</label>
      <input type="number" v-model="filter.tongTienTo" min="0" placeholder="Đến" />
    </div>

    <div class="filter-item">
      <label for="gioiTinh">Giới tính</label>
      <select v-model="filter.gioiTinh">
        <option value="">Chọn giới tính</option>
        <option value="true">Nam</option>
        <option value="false">Nữ</option>
      </select>
    </div>

    <div class="filter-item">
      <label for="trangThai">Trạng thái</label>
      <select v-model="filter.trangThai">
        <option value="">Tất cả</option>
        <option value="1">Đang hoạt động</option>
        <option value="0">Ngừng hoạt động</option>
      </select>
    </div>

    <button class="apply-btn" @click="applyFilter">Áp dụng</button>
    <button class="clear-btn" @click="clearFilter">Clear</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'LocKhachHang',
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
  async applyFilter() {
    try {
      console.log("Bộ lọc đang được áp dụng: ", this.filter);  // Log giá trị bộ lọc

      const response = await axios.get("http://localhost:8080/api/khach-hang/filter", {
        params: this.filter,
      });

      console.log("Dữ liệu trả về từ API: ", response.data);  // Log phản hồi API

      // Sau khi nhận dữ liệu lọc, gửi kết quả về component cha
      this.$emit('filterApplied', response.data.content);
      this.$emit('totalItems', response.data.totalElements);
      this.$emit('totalPages', Math.ceil(response.data.totalElements / 10)); // Giả sử size là 10
    } catch (err) {
      console.error("Lỗi khi gọi API lọc:", err);
      console.log("Bộ lọc tại thời điểm lỗi: ", this.filter);  // Log bộ lọc khi lỗi
    }
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
    this.$emit('filterApplied', []); // Gửi danh sách trống để reset
  }
};
</script>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 8px;
}

.filter-item {
  display: flex;
  flex-direction: column;
  width: 200px;
}

.filter-item label {
  margin-bottom: 8px;
  font-weight: bold;
}

.filter-item input,
.filter-item select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.apply-btn,
.clear-btn {
  background-color: #007bff;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.clear-btn {
  background-color: #888;
}

.apply-btn:hover,
.clear-btn:hover {
  opacity: 0.8;
}
</style>