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
      </main>
    </div>
  </div>
</template>
