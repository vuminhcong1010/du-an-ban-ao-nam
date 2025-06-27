<template>
  <div class="page-container">
    <div class="header-section">
      <button @click="goBack" class="back-button">
        <i class="fas fa-arrow-left"></i> Quay lại
      </button>
      <h2 class="page-title">Sửa khách hàng</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="customer-form">
      <div class="form-grid-container-edit">
        <div class="image-column">
          <label class="label-heading">Ảnh đại diện</label>
          <img
            :src="imageUrl || form.hinhAnhUrl || 'https://via.placeholder.com/180?text=No+Image'"
            alt="Ảnh đại diện"
            class="profile-image-preview"
          />
          <input type="file" @change="handleFileUpload" accept="image/*" id="fileUpload" class="hidden-file-input" />
          <label for="fileUpload" class="button-upload-image">Đổi ảnh</label>
        </div>

        <div class="personal-info-section">
          <div class="input-group">
            <label>Họ và tên <span class="required-star">*</span></label>
            <input
              v-model="form.tenKhachHang"
              type="text"
              class="form-input"
              :class="{ 'error-input': showError && !isFullName(form.tenKhachHang) }"
            />
            <span v-if="showError && !isFullName(form.tenKhachHang)" class="error-message">Vui lòng nhập tên chính xác</span>
          </div>

          <div class="input-group">
            <label>Email <span class="required-star">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              :class="{ 'error-input': showError && (errors.email || !form.email) }"
            />
            <span v-if="showError && errors.email" class="error-message">Email không hợp lệ</span>
            <span v-else-if="showError && !form.email" class="error-message">Trường này là bắt buộc</span>
          </div>

          <div class="input-group">
            <label>Số điện thoại <span class="required-star">*</span></label>
            <input
              v-model="form.soDienThoai"
              type="text"
              class="form-input"
              :class="{ 'error-input': showError && (errors.soDienThoai || !form.soDienThoai) }"
            />
            <span v-if="showError && errors.soDienThoai" class="error-message">Số điện thoại không hợp lệ</span>
            <span v-else-if="showError && !form.soDienThoai" class="error-message">Trường này là bắt buộc</span>
          </div>

          <div class="input-group">
            <label>Ngày sinh</label>
            <input v-model="form.ngaySinh" type="date" class="form-input" placeholder="dd/mm/yyyy" />
            <span v-if="showError && form.ngaySinh && !isAdult(form.ngaySinh)" class="error-message">Khách hàng phải từ 16 tuổi trở lên.</span>
          </div>

          <div class="input-group gender-row">
            <label>Giới tính</label>
            <div class="gender-group">
              <label class="radio-label">
                <input type="radio" value="true" v-model="form.gioiTinh" class="radio-input" /> Nam
              </label>
              <label class="radio-label">
                <input type="radio" value="false" v-model="form.gioiTinh" class="radio-input" /> Nữ
              </label>
            </div>
          </div>

          <div class="input-group">
            <label>Trạng thái</label>
            <select v-model="form.trangThai" class="form-input">
              <option :value="1">Đang hoạt động</option>
              <option :value="0">Ngừng hoạt động</option>
            </select>
          </div>
        </div>

        <div class="address-column">
          <h3>Địa chỉ của khách hàng
            <button type="button" @click="openAddressModalForAdd" class="add-address-button">
              <i class="fas fa-plus"></i> 
            </button>
          </h3>

          <ul v-if="addresses.length > 0" class="address-list">
            <li v-for="(address, index) in addresses" :key="address.id" class="address-item">
              <div class="address-wrapper">
                <div v-if="address.isMacDinh" class="default-label">Mặc định</div>
                <div class="address-content" :class="{ 'is-default': address.isMacDinh }">
                  <input type="checkbox"
                         :checked="address.isMacDinh"
                         @change="setDefaultAddress(address)"
                         :id="'checkbox-' + address.id"
                         class="address-checkbox"
                         :disabled="addresses.length <= 1 && address.isMacDinh" />
                  <label :for="'checkbox-' + address.id">{{ address.diaChi }}</label>
                </div>
              </div>
              <div class="address-actions">
                <button type="button" @click="editAddressInPopup(address)" class="action-button edit-button"> <i class="fas fa-edit"></i></button>
                <button type="button" @click="deleteAddress(address.id)" class="action-button delete-button"><i class="fas fa-trash-alt"></i></button>
              </div>
            </li>
          </ul>
          <p v-else class="no-address-message">Khách hàng chưa có địa chỉ nào.</p>
        </div>
      </div>

      <div class="form-footer">
        <button type="button" class="btn btn-secondary" @click="goBack">Huỷ</button>
        <button type="submit" class="btn btn-primary">Cập nhật</button>
      </div>
    </form>

    <AddressModal
    :show="showAddressModal"
    :initialAddress="selectedAddressForEdit"
    :customerId="form.id"
    @close="showAddressModal = false"
    @address-saved="handleAddressSaved" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from "vue-toastification";
import AddressModal from '../../components/admin/AddressModal.vue'; // Điều chỉnh lại đường dẫn
import { Edit, Trash } from 'lucide-vue-next';

const components = {
  Edit, Trash, AddressModal
};

const route = useRoute();
const router = useRouter();
const toast = useToast();

const showError = ref(false);

const errors = ref({
  email: false,
  soDienThoai: false,
    ngaySinh: false, // <-- Thêm lỗi cho ngày sinh
});

const form = ref({
  id: '',
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  gioiTinh: '',
  ngaySinh: '',
  trangThai: 1,
});

const addresses = ref([]); // Mảng chứa TẤT CẢ các địa chỉ của khách hàng

const showAddressModal = ref(false);
const selectedAddressForEdit = ref(null);



// --- Life Cycle Hooks ---
onMounted(async () => {
  try {
    if (route.params.id) {
      form.value.id = route.params.id;

      // Bước 1: Fetch thông tin khách hàng
      console.log('--- Đang tải thông tin khách hàng cho ID:', route.params.id, '---');
      await fetchCustomerDetails(route.params.id);
      console.log('--- Thông tin khách hàng đã tải xong. Form hiện tại:', JSON.parse(JSON.stringify(form.value)), '---');

      // Bước 2: Fetch địa chỉ
      console.log('--- Đang tải địa chỉ khách hàng ---');
      await fetchAddresses();
      console.log('--- Địa chỉ khách hàng đã tải xong. Danh sách địa chỉ:', JSON.parse(JSON.stringify(addresses.value)), '---');

    } else {
      toast.error("Không tìm thấy ID khách hàng để chỉnh sửa.");
      router.push('/khach-hang');
    }
  } catch (error) {
    console.error('Đã xảy ra lỗi không mong muốn khi tải trang:', error);
    toast.error("Đã xảy ra lỗi không mong muốn khi tải trang.");
    router.push('/khach-hang');
  }
});

// --- Data Fetching Methods ---
const fetchCustomerDetails = async (id) => {
  try {
    const response = await axios.get(`/api/khach-hang/${id}`);
    const customerData = response.data;

    // Gán thông tin khách hàng vào form
    form.value.tenKhachHang = customerData.tenKhachHang ?? '';
    form.value.email = customerData.email ?? '';
    form.value.soDienThoai = customerData.soDienThoai ?? '';
    form.value.gioiTinh = customerData.gioiTinh ?? true; // Đảm bảo giá trị 'gioiTinh' là chuỗi
    form.value.ngaySinh = customerData.ngaySinh?.split('T')[0] ?? '';
    form.value.trangThai = customerData.trangThai ?? 1;

    // Đảm bảo thông tin địa chỉ được gán đúng vào form
    if (customerData.diaChi && customerData.diaChi.length > 0) {
      const firstAddress = customerData.diaChi[0]; // Giả sử lấy địa chỉ đầu tiên
      form.value.diaChi = {
        idTinhThanhPho: firstAddress.idTinhThanhPho,
        idQuanHuyen: firstAddress.idQuanHuyen,
        idXaPhuong: firstAddress.idXaPhuong,
        diaChiChiTiet: firstAddress.diaChiChiTiet,
        isMacDinh: firstAddress.isMacDinh,
      };
    } else {
      // Nếu không có địa chỉ, gán giá trị mặc định cho địa chỉ
      form.value.diaChi = {
        idTinhThanhPho: '',
        idQuanHuyen: '',
        idXaPhuong: '',
        diaChiChiTiet: '',
        isMacDinh: false,
      };
    }

  } catch (error) {
    console.error('Lỗi khi tải chi tiết khách hàng:', error.response?.status, error.response?.data || error.message);
    toast.error("Không thể tải chi tiết khách hàng.");
  }
};

const fetchAddresses = async () => {
  if (form.value.id) {
    try {
      const response = await axios.get(`/api/khach-hang/${form.value.id}/dia-chi`);
      const apiAddresses = response.data || [];
      console.log('API Response (Addresses):', apiAddresses); // DEBUG: Xem chính xác API địa chỉ trả về gì

      addresses.value = apiAddresses.map(addr => {
        const isDefault = !!addr.isMacDinh;
        return {
          ...addr,
          isMacDinh: isDefault,
          diaChi: addr.diaChi || [
            addr.diaChiChiTiet,
            addr.xaPhuong?.tenXaPhuong,
            addr.quanHuyen?.tenQuanHuyen,
            addr.tinhThanhPho?.tenTinhThanh
          ].filter(Boolean).join(', '),
          idTinhThanhPho: addr.tinhThanhPho?.id,
          idQuanHuyen: addr.quanHuyen?.id,
          idXaPhuong: addr.xaPhuong?.id,
          diaChiChiTiet: addr.diaChiChiTiet
        };
      });

      // Giữ nguyên thông tin khách hàng nếu không có thay đổi
      console.log('Addresses.value sau khi gán địa chỉ:', JSON.parse(JSON.stringify(addresses.value)));
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ của khách hàng:', error.response?.status, error.response?.data || error.message);
      addresses.value = []; // Đảm bảo mảng địa chỉ rỗng nếu có lỗi
      toast.error("Không thể tải địa chỉ của khách hàng.");
    }
  }
};

// --- Validation Methods ---
const validatePhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
const isFullName = (name) => {
     const regex = /^[a-zA-ZÀÁẠẢÃĂẮẰẲẶẬÂẤẦẨẪẬĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ\s]+$/i; // <-- SỬA DÒNG NÀY

    return name && name.trim().split(" ").length >= 1 && regex.test(name);
};
// <--- THÊM HÀM NÀY VÀO ĐÂY NẾU CHƯA CÓ --->
const isAdult = (dobString) => {
    if (!dobString) return true; // Nếu không nhập ngày sinh thì không validate tuổi
    const dob = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
    }
    return age >= 16;
};
// --- Form Handlers ---
const goBack = () => {
  router.push('/khach-hang');
};

const handleSubmit = async () => {
    showError.value = true; // Bật cờ để hiển thị lỗi trên UI (màu đỏ dưới input)

    // Reset tất cả lỗi trước khi validate lại
    errors.value.email = false;
    errors.value.soDienThoai = false;
    errors.value.ngaySinh = false;

    let formIsValid = true; // Cờ để theo dõi trạng thái validation tổng thể của form

    // Validate Họ và tên
    if (!form.value.tenKhachHang || !isFullName(form.value.tenKhachHang)) {
        formIsValid = false;
        // KHÔNG hiển thị toast cụ thể ở đây
    }

    // Validate Email
    if (!form.value.email) {
        formIsValid = false;
        // KHÔNG hiển thị toast cụ thể ở đây
    } else if (!validateEmail(form.value.email)) {
        errors.value.email = true; // Đặt lỗi để hiển thị trên input
        formIsValid = false;
    }

    // Validate Số điện thoại
    if (!form.value.soDienThoai) {
        formIsValid = false;
        // KHÔNG hiển thị toast cụ thể ở đây
    } else if (!validatePhone(form.value.soDienThoai)) {
        errors.value.soDienThoai = true; // Đặt lỗi để hiển thị trên input
        formIsValid = false;
    }

    // Validate Ngày sinh (tuổi)
    if (form.value.ngaySinh && !isAdult(form.value.ngaySinh)) {
        errors.value.ngaySinh = true; // Đặt lỗi để hiển thị trên UI
        formIsValid = false;
    }

    // Nếu form không hợp lệ, hiển thị toast tổng và dừng lại
    if (!formIsValid) {
        toast.error("Cập nhật không thành công! Vui lòng kiểm tra lại thông tin.");
        return; // Dừng hàm nếu có lỗi validation
    }

    // Nếu form hợp lệ, tiến hành gửi dữ liệu
    try {
        const customerUpdatePayload = {
            id: form.value.id,
            tenKhachHang: form.value.tenKhachHang,
            email: form.value.email,
            soDienThoai: form.value.soDienThoai,
            gioiTinh: form.value.gioiTinh,
            ngaySinh: form.value.ngaySinh,
            trangThai: form.value.trangThai,
        };

        await axios.put(`/api/khach-hang/${form.value.id}`, customerUpdatePayload);
        toast.success("Cập nhật khách hàng thành công!");
        router.push('/khach-hang');
    } catch (err) {
        console.error('Lỗi khi cập nhật khách hàng:', err.response?.data || err.message);
        // Toast lỗi server/API (không phải lỗi validation client-side)
        toast.error("Cập nhật không thành công! Đã có lỗi xảy ra từ máy chủ.");
    }
};


// --- Address Modal Specific Logic ---
const openAddressModalForAdd = () => {
    selectedAddressForEdit.value = null;
    showAddressModal.value = true;
};

const editAddressInPopup = (address) => {
    selectedAddressForEdit.value = {
        id: address.id,
        tinhId: address.idTinhThanhPho, // <-- Đảm bảo thuộc tính này tồn tại trên `address`
        quanId: address.idQuanHuyen,   // <-- Đảm bảo thuộc tính này tồn tại trên `address`
        xaId: address.idXaPhuong,     // <-- Đảm bảo thuộc tính này tồn tại trên `address`
        chiTiet: address.diaChiChiTiet, // <-- Đảm bảo thuộc tính này tồn tại trên `address`
        isMacDinh: address.isMacDinh,
        diaChi: address.diaChi // Chuỗi địa chỉ đầy đủ để hiển thị trong modal nếu cần
    };
    showAddressModal.value = true;
};

// const handleAddressUpdate = () => {
//     fetchAddresses();
// };

// const handleAddressAdded = () => {
//     fetchAddresses();
// };

// Phương thức mới hoặc đổi tên để xử lý cả thêm và cập nhật địa chỉ
const handleAddressSaved = () => {
    showAddressModal.value = false; // Đóng modal
    fetchAddresses(); // Tải lại danh sách địa chỉ để cập nhật hiển thị
};


const deleteAddress = async (addressId) => {
    const isOnlyAddress = addresses.value.length === 1;
    const addressToDelete = addresses.value.find(addr => addr.id === addressId);

    if (isOnlyAddress) {
        toast.error("Không thể xóa địa chỉ cuối cùng của khách hàng.");
        return;
    }
    // THÊM KIỂM TRA ĐỂ KHÔNG XÓA ĐỊA CHỈ MẶC ĐỊNH
    if (addressToDelete && addressToDelete.isMacDinh) {
        toast.error("Không thể xóa địa chỉ mặc định. Vui lòng đặt một địa chỉ khác làm mặc định trước khi xóa.");
        return;
    }
    if (confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
        try {
            await axios.delete(`/api/dia-chi/${addressId}`);
            toast.success("Xóa địa chỉ thành công!");
            fetchAddresses();
        } catch (error) {
            console.error("Lỗi khi xóa địa chỉ:", error);
            toast.error("Không thể xóa địa chỉ.");
        }
    }
};

const setDefaultAddress = async (selectedAddress) => {
    try {
        await axios.put(`/api/dia-chi/${selectedAddress.id}/set-default/${form.value.id}`);
        toast.success("Địa chỉ mặc định đã được cập nhật thành công.");
        fetchAddresses();
    } catch (error) {
        console.error('Lỗi khi đặt địa chỉ mặc định:', error);
        toast.error("Không thể đặt địa chỉ mặc định.");
    }
};
</script>

<style scoped>
/* Tổng thể trang và container form */
.page-container {
  padding: 30px; /* Tăng padding tổng thể */
  background-color: #f8f9fa; /* Màu nền nhẹ hơn */
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Header Section (Quay lại và Tiêu đề) */
.header-section {
  display: flex;
  align-items: center; /* Căn giữa theo chiều dọc */
  width: 95%;
  max-width: 1600px; /* Căn chỉnh với form */
  margin-bottom: 30px; /* Khoảng cách dưới header */
  gap: 25px; /* Khoảng cách giữa nút và tiêu đề */
}

.back-button {
  background-color: #e9ecef;
  color: #495057;
  padding: 10px 18px; /* Tăng padding */
  border-radius: 8px; /* Bo tròn vừa phải */
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0; /* Không co lại */
  font-size: 1rem; /* Kích thước font cho nút */
  display: flex; /* Để icon và text thẳng hàng */
  align-items: center;
  gap: 8px;
}

.back-button:hover {
  background-color: #dee2e6;
  color: #343a40;
}

.page-title {
  font-size: 2.5rem; /* Kích thước tiêu đề lớn hơn */
  font-weight: bold;
  color: #333;
  margin: 0; /* Đảm bảo không có margin mặc định */
  line-height: 1.2; /* Căn chỉnh dòng */
}

/* Form chính */
.customer-form {
  background: white;
  padding: 40px; /* Tăng padding bên trong form */
  border-radius: 12px; /* Bo tròn mạnh hơn */
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* Đổ bóng mềm hơn */
  width: 95%;
  max-width: 1600px; /* Tăng kích thước tối đa của form */
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

/* Container cho 3 cột chính */
.form-grid-container-edit {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1.5fr; /* Tỷ lệ 1:1.5:1.5 cho Ảnh : Thông tin & Trạng thái : Địa chỉ */
  gap: 30px 50px; /* Khoảng cách lớn hơn giữa các cột và hàng */
  margin-bottom: 30px;
  align-items: start; /* Căn chỉnh các cột lên đầu */
}

/* Cột 1: Ảnh đại diện */
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

/* Cột 2: Thông tin cá nhân & Trạng thái */
.personal-info-section,
.address-column { /* address-column cũng hưởng một phần padding này */
  display: flex;
  flex-direction: column;
  gap: 20px; /* Khoảng cách giữa các input-group */
  padding: 0 25px; /* Padding ngang cho các cột nội dung */
  box-sizing: border-box;
}

/* Cột 3: Địa chỉ */
.address-column {
    padding-left: 25px; /* Điều chỉnh riêng padding trái cho cột địa chỉ */
}


/* Common input group styles */
.input-group {
  display: flex;
  flex-direction: column;
}

label {
  display: block;
  margin-bottom: 8px; /* Khoảng cách giữa label và input */
  font-weight: 600;
  color: #495057;
  font-size: 1.05rem; /* Kích thước font cho label */
}

.required-star {
  color: #dc3545; /* Màu đỏ cho dấu sao bắt buộc */
  margin-left: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 15px; /* Tăng padding input */
  border: 1px solid #ced4da;
  border-radius: 8px; /* Bo tròn input */
  font-size: 1.05rem; /* Kích thước font lớn hơn */
  color: #495057;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-sizing: border-box; /* Đảm bảo padding không làm tăng chiều rộng */
}

.form-input:focus {
  border-color: #0a2c57; /* Màu xanh đậm khi focus */
  box-shadow: 0 0 0 3px rgba(10, 44, 87, 0.2); /* Hiệu ứng focus với màu xanh đậm */
  outline: none;
}

.error-input {
  border-color: #dc3545 !important; /* Màu đỏ cho lỗi */
}

.error-message {
  color: #dc3545;
  font-size: 0.9rem; /* Kích thước nhỏ hơn */
  margin-top: 5px;
  display: block;
}

/* Giới tính Radio Buttons */
.gender-row {
  flex-direction: row; /* Căn hàng ngang cho label và radio group */
  align-items: center;
  gap: 20px;
}

.gender-group {
  display: flex;
  gap: 30px; /* Khoảng cách giữa các radio option */
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal; /* Không in đậm label của radio */
  color: #495057;
  cursor: pointer;
  font-size: 1rem;
}

.radio-input {
  appearance: none; /* Bỏ giao diện mặc định của radio button */
  width: 20px; /* Kích thước lớn hơn */
  height: 20px;
  border: 2px solid #ced4da;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;
  flex-shrink: 0; /* Không co lại */
}

.radio-input:checked {
  border-color: #0a2c57; /* Màu xanh đậm khi chọn */
}

.radio-input:checked::before {
  content: '';
  width: 10px; /* Kích thước chấm tròn bên trong */
  height: 10px;
  background-color: #0a2c57; /* Màu xanh đậm cho chấm tròn */
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* Address Section Styles */
.address-section {
  display: flex;
  flex-direction: column;
  gap: 15px; /* Khoảng cách chung giữa các phần tử trong address section */
}

.address-section h3 {
  font-size: 1.8rem; /* Kích thước lớn hơn */
  font-weight: bold;
  color: #333;
  margin-bottom: 15px; /* Khoảng cách dưới tiêu đề Địa chỉ */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.add-address-button {
  background-color: #0a2c57;
  color: white;
  border: none;
  border-radius: 50%;
  width: 35px; /* Kích thước nút */
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2em; /* Kích thước icon dấu cộng nhỏ hơn */
  cursor: pointer;
  transition: background-color 0.3s;
}

.add-address-button:hover {
  background-color: #071f3e;
}

.address-list {
  list-style: none;
  padding: 0;
  margin-top: 10px; /* Khoảng cách trên danh sách địa chỉ */
}

.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px; /* Tăng padding */
  border: 1px solid #e2e8f0;
  border-radius: 10px; /* Bo tròn hơn */
  margin-bottom: 12px; /* Khoảng cách giữa các item */
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05); /* Đổ bóng nhẹ */
  position: relative;
  transition: all 0.2s ease-in-out;
}

.address-item:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.address-wrapper {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  position: relative;
}

/* --- Chỉnh sửa cho "Mặc định" label --- */
.default-label {
  position: absolute;
  top: -12px; /* Điều chỉnh vị trí để không đè lên chữ */
  left: 0; /* Đặt ở vị trí đầu dòng */
  background-color: white; /* Nền trắng */
  color: #28a745; /* Chữ màu xanh lá */
  padding: 2px 8px; /* Padding gọn gàng */
  border: 1px solid #28a745; /* Viền màu xanh lá */
  border-radius: 5px; /* Bo tròn góc */
  font-size: 0.8em;
  font-weight: bold;
  z-index: 10;
}

.address-content {
  display: flex;
  align-items: center;
  gap: 12px; /* Khoảng cách giữa checkbox và text */
  padding-top: 10px; /* Đẩy nội dung xuống để tạo chỗ cho label "Mặc định" */
}

.address-content label {
  font-weight: normal; /* Không in đậm địa chỉ */
  font-size: 1rem; /* Kích thước font cho địa chỉ */
  color: #333;
  margin-bottom: 0;
  cursor: pointer;
}

.address-checkbox {
  width: 20px; /* Kích thước lớn hơn */
  height: 20px;
  cursor: pointer;
  accent-color: #0a2c57; /* Màu xanh đậm */
  flex-shrink: 0; /* Không co lại */
}

.address-actions {
  display: flex;
  gap: 10px; /* Khoảng cách giữa các nút action */
}

.action-button {
  background: #f0f0f0;
  border: none;
  cursor: pointer;
  width: 36px; /* Kích thước nút */
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, transform 0.2s;
  font-size: 1.1em; /* Kích thước icon */
}

.action-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}

.edit-button i { color: #28a745; } /* Icon màu xanh lá */
.delete-button i { color: #dc3545; } /* Icon màu đỏ */

.no-address-message {
  text-align: center;
  color: #777;
  margin-top: 25px;
  font-size: 1.05rem;
}

/* Footer với các nút actions */
.form-footer {
  display: flex;
  justify-content: flex-end; /* Đẩy các nút sang phải */
  gap: 18px; /* Khoảng cách giữa các nút */
  padding-top: 30px; /* Padding trên */
  border-top: 1px solid #eee; /* Đường kẻ phân cách */
  margin-top: auto; /* Đẩy footer xuống dưới cùng của form flex container */
}

.btn {
  padding: 12px 30px; /* Tăng padding */
  border: none;
  border-radius: 8px; /* Bo tròn nút */
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 1.1rem; /* Kích thước font lớn hơn */
}

.btn-secondary {
  background-color: #6c757d; /* Màu xám Bootstrap secondary */
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
  transform: translateY(-2px);
}

.btn-primary { /* Đổi tên class từ btn-success sang btn-primary và áp dụng màu xanh đậm */
  background-color: #0a2c57; /* Màu xanh đậm theo yêu cầu */
  color: white;
}

.btn-primary:hover {
  background-color: #071f3e; /* Màu đậm hơn khi hover */
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 1200px) { /* Chuyển sang 2 cột trên các màn hình nhỏ hơn 1200px (tablet lớn) */
  .form-grid-container-edit {
    grid-template-columns: 1fr 1.5fr; /* 2 cột: Ảnh | Thông tin & Địa chỉ */
    gap: 30px;
  }
  /* Personal Info và Address sẽ gộp chung vào 1 cột lớn hơn */
  .personal-info-section {
    border-right: none;
    padding-right: 0;
  }
  .address-column {
    padding-left: 0;
    grid-column: 2 / 3; /* Đảm bảo nó vẫn ở cột thứ 2 */
  }
  /* Điều chỉnh kích thước cột ảnh nếu cần thiết khi gộp */
  .image-column {
      padding-right: 25px; /* Giữ đường phân cách */
  }
}


@media (max-width: 768px) { /* Cho mobile */
  .page-container {
    padding: 15px;
  }
  .header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  .back-button {
    padding: 8px 15px;
    font-size: 0.9rem;
  }
  .page-title {
    font-size: 1.8rem;
  }
  .customer-form {
    padding: 20px;
  }
  .form-grid-container-edit {
    grid-template-columns: 1fr; /* Chỉ 1 cột */
    gap: 20px;
  }
  .image-column {
      border-right: none;
      padding-right: 0;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
  }
  .personal-info-section {
    padding-right: 0;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
  }
  .address-column {
    padding-left: 0;
  }
  label {
    font-size: 0.95rem;
  }
  .form-input {
    padding: 10px 12px;
    font-size: 0.95rem;
  }
  .gender-group {
    flex-direction: column;
    gap: 10px;
  }
  .address-section h3 {
    font-size: 1.5rem;
  }
  .add-address-button {
    width: 35px;
    height: 35px;
    font-size: 1.4em;
  }
  .address-item {
    padding: 12px 15px;
  }
  .address-content label {
    font-size: 0.95rem;
  }
  .action-button {
    width: 32px;
    height: 32px;
    font-size: 1em;
  }
  .form-footer {
    padding-top: 20px;
    gap: 10px;
  }
  .btn {
    padding: 10px 20px;
    font-size: 1rem;
  }
}
</style>