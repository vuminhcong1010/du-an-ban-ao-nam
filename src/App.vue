<script setup>
import { ref, provide } from 'vue'
import Sidebar from './components/admin/Sidebar.vue'
import Topbar from './components/admin/Topbar.vue'

const showSidebar = ref(true)
function toggleSidebar() {
  showSidebar.value = !showSidebar.value
}
provide('toggleSidebar', toggleSidebar)
</script>

<template>
  <div class="d-flex flex-column" style="height: 100vh; overflow: hidden">
    <div style="height: 56px">
      <Topbar />
    </div>
    <div class="d-flex flex-grow-1" style="overflow: hidden">
      <Sidebar v-if="showSidebar" />
      <main class="flex-grow-1 bg-light p-4" style="overflow-y: auto">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<style>
</style>

