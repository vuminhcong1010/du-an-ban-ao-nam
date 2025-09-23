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


// local apiClient cho file này (base đến /client)
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
    console.error("parse loggedInUser err", e);
    return null;
  }
};


const clearCart = async () => {
  try {
    await apiClient.post("/ClearSessionGioHang", {}, { withCredentials: true });
  } catch (e) {
    console.warn("clearCart failed", e);
  }
  sessionStorage.removeItem("gioHang");
  localStorage.removeItem("gioHang");
  sessionStorage.removeItem("dataHoaDon");
  localStorage.removeItem("dataHoaDon");
  window.dispatchEvent(new Event("cap-nhat-gio"));
};


onMounted(async () => {
  const responseCode = String(route.query.vnp_ResponseCode || "").trim();
  const txnStatus = String(route.query.vnp_TransactionStatus || "").trim();


  console.log("VNPay return query:", route.query);


  try {
    if (responseCode === "00" && txnStatus === "00") {
      // Tìm dataHoaDon: ưu tiên session, fallback local, fallback backend
      let storedData = null;
      const sess = sessionStorage.getItem("dataHoaDon");
      const local = localStorage.getItem("dataHoaDon");


      if (sess) {
        storedData = JSON.parse(sess);
        console.log("Found dataHoaDon in sessionStorage");
      } else if (local) {
        storedData = JSON.parse(local);
        console.log("Found dataHoaDon in localStorage");
      } else {
        // fallback: lấy từ backend bằng hoaDonId (nếu backend lưu order lúc tạo)
        try {
          console.log("No client storage found — fetching order from backend:", hoaDonId);
          const res = await apiClient.get(`/orders/${hoaDonId}`); // **chỉnh endpoint theo BE**
          storedData = res.data;
          console.log("Loaded order from backend:", storedData);
        } catch (err) {
          console.warn("Không lấy được order từ backend:", err);
        }
      }


      if (!storedData) {
        // Không có dữ liệu để gửi lên BE => báo rõ ràng
        toast.warning("⚠️ Không tìm thấy dữ liệu hóa đơn. Vui lòng kiểm tra hoặc thử lại.");
        success.value = false;
        errorCode.value = "MISSING_DATA";
        return;
      }


      // Lấy token / userId nếu login, gọi API cập nhật tương ứng
      const token = Cookies.get("token");
      const userId = getUserId();


      if (token && userId) {
        // Nếu backend có endpoint /client/orders/update-all - gọi chính xác theo BE
        await apiClient.put("/orders/update-all", storedData, {
          headers: { "X-User-ID": userId, Authorization: `Bearer ${token}` },
        });
      } else {
        // Guest -> gọi endpoint client cũ (chỉnh URL nếu BE khác)
        await apiClient.put(`/capNhatHoaDon/${hoaDonId}`, storedData);
      }


      await clearCart();
      toast.success("✅ Thanh toán thành công! Đơn hàng đã được cập nhật.");
      success.value = true;
      setTimeout(() => {
        window.location.href = "http://localhost:5173/coolmen";
      }, 1500);
      // 👉 Redirect ra successPage (có thể hardcode hoặc lấy từ query/backend)
     
    } else {
      success.value = false;
      errorCode.value = responseCode || "Không rõ";
      toast.error(`❌ Thanh toán thất bại! Mã lỗi: ${errorCode.value}`);


      window.location.href = "http://localhost:5173/vnpay-return";
    }
  } catch (error) {
    console.error("Lỗi xử lý return VNPay:", error);
    success.value = false;
    errorCode.value = route.query.vnp_ResponseCode || "Không rõ";
    toast.error("Đã xảy ra lỗi khi xử lý kết quả thanh toán.");


    window.location.href = "http://localhost:5173/vnpay-return";
  } finally {
    isLoading.value = false;
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



