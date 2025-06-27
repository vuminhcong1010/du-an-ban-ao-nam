<template>
  <div class="bg-white p-3 rounded shadow mb-4">
    <div class="d-flex justify-content-between align-items-center">
      <h5 class="fw-semibold">Quản lý biến thể sản phẩm</h5>
      <button class="btn" data-bs-toggle="modal" @click="moModal(idChiTietSanPham)" data-bs-target="#exampleModal1" style="background-color: #0a2c57; color: white;">
        <i class="fa-solid fa-plus pe-2"></i>Thêm biến thể sản phẩm
      </button>
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
        </div>
      </div>

      <!-- Trạng thái -->
      <div class="col-md-5 ms-2">
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
      <div class="col-md-3">
        <label class="form-label fw-bold">Màu</label>
        <select class="form-select" v-model="selectedMau">
          <option value="Tất cả">Tất cả</option>
          <option v-for="m in mau" :key="m.id" :value="m.ten">{{ m.ten }}</option>
        </select>
      </div>

      <!-- Kích cỡ -->
      <div class="col-md-3">
        <label class="form-label fw-bold">Kích cỡ</label>
        <select class="form-select" v-model="selectedKichCo">
          <option value="Tất cả">Tất cả</option>
          <option v-for="s in size" :key="s.id" :value="s.soCo">{{ s.soCo }}</option>
        </select>
      </div>
    </div>
  </div>

  <!-- Danh sách -->
  <div class="bg-white p-3 rounded shadow mb-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="fw-semibold m-0">Danh sách biến thể sản phẩm</h5>
    </div>

    <table class="table table-hover text-center align-middle">
      <thead class="table-light">
        <tr>
          <th>STT</th>
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
        <tr v-for="(ds, index) in res" :key="index">
          <td>{{ index + 1 }}</td>
          <td>{{ ds.maChiTietSapPham }}</td>
          <td>{{ ds.idSanPham.tenSanPham }}</td>
          <td>{{ ds.idMau.ten }}</td>
          <td>{{ ds.idSize.soCo }}</td>
          <td>{{ ds.soLuong }}</td>
          <td>{{ ds.gia }}</td>
          <td>
            <span v-if="ds.trangThai === 1" class="badge rounded-pill" style="background-color: #3B82F6;">Đang bán</span>
            <span v-else class="badge rounded-pill text-bg-warning text-white" style="background-color: #3B82F6;">Ngừng bán</span>
          </td>
          <td>
            <Trash class="me-3" style="color: #CC0000;" @click="remove(ds.id)" />
            <Eye class="me-3" data-bs-toggle="modal" data-bs-target="#exampleModal" @click="moModal(ds.id)" style="color: #0a2c57;" />
          </td>
        </tr>
      </tbody>
    </table>
  </div>

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
import { useRoute } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { Modal } from 'bootstrap'
import { Eye, Trash } from 'lucide-vue-next'
import UpdateSanPham from './UpdateSanPham.vue'
import AddChiTietSanPham from './AddChiTietSanPham.vue'

const route = useRoute()
const idChiTietSanPham = Number(route.params.id1)

let res = ref([])
let allData = ref([])
let send = ref(null)
let mau = ref([])
let size = ref([])

// Bộ lọc
const keyword = ref('')
const selectedTrangThai = ref('tatCa')
const selectedMau = ref('Tất cả')
const selectedKichCo = ref('Tất cả')

onMounted(async () => {
  await ham()
  const response = await axios.get("http://localhost:8080/san-pham/add")
  mau.value = response.data.maus
  size.value = response.data.kichCos
  selectedTrangThai.value = 'dangBan'
})

function ham() {
  axios.get(`http://localhost:8080/san-pham/bien-the-san-pham/${idChiTietSanPham}`)
    .then(response => {
      allData.value = response.data
      res.value = [...response.data]
    })
    .catch(error => {
      console.error(error)
    })
}

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

function remove(id) {
  if (confirm('Bạn có chắc chắn muốn xóa?')) {
    axios.get(`http://localhost:8080/san-pham/delete-chi-tiet-san-pham/${id}`)
    setTimeout(() => ham(), 300)
  }
}

// Hàm lọc
function apDungBoLoc() {
  res.value = allData.value.filter(sp => {
    const matchKeyword = sp.maChiTietSapPham.toLowerCase().includes(keyword.value.toLowerCase()) ||
                         sp.idSanPham.tenSanPham.toLowerCase().includes(keyword.value.toLowerCase())
    const matchTrangThai = selectedTrangThai.value === 'tatCa' ||
      (selectedTrangThai.value === 'dangBan' && sp.trangThai === 1) ||
      (selectedTrangThai.value === 'ngungBan' && sp.trangThai === 2)
    const matchMau = selectedMau.value === 'Tất cả' || sp.idMau.ten === selectedMau.value
    const matchKichCo = selectedKichCo.value === 'Tất cả' || sp.idSize.soCo === selectedKichCo.value

    return matchKeyword && matchTrangThai && matchMau && matchKichCo
  })
}

// Lọc tự động
watch([keyword, selectedTrangThai, selectedMau, selectedKichCo], apDungBoLoc)
</script>
