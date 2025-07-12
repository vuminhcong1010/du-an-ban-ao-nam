<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import ThongKeBieuDoTongHop from './ThongKeBieuDoTongHop.vue';

const tongHoaDon = ref(0);
const tongDoanhThu = ref(0);
const percentChange = ref(0);
const xuHuong = ref('');
const loading = ref(true);
const error = ref('');

const fetchThongKe = async () => {
  loading.value = true;
  try {
    // Lấy hóa đơn và doanh thu hôm nay
    const resHomNay = await axios.get('http://localhost:8080/hoa-don/thong-ke/hom-nay');
    tongHoaDon.value = resHomNay.data.tongSoHoaDon || 0;
    tongDoanhThu.value = resHomNay.data.tongTienThuDuoc || 0; // SỬA LẠI DÒNG NÀY

    // Lấy phần trăm tăng giảm so với cùng kỳ
    const resSoSanh = await axios.get('http://localhost:8080/hoa-don/thong-ke/so-sanh-thang-truoc');
    percentChange.value = resSoSanh.data.tiLeThayDoi ?? 0;
    xuHuong.value = resSoSanh.data.xuHuong || '';
  } catch (e) {
    error.value = 'Lỗi khi lấy dữ liệu thống kê';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchThongKe);
</script>

<template>
  <div>
    <div class="thongke-homnay-container">
      <div style="flex: 1;">
        <div class="thongke-homnay-title">KẾT QUẢ BÁN HÀNG HÔM NAY</div>
        <div v-if="loading">Đang tải...</div>
        <div v-else-if="error" style="color: #e53935;">{{ error }}</div>
        <div v-else class="thongke-homnay-content">
          <!-- Tổng hóa đơn -->
          <div class="thongke-homnay-block">
            <div class="thongke-homnay-icon">
              <svg width="18" height="18" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><text x="8" y="17" font-size="10" fill="#fff">₫</text></svg>
            </div>
            <div class="thongke-homnay-info">
              <div style="font-size: 15px; font-weight: 600;">{{ tongHoaDon }}</div>
              <div style="font-size: 12px; color: #888;">Hóa đơn</div>
              <div style="font-size: 13px; color: #222; font-weight: 500;">{{ tongDoanhThu.toLocaleString('vi-VN') }} ₫</div>
              <div style="font-size: 12px; color: #888;">Doanh thu hôm nay</div>
            </div>
          </div>
          <!-- Phần trăm so với tháng trước -->
          <div class="thongke-homnay-percent">
            <div style="display: flex; align-items: center; gap: 8px;">
              <div :style="`background: ${percentChange < 0 ? '#e53935' : '#22b34c'}; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;`">
                <svg v-if="percentChange < 0" width="14" height="14" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l4 4 4-4"/></svg>
                <svg v-else width="14" height="14" fill="none" stroke="#fff" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 12l4-4 4 4"/></svg>
              </div>
              <div class="thongke-homnay-percent-value" :style="`color: ${percentChange < 0 ? '#e53935' : '#22b34c'};`">
                {{ percentChange < 0 ? '' : '+' }}{{ percentChange.toFixed(3) }}%
              </div>
            </div>
            <div style="font-size: 12px; color: #888; margin-left: 2px; margin-top: 2px;">
              {{ xuHuong }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <ThongKeBieuDoTongHop style="margin-top: 24px;" />
  </div>
</template>

<style scoped>
.thongke-homnay-container {
  background: #fff;
  color: #222;
  border-radius: 10px;
  padding: 10px 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  min-height: 60px;
  box-shadow: 0 2px 8px #0001;
  font-size: 13px;
  width: 100%;
  max-width: none;
  margin: 0 auto;
}

.thongke-homnay-title {
  font-size: 15px;
  font-weight: bold;
  margin-bottom: 8px;
}

.thongke-homnay-content {
  display: flex;
  align-items: flex-end;
  gap: 24px;
}

.thongke-homnay-block {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  border-right: 1px solid #eee;
  padding-right: 24px;
}

.thongke-homnay-icon {
  background: #1976d2;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thongke-homnay-info {
  font-size: 12px;
}

.thongke-homnay-percent {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  min-width: 100px;
  margin-left: 12px;
}

.thongke-homnay-percent-value {
  font-size: 16px;
  font-weight: bold;
  line-height: 1;
}
</style>