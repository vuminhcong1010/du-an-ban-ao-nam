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
// import logo from '@/assets/logo.png';

const route = useRoute();
</script>

<template>
  <aside class="sidebar-custom bg-white border-end h-100 p-3 d-flex flex-column align-items-start">
    <ul class="nav flex-column gap-2 sidebar-menu-list">
      <li v-for="item in menuItems" :key="item.to">
        <RouterLink
          :to="item.to"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1 sidebar-menu-link"
          :class="{ 'bg-light': route.path === item.to }"
        >
          <component :is="item.icon" :size="20" class="sidebar-icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
  </aside>
</template>

<script lang="ts">
export default {
  data() {
    return {
      menuItems: [
        { to: '/', label: 'Trang Chủ', icon: Home },
        { to: '/ban-hang', label: 'Bán Hàng', icon: DollarSign },
        { to: '/hoa-don', label: 'Hóa Đơn', icon: FileText },
        { to: '/san-pham', label: 'Sản Phẩm', icon: Package },
        { to: '/phieu-giam-gia', label: 'Phiếu Giảm Giá', icon: Ticket },
        { to: '/dot-giam-gia', label: 'Đợt Giảm Giá', icon: Percent },
        { to: '/nhan-vien', label: 'Nhân Viên', icon: UserCog },
        { to: '/khach-hang', label: 'Khách Hàng', icon: User },
        { to: '/thong-ke', label: 'Thống Kê', icon: BarChart },
      ]
    }
  }
}
</script>

<style scoped>
.sidebar-custom {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  transition: width 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.25s, background 0.25s;
  align-items: flex-start;
  padding-top: 18px !important;
}
.sidebar-logo-wrapper {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-bottom: 10px;
  min-height: 48px;
}
.sidebar-logo {
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
  max-width: 120px;
  max-height: 38px;
  object-fit: contain;
}
.sidebar-menu-list {
  width: 100%;
  margin-top: 0;
  padding-left: 0;
  align-items: stretch;
  transition: width 0.35s cubic-bezier(.4,0,.2,1);
}
.sidebar-menu-link {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 16px;
  transition: background 0.25s, color 0.25s, padding 0.35s cubic-bezier(.4,0,.2,1);
}
.sidebar-icon {
  transition: margin 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1);
}
.sidebar-custom .nav-link span {
  transition: opacity 0.35s, width 0.35s, margin 0.35s cubic-bezier(.4,0,.2,1);
}
</style>