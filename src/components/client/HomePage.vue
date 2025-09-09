<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-slideshow position-relative d-flex align-items-center text-white">
      <div class="hero-slides-wrapper">
        <transition-group name="slide-right" tag="div">
          <img
            v-for="(img, idx) in [heroImages[activeHeroIndex]]"
            :key="img"
            :src="img"
            class="hero-slide-img"
            alt="hero"
          />
        </transition-group>
        <div class="hero-overlay"></div>
      </div>
      <div class="container text-center hero-content">
        <h1 class="display-4 fw-bold">Chào mừng đến với CoolMen</h1>
        <p class="lead">Phong cách đỉnh cao, chất lượng hàng đầu</p>
        <a href="/coolmen/client-san-pham" class="btn btn-light btn-lg mt-3">Khám phá ngay</a>
      </div>
    </section>

    <!-- Danh Mục -->
    <section class="py-5 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h4 class="fw-bold">Mua sắm theo danh mục</h4>
          <a href="#" class="text-decoration-none text-primary" @click.prevent="goToCategories">
            Xem tất cả
          </a>
        </div>
        <transition-group name="grid" tag="div" class="row g-3 justify-content-center" appear>
          <!-- Danh mục -->
          <div v-for="item in categories" :key="item.title" class="col-6 col-sm-4 col-md-2">
            <div class="category-card" @click="goToCategory(item.id)" style="cursor: pointer">
              <img :src="item.image" alt="category" />
              <div class="overlay-text">
                <span>{{ item.title }}</span>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </section>

    <!-- Sản phẩm bán chạy -->
    <section class="py-5">
      <div class="container">
        <h4 class="fw-bold mb-4 text-center">Sản phẩm bán chạy</h4>
        <transition-group name="grid" tag="div" class="row g-3 justify-content-center" appear>
          <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="product in bestSellers" :key="product.id">
            <div class="card-product position-relative">
              <!-- HOT Badge -->
              <span class="badge bg-danger badge-label">Hot</span>

              <!-- Giảm giá -->
              <span v-if="product.discount > 0" class="badge bg-danger discount-badge">
                -{{ product.discount }}%
              </span>

              <!-- Ảnh + overlay -->
              <div class="image-wrapper">
                <img :src="product.image" alt="product" class="img-fluid" />
                <div class="overlay">
                  <button class="btn-buy" @click="goToProductDetail(product.id)">Mua ngay</button>
                </div>
              </div>

              <!-- Tên sản phẩm -->
              <div class="product-name text-center mt-2 fw-semibold">
                {{ product.name }}
              </div>

              <!-- Giá sản phẩm và số lượng đã bán -->
              <div class="price-quantity-section mt-2">
                <!-- Giá sản phẩm -->
                <div class="price-display">
                  <!-- Nếu có giảm giá và có originalPriceRange -->
                  <template v-if="product.discount > 0 && product.originalPriceRange && product.priceRange">
                    <div class="original-price text-muted text-decoration-line-through">
                      {{ formatPrice(product.originalPriceRange.min) }}
                      <template v-if="product.originalPriceRange.min !== product.originalPriceRange.max">
                        - {{ formatPrice(product.originalPriceRange.max) }}
                      </template>
                    </div>
                    <div class="current-price text-dark fw-bold">
                      {{ formatPrice(product.priceRange.min) }}
                      <template v-if="product.priceRange.min !== product.priceRange.max">
                        - {{ formatPrice(product.priceRange.max) }}
                      </template>
                    </div>
                  </template>

                  <!-- Không giảm giá nhưng có priceRange -->
                  <template v-else-if="product.priceRange">
                    <div class="current-price text-dark fw-bold">
                      {{ formatPrice(product.priceRange.min) }}
                      <template v-if="product.priceRange.min !== product.priceRange.max">
                        - {{ formatPrice(product.priceRange.max) }}
                      </template>
                    </div>
                  </template>

                  <!-- Không có giá -->
                  <template v-else>
                    <div class="current-price text-dark fw-bold">
                      Liên hệ
                    </div>
                  </template>
                </div>

                <!-- Số lượng đã bán -->
                <div class="sold-quantity">
                  Đã bán {{ product.tongSoLuongBan || 0 }}
                </div>
              </div>

            </div>
          </div>
        </transition-group>
      </div>
    </section>


    <!-- Panner -->
    <section class="py-3">
      <div class="container">
        <img src="/src/assets/Paner2.jpg" alt="Banner" class="banner-image" />
      </div>
    </section>

    <!-- Sản phẩm nổi bật -->
    <section class="py-5 bg-light">
      <div class="container">
        <h4 class="fw-bold mb-4 text-center">Sản phẩm nổi bật</h4>
        <transition-group name="grid" tag="div" class="row g-3 justify-content-center" appear>
          <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="product in highlightProducts" :key="product.id">
            <div class="card-product position-relative text-center">

              <!-- Giảm giá -->
              <span v-if="product.discount > 0"
                class="badge bg-danger discount-badge position-absolute top-0 end-0 m-2">
                -{{ product.discount }}%
              </span>

              <!-- Ảnh sản phẩm -->
              <div class="image-wrapper">
                <img :src="product.image" alt="product" class="img-fluid" />
                <div class="overlay">
                  <button class="btn-buy" @click="goToProductDetail(product.id)">Mua ngay</button>
                </div>
              </div>

              <!-- Tên sản phẩm -->
              <div class="product-name mt-2 fw-semibold">
                {{ product.name }}
              </div>

              <!-- ⭐ Điểm đánh giá -->
              <div class="rating-section mt-1">
                <span v-for="star in 5" :key="star" class="star">
                  <i v-if="star <= product.rating" class="bi bi-star-fill text-warning"></i>
                  <i v-else class="bi bi-star text-muted"></i>
                </span>
                <span class="ms-1 text-muted">({{ product.reviews }})</span>
              </div>

              <!-- Giá sản phẩm -->
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

    <section class="py-5 bg-light">
      <div class="container">
        <h4 class="fw-bold mb-4 text-center">Sản phẩm mới</h4>
        <transition-group name="grid" tag="div" class="row g-3 justify-content-center" appear>
          <div class="col-6 col-sm-4 col-md-3 col-lg-2" v-for="product in newProducts" :key="product.id">
            <div class="card-product position-relative">

              <!-- Badge NEW -->
              <span class="badge-new">New</span>
              <!-- Ảnh -->
              <div class="image-wrapper">
                <img :src="product.image" alt="product" class="img-fluid" />
                <div class="overlay">
                  <button class="btn-buy" @click="goToProductDetail(product.id)">Mua ngay</button>
                </div>
              </div>

              <!-- ⭐ Đánh giá -->
              <div class="rating-section text-center mt-2">
                <span v-for="star in 5" :key="star" class="star">
                  <i v-if="star <= product.rating" class="bi bi-star-fill text-warning"></i>
                  <i v-else class="bi bi-star text-muted"></i>
                </span>
                <span class="ms-1 text-muted">({{ product.reviews }})</span>
              </div>

              <!-- Tên sản phẩm -->
              <div class="product-name text-center fw-semibold mt-1">
                {{ product.name }}
              </div>

              <!-- Giá -->
              <div class="text-center mt-1">
                <template v-if="product.discount > 0">
                  <div class="text-muted text-decoration-line-through small">
                    {{ formatPrice(product.originalPriceRange.min) }}
                    <template v-if="product.originalPriceRange.min !== product.originalPriceRange.max">
                      - {{ formatPrice(product.originalPriceRange.max) }}
                    </template>
                  </div>
                </template>
                <div class="fw-bold text-dark">
                  {{ formatPrice(product.priceRange.min) }}
                  <template v-if="product.priceRange.min !== product.priceRange.max">
                    - {{ formatPrice(product.priceRange.max) }}
                  </template>
                </div>
              </div>

            </div>
          </div>
        </transition-group>
      </div>
    </section>

    <!-- Why Us -->
    <section class="py-5">
      <div class="container">
        <h2 class="text-center mb-4">Vì sao chọn CoolMen?</h2>
        <div class="row text-center">
          <div class="col-md-4" v-for="(reason, index) in reasons" :key="index">
            <i :class="reason.icon" style="font-size: 2rem; color: #0d6efd;"></i>
            <h5 class="mt-3">{{ reason.title }}</h5>
            <p>{{ reason.desc }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'

const categories = ref([])
const bestSellers = ref([])
const router = useRouter()


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
    console.log(categories.value)
    // Bán chạy
    const resBestsellers = await axios.get('http://localhost:8080/home/danh-sach')
    const rawProducts = resBestsellers.data.data
      // Chỉ lấy sản phẩm có chi tiết trạng thái 1 và tổng số lượng > 0
      .filter(item => {
        const ctspList = item.chiTietSanPham?.filter(ct => ct.trangThai === 1) || [];
        const totalQuantity = ctspList.reduce((sum, ct) => sum + (ct.soLuong || 0), 0);
        return ctspList.length > 0 && totalQuantity > 0;
      })
      .sort((a, b) => b.tongSoLuongBan - a.tongSoLuongBan)
      .slice(0, 6);

    bestSellers.value = await Promise.all(rawProducts.map(async (item) => {
      const ctspList = item.chiTietSanPham?.filter(ct => ct.trangThai === 1) || [];

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
    const data = res.data.data || []

    // Chỉ lấy sản phẩm có chi tiết trạng thái 1 và tổng số lượng > 0
    const filtered = data.filter(item => {
      const ctspList = item.chiTietSanPham?.filter(ct => ct.trangThai === 1) || [];
      const totalQuantity = ctspList.reduce((sum, ct) => sum + (ct.soLuong || 0), 0);
      return ctspList.length > 0 && totalQuantity > 0;
    });

    // Sắp xếp theo ngày tạo giảm dần (mới nhất trước)
    const sorted = filtered.slice().sort((a, b) => {
      const dateA = new Date(a.sanPham.ngayTao)
      const dateB = new Date(b.sanPham.ngayTao)
      return dateB - dateA
    }).slice(0, 6);

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
    console.log(newProducts.value)
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
    const res = await axios.get('http://localhost:8080/home/danh-sach')
    const data = res.data.data

    // Chỉ lấy sản phẩm có chi tiết trạng thái 1 và tổng số lượng > 0
    const filtered = data.filter(item => {
      const ctspList = item.chiTietSanPham?.filter(ct => ct.trangThai === 1) || [];
      const totalQuantity = ctspList.reduce((sum, ct) => sum + (ct.soLuong || 0), 0);
      return ctspList.length > 0 && totalQuantity > 0;
    });

    const processed = await Promise.all(filtered.map(async item => {
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
    console.log(processed)
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

const heroImages = [
  '/src/assets/banner-thoi-trang-nam-5.jpg',
  '/src/assets/images1.jpeg',
  '/src/assets/images.jpeg',
  '/src/assets/Paner1.png',
  '/src/assets/trang-tri-shop-quan-ao-1.jpg',
];

const activeHeroIndex = ref(0)
let heroInterval = null

onMounted(() => {
  heroInterval = setInterval(() => {
    activeHeroIndex.value = (activeHeroIndex.value + 1) % heroImages.length
  },3000)
})

onUnmounted(() => {
  if (heroInterval) clearInterval(heroInterval)
})
</script>

<style scoped>
.hero-slideshow {
  height: 80vh;
  overflow: hidden;
  position: relative;
}

.hero-slides-wrapper {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
}

.hero-slide-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.8s;
  border-radius: 0;
  z-index: 2;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
}

.hero-content {
  position: relative;
  z-index: 10;
}

.slide-right-enter-active, .slide-right-leave-active {
  transition: all 0.8s cubic-bezier(.77,0,.18,1);
}
.slide-right-enter-from {
  opacity: 0;
  transform: translateX(100%);
}
.slide-right-enter-to {
  opacity: 1;
  transform: translateX(0);
}
.slide-right-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(-100%);
}

/* Danh mục */
.category-card {
  width: 100%;
  /* chiếm hết col */
  aspect-ratio: 3/4;
  /* giữ tỉ lệ khung hình ổn định */
  overflow: hidden;
  border-radius: 12px;
  position: relative;
  flex-shrink: 0;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.category-card:hover {
  transform: scale(1.05);
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 12px;
}

.overlay-text {
  position: absolute;
  bottom: 10px;
  left: 12px;
  color: white;
  font-weight: 600;
  text-shadow: 0 0 5px rgba(0, 0, 0, 0.7);
  font-size: 0.95rem;
}

/* sản phẩm  */
.card-product {
  background-color: #fff;
  padding: 10px;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
}

.image-wrapper {
  position: relative;
  overflow: hidden;
}

.card-product img {
  width: 100%;
  height: auto;
  display: block;
  transition: transform 0.3s ease;
}

.image-wrapper:hover img {
  transform: scale(1.05);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-wrapper:hover .overlay {
  opacity: 1;
}

.btn-buy {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
}

.badge-label {
  position: absolute;
  top: 10px;
  left: 10px;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 50px;
  z-index: 2;
}

.discount-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 50px;
  z-index: 2;
}

.product-name {
  font-size: 14px;
  color: #333;
}

.price-section {
  font-size: 14px;
}

.original-price {
  font-size: 13px;
}

.current-price {
  font-size: 14px;
}

.price-quantity-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
  min-height: 40px;
  /* Tăng chiều cao để chứa khoảng giá */
}

.price-display {
  flex: 1;
  min-width: 0;
}

.price-display .current-price,
.price-display .original-price {
  width: 100%;
  text-align: left;
  line-height: 1.2;
  margin-bottom: 2px;
}

.price-display .original-price {
  font-size: 12px;
  margin-bottom: 1px;
}

.price-display .current-price {
  font-size: 14px;
  font-weight: bold;
}

.sold-quantity {
  font-size: 13px;
  color: #666;
  white-space: nowrap;
  flex-shrink: 0;
  text-align: right;
  min-width: fit-content;
}


/*  */
.banner-image {
  width: 100%;
  /* Chiếm hết chiều ngang trong .container */
  height: auto;
  max-height: 200px;
  /* Tuỳ chỉnh chiều cao tối đa */
  object-fit: cover;
  /* Giữ hình không méo, crop nếu cần */
  border-radius: 8px;
  /* Tuỳ chọn: bo góc nhẹ */
  display: block;
}

.badge-new {
  background-color: #ffc107;
  /* màu vàng */
  color: #ffffff;
  font-weight: bold;
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 10;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
}


/*  */
/* Transition-group animations for slide-up effect */
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.grid-enter-active {
  transition: all 250ms ease;
}

.grid-leave-active {
  transition: all 220ms ease;
  position: relative;
}

.grid-move {
  transition: transform 300ms ease;
}

/* Animation cho slideshow hero */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.5s ease, opacity 0.5s ease;
}

.slide-right-enter {
  transform: translateX(100%);
  opacity: 0;
}

.slide-right-leave {
  transform: translateX(-100%);
  opacity: 0;
}
</style>
