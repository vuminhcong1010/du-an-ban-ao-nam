<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import ThongKeBieuDoTongHop from './ThongKeBieuDoTongHop.vue';
import Cookies from 'js-cookie'

const token = Cookies.get('token')


// Hôm nay
const today = ref({ doanhThu: 0, percent: 0, xuHuong: '', comparedDate: '' });
const loadingToday = ref(true);
const errorToday = ref('');
// Tuần này
const week = ref({ doanhThu: 0, percent: 0, xuHuong: '', comparedText: '' });
const loadingWeek = ref(true);
const errorWeek = ref('');
// Tháng này
const month = ref({ doanhThu: 0, percent: 0, xuHuong: '', comparedText: '' });
const loadingMonth = ref(true);
const errorMonth = ref('');


// Hôm nay
const fetchToday = async () => {
  loadingToday.value = true;
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/thong-ke/hom-nay', {
  headers: {
    Authorization: `Bearer ${token}` 
  }
});
    const resCompare = await axios.get('http://localhost:8080/hoa-don/thong-ke/so-sanh-hom-qua', {
  headers: {
    Authorization: `Bearer ${token}` 
  }
});
    today.value.doanhThu = res.data.tongTienThuDuoc ?? res.data.tongTien ?? 0;
    today.value.soHoaDon = res.data.tongSoHoaDon ?? res.data.soLuongHoaDon ?? 0;
    today.value.percent = resCompare.data.tiLeThayDoi ?? 0;
    today.value.xuHuong = resCompare.data.xuHuong || '';
    today.value.comparedDate = resCompare.data.ngaySoSanh || '';
  } catch (e) {
    errorToday.value = 'Lỗi khi lấy dữ liệu hôm nay';
  } finally {
    loadingToday.value = false;
  }
};
// Tuần này
const fetchWeek = async () => {
  loadingWeek.value = true;
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/thong-ke/tuan-nay', {
  headers: {
    Authorization: `Bearer ${token}` 
  }
});
    const resCompare = await axios.get('http://localhost:8080/hoa-don/thong-ke/so-sanh-tuan-truoc', {
  headers: {
    Authorization: `Bearer ${token}` 
  }
});
    week.value.doanhThu = res.data.tongTienThuDuoc ?? res.data.tongTien ?? 0;
    week.value.soHoaDon = res.data.tongSoHoaDon ?? res.data.soLuongHoaDon ?? 0;
    week.value.percent = resCompare.data.tiLeThayDoi ?? 0;
    week.value.xuHuong = resCompare.data.xuHuong || '';
    week.value.comparedText = 'So với tuần trước';
  } catch (e) {
    errorWeek.value = 'Lỗi khi lấy dữ liệu tuần này';
  } finally {
    loadingWeek.value = false;
  }
};
// Tháng này
const fetchMonth = async () => {
  loadingMonth.value = true;
  try {
    const res = await axios.get('http://localhost:8080/hoa-don/thong-ke/thang-nay', {
  headers: {
    Authorization: `Bearer ${token}` 
  }
});
    const resCompare = await axios.get('http://localhost:8080/hoa-don/thong-ke/so-sanh-thang-truoc', {
  headers: {
    Authorization: `Bearer ${token}` 
  }
});
    month.value.doanhThu = res.data.tongTienThuDuoc ?? res.data.tongTien ?? 0;
    month.value.soHoaDon = res.data.tongSoHoaDon ?? res.data.soLuongHoaDon ?? 0;
    month.value.percent = resCompare.data.tiLeThayDoi ?? 0;
    month.value.xuHuong = resCompare.data.xuHuong || '';
    month.value.comparedText = 'So với tháng trước';
  } catch (e) {
    errorMonth.value = 'Lỗi khi lấy dữ liệu tháng này';
  } finally {
    loadingMonth.value = false;
  }
};

onMounted(() => {
  fetchToday();
  fetchWeek();
  fetchMonth();
});
</script>

<template>
  <div>
    <div class="thongke-tonghop-row">
      <!-- Card hôm nay -->
      <div class="thongke-tonghop-card">
        <div class="thongke-tonghop-card-content">
          <div class="thongke-tonghop-left">
            <div class="thongke-tonghop-title">Doanh Thu hôm nay</div>
            <div class="thongke-tonghop-value">{{ today.doanhThu.toLocaleString('vi-VN') }}</div>
            <div class="thongke-tonghop-sub">Số hóa đơn: {{ today.soHoaDon || 0 }}</div>
          </div>
          <div class="thongke-tonghop-right">
            <div class="thongke-tonghop-compare">So với Hôm Qua</div>
            <div class="thongke-tonghop-percent" :class="today.percent < 0 ? 'down' : 'up'">
              <span class="arrow" :class="today.percent < 0 ? 'arrow-down' : 'arrow-up'">
                {{ today.percent < 0 ? '↓' : '↑' }}
              </span>
              <span :class="today.percent < 0 ? 'arrow-down' : 'arrow-up'">
                {{ today.percent < 0 ? '' : '+' }}{{ today.percent.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Card tuần này -->
      <div class="thongke-tonghop-card">
        <div class="thongke-tonghop-card-content">
          <div class="thongke-tonghop-left">
            <div class="thongke-tonghop-title">Doanh Thu tuần này</div>
            <div class="thongke-tonghop-value">{{ week.doanhThu.toLocaleString('vi-VN') }}</div>
            <div class="thongke-tonghop-sub">Số hóa đơn: {{ week.soHoaDon || 0 }}</div>
          </div>
          <div class="thongke-tonghop-right">
            <div class="thongke-tonghop-compare">{{ week.comparedText }}</div>
            <div class="thongke-tonghop-percent" :class="week.percent < 0 ? 'down' : 'up'">
              <span class="arrow" :class="week.percent < 0 ? 'arrow-down' : 'arrow-up'">
                {{ week.percent < 0 ? '↓' : '↑' }}
              </span>
              <span :class="week.percent < 0 ? 'arrow-down' : 'arrow-up'">
                {{ week.percent < 0 ? '' : '+' }}{{ week.percent.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
      <!-- Card tháng này -->
      <div class="thongke-tonghop-card">
        <div class="thongke-tonghop-card-content">
          <div class="thongke-tonghop-left">
            <div class="thongke-tonghop-title">Doanh Thu tháng này</div>
            <div class="thongke-tonghop-value">{{ month.doanhThu.toLocaleString('vi-VN') }}</div>
            <div class="thongke-tonghop-sub">Số hóa đơn: {{ month.soHoaDon || 0 }}</div>
          </div>
          <div class="thongke-tonghop-right">
            <div class="thongke-tonghop-compare">{{ month.comparedText }}</div>
            <div class="thongke-tonghop-percent" :class="month.percent < 0 ? 'down' : 'up'">
              <span class="arrow" :class="month.percent < 0 ? 'arrow-down' : 'arrow-up'">
                {{ month.percent < 0 ? '↓' : '↑' }}
              </span>
              <span :class="month.percent < 0 ? 'arrow-down' : 'arrow-up'">
                {{ month.percent < 0 ? '' : '+' }}{{ month.percent.toFixed(1) }}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="thongke-main-row">
      <div class="thongke-bieudo-col">
        <!-- Biểu đồ cột/thống kê cũ -->
        <ThongKeBieuDoTongHop />
      </div>
    </div>
  </div>
</template>

<style scoped>
.thongke-tonghop-row {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
}
.thongke-tonghop-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  flex: 1;
  padding: 10px 24px 10px 24px; /* giảm padding trên/dưới */
  display: flex;
  flex-direction: column;
  min-width: 220px;
  min-height: 60px; /* giảm min-height */
  justify-content: center;
}
.thongke-tonghop-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.thongke-tonghop-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.thongke-tonghop-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
}
.thongke-tonghop-title {
  font-size: 13px; /* nhỏ hơn */
  font-weight: 600;
  margin-bottom: 4px;
  color:  #0a2c57;
}
.thongke-tonghop-value {
  font-size: 20px; /* nhỏ hơn */
  font-weight: bold;
  margin-bottom: 2px;
  color: #222;
}
.thongke-tonghop-sub {
  font-size: 12px; /* nhỏ hơn */
  color: #888;
  margin-top: 2px;
}
.thongke-tonghop-compare {
  font-size: 12px; /* nhỏ hơn */
  color: #888;
  margin-bottom: 6px;
}
.thongke-tonghop-percent {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px; /* nhỏ hơn */
  font-weight: 600;
  background: #eafaf1;
  border-radius: 16px;
  padding: 2px 10px 2px 6px;
  width: fit-content;
  min-width: 50px;
  justify-content: flex-end;
}
.thongke-tonghop-percent.up .arrow,
.thongke-tonghop-percent.up .arrow-up {
  color: #22b34c;
}
.thongke-tonghop-percent.down {
  background: #fdeaea;
}
.thongke-tonghop-percent.down .arrow,
.thongke-tonghop-percent.down .arrow-down {
  color: #e53935;
}
.arrow {
  font-size: 15px; /* nhỏ hơn */
  font-weight: bold;
}
.arrow-up {
  color: #22b34c;
}
.arrow-down {
  color: #e53935;
}
.thongke-main-row {
  display: flex;
  gap: 20px;
  margin-top: 24px;
}
.thongke-bieudo-col {
  
  margin-top: -30px;
  flex: 2;
}
.thongke-pie-col {
  flex: 1;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 24px;
  margin-top: -6px;
}
.thongke-pie-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
.piechart-center-wrap {
  position: relative;
  width: 220px;
  height: 220px;
  margin: 0 auto 12px auto;
  display: flex;
  align-items: center;
  justify-content: center;
}
.piechart-center-content {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
.piechart-center-value {
  font-size: 32px;
  font-weight: bold;
}
.piechart-center-label {
  font-size: 14px;
  color: #888;
}
.thongke-pie-legend {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}
</style>