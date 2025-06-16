<template>
  <div>
    <!-- Nút Add -->
    <button @click="open = true"
      style="background-color: #0a2c57; color: white; border: none; padding: 10px 20px; border-radius: 5px;">
      ➕ Thêm khách hàng
    </button>

    <!-- Form Modal -->
    <div v-if="open" class="modal-backdrop">
      <div class="modal-box">
        <h2 class="text-xl font-bold mb-4">Thêm khách hàng</h2>

        <form @submit.prevent="handleSubmit">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label>Họ tên:</label>
              <input v-model="form.tenKhachHang" type="text" required />
            </div>
            <div>
              <label>Email:</label>
              <input v-model="form.email" type="email" />
            </div>
            <div>
              <label>Số điện thoại:</label>
              <input v-model="form.soDienThoai" type="text" />
            </div>
            <div>
              <label>Ngày sinh:</label>
              <input v-model="form.ngaySinh" type="date" />
            </div>
            <div class="col-span-2">
              <label>Giới tính:</label>
              <label><input type="radio" value="true" v-model="form.gioiTinh" /> Nam</label>
              <label><input type="radio" value="false" v-model="form.gioiTinh" /> Nữ</label>
            </div>

            <!-- Tỉnh/Thành Phố -->
            <div>
              <label>Tỉnh/Thành Phố:</label>
              <select v-model="form.diaChi.idTinhThanhPho" @change="fetchQuanHuyen(form.diaChi.idTinhThanhPho)" required>
                <option value="">Chọn Tỉnh/Thành Phố</option>
                <option v-for="tinh in tinhThanhPhos" :key="tinh.id" :value="tinh.id">{{ tinh.tenTinhThanh }}</option>
              </select>
            </div>

            <!-- Quận/Huyện -->
            <div>
              <label>Quận/Huyện:</label>
              <select v-model="form.diaChi.idQuanHuyen" @change="fetchXaPhuong(form.diaChi.idQuanHuyen)" required>
                <option value="">Chọn Quận/Huyện</option>
                <option v-for="quan in quanHuyens" :key="quan.id" :value="quan.id">{{ quan.tenQuanHuyen }}</option>
              </select>
            </div>

            <!-- Xã/Phường -->
            <div>
              <label>Xã/Phường:</label>
              <select v-model="form.diaChi.idXaPhuong" required>
                <option value="">Chọn Xã/Phường</option>
                <option v-for="xa in xaPhuongs" :key="xa.id" :value="xa.id">{{ xa.tenXaPhuong }}</option>
              </select>
            </div>

            <!-- Địa chỉ chi tiết -->
            <div>
              <label>Địa chỉ chi tiết:</label>
              <input v-model="form.diaChi.diaChiChiTiet" type="text" required />
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button type="button" class="btn btn-secondary" @click="closeModal">Huỷ</button>
            <button type="submit" class="btn btn-success">Lưu</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { fetchTinhThanh, fetchQuanHuyenByTinh, fetchXaPhuongByQuan } from '@/api/DiaChiApi'
import { createCustomer } from '@/api/KhachHangApi'

const open = ref(false)
const form = ref({
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  gioiTinh: 'true',
  ngaySinh: '',
  trangThai: 1,
  diaChi: {
    idTinhThanhPho: '', // Tỉnh
    idQuanHuyen: '',   // Quận
    idXaPhuong: '',    // Xã
    diaChiChiTiet: '',
    isMacDinh: false,  // Địa chỉ mặc định
  }
})
const tinhThanhPhos = ref([])  // Danh sách tỉnh/thành phố
const quanHuyens = ref([])     // Danh sách quận/huyện
const xaPhuongs = ref([])      // Danh sách xã/phường

// Lấy danh sách tỉnh/thành phố khi component được mount
onMounted(async () => {
  try {
    const responseTinhThanh = await axios.get('http://localhost:8080/api/dia-chi/tinh-thanh');
    console.log("Dữ liệu tỉnh/thành phố:", responseTinhThanh.data);
    tinhThanhPhos.value = responseTinhThanh.data;
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Tỉnh/Thành Phố:", err);
    alert("Có lỗi xảy ra khi lấy danh sách Tỉnh/Thành Phố.");
  }
})

// Lấy danh sách quận/huyện theo tỉnh
const fetchQuanHuyen = async (idTinhThanh) => {
  try {
    const responseQuanHuyen = await axios.get(`http://localhost:8080/api/dia-chi/quan-huyen-by-tinh?idTinhThanh=${idTinhThanh}`)
    console.log("Dữ liệu quận/huyện:", responseQuanHuyen.data) // Debug
    quanHuyens.value = responseQuanHuyen.data
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Quận/Huyện:", err)
  }
}

// Lấy danh sách xã/phường theo quận
const fetchXaPhuong = async (idQuanHuyen) => {
  try {
    const responseXaPhuong = await axios.get(`http://localhost:8080/api/dia-chi/xa-phuong-by-quan?idQuanHuyen=${idQuanHuyen}`)
    console.log("Dữ liệu xã/phường:", responseXaPhuong.data) // Debug
    xaPhuongs.value = responseXaPhuong.data
  } catch (err) {
    console.error("Lỗi khi lấy danh sách Xã/Phường:", err)
  }
}

// Hàm đóng modal
const closeModal = () => {
  open.value = false
  Object.assign(form.value, {
    tenKhachHang: '',
    email: '',
    soDienThoai: '',
    gioiTinh: 'true',
    ngaySinh: '',
    trangThai: 1,
    diaChi: {
      idTinhThanhPho: '', // Tỉnh
      idQuanHuyen: '',   // Quận
      idXaPhuong: '',    // Xã
      diaChiChiTiet: '',
      isMacDinh: false,  // Địa chỉ mặc định
    }
  })
}

// 👇 Emit để báo cho cha biết đã thêm xong
const emit = defineEmits(['added', 'close'])

const handleSubmit = async () => {
  try {
    await createCustomer(form.value)  // Gửi yêu cầu POST tạo khách hàng
    alert('Thêm khách hàng thành công!')
    emit('added') // 👈 báo cho cha load lại
    closeModal()
  } catch (err) {
    alert('Thêm thất bại: ' + err.response?.data?.message || err.message)
  }
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
}

.modal-box {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  width: 500px;
}

input,
select {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 5px;
}
</style>
