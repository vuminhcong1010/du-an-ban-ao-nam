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
          <li><a href="#">Trang chủ</a></li>
          <li><a href="#">Sản phẩm</a></li>
          <li><a href="#">Danh mục</a></li>
          <li><a href="#">Giảm giá</a></li>
          <li><a href="#">Liên hệ</a></li>
        </ul>
      </nav>
      <div class="header-actions">
        <div class="search-box">
          <input type="text" placeholder="Tìm kiếm sản phẩm..." v-model="searchQuery">
          <button @click="performSearch"><i class="fas fa-search"></i></button>
        </div>
        <div class="user-icon">
          <a href="#"><i class="fas fa-user"></i></a>
        </div>
        <div class="cart-icon">
          <a href="#"><i class="fas fa-shopping-cart"></i></a>
        </div>
      </div>
    </div>
  </header>
</template>

<script>
export default {
  name: 'AppHeader',
  data() {
    return {
      searchQuery: ''
    };
  },
  methods: {
    performSearch() {
      console.log('Đang tìm kiếm:', this.searchQuery);
    }
  }
};
</script>

<style scoped>
/* CSS cho Header (Chỉ ảnh hưởng đến component này nhờ 'scoped') */
.main-header {
  background-color: #f8f8f8;
  padding: 20px 0;
  border-bottom: 1px solid #eee;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

/* 1. Đẩy icon và chữ logo sát gần bên trái hơn */
.logo {
  /* margin-right: auto; để logo đẩy các phần tử khác ra xa nhất có thể bên phải */
  /* Hoặc sử dụng flex-grow để nó không co lại */
  flex-shrink: 0; /* Đảm bảo logo không bị co lại khi không gian hẹp */
  /* padding-left: 0; */ /* Đảm bảo không có padding thừa từ style khác */
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
  margin-right: 8px; /* Khoảng cách giữa icon và chữ "CoolMen" */
  object-fit: contain;
}

.main-navigation ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.main-navigation li {
  margin-left: 25px;
}

.main-navigation a {
  text-decoration: none;
  color: #555;
  font-weight: 600;
  transition: color 0.3s ease;
}

.main-navigation a:hover {
  color: #007bff;
}

.header-actions {
  display: flex;
  align-items: center;
  /* Sử dụng gap để tạo khoảng cách giữa các phần tử bên trong */
  gap: 15px; /* Khoảng cách giữa search-box, user-icon, cart-icon */
  /* Đảm bảo header-actions không bị co lại */
  flex-shrink: 0;
}

.search-box {
  display: flex;
  /* CHỈNH SỬA: Đảm bảo search-box có thể mở rộng */
  flex-grow: 1; /* Cho phép search-box mở rộng nếu có không gian */
}

.search-box input {
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 5px 0 0 5px;
  outline: none;
  font-size: 15px;
  /* CHỈNH SỬA TẠI ĐÂY: Kéo dài thanh search */
  width: 300px; /* Tăng chiều rộng cố định */
  min-width: 150px; /* Đảm bảo nó không quá nhỏ */
  max-width: 100%; /* Đảm bảo nó không vượt quá kích thước cha */
  flex-grow: 1; /* Cho phép nó mở rộng nếu cần thiết */
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
.user-icon, .cart-icon {
  /* margin-left đã bị loại bỏ */
}

.user-icon a, .cart-icon a {
  color: #555;
  font-size: 22px;
  text-decoration: none;
  transition: color 0.3s ease;
}

.user-icon a:hover, .cart-icon a:hover {
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
</style>