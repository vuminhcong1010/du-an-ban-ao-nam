<template>
  <header class="main-header modern-header">
    <div class="container">
      <div class="logo">
        <a href="/coolmen">
          <img src="/src/assets/logo.png" alt="CoolMen Icon" class="coolmen-logo-icon">
          CoolMen
        </a>
      </div>


<nav class="main-navigation">
  <ul>
    <li>
      <router-link to="/coolmen" exact-active-class="active">Trang chủ</router-link>
    </li>

    <!-- Dropdown cho Sản phẩm -->
    <li class="has-submenu">
      <router-link to="/coolmen/client-san-pham" active-class="active">Sản phẩm</router-link>
      <ul class="submenu">
        <li>
          <router-link to="/coolmen/client-san-pham" active-class="active">Tất cả sản phẩm</router-link>
        </li>
        <li>
          <router-link to="/coolmen/ao-vest" active-class="active">Áo vest</router-link>
        </li>
        <li>
          <router-link to="/coolmen/ao-phong" active-class="active">Áo phông</router-link>
        </li>
        <li>
          <router-link to="/coolmen/ao-so-mi" active-class="active">Áo sơ mi</router-link>
        </li>
      </ul>
    </li>

    <li>
      <router-link to="/coolmen/danh-muc-List" active-class="active">Danh mục</router-link>
    </li>
    <li>
      <router-link to="/coolmen/giam-gia" active-class="active">Giảm giá</router-link>
    </li>
    <li>
      <router-link to="/coolmen/lien-he" active-class="active">Liên hệ</router-link>
    </li>
    <li>
      <router-link to="/coolmen/tra-cuu-don-hang" active-class="active">Tra cứu đơn hàng</router-link>
    </li>
  </ul>
</nav>



      <div class="header-actions">
        <div class="user-icon" ref="userIcon">
          <router-link v-if="isLoggedIn" to="/coolmen/thong-tin-user" class="user-display-link">
            <img :src="userAvatar" :alt="userName" class="user-avatar" />
          </router-link>
          <router-link v-else to="/coolmen/dang-nhap-khach-hang">
            <i class="fas fa-user"></i>
          </router-link>
        </div>
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

<style scoped>
/* Khi đang ở route hiện tại */
.main-navigation ul li a.active {
  color: #0a2c57;
}

.main-navigation ul li a.active::after {
  width: 100%; /* Gạch chân full width */
}

.main-navigation ul li {
  position: relative;
}

.main-navigation ul li a {
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  color: #4b5563;
  font-family: 'Inter', sans-serif;
  position: relative;
  display: inline-block; /* tránh ảnh hưởng đến sub-menu */
  transition: color 0.3s ease;
}

.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  background: #fff;
  list-style: none;
  padding: 10px 0;
  margin: 0;
  width: 180px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  display: none;
  z-index: 1000;
}
.submenu li a {
  display: block;
  padding: 8px 15px;
  color: #333;
  font-size: 14px;
  font-weight: normal;
  width: 100%;
}

/* Gạch chân ảo */
.main-navigation ul li a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: -4px; /* không ảnh hưởng chiều cao thật */
  width: 0;
  height: 2px;
  background-color: #0a2c57;
  transition: width 0.3s ease;
}

/* Hover */
.main-navigation ul li a:hover {
  color: #0a2c57;
}
.main-navigation ul li a:hover::after {
  width: 100%;
}

/* Submenu */
.main-navigation ul li ul {
  position: absolute;
  top: 100%; /* submenu nằm ngay dưới cha */
  left: 0;
  display: none;
  background: #fff;
  padding: 10px 0;
  list-style: none;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  z-index: 99;
}

/* Hover cha thì hiện submenu */
.main-navigation ul li:hover ul {
  display: block;
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


.user-display {
  display: flex;
  align-items: center;
  gap: 8px;
  /* Khoảng cách giữa avatar và tên */
}


.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}


.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
  /* Ngăn tên bị xuống dòng */
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  /* Thêm dấu ba chấm nếu tên quá dài */
}


.header-actions {
  display: flex;
  align-items: center;
  /* Điều chỉnh khoảng cách để giỏ hàng và user cách nhau một khoảng */
  gap: 24px;
  /* Đảm bảo giỏ hàng và user không bị co lại */
  flex-shrink: 0;
}


/* Thêm kiểu dáng mới cho phần hiển thị người dùng sau khi bạn đã chỉnh sửa HTML */
.user-display-link {
  text-decoration: none;
  color: #333;
}


.user-display {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 999px;
  transition: all 0.2s ease;
}


.user-display:hover {
  background-color: #f0f0f0;
  border-color: #ddd;
}


.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #ddd;
}


.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}


.cart-icon,
.user-icon {
  position: relative;
  z-index: 10;
  /* Đảm bảo phần tử này luôn hiển thị trên các phần tử khác */
}


.cart-dropdown,
.user-dropdown {
  z-index: 9999;
  /* Đặt z-index cao hơn để dropdown không bị che khuất */
}
</style>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useRouter } from 'vue-router'; // Import useRouter
import CartDetail from './CartDetail.vue';
import { useAuthStore } from '@/stores/auth';
// Khai báo router
const router = useRouter();
const authStore = useAuthStore();


// Dữ liệu reactive
const searchQuery = ref('');
const soLuongGio = ref(0);
const hienChiTiet = ref(false);
const danhSachGio = ref([]);
const loggedInUserData = ref(null);


// Computed properties
const isLoggedIn = computed(() => {
  return authStore.isLoggedInClient;
});


const userName = computed(() => {
  return loggedInUserData.value ? loggedInUserData.value.tenKhachHang : '';
});


const userAvatar = computed(() => {
  return loggedInUserData.value && loggedInUserData.value.hinhAnh
    ? loggedInUserData.value.hinhAnh
    : '/src/assets/logo_icon-removebg-preview.png';
});


// Hàm
const loadUserData = () => {
  const user = localStorage.getItem('loggedInUser');
  if (user) {
    try {
      loggedInUserData.value = JSON.parse(user);
    } catch (e) {
      console.error('Lỗi khi parse thông tin người dùng:', e);
      loggedInUserData.value = null;
    }
  }
};


const performSearch = () => {
  console.log('Đang tìm kiếm:', searchQuery.value);
};


const capNhatGioHang = async () => {
  try {
    const res = await axios.get('http://localhost:8080/client/LoadSanPham', {
      withCredentials: true
    });
    const data = Array.isArray(res.data) ? res.data : [];
    data.forEach(sp => {
      if (!sp.tongTien || sp.tongTien === 0) {
        sp.tongTien = sp.soLuong * sp.gia;
      }
      if (!sp.anhSanPham) {
        sp.anhSanPham = '/placeholder.png';
      }
    });
    danhSachGio.value = data;
    // Thay đổi: Hiển thị số lượng danh sách sản phẩm thay vì tổng số lượng
    soLuongGio.value = data.length;
  } catch (error) {
    danhSachGio.value = [];
    soLuongGio.value = 0;
    console.error('Lỗi khi lấy giỏ hàng:', error);
  }
};


const capNhatGioHangLocal = (newDanhSach) => {
  danhSachGio.value = newDanhSach;
  // Thay đổi: Hiển thị số lượng danh sách sản phẩm thay vì tổng số lượng
  soLuongGio.value = newDanhSach.length;
  sessionStorage.removeItem("gioHang");
  localStorage.removeItem("gioHang");
};


const xoaSanPham = (idSanPhamChiTiet) => {
  danhSachGio.value = danhSachGio.value.filter(sp => sp.idSanPhamChiTiet !== idSanPhamChiTiet);
  // Thay đổi: Hiển thị số lượng danh sách sản phẩm thay vì tổng số lượng
  soLuongGio.value = danhSachGio.value.length;
};


const toggleGioHang = () => {
  hienChiTiet.value = !hienChiTiet.value;
};


// Hàm logout đã được sửa đổi
const logout = () => {
  authStore.logoutClient();
  router.push('/coolmen/dang-nhap-khach-hang');
};


// Lifecycle hooks
onMounted(() => {
  loadUserData();
  capNhatGioHang();
  window.addEventListener("cap-nhat-gio", capNhatGioHang);
});


onUnmounted(() => {
  window.removeEventListener("cap-nhat-gio", capNhatGioHang);
});
</script>


<style scoped>
/* Giữ nguyên phần CSS */
</style>