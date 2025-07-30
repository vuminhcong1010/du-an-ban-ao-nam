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
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import Cookies from 'js-cookie'
import axios from 'axios';
import { useRouter } from 'vue-router'

const route = useRoute();
const expanded = ref<string | null>(null);
const isCollapsed = ref(false);
const showToggle = ref(false);
let vaiTro = ref("STAFF")
const menuItems = computed(() => {
  const items = [
    { to: '/', label: 'Trang Chủ', icon: Home },
    { to: '/ban-hang', label: 'Bán Hàng', icon: DollarSign },
    { to: '/hoa-don', label: 'Hóa Đơn', icon: FileText },
    {
      to: '/san-pham',
      label: 'Sản Phẩm',
      icon: Package,
      children: [
        { to: '/san-pham/co-ao', label: 'Cổ áo' },
        { to: '/san-pham/tay-ao', label: 'Tay áo' },
        { to: '/san-pham/kieu-ao', label: 'Kiểu áo' },
        { to: '/san-pham/kich-co', label: 'Kích cỡ' },
        { to: '/san-pham/danh-muc', label: 'Danh mục' },
        { to: '/san-pham/mau', label: 'Màu' },
        { to: '/san-pham/chat-lieu', label: 'Chất Liệu' }
      ]
    },
    { to: '/phieu-giam-gia', label: 'Phiếu Giảm Giá', icon: Ticket },
    { to: '/dot-giam-gia', label: 'Đợt Giảm Giá', icon: Percent },
    // 👇 Tạm thời không thêm "Nhân Viên" nếu vai trò là STAFF
    ...(vaiTro.value !== 'STAFF'
      ? [
        {
          to: '/nhan-vien',
          label: 'Nhân Viên',
          icon: UserCog
        }
      ]
      : []),
    { to: '/khach-hang', label: 'Khách Hàng', icon: User },
    {
      to: '/thong-ke',
      label: 'Thống Kê',
      icon: BarChart,
      children: [
        { to: '/thong-ke/bao-cao', label: 'Báo cáo' },
        { to: '/thong-ke', label: 'Biểu đồ' }
      ]
    }
  ]
  return items
})


let timeoutId = null
let trangThai = ref(true)

function yourFunction() {
  const currentToken = Cookies.get('token')
  if (!currentToken) {
    console.warn("❌ Không có token")
    return
  }

  axios.post("http://localhost:8080/refeshToken", { token: currentToken })
    .then(response => {
      const newToken = response.data.data
      Cookies.set('token', newToken)

      // 🔁 Làm mới lại bộ đếm
      setupTokenWatcher()
      window.dispatchEvent(new Event('tokenRefreshed'))
    })
    .catch(err => {
      console.error("❌ Lỗi refresh token:", err)
    })
}


const router = useRouter()

function setupTokenWatcher() {
  if (!trangThai.value) {
    console.log("⛔ Không đếm giờ vì trạng thái là false")
    return
  }

  const token = Cookies.get('token')
  if (!token) {
    console.warn("❌ Token không tồn tại")
    router.push('/login') // 👉 chuyển hướng
    return
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    vaiTro.value = payload.scope
    console.log(payload);
    console.log(vaiTro.value);

    const exp = payload.exp
    const now = Math.floor(Date.now() / 1000)

    if (exp <= now) {
      console.warn("⛔ Token đã hết hạn")
      Cookies.remove('token')       // ❌ Xóa token cũ
      trangThai.value = false
      router.push('/login')         // 👉 Điều hướng sang login
      return
    }

    const secondsLeft = exp - now
    const warningBefore = 300

    if (timeoutId) clearTimeout(timeoutId)

    if (secondsLeft > warningBefore) {
      const delay = (secondsLeft - warningBefore) * 1000
      timeoutId = setTimeout(() => {
        yourFunction()
      }, delay)
      console.log(`⏱ Token sẽ làm mới sau ${Math.floor(delay / 1000)} giây`)

    } else {
      yourFunction()
    }

  } catch (err) {
    console.error('❌ Token không hợp lệ:', err)
    Cookies.remove('token')
    trangThai.value = false
    router.push('/login') // 👉 Trường hợp token lỗi
  }
}


onMounted(() => {
  const token = Cookies.get('token')
  trangThai.value = !!token
  setupTokenWatcher()
})

onBeforeUnmount(() => {
  if (timeoutId) clearTimeout(timeoutId)
})

window.addEventListener('tokenRefreshed', () => {
  setupTokenWatcher()
})

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value;
};


const isRouteMatch = (item: any) => {
  return route.path === item.to || item.children?.some((child: any) => child.to === route.path);
};
</script>
<template>
  <div @mouseenter="showToggle = true" @mouseleave="showToggle = false" class="sidebar-wrapper">
    <!-- Nút mũi tên chuyển vào trong đây -->
    <div class="collapse-toggle" @click="isCollapsed = !isCollapsed" v-show="showToggle"
      :title="isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'">
      <span :style="{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }">⮜</span>
    </div>


    <aside class="sidebar-custom bg-white border-end h-100 p-3 d-flex flex-column align-items-start"
      :class="{ 'sidebar-collapsed': isCollapsed }" v-if="trangThai">
      <ul class="nav flex-column gap-2 sidebar-menu-list">
        <li v-for="item in menuItems" :key="item.to" class="sidebar-item" @mouseenter="expanded = item.to"
          @mouseleave="expanded = null">
          <RouterLink :to="item.readonly ? '#' : item.to"
            class="nav-link d-flex align-items-center gap-2 text-dark small rounded px-2 py-1 sidebar-menu-link" :class="{
              'bg-light': isRouteMatch(item),
              'text-muted pointer-events-none': item.readonly,
              'text-secondary': item.readonly
            }" :title="item.readonly ? 'Chỉ có quyền xem' : ''">
            <component :is="item.icon" :size="20" class="sidebar-icon" />
            <span v-if="!isCollapsed">{{ item.label }}</span>
          </RouterLink>

          <div class="submenu-container" v-show="item.children && expanded === item.to && !isCollapsed">
            <ul class="submenu ps-4 mt-1">
              <li v-for="child in item.children" :key="child.to">
                <RouterLink :to="child.to" class="nav-link text-dark small px-2 py-1 submenu-link"
                  :class="{ 'text-primary fw-bold': route.path === child.to }">
                  {{ child.label }}
                </RouterLink>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </aside>
  </div>
</template>


<style scoped>
.sidebar-item {
  position: relative;
  transition: background-color 0.3s ease;
}

.submenu-container {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  /* ✅ Sử dụng chiều rộng theo menu cha */
  z-index: 100;
  background-color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  animation: fadeIn 0.2s ease-in-out;
  overflow: hidden;
}


.submenu {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.submenu-link:hover {
  background-color: #e9ecef;
  color: #007bff;
  font-weight: 500;
  border-radius: 4px;
}

.sidebar-item {
  position: relative;
  transition: background-color 0.3s ease;
}

.sidebar-item:hover .sidebar-menu-link {
  background-color: #f1f1f1;
  color: #007bff;
}

.sidebar-menu-link:hover {
  text-decoration: none;
  background-color: #f8f9fa;
  color: #007bff;
  font-weight: 500;
}

.sidebar-menu-link:hover .sidebar-icon {
  transform: scale(1.1);
  color: #007bff;
}

.submenu {
  animation: fadeIn 0.2s ease-in-out;
}

.submenu-link:hover {
  background-color: #e9ecef;
  color: #007bff;
  font-weight: 500;
  border-radius: 4px;
}

/* Hiệu ứng fade */
@keyframes fadeIn {
  0% {
    opacity: 0;
    transform: translateY(-5px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.sidebar-custom {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  transition: width 0.35s cubic-bezier(.4, 0, .2, 1), box-shadow 0.25s, background 0.25s;
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
  transition: all 0.2s cubic-bezier(.4, 0, .2, 1);
  max-width: 120px;
  max-height: 38px;
  object-fit: contain;
}

.sidebar-menu-list {
  width: 100%;
  margin-top: 0;
  padding-left: 0;
  align-items: stretch;
  transition: width 0.35s cubic-bezier(.4, 0, .2, 1);
}

.sidebar-menu-link {
  width: 100%;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 16px;
  transition: background 0.25s, color 0.25s, padding 0.35s cubic-bezier(.4, 0, .2, 1);
}

.sidebar-icon {
  transition: margin 0.35s cubic-bezier(.4, 0, .2, 1), transform 0.35s cubic-bezier(.4, 0, .2, 1);
}

.sidebar-custom .nav-link span {
  transition: opacity 0.35s, width 0.35s, margin 0.35s cubic-bezier(.4, 0, .2, 1);
}

.sidebar-custom {
  width: 200px;
  min-width: 200px;
  max-width: 200px;
  transition: all 0.3s ease;
  overflow: hidden;
}

.sidebar-collapsed {
  width: 64px;
  min-width: 64px;
  max-width: 64px;
}

.sidebar-menu-link span,
.submenu-container {
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .sidebar-menu-link span,
.sidebar-collapsed .submenu-container {
  opacity: 0;
  pointer-events: none;
}

.sidebar-wrapper {
  position: relative;
}
.collapse-toggle {
  position: absolute;
  top: 20px;
  right: -12px; /* đưa sát viền phải */
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  z-index: 999;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.collapse-toggle:hover {
  background-color: #f0f0f0;
}

</style>