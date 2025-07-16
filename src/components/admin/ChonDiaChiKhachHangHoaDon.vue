<script setup>
import { ref, onMounted, defineProps, defineEmits } from "vue";
import axios from "axios";
import { useToast } from "vue-toastification";

const props = defineProps({
  khachHangId: {
    type: Number,
    required: true,
  },
});

const emits = defineEmits(["diaChiSelected", "close"]);

const diaChis = ref([]);
const loading = ref(true);
const error = ref(null);

const toast = useToast();

onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/dia-chi/khach-hang/${props.khachHangId}`
    );
    diaChis.value = response.data;
  } catch (err) {
    console.error("Lỗi khi tải địa chỉ:", err);
    error.value = "Không thể tải danh sách địa chỉ.";
    diaChis.value = [];
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
});

const selectDiaChi = (diaChi) => {
  const selected = {
    id: diaChi.id,
    diaChiChiTiet: diaChi.diaChiChiTiet,
    xaPhuong: diaChi.xaPhuong,
    quanHuyen: diaChi.quanHuyen,
    tinhThanhPho: diaChi.tinhThanhPho,
    isMacDinh: diaChi.isMacDinh,
  };
  emits("diaChiSelected", selected);
};

const close = () => {
  emits("close");

};
</script>

<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">Chọn địa chỉ của khách hàng</h5>
        <button class="btn-close" @click="close"></button>
      </div>

      <div class="modal-body">
        <div v-if="loading" class="text-center">Đang tải địa chỉ...</div>
        <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
        <div v-else-if="diaChis.length === 0" class="text-center">
          Khách hàng chưa có địa chỉ nào.
        </div>
        <ul class="list-group" v-else>
          <li
            v-for="dc in diaChis"
            :key="dc.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <div>
              <div>{{ dc.diaChiChiTiet }}, {{ dc.xaPhuong }}, {{ dc.quanHuyen }}, {{ dc.tinhThanhPho }}</div>
              <span v-if="dc.isMacDinh" class="badge bg-primary mt-1">Mặc định</span>
            </div>
            <button class="btn btn-sm btn-outline-primary" @click="selectDiaChi(dc)">
              Chọn
            </button>
          </li>
        </ul>
      </div>

      <div class="modal-footer">
        <button class="btn btn-secondary" @click="close">Đóng</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.modal-footer {
  padding-top: 15px;
  border-top: 1px solid #eee;
  text-align: right;
  margin-top: 15px;
}
</style>

