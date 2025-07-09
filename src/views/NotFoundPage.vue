<template>
  <div class="not-found-page">
    <div class="not-found-container">
      <h1>404</h1>
      <h2>Trang không tìm thấy</h2>
      <p>Xin lỗi, trang bạn đang tìm không tồn tại.</p>
      <router-link to="/" class="home-button">Về trang chủ</router-link>
    </div>
  </div>
</template>

<script setup>
// Không cần logic đặc biệt cho trang 404 này
</script>

<style scoped>
.not-found-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa; /* Màu nền nhẹ */
  font-family: 'Arial', sans-serif;
  color: #333;
  text-align: center;
}

.not-found-container {
  background: #ffffff;
  padding: 50px;
  border-radius: 10px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
}

h1 {
  font-size: 6em;
  margin-bottom: 10px;
  color: #0a2c57; /* Màu chủ đạo của bạn */
}

h2 {
  font-size: 2em;
  margin-bottom: 20px;
  color: #555;
}

p {
  font-size: 1.1em;
  margin-bottom: 30px;
  color: #777;
}

.home-button {
  display: inline-block;
  padding: 12px 25px;
  background-color: #0a2c57; /* Màu chủ đạo */
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 600;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.home-button:hover {
  background-color: #071f3e;
  transform: translateY(-2px);
}
</style>