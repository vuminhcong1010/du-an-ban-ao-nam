<script setup>
import { ref, watch } from "vue";
import axios from "axios";

// Props
const props = defineProps({
  khachHangId: {
    type: String,
    required: true,
  },
  selectedPhieu: {
    type: Object,
    default: null,
  },
});

// Biến
const listPhieuGiam = ref([]);
const selectedPhieu = ref(props.selectedPhieu); // Khởi tạo với phiếu đã chọn của đơn hàng
const isLoading = ref(false);
const errorMessage = ref("");

// Fetch danh sách phiếu giảm giá
const fetchPhieuGiamGia = async () => {
  if (!props.khachHangId || isNaN(props.khachHangId) || props.khachHangId <= 0) {
    errorMessage.value = "ID khách hàng không hợp lệ. Vui lòng nhập ID hợp lệ.";
    listPhieuGiam.value = [];
    return;
  }

  isLoading.value = true;
  errorMessage.value = "";
  try {
    const response = await axios.get(`http://localhost:8080/ban_hang/phieuGG/khachHang/${props.khachHangId}`);
    listPhieuGiam.value = response.data;
    console.log("Fetched vouchers:", listPhieuGiam.value);
    if (listPhieuGiam.value.length === 0) {
      errorMessage.value = "Không có phiếu giảm giá hợp lệ nào cho khách hàng này.";
    }
  } catch (error) {
    console.error("Error fetching vouchers:", error.response?.data || error.message);
    errorMessage.value = "Không thể tải danh sách phiếu giảm giá. Vui lòng kiểm tra kết nối server.";
    listPhieuGiam.value = [];
  } finally {
    isLoading.value = false;
  }
};

// Format tiền
const formatCurrency = (val) => {
  return val ? val.toLocaleString("vi-VN") + " VNĐ" : "0 VNĐ";
};

// Emit chọn phiếu
const emit = defineEmits(["close", "selected"]);

const apply = () => {
  if (selectedPhieu.value) {
    emit("selected", selectedPhieu.value);
    emit("close");
  } else {
    errorMessage.value = "Vui lòng chọn một phiếu giảm giá.";
  }
};

// Theo dõi sự thay đổi của khachHangId
watch(
  () => props.khachHangId,
  (newVal) => {
    if (newVal) {
      console.log("khachHangId changed:", newVal);
      fetchPhieuGiamGia();
    } else {
      listPhieuGiam.value = [];
      errorMessage.value = "Vui lòng nhập ID khách hàng.";
    }
  },
  { immediate: true }
);

// Theo dõi sự thay đổi của selectedPhieu từ prop
watch(
  () => props.selectedPhieu,
  (newVal) => {
    selectedPhieu.value = newVal; // Cập nhật phiếu đã chọn khi prop thay đổi
  }
);
</script>

<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050"
  >
    <div class="modal-dialog custom-modal modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Danh Sách Phiếu Giảm Giá</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div v-if="isLoading" class="text-center">
            <p>Đang tải danh sách phiếu giảm giá...</p>
          </div>
          <div v-else-if="errorMessage" class="text-center text-danger">
            <p>{{ errorMessage }}</p>
          </div>
          <div v-else-if="listPhieuGiam.length === 0" class="text-center">
            <p>Không có phiếu giảm giá nào cho khách hàng này hoặc phiếu có trạng thái không hợp lệ.</p>
          </div>
          <div v-else class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Mã</th>
                  <th>Tên phiếu giảm giá</th>
                  <th>Số lượng</th>
                  <th>Loại giảm</th>
                  <th>Giá trị giảm</th>
                  <th>Giá trị tối thiểu</th>
                  <th>Giá trị tối đa</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(phieu, index) in listPhieuGiam"
                  :key="phieu.id"
                  :class="{ 'table-primary': selectedPhieu?.id === phieu.id }"
                >
                  <td>{{ index + 1 }}</td>
                  <td>{{ phieu.maPhieuGiamGia }}</td>
                  <td>{{ phieu.tenPhieu }}</td>
                  <td>{{ phieu.soLuong }}</td>
                  <td>{{ phieu.loaiPhieu }}</td>
                  <td>
                    {{
                      phieu.phamTramGiamGia
                        ? phieu.phamTramGiamGia + "%"
                        : formatCurrency(phieu.soTienGiam)
                    }}
                  </td>
                  <td>{{ formatCurrency(phieu.giamToiThieu) }}</td>
                  <td>{{ formatCurrency(phieu.giamToiDa) }}</td>
                  <td>
                    <button class="btn btn-sm btn-success" @click="selectedPhieu = phieu">
                      Chọn
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button class="btn btn-primary" @click="apply">Áp dụng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-modal {
  max-width: 80vw;
}
.table-primary {
  background-color: #cfe2ff;
}
</style>