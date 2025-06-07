<script setup lang="ts">
import { Bell, Mail, User } from 'lucide-vue-next'
// import logo from './src/assets/logo.png'  


</script>

<template>
  <header class="bg-white d-flex justify-content-between align-items-center p-3 border-bottom">
    <div class="fw-bold fs-3" style="color: red">
      <!-- <span> <img :src="logo" alt="logo" style="width: 10%; margin-left: 15px;"> </span> -->
    </div>
    <div class="d-flex align-items-center gap-3">
      <i class="bi bi-envelope-fill fs-5"> <Mail></Mail> </i>
      <i class="bi bi-bell fs-5"> <Bell></Bell> </i>
      <i class="bi bi-person-circle fs-4"> <User></User> </i>
      <div class="fw-medium">Admin CoolMen</div>
    </div>
  </header>
</template>
