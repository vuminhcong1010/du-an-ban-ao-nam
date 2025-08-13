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
import { ref } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router';


const usernameError = ref('');
const passwordError = ref('');
const login = ref({
  username: '', // Đảm bảo khớp với LoginDtoRequest của bạn
  password: ''
});


const router = useRouter();


const dangNhap = async () => {
  usernameError.value = '';
  passwordError.value = '';


  try {
    // Gửi request đến đúng endpoint
    const response = await axios.post("http://localhost:8080/login-customer", login.value);


    // --- Bắt đầu sửa đổi logic xử lý phản hồi ---
    // Dựa trên JSON mẫu bạn cung cấp, khi thành công, `response.data` sẽ chứa `data: { id: ..., ... }`
    // và `message: null`. Khi thất bại, có thể `response.data.data` là null/false
    // và `response.data.message` sẽ có giá trị.


    if (response.data && response.data.data && response.data.data.id) {
      // Trường hợp đăng nhập thành công: `response.data.data` có ID
      const userData = response.data.data;
      console.log('Đăng nhập thành công:', userData);


      // LƯU Ý: VÌ BACKEND HIỆN TẠI KHÔNG TRẢ VỀ TOKEN TRONG PHẢN HỒI NÀY,
      // BẠN SẼ KHÔNG CÓ `loginData.token`.
      // Bạn cần sửa backend để trả về token như đã hướng dẫn trước đó.
      // Tạm thời, chúng ta vẫn sẽ chuyển hướng.


      // Lưu thông tin người dùng vào Local Storage hoặc Cookies (ví dụ: thông tin user, không phải token)
      // Cookies.set("thongTinKhachHang", JSON.stringify(userData), { expires: 0.3 }); // Hoặc dùng localStorage
      localStorage.setItem("loggedInUser", JSON.stringify(userData)); // Lưu thông tin người dùng


      // Nếu backend đã được sửa để trả về JWT, thì làm như sau:
      // if (userData.token) {
      //   localStorage.setItem("clientAuthToken", userData.token);
      // }


      // Chuyển hướng đến trang chủ /coolmen
      await router.push('/coolmen');


    } else if (response.data && response.data.message) {
      // Trường hợp đăng nhập thất bại và có thông báo lỗi từ backend
      const msg = response.data.message;
      console.error("Đăng nhập thất bại:", msg);
      if (msg.toLowerCase().includes('tài khoản')) {
        usernameError.value = msg;
      } else if (msg.toLowerCase().includes('mật khẩu')) {
        passwordError.value = msg;
      } else {
        usernameError.value = msg;
        passwordError.value = msg;
      }
    } else {
      // Trường hợp không rõ lỗi hoặc phản hồi không đúng định dạng
      usernameError.value = 'Lỗi đăng nhập không xác định hoặc phản hồi không hợp lệ.';
      passwordError.value = 'Vui lòng kiểm tra lại thông tin.';
    }
    // --- Kết thúc sửa đổi logic xử lý phản hồi ---


  } catch (err) {
    console.error("Lỗi khi gửi yêu cầu đăng nhập:", err);
    if (err.response) {
      // Lỗi từ phản hồi HTTP (ví dụ: status 401, 400)
      const errorMsg = err.response.data.message || 'Thông tin đăng nhập không đúng.';
      usernameError.value = errorMsg;
      passwordError.value = errorMsg;
    } else if (err.request) {
      // Yêu cầu đã được gửi nhưng không nhận được phản hồi (lỗi mạng, server down)
      usernameError.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.';
    } else {
      // Lỗi khác
      usernameError.value = 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
    }
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

