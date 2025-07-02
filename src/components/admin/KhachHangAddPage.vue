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
        <div class="image-column">
          <label class="label-heading">Ảnh đại diện</label>
          <img
            :src="imageUrl || 'https://via.placeholder.com/180?text=No+Image'" alt="Ảnh đại diện"
            class="profile-image-preview"
          />
          <input type="file" @change="handleFileUpload" accept="image/*" id="fileUpload" class="hidden-file-input" />
          <label for="fileUpload" class="button-upload-image">Chọn ảnh</label>
        </div>

        <div class="personal-info-column">
          <div class="input-group"> <label>Họ và tên <span class="required-star">*</span></label>
            <input
              v-model="form.tenKhachHang"
              type="text"
              class="form-input"
              :class="{ 'input-error': showError && errors.tenKhachHang }"
            />
            <span v-if="showError && errors.tenKhachHang" class="error-message">Vui lòng nhập tên hợp lệ.</span>
          </div>

          <div class="input-group"> <label>Email <span class="required-star">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'input-error': showError && errors.email }"
            />
            <span v-if="showError && errors.email" class="error-message">Email không hợp lệ.</span>
          </div>

          <div class="input-group"> <label>Số điện thoại <span class="required-star">*</span></label>
            <input
              v-model="form.soDienThoai"
              type="text"
              class="form-input"
              :class="{ 'input-error': showError && errors.soDienThoai }"
            />
            <span v-if="showError && errors.soDienThoai" class="error-message">Số điện thoại không hợp lệ.</span>
          </div>

          <div class="input-group"> <label>Ngày sinh</label>
            <input
              v-model="form.ngaySinh"
              type="date"
              class="form-input"
              :class="{ 'input-error': showError && errors.ngaySinh }"
            />
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
            <select
              v-model="form.diaChi.idTinhThanhPho"
              @change="onTinhThanhChange"
              class="form-input"
              :class="{ 'input-error': showError && errors.diaChiTinh }"
            >
              <option :value="null">Chọn Tỉnh/Thành Phố</option>
              <option v-for="t in tinhThanhPhos" :key="t.id" :value="t.id">{{ t.tenTinhThanh }}</option>
            </select>
            <span v-if="showError && errors.diaChiTinh" class="error-message">Vui lòng chọn Tỉnh/Thành Phố.</span>
          </div>

          <div class="input-group"> <label>Quận/Huyện</label>
            <select
              :disabled="!form.diaChi.idTinhThanhPho"
              v-model="form.diaChi.idQuanHuyen"
              @change="onQuanHuyenChange"
              class="form-input"
              :class="{ 'input-error': showError && errors.diaChiQuan }"
            >
              <option :value="null">Chọn Quận/Huyện</option>
              <option v-for="q in quanHuyens" :key="q.id" :value="q.id">{{ q.tenQuanHuyen }}</option>
            </select>
            <span v-if="showError && errors.diaChiQuan" class="error-message">Vui lòng chọn Quận/Huyện.</span>
          </div>

          <div class="input-group"> <label>Xã/Phường</label>
            <select
              :disabled="!form.diaChi.idQuanHuyen"
              v-model="form.diaChi.idXaPhuong"
              class="form-input"
              :class="{ 'input-error': showError && errors.diaChiXa }"
            >
              <option :value="null">Chọn Xã/Phường</option>
              <option v-for="x in xaPhuongs" :key="x.id" :value="x.id">{{ x.tenXaPhuong }}</option>
            </select>
            <span v-if="showError && errors.diaChiXa" class="error-message">Vui lòng chọn Xã/Phường.</span>
          </div>

          <div class="input-group"> <label>Địa chỉ chi tiết</label>
            <input
              v-model="form.diaChi.diaChiChiTiet"
              type="text"
              class="form-input"
              :disabled="!form.diaChi.idXaPhuong"
              :class="{ 'input-error': showError && errors.diaChiChiTiet }"
            />
            <span v-if="showError && errors.diaChiChiTiet" class="error-message">Vui lòng chọn Tỉnh/Huyện/Xã trước.</span>
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
import axios from 'axios';
import { useToast } from "vue-toastification";

const router = useRouter();
const toast = useToast();

const showError = ref(false);
const errors = ref({
    tenKhachHang: false,
    email: false,
    soDienThoai: false,
    ngaySinh: false,
    // Địa chỉ - có thể gộp hoặc quản lý riêng nếu muốn thông báo chi tiết
    diaChiTinh: false,
    diaChiQuan: false,
    diaChiXa: false,
    diaChiChiTiet: false, // Dành cho trường hợp nhập chi tiết mà chưa chọn xã/phường
});

const form = ref({
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  gioiTinh: null, // Mặc định là nam
  ngaySinh: null, // Đặt là null thay vì '' cho ngày sinh không bắt buộc
  // trangThai: 1, // Bỏ trường này theo yêu cầu, sẽ được xử lý ở backend
  diaChi: {
    idTinhThanhPho: null,
    idQuanHuyen: null,
    idXaPhuong: null,
    diaChiChiTiet: '',
    isMacDinh: true, // Luôn mặc định cho địa chỉ đầu tiên khi thêm mới
  },
  // Thêm trường để lưu ảnh nếu cần gửi lên backend
  hinhAnhFile: null,
});

const imageUrl = ref(null); // Để hiển thị preview ảnh

const tinhThanhPhos = ref([]);
const quanHuyens = ref([]);
const xaPhuongs = ref([]);

// --- Life Cycle Hooks ---
onMounted(async () => {
  await loadTinhThanh();
});

// --- Watchers for Address Dropdowns ---
watch(() => form.value.diaChi.idTinhThanhPho, async (newVal) => {
  form.value.diaChi.idQuanHuyen = null;
  form.value.diaChi.idXaPhuong = null;
  form.value.diaChi.diaChiChiTiet = '';
  quanHuyens.value = [];
  xaPhuongs.value = [];
  if (newVal) {
    await fetchQuanHuyen(newVal);
  }
});

watch(() => form.value.diaChi.idQuanHuyen, async (newVal) => {
  form.value.diaChi.idXaPhuong = null;
  form.value.diaChi.diaChiChiTiet = '';
  xaPhuongs.value = [];
  if (newVal) {
    await fetchXaPhuong(newVal);
  }
});

// --- Data Fetching Methods ---
const loadTinhThanh = async () => {
  try {
    const response = await axios.get('/api/dia-chi/tinh-thanh');
    tinhThanhPhos.value = response.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Tỉnh/Thành Phố:", err);
    toast.error("Lỗi khi tải Tỉnh/Thành Phố.");
  }
};

const fetchQuanHuyen = async (idTinhThanh) => {
  try {
    const response = await axios.get(`/api/dia-chi/quan-huyen-by-tinh?idTinhThanh=${idTinhThanh}`);
    quanHuyens.value = response.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Quận/Huyện:", err);
    toast.error("Lỗi khi tải Quận/Huyện.");
  }
};

const fetchXaPhuong = async (idQuanHuyen) => {
  try {
    const response = await axios.get(`/api/dia-chi/xa-phuong-by-quan?idQuanHuyen=${idQuanHuyen}`);
    xaPhuongs.value = response.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Xã/Phường:", err);
    toast.error("Lỗi khi tải Xã/Phường.");
  }
};

// --- Validation Methods ---
const validatePhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
// Regex email chặt chẽ hơn, xử lý nhiều trường hợp hơn
const validateEmail = (email) => {
    if (!email) return false;
    // Regex cho phép ký tự chữ cái, số, ., _, %, +, - trước @
    // Sau @ là tên miền (chữ cái, số, .), kết thúc bằng ít nhất 2 chữ cái sau dấu chấm cuối cùng
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
};

// Cho phép ký tự tiếng Việt, khoảng trắng, dấu nháy đơn, dấu gạch ngang
const isFullName = (name) => {
  const regex = /^[a-zA-Z\u00C0-\u1EF9\s'-]+$/;
  return name && name.trim().length > 0 && regex.test(name);
};

const isAdult = (birthDateString) => {
    if (!birthDateString) return true; // Nếu không nhập ngày sinh thì không cần check tuổi

    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age >= 16; // Kiểm tra trên 16 tuổi
};

// --- Image Upload Handler ---
const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    form.value.hinhAnhFile = file;
    imageUrl.value = URL.createObjectURL(file); // Tạo URL tạm thời để hiển thị ảnh
  } else {
    form.value.hinhAnhFile = null;
    imageUrl.value = null;
  }
};

// --- Form Handlers ---
const goBack = () => {
  router.push('/khach-hang');
};

const handleSubmit = async () => {
    showError.value = true;

    // RESET TẤT CẢ CÁC CỜ LỖI TRƯỚC KHI VALIDATE LẠI
    errors.value.tenKhachHang = false;
    errors.value.email = false;
    errors.value.soDienThoai = false;
    errors.value.ngaySinh = false;
    errors.value.diaChiTinh = false;
    errors.value.diaChiQuan = false;
    errors.value.diaChiXa = false;
    errors.value.diaChiChiTiet = false;

    let formIsValid = true;

    // VALIDATION CHO THÔNG TIN CÁ NHÂN
    if (!form.value.tenKhachHang) {
        errors.value.tenKhachHang = true;
        formIsValid = false;
    } else if (!isFullName(form.value.tenKhachHang)) {
        errors.value.tenKhachHang = true;
        formIsValid = false;
    }

    if (!form.value.email) {
        errors.value.email = true;
        formIsValid = false;
    } else if (!validateEmail(form.value.email)) {
        errors.value.email = true;
        formIsValid = false;
    }

    if (!form.value.soDienThoai) {
        errors.value.soDienThoai = true;
        formIsValid = false;
    } else if (!validatePhone(form.value.soDienThoai)) {
        errors.value.soDienThoai = true;
        formIsValid = false;
    }

    if (form.value.ngaySinh && !isAdult(form.value.ngaySinh)) {
        errors.value.ngaySinh = true;
        formIsValid = false;
    }

    // VALIDATION CHO ĐỊA CHỈ
    const diaChi = form.value.diaChi;
    const hasPartialAddress = diaChi.idTinhThanhPho || diaChi.idQuanHuyen || diaChi.idXaPhuong || diaChi.diaChiChiTiet;

    if (hasPartialAddress) {
        if (!diaChi.idTinhThanhPho) {
            errors.value.diaChiTinh = true;
            formIsValid = false;
        }
        if (!diaChi.idQuanHuyen) {
            errors.value.diaChiQuan = true;
            formIsValid = false;
        }
        if (!diaChi.idXaPhuong) {
            errors.value.diaChiXa = true;
            formIsValid = false;
        }
        if (diaChi.diaChiChiTiet && !diaChi.idXaPhuong) {
            errors.value.diaChiChiTiet = true;
            formIsValid = false;
        }
    }

    if (!formIsValid) {
        toast.error("Thêm khách hàng không thành công! Vui lòng kiểm tra lại thông tin.");
        return;
    }

    // *** ĐÂY LÀ PHẦN SỬA ĐỔI QUAN TRỌNG NHẤT ***
    try {
        const payload = {
            tenKhachHang: form.value.tenKhachHang,
            email: form.value.email,
            soDienThoai: form.value.soDienThoai,
            gioiTinh: form.value.gioiTinh,
            ngaySinh: form.value.ngaySinh,
            // trangThai sẽ được backend tự động set là 1
            // hinhAnh sẽ không được gửi từ frontend lúc này
        };

        // Xử lý địa chỉ: Nếu không nhập địa chỉ nào thì gửi null, ngược lại thì gửi đầy đủ
        if (!hasPartialAddress) {
            payload.diaChi = null;
        } else {
            payload.diaChi = {
                idTinhThanhPho: form.value.diaChi.idTinhThanhPho,
                idQuanHuyen: form.value.diaChi.idQuanHuyen,
                idXaPhuong: form.value.diaChi.idXaPhuong,
                diaChiChiTiet: form.value.diaChi.diaChiChiTiet,
                isMacDinh: true,
            };
        }
        
        // Log payload cuối cùng để kiểm tra (rất hữu ích cho debug)
        console.log("Payload JSON cuối cùng gửi đi:", JSON.stringify(payload, null, 2));

        // Gửi request POST với payload JSON. Axios sẽ tự động đặt Content-Type: application/json
        await axios.post('/api/khach-hang', payload);

        toast.success("Thêm khách hàng thành công!");
        router.push('/khach-hang');
    } catch (err) {
        console.error('Lỗi khi thêm khách hàng:', err.response?.data || err.message);
        toast.error("Thêm khách hàng không thành công! Đã có lỗi xảy ra từ máy chủ.");
    }
};
</script>

<style scoped>
/* Reset và Base styles */
body {
  font-family: 'Inter', sans-serif; /* Sử dụng font Inter nếu có, hoặc sans-serif chung */
  background-color: #f0f2f5; /* Màu nền tổng thể nhạt hơn */
  margin: 0;
  padding: 0;
}

.p-4 {
  padding: 2rem; /* Tăng padding tổng thể của trang */
}

/* Header Section (Quay lại và Tiêu đề) */
.header-section {
  display: flex;
  align-items: center; /* Căn giữa theo chiều dọc */
  margin-bottom: 2.5rem; /* Khoảng cách lớn hơn dưới header */
  gap: 2rem; /* Khoảng cách lớn hơn giữa nút và tiêu đề */
}

.back-button {
  background-color: #e9ecef; /* Màu xám nhạt */
  color: #495057; /* Màu chữ xám đậm */
  padding: 0.75rem 1.25rem; /* Tăng padding cho nút */
  border-radius: 0.4rem; /* Bo tròn vừa phải */
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0; /* Không co lại */
  font-size: 1rem; /* Kích thước font cho nút */
}

.back-button:hover {
  background-color: #dee2e6;
  color: #343a40;
}

.page-title-aligned {
  font-size: 2.2rem; /* Tăng kích thước font cho tiêu đề */
  font-weight: 700; /* Đậm hơn */
  color: #212529; /* Màu chữ rất đậm */
  margin: 0; /* Đảm bảo không có margin mặc định */
  line-height: 1; /* Căn chỉnh dòng */
}


/* Customer Form */
.customer-form {
  background: white;
  padding: 3rem; /* Tăng padding bên trong form */
  border-radius: 1rem; /* Bo tròn mạnh hơn */
  box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.1); /* Đổ bóng mạnh hơn một chút */
  width: 100%;
  max-width: 1600px; /* Tăng kích thước tối đa của form */
  margin: 0 auto; /* Căn giữa form */
  display: flex; /* Sử dụng flexbox cho form để quản lý grid và footer */
  flex-direction: column;
}

/* Container cho 3 cột */
.form-grid-container {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.5fr; /* Tỷ lệ 1:1.5:1.5 cho Ảnh:Thông tin:Địa chỉ */
  gap: 3rem 4rem; /* Khoảng cách lớn hơn giữa các cột và hàng */
  margin-bottom: 2.5rem; /* Khoảng cách dưới grid trước footer */
  align-items: start; /* Căn chỉnh các cột lên đầu */
}

/* Cột Ảnh đại diện */
.image-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem; /* Padding nhẹ xung quanh ảnh */
  border-right: 1px solid #e9ecef; /* Đường phân cách bên phải */
  box-sizing: border-box; /* Đảm bảo padding không làm tràn */
}

.label-heading {
  font-weight: 600;
  color: #495057;
  margin-bottom: 1.25rem; /* Tăng khoảng cách */
  font-size: 1.05rem; /* Kích thước font lớn hơn */
}

.profile-image-preview {
  width: 11.5rem; /* Khoảng 180px */
  height: 11.5rem; /* Khoảng 180px */
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #ced4da; /* Viền dày hơn */
  box-shadow: 0 0.35rem 0.7rem rgba(0, 0, 0, 0.08); /* Đổ bóng nhẹ hơn cho ảnh */
  margin-bottom: 1.25rem;
}

.hidden-file-input {
  display: none;
}

.button-upload-image {
  background-color: #0a2c57; /* Màu xanh đậm theo yêu cầu */
  color: white;
  padding: 0.8rem 1.6rem; /* Tăng padding */
  border-radius: 0.4rem;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease-in-out;
  display: inline-block;
  text-align: center;
  font-size: 1rem; /* Kích thước font cho nút */
}

.button-upload-image:hover {
  background-color: #071f3e; /* Màu đậm hơn khi hover */
}

/* Cột Thông tin cá nhân và Địa chỉ */
.personal-info-column,
.address-column {
  display: flex;
  flex-direction: column;
  gap: 1.25rem; /* Khoảng cách giữa các cặp label/input */
  padding: 0 1.5rem; /* Padding ngang cho các cột nội dung */
  box-sizing: border-box;
}

/* Các Label */
label {
  display: block;
  margin-bottom: 0.35rem; /* Khoảng cách nhỏ hơn giữa label và input */
  font-weight: 600;
  color: #495057;
  font-size: 1rem; /* Kích thước font lớn hơn */
}

.required-star {
  color: #dc3545; /* Màu đỏ cho dấu sao bắt buộc */
  margin-left: 0.25rem;
  font-size: 0.9em;
}

/* Các trường Input và Select */
.form-input {
  width: 100%;
  padding: 0.85rem 1.2rem; /* Tăng padding input */
  border: 1px solid #ced4da;
  border-radius: 0.4rem;
  font-size: 1.05rem; /* Kích thước font lớn hơn */
  color: #495057;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-sizing: border-box;
  margin-bottom: 0.75rem; /* Khoảng cách dưới mỗi input */
}

.form-input:focus {
  border-color: #0a2c57; /* Màu xanh đậm khi focus */
  box-shadow: 0 0 0 0.25rem rgba(10, 44, 87, 0.25); /* Hiệu ứng focus với màu xanh đậm */
  outline: none;
}

.input-error {
  border-color: #dc3545 !important; /* Màu đỏ cho lỗi */
}

/* Giới tính Radio Buttons */
.gender-selection {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.5rem; /* Khoảng cách trên phần giới tính */
}

.gender-options {
  display: flex;
  gap: 2rem; /* Khoảng cách giữa "Nam" và "Nữ" */
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: normal; /* Không in đậm label của radio */
  color: #495057;
  cursor: pointer;
  font-size: 1rem;
}

.radio-input {
  appearance: none; /* Bỏ giao diện mặc định của radio button */
  width: 1.25rem; /* Kích thước lớn hơn */
  height: 1.25rem;
  border: 2px solid #ced4da;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;
}

.radio-input:checked {
  border-color: #0a2c57; /* Màu xanh đậm khi chọn */
}

.radio-input:checked::before {
  content: '';
  width: 0.75rem; /* Kích thước chấm tròn bên trong */
  height: 0.75rem;
  background-color: #0a2c57; /* Màu xanh đậm cho chấm tròn */
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Tiêu đề Địa chỉ */
.address-section-title {
  font-size: 1.8rem; /* Kích thước lớn hơn */
  font-weight: 700;
  color: #212529;
  margin-bottom: 1.75rem; /* Khoảng cách dưới tiêu đề */
  padding-bottom: 0.85rem;
  border-bottom: 1px solid #e9ecef;
}

/* Footer với các nút actions */
.form-actions-footer {
  display: flex;
  justify-content: flex-end; /* Đẩy các nút sang phải */
  gap: 1.25rem; /* Khoảng cách giữa các nút */
  padding-top: 2rem; /* Padding trên */
  border-top: 1px solid #e9ecef; /* Đường kẻ phân cách */
  margin-top: auto; /* Đẩy footer xuống dưới cùng của form flex container */
}

.button-action { /* Class chung cho các nút */
  padding: 0.85rem 1.8rem; /* Tăng padding */
  border: none;
  border-radius: 0.4rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, transform 0.1s ease-in-out;
  font-size: 1.05rem; /* Kích thước font lớn hơn */
}

.button-secondary {
  background-color: #6c757d; /* Giữ màu xám cho nút Hủy */
  color: white;
}

.button-secondary:hover {
  background-color: #5c636a;
  transform: translateY(-1px);
}

.button-primary {
  background-color: #0a2c57; /* Màu xanh đậm theo yêu cầu cho nút Lưu */
  color: white;
}

.button-primary:hover {
  background-color: #071f3e; /* Màu đậm hơn khi hover */
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 992px) { /* Chuyển sang 2 cột trên tablet */
  .form-grid-container {
    grid-template-columns: 1fr 1fr; /* 2 cột trên màn hình nhỏ hơn */
    gap: 2rem;
  }
  .image-column {
    grid-column: span 2; /* Ảnh chiếm cả 2 cột */
    border-right: none; /* Bỏ đường phân cách */
    padding-bottom: 0; /* Bỏ padding dưới */
  }
}

@media (max-width: 768px) { /* Chuyển sang 1 cột trên điện thoại */
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .page-title-aligned {
    font-size: 1.8rem;
  }

  .form-grid-container {
    grid-template-columns: 1fr; /* Chỉ 1 cột */
    gap: 1.5rem;
  }

  .image-column {
    padding-bottom: 1.5rem; /* Thêm lại khoảng cách dưới ảnh nếu cần */
    border-bottom: 1px solid #e9ecef; /* Thêm đường phân cách dưới ảnh */
    padding-right: 0; /* Bỏ padding phải */
  }

  .personal-info-column,
  .address-column {
    padding: 0; /* Bỏ padding ngang trên mobile */
  }

  .customer-form {
    padding: 2rem; /* Giảm padding tổng thể của form trên mobile */
  }
}

.input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem; /* Khoảng cách giữa các nhóm input */
}

/* Điều chỉnh khoảng cách của label và input trong input-group */
.input-group label {
    margin-bottom: 0.35rem; /* Giữ khoảng cách nhỏ giữa label và input */
}

/* Bỏ margin-bottom mặc định của form-input nếu nó nằm trong input-group */
.input-group .form-input {
    margin-bottom: 0; /* Quan trọng: loại bỏ margin-bottom mặc định để error-message nằm sát */
}

.error-message {
    color: #dc3545; /* Màu đỏ */
    font-size: 0.875rem; /* Kích thước chữ nhỏ hơn */
    margin-top: 0.25rem; /* Khoảng cách nhỏ giữa input và thông báo lỗi */
    display: block; /* Đảm bảo nó chiếm một dòng riêng */
}

</style>
 