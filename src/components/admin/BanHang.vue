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
const orders = ref([]);

const storedOrders = localStorage.getItem("orders");
if (storedOrders) {
  try {
    const parsedOrders = JSON.parse(storedOrders);
    orders.value = parsedOrders.map(order => ({
      ...order,
      shippingMethod: order.shippingMethod || 'direct',
      deliveryInfo: order.deliveryInfo || {
        tenNguoiNhan: '',
        soDienThoaiNguoiNhan: '',
        diaChiGiaoHang: '',
        tinhThanhPho: '',
        quanHuyen: '',
        xaPhuong: '',
        diaChiChiTiet: '',
        isMacDinh: false,
      },
      listSanPham: order.listSanPham || [],
    }));
  } catch (e) {
    console.error("Lỗi parse orders từ localStorage:", e);
    orders.value = [];
  }
}

// Active tab hiện tại (đơn hàng đang thao tác)
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
    shippingMethod: 'direct',
    deliveryInfo: {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHang: '',
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

// Đóng đơn hàng
function closeOrder(id) {
  orders.value = orders.value.filter((o) => o.id !== id);
  if (activeTab.value === id) {
    activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
  }
}

// Hàm xóa sản phẩm khỏi giỏ hàng
const removeItem = (order, index) => {
  order.listSanPham.splice(index, 1);
};


// --- Phần Sản phẩm ---
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




// --- Phần Khách hàng và Giao hàng ---
const hienThiThemKhachHangPopup = ref(false);
const hienThiChonDiaChiPopup = ref(false); // Biến để điều khiển popup chọn địa chỉ

// Computed property để lấy khách hàng của đơn hàng đang active
const currentActiveOrderCustomer = computed(() => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  return activeOrder ? activeOrder.khachHang : null;
});

// Computed property để lấy phương thức vận chuyển của đơn hàng đang active
const currentShippingMethod = computed({
  get() {
    const activeOrder = orders.value.find((o) => o.id === activeTab.value);
    return activeOrder ? activeOrder.shippingMethod : 'direct';
  },
  set(newValue) {
    const activeOrder = orders.value.find((o) => o.id === activeTab.value);
    if (activeOrder) {
      activeOrder.shippingMethod = newValue;
      handleShippingMethodChange(newValue);
    }
  }
});

// Computed property để lấy/set thông tin giao hàng của đơn hàng đang active
const currentDeliveryInfo = computed({
  get() {
    const activeOrder = orders.value.find((o) => o.id === activeTab.value);
    return activeOrder ? activeOrder.deliveryInfo : {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHang: '',
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    };
  },
  set(newValue) {
    const activeOrder = orders.value.find((o) => o.id === activeTab.value);
    if (activeOrder) {
      activeOrder.deliveryInfo = newValue;
    }
  }
});

// Hàm điền địa chỉ mặc định từ API
const fillDefaultDeliveryAddress = async () => {
  const customer = currentActiveOrderCustomer.value;
  if (!customer || !customer.id) { // Kiểm tra có khách hàng và ID không
    // Nếu không có khách hàng, reset deliveryInfo
    currentDeliveryInfo.value = {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHang: '',
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    };
    return;
  }

  try {
    const response = await axios.get(`http://localhost:8080/api/dia-chi/mac-dinh/khach-hang/${customer.id}`);
    const defaultAddress = response.data; // Đây là DiaChiDTO từ BE

    if (defaultAddress) {
      console.log("Địa chỉ mặc định nhận được:", defaultAddress);
      currentDeliveryInfo.value = {
        tenNguoiNhan: defaultAddress.tenNguoiNhan || customer.tenKhachHang || '',
        soDienThoaiNguoiNhan: defaultAddress.soDienThoaiNguoiNhan || customer.soDienThoai || '',
        // Tạo địa chỉ tổng hợp KHÔNG CÓ TÊN, SĐT. Chỉ có địa chỉ chi tiết, xã, quận, tỉnh
        diaChiGiaoHang: [
          defaultAddress.diaChiChiTiet || '',
          defaultAddress.xaPhuong || '',
          defaultAddress.quanHuyen || '',
          defaultAddress.tinhThanhPho || ''
        ].filter(part => part).join(', '),
        tinhThanhPho: defaultAddress.tinhThanhPho || '',
        quanHuyen: defaultAddress.quanHuyen || '',
        xaPhuong: defaultAddress.xaPhuong || '',
        diaChiChiTiet: defaultAddress.diaChiChiTiet || '',
        isMacDinh: true, // Đánh dấu là địa chỉ mặc định
      };
    } else {
      console.log("Không tìm thấy địa chỉ mặc định cho khách hàng:", customer.id);
      // Nếu không có địa chỉ mặc định, vẫn điền tên và sđt của KH, địa chỉ để trống
      currentDeliveryInfo.value = {
        tenNguoiNhan: customer.tenKhachHang ?? '',
        soDienThoaiNguoiNhan: customer.soDienThoai ?? '',
        diaChiGiaoHang: '', // Để trống vì không có địa chỉ mặc định chi tiết
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
    currentDeliveryInfo.value = {
        tenNguoiNhan: customer.tenKhachHang ?? '',
        soDienThoaiNguoiNhan: customer.soDienThoai ?? '',
        diaChiGiaoHang: '', // Để trống vì không lấy được địa chỉ
        tinhThanhPho: '',
        quanHuyen: '',
        xaPhuong: '',
        diaChiChiTiet: '',
        isMacDinh: false,
      };
  }
};

// Hàm xử lý khi phương thức vận chuyển thay đổi
const handleShippingMethodChange = (method) => {
  if (method === 'delivery') {
    fillDefaultDeliveryAddress(); // Gọi hàm điền địa chỉ khi chuyển sang giao hàng
  } else {
    // Nếu chuyển sang "Tại quầy", reset thông tin giao hàng
    currentDeliveryInfo.value = {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHang: '',
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
  if (newActiveTabId !== null && currentShippingMethod.value === 'delivery') {
    fillDefaultDeliveryAddress();
  }
});

// Watch khi khách hàng của đơn hàng active thay đổi
watch(currentActiveOrderCustomer, (newCustomer) => {
  if (currentShippingMethod.value === 'delivery') {
    fillDefaultDeliveryAddress();
  }
}, { deep: true });

const moPopupChonKhachHang = () => {
  hienThiThemKhachHangPopup.value = true;
};

const nhanKhachHangTuPopup = (khachHangDuocChon) => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.khachHang = { ...khachHangDuocChon };
    // Khi chọn khách hàng, tự động điền tên và số điện thoại vào deliveryInfo
    activeOrder.deliveryInfo.tenNguoiNhan = khachHangDuocChon.tenKhachHang ?? '';
    activeOrder.deliveryInfo.soDienThoaiNguoiNhan = khachHangDuocChon.soDienThoai ?? '';

    if (activeOrder.shippingMethod === 'delivery') {
      fillDefaultDeliveryAddress();
    }
  }
  hienThiThemKhachHangPopup.value = false;
};

const clearSelectedCustomer = () => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.khachHang = null;
    activeOrder.deliveryInfo = {
      tenNguoiNhan: '',
      soDienThoaiNguoiNhan: '',
      diaChiGiaoHang: '',
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    };
  }
  if (currentShippingMethod.value === 'delivery') {
    fillDefaultDeliveryAddress();
  }
};

// --- Logic cho popup chọn địa chỉ khác ---
const moPopupChonDiaChi = () => {
  if (!currentActiveOrderCustomer.value || !currentActiveOrderCustomer.value.id) {
    alert("Vui lòng chọn khách hàng trước khi chọn địa chỉ!");
    return;
  }
  hienThiChonDiaChiPopup.value = true;
};

// Hàm nhận địa chỉ đã chọn từ popup
const nhanDiaChiTuPopup = (diaChiDuocChon) => {
    if (diaChiDuocChon) {
        currentDeliveryInfo.value = {
            // Ưu tiên thông tin từ địa chỉ được chọn, nếu không có thì lấy từ khách hàng hiện tại
            tenNguoiNhan: diaChiDuocChon.tenNguoiNhan || currentActiveOrderCustomer.value.tenKhachHang || '',
            soDienThoaiNguoiNhan: diaChiDuocChon.soDienThoaiNguoiNhan || currentActiveOrderCustomer.value.soDienThoai || '',
            diaChiGiaoHang: [ // Cập nhật địa chỉ tổng hợp
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
const updateCombinedAddress = () => {
  const info = currentDeliveryInfo.value;
  const parts = [];
  // Thứ tự này quan trọng để tạo chuỗi địa chỉ dễ đọc
  if (info.diaChiChiTiet) parts.push(info.diaChiChiTiet);
  if (info.xaPhuong) parts.push(info.xaPhuong);
  if (info.quanHuyen) parts.push(info.quanHuyen);
  if (info.tinhThanhPho) parts.push(info.tinhThanhPho);

  currentDeliveryInfo.value.diaChiGiaoHang = parts.filter(part => part).join(', ');
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
      <!-- // Phần thông tin Khách hàng -->
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

            <div v-if="currentActiveOrderCustomer">
              <div class="mb-2"><strong>Tên khách hàng:</strong> {{ currentActiveOrderCustomer.tenKhachHang }}</div>
              <div class="mb-2"><strong>Số điện thoại:</strong> {{ currentActiveOrderCustomer.soDienThoai }}</div>
              <div class="mb-2"><strong>Email:</strong> {{ currentActiveOrderCustomer.email || 'Chưa cập nhật' }}</div>
              <div class="mb-2"><strong>Giới tính:</strong> {{ currentActiveOrderCustomer.gioiTinh ? 'Nam' : 'Nữ' }}</div>
              <button class="btn btn-sm btn-outline-danger mt-2" @click="clearSelectedCustomer">Bỏ chọn khách hàng</button>
            </div>
            <div v-else class="text-muted">Chưa có khách hàng nào được chọn cho đơn hàng này.</div>

            <ThemKhachHangHoaDon v-if="hienThiThemKhachHangPopup" :currentSelectedCustomer="currentActiveOrderCustomer"
              @customerSelected="nhanKhachHangTuPopup" @close="hienThiThemKhachHangPopup = false" />
          </div>
        </div>
        <!-- Phần thông tin giao hàng và địa chỉ của khách hàng -->
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
                    v-model="currentShippingMethod">
                  <label class="form-check-label" for="shippingDirect">Tại quầy</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" id="shippingDelivery" value="delivery"
                    v-model="currentShippingMethod">
                  <label class="form-check-label" for="shippingDelivery">Giao hàng</label>
                </div>
              </div>
            </div>

            <div v-if="currentShippingMethod === 'delivery'">
              <div class="mb-3">
                <label for="recipientName" class="form-label">Tên người nhận:</label>
                <input type="text" id="recipientName" class="form-control" v-model="currentDeliveryInfo.tenNguoiNhan" placeholder="Nhập tên người nhận">
              </div>
              <div class="mb-3">
                <label for="recipientPhone" class="form-label">Số điện thoại người nhận:</label>
                <input type="text" id="recipientPhone" class="form-control" v-model="currentDeliveryInfo.soDienThoaiNguoiNhan" placeholder="Nhập số điện thoại người nhận">
              </div>

              <div v-if="currentActiveOrderCustomer && currentDeliveryInfo.diaChiGiaoHang" class="alert alert-info py-2" role="alert">
                  <p class="mb-1"><strong>Địa chỉ giao hàng:</strong></p>
                  <p class="mb-1">
                      {{ currentDeliveryInfo.diaChiGiaoHang }}
                  </p>
                  <button class="btn btn-sm btn-link p-0" @click="moPopupChonDiaChi">Chọn địa chỉ khác</button>
              </div>
              <div v-else class="alert alert-warning py-2" role="alert">
                  <p class="mb-1">Chưa có địa chỉ giao hàng được chọn.</p>
                  <button class="btn btn-sm btn-link p-0" @click="moPopupChonDiaChi">Chọn địa chỉ</button>
              </div>

              <ChonDiaChiPopup
                  v-if="hienThiChonDiaChiPopup"
                  :khachHangId="currentActiveOrderCustomer?.id"
                  @diaChiSelected="nhanDiaChiTuPopup"
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