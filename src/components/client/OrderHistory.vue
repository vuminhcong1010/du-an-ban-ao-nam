<template>
  <div class="order-history-container">
    <h1>Lịch sử đặt hàng</h1>

    <p v-if="error" class="error-message">{{ error }}</p>

    <p v-if="loading" class="loading-message">Đang tải lịch sử đơn hàng...</p>

    <div v-if="paginatedOrders.length > 0" class="order-list">
      <div v-for="order in paginatedOrders" :key="order.id" class="order-card">
        <div class="card-header">
          <h3>Mã đơn hàng: {{ order.maHoaDon }}</h3>
          <p><strong>Trạng thái:</strong> <span :class="getStatusClass(order.trangThai)">{{ getStatusText(order.trangThai) }}</span></p>
        </div>

        <div class="product-summary" v-if="order.danhSachSanPham && order.danhSachSanPham.length > 0">
          <div v-for="item in order.danhSachSanPham" :key="item.idHoaDonChiTiet" class="product-item">
            <div class="item-thumbnail">
              <img :src="item.duongDanAnh" alt="Product Image" />
            </div>
            <div class="item-details">
              <h4>{{ item.tenSanPham }}</h4>
              <p>Màu sắc: {{ item.tenMau }} | Kích thước: {{ item.tenKichCo }}</p>
              <p>Số lượng: {{ item.soLuong }}</p>
              <p v-if="item.giaBanTaiThoiDiem < item.thanhTien / item.soLuong">
                  <span class="original-price">{{ formatCurrency(item.thanhTien / item.soLuong) }}</span>
              </p>
            </div>
            <div class="item-price">
              <span>{{ formatCurrency(item.giaBanTaiThoiDiem) }}</span>
            </div>
          </div>
        </div>
        <p v-else class="no-items-message-card">Đơn hàng này chưa có sản phẩm nào.</p>

        <div class="card-footer">
          <p class="total-amount"><strong>Thành tiền:</strong> {{ formatCurrency(order.tongTien) }}</p>
          <div class="order-actions">
            <button @click="$router.push(`/coolmen/order/${order.id}`)" class="btn btn-primary">Xem đơn hàng</button>
            <button v-if="order.trangThai === 0" @click="confirmCancelOrder(order.id)" class="btn btn-danger">Hủy đơn hàng</button>
          </div>
        </div>
      </div>
    </div>
    
    <div v-if="totalPages > 1" class="pagination-controls">
      <button @click="prevPage" :disabled="currentPage === 1" class="pagination-btn">Trang trước</button>
      <span>Trang {{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage === totalPages" class="pagination-btn">Trang sau</button>
    </div>

    <div v-else-if="!loading && orders.length === 0">
      <p class="no-orders-message">Hiện tại bạn chưa có đơn hàng nào.</p>
    </div>

    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Các biến hiện có
const orders = ref([]);
const loading = ref(true);
const error = ref(null);
const showDetailModal = ref(false);
const selectedOrder = ref(null);
const router = useRouter();

// Các biến mới cho Phân trang
const currentPage = ref(1); // Trang hiện tại, bắt đầu từ trang 1
const itemsPerPage = 5; // Số lượng đơn hàng trên mỗi trang

const apiClient = axios.create({
  baseURL: 'http://localhost:8080/client/orders',
  headers: {
    'Content-Type': 'application/json'
  }
});

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
  console.log('User ID đã lấy từ localStorage:', userId);
  return userId;
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

const fetchOrderHistory = async () => {
  loading.value = true;
  error.value = null;

  const userId = getUserId();

  if (userId === null) {
    error.value = "Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử đơn hàng.";
    loading.value = false;
    return;
  }

  try {
    const response = await apiClient.get('/history', {
      headers: {
        'X-User-ID': userId
      }
    });

    if (response.data && response.data.data) {
      // Sắp xếp đơn hàng theo ngày đặt mới nhất
      orders.value = response.data.data.sort((a, b) => new Date(b.ngayDat) - new Date(a.ngayDat));
      console.log('Fetched orders:', orders.value);
    } else {
      orders.value = [];
      error.value = response.data.message || 'Không tìm thấy dữ liệu đơn hàng.';
    }
  } catch (err) {
    console.error('Lỗi khi lấy lịch sử đơn hàng:', err);
    if (err.response) {
      error.value = err.response.data.message || 'Lỗi từ máy chủ khi tải lịch sử đơn hàng.';
    } else if (err.request) {
      error.value = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng hoặc thử lại sau.';
    } else {
      error.value = 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.';
    }
  } finally {
    loading.value = false;
  }
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

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedOrder.value = null;
};

const confirmCancelOrder = (orderId) => {
  if (confirm(`Bạn có chắc chắn muốn hủy đơn hàng #${orderId} này không? Hành động này không thể hoàn tác.`)) {
    cancelOrder(orderId);
  }
};

const cancelOrder = async (orderId) => {
  const userId = getUserId();
  if (userId === null) {
    alert("Bạn chưa đăng nhập.");
    return;
  }
  try {
    const response = await apiClient.post(`/cancel/${orderId}`, {}, {
      headers: { 'X-User-ID': userId }
    });
    alert(response.data.message);
    fetchOrderHistory();
  } catch (err) {
    console.error('Lỗi khi hủy đơn hàng:', err);
    alert(err.response?.data?.message || 'Không thể hủy đơn hàng. Vui lòng thử lại sau.');
  }
};

// Logic phân trang
const totalPages = computed(() => {
  return Math.ceil(orders.value.length / itemsPerPage);
});

const paginatedOrders = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return orders.value.slice(start, end);
});

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

onMounted(() => {
  fetchOrderHistory();
});
</script>

<style scoped>
/* Keep existing styles */
.order-history-container {
  width: 100%; /* Đã thay đổi */
  margin: 0 auto;
  padding: 25px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  /* background-color: #f0f2f5;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08); */
  margin-top: 5px; /* Adjusted for header overlap */
}



h1 {
  text-align: center;
  color: #0a2c57;
  margin-bottom: 30px;
  font-size: 2.5em;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.05);
}

.error-message {
  color: #c0392b;
  background-color: #fef0f0;
  border: 1px solid #c0392b;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 25px;
  text-align: center;
  font-weight: 600;
  animation: fadeIn 0.5s ease-out;
}

.loading-message,
.no-orders-message {
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  margin-bottom: 25px;
  padding: 10px;
  background-color: #e9ecef;
  border-radius: 5px;
}

.no-items-message-card {
  text-align: center;
  color: #8c8c8c;
  font-style: italic;
  margin-top: 15px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #eee;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background-color: #ffffff;
  border: 1px solid #e1e4e8;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.07);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.order-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
  padding-bottom: 12px;
}

.card-header h3 {
  color: #34495e;
  font-size: 1.6em;
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
  font-weight: 600;
}

.card-header p {
  margin-bottom: 0;
  font-size: 1.1em;
}

/* Product Summary Styling */
.product-summary {
  margin-bottom: 20px;
}

.product-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.item-thumbnail img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e1e4e8;
}

.item-details {
  flex-grow: 1;
}

.item-details h4 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
  color: #34495e;
}

.item-details p {
  margin: 0;
  color: #666;
  font-size: 0.95em;
}

.item-price {
  font-size: 1.2em;
  font-weight: 700;
  color: #3498db;
  text-align: right;
  min-width: 120px;
}

.item-price .original-price {
    text-decoration: line-through;
    color: #999;
    font-size: 0.9em;
    margin-left: 5px;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #ecf0f1;
}

.total-amount {
  font-size: 1.4em;
  color: #2c3e50;
  margin: 0;
}

.total-amount strong {
  font-weight: 700;
}

/* Status styling */
.status-pending { color: #f39c12; font-weight: bold; }
.status-confirmed { color: #2980b9; font-weight: bold; }
.status-shipping { color: #8e44ad; font-weight: bold; }
.status-delivered { color: #27ae60; font-weight: bold; }
.status-cancelled { color: #e74c3c; font-weight: bold; }
.status-completed { color: #16a085; font-weight: bold; }

.order-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.95em;
  font-weight: 600;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

/* Modal Styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: #ffffff;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 650px;
  position: relative;
  animation: slideIn 0.3s ease-out;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-content h2 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.8em;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.modal-content p {
  margin-bottom: 10px;
  font-size: 1em;
}

.modal-content h3 {
  color: #34495e;
  margin-top: 25px;
  margin-bottom: 15px;
  font-size: 1.4em;
  border-bottom: 1px dashed #e0e0e0;
  padding-bottom: 8px;
}

.close-button {
  position: absolute;
  top: 15px;
  right: 15px;
  background: none;
  border: none;
  font-size: 2em;
  cursor: pointer;
  color: #7f8c8d;
  transition: color 0.2s ease;
}

.close-button:hover {
  color: #34495e;
}

.order-items-list {
  list-style: none;
  padding: 0;
}

.order-items-list li {
  background-color: #fdfdfd;
  border: 1px solid #eceff1;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.03);
}

.order-items-list .item-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.95em;
  color: #333;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 20px;
}

.pagination-btn {
  background-color: #0a2c57;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1em;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #0d3e7e;
}

.pagination-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.pagination-controls span {
  font-size: 1.1em;
  color: #555;
  font-weight: 500;
}
</style>