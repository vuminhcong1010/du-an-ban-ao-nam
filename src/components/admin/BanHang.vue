<script setup>
import { ref, watch } from "vue";
import {
  Plus,
  UserCog,
  Tag,
  Ban,
  TicketPercent,
  CreditCard,
  Trash,
} from "lucide-vue-next";
import ThemSanPham from "./ThemSanPhamBanHang.vue";
import PhieuGiamGiaBH from "./PhieuGiamGiaBH.vue";

import PhieuGiamGiaBH from "./PhieuGiamGiaBH.vue";
import axios from "axios";
// Khởi tạo danh sách đơn hàng từ localStorage nếu có
const orders = ref([]); // GIỮ NGUYÊN TÊN 'orders' theo yêu cầu

const storedOrders = localStorage.getItem("orders");
if (storedOrders) {
  try {

    orders.value = JSON.parse(storedOrders);

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
    console.error("Lỗi parse orders:", e);
  }
}

// Active tab hiện tại (đơn hàng đang thao tác) - Giữ nguyên tên tiếng Anh
const activeTab = ref(null);
const storedActiveTab = localStorage.getItem("activeTab");
if (storedActiveTab) {
  activeTab.value = JSON.parse(storedActiveTab);
}

// ID đơn tiếp theo - Giữ nguyên tên tiếng Anh
let nextOrderId =
  orders.value.length > 0 ? Math.max(...orders.value.map((o) => o.id)) + 1 : 1;

// Quản lý popup chọn phiếu giảm giá và ID khách hàng
const hienThiPhieuGiamGia = ref(false);
const khachHangId = ref(""); // Lưu ID khách hàng được nhập
const maGiamGia = ref(""); // Lưu mã giảm giá nhập tay
const errorMessage = ref(""); // Lưu thông báo lỗi khi validate mã
// Tạo đơn mới
async function createNewOrder() {
  try {
    const response = await fetch("http://localhost:8080/hoa-don/tao-moi", {
      method: "POST",
    });
    const maHoaDon = await response.text(); // backend trả về chuỗi

    const newOrder = {
      id: nextOrderId++,
      name: `Đơn ${nextOrderId - 1}`,
      listSanPham: [],
      maHoaDon: maHoaDon, // ⚠️ gán mã hóa đơn để truyền cho component ThemSanPham
      khachHang: {
        tenKhachHang: "Khach le",
        diaChi: "",
        sdt: "",
      },
      giamGia: null,
    };

    orders.value.push(newOrder);
    activeTab.value = newOrder.id;
  } catch (error) {
    console.error("Lỗi tạo hóa đơn:", error);
  }

}

// Đóng đơn hàng - Giữ nguyên tên tiếng Anh
function closeOrder(id) {
  orders.value = orders.value.filter((o) => o.id !== id);
  if (activeTab.value === id) {
    activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
  }
}


// Popup chọn sản phẩm

// Hàm xóa sản phẩm khỏi giỏ hàng - Giữ nguyên tên tiếng Anh
const removeItem = (order, index) => {
  order.listSanPham.splice(index, 1);
};


// --- Phần Sản phẩm --- (Giữ nguyên)
const hienThiThemSanPham = ref(false);

const moPopupThemSanPham = () => {
  hienThiThemSanPham.value = true;
};

// Khi nhận sản phẩm đã chọn từ component ThemSanPham
const nhanSanPhamDaChon = (danhSachSanPham) => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.listSanPham.push(...danhSachSanPham);
  }
};

// xóa sản phẩm khỏi giỏ hàng
const xoaSanPhamKhoiDonHang = (orderId, index) => {
  const order = orders.value.find((o) => o.id === orderId);
  if (order) {
    order.listSanPham.splice(index, 1);
  }
};

// khach hang:
let maHoaDon = ref("HD001");


// phieu giam gia: 
// Quản lý popup chọn phiếu giảm giá và ID khách hàng
const hienThiPhieuGiamGia = ref(false);
const khachHangId = ref(""); // Lưu ID khách hàng được nhập
const maGiamGia = ref(""); // Lưu mã giảm giá nhập tay
const errorMessage = ref(""); // Lưu thông báo lỗi khi validate mã

// Mở popup chọn phiếu giảm giá
const moPopupPhieuGiamGia = () => {
  if (!khachHangId.value || isNaN(khachHangId.value) || khachHangId.value <= 0) {
    alert("Vui lòng nhập ID khách hàng hợp lệ.");
    return;
  }
  hienThiPhieuGiamGia.value = true;
};

// Nhận phiếu giảm giá đã chọn từ modal
const nhanPhieuGiamGiaDaChon = (phieu) => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.giamGia = phieu; // Lưu phiếu giảm giá vào đơn hàng

    errorMessage.value = ""; // Xóa thông báo lỗi
  }
  hienThiPhieuGiamGia.value = false; // Đóng modal
};
// Validate mã giảm giá nhập tay
const validateMaGiamGia = async (maGiamGia) => {
  if (!khachHangId.value || isNaN(khachHangId.value) || khachHangId.value <= 0) {
    errorMessage.value = "Vui lòng nhập ID khách hàng hợp lệ.";
    return;
  }
  
  try {
    const response = await axios.get(
      `http://localhost:8080/ban_hang/phieuGG/validate/${maGiamGia}?khachHangId=${khachHangId.value}`
    );
    const activeOrder = orders.value.find((o) => o.id === activeTab.value);
    if (activeOrder) {
      activeOrder.giamGia = response.data; // Lưu phiếu giảm giá vào đơn hàng
      errorMessage.value = ""; // Xóa thông báo lỗi
    }
  } catch (error) {
    console.error("Error validating voucher:", error.response?.data || error.message);
    errorMessage.value = error.response?.data?.message || "Mã giảm giá không hợp lệ hoặc không tồn tại.";
    const activeOrder = orders.value.find((o) => o.id === activeTab.value);
    if (activeOrder) {
      activeOrder.giamGia = null; // Xóa phiếu giảm giá nếu không hợp lệ
    }
  }
};
// Hủy chọn phiếu giảm giá
const huyChonPhieuGiamGia = () => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.giamGia = null; // Xóa phiếu giảm giá


    errorMessage.value = ""; // Xóa thông báo lỗi
  }
};

// Format tiền
const formatCurrency = (val) => {
  return val ? val.toLocaleString("vi-VN") + " VNĐ" : "";
};

// het phieu giam gia 

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
  <!-- Header -->
  <div class="bg-white p-3 rounded mb-4 d-flex align-items-center justify-content-between border" style="height: 60px">
    <h5 class="fw-bold mb-0">Bán hàng tại quầy</h5>
    <button class="btn success" style="background-color: #0a2c57; color: white" @click="createNewOrder">
      <Plus class="me-1" size="16" /> Tạo đơn mới
    </button>
  </div>
  <!-- Tabs -->
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

  <!-- Nếu không có đơn hàng nào -->
  <div v-if="orders.length === 0" class="text-center mt-5">
    <img src="https://web.nvnstatic.net/tp/T0213/img/tmp/cart-empty.png?v=9" alt="No orders" width="170" />
    <p class="mt-2">Không có bất kỳ đơn hàng nào !!!</p>
  </div>

  <!-- Nội dung đơn hàng đang active -->
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
      <!-- Tại đây hiển thị danh sách sản phẩm, khách hàng,... -->
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
        <!-- Hiển thị danh sách sản phẩm trong đơn dưới dạng bảng -->
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
                <tr v-for="(item, index) in order.listSanPham" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td></td>
                  <td>{{ item.idSanPham.tenSanPham }}</td>
                  <td>
                    <span>Size: {{ item.idSize.soCo }}</span> <br />
                    <span>Màu sắc: {{ item.idMau.ten }}</span>
                  </td>
                  <td>
                    <input
                      type="number"
                      class="form-control text-center"
                      style="width: 70px"
                      min="1"
                      v-model.number="item.soLuong"
                    />
                  </td>
                  <td>{{ item.gia.toLocaleString() }}đ</td>
                  <td>{{ (item.gia * item.soLuong).toLocaleString() }}đ</td>
                  <td>
                    <button
                      class="btn p-1 border-0 bg-transparent d-flex align-items-center justify-content-center mx-auto"
                      @click="xoaSanPhamKhoiDonHang(order.id, index)"
                    >
                      <i>
                        <Trash
                          style="width: 16px; height: 16px; color: #0a2c57"
                        />
                      </i>
                    </button>
                   
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ThemSanPham
          v-if="hienThiThemSanPham"
          :maHoaDon="orders.find((o) => o.id === activeTab)?.maHoaDon"
          @selected="nhanSanPhamDaChon"
          @close="hienThiThemSanPham = false"
        />

      </div>
      <!-- PHẦN KHÁCH HÀNG -->
      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">👤 Khách hàng</h5>
          <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            " title="Chọn khách hàng">
            <UserCog size="20" />
          </button>
        </div>

        <!-- Thông tin khách -->
        <div class="mb-2"><strong>Tên nguoi nhan:</strong> Nguyễn Văn A</div>
        <input type="text" />
        <div class="mb-2"><strong>Số điện thoại:</strong> 0366166359</div>
        <div class="mb-2">
          <strong>Địa chỉ nhận hàng:</strong> Nguyễn Cơ Thạch, Mỹ Đình 2, Nam Từ
          Liêm
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

      <!-- PHẦN THANH TOÁN -->
      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">💳 Thanh toán</h5>
        </div>
        <div class="mb-3">
          <label class="fw-bold mb-0">ID khách hàng:</label>
          <input type="text" v-model="khachHangId" class="form-control" style="max-width: 250px"
            placeholder="Nhập ID khách hàng..." />
        </div>
        <div class="d-flex align-items-center gap-3 mb-3">
          <label class="fw-bold mb-0">Mã giảm giá:</label>
          <input type="text" :value="order.giamGia?.maPhieuGiamGia || ''" class="form-control" style="max-width: 250px"
            placeholder="Nhập mã giảm giá..." @input="validateMaGiamGia($event.target.value)"
            @blur="validateMaGiamGia($event.target.value)" @keyup.enter="validateMaGiamGia($event.target.value)" />
          <button class="btn border rounded-circle d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px; background-color: #0a2c57; color: white" title="Áp dụng mã giảm giá"
            @click="moPopupPhieuGiamGia">
            <Tag size="18" />
          </button>
          <button class="btn border rounded-circle d-flex align-items-center justify-content-center"
            style="width: 36px; height: 36px; background-color: #0a2c57; color: white" title="Hủy chọn"
            @click="huyChonPhieuGiamGia">
            <Ban size="18" />
          </button>
        </div>
        <!-- Thông báo lỗi validate -->
        <div v-if="errorMessage" class="text-danger mb-3">
          {{ errorMessage }}
        </div>
        <!-- Thông tin phiếu giảm giá -->
        <div v-if="order.giamGia" class="d-flex align-items-center justify-content-between border rounded p-2 mb-3"
          style="background-color: #f8f9fa">
          <div class="d-flex align-items-center gap-2">
            <TicketPercent size="24" class="text-success" />
            <div>
              <div><strong>Mã phiếu {{ order.giamGia.maPhieuGiamGia }}</strong></div>
              <div class="text-muted small">
                Giá trị giảm: <strong>{{
                  order.giamGia.phamTramGiamGia
                    ? order.giamGia.phamTramGiamGia + "%"
                    : formatCurrency(order.giamGia.soTienGiam)
                }}</strong>
                | Giá trị tối thiểu: <strong>{{ formatCurrency(order.giamGia.giamToiThieu) }}</strong>
                | Giá trị tối đa: <strong>{{ formatCurrency(order.giamGia.giamToiDa) }}</strong>
              </div>
              <div class="text-danger small">
                (Đang sử dụng) Phiếu {{ order.giamGia.loaiPhieu }} - Còn lại: <strong>{{ order.giamGia.soLuong
                  }}</strong>
              </div>
            </div>
          </div>
        </div>
        <!-- Modal phiếu giảm giá -->
        <PhieuGiamGiaBH v-if="hienThiPhieuGiamGia" :khachHangId="khachHangId" :selectedPhieu="order.giamGia"
          @selected="nhanPhieuGiamGiaDaChon" @close="hienThiPhieuGiamGia = false" />

        <!-- Tổng kết đơn hàng -->
        <div class="mb-2"><strong>Tiền sản phẩm:</strong> 300.000đ</div>
        <div class="mb-2"><strong>Giảm giá:</strong> 15.000đ</div>

        <!-- Phương thức thanh toán -->
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

        <!-- Nút hoàn tất -->
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
