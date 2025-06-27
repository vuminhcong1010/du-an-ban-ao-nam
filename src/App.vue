<script setup>

import Sidebar from './components/admin/Sidebar.vue';
import Topbar from './components/admin/Topbar.vue';
import { ref } from 'vue'
import vSelect from 'vue3-select'
import 'vue3-select/dist/vue3-select.css'

const selected = ref(null)
const options = ref(['Đỏ', 'Xanh', 'Vàng'])

const addOption = (newOption) => {
  options.value.push(newOption)
  selected.value = newOption
}


import { ref, provide } from 'vue'
import Sidebar from './components/admin/Sidebar.vue'
import Topbar from './components/admin/Topbar.vue'

const showSidebar = ref(true)
function toggleSidebar() {
  showSidebar.value = !showSidebar.value

provide('toggleSidebar', toggleSidebar)
</script>

<template>
<div class="d-flex flex-column vh-100">
    <Topbar></Topbar>
    <div class="d-flex flex-grow-1">
      <Sidebar></Sidebar>
      <main class="flex-grow-1 bg-light p-4">
        <template>
  <v-select
    v-model="selected"
    :options="options"
    :taggable="true"
    @new-option="addOption"
    placeholder="Chọn hoặc nhập mới"
  />
</template>

         <RouterView></RouterView>
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

