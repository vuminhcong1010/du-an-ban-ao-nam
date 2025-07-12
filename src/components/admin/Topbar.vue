<script setup lang="ts">
import { Bell, Mail, User } from "lucide-vue-next";
import logo from "@/assets/logo.png"; // Import logo image
import Cookies from 'js-cookie'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()   // ✅ Dùng useRouter thay vì useRoute

const token = Cookies.get('token')
let trangThai = ref(true)

if (!token) {
  trangThai.value = false
} else {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const exp = payload.exp
    const now = Math.floor(Date.now() / 1000)

    if (exp <= now) {
      console.warn("⛔ Token đã hết hạn")
      Cookies.remove('token')       // ❌ Xóa token cũ
      trangThai.value = false
      router.push('/login')         // 👉 Điều hướng sang login
    } else {
      trangThai.value = true
    }

  } catch (err) {
    console.error("❌ Token không hợp lệ", err)
    Cookies.remove('token')
    trangThai.value = false
    router.push('/login')
  }
}

  

function removeToken(){
  Cookies.remove('token')
  window.location.href = "/login"
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
      <i class="bi bi-person-circle fs-4"> <User></User> </i>
      <div class="fw-medium">Admin CoolMen</div>
      <div class="fw-medium" @click="removeToken()">Logout</div>
    </div>
  </header>
</template>