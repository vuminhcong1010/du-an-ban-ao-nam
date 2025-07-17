<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="logo text-center">
        <img src="../../assets/logo.png" alt="CoolMen Logo">
      </div>
      <h2 class="text-center">Quên mật khẩu</h2>
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

        <button type="submit" class="btn btn-primary w-100 " :disabled="isLoading">
          <span v-if="isLoading" class="spinner"></span>
          <span v-if="isLoading"> Đang gửi...</span>
          <span v-else>Gửi yêu cầu</span>
        </button>

        <div class="success-message" v-if="successMessage">{{ successMessage }}</div>
        <div class="error-message" v-if="errorMessage">{{ errorMessage }}</div>
      </form>

      <div class="text-center mt-3">
        <router-link to="/login">Quay lại đăng nhập</router-link>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref } from 'vue';
import axios from 'axios';

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
    await axios.post('http://localhost:8080/quen-mat-khau', req.value);
    successMessage.value = 'Yêu cầu đã được gửi. Vui lòng kiểm tra email của bạn!';
  } catch (error) {
    console.error(error);
    errorMessage.value = 'Gửi yêu cầu thất bại. Vui lòng thử lại.';
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
/* Copy toàn bộ style từ trang đăng nhập của bạn */
.auth-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(to bottom, #f0f8ff, #ffffff);
  font-family: 'Arial', sans-serif;
  color: #333;
}

.auth-container {
  background: #ffffff;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  width: 100%;
  max-width: 400px;
}

.logo {
  margin-bottom: 30px;
}

.logo img {
  max-width: 150px;
  height: auto;
  display: block;
  margin: 0 auto;
}

h2 {
  color: #0a2c57;
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
  box-sizing: border-box;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #0a2c57;
  outline: none;
  box-shadow: 0 0 0 3px rgba(10, 44, 87, 0.1);
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

.invalid-feedback {
  color: #d9534f;
  font-size: 0.875em;
  margin-top: 5px;
}

.error-message {
  color: #d9534f;
  margin-top: 20px;
  font-size: 0.9em;
  background-color: #fce8e6;
  border: 1px solid #d9534f;
  padding: 10px;
  border-radius: 5px;
}

.success-message {
  color: #28a745;
  margin-top: 20px;
  font-size: 0.9em;
  background-color: #d4edda;
  border: 1px solid #28a745;
  padding: 10px;
  border-radius: 5px;
}
</style>
