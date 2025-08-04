<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container hero-content">
        <h1>Just landed.</h1>
        <h2>The New Year Collection</h2>
        <p>Our latest collection is here. Discover the latest trends and styles for the new year.</p>
        <button class="shop-now-btn">Shop now</button>
      </div>
      <div class="hero-image">
        <img :src="heroBgImage" alt="New Year Collection" />
      </div>
    </section>

    <section class="brand-logos">
      <div class="container logos-grid">
        <img :src="logo1" alt="Logo 1" />
        <img :src="logo2" alt="Logo 2" />
        <img :src="logo3" alt="Logo 3" />
        <img :src="logo4" alt="Logo 4" />
        <img :src="logo5" alt="Logo 5" />
        <img :src="logo6" alt="Logo 6" />
      </div>
    </section>

    <section class="categories-section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Cửa hàng theo danh mục</h2>
          <router-link to="/coolmen/categories" class="view-all-link">Tất cả</router-link>
        </div>

        <div v-if="loadingCategories" class="loading-indicator">Đang tải danh mục...</div>
        <div v-else-if="categoriesError" class="error-message">
          Đã xảy ra lỗi khi tải danh mục: {{ categoriesError }}
        </div>
        <div v-else-if="displayedCategories.length === 0" class="no-data-message">
          Không có danh mục nào để hiển thị trên trang chủ.
        </div>
        <div v-else class="categories-grid">
          <div v-for="category in displayedCategories" :key="category.maDanhMuc" class="category-card">
            <router-link :to="`/coolmen/products?category=${category.maDanhMuc}`">
              <img :src="getCategoryImage(category.maDanhMuc)" :alt="category.name" class="category-image" />
              <h3 class="category-name">{{ category.name }}</h3>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import './HomePageStyles.css';

// Import hình ảnh tĩnh
import heroBgImage from '@/assets/anh1.jpg';
import logoPlaceholder1 from '@/assets/anh1.jpg';
import logoPlaceholder2 from '@/assets/anh1.jpg';
import logoPlaceholder3 from '@/assets/anh1.jpg';
import logoPlaceholder4 from '@/assets/anh1.jpg';
import logoPlaceholder5 from '@/assets/anh1.jpg';
import logoPlaceholder6 from '@/assets/logo.png'; // Từ file logo.png của bạn

// Import các ảnh danh mục giả định hoặc thật từ assets
// Bạn cần thay thế các đường dẫn này bằng ảnh thật của mình
import clothingImage from '@/assets/anh1.jpg'; // Ví dụ: ảnh quần áo
import tShirtImage from '@/assets/anh1.jpg'; // Ví dụ: ảnh áo thun
import hoodiesImage from '@/assets/anh1.jpg'; // Ví dụ: ảnh áo hoodie
import musicImage from '@/assets/anh1.jpg'; // Ví dụ: ảnh nhạc
import albumsImage from '@/assets/anh1.jpg'; // Ví dụ: ảnh album
import postersImage from '@/assets/anh1.jpg'; // Ví dụ: ảnh poster

export default {
  name: 'HomePage',
  data() {
    return {
      heroBgImage: heroBgImage,

      logo1: logoPlaceholder1,
      logo2: logoPlaceholder2,
      logo3: logoPlaceholder3,
      logo4: logoPlaceholder4,
      logo5: logoPlaceholder5,
      logo6: logoPlaceholder6,

      allCategories: [],
      loadingCategories: true,
      categoriesError: null,
      // Tạo một map để ánh xạ maDanhMuc với ảnh cục bộ
      categoryImageMap: {
        'DM001': clothingImage, // Thay 'DM001' bằng mã danh mục thực của bạn
        'DM002': tShirtImage,
        'DM003': hoodiesImage,
        'DM004': musicImage,
        'DM005': albumsImage,
        'DM006': postersImage,
        // Thêm các mã danh mục và ảnh tương ứng khác nếu cần
      }
    };
  },
  computed: {
    displayedCategories() {
      return this.allCategories.slice(0, 6);
    }
  },
  methods: {
    // Phương thức để lấy đường dẫn ảnh dựa trên maDanhMuc
    getCategoryImage(maDanhMuc) {
      // Ưu tiên ảnh từ map, nếu không có thì dùng ảnh placeholder chung
      return this.categoryImageMap[maDanhMuc] || `https://via.placeholder.com/300x300?text=${encodeURIComponent(maDanhMuc)}`;
    },
    async fetchCategories() {
      this.loadingCategories = true;
      this.categoriesError = null;
      try {
        const response = await axios.get('/danh-muc-hien-thi');

        if (response.data && response.data.data) {
          this.allCategories = response.data.data.map(item => ({
            id: item.id,
            maDanhMuc: item.maDanhMuc,
            name: item.tenDanhMuc,
            // Ở đây không cần item.imageUrl nữa nếu bạn dùng getCategoryImage
            // image: item.imageUrl // Giữ lại nếu backend CÓ TRẢ VỀ imageUrl
          }));
          console.log("Danh mục đã tải cho trang chủ:", this.allCategories);
        } else {
          this.allCategories = [];
          console.log("API trả về không có dữ liệu danh mục hoặc data.data rỗng.");
        }
      } catch (err) {
        console.error("Lỗi khi tải danh mục cho trang chủ (trong try-catch):", err);
        this.categoriesError = 'Không thể kết nối đến máy chủ hoặc dữ liệu không hợp lệ.';
        if (err.response) {
            this.categoriesError += ` (Mã lỗi: ${err.response.status}, Thông báo: ${err.response.data || err.response.statusText || 'Không có'})`;
        } else if (err.request) {
            this.categoriesError += ` (Không nhận được phản hồi từ máy chủ)`;
        } else {
            this.categoriesError += ` (Lỗi mạng hoặc cấu hình: ${err.message})`;
        }
      } finally {
        this.loadingCategories = false;
      }
    }
  },
  mounted() {
    this.fetchCategories();
  }
};
</script>

<style scoped>
/* Toàn bộ CSS của bạn đã cung cấp, không thay đổi nhiều vì nó đã được tối ưu cho việc làm nhỏ */
/* Đảm bảo file HomePageStyles.css chứa các style này hoặc bạn dán trực tiếp vào đây */

/* General page styling */
.home-page {
  background-color: #f8f8f8; /* Light background */
}

/* Hero Section */
.hero-section {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  height: 600px;
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.7);
}

.hero-content {
  position: relative;
  z-index: 2;
  text-align: center;
  max-width: 800px;
  padding: 20px;
}

.hero-content h1 {
  font-size: 3.5em;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-content h2 {
  font-size: 2.5em;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-content p {
  font-size: 1.2em;
  line-height: 1.6;
  margin-bottom: 30px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.shop-now-btn {
  background-color: #007bff;
  color: white;
  padding: 15px 30px;
  border: none;
  border-radius: 5px;
  font-size: 1.1em;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.shop-now-btn:hover {
  background-color: #0056b3;
}

/* Brand Logos Section */
.brand-logos {
  padding: 50px 20px;
  background-color: #fff;
  text-align: center;
  border-bottom: 1px solid #eee;
}

.logos-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.logos-grid img {
  max-height: 50px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.logos-grid img:hover {
  opacity: 1;
}

/* Categories Section */
.categories-section {
  padding: 60px 20px;
  background-color: #f0f2f5;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
}

.section-title {
  font-size: 2.2em;
  font-weight: 700;
  color: #333;
  margin: 0;
}

.view-all-link {
  font-size: 1.1em;
  color: #007bff;
  text-decoration: none;
  transition: color 0.3s ease;
}

.view-all-link:hover {
  color: #0056b3;
  text-decoration: underline;
}

.categories-grid {
  display: grid;
  /* Sử dụng chính xác 6 cột trên màn hình lớn nếu bạn muốn chúng luôn nhỏ và đều */
  /* Nếu bạn muốn 3 cột như hình ảnh 'image_8716c2.jpg', hãy dùng repeat(3, 1fr) */
  /* Nếu bạn muốn 6 cột như hình ảnh 'image_ee022a.jpg', hãy dùng repeat(6, 1fr) */
  /* Để linh hoạt và giống hình ảnh 'image_ee022a.jpg' (6 cột), chúng ta sẽ điều chỉnh minmax cho phù hợp */
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); /* Điều chỉnh minmax để thẻ nhỏ hơn */
  gap: 20px; /* Giảm khoảng cách giữa các thẻ */
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 1200px) { /* Cho màn hình rất lớn để hiển thị 6 cột */
    .categories-grid {
        grid-template-columns: repeat(6, 1fr); /* Đảm bảo 6 cột trên màn hình lớn */
    }
}


.category-card {
  background-color: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  padding-bottom: 15px; /* Giảm padding để thẻ nhỏ hơn */
}

.category-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
}

.category-card a {
  text-decoration: none;
  color: inherit;
  display: block;
}

.category-image {
  width: 100%;
  height: 120px; /* Giảm chiều cao ảnh để thẻ nhỏ hơn */
  object-fit: cover;
  border-radius: 15px 15px 0 0;
  margin-bottom: 10px; /* Giảm khoảng cách ảnh và tên */
}

.category-name {
  font-size: 1.1em; /* Giảm kích thước tên */
  font-weight: 600;
  color: #333;
  margin: 0 5px; /* Giảm padding ngang */
  text-transform: capitalize;
}

/* Loading, Error, No Data Messages */
.loading-indicator, .error-message, .no-data-message {
  text-align: center;
  font-size: 1.1em;
  color: #555;
  padding: 30px;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  margin: 30px auto;
  max-width: 600px;
}
.error-message {
  color: #dc3545;
}

/* Responsive adjustments */
@media (max-width: 992px) {
  .hero-content h1 { font-size: 2.8em; }
  .hero-content h2 { font-size: 2em; }
  .section-title { font-size: 2em; }
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); /* Nhỏ hơn nữa cho tablet */
    gap: 15px;
  }
  .category-image { height: 100px; } /* Ảnh nhỏ hơn */
  .category-name { font-size: 1em; }
}

@media (max-width: 768px) {
  .hero-section { height: 500px; }
  .hero-content h1 { font-size: 2.2em; }
  .hero-content h2 { font-size: 1.6em; }
  .hero-content p { font-size: 1em; }
  .shop-now-btn { padding: 12px 25px; font-size: 1em; }

  .section-title { font-size: 1.8em; }
  .categories-grid {
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); /* Nhỏ hơn nữa cho mobile ngang */
    gap: 10px;
  }
  .category-image { height: 80px; } /* Ảnh rất nhỏ */
  .category-name { font-size: 0.9em; }
  .brand-logos { padding: 30px 15px; }
  .logos-grid { gap: 20px; }
  .logos-grid img { max-height: 40px; }
}

@media (max-width: 480px) {
  .hero-section { height: 400px; }
  .hero-content h1 { font-size: 1.8em; }
  .hero-content h2 { font-size: 1.3em; }
  .hero-content p { font-size: 0.9em; }
  .shop-now-btn { padding: 10px 20px; font-size: 0.9em; }

  .section-header { flex-direction: column; align-items: flex-start; margin-bottom: 25px; }
  .section-title { margin-bottom: 10px; font-size: 1.5em; }
  .view-all-link { align-self: flex-end; }
  .categories-grid {
    grid-template-columns: 1fr 1fr; /* Buộc 2 cột trên mobile đứng */
    gap: 10px;
  }
  .category-image { height: 90px; } /* Ảnh nhỏ hơn */
  .category-name { font-size: 0.9em; }
  .brand-logos { padding: 20px 10px; }
  .logos-grid { gap: 15px; }
  .logos-grid img { max-height: 30px; }
}
</style>