<script setup lang="ts">
import { Bell, Mail, User,Key,Lock } from "lucide-vue-next";
import logo from "@/assets/logo.png"; // Import logo image
import Cookies from 'js-cookie'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from "axios";
import { useToast } from "vue-toastification";

const toast = useToast();
const router = useRouter()   // ✅ Dùng useRouter thay vì useRoute

const token = Cookies.get('token')
let trangThai = ref(true)
let tenNhanVien = ref()
let image = ref()

let req = {
  token: token
}

if (!token) {
  trangThai.value = false
} else {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp
    const now = Math.floor(Date.now() / 1000)
    image.value =`http://localhost:8080`+payload.anh
    console.log('image.value', payload.anh);
    tenNhanVien.value = payload.tenNhanVien
    if (exp <= now) {
      console.warn("⛔ Token đã hết hạn")
      Cookies.remove('token')       // ❌ Xóa token cũ
      trangThai.value = false
      router.push('/login')         // 👉 Điều hướng sang login
    } else {
      trangThai.value = true
    }

  } catch (err) {
    Cookies.remove('token')
    trangThai.value = false
    router.push('/login')
  }
}

const form = ref({
  token: token,
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const message = ref('');
let dieuKien = ref()
const handleSubmit = () => {
  if (form.value.newPassword !== form.value.confirmPassword) {
    toast.error('Mật khẩu xác nhận không khớp.');
    return;
  }

  if (form.value.newPassword.length < 6) {
    toast.error('Mật khẩu mới phải có ít nhất 6 ký tự.');
    return;
  }

  axios.post("http://localhost:8080/doi-mat-khau",form.value).then(Response =>{
    dieuKien.value = Response.data.data
    message.value=Response.data.message
    if(Boolean(dieuKien.value)){
    toast.success(message.value)
    }else{
      toast.error(message.value)
    }
  })
  
  // Reset sau khi thành công (ví dụ thôi)
  form.value.oldPassword = '';
  form.value.newPassword = '';
  form.value.confirmPassword = '';
};

function removeToken(){
  axios.post("http://localhost:8080/log-out",req)
  Cookies.remove('token')
  window.location.href = "/dang-nhap"
  trangThai.value = false

}
</script>

<template>
  <header
    class="bg-white d-flex justify-content-between align-items-center p-3 border-bottom" style="height: 85px;" v-if="trangThai"
  >
    <div class="fw-bold fs-3 d-flex align-items-center"
      style="color: red; height: 100%">
      
        <img :src="logo" alt="logo" style="width: 90px; margin-left: 28px" />
      
    </div>
    <div class="d-flex align-items-center gap-3">
      <i class="bi bi-envelope-fill fs-5"> <Mail></Mail> </i>
      <i class="bi bi-bell fs-5"> <Bell></Bell> </i>
      <!-- <i class="bi bi-person-circle fs-4"> <User></User> </i>
      <div class="fw-medium">Admin CoolMen</div> -->
      <div class="dropdown">
  <!-- Kích hoạt dropdown -->
  <div
    class="d-flex align-items-center dropdown-toggle"
    role="button"
    data-bs-toggle="dropdown"
    aria-expanded="false"
  >
    <img :src="image" alt="Avatar" class="rounded-circle" style="width: 32px; height: 32px; object-fit: cover;">
    <div class="fw-medium ms-2">{{ tenNhanVien }}</div>
  </div>

  <!-- Menu xổ xuống -->
  <ul class="dropdown-menu">
    <li><a class="dropdown-item fw-medium" href="/thong-tin-ca-nhan"><i class="fa-regular fa-user me-2"></i>Thông tin cá nhân</a></li>
    <li><a class="dropdown-item fw-medium" data-bs-toggle="modal" data-bs-target="#doimatkhau"><Lock class="mb-1 me-1" style="width: 19px; height: 19px;margin-left: -3px;" /> Đổi mật khẩu</a></li>
    <li><div class="dropdown-item fw-medium" @click="removeToken()"><i class="fa-solid fa-arrow-right-from-bracket me-2"></i>Logout</div></li>
  </ul>
</div>
    </div>
  </header>
  

<!-- Modal -->
<div class="modal fade" id="doimatkhau" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <!-- <h1 class="modal-title fs-5" id="exampleModalLabel">Modal title</h1> -->
         <h1 class="modal-title fs-5" id="exampleModalLabel">Đổi mật khẩu</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

      <!-- Mật khẩu cũ -->
      <div class="form-group">
        <label for="oldPassword">Mật khẩu cũ</label>
        <input
          type="password"
          id="oldPassword"
          v-model="form.oldPassword"
          class="form-control mb-2"
          required
        />
      </div>

      <!-- Mật khẩu mới -->
      <div class="form-group">
        <label for="newPassword">Mật khẩu mới</label>
        <input
          type="password"
          id="newPassword"
          v-model="form.newPassword"
          class="form-control mb-2"
          required
        />
      </div>

      <!-- Xác nhận mật khẩu mới -->
      <div class="form-group">
        <label for="confirmPassword">Xác nhận mật khẩu mới</label>
        <input
          type="password"
          id="confirmPassword"
          v-model="form.confirmPassword"
          class="form-control mb-2"
          required
        />
      </div>

     
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        <button type="button" class="btn" style="background-color: #0a2c57 !important;color: white !important;" @click="handleSubmit">Save changes</button>
      </div>
    </div>
  </div>
</div>

</template>
<style scoped>
.dropdown-item:active,
.dropdown-item:focus,
.dropdown-item:hover {
  background-color: #0a2c57 !important;
  color: white !important;
}

  
</style>