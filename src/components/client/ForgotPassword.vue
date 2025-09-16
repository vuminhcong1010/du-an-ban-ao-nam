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

        <form @submit.prevent="guiYeuCau()">
        <div class="form-group mb-3">
          <label for="email">Email</label>
          <input
            type="email"
            id="email"
            v-model="req.email"
            class="form-control"
            :class="{ 'is-invalid': emailError }"
            required
            autocomplete="email"
          >
          <div class="invalid-feedback" v-if="emailError">{{ emailError }}</div>
        </div>


        <button type="submit" class="btn  w-100 " style="background-color: #0a2c57;color: white;" :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-if="isLoading"> Đang gửi...</span>
          <span v-else>Gửi yêu cầu</span>
        </button>

        <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </form>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue';
import axios from 'axios';
import {useToast} from "vue-toastification";
const toast = useToast();
const emailError = ref('');
const successMessage = ref('');
const errorMessage = ref('');
const isLoading = ref(false);
const req = ref({
  email: ''
});

const guiYeuCau = async () => {
  emailError.value = '';
  successMessage.value = '';
  errorMessage.value = '';
  isLoading.value = true;

  if (!req.value.email) {
    emailError.value = 'Vui lòng nhập email.';
    isLoading.value = false;
    return;
  }

  try {
    await axios.post('http://localhost:8080/quen-mat-khau-client', req.value);
    toast.success("Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn!")
    setTimeout(()=>{
      window.location.href = "/coolmen/dang-nhap-khach-hang"
    },2200)
  } catch (error) {
    console.error(error);
    toast.error("Email không tồn tại trong hệ thống vui lòng kiểm tra lại")
  } finally {
    isLoading.value = false;
  }
};
</script>





<style scoped>
.spinner {
  border: 3px solid #f3f3f3; /* Light grey */
  border-top: 3px solid white; /* White */
  border-radius: 50%;
  width: 16px;
  height: 16px;
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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



