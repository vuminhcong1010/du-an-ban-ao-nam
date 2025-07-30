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
        <h2 class="section-title">Shop by Category</h2>
        <div class="categories-grid">
          <div v-for="category in categories" :key="category.name" class="category-card">
            <img :src="category.image" :alt="category.name" class="category-image" />
            <h3 class="category-name">{{ category.name }}</h3>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
// --- IMPORT HÌNH ẢNH SỬ DỤNG CÚ PHÁP ES MODULES ---
// Đảm bảo các tệp ảnh này tồn tại trong thư mục src/assets/

// Cho Hero Section và Logos
import heroBgImage from '@/assets/anh1.jpg'; // Đường dẫn ảnh nền hero
// Tôi giả định bạn có 6 logo riêng biệt hoặc muốn dùng cùng một logo nhiều lần
import logoPlaceholder1 from '@/assets/anh1.jpg'; // Logo 1 (ví dụ)
import logoPlaceholder2 from '@/assets/anh1.jpg'; // Logo 2
import logoPlaceholder3 from '@/assets/anh1.jpg'; // Logo 3
import logoPlaceholder4 from '@/assets/anh1.jpg'; // Logo 4
import logoPlaceholder5 from '@/assets/anh1.jpg'; // Logo 5
import logoPlaceholder6 from '@/assets/logo.png'; // Logo 6 (từ file logo.png của bạn)

// Cho Product Categories
import clothingImage from '@/assets/anh1.jpg'; //
import tshirtsImage from '@/assets/anh2.jpg'; //
import hoodiesImage from '@/assets/anh1.jpg'; //
import musicImage from '@/assets/anh2.jpg'; //
import albumsImage from '@/assets/anh1.jpg'; //
import postersImage from '@/assets/anh2.jpg'; //
import accessoriesImage from '@/assets/anh1.jpg'; //
import decorImage from '@/assets/anh2.jpg'; //


export default {
  name: 'HomePage',
  data() {
    return {
      // Gán các import vào data properties để sử dụng trong template
      heroBgImage: heroBgImage,
      
      // Gán các logo placeholder
      logo1: logoPlaceholder1,
      logo2: logoPlaceholder2,
      logo3: logoPlaceholder3,
      logo4: logoPlaceholder4,
      logo5: logoPlaceholder5,
      logo6: logoPlaceholder6,

      categories: [
        { name: 'Clothing', image: clothingImage },
        { name: 'T-Shirts', image: tshirtsImage },
        { name: 'Hoodies', image: hoodiesImage },
        { name: 'Music', image: musicImage },
        { name: 'Albums', image: albumsImage },
        { name: 'Posters', image: postersImage },
        { name: 'Accessories', image: accessoriesImage },
        { name: 'Decor', image: decorImage },
      ]
    };
  },
};
</script>

<style scoped>
/* (Giữ nguyên phần CSS đã cung cấp trước đó) */
.home-page {
  /* Không cần padding top/bottom ở đây vì layout đã quản lý */
}

/* --- Hero Section --- */
.hero-section {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f7f7f7; /* Màu nền nhẹ cho phần hero */
  padding: 60px 0; /* Khoảng đệm trên dưới */
  min-height: 450px; /* Chiều cao tối thiểu */
  overflow: hidden; /* Đảm bảo ảnh nền không tràn ra */
}

.hero-content {
  flex: 1;
  max-width: 500px;
  z-index: 1; /* Đảm bảo nội dung nằm trên ảnh nền */
  text-align: left;
}

.hero-content h1 {
  font-size: 3.5em;
  color: #333;
  margin-bottom: 10px;
  font-weight: 800;
}

.hero-content h2 {
  font-size: 2.5em;
  color: #555;
  margin-bottom: 20px;
  font-weight: 600;
}

.hero-content p {
  font-size: 1.1em;
  color: #777;
  line-height: 1.6;
  margin-bottom: 30px;
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

.hero-image {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 55%; /* Chiếm 55% chiều rộng bên phải */
  display: flex;
  justify-content: flex-end;
  align-items: center;
  overflow: hidden;
}

.hero-image img {
  height: 100%;
  width: auto;
  object-fit: cover;
  object-position: right center; /* Căn ảnh sang phải */
}

/* --- Brand Logos Section --- */
.brand-logos {
  padding: 40px 0;
  background-color: #fff;
  border-bottom: 1px solid #eee;
}

.logos-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: wrap; /* Cho phép xuống dòng trên màn hình nhỏ */
  gap: 30px; /* Khoảng cách giữa các logo */
}

.logos-grid img {
  max-height: 40px;
  filter: grayscale(100%); /* Làm xám logo */
  opacity: 0.6;
  transition: opacity 0.3s ease, filter 0.3s ease;
}

.logos-grid img:hover {
  filter: grayscale(0%);
  opacity: 1;
}

/* --- Categories Section --- */
.categories-section {
  padding: 60px 0;
  background-color: #f7f7f7;
}

.section-title {
  text-align: center;
  font-size: 2.2em;
  color: #333;
  margin-bottom: 40px;
  font-weight: bold;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 25px;
  justify-content: center;
}

.category-card {
  background-color: #fff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  text-align: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.category-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  display: block;
}

.category-name {
  font-size: 1.4em;
  color: #333;
  margin: 15px 0 20px;
  font-weight: 600;
}

/* --- Responsive Adjustments --- */
@media (max-width: 1200px) {
  .hero-content {
    max-width: 450px;
  }
}

@media (max-width: 992px) {
  .hero-section {
    flex-direction: column; /* Sắp xếp lại theo cột */
    padding: 40px 0;
    min-height: auto;
  }
  .hero-content {
    max-width: 90%;
    text-align: center;
    margin-bottom: 30px;
  }
  .hero-image {
    position: relative;
    width: 100%;
    height: 300px; /* Chiều cao cố định cho ảnh trên mobile */
    justify-content: center;
  }
  .hero-image img {
    width: 100%;
    height: 100%;
    object-position: center;
  }

  .section-title {
    font-size: 2em;
  }
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .hero-content h1 {
    font-size: 2.8em;
  }
  .hero-content h2 {
    font-size: 2em;
  }
  .hero-content p {
    font-size: 1em;
  }
  .shop-now-btn {
    padding: 12px 25px;
    font-size: 1em;
  }

  .section-title {
    font-size: 1.8em;
    margin-bottom: 30px;
  }
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
  }
  .category-image {
    height: 200px;
  }
  .category-name {
    font-size: 1.2em;
    margin: 10px 0 15px;
  }
  .logos-grid {
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .hero-content h1 {
    font-size: 2.2em;
  }
  .hero-content h2 {
    font-size: 1.6em;
  }
  .hero-image {
    height: 250px;
  }

  .section-title {
    font-size: 1.5em;
    margin-bottom: 25px;
  }
  .categories-grid {
    grid-template-columns: 1fr; /* Một cột duy nhất trên màn hình nhỏ hơn */
    gap: 15px;
  }
  .category-image {
    height: 180px;
  }
}
</style>