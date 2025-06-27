<template>
 
  <div class="container py-4">
    <form @submit.prevent="uploadAllImages">
      <div class="bg-white p-4 rounded shadow">
        <h5 class="fw-semibold mb-4">Chi tiết sản phẩm</h5>
        <div class="row">
          <!-- Cột bên trái -->
          <div class="col-md-8">
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label fw-bolder">Tay áo</label>
                <select class="form-select" v-model="req.idTayAo.id">
                  <option :value="ds.id" v-for="ds in tayAo" :key="ds.id">{{ ds.tenTayAo }}</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-bolder">Kiểu áo</label>
                <select class="form-select" v-model="req.idKieuAo.id">
                  <option :value="ds.id" v-for="ds in kieuAo" :key="ds.id">{{ ds.tenKieuAo }}</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-bolder">Màu</label>
                <select class="form-select" v-model="req.idMau.id">
                  <option :value="ds.id" v-for="ds in mau" :key="ds.id">{{ ds.ten }}</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-bolder">Kích cỡ</label>
                <select class="form-select" v-model="req.idSize.id">
                  <option :value="ds.id" v-for="ds in size" :key="ds.id">{{ ds.soCo }}</option>
                </select>
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label fw-bolder">Cổ áo</label>
                <select class="form-select" v-model="req.idCoAo.id">
                  <option :value="ds.id" v-for="ds in coAo" :key="ds.id">{{ ds.tenCoAo }}</option>
                </select>
              </div>


            </div>
          </div>

          <!-- Cột bên phải -->
          <div class="col-md-4">
            <div class="mb-3">
              <label class="form-label fw-bolder">Số lượng</label>
              <input type="number" class="form-control" v-model="req.soLuong" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-bolder">Giá</label>
              <input type="text" class="form-control" v-model="req.gia" />
            </div>
            <div class="mb-3">
              <label class="form-label fw-bolder">Trọng lượng</label>
              <input type="text" class="form-control" v-model="req.trongLuong" />
            </div>
          </div>
        </div>

        <!-- Mô tả và ảnh -->
        <div class="row mb-3">
          <!-- Mô tả -->
          <div class="col-md-9">
            <label class="form-label fw-bolder">Mô tả</label>
            <textarea class="form-control rounded shadow-sm" rows="5" v-model="req.moTa"></textarea>
          </div>

          <!-- Ảnh sản phẩm -->
<!-- Ảnh sản phẩm -->
<div class="col-md-3">
  <label class="form-label fw-bolder">Ảnh sản phẩm</label>
  <div class="d-flex flex-column gap-2">
    <!-- Nút chọn ảnh -->
    <input
      type="file"
      :id="'fileInput-0'"
      class="d-none"
      accept="image/*"
      @change="event => handleFilesChange(event, 0)"
    />
    <label
      :for="'fileInput-0'"
      class="btn btn-outline-primary d-flex flex-column align-items-center justify-content-center py-2 rounded"
    >
      <i class="fa fa-plus mb-1"></i>
      <small>Chọn ảnh</small>
    </label>
  </div>
<img :src="image" alt="" v-if="show" class="position-relative border rounded mt-2"
style="width: 80px; height: 60px; overflow: hidden;">
  <!-- Ảnh preview -->
  <div
    v-if="(files[0] && files[0][0]) || (imageUrls[0] && imageUrls[0][0])"
    class="position-relative border rounded mt-2"
    style="width: 80px; height: 60px; overflow: hidden;"
  >

  
    <img
      :src="files[0]?.[0]?.preview || imageUrls[0]?.[0]"
      class="img-fluid"
      style="object-fit: cover; width: 100%; height: 100%;"
      v-if="!show"
    />
    
    <button
      v-if="files[0]?.[0]"
      @click="removeFile(0, 0)"
      class="btn btn-sm btn-danger position-absolute top-0 end-0"
      style="padding: 2px 5px;"
    >
      <i class="fa-solid fa-trash fa-xs"></i>
    </button>
    <button
      v-else
      @click="removeUploadedImage(0, 0)"
      class="btn btn-sm btn-danger position-absolute top-0 end-0"
      style="padding: 2px 5px;"
    >
      <i class="fa-solid fa-trash fa-xs"></i>
    </button>
  </div>
</div>
        </div>

        <!-- Nút xác nhận -->
        <div class="text-end mt-5" style="position: relative; bottom: 5px;">
          <button class="btn text-white px-4" style="background-color: #0a2c57;">
            Xác nhận
          </button>
        </div>
      </div>
    </form>
  </div>
</template>
<script setup>
import axios from 'axios'
import { ref, watch, onBeforeUnmount } from 'vue'

const props = defineProps({
  idChiTietSanPham: {
    type: Number,
    default: null,
    required: true
  }
})

// Data
let chatLieu = ref()
let kieuAo = ref()
let size = ref()
let coAo = ref()
let mau = ref()
let tayAo = ref()
let danhMuc = ref()
let image = ref([])
let show = ref(true)


const files = ref([]) // chứa các File mới chọn
const imageUrls = ref([]) // chứa các link ảnh Cloudinary

// Cloudinary config
const cloudName = 'drwg13d1l'
const uploadPreset = 'hungdzvcl'

// Request body
let req = ref({
  idChiTietSanPham: null,
  idSanPham: { id: null },
  maChiTietSapPham: '',
  gia: [],
  trongLuong: null,
  soLuong: [],
  moTa: '',
  ngayTao: '',
  trangThai: 1,
  idMau: [],
  idSize: [],
  images: [],
  idDanhMuc: { id: null },
  idCoAo: { id: null },
  idTayAo: { id: null },
  idKieuAo: { id: null }
})

// Fetch dữ liệu sản phẩm khi props thay đổi
watch(() => props.idChiTietSanPham, async (newVal) => {
  try {
    const response = await axios.get(`http://localhost:8080/san-pham/find-by-id/${newVal}`)
    const data = response.data
    chatLieu.value = data.wrapper.chatLieus
    kieuAo.value = data.wrapper.kieuAos
    mau.value = data.wrapper.maus
    tayAo.value = data.wrapper.tayAos
    coAo.value = data.wrapper.coAos
    size.value = data.wrapper.kichCos
    danhMuc.value = data.wrapper.danhMucs
    image.value = data.image
    req.value = data.chiTietSanPham
    req.value.idChiTietSanPham = data.chiTietSanPham.id
  } catch (err) {
    console.error("❌ Lỗi khi gọi API:", err)
  }
})

// Xử lý khi chọn ảnh
function handleFilesChange(event, rowIndex) {
  show.value = false
  const file = event.target.files[0]
  if (!file) return

  file.preview = URL.createObjectURL(file)
  files.value[rowIndex] = [file]
  imageUrls.value[rowIndex] = []
  event.target.value = null
}

// Thu hồi preview khi unmount
function revokePreview(file) {
  if (file?.preview) URL.revokeObjectURL(file.preview)
}

// Xóa ảnh mới chọn
function removeFile(rowIndex, fileIndex) {
  revokePreview(files.value[rowIndex][fileIndex])
  files.value[rowIndex].splice(fileIndex, 1)
}

// Xóa ảnh cũ (đã upload)
function removeUploadedImage(rowIndex, imageIndex) {
  imageUrls.value[rowIndex].splice(imageIndex, 1)
}

// Upload toàn bộ ảnh
async function uploadAllImages() {
  for (let rowIndex = 0; rowIndex < files.value.length; rowIndex++) {
    const currentFiles = files.value[rowIndex] || []
    if (!currentFiles.length) continue

    const uploadPromises = currentFiles.map(file => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', uploadPreset)

      return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })
        .then(res => res.json())
        .then(data => data.secure_url)
        .catch(err => {
          console.error(`❌ Upload lỗi với file ${file.name}:`, err)
          return null
        })
    })
   
    const urls = await Promise.all(uploadPromises)
    const newUrls = urls.filter(Boolean)

    imageUrls.value[rowIndex] = [...(imageUrls.value[rowIndex] || []), ...newUrls]

    currentFiles.forEach(file => revokePreview(file))
    files.value[rowIndex] = []
  }

  // Gộp tất cả URL ảnh
  req.value.images = imageUrls.value.flat()
  console.log(req.value);
  
  axios.post("http://localhost:8080/san-pham/update-chi-tiet-san-pham",req.value).then(Response => {
  })
}

onBeforeUnmount(() => {
  files.value.flat().forEach(file => revokePreview(file))
})
</script>
    
    <style>
    td>{
        padding-left: 20%px;
        padding-right: 10%px;
      }
    
    /* Hover: khi di chuột vào option */
    .multiselect__option--highlight {
      background-color: royalblue !important; /* vàng nhạt Bootstrap */
      color: white !important;
    }
    
    /* Khi option đã được chọn */
    .multiselect__option--selected {
      background-color: #0a2c57 !important; /* xanh nhạt Bootstrap */
      color: white !important;
      font-weight: 470;
    }
    
    /* Tag hiển thị bên trong khung khi đã chọn */
    .multiselect__tag {
      background-color: #198754 !important; /* xanh lá Bootstrap */
      color: white !important;
      border-radius: 0.25rem;
    }
    
    .multiselect__option--highlight::after {
      content: "Click để chọn" !important;
      background-color: transparent;
      color: #a0a0a0; /* Xám Bootstrap */
    }
    
    .multiselect__option--selected.multiselect__option--highlight {
      background-color: #a0a0a0 !important; /* Vàng Bootstrap */
      color: white !important;            /* Chữ đen */
    }
    
    .multiselect__option--selected.multiselect__option--highlight::after {
      background-color: #a0a0a0 !important; /* Màu xanh lá (Bootstrap) */
      color: #fff !important;
      content: "Nhấn Enter để xóa" !important;
      padding: 5px 10px;
      border-radius: 0 4px 4px 0;
      position: absolute;
      right: 0;
      top: 0;
      height: 100%;
      display: flex;
      align-items: center;
    }
    /* Nút "x" để xóa */
    .multiselect__tag-icon::after {
      color: white !important;
    }
    .image-upload-box {
      width: 100px;
      height: 100px;
      border: 2px dashed #ccc;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      transition: border-color 0.3s ease;
    }
    
    .image-upload-box:hover {
      border-color: #007bff;
    }
    
    .upload-label {
      color: #666;
      font-size: 14px;
    }
    
    .upload-label i {
      font-size: 20px;
      margin-bottom: 4px;
    }
    
    </style>
    