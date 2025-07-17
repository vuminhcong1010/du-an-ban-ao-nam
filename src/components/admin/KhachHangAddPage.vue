<template>
  <div class="p-4">
    <div class="header-section">
      <button @click="goBack" class="back-button">
        ← Quay lại
      </button>
      <h2 class="page-title-aligned">Thêm khách hàng mới</h2>
    </div>


    <form @submit.prevent="handleSubmit" class="customer-form">
      <div class="form-grid-container">
        <div class="personal-info-column">
          <div class="input-group"> <label>Họ và tên <span class="required-star">*</span></label>
            <input v-model="form.tenKhachHang" type="text" class="form-input"
              :class="{ 'input-error': showError && errors.tenKhachHang }" />
            <span v-if="showError && errors.tenKhachHang" class="error-message">Vui lòng nhập tên hợp lệ.</span>
          </div>


          <div class="input-group"> <label>Email <span class="required-star">*</span></label>
            <input v-model="form.email" type="email" class="form-input"
              :class="{ 'input-error': showError && errors.email }" />
            <span v-if="showError && errors.email" class="error-message">Email không hợp lệ.</span>
          </div>


          <div class="input-group"> <label>Số điện thoại <span class="required-star">*</span></label>
            <input v-model="form.soDienThoai" type="text" class="form-input"
              :class="{ 'input-error': showError && errors.soDienThoai }" />
            <span v-if="showError && errors.soDienThoai" class="error-message">Số điện thoại không hợp lệ.</span>
          </div>


          <div class="input-group"> <label>Ngày sinh</label>
            <input v-model="form.ngaySinh" type="date" class="form-input"
              :class="{ 'input-error': showError && errors.ngaySinh }" />
            <span v-if="showError && errors.ngaySinh" class="error-message">Khách hàng phải từ 16 tuổi trở lên.</span>
          </div>


          <div class="input-group gender-selection"> <label>Giới tính</label>
            <div class="gender-options">
              <label class="radio-label">
                <input type="radio" v-model="form.gioiTinh" :value="true" name="gender" class="radio-input"> Nam
              </label>
              <label class="radio-label">
                <input type="radio" v-model="form.gioiTinh" :value="false" name="gender" class="radio-input"> Nữ
              </label>
            </div>
          </div>
        </div>


        <div class="address-column">
          <h3 class="address-section-title">Địa chỉ</h3>


          <div class="input-group"> <label>Tỉnh/Thành Phố</label>
            <select v-model="selectedProvinceCode" @change="onTinhThanhChange" class="form-input"
              :class="{ 'input-error': showError && errors.diaChiTinh }">
              <option :value="null">Chọn Tỉnh/Thành Phố</option>
              <option v-for="t in tinhThanhPhos" :key="t.code" :value="t.code">{{ t.name }}</option>
            </select>
            <span v-if="showError && errors.diaChiTinh" class="error-message">Vui lòng chọn Tỉnh/Thành Phố.</span>
          </div>


          <div class="input-group"> <label>Quận/Huyện</label>
            <select :disabled="!selectedProvinceCode" v-model="selectedDistrictCode" @change="onQuanHuyenChange"
              class="form-input" :class="{ 'input-error': showError && errors.diaChiQuan }">
              <option :value="null">Chọn Quận/Huyện</option>
              <option v-for="q in quanHuyens" :key="q.code" :value="q.code">{{ q.name }}</option>
            </select>
            <span v-if="showError && errors.diaChiQuan" class="error-message">Vui lòng chọn Quận/Huyện.</span>
          </div>


          <div class="input-group"> <label>Xã/Phường</label>
            <select :disabled="!selectedDistrictCode" v-model="selectedWardCode" class="form-input"
              :class="{ 'input-error': showError && errors.diaChiXa }">
              <option :value="null">Chọn Xã/Phường</option>
              <option v-for="x in xaPhuongs" :key="x.code" :value="x.code">{{ x.name }}</option>
            </select>
            <span v-if="showError && errors.diaChiXa" class="error-message">Vui lòng chọn Xã/Phường.</span>
          </div>


          <div class="input-group"> <label>Địa chỉ chi tiết</label>
            <input v-model="form.diaChi.diaChiChiTiet" type="text" class="form-input"
              :disabled="!selectedWardCode" :class="{ 'input-error': showError && errors.diaChiChiTiet }" />
            <span v-if="showError && errors.diaChiChiTiet" class="error-message">Vui lòng nhập địa chỉ chi tiết (số nhà, tên đường...).</span>
          </div>
        </div>
      </div>


      <div class="form-actions-footer">
        <button type="button" @click="goBack" class="button-action button-secondary">Huỷ</button>
        <button type="submit" class="button-action button-primary">Lưu</button>
      </div>
    </form>


  </div>
</template>


<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Use axios for external API calls
import { useToast } from "vue-toastification";
import Cookies from 'js-cookie'

const token = Cookies.get('token')
const router = useRouter();
const toast = useToast();


const showError = ref(false);
const errors = ref({
  tenKhachHang: false,
  email: false,
  soDienThoai: false,
  ngaySinh: false,
  diaChiTinh: false,
  diaChiQuan: false,
  diaChiXa: false,
  diaChiChiTiet: false,
});


const form = ref({
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  gioiTinh: null,
  ngaySinh: null,
  diaChi: {
    // These will temporarily hold the selected names, updated from selected codes
    tinhThanhPho: null,
    quanHuyen: null,
    xaPhuong: null,
    diaChiChiTiet: '',
    isMacDinh: true,
  },
  hinhAnhFile: null, // Unused in this form, keep if needed elsewhere
});


// Refs to store the SELECTED CODES from the dropdowns
const selectedProvinceCode = ref(null);
const selectedDistrictCode = ref(null);
const selectedWardCode = ref(null);


// Refs to store the LISTS of geographical objects (from external API)
// These objects have 'code' and 'name' properties
const tinhThanhPhos = ref([]);
const quanHuyens = ref([]);
const xaPhuongs = ref([]);


// External API Base URL
const API_EXTERNAL_GEO = 'http://provinces.open-api.vn/api';


// --- Life Cycle Hooks ---
onMounted(async () => {
  await loadTinhThanh(); // Load provinces for the customer form
});


// --- Watchers for Address Dropdowns (Form Khách Hàng) ---
// Watch selectedProvinceCode to fetch districts
watch(selectedProvinceCode, async (newCode) => {
  selectedDistrictCode.value = null; // Reset district selection
  selectedWardCode.value = null;     // Reset ward selection
  form.value.diaChi.diaChiChiTiet = ''; // Clear detail address
  quanHuyens.value = [];             // Clear district list
  xaPhuongs.value = [];              // Clear ward list


  if (newCode) {
    await fetchQuanHuyen(newCode);
    // Find the selected province name and assign to form.diaChi.tinhThanhPho
    const selectedProvince = tinhThanhPhos.value.find(p => p.code === newCode);
    form.value.diaChi.tinhThanhPho = selectedProvince ? selectedProvince.name : null;
  } else {
    form.value.diaChi.tinhThanhPho = null;
  }
});


// Watch selectedDistrictCode to fetch wards
watch(selectedDistrictCode, async (newCode) => {
  selectedWardCode.value = null;      // Reset ward selection
  form.value.diaChi.diaChiChiTiet = ''; // Clear detail address
  xaPhuongs.value = [];               // Clear ward list


  if (newCode) {
    await fetchXaPhuong(newCode);
    // Find the selected district name and assign to form.diaChi.quanHuyen
    const selectedDistrict = quanHuyens.value.find(d => d.code === newCode);
    form.value.diaChi.quanHuyen = selectedDistrict ? selectedDistrict.name : null;
  } else {
    form.value.diaChi.quanHuyen = null;
  }
});


// Watch selectedWardCode to update the form.diaChi.xaPhuong name
watch(selectedWardCode, (newCode) => {
  if (newCode) {
    const selectedWard = xaPhuongs.value.find(w => w.code === newCode);
    form.value.diaChi.xaPhuong = selectedWard ? selectedWard.name : null;
  } else {
    form.value.diaChi.xaPhuong = null;
  }
});




// --- Data Fetching Methods (Using External API) ---
const loadTinhThanh = async () => {
  try {
    const response = await axios.get(`${API_EXTERNAL_GEO}/p/`);
    tinhThanhPhos.value = response.data; // API returns objects with 'code' and 'name'
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Tỉnh/Thành Phố:", err);
    toast.error("Lỗi khi tải Tỉnh/Thành Phố.");
  }
};


const fetchQuanHuyen = async (provinceCode) => {
  try {
    const response = await axios.get(`${API_EXTERNAL_GEO}/p/${provinceCode}?depth=2`);
    quanHuyens.value = response.data.districts; // API returns an object with 'districts' array
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Quận/Huyện:", err);
    toast.error("Lỗi khi tải Quận/Huyện.");
  }
};


const fetchXaPhuong = async (districtCode) => {
  try {
    const response = await axios.get(`${API_EXTERNAL_GEO}/d/${districtCode}?depth=2`);
    xaPhuongs.value = response.data.wards; // API returns an object with 'wards' array
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Xã/Phường:", err);
    toast.error("Lỗi khi tải Xã/Phường.");
  }
};


// --- Validation Methods ---
const validatePhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
const validateEmail = (email) => {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};


const isFullName = (name) => {
  const regex = /^[a-zA-Z\u00C0-\u1EF9\s'-]+$/;
  return name && name.trim().length > 0 && regex.test(name);
};


const isAdult = (birthDateString) => {
  if (!birthDateString) return true;
  const birthDate = new Date(birthDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 16;
};


// --- Form Handlers ---
const goBack = () => {
  router.push('/khach-hang');
};


const handleSubmit = async () => {
  showError.value = true;

  // RESET ALL ERROR FLAGS BEFORE RE-VALIDATING
  errors.value.tenKhachHang = false;
  errors.value.email = false;
  errors.value.soDienThoai = false;
  errors.value.ngaySinh = false;
  errors.value.diaChiTinh = false;
  errors.value.diaChiQuan = false;
  errors.value.diaChiXa = false;
  errors.value.diaChiChiTiet = false; // Đảm bảo reset cờ lỗi này

  let formIsValid = true;

  // VALIDATION FOR PERSONAL INFO (Giữ nguyên)
  if (!form.value.tenKhachHang || !isFullName(form.value.tenKhachHang)) {
    errors.value.tenKhachHang = true;
    formIsValid = false;
  }

  if (!form.value.email || !validateEmail(form.value.email)) {
    errors.value.email = true;
    formIsValid = false;
  }

  if (!form.value.soDienThoai || !validatePhone(form.value.soDienThoai)) {
    errors.value.soDienThoai = true;
    formIsValid = false;
  }

  if (form.value.ngaySinh && !isAdult(form.value.ngaySinh)) {
    errors.value.ngaySinh = true;
    formIsValid = false;
  }

  // VALIDATION FOR ADDRESS (Đã sửa đổi)
  const hasSelectedProvince = selectedProvinceCode.value !== null;
  const hasSelectedDistrict = selectedDistrictCode.value !== null;
  const hasSelectedWard = selectedWardCode.value !== null;
  const hasDetailAddressText = form.value.diaChi.diaChiChiTiet.trim() !== '';

  const isAddressAttempted = hasSelectedProvince || hasSelectedDistrict || hasSelectedWard || hasDetailAddressText;

  if (isAddressAttempted) {
    if (!hasSelectedProvince) {
      errors.value.diaChiTinh = true;
      formIsValid = false;
    }
    if (!hasSelectedDistrict) {
      errors.value.diaChiQuan = true;
      formIsValid = false;
    }
    if (!hasSelectedWard) {
      errors.value.diaChiXa = true;
      formIsValid = false;
    }
    if (!hasDetailAddressText) {
      errors.value.diaChiChiTiet = true;
      formIsValid = false;
    }
  }

  if (!formIsValid) {
    toast.error("Thêm khách hàng không thành công! Vui lòng kiểm tra lại thông tin.");
    return;
  }

  try {
    const payload = {
      tenKhachHang: form.value.tenKhachHang,
      email: form.value.email,
      soDienThoai: form.value.soDienThoai,
      gioiTinh: form.value.gioiTinh ,
      ngaySinh: form.value.ngaySinh,
    };

    if (isAddressAttempted && !errors.value.diaChiTinh && !errors.value.diaChiQuan && !errors.value.diaChiXa && !errors.value.diaChiChiTiet) {
      payload.diaChi = {
        tinhThanhPho: form.value.diaChi.tinhThanhPho,
        quanHuyen: form.value.diaChi.quanHuyen,
        xaPhuong: form.value.diaChi.xaPhuong,
        diaChiChiTiet: form.value.diaChi.diaChiChiTiet.trim(),
        isMacDinh: true,
      };
    } else {
      payload.diaChi = null;
    }

    console.log("Payload JSON cuối cùng gửi đi:", JSON.stringify(payload, null, 2));

    await axios.post('/api/khach-hang', payload,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });


    toast.success("Thêm khách hàng thành công!");
    router.go(-1); // Quay lại trang trước

  } catch (err) {
    console.error('Lỗi khi thêm khách hàng:', err.response?.data || err.message);

    // Kiểm tra xem có thông báo lỗi từ backend không và hiển thị thông báo lỗi chi tiết
    if (err.response && err.response.data) {
      toast.error(`Thêm khách hàng không thành công! ${err.response.data}`);
    } else {
      toast.error("Thêm khách hàng không thành công! Đã có lỗi xảy ra từ máy chủ.");
    }
  }
};

</script>


<style scoped>
/* Reset và Base styles */
body {
  font-family: 'Inter', sans-serif;
  /* Sử dụng font Inter nếu có, hoặc sans-serif chung */
  background-color: #f0f2f5;
  /* Màu nền tổng thể nhạt hơn */
  margin: 0;
  padding: 0;
}


.p-4 {
  padding: 2rem;
  /* Tăng padding tổng thể của trang */
}


/* Header Section (Quay lại và Tiêu đề) */
.header-section {
  display: flex;
  align-items: center;
  /* Căn giữa theo chiều dọc */
  margin-bottom: 2.5rem;
  /* Khoảng cách lớn hơn dưới header */
  gap: 2rem;
  /* Khoảng cách lớn hơn giữa nút và tiêu đề */
}


.back-button {
  background-color: #e9ecef;
  /* Màu xám nhạt */
  color: #495057;
  /* Màu chữ xám đậm */
  padding: 0.75rem 1.25rem;
  /* Tăng padding cho nút */
  border-radius: 0.4rem;
  /* Bo tròn vừa phải */
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
  /* Không co lại */
  font-size: 1rem;
  /* Kích thước font cho nút */
}


.back-button:hover {
  background-color: #dee2e6;
  color: #343a40;
}


.page-title-aligned {
  font-size: 2.2rem;
  /* Tăng kích thước font cho tiêu đề */
  font-weight: 700;
  /* Đậm hơn */
  color: #212529;
  /* Màu chữ rất đậm */
  margin: 0;
  /* Đảm bảo không có margin mặc định */
  line-height: 1;
  /* Căn chỉnh dòng */
}




/* Customer Form */
.customer-form {
  background: white;
  padding: 3rem;
  /* Tăng padding bên trong form */
  border-radius: 1rem;
  /* Bo tròn mạnh hơn */
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1);
  /* Đổ bóng mạnh hơn một chút */
  width: 100%;
  max-width: 1600px;
  /* Tăng kích thước tối đa của form */
  margin: 0 auto;
  /* Căn giữa form */
  display: flex;
  /* Sử dụng flexbox cho form để quản lý grid và footer */
  flex-direction: column;
}


/* Container cho 2 cột mới (đã loại bỏ cột ảnh) */
.form-grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* Hai cột đều nhau */
  gap: 3rem 4rem;
  /* Khoảng cách lớn hơn giữa các cột và hàng */
  margin-bottom: 2.5rem;
  /* Khoảng cách dưới grid trước footer */
  align-items: start;
  /* Căn chỉnh các cột lên đầu */
}


/* Các cột Thông tin cá nhân và Địa chỉ */
.personal-info-column,
.address-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  /* Khoảng cách giữa các cặp label/input */
  padding: 0 0;
  /* Bỏ padding ngang nếu đã có từ các css khác */
  box-sizing: border-box;
}


/* Các Label */
label {
  display: block;
  margin-bottom: 0.35rem;
  /* Khoảng cách nhỏ hơn giữa label và input */
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
  /* Kích thước font lớn hơn */
}


.required-star {
  color: #dc3545;
  /* Màu đỏ cho dấu sao bắt buộc */
  margin-left: 0.25rem;
  font-size: 0.9em;
}


/* Các trường Input và Select */
.form-input {
  width: 100%;
  padding: 0.85rem 1.2rem;
  /* Tăng padding input */
  border: 1px solid #ced4da;
  border-radius: 0.4rem;
  font-size: 1.05rem;
  /* Kích thước font lớn hơn */
  color: #495057;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-sizing: border-box;
  margin-bottom: 0.75rem;
  /* Khoảng cách dưới mỗi input */
}


.form-input:focus {
  border-color: #0a2c57;
  /* Màu xanh đậm khi focus */
  box-shadow: 0 0 0 0.25rem rgba(10, 44, 87, 0.25);
  /* Hiệu ứng focus với màu xanh đậm */
  outline: none;
}


.input-error {
  border-color: #dc3545 !important;
  /* Màu đỏ cho lỗi */
}


/* Giới tính Radio Buttons */
.gender-selection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem;
  /* Khoảng cách trên phần giới tính */
}


.gender-options {
  display: flex;
  gap: 2rem;
  /* Khoảng cách giữa "Nam" và "Nữ" */
}


.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal;
  /* Không in đậm label của radio */
  color: #495057;
  cursor: pointer;
  font-size: 1rem;
}


.radio-input {
  appearance: none;
  /* Bỏ giao diện mặc định của radio button */
  width: 1.25rem;
  /* Kích thước lớn hơn */
  height: 1.25rem;
  border: 2px solid #ced4da;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;
}


.radio-input:checked {
  border-color: #0a2c57;
  /* Màu xanh đậm khi chọn */
}


.radio-input:checked::before {
  content: '';
  width: 0.75rem;
  /* Kích thước chấm tròn bên trong */
  height: 0.75rem;
  background-color: #0a2c57;
  /* Màu xanh đậm cho chấm tròn */
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}


/* Tiêu đề Địa chỉ */
.address-section-title {
  font-size: 1.8rem;
  /* Kích thước lớn hơn */
  font-weight: 700;
  color: #212529;
  margin-bottom: 1.75rem;
  /* Khoảng cách dưới tiêu đề */
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #e9ecef;
}


/* Footer với các nút actions */
.form-actions-footer {
  display: flex;
  justify-content: flex-end;
  /* Đẩy các nút sang phải */
  gap: 1.25rem;
  /* Khoảng cách giữa các nút */
  padding-top: 2rem;
  /* Padding trên */
  border-top: 1px solid #e9ecef;
  /* Đường kẻ phân cách */
  margin-top: auto;
  /* Đẩy footer xuống dưới cùng của form flex container */
}


.button-action {
  /* Class chung cho các nút */
  padding: 0.85rem 1.8rem;
  /* Tăng padding */
  border: none;
  border-radius: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  font-size: 1.05rem;
  /* Kích thước font lớn hơn */
}


.button-secondary {
  background-color: #6c757d;
  /* Giữ màu xám cho nút Hủy */
  color: white;
}


.button-secondary:hover {
  background-color: #5c636a;
  transform: translateY(-1px);
}


.button-primary {
  background-color: #0a2c57;
  /* Màu xanh đậm theo yêu cầu cho nút Lưu */
  color: white;
}


.button-primary:hover {
  background-color: #071f3e;
  /* Màu đậm hơn khi hover */
  transform: translateY(-1px);
}


/* Responsive adjustments */
@media (max-width: 992px) {


  /* Chuyển sang 2 cột trên tablet */
  .form-grid-container {
    grid-template-columns: 1fr 1fr;
    /* 2 cột trên màn hình nhỏ hơn */
    gap: 2rem;
  }


  /* Không cần image-column nữa */
}


@media (max-width: 768px) {


  /* Chuyển sang 1 cột trên điện thoại */
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }


  .page-title-aligned {
    font-size: 1.8rem;
  }


  .form-grid-container {
    grid-template-columns: 1fr;
    /* Chỉ 1 cột */
    gap: 1.5rem;
  }


  .personal-info-column,
  .address-column {
    padding: 0;
    /* Bỏ padding ngang trên mobile */
  }


  .customer-form {
    padding: 2rem;
    /* Giảm padding tổng thể của form trên mobile */
  }
}


.input-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  /* Khoảng cách giữa các nhóm input */
}


/* Điều chỉnh khoảng cách của label và input trong input-group */
.input-group label {
  margin-bottom: 0.35rem;
  /* Giữ khoảng cách nhỏ giữa label và input */
}


/* Bỏ margin-bottom mặc định của form-input nếu nó nằm trong input-group */
.input-group .form-input {
  margin-bottom: 0;
  /* Quan trọng: loại bỏ margin-bottom mặc định để error-message nằm sát */
}


.error-message {
  color: #dc3545;
  /* Màu đỏ */
  font-size: 0.875rem;
  /* Kích thước chữ nhỏ hơn */
  margin-top: 0.25rem;
  /* Khoảng cách nhỏ giữa input và thông báo lỗi */
  display: block;
  /* Đảm bảo nó chiếm một dòng riêng */
}


/* Đã xóa .qr-scan-button-container và .button-qr-scan CSS */
</style>



