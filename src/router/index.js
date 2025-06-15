import HoaDon from '@/components/admin/HoaDon.vue'
import NhanVien from '@/components/admin/NhanVien.vue'
import ThemNhanVien from '@/components/admin/ThemNhanVien.vue'
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
    {
      path: '/nhan-vien/them',
      name: 'themnhanvien',
      component: ThemNhanVien,
    },
    {
      path: '/nhan-vien/sua/:id',
      name: 'SuaNhanVien',
      component: () => import('@/components/admin/ThemNhanVien.vue')
    }
  ],
})

export default router
