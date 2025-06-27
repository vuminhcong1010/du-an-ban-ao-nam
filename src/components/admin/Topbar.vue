<script setup lang="ts">
import { Bell, Mail, User } from "lucide-vue-next";
import logo from "@/assets/logo.png";
</script>

<template>
  <header
    class="bg-white d-flex justify-content-between align-items-center p-3 border-bottom" style="height: 85px;"
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
    </div>
  </header>
</template>
