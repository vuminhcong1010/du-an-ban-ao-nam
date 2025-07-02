<template>
  <div class="search-filter-container">
    <!-- Gộp thanh tìm kiếm và các ô lọc vào 1 hàng -->
    <h5 class="mb-4"><FilterIcon style="color: black" /> Bộ lọc</h5>
    <div class="search-filter-row">
      <!-- Ô tìm kiếm -->
      <input
        v-model="searchQuery"
        @input="search"
        type="text"
        placeholder="Tìm kiếm tên, mã, email, SĐT"
      />

      <!-- Các ô lọc -->
      <select v-model="filters.gioiTinh" @change="applyFilters">
        <option value="">Giới tính</option>
        <option value="true">Nam</option>
        <option value="false">Nữ</option>
      </select>

      <select v-model="filters.trangThai" @change="applyFilters">
        <option value="">Trạng thái</option>
        <option value="1">Đang hoạt động</option>
        <option value="0">Dừng hoạt động</option>
      </select>

      <select v-model="filters.tuoiRange" @change="applyFilters">
        <option value="">Tuổi</option>
        <option value="0,20">Dưới 20</option>
        <option value="20,35">Từ 20 đến 35</option>
        <option value="35,100">Trên 35</option>
      </select>

      <select v-model="filters.soDonHangRange" @change="applyFilters">
        <option value="">Số đơn</option>
        <option value="0,5">Dưới 5 đơn</option>
        <option value="5,10">Từ 5 đến 10 đơn</option>
        <option value="10,100">Trên 10 đơn</option>
      </select>

      <select v-model="filters.chiTieuRange" @change="applyFilters">
        <option value="">Số tiền</option>
        <option value="0,5000000">Dưới 5 triệu</option>
        <option value="5000000,10000000">Từ 5 triệu đến 10 triệu</option>
        <option value="10000000,1000000000">Trên 10 triệu</option>
      </select>
    </div>
  </div>
</template>

<script>
import { Eye, Edit, Trash, Search, FilterIcon } from "lucide-vue-next";
export default {
  components: { FilterIcon },
  name: "SearchAndFilterKhachHang",
  props: {
    value: {
      type: String,
      default: "",
    },
    filterData: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    // Cẩn thận: nếu không có default '', combobox sẽ bị trắng
    this.filters = {
      gioiTinh: this.filterData.gioiTinh || "",
      trangThai: this.filterData.trangThai || "",
      tuoiRange: this.filterData.tuoiRange || "",
      soDonHangRange: this.filterData.soDonHangRange || "",
      chiTieuRange: this.filterData.chiTieuRange || "",
    };
  },
  data() {
    return {
      searchQuery: this.value,
      filters: {
        gioiTinh: "",
        trangThai: "",
        tuoiRange: "",
        soDonHangRange: "",
        chiTieuRange: "",
      },
    };
  },
  methods: {
    // Gọi API khi tìm kiếm thay đổi
    search() {
      this.$emit("search", this.searchQuery);
    },

    // Gọi API khi bất kỳ bộ lọc nào thay đổi
    applyFilters() {
      this.$emit("filterApplied", this.filters);
    },
  },
  watch: {
    value(newQuery) {
      this.searchQuery = newQuery;
    },
    filterData: {
      handler(newFilters) {
        this.filters = {
          gioiTinh: newFilters.gioiTinh ?? "",
          trangThai: newFilters.trangThai ?? "",
          tuoiRange: newFilters.tuoiRange ?? "",
          soDonHangRange: newFilters.soDonHangRange ?? "",
          chiTieuRange: newFilters.chiTieuRange ?? "",
        };
      },
      immediate: true,
    },
  },
};
</script>

<style scoped>
.search-filter-container {
  width: 100%;
}

.search-filter-row {
  display: grid;
  grid-template-columns: 2fr repeat(5, 1fr); /* 1 ô tìm kiếm + 5 ô lọc */
  gap: 10px;
  width: 100%;
}

.search-filter-row input,
.search-filter-row select {
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  width: 100%;
}
</style>
