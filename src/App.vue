<script setup>
import Sidebar from './components/admin/Sidebar.vue';
import Topbar from './components/admin/Topbar.vue';



</script>


<template>
<div class="d-flex flex-column vh-100">
    <Topbar></Topbar>
    <div class="d-flex flex-grow-1">
      <Sidebar></Sidebar>
      <main class="flex-grow-1 bg-light p-4">
        <!-- Nội dung chính -->
         <RouterView></RouterView>
      </main>
    </div>
  </div>
</template>
