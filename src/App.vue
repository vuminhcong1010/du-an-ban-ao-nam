<script setup>
import { ref, provide } from 'vue'
import Sidebar from './components/admin/Sidebar.vue'
import Topbar from './components/admin/Topbar.vue'
import vSelect from 'vue3-select'
import 'vue3-select/dist/vue3-select.css'

// Toggle Sidebar
const isSidebarCollapsed = ref(false)
function toggleSidebarCollapse() {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

// v-select
const selected = ref(null)
const options = ref(['Đỏ', 'Xanh', 'Vàng'])

</script>

<template>
  <div class="d-flex flex-column vh-100">
    <Topbar />
    <div class="d-flex flex-grow-1">
      <Sidebar :collapsed="isSidebarCollapsed" :onToggleCollapse="toggleSidebarCollapse" />
      <main class="flex-grow-1 bg-light p-4">
        <!-- Select Box -->
      

        <!-- Router View -->
        <RouterView />
      </main>
    </div>
  </div>
</template>