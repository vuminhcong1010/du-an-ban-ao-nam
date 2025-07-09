<template>
  <div class="home-page-container">
    <h1>Chào mừng đến với Trang Chủ CoolMen!</h1>
    <p>Đây là trang giới thiệu hoặc tổng quan cho hệ thống quản lý của bạn.</p>
    <p>Bạn có thể tùy chỉnh nội dung này để hiển thị các thông tin quan trọng như:</p>
    <ul>
      <li>Thống kê nhanh về doanh số, đơn hàng, sản phẩm.</li>
      <li>Các thông báo quan trọng cho nhân viên hoặc admin.</li>
      <li>Liên kết nhanh đến các chức năng thường dùng.</li>
    </ul>
    <div class="card p-3 mt-4">
      <h3>Bắt đầu khám phá</h3>
      <p>Sử dụng thanh điều hướng bên trái để truy cập các chức năng quản lý khác nhau.</p>
    </div>
  </div>
</template>

<script setup>
// Bạn có thể thêm logic JavaScript ở đây nếu cần, ví dụ:
// - Lấy dữ liệu thống kê từ API
// - Hiển thị tên người dùng
// import { ref, onMounted } from 'vue';
// const userName = ref('');
// onMounted(() => {
//   userName.value = localStorage.getItem('userName') || 'Người dùng';
// });
</script>

<style scoped>
.home-page-container {
  padding: 20px;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  max-width: 900px;
  margin: 20px auto;
}

h1 {
  color: #0a2c57; /* Màu xanh đậm của CoolMen */
  margin-bottom: 20px;
}

p {
  font-size: 1.1em;
  line-height: 1.6;
  margin-bottom: 10px;
}

ul {
  list-style-type: disc;
  margin-left: 20px;
  margin-bottom: 20px;
}

ul li {
  margin-bottom: 5px;
}

.card {
  border: 1px solid #e0e0e0;
  background-color: #f8f9fa; /* Bootstrap bg-light */
}

h3 {
  color: #333;
  margin-bottom: 10px;
}
</style>