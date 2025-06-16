<template>
  <!-- Biểu tượng lọc (funnel icon) -->
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-funnel" viewBox="0 0 16 16">
    <path d="M1 1.5A.5.5 0 011.5 1h13a.5.5 0 010 1h-13a.5.5 0 01-.5-.5zm6.5 12a.5.5 0 01.5-.5h3a.5.5 0 010 1h-3a.5.5 0 01-.5-.5zM4 4a.5.5 0 01.5-.5h7a.5.5 0 010 1h-7a.5.5 0 01-.5-.5zm6.5 5a.5.5 0 01.5-.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5z"/>
  </svg>
</template>

<script>
export default {
  name: "FilterIcon",
};
</script>

<style scoped>
/* Định kiểu cho biểu tượng lọc */
svg {
  cursor: pointer; /* Thêm con trỏ dạng tay khi hover */
  color: black; /* Đặt màu đen cho biểu tượng */
}
</style>
