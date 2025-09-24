<template>
  <!-- Tiêu đề + nút thêm -->
  <div class="bg-white p-3 rounded shadow mb-4">
  <div class="d-flex justify-content-between align-items-center">
    <h5 class="fw-semibold">Quản lý biến thể sản phẩm</h5>
    <div class="d-flex gap-2"> <!-- Gộp 2 nút vào 1 div để căn phải -->
      <button class="btn" data-bs-toggle="modal" @click="moModal(idChiTietSanPham)" data-bs-target="#exampleModal1" style="background-color: #0a2c57; color: white;">
        <i class="fa-solid fa-plus pe-2"></i>Thêm biến thể sản phẩm
      </button>
      <button class="btn" @click="generateAndDownloadAllQR()" style="background-color: #0a2c57; color: white;"> 
        <i class="fa-solid fa-qrcode pe-2"></i>Tải tất cả mã QR
      </button>
    </div>
  </div>
</div>


  <!-- Bộ lọc -->
  <div class="bg-white p-3 rounded shadow mb-4">
    <div class="row g-3">
      <!-- Tìm kiếm -->
      <div class="col-md-12">
        <label class="form-label fw-bold">Bộ lọc</label>
        <div class="d-flex align-items-center gap-2">
          <input type="text" class="form-control" v-model="keyword" placeholder="Tìm theo mã, tên sản phẩm" />
          <button type="button" class="btn" @click="apDungBoLoc" style="background-color: #0a2c57; color: white; white-space: nowrap;">Tìm kiếm</button>
          <button type="button" class="btn" @click="lamMoi" style="background-color: #0a2c57; color: white; white-space: nowrap;">Làm mới</button>
        </div>
      </div>

      <!-- Trạng thái -->
      <div class="col-md-4 ms-2">
        <label class="form-label fw-bold">Trạng thái</label>
        <div class="d-flex gap-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" name="trangThai" id="tatCa" value="tatCa" v-model="selectedTrangThai">
            <label class="form-check-label" for="tatCa">Tất cả</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="trangThai" id="dangBan" value="dangBan" v-model="selectedTrangThai">
            <label class="form-check-label" for="dangBan">Đang bán</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" name="trangThai" id="ngungBan" value="ngungBan" v-model="selectedTrangThai">
            <label class="form-check-label" for="ngungBan">Ngừng bán</label>
          </div>
        </div>
      </div>

      <!-- Màu -->
      <div class="col-md-2">
        <label class="form-label fw-bold">Màu</label>
        <select class="form-select" v-model="selectedMau">
          <option value="Tất cả">Tất cả</option>
          <option v-for="m in mau" :key="m.id" :value="m.ten">{{ m.ten }}</option>
        </select>
      </div>

      <!-- Kích cỡ -->
      <div class="col-md-2">
        <label class="form-label fw-bold">Kích cỡ</label>
        <select class="form-select" v-model="selectedKichCo">
          <option value="Tất cả">Tất cả</option>
          <option v-for="s in size" :key="s.id" :value="s.soCo">{{ s.soCo }}</option>
        </select>
      </div>

      <!-- Hiển thị -->
      <!-- <div class="col-md-3 ms-5">
        <label class="form-label fw-bold me-3">Danh sách hiển thị</label>
        <div class="d-flex align-items-center gap-3">
          <div class="form-check form-check-inline m-0">
            <input class="form-check-input" type="radio" name="thongTin" id="theoSP" :value="true" v-model="thongTin">
            <label class="form-check-label" for="theoSP">{{ maSP }}</label>
          </div>

          <div class="form-check form-check-inline m-0">
            <input class="form-check-input" type="radio" name="thongTin" id="toanBo" :value="false" v-model="thongTin">
            <label class="form-check-label" for="toanBo">Toàn bộ biến thể</label>
          </div>
        </div>
      </div> -->
    </div>
  </div>

  <!-- Danh sách -->
  <div class="bg-white p-3 rounded shadow mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
  <h5 class="fw-semibold m-0">Danh sách biến thể sản phẩm</h5>
  <div class="d-flex gap-2">
    <div class="form-group mb-2 me-3">
      <label class="form-label small fw-bold ">Số lượng:</label>
      <input type="text" class="form-control" placeholder="Nhập số lượng" style="width: 200px;" v-model="data.soLuong">
    </div>
    <div class="form-group mb-2 me-3">
        <label class="form-label small fw-bold ">Giá:</label>
        <input type="text" class="form-control" placeholder="Nhập giá" style="width: 200px;" v-model="data.gia">
    </div>
    
    
    <button class="btn mt-4" style="background-color: #0a2c57; color: white;width: 130px;
                height: 38px;" type="button" @click="updateAllGia()" > Xác nhận</button>
  </div>
</div>


    <table class="table table-hover text-center align-middle">
      <thead class="table-light">
        <tr>
          <th>
            <input
              type="checkbox"
              v-model="selectAll"
              @change="toggleSelectAll"
            />
          </th>
          <th>STT</th>
          <th>Mã SP</th>
          <th>Mã chi tiết sản phẩm</th>
          <th>Tên SP</th>
          <th>Màu</th>
          <th>Kích cỡ</th>
          <th>Số lượng</th>
          <th>Giá</th>
          <th>Trạng thái</th>
          <th>Hành động</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ds, index) in paginatedData" :key="ds.id">
          <td>
            <input
              type="checkbox"
              :checked="isChecked(ds.id)"
              @change="toggleRow(ds.id)"
            />
          </td>  
          <td>{{ index + 1 + (currentPage - 1) * itemsPerPage }}</td>
          <td>{{ ds.idSanPham.maSanPham }}</td>
          <td>{{ ds.maChiTietSapPham }}</td>
          <td>{{ ds.idSanPham.tenSanPham }}</td>
          <td>{{ ds.idMau.ten }}</td>
          <td>{{ ds.idSize.soCo }}</td>
          <td>{{ ds.soLuong }}</td>
          <td>{{ formatGia(ds.gia) }}</td>
          <td>
            <span :class="['status-badge', ds.trangThai == 1 ? 'active' : 'inactive']">
              {{ ds.trangThai == 1 ? 'Đang bán' : 'Ngừng bán' }}
            </span>
          </td>
          <td>
            <i class="fa-solid fa-repeat me-3" title="thay đổi trạng thái" style="color: #CC0000; font-size: 1.3rem;" @click="remove(ds.id)"></i>
            <i class="fa-solid fa-pen-to-square" title="cập nhật thông tin" data-bs-toggle="modal" data-bs-target="#exampleModal" @click="moModal(ds.id)" style="color: #0a2c57;font-size: 1.3rem;"></i>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Thanh phân trang -->
  <nav class="mt-4" v-if="totalPages > 1">
    <ul class="pagination justify-content-center">
      <li class="page-item" :class="{ disabled: currentPage === 1 }">
        <button class="page-link" @click="goToPage(currentPage - 1)">Previous</button>
      </li>
      <li
        v-for="page in totalPages"
        :key="page"
        class="page-item"
        :class="{ active: page === currentPage }"
      >
        <button class="page-link" @click="goToPage(page)">{{ page }}</button>
      </li>
      <li class="page-item" :class="{ disabled: currentPage === totalPages }">
        <button class="page-link" @click="goToPage(currentPage + 1)">Next</button>
      </li>
    </ul>
  </nav>

  <!-- Modal cập nhật -->
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Thông tin sản phẩm</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" />
        </div>
        <div class="modal-body">
          <component :is="UpdateSanPham" :idChiTietSanPham="send" @close-modal="dongModal1" />
        </div>
      </div>
    </div>
  </div>

  <!-- Modal thêm -->
  <div class="modal fade" id="exampleModal1" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Thêm biến thể</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" />
        </div>
        <div class="modal-body">
          <component :is="AddChiTietSanPham" :idChiTietSanPham="send" @close-modal="dongModal" />
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { useToast } from "vue-toastification";
import { useRoute } from 'vue-router'
import { ref, onMounted, watch, computed } from 'vue'
import axios from 'axios'
import { Modal, Toast } from 'bootstrap'
import { Eye, Trash } from 'lucide-vue-next'
import UpdateSanPham from './UpdateSanPham.vue'
import AddChiTietSanPham from './AddChiTietSanPham.vue'
import QRCode from 'qrcode'
import Cookies from 'js-cookie'
import Swal from 'sweetalert2'
const token = Cookies.get('token')
const toast = useToast();

// ============================
// Route và ID
// ============================
const route = useRoute()
const idChiTietSanPham = Number(route.params.id1)

// ============================
// Dữ liệu chính
// ============================
const allData = ref([])
const res = ref([])
const send = ref(null)
const mau = ref([])
const size = ref([])
// const thongTin = ref(false)
const thongTin = ref(false)
const maSP = ref()

// ============================
// Bộ lọc
// ============================
const keyword = ref('')
const selectedTrangThai = ref('tatCa')
const selectedMau = ref('Tất cả')
const selectedKichCo = ref('Tất cả')

// ============================
// Phân trang
// ============================
const currentPage = ref(1)
const itemsPerPage = 5

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return res.value.slice(start, start + itemsPerPage)
})

const totalPages = computed(() => {
  return Math.ceil(res.value.length / itemsPerPage)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
// ============================
// Gọi API chính
// ============================
// function ham() {
//   const url = thongTin.value
//     ? `http://localhost:8080/san-pham/bien-the-san-pham/${idChiTietSanPham}`
//     : "http://localhost:8080/san-pham/get-all-bien-the"

//   axios.get(url)
//     .then(response => {
//       allData.value = response.data
//       maSP.value = `SP${idChiTietSanPham.toString().padStart(4, '0')}` // ✅ sửa idCh thành idChiTietSanPham
//       apDungBoLoc()
//     })
//     .catch(error => {
//       console.error("Lỗi gọi API:", error)
//     })
// }
function ham() {
  const token = Cookies.get('token') // Lấy token từ cookie

  const url = thongTin.value
    ? `http://localhost:8080/san-pham/bien-the-san-pham/${idChiTietSanPham}`
    : "http://localhost:8080/san-pham/get-all-bien-the"

  axios.get(url, {
    headers: {
      Authorization: `Bearer ${token}` // ✅ Thêm token vào header
    }
  })
    .then(response => {
      allData.value = response.data
      maSP.value = `SP${idChiTietSanPham.toString().padStart(4, '0')}`
      keyword.value = maSP.value
      console.log(allData.value);
      
      // keyword.value = maSP.value
      apDungBoLoc()
    })
    .catch(error => {
      console.error("❌ Lỗi gọi API:", error)
      if (error.response?.status === 401) {
        console.error("🔒 Token hết hạn hoặc không có quyền truy cập")
      }
    })
}
function formatGia(gia) {
  if (gia === null || gia === undefined) return '';
  return gia.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
// ============================
// Hàm lọc client-side
// ============================
function apDungBoLoc() {
  currentPage.value = 1 // Reset về trang đầu mỗi khi lọc lại

  res.value = allData.value.filter(sp => {
    // const matchKeyword = sp.maChiTietSapPham?.toLowerCase().includes(keyword.value.toLowerCase()) ||
    //                      sp.idSanPham?.tenSanPham?.toLowerCase().includes(keyword.value.toLowerCase())||
    //                      sp.idSanPham?.maSanPham?.toLowerCase().includes(keyword.value.toLowerCase())
    const matchKeyword = sp.idSanPham?.tenSanPham?.toLowerCase().includes(keyword.value.toLowerCase())||
                         sp.idSanPham?.maSanPham?.toLowerCase().includes(keyword.value.toLowerCase())

    const matchTrangThai = selectedTrangThai.value === 'tatCa' ||
      (selectedTrangThai.value === 'dangBan' && sp.trangThai === 1) ||
      (selectedTrangThai.value === 'ngungBan' && sp.trangThai === 2)

    const matchMau = selectedMau.value === 'Tất cả' || sp.idMau?.ten === selectedMau.value
    const matchKichCo = selectedKichCo.value === 'Tất cả' || sp.idSize?.soCo === selectedKichCo.value

    return matchKeyword && matchTrangThai && matchMau && matchKichCo
  })
}

// ============================
// Sự kiện mounted
// ============================
onMounted(async () => {
  await ham()
  const response = await axios.get("http://localhost:8080/san-pham/add"  ,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  mau.value = response.data.maus
  size.value = response.data.kichCos
  selectedTrangThai.value = 'dangBan'  
})

// ============================
// Các watch lọc và loại hiển thị
// ============================
watch([keyword, selectedTrangThai, selectedMau, selectedKichCo], apDungBoLoc)
watch(thongTin, () => ham())

// ============================
// Modal xử lý
// ============================
function moModal(id) {
  send.value = id
}

function dongModal() {
  const modalEl = document.getElementById('exampleModal1')
  if (modalEl) {
    const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl)
    modalInstance.hide()
  }
  setTimeout(() => ham(), 1000)
}

function dongModal1() {
  const modalEl = document.getElementById('exampleModal')
  if (modalEl) {
    const modalInstance = Modal.getInstance(modalEl) || new Modal(modalEl)
    modalInstance.hide()
  }
  setTimeout(() => ham(), 1000)
}

// ============================
// Xoá
// ============================
async function  remove(id) {
    const result = await Swal.fire({
                    title: 'Xác nhận chuyển trạng thái?',
                    text: 'Bạn có chắc muốn chuyển trạng thái?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sửa',
                    cancelButtonText: 'Hủy'
                });
    if (!result.isConfirmed) {
      toast.info('Hủy thao tác chuyển trạng thái');
      console.log('User cancelled');
      return;
    }
  // if (confirm('Bạn có chắc chắn muốn xóa?')) {
    axios.get(`http://localhost:8080/san-pham/delete-chi-tiet-san-pham/${id}`  ,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    setTimeout(() => ham(), 300)
  // }
}

// ============================
// Tạo QR
// ============================
const selectedRows = ref([]) // Danh sách ID đang được chọn
const selectAll = ref(false) // Trạng thái checkbox tổng
async function generateAndDownloadAllQR() {
  if (selectedRows.value.length === 0) {
    toast.error("Vui lòng chọn ít nhất một biến thể để tạo mã QR.")
    return
  }

  for (const id of selectedRows.value) {
    // Tạo lại chuỗi mã chi tiết từ id (vd: 1 -> CTSP0001)
    const formattedId = `CTSP${id.toString().padStart(4, "0")}`

    
    for(let i=0;i<allData.value.length;i++){
      if(allData.value[i].maChiTietSapPham.includes(id)){
   const qrText = allData.value[i].maChiTietSapPham // Nội dung mã QR

    try {
      const dataUrl = await QRCode.toDataURL(qrText)
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = `QR_${id}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error(`Lỗi tạo QR cho mã chi tiết ${formattedId}:`, err)
    }
      }
      
    }

   
  }
}

function lamMoi(){
  keyword.value = "";
  apDungBoLoc()
}


// Khi bấm checkbox tổng
function toggleSelectAll() {
  if (selectAll.value) {
    selectedRows.value = paginatedData.value.map(item => item.id)
  } else {
    selectedRows.value = []
  }
  console.log(selectedRows.value);
  
}
let data = ref({
    array: [],
    gia: '',
    soLuong: ''
  })
function updateAllGia(){
  data.value.array = selectedRows.value
  axios.post("http://localhost:8080/san-pham/update-all",data.value  ,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(Response =>{
    ham()
    toast.success("Cập nhật thành công")
  }).catch(Error =>{
    toast.error("Cập nhật thất bại")
  })


}
// Khi bấm từng checkbox riêng lẻ
function toggleRow(id) {
  if (selectedRows.value.includes(id)) {
    selectedRows.value = selectedRows.value.filter(item => item !== id)
  } else {
    selectedRows.value.push(id)
  }

  // Đồng bộ lại trạng thái checkbox tổng
  selectAll.value = selectedRows.value.length === paginatedData.value.length
}

// Dùng trong `:checked` để xác định ô đã chọn
function isChecked(id) {
  return selectedRows.value.includes(id)
}

</script>
<style scoped>


.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.active {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-badge.inactive {
  background-color: #fbe9e7;
  color: #d32f2f;
}


</style>