<template>
   <div class="search-container">
    <input
      v-model="searchInput"
      @keyup="onSearch"
      type="text"
      class="form-control"
      placeholder="Tìm kiếm theo tên, mã KH, số điện thoại, email..."
    />
  </div>
</template>

<script>
export default {
  name: 'SearchKhachHang',
  props: {
    value: String // dùng để binding v-model từ cha nếu cần
  },
  data() {
    return {
      searchInput: this.value || ''
    };
  },
  watch: {
    value(newVal) {
      this.searchInput = newVal;
    }
  },
  methods: {
    onSearch() {
      this.$emit('search', this.searchInput);
    }
  }
};
</script>

<style scoped>
.search-container {
  display: flex;
}

.search-container input {
  width: 400px; /* Chiều rộng cụ thể */
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

/* .search-container input {
  width: 250px; 
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  margin-right: 0; 
} */

.search-container input:focus {
  border-color: #007bff;  /* Thêm viền màu khi focus */
  outline: none;  /* Loại bỏ outline mặc định */
}
</style>
