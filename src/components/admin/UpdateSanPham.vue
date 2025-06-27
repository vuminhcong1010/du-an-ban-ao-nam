<template>
  <div class="container py-4">
    <form @submit.prevent="uploadAllImages">
      <div class="bg-white p-4 rounded shadow">
        <h5 class="fw-semibold mb-4">Chi tiết biến thể sản phẩm</h5>

        <div class="row">
          <!-- Cột trái - Thông tin sản phẩm -->
          <div class="col-md-7">
            <div class="border rounded p-3 mb-3" style="background-color: #f8f9fa;">
              <h6 class="fw-semibold mb-3">Thông tin sản phẩm</h6>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Tay áo</label>
                  <select class="form-select" v-model="req.idTayAo.id">
                    <option :value="ds.id" v-for="ds in tayAo" :key="ds.id">{{ ds.tenTayAo }}</option>
                  </select>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Kiểu áo</label>
                  <select class="form-select" v-model="req.idKieuAo.id">
                    <option :value="ds.id" v-for="ds in kieuAo" :key="ds.id">{{ ds.tenKieuAo }}</option>
                  </select>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Cổ áo</label>
                  <select class="form-select" v-model="req.idCoAo.id">
                    <option :value="ds.id" v-for="ds in coAo" :key="ds.id">{{ ds.tenCoAo }}</option>
                  </select>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Trọng lượng</label>
                  <input type="text" step="0.1" class="form-control" v-model="req.trongLuong" :class="{ 'is-invalid': errors.trongLuong }" />
                  <small v-if="errors.trongLuong" class="text-danger">{{ errors.trongLuong }}</small>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Giá</label>
                  <input type="text" class="form-control" v-model="req.gia" :class="{ 'is-invalid': errors.gia }" />
                  <small v-if="errors.gia" class="text-danger">{{ errors.gia }}</small>
                </div>

                <div class="col-md-4 mb-3">
                  <label class="form-label fw-semibold">Số lượng</label>
                  <input type="number" class="form-control" v-model="req.soLuong" :class="{ 'is-invalid': errors.soLuong }" />
                  <small v-if="errors.soLuong" class="text-danger">{{ errors.soLuong }}</small>
                </div>
              </div>

              <div class="mb-0">
                <label class="form-label fw-semibold">Mô tả sản phẩm</label>
                <textarea class="form-control rounded shadow-sm" v-model="req.moTa" placeholder="Nhập mô tả sản phẩm..." style="height: 227px;"></textarea>
              </div>
            </div>
          </div>

          <!-- Cột phải - Màu, Size, QR và Ảnh -->
          <div class="col-md-5">
            <div class="border rounded p-3" style="background-color: #f8f9fa;">
              <div class="mb-3">
                <label class="form-label fw-semibold">Màu</label>
                <select class="form-select" v-model="req.idMau.id">
                  <option :value="ds.id" v-for="ds in mau" :key="ds.id">{{ ds.ten }}</option>
                </select>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Kích cỡ</label>
                <select class="form-select" v-model="req.idSize.id">
                  <option :value="ds.id" v-for="ds in size" :key="ds.id">{{ ds.soCo }}</option>
                </select>
              </div>

              <!-- QR và Ảnh cạnh nhau -->
              <div class="d-flex justify-content-between align-items-start gap-3">
                <!-- QR -->
                <div class="text-center mb-3" style="width: 180px;">
                  <div class="mb-3">
                  <label class="form-label fw-semibold d-block mb-2">Mã QR</label>
                  <div style="width: 180px; height: 180px; margin: auto;" class="mb-1">
                    <canvas ref="qrCanvas" style="width: 100%; height: 100%;"></canvas>
                  </div>
                  </div> 
                  <button type="button" @click="taiQR" class="btn btn-primary btn-sm ">Tải mã QR</button>
                               
                </div>
                

                <!-- Ảnh -->
                <div class="text-center" style="width: 190px;">
                  <label class="form-label fw-semibold d-block mb-2">Ảnh sản phẩm</label>
                  <div class="position-relative bg-white" style="width: 190px; height: 190px; margin: auto;">
                    <input
                      type="file"
                      :id="'fileInput-0'"
                      class="d-none"
                      accept="image/*"
                      @change="event => handleFilesChange(event, 0)"
                    />

                    <div v-if="!((files[0] && files[0][0]) || (imageUrls[0] && imageUrls[0][0])) && show"
                         class="d-flex align-items-center justify-content-center w-100 h-100">
                      <img :src="image" alt="Preview" class="rounded" style="width: 190px; height: 190px; margin: auto;">
                    </div>

                    <div v-if="(files[0] && files[0][0]) || (imageUrls[0] && imageUrls[0][0])">
                      <img
                        :src="files[0]?.[0]?.preview || imageUrls[0]?.[0]"
                        class="rounded"
                        style="width: 190px; height: 190px; margin: auto;"
                        v-if="!show"
                      />

                      <button
                        v-if="files[0]?.[0]"
                        @click="removeFile(0, 0)"
                        class="btn btn-sm btn-danger position-absolute"
                        style="top: 5px; right: 5px;"
                      >
                        <i class="fa-solid fa-trash fa-xs"></i>
                      </button>
                      <button
                        v-else
                        @click="removeUploadedImage(0, 0)"
                        class="btn btn-sm btn-danger position-absolute"
                        style="top: 5px; right: 5px;"
                      >
                        <i class="fa-solid fa-trash fa-xs"></i>
                      </button>
                    </div>
                  </div>

                  <label :for="'fileInput-0'" class="btn btn-sm btn-primary mt-2">
                    <i class="fa fa-plus me-1"></i> Chọn ảnh
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nút xác nhận -->
        <div class="text-end mt-4">
          <button class="btn text-white px-4 py-2" style="background-color: #0a2c57;">
            <i class="fa fa-check me-1"></i> Xác nhận
          </button>
        </div>
      </div>
    </form>
  </div>
</template>


<script setup>
import { useToast } from "vue-toastification";
import axios from 'axios'
import { ref, watch, onBeforeUnmount } from 'vue'
import { defineEmits } from 'vue'
import QRCode from 'qrcode'

const toast = useToast();
const props = defineProps({
  idChiTietSanPham: {
    type: Number,
    default: null,
    required: true
  }
})

const qrCanvas = ref(null)
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
let errors = ref({}) //
const emit = defineEmits(['close-modal'])
function submitAndClose() {
  
  // thực hiện logic lưu ở đây (nếu có)
  emit('close-modal') // yêu cầu cha đóng modal
}

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

const validateForm = () => {
  const newErrors = {}

  if (!req.value.idSanPham.id) newErrors.idSanPham = 'Vui lòng chọn sản phẩm'

  // Kiểm tra giá
  if (req.value.gia === null || req.value.gia === '' || isNaN(req.value.gia)) {
    newErrors.gia = 'Giá phải là số hợp lệ'
  } else if (req.value.gia <= 0) {
    newErrors.gia = 'Giá phải lớn hơn 0'
  }

  // Kiểm tra trọng lượng
  if (req.value.trongLuong === null || req.value.trongLuong === '' || isNaN(req.value.trongLuong)) {
    newErrors.trongLuong = 'Trọng lượng phải là số'
  } else if (req.value.trongLuong <= 0) {
    newErrors.trongLuong = 'Trọng lượng phải lớn hơn 0'
  }

  // Kiểm tra số lượng
  if (req.value.soLuong === null || req.value.soLuong === '' || isNaN(req.value.soLuong)) {
    newErrors.soLuong = 'Số lượng phải là số'
  } else if (req.value.soLuong <= 0) {
    newErrors.soLuong = 'Số lượng phải lớn hơn 0'
  }

  // Mô tả
  if (!req.value.moTa || !req.value.moTa.trim()) {
    newErrors.moTa = 'Mô tả không được để trống'
  }

  // // Các trường bắt buộc khác
  // if (!req.value.idMau.id) newErrors.idMau = 'Vui lòng chọn màu'
  // if (!req.value.idSize.id) newErrors.idSize = 'Vui lòng chọn size'
  // if (!req.value.idCoAo.id) newErrors.idCoAo = 'Vui lòng chọn cổ áo'
  // if (!req.value.idTayAo.id) newErrors.idTayAo = 'Vui lòng chọn tay áo'
  // if (!req.value.idKieuAo.id) newErrors.idKieuAo = 'Vui lòng chọn kiểu áo'

  errors.value = newErrors
  return Object.keys(newErrors).length === 0
}

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
    taoQR(req.value.maChiTietSapPham)
  } catch (err) {
    console.error("❌ Lỗi khi gọi API:", err)
  }
})
// Hàm tạo QR
const taoQR = async (ma) => {
  if (!qrCanvas.value) return

  try {
    await QRCode.toCanvas(qrCanvas.value, ma, {
      width: 200,
      color: {
        dark: '#000',
        light: '#fff'
      }
    })
  } catch (err) {
    console.error('Lỗi tạo mã QR:', err)
  }
}

// Hàm tải QR về máy
const taiQR = () => {
  if (!qrCanvas.value) return

  const link = document.createElement('a')
  link.href = qrCanvas.value.toDataURL('image/png')
  link.download = `${req.value.maChiTietSapPham}.png`
  link.click()
}

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
  show.value = true
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
  try {
    if(validateForm()){
         await axios.post("http://localhost:8080/san-pham/update-chi-tiet-san-pham",req.value)
     setTimeout(() => {
  }, 500);
    toast.success("Cập nhật thành công");
    submitAndClose()
    }else{
      toast.error("Vui lòng điền đầy đủ thông tin ");
    }
  } catch (err) {
    toast.error("Cập nhật thất bại");
    console.error('❌ Lỗi gửi API:', err)
  }
  
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
    