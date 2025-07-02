<script setup>
import { ref } from "vue";
import { Plus, UserCog } from "lucide-vue-next";
import ThemSanPham from "./ThemSanPhamHoaDon.vue";

const orders = ref([]);
const activeTab = ref(null);
let nextOrderId = 1;

const hienThiThemSanPham = ref(false);

function createNewOrder() {
  const newOrder = {
    id: nextOrderId++,
    name: `Đơn ${nextOrderId - 1}`,
    items: [],
    customer: null,
  };
  orders.value.push(newOrder);
  activeTab.value = newOrder.id;
}

function closeOrder(id) {
  orders.value = orders.value.filter((o) => o.id !== id);
  if (activeTab.value === id) {
    activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
  }
}

const moPopupThemSanPham = () => {
  hienThiThemSanPham.value = true;
};

const nhanSanPhamDaChon = (danhSachSanPham) => {
  const activeOrder = orders.value.find((o) => o.id === activeTab.value);
  if (activeOrder) {
    activeOrder.items.push(...danhSachSanPham);
  }
};
</script>

<template>
  <!-- Header -->
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
  <!-- Tabs -->
  <ul class="nav nav-tabs">
    <li class="nav-item" v-for="order in orders" :key="order.id">
      <a
        class="nav-link"
        :class="{ active: order.id === activeTab }"
        href="#"
        @click.prevent="activeTab = order.id"
      >
        {{ order.name }}
        <span class="ms-1 text-danger" @click.stop="closeOrder(order.id)"
          >×</span
        >
      </a>
    </li>
  </ul>

  <!-- Nếu không có đơn hàng nào -->
  <div v-if="orders.length === 0" class="text-center mt-5">
    <img
      src="https://web.nvnstatic.net/tp/T0213/img/tmp/cart-empty.png?v=9"
      alt="No orders"
      width="170"
    />
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
      <h6>Chi tiết {{ order.name }}</h6>
      <!-- Tại đây hiển thị danh sách sản phẩm, khách hàng,... -->
      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">🛒 Giỏ hàng</h5>
          <button
            class="btn border rounded-circle d-flex align-items-center justify-content-center"
            style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            "
            @click="moPopupThemSanPham"
            title="Thêm sản phẩm"
          >
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
                <tr v-for="(item, index) in order.items" :key="index">
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
        <ThemSanPham
          v-if="hienThiThemSanPham"
          :maHoaDon="activeTab"
          @selected="nhanSanPhamDaChon"
          @close="hienThiThemSanPham = false"
        />
      </div>
      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">👤 Khách hàng</h5>
          <button
            class="btn border rounded-circle d-flex align-items-center justify-content-center"
            style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            "
            
            title="Chọn khách hàng"
          >
            <UserCog size="20" />
          </button>
        </div>
        <span>Tên khách hàng: </span> <br>
        <span>Số điện thoại: </span> 0366166359 <br>
        <span>Địa chỉ nhận hàng: Nguyễn Cơ Thạch, Mỹ Đình 2, Nam Từ Liêm</span>
      </div>

      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">💳 Thanh toán</h5>
          <button
            class="btn border rounded-circle d-flex align-items-center justify-content-center"
            style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            "
            title="Chọn khách hàng"
          >
            <UserCog size="20" />
          </button>
        </div>
        <span>Ma giam gia:</span>
        <input type="text"> <button style="">🏷️</button>
      </div>
    </div>
  </div>
</template>