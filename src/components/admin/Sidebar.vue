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
import { ref } from 'vue'; // Cần import ref để tạo biến reactive

// Lấy route hiện tại để xác định link active
const route = useRoute();

// Định nghĩa menuItems trong script setup
const menuItems = ref([
  { to: '/', label: 'Trang Chủ', icon: Home },
  { to: '/ban-hang', label: 'Bán Hàng', icon: DollarSign },
  { to: '/hoa-don', label: 'Hóa Đơn', icon: FileText },
  { to: '/san-pham', label: 'Sản Phẩm', icon: Package, parentPath: '/san-pham' }, // Thêm parentPath để xử lý route con
  { to: '/phieu-giam-gia', label: 'Phiếu Giảm Giá', icon: Ticket, parentPath: '/phieu-giam-gia' },
  { to: '/dot-giam-gia', label: 'Đợt Giảm Giá', icon: Percent },
  { to: '/nhan-vien', label: 'Nhân Viên', icon: UserCog, parentPath: '/nhan-vien' },
  { to: '/khach-hang', label: 'Khách Hàng', icon: User, parentPath: '/khach-hang' },
  { to: '/thong-ke', label: 'Thống Kê', icon: BarChart },
]);

</script>

<template>
  <aside class="sidebar-custom bg-white border-end h-100 p-3 d-flex flex-column align-items-start">
    <!-- Thêm div chứa logo ở đây -->
    <div class="sidebar-logo-container">
      <img src="/src/assets/logo.png" alt="COOLMEN logo" class="sidebar-logo" />
    </div>

    <ul class="nav flex-column gap-2 sidebar-menu-list">
      <li v-for="item in menuItems" :key="item.to">
        <RouterLink
          :to="item.to"
          class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1 sidebar-menu-link"
          :class="{ 
            'active-link': route.path === item.to || (typeof item.parentPath === 'string' && route.path.startsWith(item.parentPath)) 
          }"
        >
          <component :is="item.icon" :size="20" class="sidebar-icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>
    <!-- Thêm footer nếu cần -->
    <div class="sidebar-footer text-muted text-center mt-auto pt-3 border-top">
      <small>&copy; 2023 CoolMen. All rights reserved.</small>
    </div>
  </aside>
</template>

<style scoped>
.sidebar-custom {
  width: 250px; /* Tăng chiều rộng để logo và chữ không bị ép */
  min-width: 250px;
  max-width: 250px;
  transition: width 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.25s, background 0.25s;
  align-items: flex-start;
  padding-top: 18px !important;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.08); /* Đổ bóng nhẹ nhàng */
  height: 100vh; /* Đảm bảo sidebar kéo dài toàn bộ chiều cao màn hình */
  position: sticky; /* Giữ sidebar cố định khi cuộn */
  top: 0;
  left: 0;
  overflow-y: auto; /* Cho phép cuộn nếu menu quá dài */
}

/* Thêm style cho container logo */
.sidebar-logo-container {
  width: 100%;
  display: flex;
  justify-content: center; /* Căn giữa logo */
  align-items: center;
  margin-bottom: 30px; /* Khoảng cách dưới logo */
  padding: 0 10px;
  min-height: 50px; /* Đảm bảo không gian cho logo */
}

.sidebar-logo {
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
  max-width: 180px; /* Tăng kích thước logo cho phù hợp với sidebar */
  max-height: 50px;
  object-fit: contain;
}

.sidebar-menu-list {
  width: 100%;
  margin-top: 0;
  padding-left: 0;
  align-items: stretch;
  transition: width 0.35s cubic-bezier(.4,0,.2,1);
  flex-grow: 1; /* Đảm bảo menu chiếm không gian còn lại */
  list-style: none; /* Bỏ bullet của ul */
}

.sidebar-menu-list li {
  margin-bottom: 8px; /* Khoảng cách giữa các mục menu */
}

.sidebar-menu-link {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 16px;
  transition: background 0.25s, color 0.25s, padding 0.35s cubic-bezier(.4,0,.2,1);
  padding: 12px 15px !important; /* Điều chỉnh padding cho phù hợp */
  border-radius: 8px !important; /* Bo góc mạnh hơn */
  text-decoration: none; /* Bỏ gạch chân link */
  color: #495057; /* Màu chữ mặc định */
  font-weight: 500;
}

.sidebar-menu-link:hover {
  background-color: #e9ecef; /* Màu nền khi hover */
  color: #0a2c57;
  transform: translateX(3px); /* Hiệu ứng dịch nhẹ khi hover */
}

.sidebar-menu-link.active-link {
  background-color: #0a2c57 !important; /* Màu nền khi active */
  color: white !important;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(10, 44, 87, 0.2); /* Đổ bóng nhẹ khi active */
}

.sidebar-icon {
  transition: margin 0.35s cubic-bezier(.4,0,.2,1), transform 0.35s cubic-bezier(.4,0,.2,1);
  margin-right: 12px; /* Khoảng cách giữa icon và chữ */
  color: #6c757d; /* Màu icon mặc định */
  width: 20px; /* Đảm bảo chiều rộng cố định cho icon để căn chỉnh văn bản */
  text-align: center;
}

.sidebar-menu-link.active-link .sidebar-icon {
  color: white !important; /* Màu icon khi active */
}

/* Thêm footer cho sidebar */
.sidebar-footer {
  font-size: 0.85em;
  color: #6c757d;
  padding-top: 15px;
  text-align: center;
  border-top: 1px solid #e9ecef;
  margin-top: auto; /* Đẩy footer xuống dưới cùng */
  width: 100%; /* Đảm bảo footer chiếm toàn bộ chiều rộng */
}
</style>