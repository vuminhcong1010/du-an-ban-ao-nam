<script setup>
import { ref, watch, computed  } from "vue";
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
    };

    orders.value.push(newOrder);
    activeTab.value = newOrder.id;
  } catch (error) {
    console.error("Lỗi tạo hóa đơn:", error);
  }
}

function closeOrder(id) {
  orders.value = orders.value.filter((o) => o.id !== id);
  if (activeTab.value === id) {
    activeTab.value = orders.value.length > 0 ? orders.value[0].id : null;
  }
}

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
    localStorage.setItem("orders", JSON.stringify(newVal));
  },
  { deep: true }
);

watch(activeTab, (newVal) => {
  localStorage.setItem("activeTab", JSON.stringify(newVal));
});
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
    </div>
  </div>
</template>