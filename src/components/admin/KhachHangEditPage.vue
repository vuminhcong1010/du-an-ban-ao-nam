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
        <div class="static-info-column">
          <div class="input-group">
            <label>Mã khách hàng</label>
            <input v-model="form.maKhachHang" type="text" class="form-input" disabled />
          </div>


          <div class="input-group">
            <label>Số hóa đơn đã mua</label>
            <input :value="form.soHoaDonDaMua !== null ? form.soHoaDonDaMua : 'N/A'" type="text" class="form-input"
              disabled />
          </div>


          <div class="input-group">
            <label>Tổng tiền đã mua</label>
            <input :value="formatCurrency(form.tongTien)" type="text" class="form-input" disabled />
          </div>
        </div>


        <div class="personal-info-column">
          <div class="input-group">
            <label>Họ và tên <span class="required-star">*</span></label>
            <input v-model="form.tenKhachHang" type="text" class="form-input"
              :class="{ 'error-input': showError && !isFullName(form.tenKhachHang) }" />
            <span v-if="showError && !isFullName(form.tenKhachHang)" class="error-message">Vui lòng nhập tên chính
              xác</span>
          </div>


          <div class="input-group">
            <label>Email <span class="required-star">*</span></label>
            <input v-model="form.email" type="email" class="form-input"
              :class="{ 'error-input': showError && (errors.email || !form.email) }" />
            <span v-if="showError && errors.email" class="error-message">Email không hợp lệ</span>
            <span v-else-if="showError && !form.email" class="error-message">Trường này là bắt buộc</span>
          </div>


          <div class="input-group">
            <label>Số điện thoại <span class="required-star">*</span></label>
            <input v-model="form.soDienThoai" type="text" class="form-input" :class="{
              'error-input': showError && (errors.soDienThoai || !form.soDienThoai),
            }" />
            <span v-if="showError && errors.soDienThoai" class="error-message">Số điện thoại không hợp lệ</span>
            <span v-else-if="showError && !form.soDienThoai" class="error-message">Trường này là bắt buộc</span>
          </div>


          <div class="input-group">
            <label>Ngày sinh</label>
            <input v-model="form.ngaySinh" type="date" class="form-input" placeholder="dd/mm/yyyy"
              :class="{ 'error-input': showError && form.ngaySinh && !isAdult(form.ngaySinh) }" />
            <span v-if="showError && form.ngaySinh && !isAdult(form.ngaySinh)" class="error-message">Khách hàng phải từ
              16 tuổi trở lên.</span>
          </div>


          <div class="input-group gender-row">
            <label>Giới tính</label>
            <div class="gender-group">
              <label class="radio-label">
                <input type="radio" :value="true" v-model="form.gioiTinh" class="radio-input" /> Nam
              </label>
              <label class="radio-label">
                <input type="radio" :value="false" v-model="form.gioiTinh" class="radio-input" /> Nữ
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
          <h3>
            Địa chỉ của khách hàng
            <button type="button" @click="openAddressModalForAdd" class="add-address-button">
              <i class="fas fa-plus"></i> Thêm địa chỉ mới
            </button>
          </h3>


          <ul v-if="addresses.length > 0" class="address-list">
            <li v-for="address in addresses" :key="address.id" class="address-item">
              <div class="address-wrapper">
                <div v-if="address.isMacDinh" class="default-label">Mặc định</div>
                <div class="address-content" :class="{ 'is-default': address.isMacDinh }">
                  <input type="checkbox" :checked="address.isMacDinh" @change="setDefaultAddress(address)"
                    :id="'checkbox-' + address.id" class="address-checkbox"
                    :disabled="addresses.length === 1 && address.isMacDinh" />
                  <label :for="'checkbox-' + address.id">{{ address.diaChi }}</label>
                </div>
              </div>
              <div class="address-actions">
                <button type="button" @click="editAddressInPopup(address)" class="action-button edit-button">
                  <i class="fas fa-edit"></i>
                </button>
                <button type="button" @click="deleteAddress(address.id, address.isMacDinh)"
                  class="action-button delete-button">
                  <i class="fas fa-trash-alt"></i>
                </button>
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


    <AddressModal :show="showAddressModal" :initialAddress="selectedAddressForEdit" :customerId="form.id"
      @close="showAddressModal = false" @address-saved="handleAddressSaved" />
  </div>
</template>


<script setup>
import { ref, onMounted, getCurrentInstance } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import AddressModal from '../../components/admin/AddressModal.vue';
import axios from 'axios';
import Cookies from 'js-cookie'

const token = Cookies.get('token')
const route = useRoute();
const router = useRouter();
const toast = useToast();


const showError = ref(false);


const errors = ref({
  email: false,
  soDienThoai: false,
  ngaySinh: false,
});


const form = ref({
  id: '',
  maKhachHang: '', // Thêm trường mã khách hàng
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  gioiTinh: true, // Mặc định là boolean true (Nam)
  ngaySinh: '',
  trangThai: 1,
  soHoaDonDaMua: null, // Thêm trường này
  tongTien: null, // Thêm trường này
});


const addresses = ref([]);


const showAddressModal = ref(false);
const selectedAddressForEdit = ref(null);


const MAX_ADDRESSES_LIMIT = 5; // Ví dụ giới hạn là 5


// Lấy instance của ứng dụng để truy cập global properties ($swal)
const { proxy } = getCurrentInstance();


// --- Life Cycle Hooks ---
onMounted(async () => {
  try {
    if (route.params.id) {
      form.value.id = route.params.id;


      console.log('--- Đang tải thông tin khách hàng cho ID:', route.params.id, '---');
      await fetchCustomerDetails(route.params.id);
      console.log('--- Thông tin khách hàng đã tải xong. Form hiện tại:', JSON.parse(JSON.stringify(form.value)), '---');


      console.log('--- Đang tải địa chỉ khách hàng ---');
      await fetchAddresses();
      console.log('--- Địa chỉ khách hàng đã tải xong. Danh sách địa chỉ:', JSON.parse(JSON.stringify(addresses.value)), '---');
    } else {
      toast.error('Không tìm thấy ID khách hàng để chỉnh sửa.');
      router.push('/khach-hang');
    }
  } catch (error) {
    console.error('Đã xảy ra lỗi không mong muốn khi tải trang:', error);
    toast.error('Đã xảy ra lỗi không mong muốn khi tải trang.');
    router.push('/khach-hang');
  }
});


// --- Data Fetching Methods ---
const fetchCustomerDetails = async (id) => {
  try {
    const response = await axios.get(`/api/khach-hang/${id}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    const customerData = response.data;


    form.value.maKhachHang = customerData.maKhachHang ?? ''; // Gán mã khách hàng
    form.value.tenKhachHang = customerData.tenKhachHang ?? '';
    form.value.email = customerData.email ?? '';
    form.value.soDienThoai = customerData.soDienThoai ?? '';
    form.value.gioiTinh = customerData.gioiTinh; // Đảm bảo gán là boolean === true hoặc false
    form.value.ngaySinh = customerData.ngaySinh?.split('T')[0] ?? '';
    form.value.trangThai = customerData.trangThai ?? 1;
    form.value.soHoaDonDaMua = customerData.soHoaDonDaMua ?? 0; // Gán số hóa đơn
    form.value.tongTien = customerData.tongTien ?? 0; // Gán tổng tiền
    // Không còn hinhAnhUrl nữa
  } catch (error) {
    console.error('Lỗi khi tải chi tiết khách hàng:', error.response?.status, error.response?.data || error.message);
    toast.error('Không thể tải chi tiết khách hàng.');
  }
};


const fetchAddresses = async () => {
  if (form.value.id) {
    try {
      const response = await axios.get(`/api/khach-hang/${form.value.id}/dia-chi`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
      const apiAddresses = response.data || [];
      console.log('API Response (Addresses):', apiAddresses);


      addresses.value = apiAddresses.map(addr => {
        const isDefault = !!addr.isMacDinh; // Đảm bảo chuyển đổi đúng kiểu Boolean


        return {
          ...addr, // Giữ lại tất cả các thuộc tính gốc
          isMacDinh: isDefault,
          // Dùng trực tiếp các trường string từ DTO để tạo chuỗi địa chỉ đầy đủ
          diaChi: [
            addr.diaChiChiTiet,
            addr.xaPhuong,    // Đây là chuỗi tên Xã/Phường
            addr.quanHuyen,   // Đây là chuỗi tên Quận/Huyện
            addr.tinhThanhPho // Đây là chuỗi tên Tỉnh/Thành phố
          ].filter(Boolean).join(', '), // Lọc bỏ các giá trị null/undefined và ghép lại


          // Gán trực tiếp các giá trị chuỗi tên vào các trường mà modal địa chỉ cần
          // Không còn idTinhThanhPho, idQuanHuyen, idXaPhuong dưới dạng số nữa
          // Mà sẽ dùng tên để hiển thị hoặc cho v-model
          tinhThanhPho: addr.tinhThanhPho,
          quanHuyen: addr.quanHuyen,
          xaPhuong: addr.xaPhuong,
          diaChiChiTiet: addr.diaChiChiTiet, // Giữ nguyên tên này cho modal
        };
      });


      console.log('Addresses.value sau khi gán địa chỉ:', JSON.parse(JSON.stringify(addresses.value)));
    } catch (error) {
      console.error('Lỗi khi lấy địa chỉ của khách hàng:', error.response?.status, error.response?.data || error.message);
      addresses.value = [];
      toast.error('Không thể tải địa chỉ của khách hàng.');
    }
  }
};


// --- Validation Methods ---
const validatePhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone);
const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email);
const isFullName = (name) => {
  const regex = /^[a-zA-ZÀÁẠẢÃĂẮẰẲẶẬÂẤẦẨẪẬĐÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸ\s]+$/i;
  return name && name.trim().split(' ').length >= 1 && regex.test(name);
};
const isAdult = (dobString) => {
  if (!dobString) return true;
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const m = today.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age >= 16;
};


// Hàm định dạng tiền tệ
const formatCurrency = (value) => {
  if (value === null || value === undefined) {
    return '0 VNĐ'; // hoặc 'N/A' tùy ý bạn muốn hiển thị
  }
  // Chuyển đổi sang số nếu cần (ví dụ: nếu nó là string từ API)
  const numberValue = parseFloat(value);
  if (isNaN(numberValue)) {
    return '0 VNĐ';
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0, // Không hiển thị số lẻ thập phân
    maximumFractionDigits: 0,
  }).format(numberValue);
};




// --- Form Handlers ---
// const goBack = () => {
//   router.push('/khach-hang');
// };
const goBack = () => {
  router.go(-1); // Thay vì router.push('/khach-hang');
};


const handleSubmit = async () => {
  showError.value = true;
  errors.value.email = false;
  errors.value.soDienThoai = false;
  errors.value.ngaySinh = false;

  let formIsValid = true;

  // Kiểm tra tên khách hàng
  if (!form.value.tenKhachHang || !isFullName(form.value.tenKhachHang)) {
    formIsValid = false;
  }

  // Kiểm tra email
  if (!form.value.email) {
    formIsValid = false;
  } else if (!validateEmail(form.value.email)) {
    errors.value.email = true;
    formIsValid = false;
  }

  // Kiểm tra số điện thoại
  if (!form.value.soDienThoai) {
    formIsValid = false;
  } else if (!validatePhone(form.value.soDienThoai)) {
    errors.value.soDienThoai = true;
    formIsValid = false;
  }

  // Kiểm tra ngày sinh
  if (form.value.ngaySinh && !isAdult(form.value.ngaySinh)) {
    errors.value.ngaySinh = true;
    formIsValid = false;
  }

  if (!formIsValid) {
    toast.error('Cập nhật không thành công! Vui lòng kiểm tra lại thông tin.');
    return;
  }

  try {
    const customerUpdatePayload = {
      id: form.value.id,
      tenKhachHang: form.value.tenKhachHang,
      email: form.value.email,
      soDienThoai: form.value.soDienThoai,
      gioiTinh: form.value.gioiTinh ,
      ngaySinh: form.value.ngaySinh,
      trangThai: form.value.trangThai,
    };

    // Gửi yêu cầu PUT lên server để cập nhật thông tin khách hàng
    const response = await axios.put(`/api/khach-hang/${form.value.id}`, customerUpdatePayload);

    await axios.put(`/api/khach-hang/${form.value.id}`, customerUpdatePayload,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

    toast.success('Cập nhật khách hàng thành công!');
    router.go(-1); // Quay lại trang trước

  } catch (err) {
    console.error('Lỗi khi cập nhật khách hàng:', err.response?.data || err.message);

    // Kiểm tra lỗi từ backend và hiển thị thông báo cụ thể
    if (err.response && err.response.data) {
      toast.error(`Cập nhật không thành công! ${err.response.data}`); // Hiển thị lỗi từ backend
    } else {
      toast.error('Cập nhật không thành công! Đã có lỗi xảy ra từ máy chủ.');
    }
  }
};



// SỬA ĐỔI HÀM openAddressModalForAdd TẠI ĐÂY
const openAddressModalForAdd = () => {
  // 1. Kiểm tra số lượng địa chỉ hiện có của khách hàng
  if (addresses.value.length >= MAX_ADDRESSES_LIMIT) {
    // 2. Nếu đã đạt giới hạn, hiển thị toast và KHÔNG mở modal
    toast.error(`Khách hàng đã đạt số lượng địa chỉ tối đa (${MAX_ADDRESSES_LIMIT}). Không thể thêm địa chỉ mới.`);
  } else {
    // 3. Nếu chưa đạt giới hạn, reset form và mở modal để thêm mới
    selectedAddressForEdit.value = null; // Đảm bảo là thêm mới
    showAddressModal.value = true;
  }
};


const editAddressInPopup = (address) => {
  selectedAddressForEdit.value = {
    id: address.id,
    // SỬA ĐỔI CÁC DÒNG NÀY: Gán trực tiếp TÊN địa lý từ đối tượng address
    tinhId: address.tinhThanhPho, // Đảm bảo đây là tên tỉnh/thành phố (String)
    quanId: address.quanHuyen,    // Đảm bảo đây là tên quận/huyện (String)
    xaId: address.xaPhuong,       // Đảm bảo đây là tên xã/phường (String)
    chiTiet: address.diaChiChiTiet,
    isMacDinh: address.isMacDinh,
    diaChi: address.diaChi, // Giữ nguyên để hiển thị địa chỉ đầy đủ
  };
  showAddressModal.value = true;
};


const handleAddressSaved = async () => {
  showAddressModal.value = false;
   await fetchAddresses();
};


// SỬA ĐỔI HÀM deleteAddress TẠI ĐÂY
const deleteAddress = async (addressId, isMacDinh) => {
  const currentAddressesCount = addresses.value.length;


  if (currentAddressesCount === 1) {
    toast.error('Không thể xóa địa chỉ cuối cùng của khách hàng.');
    return;
  }


  if (isMacDinh) {
    toast.error('Không thể xóa địa chỉ mặc định. Vui lòng đặt một địa chỉ khác làm mặc định trước khi xóa.');
    return;
  }


  // BẮT ĐẦU SỬ DỤNG SWEETALERT2
  const result = await proxy.$swal.fire({ // SỬ DỤNG proxy.$swal.fire()
    title: 'Xác nhận xóa địa chỉ?', // Tiêu đề với dấu hỏi
    text: "Bạn có chắc chắn muốn xóa địa chỉ này không? Hành động này không thể hoàn tác!",
    icon: 'warning', // Icon cảnh báo
    showCancelButton: true,
    confirmButtonColor: '#dc3545', // Màu nút xác nhận (đỏ)
    cancelButtonColor: '#6c757d', // Màu nút hủy (xám)
    confirmButtonText: 'Có, xóa ngay!',
    cancelButtonText: 'Hủy bỏ',
    reverseButtons: true, // Đảo ngược vị trí nút (Hủy bên trái, Xác nhận bên phải)
    customClass: { // Sử dụng customClass nếu bạn đã định nghĩa CSS cho SweetAlert2
      container: 'my-swal-container',
      popup: 'my-swal-popup',
      title: 'my-swal-title',
      content: 'my-swal-content',
      confirmButton: 'my-swal-delete-button',
      cancelButton: 'my-swal-cancel-button',
    },
  });


  // Xử lý kết quả từ SweetAlert2
  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/dia-chi/${addressId}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
      toast.success('Xóa địa chỉ thành công!');
      fetchAddresses(); // Tải lại danh sách địa chỉ sau khi xóa
    } catch (error) {
      console.error('Lỗi khi xóa địa chỉ:', error.response?.data || error.message);
      const errorMessage = error.response?.data?.message || error.message || 'Đã xảy ra lỗi.';
      toast.error('Không thể xóa địa chỉ: ' + errorMessage);
    }
  } else if (result.dismiss === proxy.$swal.DismissReason.cancel) { // KIỂM TRA LÝ DO HỦY BỎ
    toast.info("Đã hủy thao tác xóa địa chỉ.");
  }
};


const setDefaultAddress = async (selectedAddress) => {
  try {
    await axios.put(`/api/dia-chi/${selectedAddress.id}/set-default/${form.value.id}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }); // Sử dụng apiClient
    toast.success('Địa chỉ mặc định đã được cập nhật thành công.');
    fetchAddresses();
  } catch (error) {
    console.error('Lỗi khi đặt địa chỉ mặc định:', error.response?.data || error.message);
    toast.error('Không thể đặt địa chỉ mặc định.');
  }
};
</script>


<style scoped>
/* Tổng thể trang và container form */
.page-container {
  padding: 30px;
  background-color: #f8f9fa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
}


/* Header Section (Quay lại và Tiêu đề) */
.header-section {
  display: flex;
  align-items: center;
  width: 95%;
  max-width: 1600px;
  margin-bottom: 30px;
  gap: 25px;
}


.back-button {
  background-color: #e9ecef;
  color: #495057;
  padding: 10px 18px;
  border-radius: 8px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}


.back-button:hover {
  background-color: #dee2e6;
  color: #343a40;
}


.page-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #333;
  margin: 0;
  line-height: 1.2;
}


/* Form chính */
.customer-form {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  width: 95%;
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  /* Đảm bảo form là flex column để các phần tử con xếp chồng */
}


/* Container cho 3 cột chính */
.form-grid-container-edit {
  display: grid;
  /* Chia 3 cột: 1fr cho thông tin tĩnh, 1.5fr cho thông tin cá nhân, 1.5fr cho địa chỉ */
  grid-template-columns: 1fr 1.5fr 1.5fr;
  gap: 30px 40px;
  /* Khoảng cách giữa các cột và hàng */
  margin-bottom: 30px;
  align-items: start;
  /* Căn chỉnh các cột lên đầu */
}


/* Cột 1: Thông tin không chỉnh sửa (Mã KH, Số HĐ, Tổng tiền) */
.static-info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-right: 20px;
  /* Padding bên phải để tạo khoảng cách */
  border-right: 1px solid #e9ecef;
  /* Đường phân cách */
}


/* Cột 2: Thông tin cá nhân có thể chỉnh sửa */
.personal-info-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-left: 20px;
  padding-right: 20px;
  border-right: 1px solid #e9ecef;
  /* Đường phân cách */
}


/* Cột 3: Địa chỉ */
.address-column {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-left: 20px;
}




/* Common input group styles (giữ nguyên) */
.input-group {
  display: flex;
  flex-direction: column;
}


label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 1.05rem;
}


.required-star {
  color: #dc3545;
  margin-left: 4px;
}


.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ced4da;
  border-radius: 8px;
  font-size: 1.05rem;
  color: #495057;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-sizing: border-box;
}


.form-input:focus {
  border-color: #0a2c57;
  box-shadow: 0 0 0 3px rgba(10, 44, 87, 0.2);
  outline: none;
}


.error-input {
  border-color: #dc3545 !important;
}


.error-message {
  color: #dc3545;
  font-size: 0.9rem;
  margin-top: 5px;
  display: block;
}


/* Các trường mới disabled */
.form-input[disabled] {
  background-color: #e9ecef;
  color: #6c757d;
  cursor: not-allowed;
  opacity: 0.8;
}


/* Giới tính Radio Buttons (giữ nguyên) */
.gender-row {
  flex-direction: row;
  align-items: center;
  gap: 20px;
}


.gender-group {
  display: flex;
  gap: 30px;
}


.radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: normal;
  color: #495057;
  cursor: pointer;
  font-size: 1rem;
}


.radio-input {
  appearance: none;
  width: 20px;
  height: 20px;
  border: 2px solid #ced4da;
  border-radius: 50%;
  display: inline-block;
  position: relative;
  transition: border-color 0.2s ease-in-out;
  cursor: pointer;
  flex-shrink: 0;
}


.radio-input:checked {
  border-color: #0a2c57;
}


.radio-input:checked::before {
  content: '';
  width: 10px;
  height: 10px;
  background-color: #0a2c57;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}


/* Address Section Styles (giữ nguyên, chỉ cần đảm bảo nó không còn padding thừa từ personal-info-section chung) */
.address-section h3 {
  /* Có thể bạn muốn đổi tên class này thành .address-column h3 nếu nó chỉ áp dụng cho cột địa chỉ */
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
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
  border-radius: 8px;
  /* Bo tròn các góc, không phải hình tròn hoàn toàn */
  padding: 10px 18px;
  /* Thêm padding để có không gian cho text */
  /* XÓA width và height CỐ ĐỊNH để nút tự co giãn theo nội dung */
  display: flex;
  align-items: center;
  gap: 8px;
  /* Khoảng cách giữa icon và text */
  /* XÓA justify-content: center; nếu bạn muốn icon ở đầu và text theo sau */
  font-size: 1rem;
  /* Kích thước font cho text */
  font-weight: 600;
  /* In đậm text */
  cursor: pointer;
  transition: background-color 0.3s, transform 0.2s;
  /* Thêm transform cho hiệu ứng hover */
}


.add-address-button:hover {
  background-color: #071f3e;
  transform: translateY(-2px);
  /* Thêm hiệu ứng nhấc lên khi hover */
}


/* Đảm bảo icon có kích thước phù hợp */
.add-address-button i {
  font-size: 1.1em;
  /* Kích thước icon lớn hơn một chút so với text */
}


/* Điều chỉnh lại cho h3 để nút không bị đẩy ra quá xa */
.address-column h3 {
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* Giữ space-between để nút ở bên phải */
  gap: 15px;
  /* Khoảng cách giữa tiêu đề và nút */
  flex-wrap: wrap;
  /* Cho phép xuống dòng trên màn hình nhỏ */
}


.address-list {
  list-style: none;
  padding: 0;
  margin-top: 10px;
}


.address-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 12px;
  background-color: #ffffff;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
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


.default-label {
  position: absolute;
  top: -12px;
  left: 0;
  background-color: white;
  color: #28a745;
  padding: 2px 8px;
  border: 1px solid #28a745;
  border-radius: 5px;
  font-size: 0.8em;
  font-weight: bold;
  z-index: 10;
}


.address-content {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 10px;
}


.address-content label {
  font-weight: normal;
  font-size: 1rem;
  color: #333;
  margin-bottom: 0;
  cursor: pointer;
}


.address-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
  accent-color: #0a2c57;
  flex-shrink: 0;
}


.address-actions {
  display: flex;
  gap: 10px;
}


.action-button {
  background: #f0f0f0;
  border: none;
  cursor: pointer;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s, transform 0.2s;
  font-size: 1.1em;
}


.action-button:hover {
  background-color: #e0e0e0;
  transform: translateY(-1px);
}


.edit-button i {
  color: #28a745;
}


.delete-button i {
  color: #dc3545;
}


.no-address-message {
  text-align: center;
  color: #777;
  margin-top: 25px;
  font-size: 1.05rem;
}


/* Footer với các nút actions (giữ nguyên) */
.form-footer {
  display: flex;
  justify-content: flex-end;
  gap: 18px;
  padding-top: 30px;
  border-top: 1px solid #eee;
  margin-top: auto;
}


.btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
  font-size: 1.1rem;
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


/* Responsive adjustments */
@media (max-width: 1200px) {


  /* Chuyển sang 2 cột trên các màn hình nhỏ hơn 1200px (tablet lớn) */
  .form-grid-container-edit {
    grid-template-columns: 1fr 1fr;
    /* Chia thành 2 cột: Cột 1 + 2 gộp, Cột 3 (Địa chỉ) riêng */
    gap: 30px;
  }


  .static-info-column {
    border-right: none;
    /* Bỏ đường phân cách khi gộp */
    padding-right: 0;
    margin-bottom: 20px;
    /* Thêm khoảng cách dưới */
    border-bottom: 1px solid #eee;
    /* Đường phân cách ngang */
  }


  .personal-info-column {
    grid-column: 1 / 2;
    /* Đẩy thông tin cá nhân lên cột 1 */
    padding-left: 0;
    padding-right: 0;
    border-right: none;
    /* Bỏ đường phân cách khi gộp */
  }


  .address-column {
    grid-column: 2 / 3;
    /* Đẩy địa chỉ sang cột 2 */
    padding-left: 0;
  }
}


@media (max-width: 768px) {


  /* Cho mobile */
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
    grid-template-columns: 1fr;
    /* Chỉ 1 cột */
    gap: 20px;
  }


  .static-info-column {
    padding-right: 0;
    padding-bottom: 20px;
    border-bottom: 1px solid #eee;
    margin-bottom: 0;
    /* Đảm bảo không có margin dưới thừa */
  }


  .personal-info-column {
    padding-left: 0;
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



