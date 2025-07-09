// src/utils/auth.js
import router from '@/router'; // Import router instance của bạn

export function logout() {
  localStorage.removeItem('authToken'); // Xóa token xác thực
  localStorage.removeItem('userRoles'); // Xóa vai trò người dùng
  localStorage.removeItem('idNhanVien'); // Xóa nếu có
  localStorage.removeItem('idKhachHang'); // Xóa nếu có

  // Chuyển hướng người dùng về trang đăng nhập
  // Sử dụng router.push('/login') thay vì window.location.href để đảm bảo Vue Router xử lý
  router.push('/login');
}

// Bạn cũng có thể thêm hàm kiểm tra đã đăng nhập chưa
export function isAuthenticated() {
  return !!localStorage.getItem('authToken');
}

// Và hàm lấy vai trò người dùng
export function getUserRoles() {
  try {
    return JSON.parse(localStorage.getItem('userRoles')) || [];
  } catch (e) {
    console.error("Lỗi khi parse userRoles từ localStorage:", e);
    return [];
  }
}