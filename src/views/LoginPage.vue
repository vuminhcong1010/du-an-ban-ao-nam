<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="logo">
        <img src="../assets/logo_1.png" alt="CoolMen Logo">
      </div>
      <h2>Đăng nhập</h2>
      <form @submit.prevent="login">
        <div class="form-group">
          <label for="username">Tên đăng nhập</label>
          <input type="text" id="username" v-model="username" required autocomplete="username">
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu</label>
          <input type="password" id="password" v-model="password" required autocomplete="current-password">
        </div>
        <button type="submit" class="auth-button">Đăng nhập</button>
      </form>
      <div class="links">
        <router-link to="/forgot-password">Quên mật khẩu?</router-link>
        <span>|</span>
        <router-link to="/register">Chưa có tài khoản? Đăng ký tại đây</router-link>
      </div>
      <div v-if="error" class="error-message">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '@/api/axios'; // Đường dẫn có thể là @/api/axios hoặc ../api/axios tùy vị trí file
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

const username = ref('');
const password = ref('');
const error = ref('');

const login = async () => {
  error.value = ''; // Reset lỗi
  try {
    const response = await apiClient.post('/api/tai-khoan/dang-nhap', {
      tenDangNhap: username.value,
      matKhau: password.value,
    });

    // Lấy dữ liệu từ phản hồi API
    const { token, roles, idNhanVien, idKhachHang } = response.data;

    // --- Bắt đầu phần sửa lỗi lưu vai trò ---
    let rolesToStore = []; // Khởi tạo một mảng rỗng để đảm bảo luôn là mảng

    if (roles) { // Chỉ xử lý nếu 'roles' tồn tại trong response.data
        if (Array.isArray(roles)) {
            // Nếu 'roles' đã là một mảng (ví dụ: ["ADMIN", "STAFF"])
            rolesToStore = roles;
        } else if (typeof roles === 'string') {
            // Nếu 'roles' là một chuỗi đơn (ví dụ: "ADMIN")
            rolesToStore = [roles]; // Chuyển nó thành mảng ["ADMIN"]
        }
        // Nếu 'roles' có kiểu khác không mong muốn, rolesToStore vẫn là mảng rỗng
    } else {
        console.warn("API response did not contain 'roles' data or it was null/undefined.");
    }
    // --- Kết thúc phần sửa lỗi lưu vai trò ---

    // Lưu token và thông tin người dùng vào localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userRoles', JSON.stringify(rolesToStore)); // Đảm bảo luôn stringify một mảng

    if (idNhanVien) localStorage.setItem('idNhanVien', idNhanVien);
    if (idKhachHang) localStorage.setItem('idKhachHang', idKhachHang);

    toast.success('Đăng nhập thành công!');

    // Chuyển hướng đến trang chủ (/)
    router.push('/');

  } catch (err) {
    console.error('Lỗi đăng nhập:', err.response?.data || err.message);
    error.value = err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tên đăng nhập và mật khẩu.';
    toast.error(error.value);
  }
};
</script>

<style scoped>
/* Các style dùng chung cho cả Login và Register */
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0f8ff, #ffffff); /* Gradient nhẹ từ trên xuống */
  font-family: 'Arial', sans-serif;
  color: #333;
}

.auth-container {
  background: #ffffff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1); /* Đổ bóng mềm mại */
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.logo {
  margin-bottom: 30px;
}

.logo img {
  max-width: 150px; /* Điều chỉnh kích thước logo */
  height: auto;
  display: block; /* Để căn giữa dễ hơn */
  margin: 0 auto;
}

h2 {
  color: #0a2c57; /* Màu chủ đạo */
  margin-bottom: 25px;
  font-size: 2em;
  font-weight: 700;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #555;
  font-size: 0.95em;
}

.form-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ccc;
  border-radius: 8px;
  font-size: 1em;
  box-sizing: border-box; /* Đảm bảo padding không làm tăng kích thước input */
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #0a2c57;
  outline: none;
  box-shadow: 0 0 0 3px rgba(10, 44, 87, 0.1); /* Hiệu ứng focus nhẹ */
}

.auth-button {
  width: 100%;
  padding: 15px;
  background-color: #0a2c57; /* Màu chủ đạo */
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 15px;
}

.auth-button:hover {
  background-color: #071f3e; /* Màu tối hơn khi hover */
  transform: translateY(-2px); /* Hiệu ứng nhấc nhẹ */
}

.links {
  margin-top: 25px;
  font-size: 0.9em;
  color: #777;
}

.links a {
  color: #0a2c57; /* Màu chủ đạo */
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.links a:hover {
  text-decoration: underline;
  color: #071f3e;
}

.links span {
  margin: 0 10px;
}

.error-message {
  color: #d9534f; /* Màu đỏ cho lỗi */
  margin-top: 20px;
  font-size: 0.9em;
  background-color: #fce8e6;
  border: 1px solid #d9534f;
  padding: 10px;
  border-radius: 5px;
}
.success-message {
  color: #28a745; /* Màu xanh lá cây cho thành công */
  margin-top: 20px;
  font-size: 0.9em;
  background-color: #d4edda;
  border: 1px solid #28a745;
  padding: 10px;
  border-radius: 5px;
}
</style>