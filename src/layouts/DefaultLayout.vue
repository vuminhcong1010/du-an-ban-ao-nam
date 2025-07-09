<template>
  <div class="admin-layout-wrapper">
    <Sidebar />

    <div class="main-content-area">
      <Topbar />
      <main class="content-body">
        <RouterView /> </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/admin/Sidebar.vue'; // Đường dẫn tương đối đúng
import Topbar from '@/components/admin/Topbar.vue';   // Đường dẫn tương đối đúng
// Không cần provide 'logout' hay 'toggleSidebar' ở đây nếu Topbar/Sidebar tự quản lý hoặc import trực tiếp từ utils
</script>

<style scoped>
.admin-layout-wrapper {
  display: flex; /* Sử dụng flexbox cho layout chính */
  height: 100vh; /* Đảm bảo layout chiếm toàn bộ chiều cao màn hình */
  width: 100vw; /* Đảm bảo layout chiếm toàn bộ chiều rộng màn hình */
  overflow: hidden; /* Ngăn chặn scrollbar không mong muốn trên layout chính */
  background-color: #f0f2f5; /* Nền tổng thể nhẹ nhàng */
}

.main-content-area {
  flex-grow: 1; /* Cho phép phần nội dung chính chiếm hết không gian còn lại */
  display: flex;
  flex-direction: column; /* Sắp xếp topbar và nội dung theo cột */
  /* Đảm bảo không có padding hoặc margin không mong muốn ở đây */
  overflow: hidden; /* Ngăn overflow của main content area */
}

.content-body {
  flex-grow: 1; /* Cho phép phần thân nội dung chiếm hết không gian còn lại */
  padding: 25px; /* Tăng padding để nội dung có không gian thở */
  background-color: #ffffff; /* Nền trắng cho khu vực nội dung */

  /* margin: 25px; 
  border-radius: 12px; 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);  */
  

  overflow-y: auto; /* Cho phép scroll nếu nội dung bên trong quá dài */
}
</style>