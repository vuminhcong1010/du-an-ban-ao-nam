<script setup>
import { ref, watch } from "vue";
import { Tag, Ban, TicketPercent } from "lucide-vue-next";
import PhieuGiamGiaBH from "./PhieuGiamGiaBH.vue";
import axios from "axios";
import Cookies from 'js-cookie';

const token = Cookies.get('token');

const props = defineProps({
  order: Object,
  activeTab: Number,
  orders: Array,
});

const hienThiPhieuGiamGia = ref(false);
const errorMessage = ref("");

const moPopupPhieuGiamGia = () => {
  hienThiPhieuGiamGia.value = true;
};

const nhanPhieuGiamGiaDaChon = async (phieu) => {
  try {
    // Assign the selected voucher to the order
    props.order.giamGia = { ...phieu }; // Create a copy to avoid mutating the original
    errorMessage.value = "";

    // // Call API to decrease voucher quantity
    // if (phieu && phieu.id) {
    //   await axios.put(`http://localhost:8080/ban_hang/phieuGG/decrease/${phieu.id}`, {}, {
    //     headers: {
    //       Authorization: `Bearer ${token}`,
    //     },
    //   });
    //   // Update the quantity in the frontend
    //   // props.order.giamGia.soLuong -= 1;
    //   console.log(`Decreased voucher quantity for ID: ${phieu.id}, new quantity: ${props.order.giamGia.soLuong}`);
    // }

    // Update discount and total
    capNhatTienGiamVaTongTien();
    hienThiPhieuGiamGia.value = false;

    // Save updated orders to localStorage
    localStorage.setItem("orders", JSON.stringify(props.orders));
  } catch (error) {
    console.error("Error decreasing voucher quantity:", error.response?.data || error.message);
    errorMessage.value = "Không thể áp dụng phiếu giảm giá.";
    props.order.giamGia = null;
    capNhatTienGiamVaTongTien();
  }
};

const validateMaGiamGia = async (maGiamGia) => {
  if (!maGiamGia) {
    props.order.giamGia = null;
    capNhatTienGiamVaTongTien();
    errorMessage.value = "";
    return;
  }

  const idKhachHang = props.order.khachHang?.idKhachHang;
  try {
    const url = idKhachHang && !isNaN(idKhachHang) && idKhachHang > 0
      ? `http://localhost:8080/ban_hang/phieuGG/validate/${maGiamGia}?khachHangId=${idKhachHang}`
      : `http://localhost:8080/ban_hang/phieuGG/validate/${maGiamGia}`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    props.order.giamGia = response.data;
    capNhatTienGiamVaTongTien();
    errorMessage.value = "";
  } catch (error) {
    console.error("Error validating voucher:", error.response?.data || error.message);
    errorMessage.value = error.response?.data?.message || "Mã giảm giá không hợp lệ hoặc không tồn tại.";
    props.order.giamGia = null;
    capNhatTienGiamVaTongTien();
  }
};

const huyChonPhieuGiamGia = async () => {
  try {
 

    // Clear the selected voucher
    props.order.giamGia = null;
    errorMessage.value = "";
    capNhatTienGiamVaTongTien();

    // Save updated orders to localStorage
    localStorage.setItem("orders", JSON.stringify(props.orders));
  } catch (error) {
    console.error("Error restoring voucher quantity:", error.response?.data || error.message);
    errorMessage.value = "Không thể hủy phiếu giảm giá.";
  }
};

const formatCurrency = (val) => {
  return val ? val.toLocaleString("vi-VN") + " VNĐ" : "";
};

const capNhatTienGiamVaTongTien = () => {
  const tongTien = props.order.tongTienSanPham || 0;
  const giamGia = props.order.giamGia;
  const phiVanChuyen = props.order.phiVanChuyen || 0;

  let soTienGiam = 0;

  if (giamGia && tongTien >= giamGia.giamToiThieu) {
    if (giamGia.phamTramGiamGia) {
      soTienGiam = (tongTien * giamGia.phamTramGiamGia) / 100;
    } else if (giamGia.soTienGiam) {
      soTienGiam = giamGia.soTienGiam;
    }
    if (giamGia.giamToiDa && soTienGiam > giamGia.giamToiDa) {
      soTienGiam = giamGia.giamToiDa;
    }
  }

  props.order.soTienGiam = Math.floor(soTienGiam);
  props.order.tongTien = tongTien + phiVanChuyen - props.order.soTienGiam;
};

// Hàm chọn phiếu giảm giá có giá trị cao nhất
const chonPhieuGiamGiaCaoNhat = async () => {
  const idKhachHang = props.order.khachHang?.idKhachHang;
  try {
    let response;
    if (idKhachHang && !isNaN(idKhachHang) && idKhachHang > 0) {
      response = await axios.get(`http://localhost:8080/ban_hang/phieuGG/khachHang/${idKhachHang}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    } else {
      response = await axios.get(`http://localhost:8080/ban_hang/phieuGG?loaiPhieu=Công khai`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
    }

    const vouchers = response.data;
    if (vouchers.length === 0) {
      props.order.giamGia = null;
      errorMessage.value = "Không có phiếu giảm giá hợp lệ.";
      capNhatTienGiamVaTongTien();
      return;
    }

    // Tìm phiếu giảm giá có giá trị cao nhất
    const bestVoucher = vouchers.reduce((best, current) => {
      if (current.trangThai !== 1 || current.soLuong <= 0) return best;

      const currentValue = current.phamTramGiamGia
        ? current.phamTramGiamGia
        : current.soTienGiam || 0;

      const bestValue = best ? (best.phamTramGiamGia ? best.phamTramGiamGia : best.soTienGiam || 0) : -1;

      return currentValue > bestValue ? current : best;
    }, null);

    props.order.giamGia = bestVoucher;
    errorMessage.value = bestVoucher ? "" : "Không tìm thấy phiếu giảm giá phù hợp.";
    capNhatTienGiamVaTongTien();
  } catch (error) {
    console.error("Error fetching best voucher:", error.response?.data || error.message);
    errorMessage.value = "Không thể tải phiếu giảm giá.";
    props.order.giamGia = null;
    capNhatTienGiamVaTongTien();
  }
};

// Theo dõi thay đổi của khachHangId và listSanPham
watch(
  () => props.order.khachHang?.idKhachHang,
  () => {
    chonPhieuGiamGiaCaoNhat();
  },
  { immediate: true }
);

watch(
  () => props.order.listSanPham,
  () => {
    if (!props.order.khachHang?.idKhachHang) {
      chonPhieuGiamGiaCaoNhat();
    }
  },
  { deep: true }
);

watch(() => props.order.giamGia, capNhatTienGiamVaTongTien, { deep: true });
watch(() => props.order.tongTienSanPham, capNhatTienGiamVaTongTien);
watch(() => props.order.phiVanChuyen, capNhatTienGiamVaTongTien);
</script>

<template>
  <div class="bg-white p-3 rounded mb-4 align-items-center border">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">💳 Thanh toán</h5>
    </div>

    <div class="d-flex align-items-center gap-3 mb-3">
      <label class="fw-bold mb-0">Mã giảm giá:</label>
      <input
        type="text"
        :value="order.giamGia?.maPhieuGiamGia || ''"
        class="form-control"
        style="max-width: 250px"
        placeholder="Nhập mã giảm giá..."
        @input="validateMaGiamGia($event.target.value)"
        @blur="validateMaGiamGia($event.target.value)"
        @keyup.enter="validateMaGiamGia($event.target.value)"
      />
      <button
        class="btn border rounded-circle d-flex align-items-center justify-content-center"
        style="width: 36px; height: 36px; background-color: #0a2c57; color: white"
        title="Áp dụng mã giảm giá"
        @click="moPopupPhieuGiamGia"
      >
        <Tag size="18" />
      </button>
      <button
        class="btn border rounded-circle d-flex align-items-center justify-content-center"
        style="width: 36px; height: 36px; background-color: #0a2c57; color: white"
        title="Hủy chọn"
        @click="huyChonPhieuGiamGia"
      >
        <Ban size="18" />
      </button>
    </div>

    <div v-if="errorMessage" class="text-danger mb-3">
      {{ errorMessage }}
    </div>

    <div
      v-if="order.giamGia"
      class="d-flex align-items-center justify-content-between border rounded p-2 mb-3"
      style="background-color: #f8f9fa"
    >
      <div class="d-flex align-items-center gap-2">
        <TicketPercent size="24" class="text-success" />
        <div>
          <div>
            <strong>Mã phiếu {{ order.giamGia.maPhieuGiamGia }}</strong>
          </div>
          <div class="text-muted small">
            Giá trị giảm:
            <strong>{{
              order.giamGia.phamTramGiamGia
                ? order.giamGia.phamTramGiamGia + "%"
                : formatCurrency(order.giamGia.soTienGiam)
            }}</strong>
            | Giá trị tối thiểu:
            <strong>{{ formatCurrency(order.giamGia.giamToiThieu) }}</strong> |
            Giá trị tối đa:
            <strong>{{ formatCurrency(order.giamGia.giamToiDa) }}</strong>
          </div>
          <div class="text-danger small">
            (Đang sử dụng) Phiếu {{ order.giamGia.loaiPhieu }} - Còn lại:
            <strong>{{ order.giamGia.soLuong }}</strong>
          </div>
        </div>
      </div>
    </div>

    <PhieuGiamGiaBH
      v-if="hienThiPhieuGiamGia"
      :khachHangId="order.khachHang?.idKhachHang"
      :selectedPhieu="order.giamGia"
      @selected="nhanPhieuGiamGiaDaChon"
      @close="hienThiPhieuGiamGia = false"
    />
  </div>
</template>