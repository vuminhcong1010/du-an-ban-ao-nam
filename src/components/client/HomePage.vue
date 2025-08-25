<template>
  <div>
    <!-- Hero Section -->
    <section class="hero d-flex align-items-center text-white">
      <div class="container text-center">
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
          <a href="#" class="text-decoration-none text-primary">Xem tất cả</a>
        </div>
        <div class="row g-3 justify-content-center">
          <!-- Danh mục -->
          <div v-for="item in categories" :key="item.title" class="col-6 col-sm-4 col-md-2">
            <div class="category-card" @click="goToCategory(item.id)" style="cursor: pointer">
              <img :src="item.image" alt="category" />
              <div class="overlay-text">
                <span>{{ item.title }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Sản phẩm bán chạy -->
    <section class="py-5">
      <div class="container">
        <h4 class="fw-bold mb-4 text-center">Sản phẩm bán chạy</h4>
        <div class="row g-3 justify-content-center">
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
                  <button class="btn-buy">Mua ngay</button>
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
                  <!-- Nếu có giảm giá -->
                  <template v-if="product.discount > 0 && product.originalPriceRange">
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
                  <!-- Không giảm giá -->
                  <template v-else>
                    <div class="current-price text-dark fw-bold">
                      {{ formatPrice(product.priceRange.min) }}
                      <template v-if="product.priceRange.min !== product.priceRange.max">
                        - {{ formatPrice(product.priceRange.max) }}
                      </template>
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
        </div>
      </div>
    </section>


    <!-- Panner -->
    <section class="py-3">
      <div class="container">
        <img src="/src/assets/Paner2.jpg" alt="Banner" class="banner-image" />
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
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'


const categories = ref([])
const bestSellers = ref([])
const router = useRouter()

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

    // Bán chạy
    const resBestsellers = await axios.get('http://localhost:8080/home/danh-sach')
    const rawProducts = resBestsellers.data.data
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
})


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

<style scoped>
.hero {
  background: url('/src/assets/trang-tri-shop-quan-ao-1.jpg') center center/cover no-repeat;
  height: 80vh;
}

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



/*  */
</style>
