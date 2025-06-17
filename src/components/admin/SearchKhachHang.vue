<template>
  <div class="search-container">
    <input v-model="searchInput" @keyup="onSearch" type="text" class="form-control"
      placeholder="Tìm kiếm theo tên, mã KH, số điện thoại, email..." />
  </div>
</template>

<script>
export default {
  name: "SearchKhachHang",
  props: {
    value: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      searchInput: this.value
    };
  },
  watch: {
    value(newValue) {
      this.searchInput = newValue;
    }
  },
  methods: {
    onSearch() {
      this.$emit("search", this.searchInput);
    }
  }
};
</script>

<style scoped>
.search-container {
  display: flex;
}

.search-container input {
  width: 400px;
  padding: 0.5rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.search-container input:focus {
  border-color: #007bff;
  outline: none;
}
</style>
