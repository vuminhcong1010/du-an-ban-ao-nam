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
  Truck,
} from "lucide-vue-next";
import ThemSanPham from "./ThemSanPhamHoaDon.vue";
import ThemKhachHangHoaDon from "./ThemKhachHangHoaDon.vue";
import ChonDiaChiPopup from "./ChonDiaChiKhachHangHoaDon.vue"; // Import component popup chọn địa chỉ

// Khởi tạo danh sách đơn hàng từ localStorage nếu có
const orders = ref([]); // GIỮ NGUYÊN TÊN 'orders' theo yêu cầu

const storedOrders = localStorage.getItem("orders");
if (storedOrders) {
  try {
    const parsedOrders = JSON.parse(storedOrders);
    orders.value = parsedOrders.map(order => ({
      ...order,
      phuongThucVanChuyen: order.phuongThucVanChuyen || 'direct', // Đã đổi sang tiếng Việt
      thongTinGiaoHang: order.thongTinGiaoHang || { // Đã đổi sang tiếng Việt
        tenNguoiNhan: '',
        soDienThoaiNguoiNhan: '',
        diaChiGiaoHangTongHop: '', // Địa chỉ tổng hợp, đã đổi tên
        tinhThanhPho: '',
        quanHuyen: '',
        xaPhuong: '',
        diaChiChiTiet: '',
        laMacDinh: false, // Đã đổi tên
      },
      listSanPham: order.listSanPham || [], // Giữ nguyên tên listSanPham
    }));
  } catch (e) {
    console.error("Lỗi parse orders từ localStorage:", e);
    orders.value = [];
  }
}

// Active tab hiện tại (đơn hàng đang thao tác) - Giữ nguyên tên tiếng Anh
const activeTab = ref(null);
const storedActiveTab = localStorage.getItem("activeTab");
if (storedActiveTab) {
  try {
    activeTab.value = JSON.parse(storedActiveTab);
  } catch (e) {
    console.error("Lỗi parse activeTab:", e);
    activeTab.value = null;
  }
}

// ID đơn tiếp theo - Giữ nguyên tên tiếng Anh
let nextOrderId =
  orders.value.length > 0
    ? Math.max(...orders.value.map((o) => o.id)) + 1
    : 1;

// Tạo đơn mới - Giữ nguyên tên tiếng Anh
function createNewOrder() {
  const newOrder = {
    id: nextOrderId++,
    name: `Đơn ${nextOrderId - 1}`,
    listSanPham: [], // Giữ nguyên tên listSanPham
    khachHang: null, // GIỮ NGUYÊN TÊN TIẾNG VIỆT 'khachHang'
    giamGia: null, // Giữ nguyên tên giamGia
    // Thêm các thuộc tính liên quan đến giao hàng với tên tiếng Việt
    phuongThucVanChuyen: 'direct', // Đã đổi sang tiếng Việt
    thongTinGiaoHang: { // Đã đổi sang tiếng Việt
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHangTongHop: '', // Địa chỉ tổng hợp
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    },
  };
  orders.value.push(newOrder);
  activeTab.value = newOrder.id;
}

// Đóng đơn hàng - Giữ nguyên tên tiếng Anh
function closeOrder(id) {
  orders.value = orders.value.filter((o) => o.id !== id);
  if (activeTab.value === id) {
    activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
  }
}

// Hàm xóa sản phẩm khỏi giỏ hàng - Giữ nguyên tên tiếng Anh
const removeItem = (order, index) => {
  order.listSanPham.splice(index, 1);
};


// --- Phần Sản phẩm --- (Giữ nguyên)
const hienThiThemSanPham = ref(false);

const moPopupThemSanPham = () => {
  hienThiThemSanPham.value = true;
};

const nhanSanPhamDaChon = (danhSachSanPham) => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    danhSachSanPham.forEach(newItem => {
      const existingItem = activeOrder.listSanPham.find(
        item => item.idSanPhamChiTiet === newItem.idSanPhamChiTiet
      );
      if (existingItem) {
        existingItem.soLuong += newItem.soLuong;
      } else {
        activeOrder.listSanPham.push({ ...newItem });
      }
    });
  }
  hienThiThemSanPham.value = false;
};




// --- Phần Khách hàng và Giao hàng (CHỈNH SỬA) ---
const hienThiThemKhachHangPopup = ref(false); // Biến điều khiển popup khách hàng
const hienThiChonDiaChiPopup = ref(false); // Biến điều khiển popup chọn địa chỉ

// Computed property để lấy ĐƠN HÀNG đang active (để dễ truy cập các thuộc tính của đơn hàng trong script)
// Đổi tên biến này để rõ ràng hơn và tránh nhầm lẫn với việc truy cập trực tiếp trong template
const donHangDangChon = computed(() => {
  return orders.value.find((o) => o.id === activeTab.value);
});

// Computed property để lấy phương thức vận chuyển của đơn hàng đang active
const phuongThucVanChuyenDangChon = computed({
  get() {
    return donHangDangChon.value ? donHangDangChon.value.phuongThucVanChuyen : 'direct';
  },
  set(newValue) {
    if (donHangDangChon.value) {
      donHangDangChon.value.phuongThucVanChuyen = newValue;
      xuLyThayDoiPhuongThucVanChuyen(newValue);
    }
  }
});

// Computed property để lấy/set thông tin giao hàng của đơn hàng đang active
const thongTinGiaoHangDangChon = computed({
  get() {
    return donHangDangChon.value ? donHangDangChon.value.thongTinGiaoHang : {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHangTongHop: '',
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    };
  },
  set(newValue) {
    if (donHangDangChon.value) {
      donHangDangChon.value.thongTinGiaoHang = newValue;
    }
  }
});

// Hàm điền địa chỉ mặc định từ API
const dienDiaChiMacDinh = async () => {
  const khachHangCuaDonHang = donHangDangChon.value ? donHangDangChon.value.khachHang : null;
  if (!khachHangCuaDonHang || !khachHangCuaDonHang.id) { // Kiểm tra có khách hàng và ID không
    // Nếu không có khách hàng, reset thongTinGiaoHang
    thongTinGiaoHangDangChon.value = {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHangTongHop: '',
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    };
    return;
  }

  try {
    const response = await axios.get(`http://localhost:8080/api/dia-chi/mac-dinh/khach-hang/${khachHangCuaDonHang.id}`);
    const diaChiMacDinh = response.data; // Đây là DiaChiDTO từ BE

    if (diaChiMacDinh) {
      console.log("Địa chỉ mặc định nhận được:", diaChiMacDinh);
      thongTinGiaoHangDangChon.value = {
        tenNguoiNhan: diaChiMacDinh.tenNguoiNhan || khachHangCuaDonHang.tenKhachHang || '',
        soDienThoaiNguoiNhan: diaChiMacDinh.soDienThoaiNguoiNhan || khachHangCuaDonHang.soDienThoai || '',
        // Tạo địa chỉ tổng hợp KHÔNG CÓ TÊN, SĐT. Chỉ có địa chỉ chi tiết, xã, quận, tỉnh
        diaChiGiaoHangTongHop: [
          diaChiMacDinh.diaChiChiTiet || '',
          diaChiMacDinh.xaPhuong || '',
          diaChiMacDinh.quanHuyen || '',
          diaChiMacDinh.tinhThanhPho || ''
        ].filter(part => part).join(', '),
        tinhThanhPho: diaChiMacDinh.tinhThanhPho || '',
        quanHuyen: diaChiMacDinh.quanHuyen || '',
        xaPhuong: diaChiMacDinh.xaPhuong || '',
        diaChiChiTiet: diaChiMacDinh.diaChiChiTiet || '',
        isMacDinh: true, // Đánh dấu là địa chỉ mặc định
      };
    } else {
      console.log("Không tìm thấy địa chỉ mặc định cho khách hàng:", khachHangCuaDonHang.id);
      // Nếu không có địa chỉ mặc định, vẫn điền tên và sđt của KH, địa chỉ để trống
      thongTinGiaoHangDangChon.value = {
        tenNguoiNhan: khachHangCuaDonHang.tenKhachHang ?? '',
        soDienThoaiNguoiNhan: khachHangCuaDonHang.soDienThoai ?? '',
        diaChiGiaoHangTongHop: '', // Để trống vì không có địa chỉ mặc định chi tiết
        tinhThanhPho: '',
        quanHuyen: '',
        xaPhuong: '',
        diaChiChiTiet: '',
        isMacDinh: false,
      };
    }
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ mặc định:", error);
    // Xử lý lỗi, có thể thông báo cho người dùng hoặc điền thông tin cơ bản
    thongTinGiaoHangDangChon.value = {
      tenNguoiNhan: khachHangCuaDonHang.tenKhachHang ?? '',
      soDienThoaiNguoiNhan: khachHangCuaDonHang.soDienThoai ?? '', // Lỗi ở đây, sửa thành khachHangCuaDonHang
      diaChiGiaoHangTongHop: '', // Để trống vì không lấy được địa chỉ
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    };
  }
};

// Hàm xử lý khi phương thức vận chuyển thay đổi
const xuLyThayDoiPhuongThucVanChuyen = (phuongThuc) => {
  if (phuongThuc === 'delivery') {
    dienDiaChiMacDinh(); // Gọi hàm điền địa chỉ khi chuyển sang giao hàng
  } else {
    // Nếu chuyển sang "Tại quầy", reset thông tin giao hàng
    thongTinGiaoHangDangChon.value = {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHangTongHop: '',
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    };
  }
};

// Watch khi activeTab thay đổi, để cập nhật lại thông tin giao hàng dựa trên đơn hàng mới
watch(activeTab, (newActiveTabId) => {
  if (newActiveTabId !== null && phuongThucVanChuyenDangChon.value === 'delivery') {
    dienDiaChiMacDinh();
  }
});

// Watch khi khách hàng của đơn hàng active thay đổi
watch(() => donHangDangChon.value?.khachHang, (newKhachHang) => {
  if (phuongThucVanChuyenDangChon.value === 'delivery') {
    dienDiaChiMacDinh();
  }
}, { deep: true });

const moPopupChonKhachHang = () => {
  hienThiThemKhachHangPopup.value = true;
};

const xuLyKhachHangDuocChon = (khachHangDuocChon) => {
  const donHang = donHangDangChon.value;
  if (donHang) {
    donHang.khachHang = { ...khachHangDuocChon };
    // Khi chọn khách hàng, tự động điền tên và số điện thoại vào thongTinGiaoHang
    donHang.thongTinGiaoHang.tenNguoiNhan = khachHangDuocChon.tenKhachHang ?? '';
    donHang.thongTinGiaoHang.soDienThoaiNguoiNhan = khachHangDuocChon.soDienThoai ?? '';

    if (donHang.phuongThucVanChuyen === 'delivery') {
      dienDiaChiMacDinh();
    }
  }
  hienThiThemKhachHangPopup.value = false;
};

const xoaKhachHangDaChon = () => {
  const donHang = donHangDangChon.value;
  if (donHang) {
    donHang.khachHang = null;
    donHang.thongTinGiaoHang = {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHangTongHop: '',
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    };
  }
  if (phuongThucVanChuyenDangChon.value === 'delivery') {
    dienDiaChiMacDinh();
  }
};

// --- Logic cho popup chọn địa chỉ khác ---
const moPopupChonDiaChi = () => {
  const khachHangCuaDonHang = donHangDangChon.value ? donHangDangChon.value.khachHang : null;
  if (!khachHangCuaDonHang || !khachHangCuaDonHang.id) {
    alert("Vui lòng chọn khách hàng trước khi chọn địa chỉ!");
    return;
  }
  hienThiChonDiaChiPopup.value = true;
};

// Hàm nhận địa chỉ đã chọn từ popup
const xuLyDiaChiDuocChon = (diaChiDuocChon) => {
    if (diaChiDuocChon && donHangDangChon.value) { // Đảm bảo donHangDangChon.value tồn tại
        thongTinGiaoHangDangChon.value = {
            // Ưu tiên thông tin từ địa chỉ được chọn, nếu không có thì lấy từ khách hàng hiện tại
            tenNguoiNhan: diaChiDuocChon.tenNguoiNhan || (donHangDangChon.value.khachHang?.tenKhachHang || ''),
            soDienThoaiNguoiNhan: diaChiDuocChon.soDienThoaiNguoiNhan || (donHangDangChon.value.khachHang?.soDienThoai || ''),
            diaChiGiaoHangTongHop: [ // Cập nhật địa chỉ tổng hợp
                diaChiDuocChon.diaChiChiTiet || '',
                diaChiDuocChon.xaPhuong || '',
                diaChiDuocChon.quanHuyen || '',
                diaChiDuocChon.tinhThanhPho || ''
            ].filter(part => part).join(', '),
            tinhThanhPho: diaChiDuocChon.tinhThanhPho || '',
            quanHuyen: diaChiDuocChon.quanHuyen || '',
            xaPhuong: diaChiDuocChon.xaPhuong || '',
            diaChiChiTiet: diaChiDuocChon.diaChiChiTiet || '',
            isMacDinh: diaChiDuocChon.isMacDinh || false, // Giữ trạng thái mặc định của địa chỉ được chọn
        };
    }
    hienThiChonDiaChiPopup.value = false;
};

// Hàm tạo địa chỉ tổng hợp từ các trường chi tiết
// Hàm này sẽ chỉ được gọi nếu chúng ta muốn "chỉnh sửa" địa chỉ sau khi đã điền
// Tuy nhiên, theo yêu cầu mới, chúng ta sẽ không cho phép chỉnh sửa trực tiếp các trường chi tiết này nữa
// Nên hàm này có thể được đơn giản hóa hoặc loại bỏ nếu không dùng
const capNhatDiaChiTongHop = () => {
  const info = thongTinGiaoHangDangChon.value;
  const parts = [];
  // Thứ tự này quan trọng để tạo chuỗi địa chỉ dễ đọc
  if (info.diaChiChiTiet) parts.push(info.diaChiChiTiet);
  if (info.xaPhuong) parts.push(info.xaPhuong);
  if (info.quanHuyen) parts.push(info.quanHuyen);
  if (info.tinhThanhPho) parts.push(info.tinhThanhPho);

  thongTinGiaoHangDangChon.value.diaChiGiaoHangTongHop = parts.filter(part => part).join(', ');
};

// --- Lưu vào localStorage mỗi khi thay đổi ---
watch(
  orders, // GIỮ NGUYÊN 'orders'
  (newVal) => {
    localStorage.setItem("orders", JSON.stringify(newVal));
  },
  { deep: true }
);

watch(activeTab, (newVal) => { // GIỮ NGUYÊN 'activeTab'
  localStorage.setItem("activeTab", JSON.stringify(newVal));
});
</script>

<template>
  <div class="bg-white p-3 rounded mb-4 d-flex align-items-center justify-content-between border" style="height: 60px">
    <h5 class="fw-bold mb-0">Bán hàng tại quầy</h5>
    <button class="btn success" style="background-color: #0a2c57; color: white" @click="createNewOrder">
      <Plus class="me-1" size="16" /> Tạo đơn mới
    </button>
  </div>
  <ul class="nav nav-tabs">
    <li class="nav-item" v-for="order in orders" :key="order.id">
      <a class="nav-link" :class="{ active: order.id === activeTab }" href="#" @click.prevent="activeTab = order.id">
        {{ order.name }}
        <span class="ms-1 text-danger" @click.stop="closeOrder(order.id)">×</span>
      </a>
    </li>
  </ul>

  <div v-if="orders.length === 0" class="text-center mt-5">
    <img src="https://web.nvnstatic.net/tp/T0213/img/tmp/cart-empty.png?v=9" alt="No orders" width="170" />
    <p class="mt-2">Không có bất kỳ đơn hàng nào !!!</p>
  </div>

  <div v-if="activeTab !== null" class="bg-white p-3 rounded mb-4 align-items-center border">
    <div v-for="order in orders" :key="order.id" v-show="order.id === activeTab">
      <h6>Chi tiết {{ order.name }}</h6>
      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">🛒 Giỏ hàng</h5>
          <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            " @click="moPopupThemSanPham" title="Thêm sản phẩm">
            <Plus size="20" />
          </button>
        </div>
        <div class="text-muted text-center bg-light rounded">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>STT</th>
                  <th>Ảnh</th>
                  <th>Thông tin chung</th>
                  <th>Chi tiết</th>
                  <th>Số lượng</th>
                  <th>Giá bán</th>
                  <th>Thành tiền</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="order.listSanPham.length === 0">
                  <td colspan="8" class="text-center">Chưa có sản phẩm nào trong giỏ hàng.</td>
                </tr>
                <tr v-for="(item, index) in order.listSanPham" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td><img :src="item.anhDaiDien || 'https://via.placeholder.com/50'" alt="Product Image" width="50" height="50" class="rounded">
                  </td>
                  <td>
                    <strong>{{ item.tenSanPham }}</strong> <br />
                    <small class="text-muted">Mã SP: {{ item.maSanPham }}</small>
                  </td>
                  <td>
                    <small>Màu: {{ item.mauSac }}</small><br />
                    <small>Size: {{ item.kichThuoc }}</small>
                  </td>
                  <td>
                    <input type="number" v-model.number="item.soLuong" min="1" class="form-control form-control-sm" style="width: 70px;">
                  </td>
                  <td>{{ item.gia.toLocaleString() }}đ</td>
                  <td>{{ (item.gia * item.soLuong).toLocaleString() }}đ</td>
                  <td>
                    <button class="btn btn-sm btn-outline-danger" @click="removeItem(order, index)">Xóa</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ThemSanPham v-if="hienThiThemSanPham" :maHoaDon="activeTab" @selected="nhanSanPhamDaChon"
          @close="hienThiThemSanPham = false" />
      </div>
           <!-- PHẦN KHÁCH HÀNG -->
      <div class="row gx-4">
        <div class="col-md-6">
          <div class="bg-white p-3 rounded mb-4 align-items-center border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">👤 Khách hàng</h5>
              <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
                  width: 36px;
                  height: 36px;
                  background-color: #0a2c57;
                  color: white;
                " @click="moPopupChonKhachHang" title="Chọn khách hàng">
                <UserCog size="20" />
              </button>
            </div>

            <div v-if="order.khachHang">
              <div class="mb-2"><strong>Tên khách hàng:</strong> {{ order.khachHang.tenKhachHang }}</div>
              <div class="mb-2"><strong>Số điện thoại:</strong> {{ order.khachHang.soDienThoai }}</div>
              <div class="mb-2"><strong>Email:</strong> {{ order.khachHang.email || 'Chưa cập nhật' }}</div>
              <div class="mb-2"><strong>Giới tính:</strong> {{ order.khachHang.gioiTinh ? 'Nam' : 'Nữ' }}</div>
              <button class="btn btn-sm btn-outline-danger mt-2" @click="xoaKhachHangDaChon">Bỏ chọn khách hàng</button>
            </div>
            <div v-else class="text-muted">Chưa có khách hàng nào được chọn cho đơn hàng này.</div>

            <ThemKhachHangHoaDon v-if="hienThiThemKhachHangPopup" :currentSelectedCustomer="order.khachHang"
              @customerSelected="xuLyKhachHangDuocChon" @close="hienThiThemKhachHangPopup = false" />
          </div>
        </div>
        <div class="col-md-6">
          <div class="bg-white p-3 rounded mb-4 border">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">🚚 Thông tin giao hàng</h5>
              <Truck size="20" class="text-muted" />
            </div>

            <div class="mb-3">
              <label class="form-label">Phương thức vận chuyển:</label>
              <div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" id="shippingDirect" value="direct"
                    v-model="phuongThucVanChuyenDangChon">
                  <label class="form-check-label" for="shippingDirect">Tại quầy</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" id="shippingDelivery" value="delivery"
                    v-model="phuongThucVanChuyenDangChon">
                  <label class="form-check-label" for="shippingDelivery">Giao hàng</label>
                </div>
              </div>
            </div>

            <div v-if="phuongThucVanChuyenDangChon === 'delivery'">
              <div class="mb-3">
                <label for="tenNguoiNhan" class="form-label">Tên người nhận:</label>
                <input type="text" id="tenNguoiNhan" class="form-control" v-model="thongTinGiaoHangDangChon.tenNguoiNhan" placeholder="Nhập tên người nhận">
              </div>
              <div class="mb-3">
                <label for="soDienThoaiNguoiNhan" class="form-label">Số điện thoại người nhận:</label>
                <input type="text" id="soDienThoaiNguoiNhan" class="form-control" v-model="thongTinGiaoHangDangChon.soDienThoaiNguoiNhan" placeholder="Nhập số điện thoại người nhận">
              </div>

              <div v-if="order.khachHang && thongTinGiaoHangDangChon.diaChiGiaoHangTongHop" class="alert alert-info py-2" role="alert">
                  <p class="mb-1"><strong>Địa chỉ giao hàng:</strong></p>
                  <p class="mb-1">
                      {{ thongTinGiaoHangDangChon.diaChiGiaoHangTongHop }}
                  </p>
                  <button class="btn btn-sm btn-link p-0" @click="moPopupChonDiaChi">Chọn địa chỉ khác</button>
              </div>
              <div v-else class="alert alert-warning py-2" role="alert">
                  <p class="mb-1">Chưa có địa chỉ giao hàng được chọn.</p>
                  <button class="btn btn-sm btn-link p-0" @click="moPopupChonDiaChi">Chọn địa chỉ</button>
              </div>

              <ChonDiaChiPopup
                  v-if="hienThiChonDiaChiPopup"
                  :khachHangId="order.khachHang?.id"
                  @diaChiSelected="xuLyDiaChiDuocChon"
                  @close="hienThiChonDiaChiPopup = false"
              />

              <div class="mt-3">
                  <div class="d-flex align-items-center mb-2">
                      <strong class="me-2">Đơn vị vận chuyển:</strong> <span>Giao hàng nhanh</span>
                  </div>
                  <div class="d-flex align-items-center">
                      <strong class="me-2">Thời gian dự kiến:</strong> <span>17/5/2025</span>
                  </div>
              </div>
            </div>
            <div v-else class="text-muted">Đơn hàng sẽ được xử lý tại quầy.</div>
          </div>
        </div>
      </div>

      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">💳 Thanh toán</h5>
        </div>

        <div class="d-flex align-items-center gap-3 mb-3">
          <label class="fw-bold mb-0">Mã giảm giá:</label>
          <input type="text" class="form-control" style="max-width: 250px" placeholder="Nhập mã giảm giá..." />

          <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            " title="Áp dụng mã giảm giá">
            <Tag size="18" />
          </button>

          <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            " title="Hủy chọn">
            <Ban size="18" />
          </button>
        </div>

        <div class="d-flex align-items-center justify-content-between border rounded p-2 mb-3"
          style="background-color: #f8f9fa">
          <div class="d-flex align-items-center gap-2">
            <TicketPercent size="24" class="text-success" />
            <div>
              <div><strong>Mã phiếu HC-af374fbf</strong></div>
              <div class="text-muted small">
                Phần trăm tối đa: <strong>5%</strong> &nbsp;|&nbsp; Giá trị tối
                thiểu: <strong>50.000đ</strong>
              </div>
              <div class="text-danger small">
                (Đang sử dụng) Phiếu công khai - Còn lại: <strong>4</strong>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-2"><strong>Tiền sản phẩm:</strong> 300.000đ</div>
        <div class="mb-2"><strong>Giảm giá:</strong> 15.000đ</div>

        <div class="d-flex align-items-center gap-3 mb-3">
          <label class="fw-bold mb-0">Phương thức thanh toán:</label>
          <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            " title="Chuyển khoản">
            <CreditCard size="18" />
          </button>
          <span>Chuyển khoản</span>
        </div>

        <div class="mb-2">
          <h4><strong>Tổng tiền:</strong></h4>
          <strong>
            <h1>750.000đ</h1>
          </strong>
        </div>

        <div class="text-end">
          <button class="btn" style="
              background-color: #0a2c57;
              color: white;
              min-width: 200px;
              font-weight: bold;
            ">
            Hoàn thành đơn hàng
          </button>
        </div>
      </div>
    </div>
  </div>
</template>