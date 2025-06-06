<script setup>
import Sidebar from './components/admin/Sidebar.vue'
import Topbar from './components/admin/Topbar.vue'
</script>

<template>
  <div class="d-flex flex-column" style="height: 100vh; overflow: hidden">
    <div style="height: 56px">
      <Topbar />
    </div>
    <div class="d-flex flex-grow-1" style="overflow: hidden">
      <Sidebar />
      <main class="flex-grow-1 bg-light p-4" style="overflow-y: auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

