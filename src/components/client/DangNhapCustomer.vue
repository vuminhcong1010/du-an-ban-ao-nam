<template>
  <div class="auth-wrapper">
    <div class="auth-left">
      <div class="left-overlay">
        <div class="orb"></div>
      </div>
    </div>




    <div class="auth-right">
      <div class="form-card" role="main" aria-labelledby="login-title">
        <div class="logo">
          <img src="@/assets/logo.png" alt="CoolMen Logo" />
        </div>




        <h1 id="login-title">Đăng nhập</h1>
        <p class="subtitle">Đăng nhập để truy cập các tính năng của CoolMen</p>




        <form @submit.prevent="dangNhap" novalidate>
          <div class="form-group">
            <label for="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              v-model.trim="login.username"
              :class="{ 'is-invalid': usernameError }"
              :aria-invalid="!!usernameError"
              autocomplete="username"
              required
            />
            <div class="invalid-feedback" v-if="usernameError">{{ usernameError }}</div>
          </div>




          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <div class="password-field">
              <input
                id="password"
                :type="showPassword ? 'text' : 'password'"
                v-model="login.password"
                :class="{ 'is-invalid': passwordError }"
                :aria-invalid="!!passwordError"
                autocomplete="current-password"
                required
              />
              </div>
            <div class="invalid-feedback" v-if="passwordError">{{ passwordError }}</div>
          </div>




          <div class="form-extra">
            <router-link to="/quen-mat-khau" class="forgot">Quên mật khẩu?</router-link>
          </div>




          <button
            class="btn-submit"
            type="submit"
            :disabled="loading"
            :class="{ 'btn-disabled': loading }"
          >
            <span v-if="loading">Đang xử lý...</span>
            <span v-else>Đăng nhập</span>
          </button>




          <a href="http://localhost:8080/auth/authorize/google" class="btn-google">
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google logo" />
            <span>Đăng nhập bằng Google</span>
          </a>




          <p class="signup-line">
            Chưa có tài khoản?
            <router-link to="/coolmen/dang-ki-khach-hang">Đăng ký</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>




<script setup>
import { ref, computed, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth'; // Import Pinia store


const toast = useToast();
const router = useRouter();
const authStore = useAuthStore(); // Khởi tạo store


const login = ref({ username: '', password: '' });
const usernameError = ref('');
const passwordError = ref('');
const remember = ref(false);


const showPassword = ref(false);
const loading = ref(false);


const isValidUsername = computed(() => login.value.username.trim().length > 8);
const isValidPassword = computed(() => login.value.password.length >= 6);
const canSubmit = computed(() => isValidUsername.value && isValidPassword.value);


watch(() => login.value.username, (val) => {
  if (val.trim().length > 0 && val.trim().length <= 8) {
    usernameError.value = 'Tên đăng nhập phải dài hơn 8 ký tự';
  } else if (usernameError.value === 'Tên đăng nhập phải dài hơn 8 ký tự') {
    usernameError.value = '';
  }
});


watch(() => login.value.password, (val) => {
  if (val.length > 0 && val.length < 6) {
    passwordError.value = 'Mật khẩu phải dài hơn 5 ký tự';
  } else if (passwordError.value === 'Mật khẩu phải dài hơn 5 ký tự') {
    passwordError.value = '';
  }
});


const dangNhap = async () => {
  usernameError.value = '';
  passwordError.value = '';


  if (!canSubmit.value) {
    toast.error('Vui lòng kiểm tra lại thông tin đăng nhập.');
    return;
  }


  loading.value = true;


  try {
    const response = await axios.post(
      'http://localhost:8080/login-customer',
      login.value,
      { withCredentials: true }
    );


    if (response.data && response.data.data) {
      const userData = response.data.data;
     
      // *** ĐIỂM SỬA CHỮA QUAN TRỌNG NHẤT ***
      // Gọi action từ Pinia store để lưu trạng thái
      // Giả sử API trả về token trong `userData.token`
      // Nếu API không trả về token, bạn có thể tạo một giá trị duy nhất
      // Ví dụ: `const token = 'your-unique-token';` hoặc `userData.token`
      const token = 'fake_token_' + userData.id; // Nếu backend không trả về token
     
      authStore.setLoginData(userData, token);


      console.log('Đăng nhập thành công:', userData);
      toast.success('Đăng nhập thành công!');


      setTimeout(() => {
        router.push('/coolmen');
      }, 500);


    } else if (response.data && response.data.message) {
      const msg = response.data.message;
      if (msg.toLowerCase().includes('tài khoản') || msg.toLowerCase().includes('username')) {
        usernameError.value = msg;
      } else if (msg.toLowerCase().includes('mật khẩu') || msg.toLowerCase().includes('password')) {
        passwordError.value = msg;
      } else {
        usernameError.value = msg;
      }
      toast.error(msg);
    } else {
      usernameError.value = 'Đăng nhập thất bại: Phản hồi không hợp lệ từ máy chủ.';
      toast.error('Đăng nhập thất bại: Phản hồi không hợp lệ từ máy chủ.');
    }
  } catch (err) {
    console.error('Lỗi khi gửi yêu cầu đăng nhập:', err);
    if (err.response) {
      const message = err.response.data?.message || 'Đã xảy ra lỗi khi đăng nhập.';
      if (err.response.status === 401 || err.response.status === 403) {
        usernameError.value = message;
        toast.error('Sai tên đăng nhập hoặc mật khẩu, hoặc bạn không có quyền truy cập.');
      } else if (err.response.status === 404) {
        usernameError.value = message;
        toast.error('Tài khoản không tồn tại hoặc dịch vụ không khả dụng.');
      } else if (err.response.status === 400) {
        usernameError.value = message;
        toast.error('Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra lại.');
      } else {
        usernameError.value = message;
        toast.error('Lỗi máy chủ: Vui lòng thử lại sau!');
      }
    } else if (err.request) {
      usernameError.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng của bạn.';
      toast.error('Lỗi kết nối mạng: Vui lòng kiểm tra lại!');
    } else {
      usernameError.value = 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
      toast.error('Đã xảy ra lỗi không mong muốn.');
    }
  } finally {
    loading.value = false;
  }
};
</script>




<style scoped>
/* Common Styles from your first (new) template */
.btn-google {
  margin-top: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  color: #3c4043;
  border: 1px solid #dadce0;
  border-radius: 999px; /* Bo tròn giống hình bạn gửi */
  padding: 10px 80px;
  font-size: 16px;
  font-weight: bold;
  text-decoration: none;
  gap: 10px; /* Khoảng cách giữa logo và chữ */
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}




.btn-google img {
  width: 20px;
  height: 20px;
}




.btn-google:hover {
  background-color: #f7f8f8;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
/* layout chính */
.auth-wrapper {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', 'Arial', sans-serif;
}




/* LEFT: visual lớn */
.auth-left {
  flex: 0 0 60%;
  min-height: 100vh;
  background: linear-gradient(120deg, #8ac7d9 0%, #e9a48d 50%, #a7c5e6 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}




/* overlay để có thể thay bằng ảnh thật: */
.left-overlay {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url('@/assets/left-visual.jpg'); /* <-- THAY ĐƯỜNG DẪN ẢNH TẠI ĐÂY nếu có */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}




/* quả cầu mềm mại (nếu không có ảnh) */
.orb {
  position: absolute;
  width: 520px;
  height: 520px;
  left: 8%;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, rgba(255,180,170,0.95), rgba(180,210,245,0.85) 40%, rgba(240,200,220,0.7) 70%, rgba(255,255,255,0.05));
  filter: blur(6px);
  box-shadow: inset -40px -30px 80px rgba(0,0,0,0.06), 0 30px 80px rgba(0,0,0,0.08);
  pointer-events: none;
}




/* RIGHT: form trắng */
.auth-right {
  flex: 0 0 40%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  padding: 60px 40px;
}




.form-card {
  width: 100%;
  max-width: 380px;
  text-align: left;
}




.logo {
  text-align: center;
  margin-bottom: 12px;
}
.logo img { max-width: 100px; display: inline-block; }




/* typography */
h1 {
  margin: 6px 0 8px;
  color: #0a2c57;
  font-size: 26px;
  font-weight: 700;
  text-align: center;
}
.subtitle {
  color: #7a7a7a;
  font-size: 13px;
  margin-bottom: 22px;
  text-align: center;
}




/* form elements */
.form-group { margin-bottom: 16px; }
.form-group label { display:block; font-weight:600; color:#444; margin-bottom:6px; font-size:14px; }
.form-group input[type="text"],
.form-group input[type="password"],
.form-group input[type="email"] {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 14px;
  transition: box-shadow .15s, border-color .15s;
  background: #fff;
  box-sizing: border-box;
}
.form-group input:focus {
  outline: none;
  border-color: #c3d6f0;
  box-shadow: 0 6px 18px rgba(10,44,87,0.06);
}




/* lỗi */
.is-invalid {
  border-color: #e74c3c !important;
}
.invalid-feedback {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 6px;
}




/* password field */
.password-field {
  position: relative;
}




/* extras */
.form-extra {
  display:flex;
  justify-content:flex-end;
  align-items:center;
  margin: 12px 0 8px;
  font-size: 14px;
}
.forgot { color:#0a2c57; text-decoration:none; font-weight:600 }
.forgot:hover { text-decoration: underline; }




/* submit */
.btn-submit {
  width:100%;
  padding: 12px;
  border-radius: 999px;
  border: none;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  transition: transform .12s ease, box-shadow .12s ease;
  background: #0a2c57;
  color: #fff;
  box-shadow: 0 6px 18px rgba(10,44,87,0.12);
}
.btn-submit:hover:not(:disabled) { transform: translateY(-1px); }
.btn-submit:active { transform: translateY(1px); }
.btn-submit.btn-disabled,
.btn-submit[disabled] {
  background: #cfcfcf;
  color: #f5f5f5;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}




/* bottom line */
.signup-line {
  margin-top: 14px;
  text-align:center;
  color:#777;
  font-size:14px;
}
.signup-line a { color:#0a2c57; font-weight:600; text-decoration: none; }
.signup-line a:hover { text-decoration: underline; }




/* responsive */
@media (max-width: 900px) {
  .auth-wrapper { flex-direction: column; }
  .auth-left { flex: none; width:100%; min-height: 320px; }
  .auth-right { flex: none; width:100%; padding: 30px 20px; }
  .orb { left: 50%; transform: translate(-50%,-50%); width: 420px; height:420px; }
}
</style>











