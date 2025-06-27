import HoaDon from '@/components/admin/HoaDon.vue'
import NhanVien from '@/components/admin/NhanVien.vue'
import ThemNhanVien from '@/components/admin/ThemNhanVien.vue'
import { createRouter, createWebHistory } from 'vue-router'
import ChatLieu from '@/components/admin/ChatLieu.vue'
import TayAo from '@/components/admin/TayAo.vue';
import CoAo from '@/components/admin/CoAo.vue';
import Mau from '@/components/admin/Mau.vue';
import KichCo from '@/components/admin/KichCo.vue';
import KieuAo from '@/components/admin/KieuAo.vue';
import SanPham from "@/components/admin/SanPham.vue";
import ThemSanPham from "@/components/admin/ThemSanPham.vue";
import ChiTietSanPham from '@/components/admin/ChiTietSanPham.vue';
import UpdateSanPham from '@/components/admin/UpdateSanPham.vue';
import DanhMuc from '@/components/admin/DanhMuc.vue';
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/hoa-don",
      name: "hoadon",
      component: HoaDon,
    },
    {

      path: "/san-pham/chat-lieu",
      name: "chat-lieu",
      component: ChatLieu,
    },
    {
      path: "/san-pham/tay-ao",
      name: "tay-ao",
      component: TayAo,
    },
    {
      path: "/san-pham/co-ao",
      name: "co-ao",
      component: CoAo,
    },
    {
      path: "/san-pham/mau",
      name: "mau",
      component: Mau,
    },
    {
      path: "/san-pham/kich-co",
      name: "kich-co",
      component: KichCo,
    },
    {
      path: "/san-pham/kieu-ao",
      name: "kieu-ao",
      component: KieuAo,
    },
    {
      path: "/san-pham",
      name: "san-pham",
      component: SanPham,
    },
    {
      path: "/san-pham/add",
      name: "them-san-pham",
      component: ThemSanPham,
    },
    {
      path: "/san-pham/chi-tiet-san-pham/:id1",
      name: "chi-tiet-san-pham",
      component: ChiTietSanPham
    },
    {
      path: "/san-pham/danh-muc",
      name: "danh-muc",
      component: DanhMuc

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

export default router
