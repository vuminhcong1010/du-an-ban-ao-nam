<template>
  <div class="auth-wrapper">
    <!-- LEFT VISUAL -->
    <div class="auth-left">
      <div class="left-overlay">
        <div class="orb"></div>
      </div>
    </div>

    <!-- RIGHT FORM -->
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
          <p class="signup-line">Chưa có tài khoản? <router-link to="/coolmen/dang-ki-khach-hang">Đăng ký</router-link></p>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import Cookies from 'js-cookie'
import { useToast } from 'vue-toastification'
const toast = useToast()

const login = ref({ username: '', password: '' })
const usernameError = ref('')
const passwordError = ref('')
const remember = ref(false)

const showPassword = ref(false)
const loading = ref(false)

// Theo yêu cầu: username > 8 ký tự, password > 6 ký tự
const canSubmit = computed(() => {
  return login.value.username.trim().length > 8 &&
         login.value.password.length >= 6 
})

// Watch để validate ngay khi gõ
watch(() => login.value.username, (val) => {
  // Chỉ hiển thị lỗi validation khi người dùng đang gõ, không hiển thị lỗi từ server
  if (val.trim().length > 0 && val.trim().length <= 8) {
    if (!usernameError.value || usernameError.value === 'Tên đăng nhập phải dài hơn 8 ký tự') {
      usernameError.value = 'Tên đăng nhập phải dài hơn 8 ký tự'
    }
  } else if (val.trim().length > 8) {
    // Clear validation error, nhưng giữ nguyên server error
    if (usernameError.value === 'Tên đăng nhập phải dài hơn 8 ký tự') {
      usernameError.value = ''
    }
  }
})

watch(() => login.value.password, (val) => {
  // Chỉ hiển thị lỗi validation khi người dùng đang gõ, không hiển thị lỗi từ server
  if (val.length > 0 && val.length <= 6) {
    if (!passwordError.value || passwordError.value === 'Mật khẩu phải dài hơn 5 ký tự') {
      passwordError.value = 'Mật khẩu phải dài hơn 5 ký tự'
    }
  } else if (val.length > 6) {
    // Clear validation error, nhưng giữ nguyên server error
    if (passwordError.value === 'Mật khẩu phải dài hơn 5 ký tự') {
      passwordError.value = ''
    }
  }
})

const dangNhap = async () => {
  // Validate form cơ bản trước khi gửi request
  if (login.value.username.trim().length <= 8) {
    usernameError.value = 'Tên đăng nhập phải dài hơn 8 ký tự'
  }
  if (login.value.password.length <= 6) {
    passwordError.value = 'Mật khẩu phải dài hơn 5 ký tự'
  }
  
  if (!canSubmit.value) {
    toast.error('Vui lòng kiểm tra lại thông tin đăng nhập')
    return
  }

  loading.value = true
  
  // Clear previous server errors, giữ nguyên validation errors
  if (usernameError.value && usernameError.value !== 'Tên đăng nhập phải dài hơn 8 ký tự') {
    usernameError.value = ''
  }
  if (passwordError.value && passwordError.value !== 'Mật khẩu phải dài hơn 5 ký tự') {
    passwordError.value = ''
  }

  try {
    const response = await axios.post(
      'http://localhost:8080/login-customer',
      login.value,
      { withCredentials: true }
    )

    if (response?.data?.data === false || response?.data?.status === 'error') {
      const msg = response?.data?.message || 'Đăng nhập thất bại'
      
      // Phân loại lỗi dựa trên message từ server
      if (msg.toLowerCase().includes('tài khoản') || 
          msg.toLowerCase().includes('username') ||
          msg.toLowerCase().includes('không tồn tại') ||
          msg.toLowerCase().includes('không tìm thấy')) {
        usernameError.value = msg
      } else if (msg.toLowerCase().includes('mật khẩu') || 
                 msg.toLowerCase().includes('password') ||
                 msg.toLowerCase().includes('sai mật khẩu')) {
        passwordError.value = msg
      } else if (msg.toLowerCase().includes('tài khoản hoặc mật khẩu') ||
                 msg.toLowerCase().includes('đăng nhập thất bại')) {
        // Lỗi chung, hiển thị ở trường username
        usernameError.value = msg
      } else {
        // Lỗi không xác định, hiển thị ở trường username
        usernameError.value = msg
      }
      
      toast.error(msg)
    } else {
      // Đăng nhập thành công
      Cookies.set('thongTinKhachHang', JSON.stringify(response.data.data), { 
        expires: remember.value ? 7 : 0.3 
      })
       const thongTin = JSON.parse(Cookies.get("thongTinKhachHang"));
      console.log(thongTin);
      toast.success('Đăng nhập thành công')
      
      // Delay nhỏ để user thấy thông báo thành công
      // setTimeout(() => {
      //   window.location.href = '/coolmen'
      // }, 1000)
    }
  } catch (err) {
    console.error('Login error:', err)
    
    if (err.response) {
      // Server trả về response với status error
      const status = err.response.status
      const message = err.response.data?.message
      
      if (status === 401) {
        // Unauthorized - thường là sai username/password
        usernameError.value = message || 'Tài khoản hoặc mật khẩu không đúng'
      } else if (status === 404) {
        // Not found - thường là không tìm thấy user
        usernameError.value = message || 'Tài khoản không tồn tại'
      } else if (status === 400) {
        // Bad request - có thể là validation error
        usernameError.value = message || 'Thông tin đăng nhập không hợp lệ'
      } else {
        // Server error khác
        usernameError.value = message || 'Có lỗi xảy ra từ máy chủ'
      }
      
      toast.error(usernameError.value)
    } else if (err.request) {
      // Network error - không thể kết nối được server
      const message = 'Lỗi kết nối đến máy chủ. Vui lòng thử lại!'
      usernameError.value = message
      toast.error(message)
    } else {
      // Lỗi khác
      const message = 'Có lỗi xảy ra. Vui lòng thử lại!'
      usernameError.value = message
      toast.error(message)
    }
  } finally {
    loading.value = false
  }
}


</script>

<style scoped>
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
  background-image: url('/assets/left-visual.jpg'); /* <-- THAY ĐƯỜNG DẪN ẢNH TẠI ĐÂY nếu có */
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