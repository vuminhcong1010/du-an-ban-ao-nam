
import HoaDon from '@/components/admin/HoaDon.vue'
import NhanVien from '@/components/admin/NhanVien.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/hoa-don',
      name: 'hoadon',
      component: HoaDon,
    },
    {
      path: '/nhan-vien',
      name: 'nhanvien',
      component:NhanVien,
    },
  ],
})

export default router
