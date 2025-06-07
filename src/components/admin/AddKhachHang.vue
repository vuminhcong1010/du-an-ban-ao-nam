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
            <div class="col-span-2">
              <label>Trạng thái:</label>
              <select v-model="form.trangThai">
                <option :value="1">Đang hoạt động</option>
                <option :value="0">Ngừng hoạt động</option>
              </select>
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
import { ref } from 'vue'
import axios from 'axios'

const open = ref(false)
const form = ref({
  tenKhachHang: '',
  email: '',
  soDienThoai: '',
  gioiTinh: 'true',
  ngaySinh: '',
  trangThai: 1
})

const closeModal = () => {
  open.value = false
  Object.assign(form.value, {
    tenKhachHang: '',
    email: '',
    soDienThoai: '',
    gioiTinh: 'true',
    ngaySinh: '',
    trangThai: 1
  })
}

// 👇 Emit để báo cho cha biết đã thêm xong
const emit = defineEmits(['added', 'close'])

const handleSubmit = async () => {
  try {
    await axios.post('/api/khach-hang', form.value)
    alert('Thêm khách hàng thành công!')
    emit('added') // 👈 báo cho cha load lại
    closeModal()
    // Emit hoặc gọi API refresh lại danh sách nếu cần
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
