
import HoaDon from '@/components/admin/HoaDon.vue'
import HoaDonChiTiet from '@/components/admin/HoaDonChiTiet.vue'


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
      path: '/hoa-don-chi-tiet/:maHoaDon',
      name: 'hoadonchitiet',
      component: HoaDonChiTiet,
      props: true,
    },
    
  ],
})

export default router
