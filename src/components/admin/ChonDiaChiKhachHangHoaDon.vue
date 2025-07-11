<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';
import axios from 'axios';
// import Swal from 'sweetalert2'; // Bỏ import SweetAlert2 nếu bạn muốn dùng vue-toastification

// Import useToast từ vue-toastification
import { useToast } from 'vue-toastification';

const props = defineProps({
    khachHangId: {
        type: Number,
        required: true,
    },
});

const emits = defineEmits(['diaChiSelected', 'close']);

const danhSachDiaChi = ref([]);
const loading = ref(true);
const error = ref(null);
const showAddAddressForm = ref(false);

// Sử dụng hook useToast để lấy instance toast đã được cấu hình global
const toast = useToast();

// Các biến cho form thêm địa chỉ mới
const newAddress = ref({
    diaChiChiTiet: '',
    xaPhuong: '', // Sẽ lưu tên xã/phường
    quanHuyen: '', // Sẽ lưu tên quận/huyện
    tinhThanhPho: '', // Sẽ lưu tên tỉnh/thành phố
});
const addAddressError = ref(null);
const addAddressLoading = ref(false);

// Biến để lưu trữ lỗi validation cho từng trường - NOW FOR CUSTOM TOOLTIPS
const validationErrors = ref({
    tinhThanhPho: '',
    quanHuyen: '',
    xaPhuong: '',
    diaChiChiTiet: ''
});

// Biến cho combobox địa chỉ
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);

const selectedProvinceId = ref(null);
const selectedDistrictId = ref(null);
const selectedWardId = ref(null);

// Lấy danh sách địa chỉ từ API khi popup được mở
const fetchDiaChiList = async () => {
    loading.value = true;
    error.value = null;
    try {
        const response = await axios.get(`http://localhost:8080/api/dia-chi/khach-hang/${props.khachHangId}`);
        danhSachDiaChi.value = response.data;
    } catch (err) {
        console.error("Lỗi khi lấy danh sách địa chỉ:", err);
        error.value = "Không thể tải danh sách địa chỉ. Vui lòng thử lại.";
        danhSachDiaChi.value = [];
    } finally {
        loading.value = false;
    }
};

// Hàm lấy danh sách tỉnh/thành phố
const fetchProvinces = async () => {
    try {
        const response = await axios.get('https://provinces.open-api.vn/api/p/'); // Ví dụ API công khai
        provinces.value = response.data;
    } catch (err) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", err);
        toast.error("Không thể tải danh sách tỉnh/thành phố.");
    }
};

// Hàm lấy danh sách quận/huyện theo tỉnh/thành phố
const fetchDistricts = async (provinceCode) => {
    districts.value = [];
    wards.value = [];
    selectedDistrictId.value = null;
    selectedWardId.value = null;
    if (!provinceCode) return;
    try {
        const response = await axios.get(`https://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        districts.value = response.data.districts;
    } catch (err) {
        console.error("Lỗi khi lấy danh sách quận/huyện:", err);
        toast.error("Không thể tải danh sách quận/huyện.");
    }
};

// Hàm lấy danh sách xã/phường theo quận/huyện
const fetchWards = async (districtCode) => {
    wards.value = [];
    selectedWardId.value = null;
    if (!districtCode) return;
    try {
        const response = await axios.get(`https://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        wards.value = response.data.wards;
    } catch (err) {
        console.error("Lỗi khi lấy danh sách xã/phường:", err);
        toast.error("Không thể tải danh sách xã/phường.");
    }
};

onMounted(() => {
    fetchDiaChiList();
    fetchProvinces(); // Lấy danh sách tỉnh/thành phố khi component được mount
});

// Watcher cho selectedProvinceId
watch(selectedProvinceId, (newVal) => {
    fetchDistricts(newVal);
    const selectedProvince = provinces.value.find(p => p.code === newVal);
    newAddress.value.tinhThanhPho = selectedProvince ? selectedProvince.name : '';
    // Xóa lỗi validation khi người dùng chọn lại
    validationErrors.value.tinhThanhPho = '';
});

// Watcher cho selectedDistrictId
watch(selectedDistrictId, (newVal) => {
    fetchWards(newVal);
    const selectedDistrict = districts.value.find(d => d.code === newVal);
    newAddress.value.quanHuyen = selectedDistrict ? selectedDistrict.name : '';
    // Xóa lỗi validation khi người dùng chọn lại
    validationErrors.value.quanHuyen = '';
});

// Watcher cho selectedWardId
watch(selectedWardId, (newVal) => {
    const selectedWard = wards.value.find(w => w.code === newVal);
    newAddress.value.xaPhuong = selectedWard ? selectedWard.name : '';
    // Xóa lỗi validation khi người dùng chọn lại
    validationErrors.value.xaPhuong = '';
});

// Watcher cho diaChiChiTiet để xóa lỗi khi nhập
watch(() => newAddress.value.diaChiChiTiet, (newVal) => {
    if (newVal) {
        validationErrors.value.diaChiChiTiet = '';
    }
});


const selectDiaChi = (diaChi) => {
    emits('diaChiSelected', diaChi);
};

const closePopup = () => {
    emits('close');
};

const getCombinedAddress = (address) => {
    const parts = [];
    if (address.diaChiChiTiet) parts.push(address.diaChiChiTiet);
    if (address.xaPhuong) parts.push(address.xaPhuong);
    if (address.quanHuyen) parts.push(address.quanHuyen);
    if (address.tinhThanhPho) parts.push(address.tinhThanhPho);
    return parts.filter(part => part).join(', ');
};

const openAddAddressForm = () => {
    showAddAddressForm.value = true;
    // Reset form và combobox khi mở
    newAddress.value = {
        diaChiChiTiet: '',
        xaPhuong: '',
        quanHuyen: '',
        tinhThanhPho: '',
    };
    selectedProvinceId.value = null;
    selectedDistrictId.value = null;
    selectedWardId.value = null;
    districts.value = [];
    wards.value = [];
    addAddressError.value = null;
    // Reset lỗi validation
    validationErrors.value = {
        tinhThanhPho: '',
        quanHuyen: '',
        xaPhuong: '',
        diaChiChiTiet: ''
    };
};

const closeAddAddressForm = () => {
    showAddAddressForm.value = false;
};

const handleAddAddress = async () => {
    addAddressLoading.value = true;
    addAddressError.value = null; // Clear general error

    // Reset tất cả lỗi validation trước khi kiểm tra lại
    validationErrors.value = {
        tinhThanhPho: '',
        quanHuyen: '',
        xaPhuong: '',
        diaChiChiTiet: ''
    };

    let isValid = true;

    if (!selectedProvinceId.value) {
        validationErrors.value.tinhThanhPho = "Vui lòng chọn Tỉnh/Thành phố.";
        isValid = false;
    }
    if (!selectedDistrictId.value) {
        validationErrors.value.quanHuyen = "Vui lòng chọn Quận/Huyện.";
        isValid = false;
    }
    if (!selectedWardId.value) {
        validationErrors.value.xaPhuong = "Vui lòng chọn Xã/Phường.";
        isValid = false;
    }
    if (!newAddress.value.diaChiChiTiet) {
        validationErrors.value.diaChiChiTiet = "Vui lòng nhập Địa chỉ chi tiết.";
        isValid = false;
    }

    if (!isValid) {
        addAddressLoading.value = false;
        // Nếu có lỗi validation, có thể hiển thị toast lỗi chung ở đây nếu muốn,
        // nhưng với custom tooltips thì thường không cần.
        toast.error("Vui lòng điền đầy đủ thông tin bắt buộc."); // Thêm toast lỗi chung
        return;
    }

    try {
        const payload = {
            ...newAddress.value,
            khachHangId: props.khachHangId,
        };
        const response = await axios.post(`http://localhost:8080/api/khach-hang/${props.khachHangId}/dia-chi`, payload);
        
        danhSachDiaChi.value.push(response.data);
        
        // Thay đổi thứ tự: hiển thị toast trước, sau đó đóng form.
        // Bạn có thể cân nhắc một setTimeout nhỏ nếu toast quá nhanh và bạn muốn người dùng nhìn thấy nó trước khi form đóng.
        toast.success("Thêm địa chỉ thành công!");
        
        // Gọi fetchDiaChiList để cập nhật danh sách địa chỉ nếu cần
        fetchDiaChiList(); 

        // Đóng form sau khi thành công và có thể đã hiển thị toast
        closeAddAddressForm();
        // Sau đó chọn địa chỉ mới, nếu đó là hành vi mong muốn
        selectDiaChi(response.data); 

    } catch (err) {
        console.error("Lỗi khi thêm địa chỉ mới:", err);
        // Có thể kiểm tra mã lỗi từ err.response.status để hiển thị thông báo cụ thể hơn
        if (err.response && err.response.data && err.response.data.message) {
            toast.error(`Lỗi: ${err.response.data.message}`);
        } else {
            toast.error("Không thể thêm địa chỉ. Vui lòng thử lại.");
        }
    } finally {
        addAddressLoading.value = false;
    }
};
</script>

<template>
    <div class="modal-overlay">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Chọn địa chỉ của khách hàng</h5>
                <button type="button" class="btn-close" @click="closePopup"></button>
            </div>
            <div class="modal-body">
                <div v-if="loading" class="text-center">Đang tải địa chỉ...</div>
                <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
                <div v-else-if="danhSachDiaChi.length === 0" class="text-center">
                    Khách hàng này chưa có địa chỉ nào.
                    <div class="mt-3">
                        <button class="btn btn-primary" @click="openAddAddressForm">
                            <i class="fas fa-plus"></i> Thêm địa chỉ mới
                        </button>
                    </div>
                </div>
                <div v-else>
                    <ul class="list-group">
                        <li v-for="diaChi in danhSachDiaChi" :key="diaChi.id" class="list-group-item d-flex justify-content-between align-items-center">
                            <div>
                                <span v-if="diaChi.tenNguoiNhan"><strong>{{ diaChi.tenNguoiNhan }}</strong> ({{ diaChi.soDienThoaiNguoiNhan }})<br></span>
                                {{ getCombinedAddress(diaChi) }}
                                <span v-if="diaChi.isMacDinh" class="badge bg-primary ms-2">Mặc định</span>
                            </div>
                            <button class="btn btn-sm btn-outline-primary" @click="selectDiaChi(diaChi)">Chọn</button>
                        </li>
                    </ul>
                    <div class="mt-3 text-center">
                        <button class="btn btn-primary" @click="openAddAddressForm">
                            <i class="fas fa-plus"></i> Thêm địa chỉ mới
                        </button>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closePopup">Đóng</button>
            </div>
        </div>

        <div v-if="showAddAddressForm" class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Thêm địa chỉ mới cho khách hàng</h5>
                    <button type="button" class="btn-close" @click="closeAddAddressForm"></button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleAddAddress">
                        <div class="mb-3 position-relative"> <label for="tinhThanhPho" class="form-label">Tỉnh/Thành phố <span class="text-danger">*</span></label>
                            <select 
                                class="form-select" 
                                :class="{'is-invalid-custom': validationErrors.tinhThanhPho}" id="tinhThanhPho" 
                                v-model="selectedProvinceId"
                            >
                                <option :value="null" disabled>Chọn Tỉnh/Thành phố</option>
                                <option v-for="province in provinces" :key="province.code" :value="province.code">
                                    {{ province.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.tinhThanhPho" class="custom-validation-tooltip"> <i class="fas fa-exclamation-triangle"></i> {{ validationErrors.tinhThanhPho }}
                            </div>
                        </div>
                        <div class="mb-3 position-relative"> <label for="quanHuyen" class="form-label">Quận/Huyện <span class="text-danger">*</span></label>
                            <select 
                                class="form-select" 
                                :class="{'is-invalid-custom': validationErrors.quanHuyen}" id="quanHuyen" 
                                v-model="selectedDistrictId" 
                                :disabled="!selectedProvinceId"
                            >
                                <option :value="null" disabled>Chọn Quận/Huyện</option>
                                <option v-for="district in districts" :key="district.code" :value="district.code">
                                    {{ district.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.quanHuyen" class="custom-validation-tooltip"> <i class="fas fa-exclamation-triangle"></i> {{ validationErrors.quanHuyen }}
                            </div>
                        </div>
                        <div class="mb-3 position-relative"> <label for="xaPhuong" class="form-label">Xã/Phường <span class="text-danger">*</span></label>
                            <select 
                                class="form-select" 
                                :class="{'is-invalid-custom': validationErrors.xaPhuong}" id="xaPhuong" 
                                v-model="selectedWardId" 
                                :disabled="!selectedDistrictId"
                            >
                                <option :value="null" disabled>Chọn Xã/Phường</option>
                                <option v-for="ward in wards" :key="ward.code" :value="ward.code">
                                    {{ ward.name }}
                                </option>
                            </select>
                            <div v-if="validationErrors.xaPhuong" class="custom-validation-tooltip"> <i class="fas fa-exclamation-triangle"></i> {{ validationErrors.xaPhuong }}
                            </div>
                        </div>
                        <div class="mb-3 position-relative"> <label for="diaChiChiTiet" class="form-label">Địa chỉ chi tiết (Số nhà, đường) <span class="text-danger">*</span></label>
                            <input 
                                type="text" 
                                class="form-control" 
                                :class="{'is-invalid-custom': validationErrors.diaChiChiTiet}" id="diaChiChiTiet" 
                                v-model="newAddress.diaChiChiTiet"
                            >
                            <div v-if="validationErrors.diaChiChiTiet" class="custom-validation-tooltip"> <i class="fas fa-exclamation-triangle"></i> {{ validationErrors.diaChiChiTiet }}
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-end">
                            <button type="button" class="btn btn-secondary me-2" @click="closeAddAddressForm">Hủy</button>
                            <button type="submit" class="btn btn-primary" :disabled="addAddressLoading">
                                <span v-if="addAddressLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                Thêm địa chỉ
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        </div>
</template>

<style scoped>
/* Giữ nguyên các styles cho modal */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
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
    position: relative;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 15px;
    border-bottom: 1px solid #eee;
    margin-bottom: 15px;
}

.modal-body {
    flex-grow: 1;
    overflow-y: auto;
}

.modal-footer {
    padding-top: 15px;
    border-top: 1px solid #eee;
    margin-top: 15px;
    text-align: right;
}

.list-group-item {
    margin-bottom: 8px;
    border-radius: 5px;
    border: 1px solid #ddd;
}

/* Custom styles for the tooltip-like validation message */
.position-relative {
    position: relative;
}

.custom-validation-tooltip {
    position: absolute;
    top: 50%; /* Adjust as needed, depends on label height */
    left: calc(100% + 10px); /* Position to the right of the input/select */
    transform: translateY(-50%);
    background-color: #ffeeba; /* Yellow background */
    border: 1px solid #ffc107; /* Yellow border */
    color: #856404; /* Dark yellow text */
    padding: 8px 12px;
    border-radius: 5px;
    white-space: nowrap;
    z-index: 10;
    font-size: 0.875em;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);

    display: flex;
    align-items: center;
    gap: 5px; /* Space between icon and text */
}

/* Add a pseudo-element for the triangle "tail" */
.custom-validation-tooltip::before {
    content: '';
    position: absolute;
    top: 50%;
    left: -8px; /* Position it to touch the input */
    transform: translateY(-50%) rotate(45deg);
    width: 14px;
    height: 14px;
    background-color: #ffeeba; /* Match tooltip background */
    border-left: 1px solid #ffc107;
    border-bottom: 1px solid #ffc107;
    z-index: 9;
}

/* Optional: Add a border highlight to the input/select when invalid */
.is-invalid-custom {
    border-color: #ffc107 !important; /* Yellow border */
    box-shadow: 0 0 0 0.25rem rgba(255, 193, 7, 0.25); /* Yellow glow */
}

/* Remove default Bootstrap invalid feedback styles if not needed */
/* The original .invalid-feedback and .is-invalid are effectively replaced by the custom ones */
/* You can safely remove the old .is-invalid and .invalid-feedback definitions if they conflict
    or just let them be, as they won't be applied due to new class names */
</style>