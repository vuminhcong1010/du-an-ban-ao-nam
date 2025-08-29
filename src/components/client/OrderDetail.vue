<template>
  <div class="order-detail-container">
    <div class="back-button-container">
      <button @click="$router.go(-1)" class="btn-back">
        <i class="fas fa-arrow-left"></i>  Đơn mua / Chi tiết đơn mua {{ order.maHoaDon }}
      </button>
    </div>

    <div class="order-status-bar">
      <span :class="{ active: order.trangThai === 0 }">Chờ xác nhận</span>
      <span :class="{ active: order.trangThai === 1 || order.trangThai > 1 }">Chờ giao hàng</span>
      <span :class="{ active: order.trangThai === 2 || order.trangThai > 2 }">Đang vận chuyển</span>
      <span :class="{ active: order.trangThai === 3 || order.trangThai > 3 }">Đã giao hàng</span>
      <span :class="{ active: order.trangThai === 4 }">Hoàn thành</span>
      <span :class="{ active: order.trangThai === 5 }">Đã hủy</span>
    </div>

    <div class="order-info-grid">
      <div class="invoice-info">
        <h3>Thông tin hóa đơn {{ order.maHoaDon }}</h3>
        <p><strong>Ngày đặt:</strong> {{ formatDate(order.ngayDat) }}</p>
        <p><strong>Trạng thái:</strong> <span :class="getStatusClass(order.trangThai)">{{ getStatusText(order.trangThai) }}</span></p>
        <p><strong>Loại hóa đơn:</strong> {{ order.loaiHoaDon || 'Online' }}</p>
        <p><strong>Ghi chú:</strong> {{ order.ghiChu || 'Không có' }}</p>
      </div>

      <div class="shipping-info">
        <h3>Thông tin nhận hàng <span class="change-address-link">THAY ĐỔI ĐỊA CHỈ</span></h3>
        <p><strong>Tên người nhận:</strong> {{ order.tenNguoiNhan || 'N/A' }}</p>
        <p><strong>SĐT người nhận:</strong> {{ order.sdtNguoiNhan || 'N/A' }}</p>
        <p><strong>Email người nhận:</strong> {{ order.email || 'N/A' }}</p>
        <p><strong>Địa chỉ người nhận:</strong> {{ order.diaChiNguoiNhan || 'N/A' }}</p>
      </div>
    </div>

    <div class="customer-info-block">
      <h3>Thông tin khách hàng</h3>
      <p>{{ order.maKhachHang || 'N/A' }} - {{ order.tenKhachHang || 'N/A' }} - {{ order.soDienThoai || 'N/A' }}</p>
    </div>

    <div class="product-list-detail">
        <h3>Sản phẩm</h3>
        <ul v-if="order.danhSachSanPham && order.danhSachSanPham.length > 0" class="order-items-list-detail">
            <li v-for="item in order.danhSachSanPham" :key="item.idHoaDonChiTiet">
                <div class="item-info-detail">
                    <img :src="item.duongDanAnh" alt="Product Image" class="product-thumbnail">
                    <div class="product-details">
                        <span>{{ item.tenSanPham }} ({{ item.tenKichCo }} / {{ item.tenMau }})</span>
                        <span>Số lượng: {{ item.soLuong }}</span>
                        <span>Giá: {{ formatCurrency(item.giaBanTaiThoiDiem) }}</span>
                        <span>Thành tiền: {{ formatCurrency(item.thanhTien) }}</span>
                    </div>
                </div>
                <div class="item-actions-detail">
                    <button
                        v-if="order.trangThai === 0"
                        @click="confirmUpdateOrderItem(order.id, item.idHoaDonChiTiet, item.soLuong)"
                        class="btn btn-sm btn-edit">Cập nhật SL
                    </button>
                    <button
                        v-if="order.trangThai === 0"
                        @click="confirmDeleteOrderItem(order.id, item.idHoaDonChiTiet)"
                        class="btn btn-sm btn-delete">Xóa
                    </button>
                </div>
            </li>
        </ul>
        <p v-else class="no-items-message">Không có sản phẩm nào trong đơn hàng này.</p>
    </div>

    <div class="payment-history-block">
        <h3>Lịch sử thanh toán</h3>
        <p>Hiện tại không có thông tin lịch sử thanh toán.</p>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const order = ref({});



// --- Helper Functions (Duplicated from OrderHistory for self-containment) ---
const getUserId = () => {
  let userId = null;
  const userIdFromStorage = localStorage.getItem('userId');
  if (userIdFromStorage) {
    userId = parseInt(userIdFromStorage);
  } else {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      userId = loggedInUser ? loggedInUser.id : null;
    } catch (e) {
      console.error('Lỗi khi parse loggedInUser từ localStorage:', e);
    }
  }
  console.log('User ID đã lấy từ localStorage (OrderDetail):', userId);
  return userId;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  } catch (e) {
    return dateString;
  }
};

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '0 VND';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

const getStatusText = (status) => {
  switch (status) {
    case 0: return 'Chờ xác nhận';
    case 1: return 'Chờ giao hàng';
    case 2: return 'Đang vận chuyển';
    case 3: return 'Đã giao hàng';
    case 4: return 'Hoàn thành';
    case 5: return 'Đã hủy';
    default: return 'Không xác định';
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'status-pending';
    case 1: return 'status-confirmed';
    case 2: return 'status-shipping';
    case 3: return 'status-delivered';
    case 4: return 'status-completed';
    case 5: return 'status-cancelled';
    default: return '';
  }
};
// --- End Helper Functions ---

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/client/orders',
  headers: {
    'Content-Type': 'application/json'
  }
});

const fetchOrderDetail = async () => {
  const id = route.params.id;
  const userId = getUserId();

  if (userId === null) {
    alert("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem chi tiết đơn hàng.");
    router.push('/login');
    return;
  }

  try {
    const res = await apiClient.get(`/${id}`, {
      headers: { 'X-User-ID': userId }
    });
    if (res.data && res.data.data) {
      order.value = res.data.data;
      console.log('Order Detail Data:', order.value);
    } else {
      alert(res.data.message || 'Không tìm thấy chi tiết đơn hàng.');
      router.go(-1);
    }
  } catch (error) {
    console.error('Lỗi khi tải chi tiết đơn hàng:', error);
    alert(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
    router.go(-1);
  }
};

// Condition changed to order.trangThai === 0
const confirmUpdateOrderItem = async (orderId, hoaDonChiTietId, currentQuantity) => {
  if (order.value.trangThai !== 0) {
    alert("Chỉ có thể cập nhật số lượng khi đơn hàng ở trạng thái 'Chờ xác nhận'.");
    return;
  }

  const newQuantityStr = prompt(`Nhập số lượng mới cho sản phẩm (hiện tại: ${currentQuantity}):`, currentQuantity);
  if (newQuantityStr === null || newQuantityStr.trim() === '') {
    return;
  }

  const newQuantity = parseInt(newQuantityStr);
  if (isNaN(newQuantity) || newQuantity <= 0) {
    alert("Số lượng không hợp lệ. Vui lòng nhập một số nguyên dương.");
    return;
  }

  const userId = getUserId();
  if (userId === null) {
    alert("Bạn chưa đăng nhập.");
    return;
  }

  try {
    const requestBody = {
      idHoaDon: orderId,
      chiTietHoaDonId: hoaDonChiTietId,
      soLuong: newQuantity
    };
    const response = await apiClient.put('/update-item-quantity', requestBody, {
      headers: { 'X-User-ID': userId }
    });
    alert(response.data.message);
    await fetchOrderDetail();
  } catch (err) {
    console.error('Lỗi khi cập nhật số lượng sản phẩm:', err);
    alert(err.response?.data?.message || 'Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại sau.');
  }
};

// Condition changed to order.trangThai === 0
const confirmDeleteOrderItem = async (orderId, hoaDonChiTietId) => {
  if (order.value.trangThai !== 0) {
    alert("Chỉ có thể xóa sản phẩm khi đơn hàng ở trạng thái 'Chờ xác nhận'.");
    return;
  }
  if (confirm(`Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng không?`)) {
    const userId = getUserId();
    if (userId === null) {
      alert("Bạn chưa đăng nhập.");
      return;
    }
    try {
      const response = await apiClient.delete(`/delete-item/${hoaDonChiTietId}`, {
        headers: { 'X-User-ID': userId }
      });
      alert(response.data.message);
      await fetchOrderDetail();
    } catch (err) {
      console.error('Lỗi khi xóa sản phẩm khỏi đơn hàng:', err);
      alert(err.response?.data?.message || 'Không thể xóa sản phẩm khỏi đơn hàng. Vui lòng thử lại sau.');
    }
  }
};

onMounted(() => {
  fetchOrderDetail();
});
</script>

<style scoped>
/* Keep existing styles */
.order-detail-container {
  width: 100%;
  margin: 0 auto;
  padding: 25px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: #f0f2f5;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
  margin-top: 80px; /* Adjusted for header overlap */
}

.back-button-container {
    margin-bottom: 20px;
    display: flex;
    align-items: center;
}

.btn-back {
    background: none;
    border: none;
    font-size: 1.1em;
    color: #3498db;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 5px;
    transition: background-color 0.2s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
}

.btn-back:hover {
    background-color: #eaf6ff;
    color: #2980b9;
}

.btn-back i {
    font-size: 1em;
}

/* Order Status Bar */
.order-status-bar {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin: 20px 0;
  background-color: #ffffff;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
  overflow-x: auto;
  white-space: nowrap;
  border: 1px solid #e1e4e8;
}

.order-status-bar span {
  flex: 1;
  text-align: center;
  padding: 10px 15px;
  border-radius: 25px;
  background: #f8f9fa;
  color: #777;
  font-weight: 500;
  transition: all 0.3s ease;
  font-size: 0.9em;
  position: relative;
}

.order-status-bar span.active {
  background: #3498db;
  color: white;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
}

.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 30px;
  margin-top: 25px;
}

.invoice-info,
.shipping-info,
.customer-info-block,
.product-list-detail,
.payment-history-block {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  border: 1px solid #e1e4e8;
}

.invoice-info h3,
.shipping-info h3,
.customer-info-block h3,
.product-list-detail h3,
.payment-history-block h3 {
  color: #34495e;
  font-size: 1.4em;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.customer-info-block {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  border: 1px solid #e1e4e8;
  margin-top: 25px; /* <-- THÊM DÒNG NÀY ĐỂ TẠO KHOẢNG CÁCH ĐỀU */
}

.payment-history-block {
  background: #fff;
  padding: 25px;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  border: 1px solid #e1e4e8;
  margin-top: 25px; /* <-- THÊM DÒNG NÀY ĐỂ TẠO KHOẢNG CÁCH ĐỀU */
}

.invoice-info p,
.shipping-info p,
.customer-info-block p,
.payment-history-block p {
  margin-bottom: 8px;
  color: #555;
  font-size: 1em;
}

.invoice-info p strong,
.shipping-info p strong,
.customer-info-block p strong,
.payment-history-block p strong {
  color: #2c3e50;
}

.change-address-link {
    font-size: 0.8em;
    color: #3498db;
    cursor: pointer;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    transition: color 0.2s ease;
}

.change-address-link:hover {
    color: #2980b9;
    text-decoration: underline;
}

/* Product List in Detail */
.product-list-detail {
    margin-top: 30px;
}

.order-items-list-detail {
    list-style: none;
    padding: 0;
}

.order-items-list-detail li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 15px;
    padding: 15px 0;
    border-bottom: 1px dashed #eee;
}

.order-items-list-detail li:last-child {
    border-bottom: none;
}

.item-info-detail {
    display: flex;
    align-items: center;
    gap: 15px;
    flex-grow: 1;
}

.product-thumbnail {
    width: 80px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
}

.product-details {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
}

.product-details span {
    margin-bottom: 4px;
    color: #333;
    font-size: 0.95em;
}

.product-details span:first-child {
    font-weight: 600;
    color: #2c3e50;
}

.item-actions-detail {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
}

/* Small buttons for update/delete */
.btn-sm {
    padding: 6px 12px;
    font-size: 0.8em;
    font-weight: 500;
    border-radius: 4px;
}

.btn-edit {
    background-color: #f1c40f;
    color: #333;
}
.btn-edit:hover {
    background-color: #f39c12;
}

.btn-delete {
    background-color: #e74c3c;
    color: white;
}
.btn-delete:hover {
    background-color: #c0392b;
}

/* Status styling */
.status-pending { color: #f39c12; font-weight: bold; }
.status-confirmed { color: #2980b9; font-weight: bold; }
.status-shipping { color: #8e44ad; font-weight: bold; }
.status-delivered { color: #27ae60; font-weight: bold; }
.status-cancelled { color: #e74c3c; font-weight: bold; }
.status-completed { color: #16a085; font-weight: bold; }

/* Responsive adjustments */
@media (max-width: 768px) {
  .order-info-grid {
    grid-template-columns: 1fr;
  }
  .order-status-bar {
    justify-content: flex-start;
  }
  .order-items-list-detail li {
      flex-direction: column;
      align-items: flex-start;
  }
  .item-actions-detail {
      width: 100%;
      justify-content: flex-end;
      margin-top: 10px;
  }
}
</style>