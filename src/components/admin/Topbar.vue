<template>
  <header class="topbar-custom bg-white d-flex justify-content-between align-items-center px-4 border-bottom">
    <div class="d-flex align-items-center gap-3">
      <!-- <img src="/src/assets/logo.png" alt="COOLMEN logo" class="topbar-logo" />
      <h1 class="topbar-title m-0">CoolMen Admin Dashboard</h1> -->
    </div>
    <div class="d-flex align-items-center gap-4">
      <a href="#" class="topbar-icon-link">
        <i class="fas fa-envelope fa-lg"></i>
      </a>
      <a href="#" class="topbar-icon-link">
        <i class="fas fa-bell fa-lg"></i>
      </a>
      <div class="user-info d-flex align-items-center gap-2">
        <img src="https://via.placeholder.com/36" alt="User Avatar" class="user-avatar rounded-circle">
        <span class="user-name fw-medium text-dark">Admin CoolMen</span>
      </div>

      <button @click="handleLogout" class="btn btn-primary btn-sm logout-button">
        <i class="fas fa-sign-out-alt me-2"></i> Đăng xuất
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { logout } from '@/utils/auth'; // Import hàm logout

// Hàm xử lý khi click nút đăng xuất
const handleLogout = () => {
  logout(); // Gọi hàm logout từ auth.js
};
</script>

<style scoped>
.topbar-custom {
  height: 70px; /* Tăng chiều cao của topbar */
  padding: 0 30px; /* Tăng padding ngang */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08); /* Đổ bóng nhẹ nhàng */
  flex-shrink: 0; /* Đảm bảo topbar không bị co lại */
  z-index: 1000; /* Đảm bảo topbar luôn ở trên cùng */
}

.topbar-logo {
  max-height: 45px; /* Tăng kích thước logo */
  max-width: 150px;
  object-fit: contain;
  margin-right: 20px;
}

.topbar-title {
  color: #0a2c57;
  font-weight: 700;
  font-size: 1.8em; /* Tăng kích thước tiêu đề */
}

.topbar-icon-link {
  color: #6c757d;
  font-size: 1.3em; /* Kích thước icon */
  transition: color 0.2s;
  text-decoration: none; /* Bỏ gạch chân cho link */
}

.topbar-icon-link:hover {
  color: #0a2c57;
}

.user-avatar {
  width: 36px; /* Kích thước avatar */
  height: 36px;
  object-fit: cover;
  border: 2px solid #eee; /* Viền avatar */
}

.user-name {
  font-weight: 600;
  color: #343a40;
}

.logout-button {
  background-color: #dc3545; /* Màu đỏ cho nút đăng xuất */
  border-color: #dc3545;
  color: white;
  padding: 8px 18px;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.2s ease;
  display: flex;
  align-items: center;
}

.logout-button:hover {
  background-color: #c82333;
  border-color: #c82333;
  transform: translateY(-1px);
}
</style>
