<script setup>
import { ref, watch, computed, onMounted } from "vue";
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

import Cookies from "js-cookie";

import { useToast } from "vue-toastification";
const toast = useToast();

const token = Cookies.get("token");
// Tách phần payload (phần giữa)
const payloadBase64 = token.split('.')[1];

// Giải mã từ Base64 sang JSON
const payloadJson = atob(payloadBase64);

// Chuyển chuỗi JSON thành object
const payload = JSON.parse(payloadJson);

// Truy cập idNv
const idNv = payload.idNv;

console.log("idNv:", idNv);

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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        idNhanVien: idNv,
      }),

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
        tenKhachHang: "Khách lẻ",
        tenNguoiNhan: "",
        diaChi: "",
        sdt: "",
      },
      giamGia: null,
      hinhThucNhanHang: "0",

      thanhToan: [],
      soTienGiam: 0,
      tongTien: 0,
      startTime: Date.now(), // ⏱ Thời gian tạo đơn
      warningShown: false,
      thoiGianConLai: 300,
    };

    orders.value.push(newOrder);
    activeTab.value = newOrder.id;
  } catch (error) {
    console.error("Lỗi tạo hóa đơn:", error);
  }
}

// xóa hóa đơn nếu ko hoàn thành trong 5p

function showToast(message) {
  alert(message); // hoặc dùng thư viện toast như vue-toastification nếu có
}

setInterval(() => {
  const now = Date.now();
  orders.value.forEach((order) => {
    if (!order.startTime) return;

    const elapsed = Math.floor((now - order.startTime) / 1000);
    const remaining = 300 - elapsed;

    // ⏱ Cập nhật đếm ngược cho hiển thị
    // order.thoiGianConLai = Math.max(0, remaining);

    // ⚠️ Hiển thị cảnh báo khi còn 1 phút
    if (remaining <= 60 && remaining > 0 && !order.warningShown) {
      toast.error(
        `⚠️ Đơn hàng [${order.id}] sẽ bị xoá sau ${remaining} giâ y nếu không hoàn tất.`
      );
      order.warningShown = true;
    }

    // ❌ Hết hạn đơn hàng sau 2 phút
    if (remaining <= 0) {
      console.log(`🗑 Đơn hàng [${order.id}] đã hết hạn, đang xoá...`);
      closeOrderTuDong(order.id);
    }
  });
}, 1000);

const remainingTime = (order) => {
  if (!order.startTime) return 120;
  const elapsed = Math.floor((Date.now() - order.startTime) / 1000);
  return Math.max(0, 120 - elapsed);
};

const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

//------------------------------------

// đóng đơn hàng:
async function closeOrder(id) {
  const order = orders.value.find((o) => o.id === id);
  if (!order) return;

  // Xác nhận từ người dùng
  const confirmed = window.confirm(
    `Bạn có chắc chắn muốn xoá hóa đơn [${order.maHoaDon}] không?`
  );
  if (!confirmed) return;

  try {
    // Hoàn lại số lượng phiếu giảm giá trước nếu có
    if (order.giamGia && order.giamGia.id) {
      await axios.put(`http://localhost:8080/ban_hang/phieuGG/increase/${order.giamGia.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Hoàn lại số lượng phiếu giảm giá ID: ${order.giamGia.id}`);
    }

    // Xóa hóa đơn
    await axios.delete(`http://localhost:8080/hoa-don/xoa/${order.maHoaDon}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log("✅ Đã xoá hóa đơn:", order.maHoaDon);
    localStorage.removeItem(`order_${id}`);
  } catch (err) {
    console.error("❌ Lỗi xoá hóa đơn:", err);
    alert("Xóa hóa đơn thất bại! Vui lòng thử lại.");
  }
  // ✅ Xoá khỏi localStorage
}

// đóng đơn hàng tự động:
async function closeOrderTuDong(id) {
  const order = orders.value.find((o) => o.id === id);
  if (!order) return;

  try {
    await axios.delete(`http://localhost:8080/hoa-don/xoa/${order.maHoaDon}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    console.log("✅ Đã xoá hóa đơn:", order.maHoaDon);
  } catch (err) {
    console.error("❌ Lỗi xoá hóa đơn:", err);
    return;
  }

  // ✅ Xoá khỏi danh sách orders và activeTab
  orders.value = orders.value.filter((o) => o.id !== id);
  if (activeTab.value === id) {
    activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
  }

  // ✅ Xoá khỏi localStorage
  localStorage.removeItem(`order_${id}`);
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

// tính phí vận chuyển: 
watch(
  () => orders.value.find(o => o.id === activeTab.value),
  (currentOrder) => {
    // Nếu không có đơn hàng nào đang active, hoặc đơn hàng không có, thì không làm gì
    if (!currentOrder) return;
    
    // Xóa bộ đếm debounce cũ để bắt đầu một yêu cầu mới
    // clearTimeout(shippingFeeDebounceTimer);

    // Nếu hình thức là "Tại quầy", reset phí ship về 0 và dừng lại
    if (currentOrder.hinhThucNhanHang !== '1') {
      currentOrder.phiVanChuyen = 0;
      return;
    }

    // Nếu là "Giao hàng" nhưng chưa có địa chỉ, cũng reset phí ship và dừng
    if (!currentOrder.khachHang.diaChi) {
      currentOrder.phiVanChuyen = 0;
      return;
    }

    // Sử dụng debounce để chờ 1 giây sau khi người dùng ngừng nhập địa chỉ
    // hoặc thay đổi sản phẩm rồi mới gọi API. Tránh gọi liên tục.
    shippingFeeDebounceTimer = setTimeout(() => {
      console.log("Địa chỉ hoặc sản phẩm đã thay đổi, bắt đầu tính lại phí ship...");
      calculateAndUpdateShippingFee(currentOrder);
    }, 1000); // Chờ 1 giây
  },
  { deep: true } // deep: true để theo dõi cả các thay đổi sâu bên trong object (địa chỉ, sản phẩm)
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
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bodyUpdateSoLuong),
    });

    // ✅ Gọi API lưu chi tiết hóa đơn
    await fetch("http://localhost:8080/hoa-don-chi-tiet/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    // ✅ Giảm số lượng phiếu giảm giá nếu có
    if (order.giamGia && order.giamGia.id) {
      await axios.put(`http://localhost:8080/ban_hang/phieuGG/decrease/${order.giamGia.id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(`Giảm số lượng phiếu giảm giá ID: ${order.giamGia.id}`);
    }

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

function xoaToanBoLocal() {
  const confirmed = window.confirm(
    "Bạn có chắc chắn muốn xóa tất cả đơn hàng?"
  );
  if (!confirmed) return;

  localStorage.removeItem("orders");
  localStorage.removeItem("activeTab");

  orders.value = [];
  activeTab.value = null;
}



// tính phí giao hàng: 

const tokenGHN = "8e2a56e5-6a41-11f0-8120-026f4833faa3";

// Hàm chuẩn hóa tiếng Việt
function normalizeVN(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Hàm lấy district_id và ward_code từ địa chỉ

// =================== HÀM MỚI ĐỂ "DỌN DẸP" ĐỊA CHỈ ===================
/**
 * Loại bỏ các tiền tố như "Tỉnh", "Thành phố", "Quận", "Phường"... khỏi chuỗi.
 * @param {string} str - Chuỗi địa chỉ cần làm sạch.
 * @returns {string} - Chuỗi đã được làm sạch.
 */
function cleanAddressPart(str) {
  if (!str) return "";
  let cleanedStr = normalizeVN(str); // Chuẩn hóa (vd: "Thành Phố" -> "thanh pho")
  const prefixes = ['thanh pho', 'tinh', 'quan', 'huyen', 'phuong', 'xa', 'thi tran'];
  
  for (const prefix of prefixes) {
    if (cleanedStr.startsWith(prefix + ' ')) {
      cleanedStr = cleanedStr.substring(prefix.length + 1);
    }
  }
  return cleanedStr.trim();
}


// =================== HÀM getDistrictAndWard ĐÃ ĐƯỢC NÂNG CẤP ===================
async function getDistrictAndWard(address) {
  console.log(`Bắt đầu phân tích địa chỉ: "${address}"`);
  const addressParts = address.split(",").map(part => part.trim());

  if (addressParts.length < 4) {
    console.error("Lỗi phân tích địa chỉ: Chuỗi địa chỉ không đủ 4 phần (Đường, Phường/Xã, Quận/Huyện, Tỉnh/Thành).");
    return null;
  }

  const [street, wardName, districtName, provinceName] = addressParts;
  
  // Dọn dẹp trước các phần của địa chỉ người dùng nhập vào
  const cleanInputProvince = cleanAddressPart(provinceName);
  const cleanInputDistrict = cleanAddressPart(districtName);
  const cleanInputWard = cleanAddressPart(wardName);

  try {
    // 1. Tìm Tỉnh/Thành phố
    const provincesRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/province", {
      headers: { Token: tokenGHN },
    });
    const provinces = (await provincesRes.json()).data;
    const province = provinces.find(p => 
      cleanAddressPart(p.ProvinceName) === cleanInputProvince
    );
    if (!province) {
      console.error("Không tìm thấy Tỉnh/Thành phố:", provinceName);
      return null;
    }
    console.log("Tìm thấy Province:", province);

    // 2. Tìm Quận/Huyện
    const districtsRes = await fetch("https://online-gateway.ghn.vn/shiip/public-api/master-data/district", {
      method: "POST",
      headers: { Token: tokenGHN, "Content-Type": "application/json" },
      body: JSON.stringify({ province_id: province.ProvinceID })
    });
    const districts = (await districtsRes.json()).data;
    const district = districts.find(d => 
      cleanAddressPart(d.DistrictName) === cleanInputDistrict
    );
    if (!district) {
      console.error("Không tìm thấy Quận/Huyện:", districtName, "trong tỉnh", provinceName);
      return null;
    }
    console.log("Tìm thấy District:", district);

    // 3. Tìm Phường/Xã
    const wardsRes = await fetch(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${district.DistrictID}`, {
      headers: { Token: tokenGHN },
    });
    const wards = (await wardsRes.json()).data;
    const ward = wards.find(w => 
      cleanAddressPart(w.WardName) === cleanInputWard
    );
    if (!ward) {
      console.error("Không tìm thấy Phường/Xã:", wardName, "trong quận", districtName);
      return null;
    }
    console.log("Tìm thấy Ward:", ward);

    return {
      district_id: district.DistrictID,
      ward_code: ward.WardCode,
    };
  } catch (err) {
    console.error("Lỗi nghiêm trọng khi gọi API GHN:", err.message);
    return null;
  }
}

// Hàm tính phí vận chuyển

const myShopInfo = {
  district_id: 1442, // Mã của Quận Cầu Giấy, Hà Nội
  shop_id: "5913364"   // ShopId của bạn
};

async function tinhPhiVanChuyen({ fromDistrictId, toDistrictId, toWardCode, weight, insuranceValue }) {
  try {
    const response = await fetch("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Token: tokenGHN,
        ShopId: myShopInfo.shop_id, // ShopId vẫn có thể lấy từ cấu hình chung
      },
      body: JSON.stringify({
        // SỬA Ở ĐÂY: Dùng tham số được truyền vào
        from_district_id: fromDistrictId, 
        service_type_id: 2,
        to_district_id: toDistrictId,
        to_ward_code: toWardCode,
        weight,
        insurance_value: insuranceValue,
      }),
    });

    const result = await response.json();
    if (result.code !== 200) throw new Error(result.message);
    return result.data.total;
  } catch (err) {
    console.error("Lỗi tính phí vận chuyển:", err.message);
    return null;
  }
}

// Sửa lại hàm này để truyền đúng tham số
async function calculateAndUpdateShippingFee(order) {
  if (!order.khachHang.diaChi || order.listSanPham.length === 0) {
    order.phiVanChuyen = 0;
    return;
  }
  try {
    console.log("Đang tính phí vận chuyển cho đơn hàng...");
    const locationData = await getDistrictAndWard(order.khachHang.diaChi);
    if (locationData) {
      const totalWeight = order.listSanPham.reduce((acc, item) => acc + (item.khoiLuong || 400), 0);
      const insuranceValue = order.tongTienSanPham;

      const shippingFee = await tinhPhiVanChuyen({
        // SỬA Ở ĐÂY: Truyền mã quận của cửa hàng vào
        fromDistrictId: myShopInfo.district_id, 
        toDistrictId: locationData.district_id,
        toWardCode: locationData.ward_code,
        weight: totalWeight,
        insuranceValue: insuranceValue,
      });

      if (shippingFee !== null) {
        order.phiVanChuyen = shippingFee;
        console.log(`Phí vận chuyển đơn hàng được cập nhật: ${shippingFee.toLocaleString()}đ`);
      } else {
        order.phiVanChuyen = 0;
      }
    } else {
      order.phiVanChuyen = 0;
    }
  } catch (error) {
    console.error("Lỗi trong quá trình tính phí vận chuyển:", error);
    order.phiVanChuyen = 0;
    // toast.error("Đã xảy ra lỗi khi tính phí vận chuyển.");
  }
}



</script>

<template>
  <div class="bg-white p-3 rounded mb-4 d-flex align-items-center justify-content-between border" style="height: 60px">
    <h5 class="fw-bold mb-0">Bán hàng tại quầy</h5>
    <button class="btn success" style="background-color: #0a2c57; color: white" @click="createNewOrder">
      <Plus class="me-1" size="16" /> Tạo đơn mới
    </button>
    <button class="btn btn-danger" @click="xoaToanBoLocal" v-if="false">
      <Trash class="me-1" size="16" /> Xóa tất cả đơn hàng
    </button>
  </div>

  <ul class="nav nav-tabs">
    <li class="nav-item" v-for="order in orders" :key="order.id">
      <a class="nav-link" :class="{ active: order.id === activeTab }" href="#" @click.prevent="activeTab = order.id">
        {{ order.maHoaDon }}
        <!-- 🔽 Nếu có sản phẩm thì hiển thị số lượng -->
        <span v-if="order.listSanPham.length > 0" class="badge bg-danger ms-1">
          {{ order.listSanPham.length }}
        </span>
        <span class="ms-1 text-danger" @click.stop="closeOrder(order.id)"
          >×</span
        >
      </a>
    </li>
  </ul>

  <div v-if="orders.length === 0" class="text-center mt-5">
    <img src="https://web.nvnstatic.net/tp/T0213/img/tmp/cart-empty.png?v=9" alt="No orders" width="170" />
    <p class="mt-2">Không có bất kỳ đơn hàng nào !!!</p>
  </div>

  <div v-if="activeTab !== null" class="bg-white p-3 rounded mb-4 align-items-center border">
    <div v-for="order in orders" :key="order.id" v-show="order.id === activeTab">
      <h6>Chi tiết hóa đơn {{ order.maHoaDon }}</h6>
      

      <!-- Giỏ hàng -->
      <GioHang :order="order" :activeTab="activeTab" :orders="orders" />

      <!-- Khách hàng -->
      <KhachHang :order="order" @capNhatThongTinKhachHang="capNhatThongTinKhachHang" />

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
        <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
            width: 36px;
            height: 36px;
            background-color: #0a2c57;
            color: white;
          " title="Chuyển khoản" @click="showThanhToan = true">
          <CreditCard size="18" />
        </button>
        <ThanhToan
          v-if="showThanhToan"
          :tongTien="order.tongTien"
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
        <button class="btn" style="
            background-color: #0a2c57;
            color: white;
            min-width: 200px;
            font-weight: bold;
          " @click="hoanThanhDonHang(order)">
          Hoàn thành đơn hàng
        </button>
      </div>
    </div>
  </div>
</template>
