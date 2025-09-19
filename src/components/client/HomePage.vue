<template>
  <div class="wrapper">
    <!-- Phần Giới Thiệu (Slideshow) -->
    <section class="hero animate-on-scroll" >
      <div class="swiper">
        <div class="swiper-wrapper">
          <!-- Slide 1 -->
          <div class="swiper-slide">
            <a href="/coolmen/client-san-pham">
              <div class="hero-slide" style="background: url('/src/assets/banner_client.png') center/cover no-repeat;">
                <div class="container text-center"></div>
              </div>
            </a>
          </div>
          <!-- Slide 2 -->
          <div class="swiper-slide">
            <a href="/coolmen/client-san-pham">
              <div class="hero-slide" style="background: url('/src/assets/banner_client1.png') center/cover no-repeat;">
                <div class="container text-center"></div>
              </div>
            </a>
          </div>
          <!-- Slide 3 -->
          <div class="swiper-slide">
            <a href="/coolmen/client-san-pham">
              <div class="hero-slide" style="background: url('/src/assets/banner_client2.png') center/cover no-repeat;">
                <div class="container text-center"></div>
              </div>
            </a>
          </div>
        </div>
        <!-- Swiper Pagination -->
        <div class="swiper-pagination"></div>
        <!-- Swiper Navigation -->
        <div class="swiper-button-prev"></div>
        <div class="swiper-button-next"></div>
      </div>
    </section>

    <!-- Bộ Sưu Tập Hình Ảnh -->
<section class="py-4 bg-light animate-on-scroll" >
  <div class="container">
    <!-- Tiêu đề và link -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h4 class="fw-bold">Mua sắm theo danh mục</h4>
      <a href="#" class="text-decoration-none text-primary"  @click.prevent="goToCategories">
        Xem tất cả
      </a>
    </div>

    <!-- Danh mục -->
    <transition-group name="grid" tag="div" class="row g-3 justify-content-center" appear>
      <div v-for="item in categories" :key="item.id" class="col-6 col-sm-4 col-md-2">
        <div class="category-card text-center h-100"
             @click="goToCategory(item.id)" style="cursor: pointer">
          
          <!-- Ảnh -->
          <div class="category-image d-flex align-items-center justify-content-center">
            <img :src="item.image" alt="category" />
          </div>

          <!-- Tên + số sản phẩm -->
          <div class="category-info mt-3">
            <h6 class="fw-bold mb-1 category-title">
              <span class="title-text">{{ item.title }}</span>
              <span class="detail-text" style="margin-top: 5px;text-decoration: dashed" >Xem chi tiết</span>
            </h6>
          </div>
        </div>
      </div>
    </transition-group>
  </div>
</section>


    <!-- Banner Quảng Cáo -->
    <section class="py-4 animate-on-scroll" >
      <div class="container">
        <div class="banner-large">
           <a href="/coolmen/client-san-pham">
            <img src="/src/assets/banner2.png" alt="Banner" class="animate__animated" />
          </a>
          
        </div>
      </div>
    </section>

    <!-- Sản Phẩm Bán Chạy -->
    <section class="py-4 bg-light animate-on-scroll" >
      <div class="container">
        <h4 class="fw-bold mb-4 text-center">Sản phẩm bán chạy</h4>
        <transition-group name="grid" tag="div" class="row g-3 justify-content-center" appear>
          <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="product in bestSellers" :key="product.id">
            <div class="card-product position-relative text-center shadow-sm rounded-3 overflow-hidden">
              <!-- HOT Corner Ribbon -->
              <div class="corner-ribbon ribbon-hot">HOT</div>

              <!-- Discount Badge -->
              <span v-if="product.discount > 0" class="discount-badge">-{{ product.discount }}%</span>

              <!-- Ảnh sản phẩm -->
              <router-link :to="`/coolmen/client-san-pham-detail/${product.id}`" class="image-wrapper d-block position-relative">
                <img :src="product.image" alt="product" class="img-fluid rounded-top" />
                <div class="overlay d-flex align-items-center justify-content-center">
                  <button class="btn-buy" @click.stop="goToProductDetail(product.id)">Mua ngay</button>
                </div>
              </router-link>

              <!-- Tên sản phẩm -->
              <router-link :to="`/coolmen/client-san-pham-detail/${product.id}`" class="product-name mt-2 fw-semibold text-dark d-block text-truncate px-2">
                {{ product.name }}
              </router-link>

              <!-- Giá sản phẩm -->
              <div class="price-display mt-1">
                <template v-if="product.discount > 0 && product.originalPriceRange">
                  <span class="text-muted text-decoration-line-through me-1 small">
                    {{ formatPrice(product.originalPriceRange.min) }}
                    <template v-if="product.originalPriceRange.min !== product.originalPriceRange.max">
                      - {{ formatPrice(product.originalPriceRange.max) }}
                    </template>
                  </span>
                </template>
                <span class="text-dark fw-bold">
                  {{ formatPrice(product.priceRange.min) }}
                  <template v-if="product.priceRange.min !== product.priceRange.max">
                    - {{ formatPrice(product.priceRange.max) }}
                  </template>
                </span>
              </div>

              <!-- Số lượng đã bán -->
              <div class="sold-quantity mt-1 mb-2 text-muted small">
                Đã bán {{ product.tongSoLuongBan || 0 }}
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </section>

    <!-- Sản Phẩm Nổi Bật & Thời Trang Denim -->
    <section class="py-4 animate-on-scroll" >
      <div class="container">
        <div class="row g-4">
          <!-- Box lớn bên trái -->
          <div class="col-md-6">
            <div class="promo-box animate__animated" style="height: 427px;">
              <img src="/src/assets/banner3.jpg" alt="New Arrivals" class="img-fluid object-fit-cover" />
              <div class="promo-overlay d-flex align-items-end p-3">
                <h3 class="text-white fw-bold">Sản phẩm mới nhất</h3>
              </div>
            </div>
          </div>

          <!-- 3 box nhỏ bên phải -->
          <div class="col-md-6">
            <div class="row g-4">
              <div class="col-12">
                <div class="promo-box animate__animated">
                  <img src="/src/assets/banner4.jpg" alt="Now Trending" class="img-fluid w-100 object-fit-cover" />
                  <div class="promo-overlay d-flex align-items-end p-3">
                    <h4 class="text-white fw-bold">Bộ sưu tập mới</h4>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="promo-box animate__animated">
                  <img src="/src/assets/banner5.jpg" alt="Campaigns" class="img-fluid w-100 object-fit-cover" />
                  <div class="promo-overlay d-flex align-items-end p-3">
                    <h4 class="text-white fw-bold">Thời trang cao cấp</h4>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="promo-box animate__animated">
                  <img src="/src/assets/banner6.jpg" alt="Lookbook" class="img-fluid w-100 object-fit-cover" />
                  <div class="promo-overlay d-flex align-items-end p-3">
                    <h4 class="text-white fw-bold">Phụ kiện</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sản Phẩm Tiêu Biểu -->
    <section class="py-4 bg-light animate-on-scroll" >
      <div class="container">
        <h4 class="fw-bold mb-4 text-center">Sản phẩm nổi bật</h4>
        <transition-group name="grid" tag="div" class="row g-3 justify-content-center" appear>
          <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="product in highlightProducts" :key="product.id">
            <div class="card-product position-relative text-center shadow-sm rounded-3 overflow-hidden">
              <!-- NEW Corner Ribbon -->
              <div class="corner-ribbon ribbon-new">NEW</div>

              <!-- Discount Badge -->
              <span v-if="product.discount > 0" class="discount-badge">-{{ product.discount }}%</span>

              <!-- Ảnh sản phẩm -->
              <router-link :to="`/coolmen/client-san-pham-detail/${product.id}`" class="image-wrapper d-block position-relative">
                <img :src="product.image" alt="product" class="img-fluid rounded-top" />
                <div class="overlay d-flex align-items-center justify-content-center">
                  <button class="btn-buy" @click.stop="goToProductDetail(product.id)">Mua ngay</button>
                </div>
              </router-link>

              <!-- Tên sản phẩm -->
              <router-link :to="`/coolmen/client-san-pham-detail/${product.id}`" class="product-name mt-2 fw-semibold text-dark d-block text-truncate px-2">
                {{ product.name }}
              </router-link>

              <!-- ⭐ Điểm đánh giá -->
              <div class="rating-section mt-1 small">
                <span v-for="star in 5" :key="star" class="star">
                  <i v-if="star <= product.rating" class="bi bi-star-fill text-warning"></i>
                  <i v-else class="bi bi-star text-muted"></i>
                </span>
                <span class="ms-1 text-muted">({{ product.reviews }})</span>
              </div>

                  <!-- Giá -->
              <div class="text-center mt-1">
                <!-- Nếu có giảm giá và có originalPriceRange -->
                <template v-if="product.discount > 0 && product.originalPriceRange && product.priceRange">
                  <div class="text-muted text-decoration-line-through small">
                    {{ formatPrice(product.originalPriceRange.min) }}
                    <template v-if="product.originalPriceRange.min !== product.originalPriceRange.max">
                      - {{ formatPrice(product.originalPriceRange.max) }}
                    </template>
                  </div>
                  <div class="fw-bold text-dark">
                    {{ formatPrice(product.priceRange.min) }}
                    <template v-if="product.priceRange.min !== product.priceRange.max">
                      - {{ formatPrice(product.priceRange.max) }}
                    </template>
                  </div>
                </template>

                <!-- Không giảm giá nhưng có priceRange -->
                <template v-else-if="product.priceRange">
                  <div class="fw-bold text-dark">
                    {{ formatPrice(product.priceRange.min) }}
                    <template v-if="product.priceRange.min !== product.priceRange.max">
                      - {{ formatPrice(product.priceRange.max) }}
                    </template>
                  </div>
                </template>

                <!-- Không có giá -->
                <template v-else>
                  <div class="fw-bold text-dark">
                    Liên hệ
                  </div>
                </template>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </section>

<section class="text-center py-5">
  <div class="container">
    <h2 class="fw-bold mb-3">KHÁCH HÀNG NÓI VỀ CHÚNG TÔI</h2>
    <p class="text-muted">
      Hơn +50,000 khách hàng đang sử dụng cảm nhận như thế nào về CoolMen - Thời trang nam
    </p>
  </div>
</section>


    <!-- Testimonials Section -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4" v-for="(item, index) in testimonials" :key="index">
            <div class="testimonial-card shadow bg-white p-4 h-100 position-relative rounded">
              <div class="d-flex align-items-center mb-3">
                <img
                  :src="item.img"
                  alt="avatar"
                  class="rounded-circle me-3"
                  width="70"
                  height="70"
                />
                <div>
                  <h6 class="fw-bold mb-0">{{ item.name }}</h6>
                  <small class="text-muted">{{ item.role }}</small>
                </div>
              </div>
              <p class="fst-italic">"{{ item.message }}"</p>
              <span class="quote-icon">❞</span>
            </div>
          </div>
        </div>
      </div>
    </section>


  </div>
</template>

<script>
import Swiper from 'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.mjs';

export default {
  mounted() {
    // Khởi tạo Swiper
    new Swiper('.swiper', {
      loop: true,
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      effect: 'fade',
      fadeEffect: {
        crossFade: true,
      },
    });

    // Intersection Observer để kích hoạt animation khi cuộn
    const sections = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const animation = entry.target.getAttribute('data-animation');
          entry.target.classList.add('animate__animated', `animate__${animation}`);
          entry.target.querySelectorAll('.animate__animated').forEach(child => {
            child.classList.add(`animate__${animation}`);
          });
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2
    });

    sections.forEach(section => {
      observer.observe(section);
    });
  }
};
</script>

<style scoped>
/* Import animate.css */
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
/* Import Swiper CSS */
@import url('https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css');
.wrapper{
  margin-top: 70px;
}
/* Ẩn section trước khi animation được kích hoạt */
.animate-on-scroll {
  opacity: 0;
}
.animate-on-scroll.animate__animated {
  opacity: 1;
}

/* Category Card Styling */
.category-card {
  border: 1px solid #eee;
}
.category-card:hover .overlay-text {
  background: rgba(0, 0, 0, 0.8);
}
.category-card:hover img {
  transform: scale(1.05);
}
.overlay-text {
  opacity: 1;
  transition: opacity 0.3s;
}
.category-card img {
  transition: transform 0.3s ease;
}

/* Card Product Styling */
.card-product {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.card-product:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0,0,0,0.1);
}
.corner-ribbon {
  width: 120px;
  background: #e63946;
  color: #fff;
  position: absolute;
  top: 12px;
  left: -35px;
  text-align: center;
  line-height: 28px;
  letter-spacing: 1px;
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  z-index: 5;
  font-weight: 700;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
}
.ribbon-hot {
  background: linear-gradient(135deg, #e63946 0%, #dc2626 100%);
}
.ribbon-new {
  background: linear-gradient(135deg, #FFC107 0%, #FFA000 100%);
}
.discount-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  background: #ff3b30;
  color: #fff;
  padding: 4px 10px;
  border-radius: 6px;
  font-weight: 700;
  box-shadow: 0 3px 6px rgba(0,0,0,0.2);
  z-index: 6;
}
.image-wrapper {
  position: relative;
  overflow: hidden;
}
.image-wrapper img {
  transition: transform 0.3s ease;
}
.image-wrapper:hover img {
  transform: scale(1.05);
}
.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.4);
  opacity: 0;
  transition: opacity 0.3s ease;
}
.image-wrapper:hover .overlay {
  opacity: 1;
}
.btn-buy {
  background: #fff;
  border: none;
  padding: 6px 14px;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-buy:hover {
  background: #000;
  color: #fff;
}

/* Hero Slideshow */
.hero {
  height: 100vh; /* Giảm từ 110vh xuống 100vh */
  overflow: hidden;
}
.swiper {
  width: 100%;
  height: 100%;
}
.hero-slide {
  height: 100vh; /* Đồng bộ với .hero */
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111;
  background-size: cover !important;
  background-position: center !important;
}
.hero-title {
  font-size: 3rem;
  font-weight: 600;
}
.hero-subtitle {
  font-size: 1.1rem;
  color: #444;
  margin: 10px 0 20px;
}
.btn-hero {
  border: 1px solid #111;
  color: #111;
  background: transparent;
  padding: 10px 28px;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}
.btn-hero:hover {
  background: #111;
  color: #fff;
  animation: btnPulse 0.5s;
}
@keyframes btnPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
.swiper-pagination-bullet {
  background: #fff;
  opacity: 0.8;
}
.swiper-pagination-bullet-active {
  background: #111;
}
.swiper-button-prev,
.swiper-button-next {
  color: #fff;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.swiper-button-prev:after,
.swiper-button-next:after {
  font-size: 20px;
}

/* Tiêu đề phần */
.section-title {
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 2rem;
  position: relative;
}
.section-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 50%;
  transform: translateX(-50%);
  width: 50px;
  height: 2px;
  background: #111;
  animation: underlineGrow 0.5s ease-in-out;
}
@keyframes underlineGrow {
  0% { width: 0; }
  100% { width: 50px; }
}

/* Banner */
.banner-large {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
}
.banner-large img {
  width: 100%;
  height: 340px;
  object-fit: cover;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.banner-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.35);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #fff;
}
.btn-banner {
  border: 1px solid #fff;
  color: #fff;
  background: transparent;
  padding: 6px 18px;
  font-size: 0.85rem;
  text-decoration: none;
}
.btn-banner:hover {
  background: #fff;
  color: #111;
  animation: btnPulse 0.5s;
}

/* Khuyến mãi */
.promo-box {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  height: 200px; /* Điều chỉnh từ 49% thành 200px */
}
.promo-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.promo-box img:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.promo-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.55), transparent 60%);
  display: flex;
  align-items: flex-end;
  padding: 12px 16px;
  color: #fff;
}
.promo-overlay h3,
.promo-overlay h4 {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.3;
}
.btn-promo {
  border: 1px solid #fff;
  padding: 4px 12px;
  font-size: 0.8rem;
  color: #fff;
  text-decoration: none;
  margin-top: 6px;
  border-radius: 20px;
}
.btn-promo:hover {
  background: #fff;
  color: #111;
  animation: btnPulse 0.4s;
}

/* Hình ảnh trong Độc Quyền Cho Bạn và Mua Sắm Qua Instagram */
.img-fluid.rounded {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.img-fluid.rounded:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}
.category-card {
  background: #fafafa;
  padding: 20px 10px;
  clip-path: polygon(0 0, 95% 0, 100% 100%, 5% 100%);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.category-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}

.category-image {
  height: 130px;
}
.category-image img {
  max-height: 100%;
  max-width: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}
.category-card:hover .category-image img {
  transform: scale(1.05);
}

.category-info {
  min-height: 50px;
}

/* Chữ đổi khi hover */
.category-title {
  position: relative;
  height: 22px;
  overflow: hidden;
}
.category-title .title-text,
.category-title .detail-text {
  display: block;
  transition: transform 0.3s ease;
  
}
.category-title .detail-text {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  transform: translateY(100%);
  text-decoration: dashed;
}
.category-card:hover .category-title .title-text {
  transform: translateY(-100%);
}
.category-card:hover .category-title .detail-text {
  transform: translateY(0);
}

.testimonial-card {
  border-left: 5px solid #0a2c57; /* màu xanh nhấn */
  position: relative;
}

.quote-icon {
  position: absolute;
  bottom: 10px;
  right: 15px;
  font-size: 2rem;
  color: #ccc;
}
</style>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

const categories = ref([])
const bestSellers = ref([])
const router = useRouter()


const testimonials = [
  {
    name: "Anh Minh Nhật",
    role: "Developer",
    message:
      "Tôi thấy CoolMen có chất lượng sản phẩm rất tốt, mẫu mã cũng khiến tôi rất vừa ý tạo cho tôi cảm giác rất thoải mái khi mặc",
    img: "https://picsum.photos/200/200?random=1"
  },
  {
    name: "Anh Huỳnh Tuyến",
    role: "Customer Service",
    message:
      "Rất thích đồ của CoolMen, chuẩn mẫu mã, ship nhanh và chất lượng bền tốt. Tôi sẽ quay lại mua nữa.",
    img: "https://picsum.photos/200/200?random=2"
  },
  {
    name: "Chị Hồng Liêm",
    role: "Marketing Manager",
    message:
       "Tôi đã lựa chọn CoolMen để dành tặng cho người yêu của mình những món quà thật ý nghĩa. Tôi rất hài lòng với dịch vụ chuyên nghiệp, chất lượng sản phẩm cũng như sự tận tình.",
    img: "https://picsum.photos/200/200?random=3"
  }
];
console.log(Cookies.get("email"));
const imageList = [
  '/src/assets/DanhMuc1.webp',
  '/src/assets/DanhMuc2.webp',
  '/src/assets/DanhMuc4.webp',
  '/src/assets/DanhMuc6.jpg',
  '/src/assets/DanhMuc7.jpg',
  '/src/assets/DanhMuc8.jpeg'
]

const goToCategory = (id) => {
  router.push({ name: 'product-category', params: { idDanhMuc: id } })
}
function formatPrice(value) {
  if (typeof value !== 'number' || isNaN(value) || value <= 0) return '∞ đ'
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value)
}

// Tính tổng tồn kho khả dụng của 1 sản phẩm từ danh sách chi tiết
function getTotalAvailableQuantity(item) {
  const ctspList = item?.chiTietSanPham || []
  return ctspList.reduce((sum, ct) => {
    const qty =
      (typeof ct.soLuongTon === 'number' ? ct.soLuongTon : undefined) ??
      (typeof ct.soLuong === 'number' ? ct.soLuong : undefined) ??
      (typeof ct.soLuongTrongKho === 'number' ? ct.soLuongTrongKho : 0)
    return sum + (Number.isFinite(qty) ? qty : 0)
  }, 0)
}

onMounted(async () => {
  try {
    // Danh mục
    const response = await axios.get('http://localhost:8080/home/loadDanhMucList')
    const danhMucList = response.data.slice(0, 6)
    categories.value = danhMucList.map((item, index) => ({
      id: item.id,
      title: item.tenDanhMuc,
      image: imageList[index] || '/src/assets/default.jpg'
    }))

    // Bán chạy
    const resBestsellers = await axios.get('http://localhost:8080/home/danh-sach')
    const rawProducts = resBestsellers.data.data
      .filter(p => (p?.sanPham?.trangThai === 1))
      .filter(p => getTotalAvailableQuantity(p) > 0)
      .filter(p => p.tongSoLuongBan > 0)
      .sort((a, b) => b.tongSoLuongBan - a.tongSoLuongBan)
      .slice(0, 6)

    // Ánh xạ sản phẩm với thông tin giá và giảm giá
    bestSellers.value = await Promise.all(rawProducts.map(async (item) => {
      const ctspList = item.chiTietSanPham?.filter(ct => ct.trangThai === 1) || []

      // Lấy giá từ BE, không fix cứng
      const prices = ctspList.map(ct => ct.gia ?? ct.giaBan).filter(p => typeof p === 'number' && !isNaN(p) && p > 0)
      const originalPrices = ctspList.map(ct => ct.giaGoc ?? ct.gia ?? ct.giaBan).filter(p => typeof p === 'number' && !isNaN(p) && p > 0)

      // Nếu không có giá, có thể bỏ qua hoặc hiển thị "Liên hệ"
      let originalPriceRange = null
      let priceRange = null

      if (prices.length > 0) {
        originalPriceRange = {
          min: Math.min(...originalPrices),
          max: Math.max(...originalPrices)
        }
        let discount = 0
        try {
          const discountRes = await axios.get(`http://localhost:8080/client/giam-gia/${item.sanPham.id}`)
          if (discountRes.status === 200 && Array.isArray(discountRes.data.data)) {
            const discounts = discountRes.data.data.map(Number).filter(p => !isNaN(p) && p > 0)
            if (discounts.length > 0) {
              discount = Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
            }
          }
        } catch (err) {
          console.error('Lỗi khi lấy giảm giá:', err)
        }

        priceRange = { ...originalPriceRange }
        if (discount > 0) {
          priceRange = {
            min: Math.round(originalPriceRange.min * (1 - discount / 100)),
            max: Math.round(originalPriceRange.max * (1 - discount / 100))
          }
        }

        return {
          id: item.sanPham.id,
          name: item.sanPham.tenSanPham,
          image: item.anhSanPham?.[0] || 'https://woocommerce.com/wp-content/uploads/2020/03/product-image-placeholder.png',
          priceRange,
          originalPriceRange: discount > 0 ? originalPriceRange : null,
          discount,
          tongSoLuongBan: item.tongSoLuongBan || 0
        }
      } else {
        // Không có giá, trả về sản phẩm với giá null
        return {
          id: item.sanPham.id,
          name: item.sanPham.tenSanPham,
          image: item.anhSanPham?.[0] || 'https://woocommerce.com/wp-content/uploads/2020/03/product-image-placeholder.png',
          priceRange: null,
          originalPriceRange: null,
          discount: 0,
          tongSoLuongBan: item.tongSoLuongBan || 0
        }
      }
    }))

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu:', error)
  }
  await fetchHighlightProducts()
  await fetchNewProducts()
})
function goToCategories() {
  router.push('/coolmen/danh-muc-List')

}
// 🆕 Sản phẩm mới
const newProducts = ref([])

const fetchNewProducts = async () => {
  try {
    const res = await axios.get('http://localhost:8080/home/danh-sach')
    const data = (res.data.data || [])
      .filter(p => (p?.sanPham?.trangThai === 1))
      .filter(p => getTotalAvailableQuantity(p) > 0)

    // Sắp xếp theo ngày tạo giảm dần (mới nhất trước)
    const sorted = data.slice().sort((a, b) => {
      const dateA = new Date(a.sanPham.ngayTao)
      const dateB = new Date(b.sanPham.ngayTao)
      return dateB - dateA
    }).slice(0, 6)

    newProducts.value = await Promise.all(sorted.map(async (item) => {
      const ctspList = item.chiTietSanPham?.filter(ct => ct.trangThai === 1) || []
      const prices = ctspList.map(ct => ct.gia ?? ct.giaBan).filter(p => typeof p === 'number' && p > 0)
      const originalPrices = ctspList.map(ct => ct.giaGoc ?? ct.gia).filter(p => typeof p === 'number' && p > 0)

      let discount = 0
      try {
        const discountRes = await axios.get(`http://localhost:8080/client/giam-gia/${item.sanPham.id}`)
        if (discountRes.status === 200 && Array.isArray(discountRes.data.data)) {
          const discounts = discountRes.data.data.map(Number).filter(p => !isNaN(p))
          if (discounts.length > 0) {
            discount = Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
          }
        }
      } catch (e) { }

      const danhGiaList = item.danhGiaList || []
      const totalRating = danhGiaList.reduce((sum, dg) => sum + dg.diemDanhGia, 0)
      const avgRating = danhGiaList.length > 0 ? totalRating / danhGiaList.length : 0

      let priceRange = null, originalPriceRange = null
      if (prices.length > 0) {
        const min = Math.min(...originalPrices)
        const max = Math.max(...originalPrices)
        originalPriceRange = { min, max }

        priceRange = discount > 0
          ? { min: Math.round(min * (1 - discount / 100)), max: Math.round(max * (1 - discount / 100)) }
          : { min, max }
      }

      return {
        id: item.sanPham.id,
        name: item.sanPham.tenSanPham,
        image: item.anhSanPham?.[0] || 'https://woocommerce.com/wp-content/uploads/2020/03/product-image-placeholder.png',
        priceRange,
        originalPriceRange: discount > 0 ? originalPriceRange : null,
        discount,
        rating: Math.round(avgRating),
        reviews: danhGiaList.length
      }
    }))
  } catch (err) {
    console.error('Lỗi khi lấy sản phẩm mới:', err)
  }
}
const goToProductDetail = (productId) => {
  router.push({ name: 'client-san-pham-detail', params: { id: productId } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
}


const highlightProducts = ref([])

const fetchHighlightProducts = async () => {
  try {
    const res = await axios.get('http://localhost:8080/home/danh-sach') // reuse same API
    const data = res.data.data
      .filter(p => (p?.sanPham?.trangThai === 1))
      .filter(p => getTotalAvailableQuantity(p) > 0)
  
    // Tính điểm trung bình đánh giá và sắp xếp
    const processed = await Promise.all(data.map(async item => {
      const ctspList = item.chiTietSanPham?.filter(ct => ct.trangThai === 1) || []
      const prices = ctspList.map(ct => ct.gia ?? ct.giaBan).filter(p => typeof p === 'number' && p > 0)
      const originalPrices = ctspList.map(ct => ct.giaGoc ?? ct.gia).filter(p => typeof p === 'number' && p > 0)

      let discount = 0
      try {
        const discountRes = await axios.get(`http://localhost:8080/client/giam-gia/${item.sanPham.id}`)
        if (discountRes.status === 200 && Array.isArray(discountRes.data.data)) {
          const discounts = discountRes.data.data.map(Number).filter(p => !isNaN(p))
          if (discounts.length > 0) {
            discount = Math.round(discounts.reduce((a, b) => a + b, 0) / discounts.length)
          }
        }
      } catch (e) { }

      const danhGiaList = item.danhGiaList || []
      const totalRating = danhGiaList.reduce((sum, dg) => sum + dg.diemDanhGia, 0)
      const avgRating = danhGiaList.length > 0 ? totalRating / danhGiaList.length : 0

      let priceRange = null, originalPriceRange = null
      if (prices.length > 0) {
        const min = Math.min(...originalPrices)
        const max = Math.max(...originalPrices)
        originalPriceRange = { min, max }

        priceRange = discount > 0
          ? { min: Math.round(min * (1 - discount / 100)), max: Math.round(max * (1 - discount / 100)) }
          : { min, max }
      }

      return {
        id: item.sanPham.id,
        name: item.sanPham.tenSanPham,
        image: item.anhSanPham?.[0] || 'https://woocommerce.com/wp-content/uploads/2020/03/product-image-placeholder.png',
        priceRange,
        originalPriceRange,
        discount,
        rating: Math.round(avgRating),
        reviews: danhGiaList.length
      }
    }))

    // Lấy 6 sản phẩm có giảm giá cao nhất và đánh giá cao nhất
    highlightProducts.value = processed
      .sort((a, b) => {
        const scoreA = a.discount * 2 + a.rating
        const scoreB = b.discount * 2 + b.rating
        return scoreB - scoreA
      })
      .slice(0, 6)

  } catch (err) {
    console.error('Lỗi khi lấy sản phẩm nổi bật:', err)
  }
}


const reasons = [
  {
    icon: 'bi bi-truck',
    title: 'Giao hàng nhanh',
    desc: 'Giao hàng toàn quốc chỉ từ 1 - 3 ngày.',
  },
  {
    icon: 'bi bi-shield-check',
    title: 'Chất lượng đảm bảo',
    desc: '100% hàng chính hãng, kiểm định kỹ lưỡng.',
  },
  {
    icon: 'bi bi-arrow-repeat',
    title: 'Đổi trả dễ dàng',
    desc: 'Đổi trả trong 7 ngày nếu không hài lòng.',
  },
]
</script>