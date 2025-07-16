<script setup>
import { ref } from "vue";
import { Tag, Ban, TicketPercent } from "lucide-vue-next";
import PhieuGiamGiaBH from "./PhieuGiamGiaBH.vue";

const props = defineProps({
  order: Object,
  activeTab: Number,
  orders: Array,
});

const hienThiPhieuGiamGia = ref(false);
const khachHangId = ref("");
const errorMessage = ref("");

const moPopupPhieuGiamGia = () => {
  if (!khachHangId.value || isNaN(khachHangId.value) || khachHangId.value <= 0) {
    alert("Vui lòng nhập ID khách hàng hợp lệ.");
    return;
  }
  hienThiPhieuGiamGia.value = true;
};

const nhanPhieuGiamGiaDaChon = (phieu) => {
  props.order.giamGia = phieu;
  errorMessage.value = "";
  hienThiPhieuGiamGia.value = false;
};

const validateMaGiamGia = async (maGiamGia) => {
  if (!khachHangId.value || isNaN(khachHangId.value) || khachHangId.value <= 0) {
    errorMessage.value = "Vui lòng nhập ID khách hàng hợp lệ.";
    return;
  }

  try {
    const response = await axios.get(
      `http://localhost:8080/ban_hang/phieuGG/validate/${maGiamGia}?khachHangId=${khachHangId.value}`
    );
    props.order.giamGia = response.data;
    errorMessage.value = "";
  } catch (error) {
    console.error("Error validating voucher:", error.response?.data || error.message);
    errorMessage.value = error.response?.data?.message || "Mã giảm giá không hợp lệ hoặc không tồn tại.";
    props.order.giamGia = null;
  }
};

const huyChonPhieuGiamGia = () => {
  props.order.giamGia = null;
  errorMessage.value = "";
};

const formatCurrency = (val) => {
  return val ? val.toLocaleString("vi-VN") + " VNĐ" : "";
};
</script>

<template>
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

    <div v-if="errorMessage" class="text-danger mb-3">
      {{ errorMessage }}
    </div>

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
            (Đang sử dụng) Phiếu {{ order.giamGia.loaiPhieu }} - Còn lại: <strong>{{ order.giamGia.soLuong }}</strong>
          </div>
        </div>
      </div>
    </div>

    <PhieuGiamGiaBH v-if="hienThiPhieuGiamGia" :khachHangId="khachHangId" :selectedPhieu="order.giamGia"
      @selected="nhanPhieuGiamGiaDaChon" @close="hienThiPhieuGiamGia = false" />
  </div>
</template>
