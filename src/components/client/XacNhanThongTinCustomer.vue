<template>
  <div
    class="onboarding-wrapper d-flex align-items-center justify-content-center min-vh-100"
  >
    <div class="orb"></div>


    <div
      class="form-card bg-white shadow rounded-4 p-4 w-100"
      style="max-width: 520px; position: relative; z-index: 1"
    >
      <div class="mb-4">
        <div class="progress" style="height: 8px">
          <div
            class="progress-bar"
            :style="{width: (step / 4) * 100 + '%'}"
          ></div>
        </div>
        <div class="d-flex justify-content-between small text-muted mt-1">
          <span>Bước 1</span>
          <span>Bước 2</span>
          <span>Bước 3</span>
          <span>Bước 4</span>
        </div>
      </div>


      <h3 class="text-center fw-bold mb-4">Onboarding</h3>


      <transition name="fade" mode="out-in">
        <!-- Step 1: Phone & Password -->
        <div v-if="step === 1" key="step1">
          <div class="mb-3">
            <label class="form-label fw-semibold">Số điện thoại</label>
            <input
              v-model="form.phone"
              type="text"
              class="form-control form-control-lg"
              placeholder="Nhập số điện thoại"
            />
            <small class="text-danger" v-if="errors.phone">{{
              errors.phone
            }}</small>
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Mật khẩu</label>
            <input
              v-model="form.password"
              type="password"
              class="form-control form-control-lg"
              placeholder="Nhập mật khẩu"
            />
            <small class="text-danger" v-if="errors.password">{{
              errors.password
            }}</small>
          </div>
          <button
            class="btn btn-primary w-100 btn-lg rounded-pill"
            @click="validateStep1"
          >
            Tiếp tục
          </button>
        </div>


        <!-- Step 2: Personal Info -->
        <div v-else-if="step === 2" key="step2">
          <div class="mb-3">
            <label class="form-label fw-semibold">Ngày sinh</label>
            <input
              v-model="form.birthdate"
              type="date"
              class="form-control form-control-lg"
            />
            <small class="text-danger" v-if="errors.birthdate">{{
              errors.birthdate
            }}</small>
          </div>
          <div class="mb-4">
            <label class="form-label fw-semibold">Giới tính</label>
            <select v-model="form.gender" class="form-select form-select-lg">
              <option value="" disabled>Chọn giới tính</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
              <option value="Khác">Khác</option>
            </select>
            <small class="text-danger" v-if="errors.gender">{{
              errors.gender
            }}</small>
          </div>
          <div class="d-flex justify-content-between">
            <button
              class="btn btn-outline-secondary btn-lg rounded-pill"
              @click="prevStep"
            >
              Quay lại
            </button>
            <button
              class="btn btn-primary btn-lg rounded-pill"
              @click="validateStep2"
            >
              Tiếp tục
            </button>
          </div>
        </div>


        <!-- Step 3: Address -->
        <div v-else-if="step === 3" key="step3">
          <div class="mb-3">
            <label class="form-label fw-semibold">Tỉnh/Thành phố</label>
            <select
              v-model="form.tinh_thanh_pho"
              class="form-select form-select-lg"
              @change="onProvinceChange"
              :disabled="loadingProvinces"
            >
              <option value="" disabled>
                {{ loadingProvinces ? 'Đang tải...' : 'Chọn tỉnh/thành phố' }}
              </option>
              <option
                v-for="province in provinces"
                :key="province.code"
                :value="province.code"
              >
                {{ province.name }}
              </option>
            </select>
            <small class="text-danger" v-if="errors.tinh_thanh_pho">{{
              errors.tinh_thanh_pho
            }}</small>
          </div>


          <div class="mb-3">
            <label class="form-label fw-semibold">Quận/Huyện</label>
            <select
              v-model="form.quan_huyen"
              class="form-select form-select-lg"
              @change="onDistrictChange"
              :disabled="!form.tinh_thanh_pho || loadingDistricts"
            >
              <option value="" disabled>
                {{ loadingDistricts ? 'Đang tải...' : 'Chọn quận/huyện' }}
              </option>
              <option
                v-for="district in districts"
                :key="district.code"
                :value="district.code"
              >
                {{ district.name }}
              </option>
            </select>
            <small class="text-danger" v-if="errors.quan_huyen">{{
              errors.quan_huyen
            }}</small>
          </div>


          <div class="mb-3">
            <label class="form-label fw-semibold">Xã/Phường</label>
            <select
              v-model="form.xa_phuong"
              class="form-select form-select-lg"
              :disabled="!form.quan_huyen || loadingWards"
            >
              <option value="" disabled>
                {{ loadingWards ? 'Đang tải...' : 'Chọn xã/phường' }}
              </option>
              <option
                v-for="ward in wards"
                :key="ward.code"
                :value="ward.code"
              >
                {{ ward.name }}
              </option>
            </select>
            <small class="text-danger" v-if="errors.xa_phuong">{{
              errors.xa_phuong
            }}</small>
          </div>


          <div class="mb-4">
            <label class="form-label fw-semibold">Địa chỉ chi tiết</label>
            <textarea
              v-model="form.dia_chi_chi_tiet"
              class="form-control"
              rows="3"
              placeholder="Nhập địa chỉ chi tiết (số nhà, tên đường...)"
            ></textarea>
            <small class="text-danger" v-if="errors.dia_chi_chi_tiet">{{
              errors.dia_chi_chi_tiet
            }}</small>
          </div>


          <div class="d-flex justify-content-between">
            <button
              class="btn btn-outline-secondary btn-lg rounded-pill"
              @click="prevStep"
            >
              Quay lại
            </button>
            <button
              class="btn btn-primary btn-lg rounded-pill"
              @click="validateStep3"
            >
              Tiếp tục
            </button>
          </div>
        </div>


        <!-- Step 4: Confirmation -->
        <div v-else-if="step === 4" key="step4">
          <h5 class="fw-bold mb-3 text-center">Xác nhận thông tin</h5>
          <div class="summary p-3 mb-4 rounded bg-light">
            <p><strong>Số điện thoại:</strong> {{ form.phone }}</p>
            <p><strong>Ngày sinh:</strong> {{ formatDate(form.birthdate) }}</p>
            <p><strong>Mật khẩu:</strong> ********</p>
            <p><strong>Giới tính:</strong> {{ form.gender }}</p>
            <p><strong>Địa chỉ:</strong> {{ getFullAddress() }}</p>
            <p><strong>Địa chỉ chi tiết:</strong> {{ form.dia_chi_chi_tiet || 'Không có' }}</p>
          </div>
          <div class="d-flex justify-content-between">
            <button
              class="btn btn-outline-secondary btn-lg rounded-pill"
              @click="prevStep"
            >
              Quay lại
            </button>
            <button
              class="btn btn-success btn-lg rounded-pill"
              @click="submitForm"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Đang xử lý...' : 'Hoàn tất' }}
            </button>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>


<script setup>
import axios from "axios";
import { reactive, ref, onMounted } from "vue";


function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift();
}


const email = getCookie("email");
console.log("JWT:", email);


const step = ref(1);
const isSubmitting = ref(false);


// Loading states
const loadingProvinces = ref(false);
const loadingDistricts = ref(false);
const loadingWards = ref(false);


// Address data
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);


const form = reactive({
  email: email || "", // Đảm bảo có giá trị mặc định nếu cookie không tồn tại
  phone: "",
  birthdate: "",
  password: "",
  gender: null, // Sử dụng null thay vì "" để tương thích với Boolean
  tinh_thanh_pho: "",
  quan_huyen: "",
  xa_phuong: "",
  dia_chi_chi_tiet: "",
});


const errors = reactive({
  phone: "",
  birthdate: "",
  password: "",
  gender: "",
  tinh_thanh_pho: "",
  quan_huyen: "",
  xa_phuong: "",
  dia_chi_chi_tiet: "",
});


// API calls for address data
const fetchProvinces = async () => {
  try {
    loadingProvinces.value = true;
    const response = await fetch("https://provinces.open-api.vn/api/p/");
    const data = await response.json();
    provinces.value = data;
  } catch (error) {
    console.error("Error fetching provinces:", error);
    alert("Không thể tải danh sách tỉnh/thành phố");
  } finally {
    loadingProvinces.value = false;
  }
};


const fetchDistricts = async (provinceCode) => {
  try {
    loadingDistricts.value = true;
    const response = await fetch(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
    const data = await response.json();
    districts.value = data.districts || [];
  } catch (error) {
    console.error("Error fetching districts:", error);
    alert("Không thể tải danh sách quận/huyện");
  } finally {
    loadingDistricts.value = false;
  }
};


const fetchWards = async (districtCode) => {
  try {
    loadingWards.value = true;
    const response = await fetch(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
    const data = await response.json();
    wards.value = data.wards || [];
  } catch (error) {
    console.error("Error fetching wards:", error);
    alert("Không thể tải danh sách xã/phường");
  } finally {
    loadingWards.value = false;
  }
};


// Event handlers
const onProvinceChange = () => {
  form.quan_huyen = "";
  form.xa_phuong = "";
  districts.value = [];
  wards.value = [];


  if (form.tinh_thanh_pho) {
    fetchDistricts(form.tinh_thanh_pho);
  }
};


const onDistrictChange = () => {
  form.xa_phuong = "";
  wards.value = [];


  if (form.quan_huyen) {
    fetchWards(form.quan_huyen);
  }
};


// Validation functions
const validateStep1 = () => {
  errors.phone = "";
  errors.password = "";


  const phoneRegex = /^[0-9]{10}$/;
  if (!form.phone) {
    errors.phone = "Vui lòng nhập số điện thoại";
  } else if (!phoneRegex.test(form.phone)) {
    errors.phone = "Số điện thoại không hợp lệ";
  }


  if (!form.password) {
    errors.password = "Vui lòng nhập mật khẩu";
  } else if (form.password.length < 6) {
    errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
  }


  if (!errors.phone && !errors.password) {
    nextStep();
  }
};


const validateStep2 = () => {
  errors.birthdate = "";
  errors.gender = "";


  if (!form.birthdate) {
    errors.birthdate = "Vui lòng chọn ngày sinh";
  } else {
    const birthDateObj = new Date(form.birthdate);
    const today = new Date();
    const minAgeDate = new Date();
    minAgeDate.setFullYear(today.getFullYear() - 15);


    if (birthDateObj > today) {
      errors.birthdate = "Ngày sinh không được trong tương lai";
    } else if (birthDateObj > minAgeDate) {
      errors.birthdate = "Bạn phải ít nhất 15 tuổi";
    }
  }


  if (form.gender === null || form.gender === "") {
    errors.gender = "Vui lòng chọn giới tính";
  }


  if (!errors.birthdate && !errors.gender) {
    nextStep();
  }
};


const validateStep3 = () => {
  errors.tinh_thanh_pho = "";
  errors.quan_huyen = "";
  errors.xa_phuong = "";
  errors.dia_chi_chi_tiet = "";


  if (!form.tinh_thanh_pho) {
    errors.tinh_thanh_pho = "Vui lòng chọn tỉnh/thành phố";
  }


  if (!form.quan_huyen) {
    errors.quan_huyen = "Vui lòng chọn quận/huyện";
  }


  if (!form.xa_phuong) {
    errors.xa_phuong = "Vui lòng chọn xã/phường";
  }


  if (!form.dia_chi_chi_tiet) {
    errors.dia_chi_chi_tiet = "Vui lòng nhập địa chỉ chi tiết";
  }


  if (!errors.tinh_thanh_pho && !errors.quan_huyen && !errors.xa_phuong && !errors.dia_chi_chi_tiet) {
    nextStep();
  }
};


// Utility functions
const getFullAddress = () => {
  const provinceName = provinces.value.find((p) => p.code == form.tinh_thanh_pho)?.name || "";
  const districtName = districts.value.find((d) => d.code == form.quan_huyen)?.name || "";
  const wardName = wards.value.find((w) => w.code == form.xa_phuong)?.name || "";


  return [wardName, districtName, provinceName].filter(Boolean).join(", ");
};


const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("vi-VN");
};


const nextStep = () => {
  if (step.value < 4) step.value++;
};


const prevStep = () => {
  if (step.value > 1) step.value--;
};


const submitForm = async () => {
  try {
    isSubmitting.value = true;


    // Validate all steps before submitting
    validateStep1();
    validateStep2();
    validateStep3();


    // Check if there are any errors
    const hasErrors = Object.values(errors).some((error) => error !== "");
    if (hasErrors) {
      alert("Vui lòng sửa các lỗi trước khi gửi!");
      return;
    }


    // Prepare form data
    const formData = {
      ...form,
      // Đảm bảo birthdate là định dạng hợp lệ (YYYY-MM-DD)
      birthdate: form.birthdate ? new Date(form.birthdate).toISOString().split("T")[0] : null,
      // Chuyển gender thành true/false
      gender: form.gender === "true" || form.gender === true,
    };


    // Gửi dữ liệu đến API
    const response = await axios.post("http://localhost:8080/cap-nhat-thong-tin", formData, {
      headers: {
        "Content-Type": "application/json",
      },
    });


    console.log("Success:", response.data);
    // alert("Onboarding hoàn tất!\n" + JSON.stringify(formData, null, 2));
    window.location.href="/coolmen"
  } catch (error) {
    console.error("Error submitting form:", error.response ? error.response.data : error.message);
    alert("Có lỗi xảy ra, vui lòng thử lại: " + (error.response?.data?.message || error.message));
  } finally {
    isSubmitting.value = false;
  }
};


// Initialize
onMounted(() => {
  fetchProvinces();
});
</script>
<style scoped>
.onboarding-wrapper {
  position: relative;
  overflow: hidden;
  background: #f0f8ff;
}


.orb {
  position: absolute;
  width: 520px;
  height: 520px;
  left: 8%;
  top: 50%;
  transform: translateY(-50%);
  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 30%,
    rgba(255, 180, 170, 0.95),
    rgba(180, 210, 245, 0.85) 40%,
    rgba(240, 200, 220, 0.7) 70%,
    rgba(255, 255, 255, 0.05)
  );
  filter: blur(6px);
  box-shadow: inset -40px -30px 80px rgba(0, 0, 0, 0.06),
    0 30px 80px rgba(0, 0, 0, 0.08);
  pointer-events: none;
}


.progress-bar {
  background: linear-gradient(90deg, #4facfe, #00f2fe);
}


.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}


.form-select:disabled,
.form-control:disabled {
  background-color: #e9ecef;
  opacity: 0.65;
}
</style>



