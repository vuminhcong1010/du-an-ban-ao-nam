<template>
  <div class="vnpay-return">
    <div class="message-box" :class="{ success: success, error: !success }">
      <h2 v-if="success">🎉 Thanh toán thành công!</h2>
      <h2 v-else>❌ Thanh toán thất bại!</h2>

      <p v-if="success">Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi.</p>
      <p v-else>Mã lỗi: {{ errorCode }}</p>
      <p v-else>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>

      <router-link
        class="back-button"
        :to="success ? { name: 'home' } : { name: 'client-Oder', params: { hoaDonId } }"
        @click="handleBackClick"
      >
        🔙 {{ success ? "Quay về trang chủ" : "Quay lại hóa đơn để thanh toán lại" }}
      </router-link>
    </div>
  </div>
</template>


<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2'

const route = useRoute();
const router = useRouter();
const toast = useToast();

const success = ref(false);
const errorCode = ref("");
const hoaDonId = route.query.vnp_TxnRef;
const isLoading = ref(false);

onMounted(async () => {
  const responseCode = route.query.vnp_ResponseCode;
  isLoading.value = true;

  try {
    const res = await axios.get("http://localhost:8080/vnpay/return", {
      params: {
        vnp_ResponseCode: responseCode,
        vnp_TxnRef: hoaDonId,
      },
    });

    if (res.status === 200 && responseCode === "00") {
      const storedData = JSON.parse(sessionStorage.getItem("dataHoaDon"));
      if (storedData) {
        await axios.put(`http://localhost:8080/client/capNhatHoaDon/${hoaDonId}`, storedData);
        toast.success("✅ Thanh toán thành công! Đang gửi mail xác nhận...");
      } else {
        toast.warning("⚠️ Không tìm thấy dữ liệu hóa đơn trong sessionStorage.");
      }

      sessionStorage.removeItem("gioHang");
      localStorage.removeItem("gioHang");
      window.dispatchEvent(new Event("cap-nhat-gio"));
      success.value = true;
    } else {
      success.value = false;
      errorCode.value = responseCode || "Không rõ";
      toast.error(`❌ Thanh toán thất bại! Mã lỗi: ${errorCode.value}`);
    }
  } catch (error) {
    success.value = false;
    errorCode.value = responseCode || "Không rõ";
    toast.error(`❌ Thanh toán thất bại! Mã lỗi: ${errorCode.value}`);
  } finally {
    isLoading.value = false;
  }
});

function handleBackClick() {
  if (success.value) {
    toast.success("📧 Gửi mail xác nhận thành công!");
  }
}
</script>

<style scoped>
.vnpay-return {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f3f4f6;
    padding: 20px;
}

.message-box {
    background: #ffffff;
    border-radius: 12px;
    padding: 40px 30px;
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 100%;
    text-align: center;
    border: 2px solid transparent;
    transition: 0.3s ease;
}

.success {
    border-color: #38a169;
}

.error {
    border-color: #e53e3e;
}

.message-box h2 {
    font-size: 24px;
    margin-bottom: 12px;
}

.message-box p {
    font-size: 16px;
    margin: 6px 0;
}

.back-button {
    display: inline-block;
    margin-top: 24px;
    padding: 12px 24px;
    font-size: 16px;
    background-color: transparent;
    color: #0f62fe;
    border: 2px solid #0f62fe;
    border-radius: 6px;
    text-decoration: none;
    transition: all 0.3s ease;
}

.back-button:hover {
    background-color: #0f62fe;
    color: white;
}
</style>
