<template>
  <div class="category-page container py-5">
    <transition-group name="grid" tag="div" class="row g-4" appear>
      <div
        class="col-6 col-sm-4 col-md-3"
        v-for="(category, index) in categories"
        :key="category.id"
      >
        <div class="category-card" @click="goToCategory(category.id)">
          <img :src="category.image" :alt="category.name" />
          <div class="category-title">{{ category.name }}</div>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const categories = ref([])

// Danh sách ảnh fallback nếu không có ảnh từ API
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

onMounted(async () => {
  try {
    const res = await axios.get('http://localhost:8080/home/loadDanhMucList')
    categories.value = res.data.map((item, index) => ({
      id: item.id,
      name: item.tenDanhMuc,
      image: item.anh && item.anh.trim() !== '' ? item.anh : imageList[index % imageList.length]
    }))
  } catch (error) {
    console.error('Lỗi khi tải danh mục:', error)
  }
})
</script>

<style scoped>
.category-page {
    margin-top: 60px;
  background-color: #f9f9f9;
}

.category-card {
  position: relative;
  overflow: hidden;
  border-radius: 16px;
  cursor: pointer;
  transition: transform 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  height: 240px;
}

.category-card:hover {
  transform: scale(1.03);
}

.category-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
  display: block;
}

.category-title {
  position: absolute;
  bottom: 12px;
  left: 12px;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
  background-color: rgba(0, 0, 0, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
}

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
</style>
