
import QuanLyKhachHang from "../views/CustomerManagement.vue";
import KhachHangAddPage from "@/components/admin/KhachHangAddPage.vue";
import KhachHangEditPage from "@/components/admin/KhachHangEditPage.vue";
import { createRouter, createWebHistory } from "vue-router";
import NhanVien from '@/components/admin/NhanVien.vue'
import ThemNhanVien from '@/components/admin/ThemNhanVien.vue'
import ChatLieu from '@/components/admin/ChatLieu.vue'
import TayAo from '@/components/admin/TayAo.vue';
import CoAo from '@/components/admin/CoAo.vue';
import Mau from '@/components/admin/Mau.vue';
import KichCo from '@/components/admin/KichCo.vue';
import KieuAo from '@/components/admin/KieuAo.vue';
import SanPham from "@/components/admin/SanPham.vue";
import ThemSanPham from "@/components/admin/ThemSanPham.vue";
import ChiTietSanPham from '@/components/admin/ChiTietSanPham.vue';
import DanhMuc from '@/components/admin/DanhMuc.vue';
import Test1 from '@/components/admin/Test1.vue';
import PhieuGiamGia from "@/components/admin/PhieuGiamGia.vue";
import ThemPhieuGiamGia from "@/components/admin/ThemPhieuGiamGIa.vue";
import SuaPhieuGiamGia from "@/components/admin/SuaPhieuGiamGia.vue";
import HoaDon from "../components/admin/HoaDon.vue";
import HoaDonChiTiet from '@/components/admin/HoaDonChiTiet.vue'
import BanHang from "@/components/admin/BanHang.vue";
import ThemSP from "@/components/admin/ThemSP.vue";
import SuaDotGiamGia from "@/components/admin/SuaDotGiamGia.vue";
import ThemDotGiamGia from "@/components/admin/ThemDotGiamGia.vue";
import DotGiamGia from "@/components/admin/DotGiamGia.vue";
import DangNhap from "@/components/admin/DangNhap.vue";
import Cookies from "js-cookie";


import PhieuGiamGiaBH from "@/components/admin/PhieuGiamGiaBH.vue";

import ThongKeTongHop from "@/components/admin/ThongKeTongHop.vue";


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/hoa-don",
      name: "hoadon",
      component: HoaDon,
    },
    {
      path: "/hoa-don-chi-tiet/:maHoaDon",
      name: "hoadonchitiet",
      path: "/ban-hang-test",
      name: "banhangtest",
      component: BanHang,
    },
    {
      path: '/hoa-don-chi-tiet/:maHoaDon',
      name: 'hoadonchitiet',
      component: HoaDonChiTiet,
      props: true,
    },
    {
      path: "/ban-hang",
      name: "banhang",
      component: BanHang,
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
      component: ThemSP,
    },
    {
      path: "/san-pham/chi-tiet-san-pham/:id1",
      name: "chi-tiet-san-pham",
      component: ChiTietSanPham,
    },
    {
      path: "/san-pham/danh-muc",
      name: "danh-muc",
      component: DanhMuc,
    },
    {
      path: "/test",
      name: "test",
      component: Test1,
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
    {
      path: "/nhan-vien",
      name: "nhanvien",
      component: NhanVien,
    },
    {
      path: "/nhan-vien/them",
      name: "themnhanvien",
      component: ThemNhanVien,
    },
    {
      path: "/nhan-vien/sua/:id",
      name: "SuaNhanVien",
      component: () => import("@/components/admin/ThemNhanVien.vue"),
    },

    {
      path: "/phieu-giam-gia",
      name: "phieugiamgia",
      component: PhieuGiamGia,
    },
    {
      path: "/phieu-giam-gia/them",
      name: "ThemPhieuGiamGia",
      component: ThemPhieuGiamGia,
    },
    {
      path: "/phieu-giam-gia/sua/:id",
      name: "SuaPhieuGiamGia",
      component: SuaPhieuGiamGia,
    },
    {
      path: "/dot-giam-gia",
      name: "dotgiamgia",
      component: DotGiamGia,
    },
    {
      path: "/dot-giam-gia/them",
      name: "themdotgiamgia",
      component: ThemDotGiamGia,
    },
    {
      path: "/dot-giam-gia/sua/:id",
      name: "suadoigiamgia",
      component: SuaDotGiamGia,
    },
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
    {
      path: "/thong-tin-ca-nhan",
      name: "ThongTinCaNhan",
      component: () => import("@/components/admin/ThongTinNhanVien.vue"),

    },

    {
      path: '/thong-ke',
      name: 'thongke',
      component: ThongKeTongHop,
    },
  ],
});
// ✅ Navigation Guard sử dụng cookie


router.beforeEach((to, from, next) => {
  const token = Cookies.get("token");

  // ✅ 1. Chưa có token => chỉ cho phép vào /dang-nhap và /quen-mat-khau
  if (!token && !["/dang-nhap", "/quen-mat-khau"].includes(to.path)) {
    return next("/dang-nhap");
  }

  // ✅ 2. Đã có token nhưng vào lại /dang-nhap => đá về /
  if (token && to.path === "/dang-nhap") {
    return next("/");
  }

  // ✅ 3. Nếu có token, giải mã và kiểm tra vai trò
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const vaiTro = payload.scope || payload.vaiTro || "";

      // Nếu là STAFF mà truy cập /nhan-vien => chặn
      if (vaiTro === "STAFF" && to.path.startsWith("/nhan-vien")) {
        return next("/");
      }
    } catch (err) {
      Cookies.remove("token");
      return next("/dang-nhap");
    }
  }

  next();
});


export default router;