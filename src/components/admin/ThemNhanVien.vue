<script setup>
import { ref, inject, onMounted } from 'vue'
import { ArrowLeft } from 'lucide-vue-next'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'

const toggleSidebar = inject('toggleSidebar')
const router = useRouter();
const route = useRoute();

const formData = ref({
  maNhanVien: '',
  tenKhachHang: '',
  tenTaiKhoan: '',
  matKhau: '',
  anh: '',
  anhFile: null,
  email: '',
  sdt: '',
  diaChi: '',
  gioiTinh: true,
  trangThai: 1,
  ngayTao: '',
  ngaySua: '',
  idVaiTro: {
    id: ''
  }
})

const vaiTroList = ref([])
const errorToasts = ref([]);
const fieldErrors = ref({});

const getVaiTro = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/vai-tro')
    vaiTroList.value = response.data
  } catch (error) {
    console.error("Lỗi khi load chức vụ:", error)
  }
}

function showErrorToast(message) {
  const id = Date.now() + Math.random();
  errorToasts.value.unshift({ id, message });
  setTimeout(() => {
    errorToasts.value = errorToasts.value.filter(t => t.id !== id);
  }, 3000);
}

function validateForm() {
  const errors = {};
  if (!formData.value.maNhanVien) errors.maNhanVien = 'Vui lòng nhập mã nhân viên';
  if (!formData.value.tenKhachHang) errors.tenKhachHang = 'Vui lòng nhập tên nhân viên';
  if (!formData.value.tenTaiKhoan) errors.tenTaiKhoan = 'Vui lòng nhập tên tài khoản';
  if (!formData.value.matKhau) errors.matKhau = 'Vui lòng nhập mật khẩu';
  if (!formData.value.email) errors.email = 'Vui lòng nhập email';
  else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.value.email)) errors.email = 'Email không hợp lệ';
  if (!formData.value.sdt) errors.sdt = 'Vui lòng nhập số điện thoại';
  else if (!/^\d{10,11}$/.test(formData.value.sdt)) errors.sdt = 'Số điện thoại không hợp lệ';
  if (!formData.value.diaChi) errors.diaChi = 'Vui lòng nhập địa chỉ';
  if (!formData.value.idVaiTro.id) errors.idVaiTro = 'Vui lòng chọn chức vụ';
  return errors;
}

const handleSubmit = async () => {
  fieldErrors.value = validateForm();
  if (Object.keys(fieldErrors.value).length > 0) {
    // Có lỗi, không gửi API
    return;
  }
  try {
    const now = new Date();
    const pad = n => n.toString().padStart(2, '0');
    const getNowString = () =>
      `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
    if (!formData.value.ngayTao) formData.value.ngayTao = getNowString();
    if (!formData.value.ngaySua) formData.value.ngaySua = getNowString();

    const form = new FormData();
    form.append('maNhanVien', formData.value.maNhanVien);
    form.append('tenKhachHang', formData.value.tenKhachHang);
    form.append('tenTaiKhoan', formData.value.tenTaiKhoan);
    form.append('matKhau', formData.value.matKhau);
    form.append('email', formData.value.email);
    form.append('sdt', formData.value.sdt);
    form.append('diaChi', formData.value.diaChi);
    form.append('gioiTinh', formData.value.gioiTinh);
    form.append('trangThai', formData.value.trangThai);
    form.append('ngayTao', formData.value.ngayTao);
    form.append('ngaySua', formData.value.ngaySua);
    form.append('idVaiTro', formData.value.idVaiTro.id);
    if (formData.value.anhFile) {
      form.append('anh', formData.value.anhFile);
    }

    // for (let pair of form.entries()) {
    //   console.log(pair[0] + ':', pair[1]);
    // }

    if (route.params.id) {
      await axios.put(`http://localhost:8080/api/update/${route.params.id}`, {
        maNhanVien: formData.value.maNhanVien,
        tenKhachHang: formData.value.tenKhachHang,
        tenTaiKhoan: formData.value.tenTaiKhoan,
        matKhau: formData.value.matKhau,
        email: formData.value.email,
        sdt: formData.value.sdt,
        diaChi: formData.value.diaChi,
        gioiTinh: formData.value.gioiTinh,
        trangThai: formData.value.trangThai,
        ngayTao: formData.value.ngayTao,
        ngaySua: formData.value.ngaySua,
        idVaiTro: Number(formData.value.idVaiTro.id),
        anh: formData.value.anh || "https://example.com/image.jpg"
      }, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      showErrorToast('Cập nhật nhân viên thành công!');
      router.push({ path: '/nhan-vien', query: { updated: 'true' } });
    } else {
      await axios.post('http://localhost:8080/api/addNhanVien', form);
      showErrorToast('Thêm nhân viên thành công!');
      router.push({ path: '/nhan-vien', query: { success: 'true' } });
    }
  } catch (error) {
    if (route.params.id) {
      // Hiển thị lỗi cập nhật
      if (error.response && Array.isArray(error.response.data)) {
        error.response.data.forEach(msg => showErrorToast(msg));
      } else {
        showErrorToast('Cập nhật nhân viên thất bại!');
      }
    } else {
      if (error.response && Array.isArray(error.response.data)) {
        error.response.data.forEach(msg => showErrorToast(msg));
      } else {
        showErrorToast('Thêm nhân viên thất bại!');
      }
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

onMounted(async () => {
  const now = new Date();
  const pad = n => n.toString().padStart(2, '0');
  const getNowString = () =>
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  formData.value.ngayTao = getNowString();
  formData.value.ngaySua = getNowString();

  if (route.params.id) {
    try {
      const res = await axios.get(`http://localhost:8080/api/${route.params.id}`);
      Object.assign(formData.value, res.data);

      if (res.data.idVaiTro) {
        formData.value.idVaiTro = { id: res.data.idVaiTro.id };
      }
    } catch (e) {
    }
  }
});

getVaiTro()
</script>

<template>
  <div class="add-employee-container">
    <div class="header">
      <button class="back-btn" @click="$router.push('/nhan-vien')">
        <ArrowLeft />
        Quay lại
      </button>
      <h2>{{ route.params.id ? 'Sửa nhân viên' : 'Thêm nhân viên mới' }}</h2>
    </div>
    <div class="toast-stack">
      <div v-for="toast in errorToasts" :key="toast.id" class="toast-error">
        <span>✖ {{ toast.message }}</span>
      </div>
    </div>

    <div class="form-container">
      <form @submit.prevent="handleSubmit" class="employee-form">
        <div class="form-flex">
          <div class="avatar-upload">
            <div class="avatar-preview">
              <img v-if="formData.anh" :src="formData.anh" alt="avatar" />
              <span v-else class="avatar-placeholder">📷</span>
            </div>
            <input type="file" id="avatarInput" @change="onFileChange" accept="image/*" style="display: none;" />
            <button type="button" class="btn-upload" @click="triggerFileInput">Chọn ảnh</button>
          </div>
          <div class="form-fields">
            <div class="form-grid">
              <div class="form-group">
                <label>Mã nhân viên</label>
                <input type="text" v-model="formData.maNhanVien">
                <span v-if="fieldErrors.maNhanVien" class="error-msg">{{ fieldErrors.maNhanVien }}</span>
              </div>

              <div class="form-group">
                <label>Tên nhân viên</label>
                <input type="text" v-model="formData.tenKhachHang">
                <span v-if="fieldErrors.tenKhachHang" class="error-msg">{{ fieldErrors.tenKhachHang }}</span>
              </div>

              <div class="form-group">
                <label>Tên tài khoản</label>
                <input type="text" v-model="formData.tenTaiKhoan">
                <span v-if="fieldErrors.tenTaiKhoan" class="error-msg">{{ fieldErrors.tenTaiKhoan }}</span>
              </div>

              <div class="form-group">
                <label>Mật khẩu</label>
                <input type="password" v-model="formData.matKhau">
                <span v-if="fieldErrors.matKhau" class="error-msg">{{ fieldErrors.matKhau }}</span>
              </div>

              <div class="form-group">
                <label>Email</label>
                <input type="text" v-model="formData.email">
                <span v-if="fieldErrors.email" class="error-msg">{{ fieldErrors.email }}</span>
              </div>

              <div class="form-group">
                <label>Số điện thoại</label>
                <input type="tel" v-model="formData.sdt">
                <span v-if="fieldErrors.sdt" class="error-msg">{{ fieldErrors.sdt }}</span>
              </div>

              <div class="form-group">
                <label>Địa chỉ</label>
                <input type="text" v-model="formData.diaChi">
                <span v-if="fieldErrors.diaChi" class="error-msg">{{ fieldErrors.diaChi }}</span>
              </div>

              <div class="form-group">
                <label>Giới tính</label>
                <select v-model="formData.gioiTinh">
                  <option :value="true">Nam</option>
                  <option :value="false">Nữ</option>
                </select>
              </div>

              <div class="form-group">
                <label>Chức vụ</label>
                <select v-model="formData.idVaiTro.id">
                  <option value="">Chọn chức vụ</option>
                  <option v-for="vaiTro in vaiTroList" :key="vaiTro.id" :value="vaiTro.id">
                    {{ vaiTro.tenRole }}
                  </option>
                </select>
                <span v-if="fieldErrors.idVaiTro" class="error-msg">{{ fieldErrors.idVaiTro }}</span>
              </div>

              <div class="form-group">
                <label>Trạng thái</label>
                <select v-model="formData.trangThai">
                  <option :value="1">Đang làm việc</option>
                </select>
              </div>

              <div class="form-group">
                <label>Ngày tạo</label>
                <input type="datetime-local" v-model="formData.ngayTao" readonly>
              </div>

              <div class="form-group">
                <label>Ngày sửa</label>
                <input type="datetime-local" v-model="formData.ngaySua" readonly>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="submit-btn">{{ route.params.id ? 'Lưu' : 'Thêm nhân viên' }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.add-employee-container {
  padding: 20px;
}

.header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
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
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.18s;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #339cf1;
  box-shadow: 0 0 0 2px #e3eafc;
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
  caret-color: transparent !important;
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
</style>