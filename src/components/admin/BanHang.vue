<script setup>
import { ref, watch } from "vue";
import {
  Plus,
  UserCog,
  Tag,
  Ban,
  TicketPercent,
  CreditCard,
} from "lucide-vue-next";
import ThemSanPham from "./ThemSanPhamHoaDon.vue";
import PhieuGiamGiaBH from "./PhieuGiamGiaBH.vue";

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

// Active tab hiện tại (đơn hàng đang thao tác)
const activeTab = ref(null);
const storedActiveTab = localStorage.getItem("activeTab");
if (storedActiveTab) {
  activeTab.value = JSON.parse(storedActiveTab);
}

// ID đơn tiếp theo
let nextOrderId =
  orders.value.length > 0
    ? Math.max(...orders.value.map((o) => o.id)) + 1
    : 1;

// Tạo đơn mới
function createNewOrder() {
  const newOrder = {
    id: nextOrderId++,
    name: `Đơn ${nextOrderId - 1}`,
    listSanPham: [],
    khachHang: null,
    giamGia: null,
    idKhachHang: "", // Thêm idKhachHang cho mỗi đơn
    maPhieuGiamGia: "", // Thêm maPhieuGiamGia cho mỗi đơn
    errorMessage: "", // Thêm errorMessage cho mỗi đơn
  };
  orders.value.push(newOrder);
  activeTab.value = newOrder.id;
}

// Đóng đơn hàng
function closeOrder(id) {
  orders.value = orders.value.filter((o) => o.id !== id);
  if (activeTab.value === id) {
    activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
  }
}

// Popup chọn sản phẩm
const hienThiThemSanPham = ref(false);
const moPopupThemSanPham = () => {
  hienThiThemSanPham.value = true;
};
// Popup phiếu giảm giá
const hienThiPhieuGiamGia = ref(false);
const moPopupPhieuGiamGia = () => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (!activeOrder.idKhachHang) {
    activeOrder.errorMessage = "Vui lòng nhập ID khách hàng trước khi chọn phiếu giảm giá.";
    return;
  }
  hienThiPhieuGiamGia.value = true;
};

// Khi nhận sản phẩm đã chọn từ component ThemSanPham
const nhanSanPhamDaChon = (danhSachSanPham) => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.listSanPham.push(...danhSachSanPham);
  }
};
// Khi nhận phiếu giảm giá đã chọn từ PhieuGiamGiaBH
const nhanPhieuGiamGia = (phieu) => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.giamGia = phieu;
    activeOrder.maPhieuGiamGia = phieu.maPhieuGiamGia; // Load mã phiếu vào đơn
    activeOrder.errorMessage = ""; // Clear error message
  }
  hienThiPhieuGiamGia.value = false; // Close popup
};
// Hủy chọn phiếu giảm giá
const huyChonPhieuGiamGia = () => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.giamGia = null; // Clear selected voucher
    activeOrder.maPhieuGiamGia = ""; // Clear input field
    activeOrder.errorMessage = ""; // Clear error message
  }
};

// Validate mã phiếu giảm giá khi nhập thủ công
const validateMaPhieuGiamGia = async () => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (!activeOrder) return;

  if (!activeOrder.maPhieuGiamGia) {
    activeOrder.giamGia = null; // Clear voucher if input is empty
    activeOrder.errorMessage = "";
    return;
  }

  try {
    const response = await axios.get(`/ban_hang/phieuGG/validate/${activeOrder.maPhieuGiamGia}`, {
      params: { khachHangId: activeOrder.idKhachHang },
    });
    activeOrder.giamGia = response.data; // Set voucher if valid
    activeOrder.errorMessage = "";
  } catch (error) {
    console.error("Lỗi validate mã phiếu:", error);
    activeOrder.giamGia = null; // Clear voucher if invalid
    activeOrder.errorMessage = "Mã phiếu không tồn tại hoặc không hợp lệ.";
  }
};





// --- Lưu vào localStorage mỗi khi thay đổi ---
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
      <a class="nav-link" :class="{ active: order.id === activeTab }" href="#" @click.prevent="activeTab = order.id">
        {{ order.name }}
        <span class="ms-1 text-danger" @click.stop="closeOrder(order.id)">×</span>
      </a>
    </li>
  </ul>

  <!-- Nếu không có đơn hàng nào -->
  <div v-if="orders.length === 0" class="text-center mt-5">
    <img src="https://web.nvnstatic.net/tp/T0213/img/tmp/cart-empty.png?v=9" alt="No orders" width="170" />
    <p class="mt-2">Không có bất kỳ đơn hàng nào !!!</p>
  </div>

  <!-- Nội dung đơn hàng đang active -->
  <div v-if="activeTab !== null" class="bg-white p-3 rounded mb-4 align-items-center border">
    <div v-for="order in orders" :key="order.id" v-show="order.id === activeTab">
      <h6>Chi tiết {{ order.name }}</h6>
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
                  <td>{{ item.idSanPhamChiTiet }}</td>
                  <td>{{ item.soLuong }}</td>
                  <td>{{ item.gia.toLocaleString() }}đ</td>
                  <td>{{ (item.gia * item.soLuong).toLocaleString() }}đ</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <ThemSanPham v-if="hienThiThemSanPham" :maHoaDon="activeTab" @selected="nhanSanPhamDaChon"
          @close="hienThiThemSanPham = false" />
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
        <div class="mb-2"><strong>Tên khách hàng:</strong> Nguyễn Văn A</div>
        <div class="mb-2"><strong>Số điện thoại:</strong> 0366166359</div>
        <div class="mb-2">
          <strong>Địa chỉ nhận hàng:</strong> Nguyễn Cơ Thạch, Mỹ Đình 2, Nam Từ
          Liêm
        </div>
      </div>

      <!-- PHẦN THANH TOÁN -->
      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">💳 Thanh toán</h5>
        </div>
       <div class="mb-2">
          <strong>ID khách hàng:</strong>
          <input type="text" v-model="order.idKhachHang" name="idKhachHang" placeholder="Nhập ID khách hàng">
        </div>
        <!-- Mã giảm giá -->
        <div class="d-flex align-items-center gap-3 mb-3">
          <label class="fw-bold mb-0">Mã giảm giá:</label>
          <input type="text" class="form-control" style="max-width: 250px" placeholder="Nhập mã giảm giá..." v-model="order.maPhieuGiamGia" />
          <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            " title="Áp dụng mã giảm giá" @click="moPopupPhieuGiamGia">
            <Tag size="18" />
          </button>
          <PhieuGiamGiaBH v-if="hienThiPhieuGiamGia" :khachHangId="order.idKhachHang" @close="hienThiPhieuGiamGia = false" @selected="nhanPhieuGiamGia" />
          <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            " title="Hủy chọn" @click="huyChonPhieuGiamGia">
            <Ban size="18" />
          </button>
        </div>
        <!-- Thông báo lỗi -->
        <div v-if="order.errorMessage" class="text-danger mb-3">{{ order.errorMessage }}</div>
        <!-- Thông tin phiếu -->
        <div v-if="order.giamGia" class="d-flex align-items-center justify-content-between border rounded p-2 mb-3" style="background-color: #f8f9fa">
          <div class="d-flex align-items-center gap-2">
            <TicketPercent size="24" class="text-success" />
            <div>
              <div><strong>Mã phiếu:</strong> {{ order.giamGia.maPhieuGiamGia }}</div>
              <div class="text-muted small">
                Giá trị giảm: <strong>{{ order.giamGia.phamTramGiamGia ? order.giamGia.phamTramGiamGia + '%' : order.giamGia.soTienGiam.toLocaleString() + 'đ' }}</strong> | 
                Giá trị tối thiểu: <strong>{{ order.giamGia.giamToiThieu.toLocaleString() }}đ</strong>
              </div>
              <div class="text-danger small">
                (Đang sử dụng) {{ order.giamGia.loaiPhieu }} - Còn lại: <strong>{{ order.giamGia.soLuong }}</strong>
              </div>
            </div>
          </div>
        </div>

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
