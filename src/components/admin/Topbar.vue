<script setup lang="ts">
import { Bell, Mail, User } from 'lucide-vue-next'

// import logo from './src/assets/logo.png'  


</script>

<template>
  <header class="bg-white d-flex justify-content-between align-items-center p-3 border-bottom">
    <div class="fw-bold fs-3" style="color: red">
      <!-- <span> <img :src="logo" alt="logo" style="width: 10%; margin-left: 15px;"> </span> -->

</script>

<template>
  <header class="bg-white d-flex justify-content-between align-items-center px-2 border-bottom">
    <div class="d-flex align-items-center gap-2">
      <img src="/src/assets/logo.png" alt="COOLMEN logo" class="topbar-logo" />

    </div>
    <div class="d-flex align-items-center gap-3">
      <i class="bi bi-envelope-fill fs-5"> <Mail></Mail> </i>
      <i class="bi bi-bell fs-5"> <Bell></Bell> </i>
      <i class="bi bi-person-circle fs-4"> <User></User> </i>
      <div class="fw-medium">Admin CoolMen</div>
    </div>
  </header>
</template>

<style scoped>
.hamburger-btn {
  background: none;
  border: none;
  padding: 4px 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: background 0.18s;
}
.hamburger-btn:hover {
  background: #f0f0f0;
}
.topbar-logo {
  max-height: 38px;
  max-width: 120px;
  object-fit: contain;
  margin-right: 12px;
}
</style>
