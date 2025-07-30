<!-- src/views/admin/AdminLayout.vue -->
<script setup>
import { ref, provide } from 'vue'
import Sidebar from '@/components/admin/Sidebar.vue' // Đảm bảo đường dẫn đúng
import Topbar from '@/components/admin/Topbar.vue' // Đảm bảo đường dẫn đúng

// Toggle Sidebar
const isSidebarCollapsed = ref(false)
function toggleSidebarCollapse() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// Provide the collapse state and toggle function to child components
provide('isSidebarCollapsed', isSidebarCollapsed)
provide('toggleSidebarCollapse', toggleSidebarCollapse)

</script>

<template>
  <div class="admin-dashboard d-flex flex-column vh-100" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
    <Topbar />
    <div class="d-flex flex-grow-1 main-content-wrapper">
      <Sidebar :collapsed="isSidebarCollapsed" :onToggleCollapse="toggleSidebarCollapse" />
      <main class="flex-grow-1 bg-light p-4 admin-main-area">
        <!-- Router View này sẽ hiển thị CÁC TRANG CON CỦA ADMIN -->
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
/* Đặt CSS không scoped cho các quy tắc toàn cục hoặc cấu trúc layout */
/* Cần đảm bảo các style này được áp dụng trong Topbar.vue hoặc global CSS */
.topbar {
    height: 70px; /* Chiều cao Topbar */
    background-color: #2c3e50; /* Màu nền Topbar */
    color: white;
    display: flex;
    align-items: center;
    padding: 0 20px;
    position: fixed; /* Cố định Topbar */
    width: 100%; /* Chiếm toàn bộ chiều rộng */
    top: 0;
    left: 0;
    z-index: 1000; /* Đảm bảo Topbar nằm trên cùng */
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

/* Cần đảm bảo các style này được áp dụng trong Sidebar.vue hoặc global CSS */
.sidebar {
    width: 250px; /* Chiều rộng mặc định của Sidebar */
    background-color: #34495e; /* Màu nền Sidebar */
    color: white;
    padding-top: 70px; /* Đẩy nội dung Sidebar xuống dưới Topbar */
    position: fixed; /* Cố định Sidebar */
    height: 100%; /* Chiếm toàn bộ chiều cao còn lại */
    top: 0; /* Bắt đầu từ đỉnh */
    left: 0;
    z-index: 900; /* Dưới Topbar nhưng trên main content */
    transition: width 0.3s ease; /* Thêm transition khi thu gọn */
    overflow-y: auto; /* Cho phép cuộn nếu nội dung dài */
}

.sidebar.collapsed {
    width: 60px; /* Chiều rộng khi thu gọn */
}

/* Điều chỉnh main content dựa trên trạng thái của sidebar */
.admin-main-area {
  transition: margin-left 0.3s ease;
  padding-top: 70px; /* Đẩy nội dung xuống dưới Topbar */
  padding-left: 20px; /* Padding bên trong main area */
  margin-left: 250px; /* Đẩy nội dung chính sang phải bằng chiều rộng sidebar */
  box-sizing: border-box;
}

.admin-dashboard.sidebar-collapsed .admin-main-area {
  margin-left: 60px; /* Khi sidebar thu gọn, đẩy ít hơn */
}

/* Global styles for html, body, #app */
html, body, #app {
  height: 100%;
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
}
</style>