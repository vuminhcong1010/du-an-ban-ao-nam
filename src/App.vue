<template>
  <div id="app-wrapper">
    <router-view></router-view>
  </div>
</template>

<script setup>
// Không cần import Sidebar hay Topbar ở đây nữa
// Các script khác liên quan đến ứng dụng tổng thể (ví dụ: Toast, Bootstrap) có thể giữ lại nếu bạn muốn chúng có sẵn ở mọi nơi
</script>

<style>
/* Đặt các style CSS toàn cục cho body, html, #app */
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
}
#app-wrapper { /* Đổi id để tránh xung đột với #app trong index.html */
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
</style>