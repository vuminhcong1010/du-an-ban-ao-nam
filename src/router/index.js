// src/router/index.js

import { createRouter, createWebHistory } from "vue-router";

// Import các components chính
import LoginPage from "@/views/LoginPage.vue";
// import RegisterPage from "../views/RegisterPage.vue";
import HomePage from '../views/HomePage.vue'; // Trang chủ
import NotFoundPage from '@/views/NotFoundPage.vue'; // Trang 404

// Import Layout Component
import DefaultLayout from '@/layouts/DefaultLayout.vue';

// Import các components admin và quản lý khác của bạn
import HoaDon from "../components/admin/HoaDon.vue";
import QuanLyKhachHang from "../views/CustomerManagement.vue";
import KhachHangAddPage from "@/components/admin/KhachHangAddPage.vue";
import KhachHangEditPage from "@/components/admin/KhachHangEditPage.vue";
import NhanVien from "@/components/admin/NhanVien.vue";
// import ThemNhanVien from "@/components/admin/ThemNhanVien.vue";
// import ChatLieu from "@/components/admin/ChatLieu.vue";
// import TayAo from "@/components/admin/TayAo.vue";
// import CoAo from "@/components/admin/CoAo.vue";
// import Mau from "@/components/admin/Mau.vue";
// import KichCo from "@/components/admin/KichCo.vue";
// import KieuAo from "@/components/admin/KieuAo.vue";
// import SanPham from "@/components/admin/SanPham.vue";
// import ThemSanPham from "@/components/admin/ThemSanPham.vue";
// import ChiTietSanPham from "@/components/admin/ChiTietSanPham.vue";
// import DanhMuc from "@/components/admin/DanhMuc.vue";
// import Test1 from "@/components/admin/Test1.vue";
// import PhieuGiamGia from "@/components/admin/PhieuGiamGia.vue";
// import ThemPhieuGiamGia from "@/components/admin/ThemPhieuGiamGia.vue";
// import SuaPhieuGiamGia from "@/components/admin/SuaPhieuGiamGia.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: LoginPage,
      meta: { requiresAuth: false, layout: 'none' }, // Đánh dấu không dùng layout
    },
    // {
    //   path: "/register",
    //   name: "Register",
    //   component: RegisterPage,
    //   meta: { requiresAuth: false, layout: 'none' }, // Đánh dấu không dùng layout
    // },
    // Route cha cho DefaultLayout
    {
      path: "/", // Đường dẫn gốc cho DefaultLayout
      component: DefaultLayout, // Component layout chính
      children: [
        {
          path: '', // Path rỗng để HomePage hiển thị khi chỉ có '/'
          name: 'Home',
          component: HomePage,
          meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        },
        {
          path: "/hoa-don",
          name: "hoadon",
          component: HoaDon,
          meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        },
        // {
        //   path: "/san-pham/chat-lieu",
        //   name: "chat-lieu",
        //   component: ChatLieu,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham/tay-ao",
        //   name: "tay-ao",
        //   component: TayAo,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham/co-ao",
        //   name: "co-ao",
        //   component: CoAo,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham/mau",
        //   name: "mau",
        //   component: Mau,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham/kich-co",
        //   name: "kich-co",
        //   component: KichCo,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham/kieu-ao",
        //   name: "kieu-ao",
        //   component: KieuAo,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham",
        //   name: "san-pham",
        //   component: SanPham,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham/add",
        //   name: "them-san-pham",
        //   component: ThemSanPham,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham/chi-tiet-san-pham/:id1",
        //   name: "chi-tiet-san-pham",
        //   component: ChiTietSanPham,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/san-pham/danh-muc",
        //   name: "danh-muc",
        //   component: DanhMuc,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/test",
        //   name: "test",
        //   component: Test1,
        //   meta: { requiresAuth: true, roles: ['ADMIN'] },
        // },
        {
          path: "/khach-hang",
          name: "khachhang",
          component: QuanLyKhachHang,
          meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        },
        {
          path: "/khach-hang/add",
          name: "AddKhachHang",
          component: KhachHangAddPage,
          meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        },
        {
          path: "/khach-hang/edit/:id",
          name: "EditKhachHang",
          component: KhachHangEditPage,
          props: true,
          meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        },
        {
          path: "/nhan-vien",
          name: "nhanvien",
          component: NhanVien,
          meta: { requiresAuth: true, roles: ['ADMIN'] },
        },
        // {
        //   path: "/nhan-vien/them",
        //   name: "themnhanvien",
        //   component: ThemNhanVien,
        //   meta: { requiresAuth: true, roles: ['ADMIN'] },
        // },
        // {
        //   path: "/nhan-vien/sua/:id",
        //   name: "SuaNhanVien",
        //   component: () => import("@/components/admin/ThemNhanVien.vue"),
        //   meta: { requiresAuth: true, roles: ['ADMIN'] },
        // },
        // {
        //   path: "/phieu-giam-gia",
        //   name: "phieugiamgia",
        //   component: PhieuGiamGia,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/phieu-giam-gia/them",
        //   name: "ThemPhieuGiamGia",
        //   component: ThemPhieuGiamGia,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
        // {
        //   path: "/phieu-giam-gia/sua/:id",
        //   name: "SuaPhieuGiamGia",
        //   component: SuaPhieuGiamGia,
        //   meta: { requiresAuth: true, roles: ['ADMIN', 'STAFF'] },
        // },
      ]
    },
    // Route Catch-all cho các đường dẫn không tồn tại (404 Not Found)
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: NotFoundPage, // Sử dụng component đã import
      meta: { layout: 'none' } // Đánh dấu không dùng layout
    }
  ],
});

// Navigation Guard (giữ nguyên như đã sửa)
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('authToken');
  let userRoles = [];
  try {
    userRoles = JSON.parse(localStorage.getItem('userRoles')) || [];
  } catch (e) {
    console.error("Lỗi khi parse userRoles từ localStorage:", e);
    userRoles = [];
  }

  // Chuyển hướng nếu đã đăng nhập và cố gắng truy cập trang login/register
  if ((to.name === 'Login' || to.name === 'Register') && isAuthenticated) {
    console.log("Đã đăng nhập, chuyển hướng về trang chủ.");
    return next('/');
  }

  // Xử lý các route yêu cầu xác thực
  if (to.meta.requiresAuth) {
    if (!isAuthenticated) {
      console.log("Không có token, chuyển hướng đến trang đăng nhập.");
      return next('/login');
    }

    // Kiểm tra vai trò nếu route yêu cầu vai trò cụ thể
    if (to.meta.roles && to.meta.roles.length > 0) {
      const hasRequiredRole = to.meta.roles.some(role => userRoles.includes(role));
      if (!hasRequiredRole) {
        console.log(`Không có quyền truy cập '${to.path}'. Yêu cầu vai trò: ${to.meta.roles.join(', ')}, Vai trò hiện tại: ${userRoles.join(', ')}`);
        alert('Bạn không có quyền truy cập trang này!');
        return next('/');
      }
    }
  }

  // Cho phép truy cập nếu không có vấn đề gì
  next();
});

export default router;
