<template>
  <header class="main-header">
    <div class="container">
      <div class="logo">
        <a href="/coolmen">
          <img src="/src/assets/logo_icon-removebg-preview.png" alt="CoolMen Icon" class="coolmen-logo-icon">
          CoolMen
        </a>
      </div>

      <nav class="main-navigation">
        <ul>
          <li>
            <a href="/coolmen" :class="{ active: route.path === '/coolmen' }">Trang chủ</a>
          </li>
          <li>
            <a href="/coolmen/client-san-pham" :class="{ active: route.path === '/coolmen/client-san-pham' }">Sản phẩm</a>
          </li>
          <li>
            <a href="/coolmen/danh-muc" :class="{ active: route.path === '/coolmen/danh-muc' }">Danh mục</a>
          </li>
          <li>
            <a href="/coolmen/giam-gia" :class="{ active: route.path === '/coolmen/giam-gia' }">Giảm giá</a>
          </li>
          <li>
            <a href="/coolmen/lien-he" :class="{ active: route.path === '/coolmen/lien-he' }">Liên hệ</a>
          </li>
        </ul>
      </nav>

      <div class="header-actions">
        <!-- User -->
        <div class="user-icon" ref="userIcon" @click="toggleUserDropdown">
          <a href="#"><i class="fas fa-user"></i></a>
          <div v-if="showUserDropdown" class="user-dropdown">
            <ul>
              <li v-if="isLoggedIn">
                <a href="/coolmen/tai-khoan">Thông tin cá nhân</a>
              </li>
              <li v-if="isLoggedIn">
                <a href="/coolmen/lich-su-dat-hang">Lịch sử đặt hàng</a>
              </li>
              <li v-if="isLoggedIn">
                <a href="#" @click.prevent="logout">Đăng xuất</a>
              </li>
              <li v-else>
                <a href="/coolmen/dang-nhap-khach-hang">Đăng nhập</a>
              </li>
            </ul>
          </div>
        </div>

        <!-- Giỏ hàng -->
        <div class="cart-icon">
          <router-link to="/gio-hang">
            <i class="fas fa-shopping-cart"></i>
            <span v-if="soLuongGio > 0" class="badge">{{ soLuongGio }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </header>
</template>



<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import Cookies from 'js-cookie'

const route = useRoute()

const searchQuery = ref('')
const soLuongGio = ref(0)
const hienChiTiet = ref(false)
const danhSachGio = ref([])
const showUserDropdown = ref(false)

const userIcon = ref(null)

const isLoggedIn = computed(() => {
  const token = localStorage.getItem('clientAuthToken')
  const user = localStorage.getItem('loggedInUser')
  return !!token || !!user
})

const capNhatGioHang = async () => {
  try {
    const res = await axios.get('http://localhost:8080/client/LoadSanPham', {
      withCredentials: true
    })
    const data = Array.isArray(res.data) ? res.data : []
    data.forEach(sp => {
      if (!sp.tongTien || sp.tongTien === 0) {
        sp.tongTien = sp.soLuong * sp.gia
      }
      if (!sp.anhSanPham) {
        sp.anhSanPham = '/placeholder.png'
      }
    })

    danhSachGio.value = data
    soLuongGio.value = data.length
  } catch (error) {
    danhSachGio.value = []
    soLuongGio.value = 0
    console.error('Lỗi khi lấy giỏ hàng:', error)
  }
}

const handleClickOutside = (event) => {
  if (userIcon.value && !userIcon.value.contains(event.target)) {
    showUserDropdown.value = false
  }
}

const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

const logout = () => {
  localStorage.removeItem('clientAuthToken')
  localStorage.removeItem('loggedInUser')
  Cookies.remove('thongTinKhachHang')
  showUserDropdown.value = false
  window.location.href = '/coolmen/dang-nhap-khach-hang'
}

onMounted(() => {
  capNhatGioHang()
  window.addEventListener('cap-nhat-gio', capNhatGioHang)
  document.addEventListener('click', handleClickOutside)
})
</script>



<style scoped>
.main-navigation a.active {
  color: #007bff;
  font-weight: bold;
  border-bottom: 2px solid #007bff;
  padding-bottom: 2px;
}
.badge {
  background: purple;
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 50%;
  position: absolute;
  top: -5px;
  right: -10px;
}

.cart-dropdown {
  position: absolute;
  right: 0;
  top: 35px;
  background-color: white;
  border: 1px solid #ccc;
  width: 250px;
  padding: 10px;
  z-index: 999;
}

.cart-icon {
  position: relative;
  /* Bố cục gốc để badge định vị */
  display: inline-block;
}

.cart-icon .badge {
  position: absolute;
  top: -8px;
  /* Dịch lên trên icon */
  right: -8px;
  /* Dịch sang phải icon */
  background-color: purple;
  /* Màu badge */
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 12px;
  line-height: 1;
}

/* CSS cho Header (Chỉ ảnh hưởng đến component này nhờ 'scoped') */
.main-header {
  background-color: #f8f8f8;
  padding: 10px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: border-box;
}

/* 1. Đẩy icon và chữ logo sát gần bên trái hơn */
.logo {
  /* margin-right: auto; để logo đẩy các phần tử khác ra xa nhất có thể bên phải */
  /* Hoặc sử dụng flex-grow để nó không co lại */
  flex-shrink: 0;
  /* Đảm bảo logo không bị co lại khi không gian hẹp */
  /* padding-left: 0; */
  /* Đảm bảo không có padding thừa từ style khác */
}

.logo a {
  font-size: 28px;
  font-weight: bold;
  color: #0a2c57;
  text-decoration: none;
  display: flex;
  align-items: center;
}

.coolmen-logo-icon {
  width: 48px;
  height: 48px;
  vertical-align: middle;
  margin-right: 8px;
  /* Khoảng cách giữa icon và chữ "CoolMen" */
  object-fit: contain;
}

.main-navigation ul {
  display: flex;
  gap: 24px;
  /* khoảng cách giữa các mục */
  list-style: none;
  padding: 0;
  margin: 0;
  align-items: center;
}

.main-navigation ul li a {
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  /* gần với màu xám nhạt như trong ảnh */
  font-family: 'Inter', sans-serif;
  transition: color 0.3s ease;
}

.main-navigation ul li a:hover {
  color: #111827;
  /* màu đậm hơn khi hover */
}


.header-actions {
  display: flex;
  align-items: center;
  /* Sử dụng gap để tạo khoảng cách giữa các phần tử bên trong */
  gap: 15px;
  /* Khoảng cách giữa search-box, user-icon, cart-icon */
  /* Đảm bảo header-actions không bị co lại */
  flex-shrink: 0;
}

.search-box {
  display: flex;
  /* CHỈNH SỬA: Đảm bảo search-box có thể mở rộng */
  flex-grow: 1;
  /* Cho phép search-box mở rộng nếu có không gian */
}

.search-box input {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
  outline: none;
  font-size: 15px;
  /* CHỈNH SỬA TẠI ĐÂY: Kéo dài thanh search */
  width: 300px;
  /* Tăng chiều rộng cố định */
  min-width: 150px;
  /* Đảm bảo nó không quá nhỏ */
  max-width: 100%;
  /* Đảm bảo nó không vượt quá kích thước cha */
  flex-grow: 1;
  /* Cho phép nó mở rộng nếu cần thiết */
}

.search-box button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 0 5px 5px 0;
  cursor: pointer;
  outline: none;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.search-box button:hover {
  background-color: #0056b3;
}

/* Loại bỏ margin-left trên user-icon và cart-icon để gap của header-actions hoạt động */
.user-icon,
.cart-icon {
  /* margin-left đã bị loại bỏ */
}

.user-icon a,
.cart-icon a {
  color: #555;
  font-size: 22px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.user-icon a:hover,
.cart-icon a:hover {
  color: #007bff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .container {
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    padding: 0 10px;
  }

  .logo {
    width: 100%;
    text-align: center;
    margin-bottom: 10px;
  }

  .main-navigation ul {
    flex-wrap: wrap;
    justify-content: center;
    width: 100%;
    margin-top: 15px;
  }

  .main-navigation li {
    margin: 0 10px 10px;
  }

  .header-actions {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }

  .search-box {
    flex-grow: 1;
    max-width: 300px;
  }

  .search-box input {
    width: auto;
  }
}

@media (max-width: 480px) {
  .logo a {
    font-size: 24px;
  }

  .search-box input {
    width: auto;
  }
}

.user-icon {
  position: relative;
  cursor: pointer;
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 180px;
  z-index: 1001;
  padding: 5px 0;
}

.user-dropdown ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.user-dropdown li {
  padding: 0;
  margin: 0;
}

.user-dropdown a {
  display: block;
  padding: 10px 15px;
  text-decoration: none;
  color: #333;
  font-weight: normal;
  transition: background-color 0.2s ease;
}

.user-dropdown a:hover {
  background-color: #f0f0f0;
  color: #007bff;
}

.user-icon .user-dropdown a {
  /* Thêm .user-icon vào selector */
  font-size: 14px;
  /* Hoặc 0.9em */
  padding: 8px 15px;
  /* Điều chỉnh lại padding nếu cần để phù hợp với font nhỏ hơn */
}
</style>