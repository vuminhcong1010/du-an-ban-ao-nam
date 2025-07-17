<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="logo text-center">
        <img src="../../assets/logo.png" alt="CoolMen Logo">
      </div>
      <h2 class="text-center">Đăng nhập</h2>
      <form @submit.prevent="dangNhap()">
        <div class="form-group mb-3">
          <label for="username">Tên đăng nhập</label>
          <input
            type="text"
            id="username"
            v-model="login.username"
            class="form-control"
            :class="{ 'is-invalid': usernameError }"
            required
            autocomplete="username"
          >
          <div class="invalid-feedback" v-if="usernameError">{{ usernameError }}</div>
        </div>

        <div class="form-group mb-3">
          <label for="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            v-model="login.password"
            class="form-control"
            :class="{ 'is-invalid': passwordError }"
            required
            autocomplete="current-password"
          >
          <div class="invalid-feedback" v-if="passwordError">{{ passwordError }}</div>
        </div>

        <button type="submit" class="btn btn-primary w-100" style="background-color: #0a2c57; color: white;">Đăng nhập</button>
      </form>

      <div class="text-center mt-3">
        <router-link to="/quen-mat-khau">Quên mật khẩu?</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios'
import { ref } from 'vue'
import Cookies from 'js-cookie'
import { useToast } from "vue-toastification";
const toast = useToast();
const login = ref({
  username: '',
  password: ''
})

const usernameError = ref('')
const passwordError = ref('')

const dangNhap = async () => {
  // Reset lỗi trước khi gọi API
  usernameError.value = ''
  passwordError.value = ''

  try {
    const response = await axios.post("http://localhost:8080/login", login.value)

    if (response.data.data === false) {
      // Phân tích lỗi nếu backend trả về thông báo
      const msg = response.data.message || 'Lỗi đăng nhập'

      // Nếu cần bạn có thể dùng điều kiện như:
      if (msg.toLowerCase().includes('tài khoản')) {
        usernameError.value = msg
      } else if (msg.toLowerCase().includes('mật khẩu')) {
        passwordError.value = msg
      } else {
        // Nếu không rõ, hiển thị lỗi cho cả 2
        usernameError.value = msg
        passwordError.value = msg
      }

    } else {
      Cookies.set("token", response.data.data, { expires: 0.3 }) // 0.3 ~ 7.2 giờ
      window.location.href = "/san-pham"
    }
  } catch (err) {
    usernameError.value = 'Lỗi kết nối đến máy chủ!'
  }
}
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

.btn-primary {
  width: 100%;
  padding: 10px;
  background-color: #0a2c57;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.1em;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  margin-top: 15px;
}

.btn-primary:hover {
  background-color: #071f3e;
  transform: translateY(-2px);
}
  </style>