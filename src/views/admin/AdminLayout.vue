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

</style>

