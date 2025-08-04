<template>
  <div class="categories-page-container">
    <div class="page-title-wrapper">
      <h1 class="page-main-title">Danh Mục Sản Phẩm</h1>
    </div>

    <div v-if="loading" class="loading-indicator">Đang tải danh mục...</div>
    <div v-else-if="error" class="error-message">
      Đã xảy ra lỗi khi tải danh mục: {{ error }}
    </div>
    <div v-else-if="categories.length === 0" class="no-data-message">
      Không có danh mục nào để hiển thị.
    </div>
    <div v-else class="categories-grid-container">
      <div v-for="category in categories" :key="category.maDanhMuc" class="category-card">
        <a :href="`/products?category=${category.maDanhMuc}`">
          <img :src="category.image" :alt="category.name" class="category-image" />
          <h3 class="category-name">{{ category.name }}</h3>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'CategoriesPage',
  data() {
    return {
      categories: [],
      loading: true,
      error: null
    };
  },
  methods: {
    async fetchCategories() {
      this.loading = true;
      this.error = null;
      try {
        const response = await axios.get('/danh-muc-hien-thi');

        if (response.data && response.data.data) {
            this.categories = response.data.data.map(item => ({
                id: item.id,
                maDanhMuc: item.maDanhMuc,
                name: item.tenDanhMuc,
                // **QUAN TRỌNG:** Sử dụng item.imageUrl nếu có, hoặc dùng placeholder nếu không.
                // Đảm bảo entity DanhMuc ở backend có trường imageUrl
                image: item.imageUrl || 'https://via.placeholder.com/300x300?text=' + item.tenDanhMuc,
                link: `/products?category=${item.maDanhMuc}`
            }));
        } else {
            this.categories = [];
        }

      } catch (err) {
        console.error("Lỗi khi tải danh mục:", err);
        this.error = 'Không thể kết nối đến máy chủ hoặc dữ liệu không hợp lệ.';
        if (err.response) {
            // Lỗi từ server (status code khác 2xx)
            this.error += ` (Mã lỗi: ${err.response.status}, Thông báo: ${err.response.statusText || 'Không có'})`;
        } else if (err.request) {
            // Yêu cầu đã được gửi nhưng không nhận được phản hồi
            this.error += ` (Không nhận được phản hồi từ máy chủ)`;
        } else {
            // Lỗi trong quá trình thiết lập yêu cầu
            this.error += ` (Lỗi mạng hoặc cấu hình)`;
        }
      } finally {
        this.loading = false;
      }
    }
  },
  mounted() {
    this.fetchCategories();
  }
};
</script>

<style scoped>
/* CSS giữ nguyên như bạn đã cung cấp */
.categories-page-container {
  flex-grow: 1;
  padding: 30px;
  background-color: #f0f2f5;
}

.page-title-wrapper {
  margin-bottom: 30px;
  text-align: center;
}

.page-main-title {
  font-size: 36px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.loading-indicator, .error-message, .no-data-message {
    text-align: center;
    font-size: 18px;
    color: #555;
    padding: 50px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    margin: 0 auto;
    max-width: 600px;
}
.error-message {
    color: #dc3545;
}


.categories-grid-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.category-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.category-card a {
  text-decoration: none;
  color: inherit;
  display: block;
  padding-bottom: 20px;
}

.category-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 12px 12px 0 0;
  margin-bottom: 15px;
}

.category-name {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .categories-grid-container {
    padding: 0 15px;
  }
}

@media (max-width: 992px) {
  .categories-grid-container {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 25px;
  }
  .category-image {
    height: 200px;
  }
  .page-main-title {
    font-size: 32px;
  }
}

@media (max-width: 768px) {
  .categories-page-container {
    padding: 20px;
  }
  .categories-grid-container {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 20px;
  }
  .category-image {
    height: 160px;
  }
  .category-name {
    font-size: 18px;
  }
  .page-main-title {
    font-size: 28px;
  }
}

@media (max-width: 480px) {
  .categories-page-container {
    padding: 15px;
  }
  .categories-grid-container {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
  .category-image {
    height: 120px;
  }
  .category-name {
    font-size: 16px;
  }
  .page-main-title {
    font-size: 24px;
  }
}
</style>