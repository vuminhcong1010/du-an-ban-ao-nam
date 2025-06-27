<script setup lang="ts">
import {
  BarChart,
  DollarSign,
  FileText,
  Home,
  Package,
  Percent,
  Ticket,
  User,
  UserCog
} from 'lucide-vue-next';
import { RouterLink, useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
    <aside class="bg-white border-end h-100 p-3 d-flex flex-column" style="width: 200px">
  <ul class="nav flex-column gap-2">
      <li>
        <RouterLink
          to="/"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/' }"
        >
          <Home :size="18" />
          Trang Chủ
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/ban-hang"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/ban-hang' }"
        >
          <DollarSign :size="18" />
          Bán Hàng
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/hoa-don"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/hoa-don' }"
        >
          <FileText :size="18" />
          Hóa Đơn
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/san-pham"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/san-pham' }"
        >
          <Package :size="18" />
          Sản Phẩm
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/phieu-giam-gia"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/phieu-giam-gia' }"
        >
          <Ticket :size="18" />
          Phiếu Giảm Giá
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/dot-giam-gia"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/dot-giam-gia' }"
        >
          <Percent :size="18" />
          Đợt Giảm Giá
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/nhan-vien"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/nhan-vien' }"
        >
          <UserCog :size="18" />
          Nhân Viên
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/khach-hang"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/khach-hang' }"
        >
          <User :size="18" />
          Khách Hàng
        </RouterLink>
      </li>
      <li>
        <RouterLink
          to="/thong-ke"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1"
          :class="{ 'bg-light': route.path === '/thong-ke' }"
        >
          <BarChart :size="18" />
          Thống Kê
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>


<style scoped>
.nav-link {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.nav-link:hover {
  background-color: #e2e6ea !important; /* Tối hơn một chút so với bg-light (#f8f9fa) */
}
</style>