<script setup>
import { ref, watch } from "vue";
import axios from "axios";
import Cookies from 'js-cookie';

const token = Cookies.get('token');

const props = defineProps({
  khachHangId: {
    type: [String, Number],
    default: null,
  },
  selectedPhieu: {
    type: Object,
    default: null,
  },
});

const listPhieuGiam = ref([]);
const selectedPhieu = ref(props.selectedPhieu);
const isLoading = ref(false);
const errorMessage = ref("");
const keyword = ref("");
const trangThai = ref("");
const currentPage = ref(1);
const pageSize = ref(5); // Số phiếu mỗi trang
const totalPages = ref(1);
const totalItems = ref(0);

const fetchPhieuGiamGia = async () => {
  isLoading.value = true;
  errorMessage.value = "";
  try {
    let response;
    const params = {
      page: currentPage.value - 1, // API thường bắt đầu từ 0
      size: pageSize.value,
      keyword: keyword.value.trim(),
    };

    if (props.khachHangId && !isNaN(props.khachHangId) && props.khachHangId > 0) {
      // Fetch vouchers for a specific customer
      if (trangThai.value) {
        params.trangThai = trangThai.value;
      }
      response = await axios.get(`http://localhost:8080/ban_hang/phieuGG/khachHang/${props.khachHangId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params,
      });
    } else {
      // Fetch only public vouchers for guest customers
      response = await axios.get(`http://localhost:8080/ban_hang/phieuGG?loaiPhieu=Công khai`, {
        headers: {
          Authorization: `Bearer ${token}`
        },
        params,
      });
    }

    listPhieuGiam.value = response.data.content || response.data;
    totalPages.value = response.data.totalPages || 1;
    totalItems.value = response.data.totalElements || response.data.length;
    console.log("Fetched vouchers:", listPhieuGiam.value);

    if (listPhieuGiam.value.length === 0) {
      errorMessage.value = "Không có phiếu giảm giá hợp lệ.";
    }
  } catch (error) {
    console.error("Error fetching vouchers:", error.response?.data || error.message);
    errorMessage.value = "Không thể tải danh sách phiếu giảm giá. Vui lòng kiểm tra kết nối server.";
    listPhieuGiam.value = [];
    totalPages.value = 1;
    totalItems.value = 0;
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (val) => {
  return val ? val.toLocaleString("vi-VN") + " VNĐ" : "0 VNĐ";
};

const emit = defineEmits(["close", "selected"]);

const apply = () => {
  if (selectedPhieu.value) {
    emit("selected", selectedPhieu.value);
    emit("close");
  } else {
    errorMessage.value = "Vui lòng chọn một phiếu giảm giá.";
  }
};

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
    currentPage.value = page;
    fetchPhieuGiamGia();
  }
};

// Theo dõi thay đổi của keyword và trangThai để tìm kiếm
watch([keyword, trangThai], () => {
  currentPage.value = 1; // Reset về trang 1 khi tìm kiếm
  fetchPhieuGiamGia();
});

// Theo dõi thay đổi của khachHangId và selectedPhieu
watch(
  () => props.khachHangId,
  (newVal) => {
    console.log("khachHangId changed:", newVal);
    currentPage.value = 1; // Reset về trang 1 khi khách hàng thay đổi
    fetchPhieuGiamGia();
  },
  { immediate: true }
);

watch(
  () => props.selectedPhieu,
  (newVal) => {
    selectedPhieu.value = newVal;
  }
);
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050">
    <div class="modal-dialog custom-modal modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Danh Sách Phiếu Giảm Giá</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="d-flex gap-3 mb-3">
            <div class="col-md-6">
              <label for="keyword" class="form-label">Tìm kiếm</label>
              <input
                type="text"
                id="keyword"
                class="form-control"
                v-model="keyword"
                placeholder="Nhập mã hoặc tên phiếu giảm giá"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Loại giảm</label>
              <select v-model="trangThai" class="form-select">
                <option value="">Tất cả</option>
                <option value="0">Công khai</option>
                <option value="1">Cá nhân</option>
              </select>
            </div>
          </div>

          <div v-if="isLoading" class="text-center">
            <p>Đang tải danh sách phiếu giảm giá...</p>
          </div>
          <div v-else-if="errorMessage" class="text-center text-danger">
            <p>{{ errorMessage }}</p>
          </div>
          <div v-else-if="listPhieuGiam.length === 0" class="text-center">
            <p>Không có phiếu giảm giá nào hợp lệ.</p>
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
                <tr v-for="(phieu, index) in listPhieuGiam" :key="phieu.id"
                  :class="{ 'table-primary': selectedPhieu?.id === phieu.id }">
                  <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
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

          <!-- Phân trang -->
          <nav class="d-flex justify-content-center mt-3">
            <ul class="pagination justify-content-center">
              <li class="page-item" :class="{ disabled: currentPage === 1 }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">«</a>
              </li>
              <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
              </li>
              <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">»</a>
              </li>
            </ul>
          </nav>
          <div class="text-center mt-2">
            <small>Tổng: {{ totalItems }} phiếu giảm giá</small>
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