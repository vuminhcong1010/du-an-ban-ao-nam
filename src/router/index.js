import QuanLyKhachHang from "../views/CustomerManagement.vue";
import KhachHangAddPage from "@/components/admin/KhachHangAddPage.vue";
import KhachHangEditPage from "@/components/admin/KhachHangEditPage.vue";
import { createRouter, createWebHistory } from "vue-router";
import NhanVien from "@/components/admin/NhanVien.vue";
import ThemNhanVien from "@/components/admin/ThemNhanVien.vue";
import ChatLieu from "@/components/admin/ChatLieu.vue";
import TayAo from "@/components/admin/TayAo.vue";
import CoAo from "@/components/admin/CoAo.vue";
import Mau from "@/components/admin/Mau.vue";
import KichCo from "@/components/admin/KichCo.vue";
import KieuAo from "@/components/admin/KieuAo.vue";
import SanPham from "@/components/admin/SanPham.vue";
import ThemSanPham from "@/components/admin/ThemSanPham.vue"; // This import seems unused if ThemSP is the product add page
import ChiTietSanPham from "@/components/admin/ChiTietSanPham.vue";
import DanhMuc from "@/components/admin/DanhMuc.vue";
import Test1 from "@/components/admin/Test1.vue";
import PhieuGiamGia from "@/components/admin/PhieuGiamGia.vue";
import ThemPhieuGiamGia from "@/components/admin/ThemPhieuGiamGIa.vue";
import SuaPhieuGiamGia from "@/components/admin/SuaPhieuGiamGia.vue";
import HoaDon from "../components/admin/HoaDon.vue";
import HoaDonChiTiet from "@/components/admin/HoaDonChiTiet.vue";
import BanHang from "@/components/admin/BanHang.vue";
import ThemSP from "@/components/admin/ThemSP.vue"; // This is likely the "add product" page
import SuaDotGiamGia from "@/components/admin/SuaDotGiamGia.vue";
import ThemDotGiamGia from "@/components/admin/ThemDotGiamGia.vue";
import DotGiamGia from "@/components/admin/DotGiamGia.vue";
import DangNhap from "@/components/admin/DangNhap.vue"; // Admin Login
import Cookies from "js-cookie";
import { useAuthStore } from "@/stores/auth";
import ForgotPassword from "@/components/client/ForgotPassword.vue";
// --- CLIENT COMPONENTS ---
import ClientLayout from "@/views/client/ClientLayout.vue";
import HomePage from "@/components/client/HomePage.vue";
import DangNhapCustomer from "@/components/client/DangNhapCustomer.vue"; // Client Login
import DangKiCustomer from "@/components/client/DangKyCustomer.vue"; // This component path seems inconsistent (admin folder for client register) - consider moving to client/
import ClientSanPham from "@/components/client/ProductPage.vue";
import Oder from "@/components/client/Order.vue";
import ClientSanPhamDetail from "@/components/client/ProductDetail.vue";
import LichSuDatHang from "@/components/client/OrderHistory.vue";
import VnpayReturn from "@/components/client/ReturnCard.vue";
import LienHe from "@/components/client/LienHe.vue";
// import MyAccount from "@/components/client/MyAccount.vue"; // Make sure this file exists
import OrderDetail from "@/components/client/OrderDetail.vue"; // Make sure this file exists
import LoginGG from "@/components/client/LoginGG.vue"; // Google Login Page
import XacNhanThongTinCustomer from "@/components/client/XacNhanThongTinCustomer.vue"; // Component for confirming customer info (path inconsistency, consider moving)
import OrderLookup from "@/components/client/OrderLookup.vue";
import DanhMucList from "@/components/client/Category.vue";
import ProductCategory from "@/components/client/ProductCategory.vue";
// import MyAccount from "@/components/client/MyAccount.vue"; // Make sure this file exists
// import OrderDetail from "@/components/client/OrderDetail.vue"; // Make sure this file exists
// import LoginGG from "@/components/client/LoginGG.vue"; // Google Login Page
// import XacNhanThongTinCustomer from "@/components/client/XacNhanThongTinCustomer.vue"; // Component for confirming customer info (path inconsistency, consider moving)
// import OrderLookup from "@/components/client/OrderLookup.vue";
// import DanhMucList from "@/components/client/Category.vue";
// import ProductCategory from "@/components/client/ProductCategory.vue";
import ThongTinUser from "@/components/client/ThongTinUser.vue"; // User Info Component
import gioHang from "@/components/client/GioHangPage.vue"; // User Info Component

// --- ADMIN COMPONENTS ---
import AdminLayout from "@/views/admin/AdminLayout.vue";
import Chat from "@/components/admin/Chat.vue";
import PhieuGiamGiaBH from "@/components/admin/PhieuGiamGiaBH.vue";
import ThongKeTongHop from "@/components/admin/ThongKeTongHop.vue"; // Admin Dashboard/Statistics
import ThongTinNhanVien from "@/components/admin/ThongTinNhanVien.vue";
import ThongKeBaoCao from "@/components/admin/ThongKeBaoCao.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // --- CLIENT ROUTES ---
    {
      path: "/coolmen", // Root path for client-facing pages
      component: ClientLayout, // Renders ClientLayout and its RouterView
      children: [
        {
          path: "", // Matches '/coolmen'
          name: "home",
          component: HomePage,
        },
        {
          path: "client-san-pham",
          name: "client-san-pham",
          component: ClientSanPham,
        },
        {
          path: "client-san-pham-detail/:id",
          name: "client-san-pham-detail",
          component: ClientSanPhamDetail,
        },
        {
          path: "/vnpay-return",
          name: "vnpay-return",
          component: VnpayReturn,
        },
        {
          path: "client-oder/:hoaDonId",
          name: "client-Oder",
          component: Oder,
          props: (route) => ({ hoaDonId: Number(route.params.hoaDonId) }),
        },
        {
          path: "danh-muc-List",
          name: "danh-muc-List",
          component: DanhMucList,
        },
        {
          path: "lien-he",
          name: "lien-he",
          component: LienHe,
        },
        {
          path: "/product-category/:idDanhMuc",
          name: "product-category",
          component: ProductCategory,
        },
        {
          path: "/gio-hang",
          name: "client-gio-hang",
          component: gioHang,
        },
        // {
        //   path: "tai-khoan",
        //   name: "client-my-account",
        //   component: MyAccount,
        //   meta: { requiresAuthClient: true }, // Add this meta field for client auth
        // },
        {
          path: "lich-su-dat-hang",
          name: "client-order-history",
          component: LichSuDatHang,
          meta: { requiresAuthClient: true }, // Add this meta field for client auth
        },
        {
          path: "order/:id",
          name: "OrderDetail",
          component: OrderDetail,
          //props: true, // Assuming OrderDetail uses props
          // meta: { requiresAuthClient: true }, // Order details usually require login
        },
        // Direct routes that don't need ClientLayout but are client-related
        {
          path: "/gg", // Google Login outside main client layout
          name: "gg",
          component: LoginGG,
        },
        {
          path: "/xntt", // Confirm Customer Info outside main client layout
          name: "xntt",
          component: XacNhanThongTinCustomer,
        },
        {
          path: "tra-cuu-don-hang", // Confirm Customer Info outside main client layout
          name: "TraCuuDonHang",
          component: OrderLookup,
        },
        {
          path: "thong-tin-user", // Confirm Customer Info outside main client layout
          name: "ThongTinUser",
          component: ThongTinUser,
        },
         {
          path: "lien-he",
          name: "lien-he",
          component: LienHe,
        },
      ],
    },
    {
      path: "/coolmen/dang-nhap-khach-hang",
      name: "dang-nhap-khach-hang", // This name is for client login
      component: DangNhapCustomer,
    },
    {
      path: "/coolmen/dang-ki-khach-hang",
      name: "dang-ki-khach-hang",
      component: DangKiCustomer,
    },

    // --- ADMIN AUTHENTICATION ROUTES (no layout) ---
    {
      path: "/dang-nhap", // Admin login page
      name: "dang-nhap",
      component: DangNhap,
    },
    {
      path: "/coolmen/quen-mat-khau", // Confirm Customer Info outside main client layout
      name: "QuenMatKhauClient",
      component: ForgotPassword,
    },
    {
      path: "/quen-mat-khau",
      name: "ForgotPassword",
      component: () => import("@/components/admin/QuenMatKhau.vue"),
    },

    // --- ADMIN LAYOUT ROUTES ---
    // All child routes will be displayed inside AdminLayout
    {
      path: "/", // This is the root path where AdminLayout will be used
      component: AdminLayout,
      children: [
        {
          path: "", // Default path when accessing '/' (after login)
          name: "admin-dashboard",
          component: ThongKeTongHop, // Admin Dashboard example
          meta: { requiresAuth: true }, // Requires admin authentication
        },
        // Your other admin routes (kept as is)
        {
          path: "/hoa-don",
          name: "hoadon",
          component: HoaDon,
          meta: { requiresAuth: true },
        },
        {
          path: "/hoa-don-chi-tiet/:maHoaDon",
          name: "hoadonchitiet",
          component: HoaDonChiTiet,
          props: true,
          meta: { requiresAuth: true },
        },
        {
          path: "/ban-hang",
          name: "banhang",
          component: BanHang,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/chat-lieu",
          name: "chat-lieu",
          component: ChatLieu,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/tay-ao",
          name: "tay-ao",
          component: TayAo,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/co-ao",
          name: "co-ao",
          component: CoAo,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/mau",
          name: "mau",
          component: Mau,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/kich-co",
          name: "kich-co",
          component: KichCo,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/kieu-ao",
          name: "kieu-ao",
          component: KieuAo,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham",
          name: "san-pham",
          component: SanPham,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/add",
          name: "them-san-pham",
          component: ThemSP,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/chi-tiet-san-pham/:id1",
          name: "chi-tiet-san-pham",
          component: ChiTietSanPham,
          props: true,
          meta: { requiresAuth: true },
        },
        {
          path: "/san-pham/danh-muc",
          name: "danh-muc",
          component: DanhMuc,
          meta: { requiresAuth: true },
        },
        {
          path: "/test",
          name: "test",
          component: Test1,
          meta: { requiresAuth: true },
        },
        {
          path: "/khach-hang",
          name: "khachhang",
          component: QuanLyKhachHang,
          meta: { requiresAuth: true },
        },
        {
          path: "/khach-hang/add",
          name: "AddKhachHang",
          component: KhachHangAddPage,
          meta: { requiresAuth: true },
        },
        {
          path: "/khach-hang/edit/:id",
          name: "EditKhachHang",
          component: KhachHangEditPage,
          props: true,
          meta: { requiresAuth: true },
        },
        {
          path: "/nhan-vien",
          name: "nhanvien",
          component: NhanVien,
          meta: { requiresAuth: true, requiresRole: "ADMIN" },
        },
        {
          path: "/nhan-vien/them",
          name: "themnhanvien",
          component: ThemNhanVien,
          meta: { requiresAuth: true, requiresRole: "ADMIN" },
        },
        {
          path: "/nhan-vien/sua/:id",
          name: "SuaNhanVien",
          component: ThemNhanVien, // Assuming ThemNhanVien is also used for editing
          props: true,
          meta: { requiresAuth: true, requiresRole: "ADMIN" },
        },
        {
          path: "/phieu-giam-gia",
          name: "phieugiamgia",
          component: PhieuGiamGia,
          meta: { requiresAuth: true },
        },
        {
          path: "/phieu-giam-gia/them",
          name: "ThemPhieuGiamGia",
          component: ThemPhieuGiamGia,
          meta: { requiresAuth: true },
        },
        {
          path: "/phieu-giam-gia/sua/:id",
          name: "SuaPhieuGiamGia",
          component: SuaPhieuGiamGia,
          props: true,
          meta: { requiresAuth: true },
        },
        {
          path: "/dot-giam-gia",
          name: "dotgiamgia",
          component: DotGiamGia,
          meta: { requiresAuth: true },
        },
        {
          path: "/dot-giam-gia/them",
          name: "themdotgiamgia",
          component: ThemDotGiamGia,
          meta: { requiresAuth: true },
        },
        {
          path: "/dot-giam-gia/sua/:id",
          name: "suadoigiamgia",
          component: SuaDotGiamGia,
          props: true,
          meta: { requiresAuth: true },
        },
        {
          path: "/thong-tin-ca-nhan",
          name: "ThongTinCaNhan",
          component: ThongTinNhanVien,
          meta: { requiresAuth: true },
        },
        {
          path: "/thong-ke",
          name: "thongke",
          component: ThongKeTongHop,
          meta: { requiresAuth: true },
        },
        {
          path: "/thong-ke/bao-cao",
          name: "thongke-bao-cao",
          component: ThongKeBaoCao,
          meta: { requiresAuth: true },
        },
        {
          path: "/phieu-giam-gia-ban-hang",
          name: "phieugiamgiabh",
          component: PhieuGiamGiaBH,
          meta: { requiresAuth: true },
        },
        {
          path: "/chat",
          name: "chat",
          component: Chat,
          meta: { requiresAuth: true }, // Assuming chat requires admin login
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

// --- Navigation Guard ---
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  // Lấy trạng thái đăng nhập của client
  const clientAuthToken = localStorage.getItem("clientAuthToken");
  const loggedInUser = localStorage.getItem("loggedInUser");

  // Trạng thái đã đăng nhập của khách hàng
  const isLoggedInClient = authStore.isLoggedInClient;

  // Lấy trạng thái đăng nhập của admin
  const adminToken = Cookies.get("token");
  const isLoggedInAdmin = !!adminToken;

  // --- Logic Điều hướng cho Admin ---
  // If trying to access admin pages and not logged in as admin
  if (
    to.meta.requiresAuth &&
    !to.path.startsWith("/coolmen") &&
    !isLoggedInAdmin
  ) {
    if (to.path !== "/dang-nhap") {
      console.log("Admin: Not authenticated, redirecting to admin login.");
      return next("/dang-nhap");
    }
  }

  // If already logged in as admin and trying to access admin login page
  if (isLoggedInAdmin && to.path === "/dang-nhap") {
    console.log("Admin: Already logged in, redirecting to admin dashboard.");
    return next("/");
  }

  // Admin role check
  if (isLoggedInAdmin) {
    try {
      const payload = JSON.parse(atob(adminToken.split(".")[1]));
      const vaiTro = payload.scope || payload.vaiTro || "";

      // If STAFF tries to access /nhan-vien (employee management)
      if (vaiTro === "STAFF" && to.path.startsWith("/nhan-vien")) {
        console.log(
          "Admin: Staff role cannot access employee management, redirecting to products."
        );
        return next("/san-pham");
      }
    } catch (err) {
      console.error("Admin: Invalid token:", err);
      Cookies.remove("token"); // Remove invalid token
      console.log("Admin: Invalid token, redirecting to admin login.");
      return next("/dang-nhap");
    }
  }

  // --- Client Authentication Logic ---
  // If client requires authentication (meta.requiresAuthClient is true) and not logged in as client
  if (to.meta.requiresAuthClient && !isLoggedInClient) {
    console.log("Client: Not authenticated, redirecting to client login.");
    return next("/coolmen/dang-nhap-khach-hang");
  }

  // If client is already logged in and trying to access client login/register pages
  if (
    isLoggedInClient &&
    (to.path === "/coolmen/dang-nhap-khach-hang" ||
      to.path === "/coolmen/dang-ki-khach-hang")
  ) {
    console.log("Client đã đăng nhập, chuyển hướng về trang chủ.");
    return next("/coolmen");
  }

  // Nếu người dùng cố gắng truy cập một trang được bảo vệ mà chưa đăng nhập
  if (to.meta.requiresAuthClient && !isLoggedInClient) {
    console.log("Client: Not authenticated, redirecting to login.");
    return next("/coolmen/dang-nhap-khach-hang");
  }

  // Continue to the next route if no redirects are triggered
  next();
});

export default router;
