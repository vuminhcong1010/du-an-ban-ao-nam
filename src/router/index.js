
import HoaDon from '../components/admin/HoaDon.vue'
// import QuanLyKhachHang from '../components/admin/KhachHangTable.vue'
import QuanLyKhachHang from '../views/CustomerManagement.vue'
import QQuanLyKhachHang from '../views/QuanLyKhachHang.vue'
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
      path: '/khach-hang',
      name: 'khachhang',
      component: QuanLyKhachHang,
    },
     {
      path: '/nhan-vien',
      name: 'khachhang',
      component: QQuanLyKhachHang,
    },
  ],
})

export default router
