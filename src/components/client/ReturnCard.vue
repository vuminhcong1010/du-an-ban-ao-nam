<template>
  <div class="vnpay-return">
    <div
      class="message-box"
      v-if="!isLoading"
      :class="{ success: success, error: !success }"
    >
      <h2 v-if="success">🎉 Thanh toán thành công!</h2>
      <h2 v-else>❌ Thanh toán thất bại!</h2>

      <p v-if="success">Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi.</p>
      <p v-else>Mã lỗi: {{ errorCode }}</p>
      <p v-else>Vui lòng thử lại hoặc chọn phương thức thanh toán khác.</p>

      <router-link
        class="back-button"
        :to="success ? { name: 'home' } : { name: 'client-Oder', params: { hoaDonId } }"
        @click.native.prevent="handleBackClick"
      >
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
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { useToast } from "vue-toastification";

const route = useRoute();
const router = useRouter();
const toast = useToast();

const success = ref(false);
const errorCode = ref("");
const hoaDonId = route.query.vnp_TxnRef;
const isLoading = ref(true);

onMounted(async () => {
  const responseCode = route.query.vnp_ResponseCode;

  try {
    if (responseCode === "00") {
      const storedData = JSON.parse(sessionStorage.getItem("dataHoaDon"));

      if (storedData) {
        // Gửi dữ liệu cập nhật hóa đơn
        await axios.put(`http://localhost:8080/client/capNhatHoaDon/${hoaDonId}`, storedData);


        await axios.post("http://localhost:8080/client/ClearSessionGioHang", {}, {
          withCredentials: true
        });

        // ✅ Xóa giỏ hàng phía client
        sessionStorage.removeItem("gioHang");
        localStorage.removeItem("gioHang");
        sessionStorage.removeItem("dataHoaDon");

        // ✅ Gửi sự kiện để header cập nhật
        window.dispatchEvent(new Event("cap-nhat-gio"));

        toast.success("✅ Thanh toán thành công! Đang gửi mail xác nhận...");
        success.value = true;
      } else {
        toast.warning("⚠️ Không tìm thấy dữ liệu hóa đơn trong session.");
      }
    } else {
      success.value = false;
      errorCode.value = responseCode || "Không rõ";
      toast.error(`❌ Thanh toán thất bại! Mã lỗi: ${errorCode.value}`);
    }
  } catch (error) {
    console.error("❌ Lỗi xử lý kết quả thanh toán:", error);
    success.value = false;
    errorCode.value = responseCode || "Không rõ";
    toast.error("Đã xảy ra lỗi khi xử lý kết quả thanh toán.");
  } finally {
    isLoading.value = false;
  }
});

// 👇 Xử lý khi bấm nút quay lại
async function handleBackClick() {
  if (success.value) {
    // 🔥 Gọi lại để đảm bảo BE session cũng clear (phòng khi user reload lại)
    await axios.post("http://localhost:8080/client/ClearSessionGioHang", {}, {
      withCredentials: true
    });

    sessionStorage.removeItem("gioHang");
    localStorage.removeItem("gioHang");
    sessionStorage.removeItem("dataHoaDon");

    window.dispatchEvent(new Event("cap-nhat-gio"));
  } else {
    toast.info("💡 Vui lòng thử lại phương thức thanh toán khác.");
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
