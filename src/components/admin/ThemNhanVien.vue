<script setup>
import { ref, inject, onMounted, computed, watch } from 'vue'
import { ArrowLeft, Eye, EyeOff } from 'lucide-vue-next'
import { useRouter, useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
import QRScanner from './QRScanner.vue'
import axios from 'axios'

const toggleSidebar = inject('toggleSidebar')
const router = useRouter();
const route = useRoute();
const toast = useToast();

const formData = ref({
  maNhanVien: '',
  tenNhanVien: '',
  anh: '',
  anhFile: null,
  cccd: '',
  ngaySinh: '',
  sdt: '',
  gioiTinh: true,
  tinhThanh: '',
  quanHuyen: '',
  xaPhuong: '',
  thonXom: '',
  email: '',
  ghiChu: '',
  trangThai: 1
})

const errorToasts = ref([]);
const fieldErrors = ref({});
const allNhanVien = ref([]);
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvince = ref('');
const selectedDistrict = ref('');
const selectedWard = ref('');
const showQRModal = ref(false)
const showCCCD = ref(false)


const getAllNhanVien = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/home');
    allNhanVien.value = response.data;
  } catch (error) {
    console.error("Lỗi khi load danh sách nhân viên:", error);
  }
};

const fetchProvinces = async () => {
  const res = await axios.get('http://provinces.open-api.vn/api/p/');
  provinces.value = res.data;
};
const fetchDistricts = async (provinceCode) => {
  const res = await axios.get(`http://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
  districts.value = res.data.districts;
};
const fetchWards = async (districtCode) => {
  const res = await axios.get(`http://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
  wards.value = res.data.wards;
};

onMounted(async () => {
  await fetchProvinces();
  getAllNhanVien();

  if (route.params.id)  {
    try {
      const res = await axios.get(`http://localhost:8080/api/${route.params.id}`);
      Object.assign(formData.value, res.data);
      // Nếu có ảnh và đường dẫn không phải http, thêm host vào
      if (formData.value.anh && !formData.value.anh.startsWith('http')) {
        formData.value.anh = `http://localhost:8080${formData.value.anh}`;
      }
      // Tìm code tỉnh (chuẩn hóa tên)
      const province = provinces.value.find(p => p.name === res.data.tinhThanh);
      if (province) {
        selectedProvince.value = province.code;
        await fetchDistricts(province.code);
        // Tìm code quận (chuẩn hóa tên)
        const district = districts.value.find(d => d.name === res.data.quanHuyen);
        if (district) {
          selectedDistrict.value = district.code;
          await fetchWards(district.code);
          // Tìm code xã (chuẩn hóa tên)
          const ward = wards.value.find(w => w.name === res.data.xaPhuong);
          if (ward) {
            selectedWard.value = ward.code;
          }
        }
      }
    } catch (e) {}
  }
});

watch(selectedProvince, (newVal) => {
  if (newVal) {
    fetchDistricts(newVal);
    selectedDistrict.value = '';
    wards.value = [];
    selectedWard.value = '';
  }
});
watch(selectedDistrict, (newVal) => {
  if (newVal) {
    fetchWards(newVal);
    selectedWard.value = '';
  }
});

const validateForm = () => {
  fieldErrors.value = {};
  let valid = true;
  if (!formData.value.tenNhanVien) {
    fieldErrors.value.tenNhanVien = 'Vui lòng nhập tên nhân viên';
    valid = false;
  }
  // Validate email
  if (!formData.value.email) {
    fieldErrors.value.email = 'Vui lòng nhập email';
    valid = false;
  } else {
    // Regex kiểm tra email hợp lệ
    const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(formData.value.email)) {
      fieldErrors.value.email = 'Email không hợp lệ';
      valid = false;
    }
  }
  // Validate số điện thoại
  if (!formData.value.sdt) {
    fieldErrors.value.sdt = 'Vui lòng nhập số điện thoại';
    valid = false;
  } else {
    // Regex kiểm tra số điện thoại Việt Nam hợp lệ (10 số, bắt đầu bằng 0)
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(formData.value.sdt)) {
      fieldErrors.value.sdt = 'Số điện thoại không hợp lệ';
      valid = false;
    }
  }
  // BỎ validate bắt buộc cho cccd
  if (formData.value.cccd) {
    // Nếu nhập cccd thì kiểm tra trùng
    const existed = allNhanVien.value.some(nv => nv.cccd === formData.value.cccd && (!route.params.id || nv.id != route.params.id));
    if (existed) {
      fieldErrors.value.cccd = 'CCCD đã tồn tại';
      valid = false;
    }
  }
  if (!formData.value.ngaySinh) {
    fieldErrors.value.ngaySinh = 'Vui lòng chọn ngày sinh';
    valid = false;
  }
  if (!selectedProvince.value) {
    fieldErrors.value.tinhThanh = 'Vui lòng chọn tỉnh/thành';
    valid = false;
  }
  if (!selectedDistrict.value) {
    fieldErrors.value.quanHuyen = 'Vui lòng chọn quận/huyện';
    valid = false;
  }
  if (!selectedWard.value) {
    fieldErrors.value.xaPhuong = 'Vui lòng chọn xã/phường';
    valid = false;
  }
  // BỎ validate bắt buộc cho thôn xóm
  return valid;
};

const handleSubmit = async () => {
  if (!validateForm()) {
    Object.values(fieldErrors.value).forEach(msg => toast.error(msg));
    return;
  }
  try {
    if (!route.params.id) {
      generateMaNhanVien();
    }
    const form = new FormData();
    form.append('maNhanVien', formData.value.maNhanVien);
    form.append('tenNhanVien', formData.value.tenNhanVien);
    form.append('email', formData.value.email);
    form.append('sdt', formData.value.sdt);
    form.append('gioiTinh', formData.value.gioiTinh);
    form.append('trangThai', formData.value.trangThai);
    form.append('cccd', formData.value.cccd);
    form.append('ngaySinh', formData.value.ngaySinh);
    form.append('tinhThanh', provinces.value.find(p => p.code == selectedProvince.value)?.name || '');
    form.append('quanHuyen', districts.value.find(d => d.code == selectedDistrict.value)?.name || '');
    form.append('xaPhuong', wards.value.find(w => w.code == selectedWard.value)?.name || '');
    form.append('thonXom', formData.value.thonXom);
    form.append('ghiChu', formData.value.ghiChu);
    if (formData.value.anhFile) {
      form.append('anh', formData.value.anhFile);
    }

    if (route.params.id) {
      await axios.put(`http://localhost:8080/api/update/${route.params.id}`, form, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      router.push({ path: '/nhan-vien', query: { updated: 'true' } });
    } else {
      await axios.post('http://localhost:8080/api/addNhanVien', form);
      router.push({ path: '/nhan-vien', query: { success: 'true' } });
    }
  } catch (error) {
    if (error.response && error.response.data) {
      toast.error(error.response.data);
    } else {
      toast.error(route.params.id ? 'Cập nhật nhân viên thất bại!' : 'Thêm nhân viên thất bại!');
    }
  }
}

const onFileChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    formData.value.anhFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      formData.value.anh = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const triggerFileInput = () => {
  document.getElementById('avatarInput').click();
};

const generateMaNhanVien = () => {
  if (!allNhanVien.value || allNhanVien.value.length === 0) {
    formData.value.maNhanVien = 'NV001';
    return;
  }

  const existingIds = allNhanVien.value.map(nv => nv.maNhanVien);
  let maxId = 0;
  existingIds.forEach(id => {
    if (id && id.toUpperCase().startsWith('NV')) {
      const numPart = parseInt(id.substring(2), 10);
      if (!isNaN(numPart) && numPart > maxId) {
        maxId = numPart;
      }
    }
  });

  const newIdNumber = maxId + 1;
  const newId = `NV${String(newIdNumber).padStart(3, '0')}`;
  formData.value.maNhanVien = newId;
};

const confirmAndSubmit = async () => {
  const isUpdate = !!route.params.id;
  const result = await Swal.fire({
    icon: 'question',
    title: isUpdate ? 'Xác nhận cập nhật nhân viên?' : 'Xác nhận thêm nhân viên?',
    text: isUpdate ? 'Bạn có chắc chắn muốn lưu thay đổi thông tin nhân viên này không?' : 'Bạn có chắc chắn muốn thêm mới nhân viên này không?',
    showCancelButton: true,
    confirmButtonText: isUpdate ? 'Lưu thay đổi' : 'Thêm mới',
    cancelButtonText: 'Hủy bỏ',
    reverseButtons: true,
    customClass: {
      confirmButton: 'swal2-confirm btn-save',
      cancelButton: 'swal2-cancel btn-cancel'
    }
  });
  if (result.isConfirmed) {
    await handleSubmit();
  }
};

function handleQRScanned(data) {
  console.log('DATA QR:', data);
  if (data) {
    formData.value.cccd = data.cccd || '';
    formData.value.tenNhanVien = data.hoTen || '';
    // Ngày sinh về yyyy-MM-dd (sửa slice cho đúng)
    if (data.ngaySinh && data.ngaySinh.length === 8) {
      const dd = data.ngaySinh.slice(0,2);
      const mm = data.ngaySinh.slice(2,4);
      const yyyy = data.ngaySinh.slice(4,8);
      formData.value.ngaySinh = `${yyyy}-${mm}-${dd}`;
    } else if (data.ngaySinh && data.ngaySinh.length === 10) {
      formData.value.ngaySinh = data.ngaySinh;
    } else {
      formData.value.ngaySinh = '';
    }
    // Giới tính
    if (data.gioiTinh) {
      formData.value.gioiTinh = data.gioiTinh.trim().toLowerCase() === 'nam' || data.gioiTinh.trim() === '1' || data.gioiTinh.trim().toLowerCase() === 'male';
    }
    // Địa chỉ: Thôn, Xã, Huyện, Tỉnh
    if (data.queQuan) {
      const parts = data.queQuan.split(',').map(s => s.trim());
      formData.value.thonXom = parts[0] || '';
      // Tự động chọn tỉnh/thành, quận/huyện, xã/phường nếu trùng tên (chuẩn hóa tên)
      const provinceName = parts[3] || '';
      const province = provinces.value.find(p => p.name === provinceName);
      if (province) {
        selectedProvince.value = province.code;
        setTimeout(() => {
          const districtName = parts[2] || '';
          const district = districts.value.find(d => d.name === districtName);
          if (district) {
            selectedDistrict.value = district.code;
            setTimeout(() => {
              const wardName = parts[1] || '';
              const ward = wards.value.find(w => w.name === wardName);
              if (ward) {
                selectedWard.value = ward.code;
              }
            }, 400);
          }
        }, 400);
      }
    }
    showQRModal.value = false;
    Swal.fire({icon:'success',title:'Đã quét thành công!',text:'Thông tin đã được điền vào form.'});
  }
}
</script>

<template>
  <div class="add-employee-container">
    <div class="header-box">
      <div class="header-flex-qr">
        <button class="back-btn" @click="$router.push('/nhan-vien')" title="Quay lại danh sách nhân viên">
          <ArrowLeft />
          Quay lại
        </button>
        <div class="header-title-center">
          <h2>{{ route.params.id ? 'Sửa nhân viên' : 'Thêm nhân viên mới' }}</h2>
        </div>
        <button class="qr-btn" @click="showQRModal = true" title="Quét mã QR CCCD">
          <svg width="28" height="28" viewBox="0 0 24 24"><path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2" stroke="#339cf1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/><rect x="7" y="7" width="3" height="3" rx="1"/><rect x="14" y="7" width="3" height="3" rx="1"/><rect x="7" y="14" width="3" height="3" rx="1"/><rect x="14" y="14" width="3" height="3" rx="1"/></svg>
        </button>
      </div>
    </div>
    <div class="toast-stack">
      <div v-for="toast in errorToasts" :key="toast.id" class="toast-error">
        <span>✖ {{ toast.message }}</span>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="confirmAndSubmit" class="employee-form">
        <div class="form-flex">
          <div class="avatar-upload">
            <div class="avatar-preview">
              <img v-if="formData.anh" :src="formData.anh" alt="avatar" />
              <span v-else class="avatar-placeholder">📷</span>
            </div>
            <input type="file" id="avatarInput" @change="onFileChange" accept="image/*" style="display: none;" title="Chọn ảnh đại diện nhân viên" />
            <button type="button" class="btn-upload" @click="triggerFileInput" title="Chọn ảnh đại diện">Chọn ảnh</button>
          </div>
          <div class="form-fields">
            <div class="form-grid">
              <div class="form-group">
                <label>Tên nhân viên</label>
                <input type="text" v-model="formData.tenNhanVien" title="Nhập tên nhân viên">
              </div>

              <div class="form-group">
                <label>Email</label>
                <input type="text" v-model="formData.email" title="Nhập email nhân viên">
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" v-model="formData.sdt" title="Nhập số điện thoại nhân viên">
              </div>

              <div class="form-group">
                <label>Giới tính</label>
                <div class="radio-group">
                  <label><input type="radio" value="true" v-model="formData.gioiTinh" title="Chọn giới tính Nam"> Nam</label>
                  <label><input type="radio" value="false" v-model="formData.gioiTinh" title="Chọn giới tính Nữ"> Nữ</label>
                </div>
              </div>

              <div class="form-group">
                <label>CCCD</label>
                <div style="display:flex;align-items:center;gap:8px;">
                  <input :type="showCCCD ? 'text' : 'password'" v-model="formData.cccd" style="flex:1;" title="Nhập số CCCD nhân viên">
                  <button type="button" @click="showCCCD = !showCCCD" style="background:none;border:none;cursor:pointer;">
                    <Eye v-if="!showCCCD" size="18" />
                    <EyeOff v-else size="18" />
                  </button>
                </div>
              </div>

              <div class="form-group">
                <label>Ngày sinh</label>
                <input type="date" v-model="formData.ngaySinh" title="Chọn ngày sinh nhân viên">
              </div>

              <div class="form-group">
                <label>Tỉnh/Thành</label>
                <select v-model="selectedProvince" title="Chọn tỉnh/thành cho nhân viên">
                  <option value="">Chọn tỉnh/thành</option>
                  <option v-for="p in provinces" :key="p.code" :value="p.code">{{ p.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Quận/Huyện</label>
                <select v-model="selectedDistrict" :disabled="!selectedProvince" title="Chọn quận/huyện cho nhân viên">
                  <option value="">Chọn quận/huyện</option>
                  <option v-for="d in districts" :key="d.code" :value="d.code">{{ d.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Xã/Phường</label>
                <select v-model="selectedWard" :disabled="!selectedDistrict" title="Chọn xã/phường cho nhân viên">
                  <option value="">Chọn xã/phường</option>
                  <option v-for="w in wards" :key="w.code" :value="w.code">{{ w.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label>Thôn/Xóm</label>
                <input type="text" v-model="formData.thonXom" placeholder="Nhập thôn/xóm" title="Nhập thôn/xóm nhân viên">
              </div>

              <div class="form-group">
                <label>Ghi chú</label>
                <textarea v-model="formData.ghiChu" title="Nhập ghi chú cho nhân viên"></textarea>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn" :title="route.params.id ? 'Lưu thông tin nhân viên' : 'Thêm nhân viên mới'">{{ route.params.id ? 'Lưu' : 'Thêm nhân viên' }}</button>
        </div>
      </form>
    </div>

    <div v-if="showQRModal" class="modal-overlay">
      <div class="modal-add-role" style="min-width:350px;max-width:95vw;">
        <div class="modal-header">
          <span><b>Quét mã QR CCCD</b></span>
          <button class="modal-close" @click="showQRModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <QRScanner @scanned="handleQRScanned" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.add-employee-container {
  padding: 20px;
}

.header-box {
  width: 100%;
  max-width: none;
  padding: 8px 8px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  border-radius: 12px;
  box-shadow: 0 5px 10px #d1cac0;
}

.header-flex-qr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.header-title-center {
  flex: 1;
  display: flex;
  justify-content: center;
  margin-left: 100px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-weight: 500;
  color: #222;
  transition: all 0.18s;
}

.back-btn:hover {
  background: #f5faff;
  border-color: #339cf1;
  color: #339cf1;
}

.form-container {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 10px #d1cac0;
  padding: 24px;
}

.employee-form {
  max-width: 1200px;
  margin: 0 auto;
}

.form-flex {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 160px;
  max-width: 200px;
}

.avatar-preview {
  width: 140px;
  height: 140px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  overflow: hidden;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #fff;
}

.avatar-placeholder {
  font-size: 32px;
  color: #bbb;
}

.btn-upload {
  padding: 8px 18px;
  border-radius: 6px;
  border: 1.5px solid #339cf1;
  background: #fff;
  color: #339cf1;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
}

.btn-upload:hover {
  background: #e3eafc;
}

.form-fields {
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: none;
  border-bottom: 2px solid #222;
  border-radius: 0;
  font-weight: 600;
  box-shadow: none;
  background: #fff;
  font-size: 14px;
  transition: all 0.18s;
  width: 100%;
}

.form-group input:focus,
.form-group select:focus {
  border-bottom: 2px solid #111;
  outline: none;
}

.form-actions {
  margin-top: 32px;
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  padding: 10px 24px;
  background: #339cf1;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
}

.submit-btn:hover {
  background: #1a8de8;
  box-shadow: 0 2px 8px #339cf133;
}

*:focus {
  outline: none !important;
  box-shadow: none !important;
}

*:not(input):not(textarea):not(select) {
  /* Đã xóa caret-color để trả lại con trỏ chuột */
}

.toast-stack {
  position: absolute;
  right: 32px;
  top: 70px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: flex-end;
}

.toast-error {
  background: #e74c3c;
  color: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 500;
  box-shadow: 0 2px 12px #0002;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  min-width: 260px;
  animation: fadeIn 0.3s;
}

.error-msg {
  color: #e74c3c;
  font-size: 13px;
  margin-top: 2px;
}

.input-with-button {
  display: flex;
  align-items: center;
  gap: 8px;
}

.input-with-button input {
  flex: 1;
}

.btn-gen-id {
  padding: 8px 12px;
  border-radius: 8px;
  border: 1.5px solid #ddd;
  background: #fff;
  color: #222;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.18s;
  white-space: nowrap;
}

.btn-gen-id:hover {
  background: #f5faff;
  border-color: #339cf1;
  color: #339cf1;
}

input:read-only {
  background-color: #f1f3f5;
  cursor: not-allowed;
  opacity: 0.8;
}

.radio-group {
  display: flex;
  gap: 24px;
  align-items: center;
}

.input-search-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
}

.dropdown-list {
  position: absolute;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 9999;
}

.dropdown-list li {
  padding: 8px 16px;
  cursor: pointer;
}

.dropdown-list li:hover {
  background: #f5f5f5;
}

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
  z-index: 9999;
}

.modal-add-role {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  max-width: 95vw;
  max-height: 95vh;
  overflow: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-header span {
  font-size: 18px;
  font-weight: 500;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.modal-body {
  display: flex;
  justify-content: center;
  align-items: center;
}

.qr-btn {
  background: #fff;
  border: 1.5px solid #339cf1;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.18s;
  display: flex;
  align-items: center;
  margin-left: 560px;
}

.qr-btn:hover {
  background: #e3eafc;
}
</style>