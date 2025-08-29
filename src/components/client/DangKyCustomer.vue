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
      <div class="form-card" role="main" aria-labelledby="register-title">
        <div class="logo">
          <img src="@/assets/logo.png" alt="CoolMen Logo" />
        </div>


        <h1 id="register-title">Đăng ký</h1>
        <p class="subtitle">Tạo tài khoản mới để trải nghiệm CoolMen</p>


        <form @submit.prevent="dangKy" novalidate>
          <!-- Email -->
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              v-model.trim="register.email"
              :class="{ 'is-invalid': emailError }"
              :aria-invalid="!!emailError"
              required
               placeholder="Nhập email"
            />
            <div class="invalid-feedback" v-if="emailError">{{ emailError }}</div>
          </div>


          <div class="form-group otp-group">
  <label for="otp">Xác nhận OTP</label>
  <div class="otp-wrapper d-flex align-items-center gap-2">
    <input
      id="otp"
      type="text"
      v-model.trim="register.otp"
      maxlength="6"
      class="form-control"
      :class="{ 'is-invalid': otpError }"
      :aria-invalid="!!otpError"
      required
      placeholder="Nhập mã OTP"
    />
    <button
      type="button"
      class="btn btn-otp"
      style="white-space: nowrap;background-color: #0a2c57;"
      @click="guiOTP"
      :disabled="loadingOTP"
    >
      <span v-if="loadingOTP">Đang gửi...</span>
      <span v-else style="color: white;">Gửi OTP</span>
    </button>
  </div>
  <div class="invalid-feedback" v-if="otpError">{{ otpError }}</div>
</div>




          <!-- Password -->
          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="register.password"
              :class="{ 'is-invalid': passwordError }"
              :aria-invalid="!!passwordError"
              required
               placeholder="Nhập mật khẩu"
            />
            <div class="invalid-feedback" v-if="passwordError">{{ passwordError }}</div>
          </div>


          <!-- Confirm Password -->
          <div class="form-group">
            <label for="confirmPassword">Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              v-model="register.confirmPassword"
              :class="{ 'is-invalid': confirmPasswordError }"
              :aria-invalid="!!confirmPasswordError"
               placeholder="Xác nhận mật khẩu"
              required
            />
            <div class="invalid-feedback" v-if="confirmPasswordError">{{ confirmPasswordError }}</div>
          </div>


          <button
            class="btn-submit"
            type="submit"
            :disabled="loading"
            :class="{ 'btn-disabled': loading }"
          >
            <span v-if="loading">Đang xử lý...</span>
            <span v-else>Đăng ký</span>
          </button>


          <p class="signup-line">
            Đã có tài khoản? <router-link to="/coolmen/dang-nhap-khach-hang">Đăng nhập</router-link>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, watch } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
const toast = useToast()


const register = ref({
  email: '',
  otp: '',
  password: '',
  confirmPassword: ''
})


const emailError = ref('')
const otpError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')


const showPassword = ref(false)
const loading = ref(false)
const loadingOTP = ref(false)


const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


watch(() => register.value.email, (val) => {
  if (val.trim() && !emailRegex.test(val)) {
    emailError.value = 'Email không hợp lệ'
  } else {
    emailError.value = ''
  }
})


watch(() => register.value.otp, (val) => {
  if (val.trim().length > 0 && val.trim().length < 6) {
    otpError.value = 'OTP phải có 6 ký tự'
  } else {
    otpError.value = ''
  }
})


watch(() => register.value.password, (val) => {
  if (val.length > 0 && val.length < 6) {
    passwordError.value = 'Mật khẩu phải dài hơn 5 ký tự'
  } else {
    passwordError.value = ''
  }
})


watch([() => register.value.password, () => register.value.confirmPassword], () => {
  if (register.value.confirmPassword && register.value.confirmPassword !== register.value.password) {
    confirmPasswordError.value = 'Mật khẩu xác nhận không khớp'
  } else {
    confirmPasswordError.value = ''
  }
})


const guiOTP = async () => {
  if (!emailRegex.test(register.value.email)) {
    toast.error('Vui lòng nhập email hợp lệ để gửi OTP')
    return
  }
  loadingOTP.value = true
  try {
    await axios.post(`http://localhost:8080/send-otp?email=${encodeURIComponent(register.value.email)}`)
    toast.success('OTP đã được gửi tới email của bạn')
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi khi gửi OTP')
  } finally {
    loadingOTP.value = false
  }
}




const dangKy = async () => {
  if (!emailRegex.test(register.value.email) || register.value.otp.length !== 6 || register.value.password.length < 6 || register.value.confirmPassword !== register.value.password) {
    toast.error('Vui lòng kiểm tra lại thông tin đăng ký')
    return
  }


  loading.value = true
  try {
    const res = await axios.post('http://localhost:8080/register-customer', register.value)


    if (res?.data?.status === 'error') {
      toast.error(res.data.message || 'Đăng ký thất bại email này đã được đăng kí')
    } else {
      toast.success('Đăng ký thành công, vui lòng đăng nhập')
      setTimeout(() => {
        window.location.href = '/coolmen/dang-nhap-khach-hang'
      }, 1000)
    }
  } catch (err) {
    toast.error(err.response?.data?.message || 'Lỗi kết nối máy chủ')
  } finally {
    loading.value = false
  }
}
</script>




<style scoped>
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


/* overlay để có thể thay bằng ảnh thật */
.left-overlay {
  width: 100%;
  height: 100%;
  position: relative;
  background-image: url('/assets/left-visual.jpg'); /* Thay ảnh nếu có */
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}


/* quả cầu mềm mại */
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
.logo img {
  max-width: 100px;
  display: inline-block;
}


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
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-weight: 600;
  color: #444;
  margin-bottom: 6px;
  font-size: 14px;
}
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
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin: 12px 0 8px;
  font-size: 14px;
}
.forgot {
  color: #0a2c57;
  text-decoration: none;
  font-weight: 600;
}
.forgot:hover {
  text-decoration: underline;
}


/* submit */
.btn-submit {
  width: 100%;
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
.btn-submit:hover:not(:disabled) {
  transform: translateY(-1px);
}
.btn-submit:active {
  transform: translateY(1px);
}
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
  text-align: center;
  color: #777;
  font-size: 14px;
}
.signup-line a {
  color: #0a2c57;
  font-weight: 600;
  text-decoration: none;
}
.signup-line a:hover {
  text-decoration: underline;
}


/* responsive */
@media (max-width: 900px) {
  .auth-wrapper {
    flex-direction: column;
  }
  .auth-left {
    flex: none;
    width: 100%;
    min-height: 320px;
  }
  .auth-right {
    flex: none;
    width: 100%;
    padding: 30px 20px;
  }
  .orb {
    left: 50%;
    transform: translate(-50%, -50%);
    width: 420px;
    height: 420px;
  }
}


</style>



