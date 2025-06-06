<script setup>
import { onMounted, ref } from 'vue'
import search from '@/assets/search.png'
import add from '@/assets/add.png'
import arrow from '@/assets/arrow-down.png'
import deleteimg from '@/assets/delete.png'
import camera from '@/assets/camera.png'
import pen from '@/assets/pen.png'
import axios from 'axios'


const isFilterVisible = ref(false)
const hovering = ref(false)
const showTooltip = ref(false)
const showDeleteConfirm = ref(false)
const selectedNhanVienId = ref(null)
const selectedNhanVienName = ref("")
const showSuccessToast = ref(false)
const showAddModal = ref(false)
const showUpdateModal = ref(false)
const toastList = ref([]);





const openAddNhanVienModal = () => {   
     resetNhanVien();
  showAddModal.value = true; 
};


showAddModal.value = false;
const nhanVien = ref({
  maNhanVien: "",
  tenKhachHang: "",
  tenTaiKhoan: "",
  matKhau: "",
  email: "",
  sdt: "",
  ngayTao: "",
  ngaySua: "",
  diaChi: "",
  gioiTinh: "",
  trangThai: "",
  idVaiTro: {
    id: ""
  }
});

const resetNhanVien = () => {
  nhanVien.value = {
    maNhanVien: "",
    tenKhachHang: "",
    tenTaiKhoan: "",
    matKhau: "",
    email: "",
    sdt: "",
    ngayTao: "",
    ngaySua: "",
    diaChi: "",
    gioiTinh: "",
    trangThai: "",
    idVaiTro: {
      id: ""
    }
  };
};

const listNhanVien = ref({
  maNhanVien: "",
  tenKhachHang: "",
  tenTaiKhoan: "",
  matKhau: "",
  email: "",
  sdt: "",
  ngayTao: "",
  ngaySua: "",
  diaChi: "",
  gioiTinh: "",
  trangThai: "",
  idVaiTro: {
    id: ""
  }
});

const vaiTroList = ref([]);

const getData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/home')
    listNhanVien.value = response.data;
  } catch (error) {
    console.log(error);
  }
}
const getVaiTro = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/vai-tro');
    vaiTroList.value = response.data;
  } catch (error) {
    console.error("Lỗi khi load chức vụ:", error);
  }
}

function formatDateToInput(value) {
  if (!value) return "";
  const date = new Date(value);
  return date.toISOString().slice(0, 16);
}

const nhanVienById = async (id) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/${id}`);
    const data = response.data;

    // Tìm role ID từ tên role
    const matchedRole = vaiTroList.value.find(role => role.id === data.idVaiTro);
    const roleId = matchedRole ? matchedRole.id : "";


    // Gán lại dữ liệu vào form
    nhanVien.value = {
      id: data.id, 
      maNhanVien: data.maNhanVien || "",
      tenKhachHang: data.tenKhachHang || "",
      tenTaiKhoan: data.tenTaiKhoan || "",
      matKhau: data.matKhau || "",
      email: data.email || "",
      sdt: data.sdt || "",
      ngayTao: formatDateToInput(data.ngayTao),
      ngaySua: formatDateToInput(data.ngaySua),
      diaChi: data.diaChi || "",
      gioiTinh: data.gioiTinh,
      trangThai: data.trangThai || "",
      idVaiTro: {
        id: roleId
      },
    };
    console.log(nhanVien.value)
    showUpdateModal.value = true; // Mở form cập nhật
  } catch (error) {
    console.error("Lỗi khi lấy nhân viên theo ID:", error);
    showToastMessage("Không thể lấy dữ liệu nhân viên", "error");
  }
};


const nhanVienUpdate = async () => {
  if (!isValid()) {
    showToastMessage("Vui lòng điền đầy đủ thông tin bắt buộc.", "error");
    return;
  }

  try {
   nhanVien.value.ngaySua = formatDateToInput(new Date());

    const response = await axios.put(`http://localhost:8080/api/update/${nhanVien.value.id}`, nhanVien.value);
    console.log("Cập nhật thành công:", response.data);

    showUpdateModal.value = false;
    getData();
    resetNhanVien();
    showToastMessage("Cập nhật nhân viên thành công!", "success");
  } catch (error) {
    console.error("Lỗi khi cập nhật nhân viên:", error.response?.data || error.message);
    showToastMessage("Cập nhật nhân viên thất bại!", "error");
  }
};



const nhanVienDelete = async (id) => {
  try {
    const response = await axios.delete(`http://localhost:8080/api/delete/${id}`)
    console.log("data : ", response.data);
    getData();
    showToastMessage("Xóa nhân viên thành công!", "success");
  } catch (error) {
    console.log(error);
    showToastMessage("Xóa nhân viên thất bại!", "error");
  }
}

const isValid = () => {
  const nv = nhanVien.value;
  return nv.maNhanVien && nv.tenKhachHang && nv.tenTaiKhoan && nv.matKhau && nv.email && nv.sdt && nv.diaChi && nv.idVaiTro.id;
}


const nhanVienAdd = async () => {
  if (!isValid()) {
    showToastMessage("Vui lòng điền đầy đủ thông tin bắt buộc.", "error");
    return;
  }

  try {
    const now = new Date().toISOString();
    nhanVien.value.ngayTao = now;
    nhanVien.value.ngaySua = now;
    nhanVien.value.trangThai = 1;

    const response = await axios.post(`http://localhost:8080/api/addNhanVien`, nhanVien.value);
    console.log("Thêm nhân viên thành công:", response.data);
    showAddModal.value = false;
    getData();
    resetNhanVien();
    showToastMessage("Thêm nhân viên thành công!", "success");
  } catch (error) {
    console.error("Lỗi khi thêm nhân viên:", error.response?.data || error.message);
    showToastMessage("Thêm nhân viên thất bại!", "error");
  }
};






onMounted(() => {
  getData();
  getVaiTro();
})


const confirmDelete = async () => {
  if (selectedNhanVienId.value != null) {
    await nhanVienDelete(selectedNhanVienId.value)
    showDeleteConfirm.value = false
    selectedNhanVienId.value = null
    showSuccessToast.value = true
    // Ẩn sau 3 giây
    setTimeout(() => {
      showSuccessToast.value = false
    }, 3000)
  }
}

const showToastMessage = (message, type = "success") => {
  const id = Date.now();
  toastList.value.push({ id, message, type });

  setTimeout(() => {
    toastList.value = toastList.value.filter(toast => toast.id !== id);
  }, 3000);
};

const openDeleteModal = (nv) => {
  if (selectedNhanVienId && selectedNhanVienName) {
    selectedNhanVienId.value = nv.id
    selectedNhanVienName.value = nv.tenKhachHang
    showDeleteConfirm.value = true
  }
}


</script>

<template>
  <div class="bg-white rounded d-flex shadow custom-container" @mouseenter="hovering = true"
    @mouseleave="hovering = false">
    <div class="title-box">
      <h6>Quản Lý Nhân Viên</h6>
    </div>

    <div class="search-box">
      <img :src="search" alt="search" style="width: 3%; ">
      <input type="text" placeholder="Tìm Kiếm Theo Mã Nhân Viên, Tên Nhân Viên">
    </div>

    <div @click="openAddNhanVienModal()" class="btn_addNhanVien">
      <img :src="add" alt="add" style="width: 20px; height: 20px;">
      <button>Nhân Viên</button>
    </div>


    <div v-if="hovering" class="arrow-toggle-container">
      <div class="arrow-btn" @mouseenter="showTooltip = true" @mouseleave="showTooltip = false"
        @click="isFilterVisible = !isFilterVisible">
        <img :src="arrow" alt="arrow" class="arrow-icon" :class="{ 'rotate-up': isFilterVisible }" />
        <div v-if="showTooltip" class="tooltip-text">
          {{ isFilterVisible ? 'Ẩn bộ lọc' : 'Hiện bộ lọc' }}
        </div>
      </div>
    </div>
  </div>

  <div v-show="isFilterVisible" class="filter-section">
    <label>Trạng thái:</label>
    <input type="radio" name="status"> Đang làm Việc
    <input type="radio" name="status"> Đã Nghĩ
  </div>

  <div class="table">
    <table>
      <thead>
        <tr>
          <th>STT </th>
          <th>Mã Nhân Viên </th>
          <th>Chức Vụ </th>
          <th>Tên Nhân Viên </th>
          <th>Tên Tài Khoản </th>
          <th>mật Khẩu </th>
          <th>Email </th>
          <th>SĐT </th>
          <th>Ảnh </th>
          <th>Ngày Tạo </th>
          <th>Ngày Sửa </th>
          <th>Địa Chỉ </th>
          <th>Giới Tính</th>
          <th>Trạng Thái </th>
          <th>ACtion</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(nv, i) in listNhanVien" :key="nv.id">
          <td>{{ i + 1 }}</td>
          <td>{{ nv.maNhanVien }}</td>
          <td>{{ nv.tenRole }}</td>
          <td>{{ nv.tenKhachHang }}</td>
          <td>{{ nv.tenTaiKhoan }}</td>
          <td>{{ nv.matKhau }}</td>
          <td>{{ nv.email }}</td>
          <td>{{ nv.sdt }}</td>
          <td>{{ nv.anh }}</td>
          <td>{{ nv.ngayTao }}</td>
          <td>{{ nv.ngaySua }}</td>
          <td>{{ nv.diaChi }}</td>
          <td>{{ nv.gioiTinh ? `Nam` : `Nữ` }}</td>
          <td>{{ nv.trangThai ? `Đang Làm Việc` : `Đã Nghỉ` }}</td>
          <td>
            <div @click="nhanVienById(nv.id)">
              <img :src="pen" alt="update" style="width: 30%;" />
            </div>
            <div @click="openDeleteModal(nv)">
              <img :src="deleteimg" alt="delete" style="width: 30%;" />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div v-if="showDeleteConfirm" class="modal-overlay">
    <div class="modal-box">
      <p>
        Xác nhận nhân viên <strong>{{ selectedNhanVienName }}</strong> ngừng làm việc?
      </p>
      <p class="note">Hệ thống sẽ ghi nhận ngừng làm việc</p>

      <div class="modal-buttons">
        <button @click="showDeleteConfirm = false">Bỏ qua</button>
        <button class="confirm" @click="confirmDelete">Đồng ý</button>
      </div>
    </div>
  </div>

  <div class="toast-container">
    <div v-for="toast in toastList" :key="toast.id" :class="['toast-notification', toast.type]">
      <span v-if="toast.type === 'success'">✅</span>
      <span v-else-if="toast.type === 'error'">❌</span>
      <span>{{ toast.message }}</span>
    </div>
  </div>

  <div class="modal-overlay1" v-if="showUpdateModal">
    <div class="modal-box1 employee-form-box">
      <div>
        <h4>Cập Nhập Nhân Viên </h4>
      </div>
      <!-- Tabs -->
      <div class="tabs">
        <div>Thông tin</div>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <!-- Avatar -->
        <div class="avatar-section">
          <div class="avatar-box">
            <i class="camera-icon"><img :src="camera" alt="camera" style="width: 30%;" /></i>
          </div>
          <button class="select-photo-btn">Chọn ảnh</button>
        </div>

        <!-- Inputs -->
        <div class="info-box">
          <h5 class="ttkhoitao">Thông tin khởi tạo</h5>
          <div class="form-row">
            <label>Mã nhân viên</label>
            <input type="text" v-model="nhanVien.maNhanVien" />
            <label>Tên nhân viên</label>
            <input type="text" v-model="nhanVien.tenKhachHang" />
          </div>
          <div class="form-row">
            <label>Tên Tài Khoản </label>
            <input type="text" v-model="nhanVien.tenTaiKhoan" />
            <label>Mật Khẩu</label>
            <input type="password" v-model="nhanVien.matKhau" />
          </div>
          <div class="form-row">
            <label>Email</label>
            <input type="email" v-model="nhanVien.email" />
            <label>SĐT</label>
            <input type="text" v-model="nhanVien.sdt" />
          </div>
          <div class="form-row">
            <label>Ngày Tạo </label>
            <input type="datetime-local" v-model="nhanVien.ngayTao" />
            <label>Ngày Sửa</label>
            <input type="datetime-local" v-model="nhanVien.ngaySua" />
          </div>
          <div class="form-row">
            <label>Địa Chỉ </label>
            <input type="text" v-model="nhanVien.diaChi" />
            <label>Giới Tính</label>
            <div class="radio-group">
              <label><input type="radio" name="gioi_tinh" v-model="nhanVien.gioiTinh" :value="true" /> Nam</label>
              <label><input type="radio" name="gioi_tinh" v-model="nhanVien.gioiTinh" :value="false" /> Nữ</label>
            </div>
          </div>
          <div class="form-row">
            <label>Chức Vụ</label>
            <select v-model="nhanVien.idVaiTro.id">
              <option disabled value="">-- Chọn chức vụ --</option>
              <option v-for="item in vaiTroList" :key="item.id" :value="item.id">
                {{ item.tenRole }}
              </option>
            </select>
            <select v-model="nhanVien.trangThai">
              <option disabled value="">-- Chọn Trạng Thái --</option>
              <option :value="1">Đang Làm Việc</option>
            </select>
          </div>

          <!-- <button class="more-info-btn">Thêm thông tin</button> -->
        </div>
      </div>

      <!-- Footer buttons -->
      <div class="modal-buttons1">
        <button @click="showUpdateModal = false">Bỏ qua</button>
        <button class="confirm" @click="nhanVienUpdate()">Lưu</button>
      </div>
    </div>
  </div>







  <div class="modal-overlay1" v-if="showAddModal">
    <div class="modal-box1 employee-form-box">
      <div>
        <h4>Thêm Mới Nhân Viên </h4>
      </div>
      <!-- Tabs -->
      <div class="tabs">
        <div>Thông tin</div>
      </div>

      <!-- Form Content -->
      <div class="form-content">
        <!-- Avatar -->
        <div class="avatar-section">
          <div class="avatar-box">
            <i class="camera-icon"><img :src="camera" alt="camera" style="width: 30%;" /></i>
          </div>
          <button class="select-photo-btn">Chọn ảnh</button>
        </div>

        <!-- Inputs -->
        <div class="info-box">
          <h5 class="ttkhoitao">Thông tin khởi tạo</h5>
          <div class="form-row">
            <label>Mã nhân viên</label>
            <input type="text" v-model="nhanVien.maNhanVien" />
            <label>Tên nhân viên</label>
            <input type="text" v-model="nhanVien.tenKhachHang" />
          </div>
          <div class="form-row">
            <label>Tên Tài Khoản </label>
            <input type="text" v-model="nhanVien.tenTaiKhoan" />
            <label>Mật Khẩu</label>
            <input type="password" v-model="nhanVien.matKhau" />
          </div>
          <div class="form-row">
            <label>Email</label>
            <input type="email" v-model="nhanVien.email" />
            <label>SĐT</label>
            <input type="text" v-model="nhanVien.sdt" />
          </div>
          <div class="form-row">
            <label>Ngày Tạo </label>
            <input type="datetime-local" v-model="nhanVien.ngayTao" />
            <label>Ngày Sửa</label>
            <input type="datetime-local" v-model="nhanVien.ngaySua" />
          </div>
          <div class="form-row">
            <label>Địa Chỉ </label>
            <input type="text" v-model="nhanVien.diaChi" />
            <label>Giới Tính</label>
            <div class="radio-group">
              <label><input type="radio" name="gioi_tinh" v-model="nhanVien.gioiTinh" :value="true" /> Nam</label>
              <label><input type="radio" name="gioi_tinh" v-model="nhanVien.gioiTinh" :value="false" /> Nữ</label>
            </div>
          </div>
          <div class="form-row">
            <label>Chức Vụ</label>
            <select v-model="nhanVien.idVaiTro.id">
              <option disabled value="">-- Chọn chức vụ --</option>
              <option v-for="item in vaiTroList" :key="item.id" :value="item.id">
                {{ item.tenRole }}
              </option>
            </select>
            <select v-model="nhanVien.trangThai">
              <option disabled value="">-- Chọn Trạng Thái --</option>
              <option :value="1">Đang Làm Việc</option>
            </select>
          </div>

          <!-- <button class="more-info-btn">Thêm thông tin</button> -->
        </div>
      </div>

      <!-- Footer buttons -->
      <div class="modal-buttons1">
        <button @click="showAddModal = false">Bỏ qua</button>
        <button class="confirm" @click="nhanVienAdd()">Lưu</button>
      </div>
    </div>
  </div>




</template>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.toast-notification {
  min-width: 250px;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  animation: slideInOut 3s forwards;
}

.toast-notification.success {
  background-color: #E6F8EC;
  border: 1px solid #00B63E;
  color: #00B63E;
}

.toast-notification.error {
  background-color: #FFE6E6;
  border: 1px solid #BE4141;
  color: #BE4141;
}


@keyframes slideInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }

  10%,
  90% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(20px);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20%);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.employee-form-box {
  width: 100%;
  max-width: 1100px;
  background: white;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);
  position: relative;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #ddd;
  margin-bottom: 20px;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  border-bottom: 3px solid transparent;
  color: gray;
}

.tab.active {
  color: #007bff;
  font-weight: bold;
  border-color: #007bff;
}

.form-content {
  display: flex;
  gap: 20px;
}

.avatar-section {
  width: 160px;
  text-align: center;
}

.avatar-box {
  width: 140px;
  height: 140px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin: auto;
  background-color: #f9f9f9;
}

.select-photo-btn {
  margin-top: 10px;
  padding: 6px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
  cursor: pointer;
}

.info-box {
  font-weight: bolder;
  flex: 1;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 10px;
}

.info-box h5 {
  margin-left: -800px;
}

.radio-group {
  display: flex;
  gap: 20px;
  justify-content: flex-end;
  flex: 1;
}

.radio-group label {
  display: flex;
  align-items: center;
  gap: 5px;
}

.form-row {
  display: flex;
  gap: 20px;
  margin-bottom: 15px;
  align-items: center;
}

.form-row label {
  width: 140px;
}

.form-row input,
.form-row select {
  flex: 1;
  padding: 8px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.more-info-btn {
  margin-top: 10px;
  padding: 8px 16px;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  cursor: pointer;
}

.modal-buttons1 {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.modal-buttons1 button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.modal-buttons1 .confirm {
  background-color: #007bff;
  color: white;
}

.form-content input,
.form-content select {
  width: 100%;
  padding: 6px 10px;
  margin-bottom: 12px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

.form-content label {
  font-weight: bold;
  margin-bottom: 4px;
  display: block;
}



@keyframes fade-in-out {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }

  10% {
    opacity: 1;
    transform: translateY(0);
  }

  90% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(-10px);
  }
}

.modal-overlay1 {
  position: fixed;
  top: 0px;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-box1 {
  background: white;
  margin-top: -100px;
  padding: 20px;
  border-radius: 10px;
  width: 1100px;
  text-align: center;
  box-shadow: 0 0 50px rgb(253, 156, 237);
}

.modal-box1 {
  position: relative;
  /* Để dùng vị trí tương đối cho nút */
  background: white;
  padding: 20px 20px 80px;
  /* chừa khoảng trống dưới */
  border-radius: 10px;
  width: 90%;
  max-width: 1200px;
  text-align: center;
  box-shadow: 0 0 50px rgb(253, 156, 237);
  overflow: hidden;
}

.modal-buttons1 {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
}

.modal-buttons1 button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.modal-buttons1 .confirm {
  background-color: #007bff;
  color: white;
}

.modal-overlay {
  position: fixed;
  top: 0px;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  margin-top: -500px;
  padding: 20px;
  border-radius: 10px;
  width: 500px;
  text-align: center;
  box-shadow: 0 0 50px rgb(253, 156, 237);
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: space-around;
}

.modal-buttons button {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

.modal-buttons .confirm {
  background-color: #007bff;
  color: white;
}

.table {
  margin-top: 20px;
  width: 100%;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th {
  background-color: #E6F1FE;
}

th,
td {
  padding: 8px;
  text-align: left;

}

.custom-container {
  margin-top: -20px;
  position: relative;
  padding: 5px;
  justify-content: space-between;
  align-items: center;
  display: flex;
  flex-wrap: wrap;
}


.search-box {
  margin-left: -300px;
  width: 500px;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 7px;
  border: 2px solid rgb(41, 109, 210);
  cursor: pointer;
}

.search-box:hover {
  background-color: #f0f0f0;
}

.search-box input[type="text"] {
  width: 470px;
  border: none;
  outline: none;
  background-color: transparent;
}

.search-box input[type="text"]:focus {
  outline: none;
  border: none;
  box-shadow: none;
}

.search-box input[type="text"]:hover {
  background-color: #f0f0f0;
}


.btn_addNhanVien {
  margin-right: 40px;
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 7px;
  border: 2px solid rgb(41, 109, 210);
  padding: 1px 10px;
  cursor: pointer;
  gap: 5px;
}

.btn_addNhanVien:hover {
  background-color: #f0f0f0;
}

.btn_addNhanVien button {
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.arrow-toggle-container {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: center;
}

.arrow-btn {
  background-color: #ffffff;
  color: white;
  border: 2px #2e82d6;
  padding: 6px;
  border-radius: 50%;
  cursor: pointer;
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-icon {
  width: 14px;
  transition: transform 0.3s ease;
}

.arrow-icon.rotate-up {
  transform: rotate(180deg);
}

.tooltip-text {
  position: absolute;
  top: 50%;
  left: 110%;
  transform: translateY(-50%);
  background-color: #00284f;
  color: white;
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
  z-index: 10;
}

.filter-section {
  margin-top: 5px;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #ffffff;
  width: 100%;
}
</style>
