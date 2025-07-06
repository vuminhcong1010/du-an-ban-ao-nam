<template>
  <div class="search-filter-container">
    <div class="header-and-button-row mb-4">
      <h5 class="filter-title-group">
        <FilterIcon style="color: black;" /> Bộ lọc khách hàng
      </h5>
      <button @click="clearFilters" class="clear-button">Xóa bộ lọc</button>
    </div>


    <div class="search-filter-row">
      <input v-model="searchQuery" @input="search" type="text" placeholder="Tìm kiếm tên, mã, email, SĐT" />


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
import { Eye, Edit, Trash, Search, FilterIcon} from 'lucide-vue-next';
export default {
  components: { FilterIcon},
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
  mounted() {
    // Cẩn thận: nếu không có default '', combobox sẽ bị trắng
    this.filters = {
      gioiTinh: this.filterData.gioiTinh ?? '',
      trangThai: this.filterData.trangThai ?? '',
      tuoiRange: this.filterData.tuoiRange ?? '',
      soDonHangRange: this.filterData.soDonHangRange ?? '',
      chiTieuRange: this.filterData.chiTieuRange ?? ''
    };
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
    // Gọi API khi tìm kiếm thay đổi
    search() {
      this.$emit('search', this.searchQuery);
    },


    // Gọi API khi bất kỳ bộ lọc nào thay đổi
    applyFilters() {
      this.$emit('filterApplied', this.filters);
    },


    // Phương thức để xóa tất cả các bộ lọc
    clearFilters() {
      this.searchQuery = ''; // Đặt lại ô tìm kiếm
      this.filters = {
        gioiTinh: '',
        trangThai: '',
        tuoiRange: '',
        soDonHangRange: '',
        chiTieuRange: ''
      };
      // Kích hoạt lại việc tìm kiếm và lọc để làm mới dữ liệu
      this.search();
      this.applyFilters();
    }
  }, watch: {
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
.search-filter-container {
  width: 100%;
  /* Optional: Add some padding if the outer container feels too tight */
  /* padding: 20px; */
}


/* New: Style for the row containing the filter title/icon and the clear button */
.header-and-button-row {
  display: flex; /* Makes items arrange horizontally */
  justify-content: space-between; /* Pushes items to opposite ends */
  align-items: center; /* Vertically aligns items in the middle */
  margin-bottom: 1rem; /* Space below this header row */
}


/* Style for the group containing the icon and "Bộ lọc khách hàng" text */
.filter-title-group {
  display: flex; /* Makes the icon and text align horizontally */
  align-items: center; /* Vertically align them */
  gap: 8px; /* Space between icon and text */
  margin: 0; /* Remove default h5 margin */
  padding: 0; /* Remove default h5 padding */
  font-size: 1.5em; /* Ensure it looks like a heading */
  color: black; /* Ensure text color is black */
  font-weight: bold; /* Make it bold as in the image */
}


/* Style for the "Xóa bộ lọc" button */
.clear-button {
  /* Styling for a "pretty" button, adjusted for the new layout */
  padding: 8px 16px; /* Adjust padding as needed */
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #ccc;
  border-radius: 8px;
  background-color: #f8f8f8;
  color: #333;
  cursor: pointer;
  outline: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease-in-out;
  white-space: nowrap; /* Prevent button text from wrapping */
}


.clear-button:hover {
  background-color: #e0e0e0;
  border-color: #a0a0a0;
  color: #1a1a1a;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}


.clear-button:active {
  background-color: #d0d0d0;
  border-color: #808080;
  transform: translateY(0);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}




/* Keep your existing styles for the filter inputs row */
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





