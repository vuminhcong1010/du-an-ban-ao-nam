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


        <div class="form-group" :class="{ 'has-error': showError && !addressForm.tinhId }">
          <label for="province">Tỉnh/Thành phố:<span class="required-star">*</span></label>
          <select id="province" v-model="addressForm.tinhId" @change="handleTinhChange(true)" class="form-control"
            :class="{ 'error-input': showError && !addressForm.tinhId }">
            <option value="" disabled>-- Chọn Tỉnh/Thành phố --</option>
            <option v-for="tinh in tinhThanhList" :value="tinh.name" :key="tinh.code">{{ tinh.name }}</option>
          </select>
          <span v-if="showError && !addressForm.tinhId" class="error-message">Vui lòng chọn Tỉnh/Thành phố.</span>
        </div>


        <div class="form-group" :class="{ 'has-error': showError && !addressForm.quanIdId }">
          <label for="district">Quận/Huyện:<span class="required-star">*</span></label>
          <select id="district" v-model="addressForm.quanId" @change="handleQuanChange(true)" class="form-control"
            :class="{ 'error-input': showError && !addressForm.quanId }">
            <option value="" disabled>-- Chọn Quận/Huyện --</option>
            <option v-for="quan in quanHuyenList" :value="quan.name" :key="quan.code">{{ quan.name }}</option>
          </select>
          <span v-if="showError && !addressForm.quanId" class="error-message">Vui lòng chọn Quận/Huyện.</span>
        </div>


        <div class="form-group" :class="{ 'has-error': showError && !addressForm.xaIdId }">
          <label for="ward">Xã/Phường:<span class="required-star">*</span></label>
          <select id="ward" v-model="addressForm.xaId" class="form-control"
            :class="{ 'error-input': showError && !addressForm.xaId }">
            <option value="" disabled>-- Chọn Xã/Phường --</option>
            <option v-for="xa in xaPhuongList" :value="xa.name" :key="xa.code">{{ xa.name }}</option>
          </select>
          <span v-if="showError && !addressForm.xaId" class="error-message">Vui lòng chọn Xã/Phường.</span>
        </div>


        <div class="form-group" :class="{ 'has-error': showError && !addressForm.chiTiet }">
          <label for="detailAddress">Địa chỉ chi tiết:<span class="required-star">*</span></label>
          <input id="detailAddress" v-model="addressForm.chiTiet" type="text" placeholder="Số nhà, tên đường..."
            class="form-control" :class="{ 'error-input': showError && !addressForm.chiTiet }" />
          <span v-if="showError && !addressForm.chiTiet" class="error-message">Vui lòng nhập địa chỉ chi tiết.</span>
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
import axios from 'axios'; // Import axios riêng cho API địa lý bên ngoài
import { useToast } from 'vue-toastification';
import Cookies from 'js-cookie'

const token = Cookies.get('token')

// Props
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


// Emits
const emit = defineEmits(['close', 'address-saved']);


// State
const toast = useToast();
const showError = ref(false);
const addressForm = ref({
  id: null,
  tinhId: '', // Sẽ lưu tên tỉnh
  quanId: '', // Sẽ lưu tên quận/huyện
  xaId: '',   // Sẽ lưu tên xã/phường
  chiTiet: '',
  isMacDinh: false,
});
const tinhThanhList = ref([]);
const quanHuyenList = ref([]);
const xaPhuongList = ref([]);
const isEditing = ref(false);
const fullAddressDisplay = ref('');


// =======================================================================
// Các hàm gọi API từ provinces.open-api.vn
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
  // Reset các dropdown con
  if (resetChild) {
    addressForm.value.quanId = '';
    addressForm.value.xaId = '';
    quanHuyenList.value = [];
    xaPhuongList.value = [];
  }


  if (addressForm.value.tinhId) {
    // Tìm code của tỉnh đã chọn để gọi API huyện
    const selectedTinh = tinhThanhList.value.find(t => t.name === addressForm.value.tinhId);
    if (selectedTinh) {
      await fetchDistricts(selectedTinh.code);
      // Sau khi load huyện, kiểm tra lại nếu có quanId cũ nhưng không tồn tại trong list mới
      if (!resetChild && addressForm.value.quanId && !quanHuyenList.value.some(q => q.name === addressForm.value.quanId)) {
        addressForm.value.quanId = '';
      }
    }
  } else {
    quanHuyenList.value = [];
    xaPhuongList.value = [];
  }
};


const handleQuanChange = async (resetChild = false) => {
  // Reset các dropdown con
  if (resetChild) {
    addressForm.value.xaId = '';
    xaPhuongList.value = [];
  }


  if (addressForm.value.quanId) {
    // Tìm code của huyện đã chọn để gọi API xã
    const selectedQuan = quanHuyenList.value.find(q => q.name === addressForm.value.quanId);
    if (selectedQuan) {
      await fetchWards(selectedQuan.code);
      // Sau khi load xã, kiểm tra lại nếu có xaId cũ nhưng không tồn tại trong list mới
      if (!resetChild && addressForm.value.xaId && !xaPhuongList.value.some(x => x.name === addressForm.value.xaId)) {
        addressForm.value.xaId = '';
      }
    }
  } else {
    xaPhuongList.value = [];
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
    tinhId: '',
    quanId: '',
    xaId: '',
    chiTiet: '',
    isMacDinh: false,
  };
  // Không cần fetchProvinces lại ở đây vì nó sẽ được gọi trong watcher khi show modal
  quanHuyenList.value = [];
  xaPhuongList.value = [];
  isEditing.value = false;
  fullAddressDisplay.value = '';
  showError.value = false;
};


// Cập nhật hàm hiển thị địa chỉ đầy đủ (không cần thay đổi nhiều)
const updateFullAddressDisplay = () => {
  let parts = [];
  if (addressForm.value.chiTiet) parts.push(addressForm.value.chiTiet);
  if (addressForm.value.xaId) parts.push(addressForm.value.xaId);
  if (addressForm.value.quanId) parts.push(addressForm.value.quanId);
  if (addressForm.value.tinhId) parts.push(addressForm.value.tinhId);


  fullAddressDisplay.value = parts.filter(Boolean).join(', ');
};


const saveAddress = async () => {
  showError.value = true;


  if (!addressForm.value.tinhId || !addressForm.value.quanId || !addressForm.value.xaId || !addressForm.value.chiTiet) {
    toast.error('Vui lòng điền đầy đủ thông tin địa chỉ bắt buộc.');
    return;
  }


  const requestData = {
    tinhThanhPho: addressForm.value.tinhId, // Gửi tên tỉnh
    quanHuyen: addressForm.value.quanId,   // Gửi tên quận/huyện
    xaPhuong: addressForm.value.xaId,     // Gửi tên xã/phường
    diaChiChiTiet: addressForm.value.chiTiet,
    isMacDinh: addressForm.value.isMacDinh,
  };


  try {
    if (isEditing.value && addressForm.value.id) {
      await axios.put(`/api/dia-chi/${addressForm.value.id}`, requestData,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
      toast.success('Cập nhật địa chỉ thành công!');
    } else {
      if (!props.customerId) {
        toast.error("Không tìm thấy ID khách hàng để thêm địa chỉ.");
        return;
      }
      await axios.post(`/api/khach-hang/${props.customerId}/dia-chi`, requestData,{
    headers: {
      Authorization: `Bearer ${token}`
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


// Watchers
watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      await fetchProvinces(); // Tải tất cả tỉnh/thành phố từ API ngoài khi mở modal


      if (props.initialAddress) {
        isEditing.value = true;
        // Sao chép sâu đối tượng để tránh thay đổi trực tiếp prop
        addressForm.value = JSON.parse(JSON.stringify(props.initialAddress));
        fullAddressDisplay.value = props.initialAddress.diaChi || '';


        // ===================================================================
        // Logic để tải và chọn lại các giá trị cũ khi chỉnh sửa
        // ===================================================================
        if (addressForm.value.tinhId) {
          // Tìm code của tỉnh từ tên tỉnh đã lưu
          const selectedTinh = tinhThanhList.value.find(t => t.name === addressForm.value.tinhId);
          if (selectedTinh) {
            await fetchDistricts(selectedTinh.code); // Tải huyện dựa trên code của tỉnh
            if (addressForm.value.quanId) {
              // Tìm code của huyện từ tên huyện đã lưu
              // SỬA LỖI Ở DÒNG NÀY: BỎ .value THỪA
              const selectedQuan = quanHuyenList.value.find(q => q.name === addressForm.value.quanId); // <--- DÒNG NÀY ĐÃ SỬA
              if (selectedQuan) {
                await fetchWards(selectedQuan.code); // Tải xã dựa trên code của huyện
              }
            }
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


// Watch các trường form để cập nhật fullAddressDisplay
watch(
  [
    () => addressForm.value.tinhId,
    () => addressForm.value.quanId,
    () => addressForm.value.xaId,
    () => addressForm.value.chiTiet,
  ],
  updateFullAddressDisplay,
  { deep: true }
);
</script>


<style scoped>
/* CSS cho modal con */
.modal-backdrop-child {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  /* Nền mờ hơn so với modal cha */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
  /* Cao hơn z-index của modal cha (ví dụ 1040) */
}


.modal-box-child {
  background: white;
  padding: 25px;
  /* Tăng padding */
  border-radius: 12px;
  /* Bo tròn hơn */
  width: 90%;
  max-width: 550px;
  /* Kích thước hợp lý cho popup địa chỉ */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  /* Đổ bóng mềm hơn */
  display: flex;
  flex-direction: column;
}


.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  /* Tăng khoảng cách */
  padding-bottom: 15px;
  /* Padding dưới cho header */
  border-bottom: 1px solid #eee;
  /* Đường kẻ phân cách */
}


.modal-header h2 {
  font-size: 1.8rem;
  /* Kích thước tiêu đề lớn hơn */
  font-weight: bold;
  color: #333;
  margin: 0;
}


.modal-close {
  background: none;
  border: none;
  font-size: 1.8rem;
  /* Kích thước icon đóng lớn hơn */
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
  /* Khoảng cách giữa các phần tử input */
}


.modal-body label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
  /* Kích thước font cho label */
}


.form-control {
  width: 100%;
  padding: 12px 15px;
  /* Tăng padding input */
  border: 1px solid #ced4da;
  border-radius: 8px;
  /* Bo tròn input */
  font-size: 1rem;
  /* Kích thước font lớn hơn */
  color: #495057;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-sizing: border-box;
}


.form-control:focus {
  border-color: #0a2c57;
  box-shadow: 0 0 0 3px rgba(10, 44, 87, 0.2);
  outline: none;
}


/* Styles mới cho hiển thị địa chỉ cũ */
.current-address-display {
  background-color: #f0f3f6;
  /* Màu nền nhẹ hơn */
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


/* Checkbox label */
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: normal;
  /* Không in đậm */
  color: #495057;
  font-size: 1rem;
  margin-top: 10px;
}


.checkbox-input {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #0a2c57;
  /* Màu xanh đậm cho checkbox */
  flex-shrink: 0;
}


.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
  /* Tăng khoảng cách */
  padding-top: 20px;
  border-top: 1px solid #eee;
}


.btn {
  padding: 10px 25px;
  /* Tăng padding nút */
  border: none;
  border-radius: 8px;
  /* Bo tròn nút */
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 1rem;
  /* Kích thước font cho nút */
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
  /* Đã đổi tên từ btn-success sang btn-primary */
  background-color: #0a2c57;
  /* Màu xanh đậm theo yêu cầu */
  color: white;
}


.btn-primary:hover {
  background-color: #071f3e;
  /* Màu đậm hơn khi hover */
  transform: translateY(-2px);
}


/* Toast styles (đảm bảo hiển thị đúng nếu bạn sử dụng chung) */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1100;
  /* Đảm bảo toast hiển thị trên tất cả các modal */
}


.toast-notification {
  padding: 10px 20px;
  border-radius: 5px;
  color: white;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
}


.toast-notification.success {
  background-color: #28a745;
}


.toast-notification.error {
  background-color: #dc3545;
}


/* Responsive adjustments */
@media (max-width: 600px) {
  .modal-box-child {
    padding: 15px;
    max-width: 95%;
  }


  .modal-header {
    margin-bottom: 15px;
  }


  .modal-header h2 {
    font-size: 1.5rem;
  }


  .modal-close {
    font-size: 1.5rem;
  }


  .modal-body {
    gap: 10px;
  }


  .modal-body label {
    font-size: 0.95rem;
  }


  .form-control {
    padding: 10px 12px;
    font-size: 0.95rem;
  }


  .modal-footer {
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
  }


  .btn {
    width: 100%;
    padding: 10px 15px;
    font-size: 1rem;
  }
}






.form-group.has-error label .required-star {
  color: #dc3545; /* Đảm bảo dấu sao cũng đỏ */
}


/* Các quy tắc dưới đây bạn đã có, nhưng tôi nhắc lại để đảm bảo chúng hoạt động cùng has-error */
.form-group.has-error .form-control {
  border-color: #dc3545 !important; /* Viền input màu đỏ */
}


.form-group.has-error .error-message {
  color: #dc3545; /* Text lỗi màu đỏ */
}


/* Đảm bảo dấu sao luôn màu đỏ, vì nó là required */
.required-star {
  color: #dc3545;
  margin-left: 4px;
}
</style>



