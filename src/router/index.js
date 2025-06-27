import HoaDon from "../components/admin/HoaDon.vue";
// import QuanLyKhachHang from '../components/admin/KhachHangTable.vue'
import QuanLyKhachHang from "../views/CustomerManagement.vue";
import KhachHangAddPage from "@/components/admin/KhachHangAddPage.vue";
import KhachHangEditPage from "@/components/admin/KhachHangEditPage.vue";
import { createRouter, createWebHistory } from "vue-router";
import HoaDon from '@/components/admin/HoaDon.vue'
import NhanVien from '@/components/admin/NhanVien.vue'
import ThemNhanVien from '@/components/admin/ThemNhanVien.vue'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/hoa-don",
      name: "hoadon",
      component: HoaDon,
    },
    {
      path: "/khach-hang",
      name: "khachhang",
      component: QuanLyKhachHang,
    },
    {
      path: "/khach-hang/add",
      name: "AddKhachHang",
      component: KhachHangAddPage,
    },
    {
      path: "/khach-hang/edit/:id", // Đường dẫn với tham số ID để sửa
      name: "EditKhachHang",
      component: KhachHangEditPage,
      props: true, // Quan trọng: Truyền params làm props cho component
    },
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
});

export default router;
