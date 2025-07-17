<script setup>
import { ref, watch, computed } from "vue";
import axios from "axios";
import {
  Plus,
  UserCog,
  Tag,
  Ban,
  TicketPercent,
  CreditCard,
  Trash,
} from "lucide-vue-next";
import GioHang from "./GioHang.vue";
import KhachHang from "./KhachHang.vue";
import GiamGia from "./GiamGia.vue";
import ThanhToan from "./ThanhToan.vue";


// Khởi tạo danh sách đơn hàng từ localStorage nếu có
const orders = ref([]);

const storedOrders = localStorage.getItem("orders");
if (storedOrders) {
  try {
    orders.value = JSON.parse(storedOrders);
  } catch (e) {
    console.error("Lỗi parse orders:", e);
  }
}

const activeTab = ref(null);
const storedActiveTab = localStorage.getItem("activeTab");
if (storedActiveTab) {
  activeTab.value = JSON.parse(storedActiveTab);
}

let nextOrderId =
  orders.value.length > 0 ? Math.max(...orders.value.map((o) => o.id)) + 1 : 1;

async function createNewOrder() {
  try {
    const response = await fetch("http://localhost:8080/hoa-don/tao-moi", {
      method: "POST",
    });
    const maHoaDon = await response.text();

    const newOrder = {
      id: nextOrderId++,
      name: `Đơn ${nextOrderId - 1}`,
      listSanPham: [],

      tongTienSanPham: 0,
      phiVanChuyen: 0,

      maHoaDon: maHoaDon,
      khachHang: {
        idKhachHang: "",
        tenKhachHang: "",
        tenNguoiNhan: "",
        diaChi: "",
        sdt: "",
      },
      giamGia: null,
      hinhThucNhanHang: "",

      thanhToan: [],
      soTienGiam: 0,
      tongTien: 0,

    };

    orders.value.push(newOrder);
    activeTab.value = newOrder.id;
  } catch (error) {
    console.error("Lỗi tạo hóa đơn:", error);
  }
}


async function closeOrder(id) {
  const order = orders.value.find((o) => o.id === id);
  if (!order) return;

  // ✅ Xác nhận từ người dùng
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xoá hóa đơn [${order.maHoaDon}] không?`
  );
  if (!confirmed) return;

  try {
    await axios.delete(`http://localhost:8080/hoa-don/xoa/${order.maHoaDon}`);
    console.log("✅ Đã xoá hóa đơn:", order.maHoaDon);
  } catch (err) {
    console.error("❌ Lỗi xoá hóa đơn:", err);
    alert("Xóa hóa đơn thất bại!");
    return;
  }

  // ✅ Xoá tab sau khi xoá thành công

  orders.value = orders.value.filter((o) => o.id !== id);
  if (activeTab.value === id) {
    activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
  }
}


// thanh toan:
const showThanhToan = ref(false);

const handleXacNhan = (data) => {
  const currentOrder = orders.value.find((o) => o.id === activeTab.value);
  if (currentOrder) {
    currentOrder.thanhToan = data; // data là danh sách phương thức và số tiền thanh toán
    localStorage.setItem("orders", JSON.stringify(orders.value)); // đảm bảo lưu lại
  }
  showThanhToan.value = false;
};

// khách hàng:
function capNhatThongTinKhachHang(thongTin) {
  const currentOrder = orders.value.find((o) => o.id === activeTab.value);
  if (currentOrder) {
    currentOrder.khachHang = { ...currentOrder.khachHang, ...thongTin };
    currentOrder.hinhThucNhanHang = thongTin.hinhThucNhanHang;

    // Lưu lại sau khi cập nhật
    localStorage.setItem("orders", JSON.stringify(orders.value));
  }
}
// import { toRaw } from "vue";
// console.log(JSON.stringify(toRaw(orders.value)));
watch(
  orders,
  (newVal) => {
    console.log("Cập nhật orders:", newVal);
    localStorage.setItem("orders", JSON.stringify(newVal));
  },
  { deep: true }
);

// tính tổng tiền:
const tinhTongTien = (order) => {
  // 1. Tính tổng tiền sản phẩm
  const tongTienSanPham = order.listSanPham.reduce((total, sp) => {
    return total + sp.gia * sp.soLuong;
  }, 0);

  // 2. Tính giảm giá nếu có
  let soTienGiam = 0;
  if (order.giamGia) {
    const dieuKien = order.giamGia.giamToiThieu || 0;
    const phanTram = order.giamGia.phamTramGiamGia || 0;
    const giamToiDa = order.giamGia.giamToiDa || Infinity;

    if (tongTienSanPham >= dieuKien) {
      const tienGiam = tongTienSanPham * (phanTram / 100);
      soTienGiam = Math.min(tienGiam, giamToiDa);
    }
  }

  const phiVanChuyen = order.phiVanChuyen || 0;
  const tongTien = tongTienSanPham + phiVanChuyen - soTienGiam;

  // Ghi ngược lại vào order để lưu
  order.tongTienSanPham = tongTienSanPham;
  order.soTienGiam = soTienGiam;
  order.tongTien = tongTien;

  return {
    tongTienSanPham,
    phiVanChuyen,
    soTienGiam,
    tongTien,
  };
};

watch(
  orders,
  (newVal) => {
    localStorage.setItem("orders", JSON.stringify(newVal));
  },
  { deep: true }
);

watch(activeTab, (newVal) => {
  localStorage.setItem("activeTab", JSON.stringify(newVal));
});
watch(
  orders,
  (newOrders) => {
    newOrders.forEach((order) => {
      tinhTongTien(order);
    });
    localStorage.setItem("orders", JSON.stringify(newOrders));
  },
  { deep: true }
);
// ham thanh toan:
const thanhToanDonHang = async (order) => {
  const danhSachThanhToan = [];

  if (Array.isArray(order.thanhToan?.thanhToan)) {
    order.thanhToan.thanhToan.forEach((pt) => {
      danhSachThanhToan.push({
        maHinhThuc: pt.maGiaoDich || "",
        phuongThucThanhToan: pt.tenPhuongThuc,
        soTien: pt.soTien,
        moTa: "",
        ghiChu: "",
        trangThaiThanhToan: 1,
      });
    });
  } else {
    danhSachThanhToan.push({
      maHinhThuc: order.thanhToan?.maGiaoDich || "",
      phuongThucThanhToan: order.thanhToan?.hinhThuc,
      soTien: order.thanhToan?.soTienKhachTra,
      moTa: "",
      ghiChu: "",
      trangThaiThanhToan: 1,
    });
  }

  const payload = {
    hoaDonId: order.maHoaDon,
    danhSachThanhToan,
  };
  console.log("Gửi thanh toán với payload:", payload);
  try {
    const res = await axios.post("http://localhost:8080/thanh-toan", payload);
    console.log("✅ Thanh toán thành công:", res.data);
  } catch (err) {
    console.error("❌ Lỗi khi thanh toán:", err);
  }
};

// hoàn thành đơn hàng:
const hoanThanhDonHang = async (order) => {
  try {
    const maHoaDon = order.maHoaDon;
    const selectedItems = order.listSanPham;
    const giamGiaHoaDon = order.soTienGiam || 0;

    // 1. Chuẩn bị dữ liệu sản phẩm chi tiết
    const result = selectedItems.map((sp) => {
      const soLuongMua = sp.soLuong || 1;
      const giaGoc = sp.gia || 0;
      const thanhTien = giaGoc * soLuongMua;

      return {
        idSanPhamChiTiet: sp.maChiTietSapPham,
        gia: giaGoc,
        soLuong: soLuongMua,
        thanhTien: thanhTien,
        idHoaDon: maHoaDon,
        trangThai: 0,
      };
    });

    // 2. Chuẩn bị body cập nhật tồn kho
    const bodyUpdateSoLuong = result.map((r) => ({
      idSanPhamChiTiet: r.idSanPhamChiTiet,
      soLuongMua: r.soLuong,
    }));

    // ✅ Gọi API cập nhật tồn kho
    await fetch("http://localhost:8080/chi-tiet-san-pham/update-so-luong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyUpdateSoLuong),
    });

    // ✅ Gọi API lưu chi tiết hóa đơn
    await fetch("http://localhost:8080/hoa-don-chi-tiet/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(result),
    });
    // goi ham thanh toan don hang:
    await thanhToanDonHang(order);

    // ✅ Gọi API hoàn tất hóa đơn
    const payload = {
      maHoaDon: maHoaDon,
      idKhachHang: order.khachHang?.idKhachHang || null,
      tenKhachHang: order.khachHang?.tenKhachHang || "Khách lẻ",
      tenNguoiNhan: order.khachHang?.tenNguoiNhan || "",
      diaChi: order.khachHang?.diaChi || "",
      sdt: order.khachHang?.sdt || "",
      tongTienSanPham: order.tongTienSanPham,
      phiVanChuyen: order.phiVanChuyen || 0,
      tongTien: order.tongTien,
      giamGia: giamGiaHoaDon,
      loaiDon: 0,
      hinhThucNhanHang: order.hinhThucNhanHang,
      // thanhToan: order.thanhToan.map((pt) => ({
      //   phuongThuc: pt.tenPhuongThuc,
      //   soTien: pt.soTien,
      // })),
    };

    await axios.post("http://localhost:8080/ban_hang/hoan-thanh", payload);

    alert("✅ Đơn hàng đã hoàn tất thành công!");

    // ✅ Xóa đơn hàng sau khi hoàn thành
    orders.value = orders.value.filter((o) => o.id !== order.id);
    if (activeTab.value === order.id) {
      activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
    }
  } catch (err) {
    console.error("❌ Lỗi hoàn thành đơn hàng:", err);
    alert("Không thể hoàn tất đơn hàng. Vui lòng thử lại.");
  }
};
</script>

<template>
  <div
    class="bg-white p-3 rounded mb-4 d-flex align-items-center justify-content-between border"
    style="height: 60px"
  >
    <h5 class="fw-bold mb-0">Bán hàng tại quầy</h5>
    <button
      class="btn success"
      style="background-color: #0a2c57; color: white"
      @click="createNewOrder"
    >
      <Plus class="me-1" size="16" /> Tạo đơn mới
    </button>
  </div>

  <ul class="nav nav-tabs">
    <li class="nav-item" v-for="order in orders" :key="order.id">
      <a
        class="nav-link"
        :class="{ active: order.id === activeTab }"
        href="#"
        @click.prevent="activeTab = order.id"
      >
        {{ order.maHoaDon }}
        <span class="ms-1 text-danger" @click.stop="closeOrder(order.id)"
          >×</span
        >
      </a>
    </li>
  </ul>

  <div v-if="orders.length === 0" class="text-center mt-5">
    <img
      src="https://web.nvnstatic.net/tp/T0213/img/tmp/cart-empty.png?v=9"
      alt="No orders"
      width="170"
    />
    <p class="mt-2">Không có bất kỳ đơn hàng nào !!!</p>
  </div>

  <div
    v-if="activeTab !== null"
    class="bg-white p-3 rounded mb-4 align-items-center border"
  >
    <div
      v-for="order in orders"
      :key="order.id"
      v-show="order.id === activeTab"
    >
      <h6>Chi tiết hóa đơn {{ order.maHoaDon }}</h6>

      <!-- Giỏ hàng -->
      <GioHang :order="order" :activeTab="activeTab" :orders="orders" />

      <!-- Khách hàng -->
      <KhachHang
        :order="order"
        @capNhatThongTinKhachHang="capNhatThongTinKhachHang"
      />

      <!-- Phiếu giảm giá -->
      <GiamGia :order="order" :activeTab="activeTab" :orders="orders" />
      <!-- Tổng kết đơn hàng -->
      <div class="mb-2">
        <strong>Tiền sản phẩm:</strong>
        {{ (order.tongTienSanPham || 0).toLocaleString() }}đ
      </div>

      <div class="mb-2">
        <strong>Phí vận chuyển:</strong>
        {{ (order.phiVanChuyen || 0).toLocaleString() }}đ
      </div>

      <div class="mb-2">
        <strong>Giảm giá:</strong>
        {{ (order.soTienGiam || 0).toLocaleString() }}đ
      </div>

      <!-- Phương thức thanh toán -->
      <div class="d-flex align-items-center gap-3 mb-3">
        <label class="fw-bold mb-0">Phương thức thanh toán:</label>
        <button
          class="btn border rounded-circle d-flex align-items-center justify-content-center"
          style="
            width: 36px;
            height: 36px;
            background-color: #0a2c57;
            color: white;
          "
          title="Chuyển khoản"
          @click="showThanhToan = true"
        >
          <CreditCard size="18" />
        </button>
        <ThanhToan
          v-if="showThanhToan"
          :tongTien="561001"
          @close="showThanhToan = false"
          @xac-nhan="handleXacNhan"
        />
        <span>{{
          Array.isArray(order.thanhToan)
            ? order.thanhToan.map((pt) => pt.tenPhuongThuc).join(" + ")
            : order.thanhToan?.hinhThuc === "tien_mat"
            ? "Tiền mặt"
            : order.thanhToan?.hinhThuc === "chuyen_khoan"
            ? "Chuyển khoản"
            : "Thanh toán + Chuyển khoản"
        }}</span>
      </div>

      <!-- tổng tiền -->

      <div class="mb-2">
        <h4><strong>Tổng tiền:</strong></h4>
        <h1>
          <strong>{{ (order.tongTien || 0).toLocaleString() }}đ</strong>
        </h1>
      </div>

      <!-- Nút hoàn tất -->
      <div class="text-end">
        <button
          class="btn"
          style="
            background-color: #0a2c57;
            color: white;
            min-width: 200px;
            font-weight: bold;
          "
          @click="hoanThanhDonHang(order)"
        >
          Hoàn thành đơn hàng
        </button>
      </div>

    </div>
  </div>
</template>