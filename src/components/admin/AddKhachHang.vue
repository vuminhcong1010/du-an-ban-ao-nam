<template>
  <div>
    <!-- Nút Add -->
    <button @click="open = true"
      style="background-color: #0a2c57; color: white; border: none; padding: 10px 20px; border-radius: 5px;">
      ➕ Thêm khách hàng
    </button>

    <!-- Modal -->
    <div v-if="open" class="modal-backdrop">
      <div class="modal-box">
        <!-- HEADER -->
        <div class="modal-header">
          <h2 class="text-xl font-semibold">Thêm khách hàng</h2>
          <button @click="closeModal" class="modal-close"><i class="fas fa-times"></i></button>
        </div>

        <!-- FORM -->
        <form @submit.prevent="handleSubmit" class="modal-body">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label>Họ và tên: <span class="text-red-500">*</span></label>
              <input v-model="form.tenKhachHang" type="text"
                :class="{ error: showError && !isFullName(form.tenKhachHang) }" />
              <span v-if="showError && !isFullName(form.tenKhachHang)" class="text-red-500">Vui lòng nhập đầy đủ Họ và
                Tên</span>
            </div>

            <div>
              <label>Email: <span class="text-red-500">*</span></label>
              <input v-model="form.email" type="email" :class="{ error: showError && (errors.email || !form.email) }" />
              <span v-if="showError && errors.email" class="text-red-500">Email không hợp lệ</span>
              <span v-if="showError && !form.email" class="text-red-500">Trường này là bắt buộc</span>
            </div>

            <div>
              <label>Số điện thoại: <span class="text-red-500">*</span></label>
              <input v-model="form.soDienThoai" type="text"
                :class="{ error: showError && (errors.soDienThoai || !form.soDienThoai) }" />
              <span v-if="showError && errors.soDienThoai" class="text-red-500">Số điện thoại không hợp lệ</span>
              <span v-if="showError && !form.soDienThoai" class="text-red-500">Trường này là bắt buộc</span>
            </div>

            <div>
              <label>Ngày sinh: <span class="text-red-500">*</span></label>
              <input v-model="form.ngaySinh" type="date"
                :class="{ error: showError && (errors.ngaySinh || !form.ngaySinh) }" />
              <span v-if="showError && errors.ngaySinh" class="text-red-500">Tuổi phải từ 13 trở lên</span>
              <span v-if="showError && !form.ngaySinh" class="text-red-500">Trường này là bắt buộc</span>
            </div>

            <!-- Gộp label + nhóm radio vào cùng một dòng -->
            <div class="col-span-2 gender-row">
              <label>Giới tính:</label>
              <div class="gender-group">
                <label><input type="radio" value="true" v-model="form.gioiTinh" /> Nam</label>
                <label><input type="radio" value="false" v-model="form.gioiTinh" /> Nữ</label>
              </div>
            </div>

            <!-- Tỉnh -->
            <div>
              <label>Tỉnh/Thành Phố: <span class="text-red-500">*</span></label>
              <select v-model="form.diaChi.idTinhThanhPho" @change="onTinhThanhChange"
                :class="{ error: showError && !form.diaChi.idTinhThanhPho }">
                <option value="">Chọn Tỉnh/Thành Phố</option>
                <option v-for="tinh in tinhThanhPhos" :key="tinh.id" :value="tinh.id">{{ tinh.tenTinhThanh }}</option>
              </select>
              <span v-if="showError && !form.diaChi.idTinhThanhPho" class="text-red-500">Trường này là bắt buộc</span>
            </div>

            <!-- Quận -->
            <div>
              <label>Quận/Huyện: <span class="text-red-500">*</span></label>
              <select :disabled="!form.diaChi.idTinhThanhPho" v-model="form.diaChi.idQuanHuyen"
                @change="onQuanHuyenChange" :class="{ error: showError && !form.diaChi.idQuanHuyen }">
                <option value="">Chọn Quận/Huyện</option>
                <option v-for="quan in quanHuyens" :key="quan.id" :value="quan.id">{{ quan.tenQuanHuyen }}</option>
              </select>
              <span v-if="showError && !form.diaChi.idQuanHuyen" class="text-red-500">Trường này là bắt buộc</span>
            </div>

            <!-- Xã -->
            <div>
              <label>Xã/Phường: <span class="text-red-500">*</span></label>
              <select :disabled="!form.diaChi.idQuanHuyen" v-model="form.diaChi.idXaPhuong"
                :class="{ error: showError && !form.diaChi.idXaPhuong }">
                <option value="">Chọn Xã/Phường</option>
                <option v-for="xa in xaPhuongs" :key="xa.id" :value="xa.id">{{ xa.tenXaPhuong }}</option>
              </select>
              <span v-if="showError && !form.diaChi.idXaPhuong" class="text-red-500">Trường này là bắt buộc</span>
            </div>

            <div>
              <label>Địa chỉ chi tiết:</label>
              <input v-model="form.diaChi.diaChiChiTiet" type="text" />
            </div>
          </div>
        </form>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Huỷ</button>
          <button type="button" class="btn btn-success" @click="handleSubmit">Lưu</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const open = ref(false)
const showError = ref(false)

const errors = ref({
  email: false,
  soDienThoai: false,
  ngaySinh: false,
})

const form = ref({
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  gioiTinh: 'true',
  ngaySinh: '',
  trangThai: 1,
  diaChi: {
    idTinhThanhPho: '',
    idQuanHuyen: '',
    idXaPhuong: '',
    diaChiChiTiet: '',
    isMacDinh: false,
  }
})

const tinhThanhPhos = ref([])
const quanHuyens = ref([])
const xaPhuongs = ref([])

onMounted(async () => {
  try {
    const responseTinhThanh = await axios.get('/api/dia-chi/tinh-thanh')
    tinhThanhPhos.value = responseTinhThanh.data
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Tỉnh/Thành Phố:", err)
  }
})

const fetchQuanHuyen = async (idTinhThanh) => {
  try {
    const response = await axios.get(`/api/dia-chi/quan-huyen-by-tinh?idTinhThanh=${idTinhThanh}`)
    quanHuyens.value = response.data
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Quận/Huyện:", err)
  }
}

const fetchXaPhuong = async (idQuanHuyen) => {
  try {
    const response = await axios.get(`/api/dia-chi/xa-phuong-by-quan?idQuanHuyen=${idQuanHuyen}`)
    xaPhuongs.value = response.data
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Xã/Phường:", err)
  }
}

const closeModal = () => {
  open.value = false
  showError.value = false
  Object.assign(form.value, {
    tenKhachHang: '',
    email: '',
    soDienThoai: '',
    gioiTinh: 'true',
    ngaySinh: '',
    trangThai: 1,
    diaChi: {
      idTinhThanhPho: '',
      idQuanHuyen: '',
      idXaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false,
    }
  })
}

const emit = defineEmits(['added'])

const validatePhone = (phone) => /^(0[3|5|7|8|9])[0-9]{8}$/.test(phone)
const validateEmail = (email) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email)
const validateAge = (dob) => {
  const birthDate = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age >= 13
}

const handleSubmit = async () => {
  showError.value = true

  errors.value.email = !validateEmail(form.value.email)
  errors.value.soDienThoai = !validatePhone(form.value.soDienThoai)
  errors.value.ngaySinh = !validateAge(form.value.ngaySinh)

  const isEmpty =
    !form.value.tenKhachHang ||
    !form.value.email ||
    !form.value.soDienThoai ||
    !form.value.ngaySinh ||
    !form.value.diaChi.idTinhThanhPho ||
    !form.value.diaChi.idQuanHuyen ||
    !form.value.diaChi.idXaPhuong ||
    !form.value.diaChi.diaChiChiTiet

  if (errors.value.email || errors.value.soDienThoai || errors.value.ngaySinh || isEmpty) {
    return
  }

  try {
    await axios.post('/api/khach-hang', form.value)
    alert('Thêm khách hàng thành công!')
    emit('added')
    closeModal()
  } catch (err) {
    alert('Thêm thất bại: ' + (err.response?.data?.message || err.message))
  }
}
const isFullName = (name) => {
  return name && name.trim().split(" ").length >= 2;
};

const onTinhThanhChange = async () => {
  form.value.diaChi.idQuanHuyen = ''
  form.value.diaChi.idXaPhuong = ''
  xaPhuongs.value = []
  await fetchQuanHuyen(form.value.diaChi.idTinhThanhPho)
}

const onQuanHuyenChange = async () => {
  form.value.diaChi.idXaPhuong = ''
  await fetchXaPhuong(form.value.diaChi.idQuanHuyen)
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  width: 600px;
  max-width: 100%;
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  position: relative;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
   box-sizing: border-box;
  width: 100%;
}

.modal-close {
  font-size: 20px;
  background: none;
  border: none;
  color: #333;
  cursor: pointer;
  padding: 4px;
  transition: color 0.2s ease;
}

.modal-close:hover {
  color: #746f6f;
}

input,
select {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}

.error {
  border-color: red;
}

.text-red-500 {
  color: red;
}

.gender-row {
  display: flex;
  align-items: center;
  gap: 20px;
}

.gender-group {
  display: flex;
  gap: 30px;
}

.gender-group label {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-success {
  background-color: #0a2c57;
  color: white;
}

.btn-success:hover {
  background-color: #071f3e;
}

.modal-body {
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;

}
</style>
