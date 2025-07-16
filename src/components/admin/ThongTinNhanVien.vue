<template>
  <div class="container mt-4">
    <div class="bg-white p-3 rounded border mb-4">
        <h5 class="fw-bold mb-0">Thông tin nhân viên:</h5> 
    </div>
    <div class="bg-white p-3 rounded border mb-4">
    <div class="avatar-wrapper">
    <div class="avatar-profile">
        <img :src="nhanVien.anh" alt="Avatar nhân viên" />
    </div>
    </div>

    <form class="row g-3">
      <div class="col-md-6">
        <label class="form-label">Mã nhân viên</label>
        <input type="text" class="form-control" v-model="nhanVien.maNhanVien" readonly />
      </div>

      <div class="col-md-6">
        <label class="form-label">Tên nhân viên</label>
        <input type="text" class="form-control" v-model="nhanVien.tenNhanVien" readonly />
      </div>

      <div class="col-md-6">
        <label class="form-label">Email</label>
        <input type="email" class="form-control" v-model="nhanVien.email" readonly/>
      </div>

      <div class="col-md-6">
        <label class="form-label">Số điện thoại</label>
        <input type="tel" class="form-control" v-model="nhanVien.sdt" readonly/>
      </div>

      <div class="col-md-6">
        <label class="form-label">Giới tính</label>
        <select class="form-select" v-model="nhanVien.gioiTinh" disabled>
          <option :value="true">Nam</option>
          <option :value="false">Nữ</option>
        </select>
      </div>

      <div class="col-md-6">
        <label class="form-label">Ngày sinh</label>
        <input type="date" class="form-control" v-model="nhanVien.ngaySinh" readonly/>
      </div>

      <div class="col-md-6">
        <label class="form-label">CCCD</label>
        <input type="text" class="form-control" v-model="nhanVien.cccd" readonly />
      </div>

      <div class="col-md-6">
        <label class="form-label">Vai trò</label>
        <input type="text" class="form-control" :value="nhanVien.role?.roleName" readonly />
      </div>

      <div class="col-md-6">
        <label class="form-label">Trạng thái</label>
        <select class="form-select" v-model="nhanVien.trangThai" disabled>
          <option :value="1">Đang hoạt động</option>
          <option :value="0">Ngừng hoạt động</option>
        </select>
      </div>
    <div class="col-md-6">
            <label class="form-label">Địa chỉ</label>
            <input type="text" class="form-control" :value="diaChi" readonly />
        </div>
      <div class="col-md-12">
        <label class="form-label">Ghi chú</label>
        <textarea class="form-control" v-model="nhanVien.ghiChu" rows="2" readonly></textarea>
      </div>

      
    </form>
  </div>
</div>
</template>



<script setup>
import { ref, onMounted,computed } from 'vue';
import axios from 'axios';
import Cookies from 'js-cookie';

const token = Cookies.get('token');
const nhanVien = ref({
  id: null,
  maNhanVien: '',
  tenNhanVien: '',
  email: '',
  sdt: '',
  gioiTinh: true,
  ngaySinh: '',
  cccd: '',
  matKhau: '',
  role: {
    id: null,
    roleName: ''
  },
  trangThai: 1,
  ghiChu: '',
  thonXom: '',
  xaPhuong: '',
  quanHuyen: '',
  tinhThanh: '',
  anh: ''
});


const diaChi = computed(() => {
  const nv = nhanVien.value;
  return `${nv.thonXom || ''}, ${nv.xaPhuong || ''}, ${nv.quanHuyen || ''}, ${nv.tinhThanh || ''}`;
});

onMounted(() => {
  axios
    .post('http://localhost:8080/thong-tin-nhan-vien', { token })
    .then((response) => {
      nhanVien.value = response.data.data;
      console.log(response.data.data);
      
    })
    .catch((err) => {
      console.error('Lỗi khi lấy thông tin nhân viên:', err);
    });
});
</script>
<style scoped>
.avatar-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.avatar-profile {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ccc;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-profile img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}


</style>