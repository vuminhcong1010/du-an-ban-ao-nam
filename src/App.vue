<!-- src/App.vue -->
<template>
  <RouterView />
</template>

<script setup>
// Không cần import Sidebar, Topbar, hay provide/ref ở đây nữa
// Vì DefaultLayout đã xử lý việc đó
</script>

<style>
/* Các style global (ví dụ: reset CSS cơ bản) */
/* Đảm bảo các style này được áp dụng toàn cục cho ứng dụng của bạn */
html, body, #app {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  font-family: 'Inter', sans-serif;
  overflow: hidden; /* Ngăn scrollbar kép từ body */
}
</style>