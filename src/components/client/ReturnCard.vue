<template>
  <div class="vnpay-return">
    <div class="message-box" v-if="!isLoading" :class="{ success: success, error: !success }">
      <h2 v-if="success">🎉 Thanh toán thành công!</h2>
      <h2 v-else>❌ Thanh toán thất bại!</h2>

      <p v-if="success">Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi.</p>
      <p v-else>
        Mã lỗi: {{ errorCode }} <br />
        Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
      </p>

      <router-link class="back-button" :to="success ? { name: 'home' } : { name: 'client-Oder', params: { hoaDonId } }"
        @click.native.prevent="handleBackClick">
        🔙 {{ success ? "Quay về trang chủ" : "Quay lại hóa đơn để thanh toán lại" }}
      </router-link>
    </div>

    <div v-else class="loading-box">
      <h2>⏳ Đang xử lý kết quả thanh toán...</h2>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";
import Cookies from "js-cookie";
import { useToast } from "vue-toastification";

const route = useRoute();
const toast = useToast();

const success = ref(false);
const errorCode = ref("");
const hoaDonId = String(route.query.vnp_TxnRef || "");
const isLoading = ref(true);

const apiClient = axios.create({
  baseURL: "http://localhost:8080/client",
  headers: { "Content-Type": "application/json" },
});

const getUserId = () => {
  try {
    const u = localStorage.getItem("userId");
    if (u) return parseInt(u);
    const logged = JSON.parse(localStorage.getItem("loggedInUser") || "null");
    return logged ? logged.id : null;
  } catch (e) {
    return null;
  }
};

const clearCart = async () => {
  try {
    await apiClient.post("/ClearSessionGioHang", {}, { withCredentials: true });
  } catch {}
  sessionStorage.removeItem("gioHang");
  localStorage.removeItem("gioHang");
  sessionStorage.removeItem("dataHoaDon");
  localStorage.removeItem("dataHoaDon");
  window.dispatchEvent(new Event("cap-nhat-gio"));
};

onMounted(async () => {
  const responseCode = String(route.query.vnp_ResponseCode || "").trim();
  const txnStatus = String(route.query.vnp_TransactionStatus || "").trim();

  try {
    if (responseCode === "00" && txnStatus === "00") {
      // ✅ Thành công
      success.value = true;

      let storedData = sessionStorage.getItem("dataHoaDon") || localStorage.getItem("dataHoaDon");
      if (storedData) storedData = JSON.parse(storedData);

      const token = Cookies.get("token");
      const userId = getUserId();

      if (storedData) {
        if (token && userId) {
          await apiClient.put("/orders/update-all", storedData, {
            headers: { "X-User-ID": userId, Authorization: `Bearer ${token}` },
          });
        } else {
          await apiClient.put(`/capNhatHoaDon/${hoaDonId}`, storedData);
        }
      }

      await clearCart();
      toast.success("✅ Thanh toán thành công! Đơn hàng đã được cập nhật.");

      // 👉 Hiện UI trước
      isLoading.value = false;

      // 👉 Sau 2s mới chuyển trang
      setTimeout(() => {
        window.location.href = "http://localhost:5173/coolmen";
      }, 2000);

    } else {
      // ❌ Thất bại
      success.value = false;
      errorCode.value = responseCode || "Không rõ";
      toast.error(`❌ Thanh toán thất bại! Mã lỗi: ${errorCode.value}`);

      isLoading.value = false; // hiển thị lỗi
    }
  } catch (error) {
    console.error("Lỗi xử lý return VNPay:", error);
    success.value = false;
    errorCode.value = route.query.vnp_ResponseCode || "Không rõ";
    toast.error("Đã xảy ra lỗi khi xử lý kết quả thanh toán.");

    isLoading.value = false; // hiển thị lỗi
  }
});

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