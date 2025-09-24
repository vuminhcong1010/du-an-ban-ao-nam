<template>
  <div v-if="show" class="modal-backdrop-child">
    <div class="modal-box-child">
      <div class="modal-header">
        <h2 class="text-xl font-semibold">{{ isEditing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới' }}</h2>
        <button type="button" @click="closeModal" class="modal-close">
          <i class="fas fa-times"></i>
        </button>
      </div>


      <div class="modal-body space-y-4">
        <div v-if="isEditing && fullAddressDisplay" class="current-address-display">
          <p>Địa chỉ hiện tại:</p>
          <p class="font-bold">{{ fullAddressDisplay }}</p>
          <hr class="my-3" />
        </div>


        <div class="form-group" :class="{ 'has-error': showError && !addressForm.tinhThanhPho }">
          <label for="province">Tỉnh/Thành phố:<span class="required-star">*</span></label>
          <select id="province" v-model="addressForm.tinhThanhPho" @change="handleTinhChange(true)" class="form-control"
            :class="{ 'error-input': showError && !addressForm.tinhThanhPho }">
            <option value="" disabled>-- Chọn Tỉnh/Thành phố --</option>
            <option v-for="tinh in tinhThanhList" :value="tinh.name" :key="tinh.code">{{ tinh.name }}</option>
          </select>
          <span v-if="showError && !addressForm.tinhThanhPho" class="error-message">Vui lòng chọn Tỉnh/Thành phố.</span>
        </div>


        <div class="form-group" :class="{ 'has-error': showError && !addressForm.quanHuyen }">
          <label for="district">Quận/Huyện:<span class="required-star">*</span></label>
          <select id="district" v-model="addressForm.quanHuyen" @change="handleQuanChange(true)" class="form-control"
            :class="{ 'error-input': showError && !addressForm.quanHuyen }">
            <option value="" disabled>-- Chọn Quận/Huyện --</option>
            <option v-for="quan in quanHuyenList" :value="quan.name" :key="quan.code">{{ quan.name }}</option>
          </select>
          <span v-if="showError && !addressForm.quanHuyen" class="error-message">Vui lòng chọn Quận/Huyện.</span>
        </div>


        <div class="form-group" :class="{ 'has-error': showError && !addressForm.xaPhuong }">
          <label for="ward">Xã/Phường:<span class="required-star">*</span></label>
          <select id="ward" v-model="addressForm.xaPhuong" @change="handleXaChange" class="form-control"
            :class="{ 'error-input': showError && !addressForm.xaPhuong }">
            <option value="" disabled>-- Chọn Xã/Phường --</option>
            <option v-for="xa in xaPhuongList" :value="xa.name" :key="xa.code">{{ xa.name }}</option>
          </select>
          <span v-if="showError && !addressForm.xaPhuong" class="error-message">Vui lòng chọn Xã/Phường.</span>
        </div>


        <div class="form-group" :class="{ 'has-error': showError && !addressForm.diaChiChiTiet }">
          <label for="detailAddress">Địa chỉ chi tiết:<span class="required-star">*</span></label>
          <input id="detailAddress" v-model="addressForm.diaChiChiTiet" type="text" placeholder="Số nhà, tên đường..."
            class="form-control" :class="{ 'error-input': showError && !addressForm.diaChiChiTiet }" />
          <span v-if="showError && !addressForm.diaChiChiTiet" class="error-message">Vui lòng nhập địa chỉ chi
            tiết.</span>
        </div>


        <label class="checkbox-label">
          <input type="checkbox" v-model="addressForm.isMacDinh" class="checkbox-input" />
          Đặt làm địa chỉ mặc định
        </label>
      </div>


      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
        <button type="button" class="btn btn-primary" @click="saveAddress">
          {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import Cookies from 'js-cookie';


const token = Cookies.get('token');
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  initialAddress: {
    type: Object,
    default: () => null,
  },
  customerId: {
    type: [String, Number],
    required: true,
  },
});
const emit = defineEmits(['close', 'address-saved']);
const toast = useToast();
const showError = ref(false);
const addressForm = ref({
  id: null,
  tinhThanhPho: '',
  tinhThanhId: null, // <-- THÊM MỚI
  quanHuyen: '',
  quanHuyenId: null, // <-- THÊM MỚI
  xaPhuong: '',
  xaPhuongId: null, // <-- THÊM MỚI
  diaChiChiTiet: '',
  isMacDinh: false,
});
const tinhThanhList = ref([]);
const quanHuyenList = ref([]);
const xaPhuongList = ref([]);
const isEditing = ref(false);
const fullAddressDisplay = ref('');


const apiClient = axios.create({
  baseURL: 'http://localhost:8080/client',
});


// =======================================================================
// Các hàm gọi API từ provinces.open-api.vn (đã sử dụng proxy)
// =======================================================================
const fetchProvinces = async () => {
  try {
    const res = await axios.get('http://provinces.open-api.vn/api/p/');
    tinhThanhList.value = res.data;
  } catch (err) {
    console.error('Lỗi khi lấy Tỉnh/Thành Phố:', err);
    toast.error('Không thể tải danh sách tỉnh/thành phố.');
  }
};


const fetchDistricts = async (provinceCode) => {
  if (!provinceCode) {
    quanHuyenList.value = [];
    return;
  }
  try {
    const res = await axios.get(`http://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    quanHuyenList.value = res.data.districts;
  } catch (err) {
    console.error('Lỗi khi lấy Quận/Huyện:', err);
    toast.error('Không thể tải danh sách quận/huyện.');
  }
};


const fetchWards = async (districtCode) => {
  if (!districtCode) {
    xaPhuongList.value = [];
    return;
  }
  try {
    const res = await axios.get(`http://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    xaPhuongList.value = res.data.wards;
  } catch (err) {
    console.error('Lỗi khi lấy Xã/Phường:', err);
    toast.error('Không thể tải danh sách xã/phường.');
  }
};


// =======================================================================
// Handlers cho sự kiện @change trên các select box
// =======================================================================
const handleTinhChange = async (resetChild = false) => {
  if (resetChild) {
    addressForm.value.quanHuyen = '';
    addressForm.value.quanHuyenId = null; // <-- THÊM MỚI
    addressForm.value.xaPhuong = '';
    addressForm.value.xaPhuongId = null; // <-- THÊM MỚI
    quanHuyenList.value = [];
    xaPhuongList.value = [];
  }
  if (addressForm.value.tinhThanhPho) {
    const selectedTinh = tinhThanhList.value.find(t => t.name === addressForm.value.tinhThanhPho);
    if (selectedTinh) {
      addressForm.value.tinhThanhId = selectedTinh.code; // <-- THÊM MỚI
      await fetchDistricts(selectedTinh.code);
    }
  } else {
    addressForm.value.tinhThanhId = null; // <-- THÊM MỚI
    quanHuyenList.value = [];
    xaPhuongList.value = [];
  }
};


const handleQuanChange = async (resetChild = false) => {
  if (resetChild) {
    addressForm.value.xaPhuong = '';
    addressForm.value.xaPhuongId = null; // <-- THÊM MỚI
    xaPhuongList.value = [];
  }
  if (addressForm.value.quanHuyen) {
    const selectedQuan = quanHuyenList.value.find(q => q.name === addressForm.value.quanHuyen);
    if (selectedQuan) {
      addressForm.value.quanHuyenId = selectedQuan.code; // <-- THÊM MỚI
      await fetchWards(selectedQuan.code);
    }
  } else {
    addressForm.value.quanHuyenId = null; // <-- THÊM MỚI
    xaPhuongList.value = [];
  }
};


// Thêm một hàm để lưu ID Xã/Phường
const handleXaChange = () => {
  const selectedXa = xaPhuongList.value.find(w => w.name === addressForm.value.xaPhuong);
  if (selectedXa) {
    addressForm.value.xaPhuongId = selectedXa.code;
  } else {
    addressForm.value.xaPhuongId = null;
  }
};


// Methods
const closeModal = () => {
  emit('close');
  resetForm();
};


const resetForm = () => {
  addressForm.value = {
    id: null,
    tinhThanhPho: '',
    quanHuyen: '',
    xaPhuong: '',
    diaChiChiTiet: '',
    isMacDinh: false,
  };
  quanHuyenList.value = [];
  xaPhuongList.value = [];
  isEditing.value = false;
  fullAddressDisplay.value = '';
  showError.value = false;
};


const updateFullAddressDisplay = () => {
  let parts = [];
  if (addressForm.value.diaChiChiTiet) parts.push(addressForm.value.diaChiChiTiet);
  if (addressForm.value.xaPhuong) parts.push(addressForm.value.xaPhuong);
  if (addressForm.value.quanHuyen) parts.push(addressForm.value.quanHuyen);
  if (addressForm.value.tinhThanhPho) parts.push(addressForm.value.tinhThanhPho);
  fullAddressDisplay.value = parts.filter(Boolean).join(', ');
};


const saveAddress = async () => {
  showError.value = true;
  if (!addressForm.value.tinhThanhPho || !addressForm.value.quanHuyen || !addressForm.value.xaPhuong || !addressForm.value.diaChiChiTiet) {
    toast.error('Vui lòng điền đầy đủ thông tin địa chỉ bắt buộc.');
    return;
  }
  const requestData = {
    tinhThanhPho: addressForm.value.tinhThanhPho,
    tinhThanhId: addressForm.value.tinhThanhId, // <-- THÊM MỚI
    quanHuyen: addressForm.value.quanHuyen,
    quanHuyenId: addressForm.value.quanHuyenId, // <-- THÊM MỚI
    xaPhuong: addressForm.value.xaPhuong,
    xaPhuongId: addressForm.value.xaPhuongId, // <-- THÊM MỚI
    diaChiChiTiet: addressForm.value.diaChiChiTiet,
    isMacDinh: addressForm.value.isMacDinh,
  };
  try {
    if (isEditing.value && addressForm.value.id) {
      await apiClient.put(`/addresses/${addressForm.value.id}`, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Cập nhật địa chỉ thành công!');
    } else {
      if (!props.customerId) {
        toast.error("Không tìm thấy ID khách hàng để thêm địa chỉ.");
        return;
      }
      await apiClient.post(`/addresses`, requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'X-User-ID': props.customerId
        }
      });
      toast.success('Địa chỉ đã được thêm thành công!');
    }
    emit('address-saved');
    closeModal();
  } catch (err) {
    console.error('Lỗi khi lưu địa chỉ:', err.response?.data || err.message);
    toast.error('Thao tác thất bại: ' + (err.response?.data?.message || err.message || 'Đã xảy ra lỗi.'));
  }
};


watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      await fetchProvinces();
      if (props.initialAddress) {
        isEditing.value = true;
        // Sao chép toàn bộ đối tượng địa chỉ ban đầu, bao gồm cả các ID đã lưu từ backend
        addressForm.value = { ...props.initialAddress };
        fullAddressDisplay.value = props.initialAddress.diaChi || '';


        // Dùng ID để fetch danh sách con, không phải tên
        if (addressForm.value.tinhThanhId) { // <-- THÊM KIỂM TRA ID
          await fetchDistricts(addressForm.value.tinhThanhId);
          if (addressForm.value.quanHuyenId) { // <-- THÊM KIỂM TRA ID
            await fetchWards(addressForm.value.quanHuyenId);
          }
        }
      } else {
        isEditing.value = false;
        resetForm();
      }
    }
  },
  { immediate: true }
);


watch(
  [
    () => addressForm.value.tinhThanhPho,
    () => addressForm.value.quanHuyen,
    () => addressForm.value.xaPhuong,
    () => addressForm.value.diaChiChiTiet,
  ],
  updateFullAddressDisplay,
  { deep: true }
);
</script>


<style scoped>
/* CSS giữ nguyên như bạn đã cung cấp */
.modal-backdrop-child {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}


.modal-box-child {
  background: white;
  padding: 25px;
  border-radius: 12px;
  width: 90%;
  max-width: 550px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}


.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}


.modal-header h2 {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin: 0;
}


.modal-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.2s ease-in-out;
}


.modal-close:hover {
  color: #343a40;
}


.modal-body {
  display: flex;
  flex-direction: column;
  gap: 15px;
}


.modal-body label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
}


.form-control {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1rem;
  color: #495057;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-sizing: border-box;
}


.form-control:focus {
  border-color: #0a2c57;
  box-shadow: 0 0 0 3px rgba(10, 44, 87, 0.2);
  outline: none;
}


.current-address-display {
  background-color: #f0f3f6;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}


.current-address-display p {
  margin: 0;
  font-size: 0.95em;
  color: #343a40;
}


.current-address-display .font-bold {
  font-weight: 700;
  margin-top: 5px;
  color: #212529;
}


.current-address-display hr {
  border-color: #d1d9e0;
}


.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal;
  color: #495057;
  font-size: 1rem;
  margin-top: 10px;
}


.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #0a2c57;
  flex-shrink: 0;
}


.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}


.btn {
  padding: 10px 25px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 1rem;
}


.btn-secondary {
  background-color: #6c757d;
  color: white;
}


.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}


.btn-primary {
  background-color: #0a2c57;
  color: white;
}


.btn-primary:hover {
  background-color: #071f3e;
  transform: translateY(-2px);
}


.form-group.has-error label .required-star {
  color: #dc3545;
}


.form-group.has-error .form-control {
  border-color: #dc3545 !important;
}


.form-group.has-error .error-message {
  color: #dc3545;
}


.required-star {
  color: #dc3545;
  margin-left: 4px;
}
</style>



