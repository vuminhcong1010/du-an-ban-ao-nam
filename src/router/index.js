import QuanLyKhachHang from "../views/CustomerManagement.vue";
import KhachHangAddPage from "@/components/admin/KhachHangAddPage.vue";
import KhachHangEditPage from "@/components/admin/KhachHangEditPage.vue";
import {createRouter, createWebHistory} from "vue-router";
import NhanVien from "@/components/admin/NhanVien.vue";
import ThemNhanVien from "@/components/admin/ThemNhanVien.vue";
import ChatLieu from "@/components/admin/ChatLieu.vue";
import TayAo from "@/components/admin/TayAo.vue";
import CoAo from "@/components/admin/CoAo.vue";
import Mau from "@/components/admin/Mau.vue";
import KichCo from "@/components/admin/KichCo.vue";
import KieuAo from "@/components/admin/KieuAo.vue";
import SanPham from "@/components/admin/SanPham.vue";
import ThemSanPham from "@/components/admin/ThemSanPham.vue";
import ChiTietSanPham from "@/components/admin/ChiTietSanPham.vue";
import DanhMuc from "@/components/admin/DanhMuc.vue";
import Test1 from "@/components/admin/Test1.vue";
import PhieuGiamGia from "@/components/admin/PhieuGiamGia.vue";
import ThemPhieuGiamGia from "@/components/admin/ThemPhieuGiamGIa.vue";
import SuaPhieuGiamGia from "@/components/admin/SuaPhieuGiamGia.vue";
import HoaDon from "../components/admin/HoaDon.vue";
import HoaDonChiTiet from "@/components/admin/HoaDonChiTiet.vue";
import BanHang from "@/components/admin/BanHang.vue";
import ThemSP from "@/components/admin/ThemSP.vue";
import SuaDotGiamGia from "@/components/admin/SuaDotGiamGia.vue";
import ThemDotGiamGia from "@/components/admin/ThemDotGiamGia.vue";
import DotGiamGia from "@/components/admin/DotGiamGia.vue";
import DangNhap from "@/components/admin/DangNhap.vue";
import Cookies from "js-cookie";
// --- CLIENT COMPONENTS ---
import ClientLayout from "@/views/client/ClientLayout.vue";
import HomePage from "@/components/client/HomePage.vue";

// --- ADMIN COMPONENTS ---
// Import AdminLayout mới
import AdminLayout from "@/views/admin/AdminLayout.vue"; // Đảm bảo đường dẫn này đúng


import Chat from "@/components/admin/Chat.vue";
import PhieuGiamGiaBH from "@/components/admin/PhieuGiamGiaBH.vue";

import ThongKeTongHop from "@/components/admin/ThongKeTongHop.vue";

import DangNhapCustomer from "@/components/admin/DangNhapCustomer.vue";
import ThongTinNhanVien from "@/components/admin/ThongTinNhanVien.vue";

import ThongKeBaoCao from "@/components/admin/ThongKeBaoCao.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- CLIENT ROUTES ---
    {
      path: "/coolmen", // Đường dẫn gốc cho client
      component: ClientLayout, // Sẽ render ClientLayout và RouterView bên trong nó
      children: [
        {
          path: "", // Khớp với '/coolmen'
          name: "home",
          component: HomePage,
        },
        {
          path: "/dang-nhap-khach-hang",
          name: "dang-nhap-khach-hang",
          component: DangNhapCustomer,
        },
        // Thêm các route client khác ở đây
      ],
    },

    // --- ADMIN AUTHENTICATION ROUTES (không có layout) ---
    {
      path: "/dang-nhap",
      name: "dang-nhap",
      component: DangNhap,
    },
    {
      path: "/quen-mat-khau",
      name: "ForgotPassword",
      component: () => import("@/components/admin/QuenMatKhau.vue"),
    },

    // --- ADMIN LAYOUT ROUTES ---
    // Mọi route con sẽ được hiển thị bên trong AdminLayout
    {
      path: "/", // Đây là đường dẫn gốc mà AdminLayout sẽ chiếm
      // HOẶC bạn có thể dùng 'path: /admin' nếu muốn tất cả các URL admin bắt đầu bằng /admin
      component: AdminLayout, // <-- SỬ DỤNG ADMINLAYOUT MỚI TẠO
      children: [
        {
          path: "", // Đường dẫn mặc định khi truy cập '/' (sau khi đăng nhập)
          name: "admin-dashboard",
          component: ThongKeTongHop, // Ví dụ: Trang Dashboard của Admin
          meta: {requiresAuth: true},
        },
        // Các routes admin khác của bạn (giữ nguyên)
        {
          path: "/hoa-don",
          name: "hoadon",
          component: HoaDon,
          meta: {requiresAuth: true},
        },
        {
          path: "/hoa-don-chi-tiet/:maHoaDon",
          name: "hoadonchitiet",
          component: HoaDonChiTiet,
          props: true,
          meta: {requiresAuth: true},
        },
        {
          path: "/ban-hang",
          name: "banhang",
          component: BanHang,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/chat-lieu",
          name: "chat-lieu",
          component: ChatLieu,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/tay-ao",
          name: "tay-ao",
          component: TayAo,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/co-ao",
          name: "co-ao",
          component: CoAo,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/mau",
          name: "mau",
          component: Mau,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/kich-co",
          name: "kich-co",
          component: KichCo,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/kieu-ao",
          name: "kieu-ao",
          component: KieuAo,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham",
          name: "san-pham",
          component: SanPham,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/add",
          name: "them-san-pham",
          component: ThemSP,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/chi-tiet-san-pham/:id1",
          name: "chi-tiet-san-pham",
          component: ChiTietSanPham,
          props: true,
          meta: {requiresAuth: true},
        },
        {
          path: "/san-pham/danh-muc",
          name: "danh-muc",
          component: DanhMuc,
          meta: {requiresAuth: true},
        },
        {
          path: "/test",
          name: "test",
          component: Test1,
          meta: {requiresAuth: true},
        },
        {
          path: "/khach-hang",
          name: "khachhang",
          component: QuanLyKhachHang,
          meta: {requiresAuth: true},
        },
        {
          path: "/khach-hang/add",
          name: "AddKhachHang",
          component: KhachHangAddPage,
          meta: {requiresAuth: true},
        },
        {
          path: "/khach-hang/edit/:id",
          name: "EditKhachHang",
          component: KhachHangEditPage,
          props: true,
          meta: {requiresAuth: true},
        },
        {
          path: "/nhan-vien",
          name: "nhanvien",
          component: NhanVien,
          meta: {requiresAuth: true, requiresRole: "ADMIN"},
        },
        {
          path: "/nhan-vien/them",
          name: "themnhanvien",
          component: ThemNhanVien,
          meta: {requiresAuth: true, requiresRole: "ADMIN"},
        },
        {
          path: "/nhan-vien/sua/:id",
          name: "SuaNhanVien",
          component: ThemNhanVien,
          props: true,
          meta: {requiresAuth: true, requiresRole: "ADMIN"},
        },
        {
          path: "/phieu-giam-gia",
          name: "phieugiamgia",
          component: PhieuGiamGia,
          meta: {requiresAuth: true},
        },
        {
          path: "/phieu-giam-gia/them",
          name: "ThemPhieuGiamGia",
          component: ThemPhieuGiamGia,
          meta: {requiresAuth: true},
        },
        {
          path: "/phieu-giam-gia/sua/:id",
          name: "SuaPhieuGiamGia",
          component: SuaPhieuGiamGia,
          props: true,
          meta: {requiresAuth: true},
        },
        {
          path: "/dot-giam-gia",
          name: "dotgiamgia",
          component: DotGiamGia,
          meta: {requiresAuth: true},
        },
        {
          path: "/dot-giam-gia/them",
          name: "themdotgiamgia",
          component: ThemDotGiamGia,
          meta: {requiresAuth: true},
        },
        {
          path: "/dot-giam-gia/sua/:id",
          name: "suadoigiamgia",
          component: SuaDotGiamGia,
          props: true,
          meta: {requiresAuth: true},
        },
        {
          path: "/thong-tin-ca-nhan",
          name: "ThongTinCaNhan",
          component: ThongTinNhanVien,
          meta: {requiresAuth: true},
        },
        {
          path: "/thong-ke",
          name: "thongke",
          component: ThongKeTongHop,
          meta: {requiresAuth: true},
        },
        {
          path: "/thong-ke/bao-cao",
          name: "thongke-bao-cao",
          component: ThongKeBaoCao,
          meta: {requiresAuth: true},
        },
        {
          path: "/phieu-giam-gia-ban-hang",
          name: "phieugiamgiabh",
          component: PhieuGiamGiaBH,
          meta: {requiresAuth: true},
        },
        {
          path: "/chat",
          name: "chat",
          component: Chat,
        },
      ],
    },

    // --- Catch-all route (404 Not Found) ---
    {
      path: "/:pathMatch(.*)*",
      name: "NotFound",
      component: {
        template:
          "<div><h1>404 Not Found</h1><p>The page you are looking for does not exist.</p></div>",
      },
    },
  ],
});
// ✅ Navigation Guard sử dụng cookie

router.beforeEach((to, from, next) => {
  const token = Cookies.get("token");

  // ✅ 1. Chưa có token => chỉ cho phép vào /dang-nhap và /quen-mat-khau
  if (
    !token &&
    !["/dang-nhap", "/quen-mat-khau", "/dang-nhap-khach-hang","/coolmen"].includes(
      to.path
    )
  ) {
    return next("/dang-nhap");
  }

  // ✅ 2. Đã có token nhưng vào lại /dang-nhap => đá về /
  if (token && to.path === "/dang-nhap") {
    return next("/san-pham");
  }

  // ✅ 3. Nếu có token, giải mã và kiểm tra vai trò
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const vaiTro = payload.scope || payload.vaiTro || "";

      // Nếu là STAFF mà truy cập /nhan-vien => chặn
      if (vaiTro === "STAFF" && to.path.startsWith("/nhan-vien")) {
        return next("/san-pham");
      }
    } catch (err) {
      Cookies.remove("token");
      return next("/dang-nhap");
    }
  }

  next();
});

export default router;
