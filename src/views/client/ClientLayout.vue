<template>
  <div class="client-layout">
    <ClientHeader />
    <main class="client-main-content">
      <router-view></router-view>
    </main>
    <ClientFooter />
  </div>
</template>

<script>
import ClientHeader from '@/components/client/Header.vue'
import ClientFooter from '@/components/client/Footer.vue'

export default {
  name: 'ClientLayout',
  components: {
    ClientHeader,
    ClientFooter
  }
}
</script>
<script setup>
import Cookies from 'js-cookie'
Cookies.remove('token')
</script>
<style scoped>
/* CSS cho ClientLayout, chỉ áp dụng cho component này nhờ 'scoped' */
.client-layout {
  min-height: 100vh;
  /* Đảm bảo layout chiếm toàn bộ chiều cao của viewport */
  display: flex;
  /* Sử dụng flexbox */
  flex-direction: column;
  /* Sắp xếp các mục con theo cột */
  /* background-color: #f8f8f8; */
  /* Có thể thêm màu nền chung nếu cần */
}

.client-main-content {
  flex-grow: 1;
  background-color: #F3F4F6;
  /* Cho phép phần nội dung chính chiếm hết không gian còn lại */
  /*
    LƯU Ý QUAN TRỌNG VỀ PADDING VÀ MAX-WIDTH:
    - Nếu bạn muốn Hero Section của HomePage chiếm toàn bộ chiều rộng màn hình,
      thì KHÔNG nên đặt max-width hoặc padding ngang ở đây.
    - Thay vào đó, hãy đặt max-width và padding cho nội dung cụ thể bên trong HomePage
      (ví dụ: cho các section như categories-section, brand-logos-section).
    - Tôi đã xóa padding và max-width mặc định ở đây để Hero Section có thể full width.
  */
  /* padding: 20px; */
  /* max-width: 1200px; */
  /* margin: 0 auto; */
}

/* Các media queries cho responsive design của layout nếu cần */
@media (max-width: 768px) {
  /* Điều chỉnh cho màn hình nhỏ hơn nếu cần */
}
</style>