<template>
    
<div class="container py-4">
  

  <form @submit.prevent="log">

      <div class="bg-white p-3 rounded shadow mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-semibold b">Thêm sản phẩm</h5>
          </div>
          <div class="row">
      <div class="col-md-12 mb-3">
        <label for="tenSP" class="form-label fw-bolder">Tên sản phẩm</label>
        <input type="text" class="form-control" id="tenSP" v-model="req.tenSanPham">
      </div>

      <div class="col-md-4 mb-3 mt-2">
        <label for="chatLieu" class="form-label fw-bolder">Chất liệu</label>
        <select class="form-select" id="chatLieu" v-model="req.idChatLieu.id">
          <option :value="ds.id" v-for="ds in chatLieu">
                    {{ds.tenChatLieu}}
          </option>
        </select>
      </div>

      <div class="col-md-4 mb-3">
        <label for="tayAo" class="form-label fw-bolder mt-2">Tay áo</label>
        <select class="form-select" id="tayAo" v-model="req.chiTietSanPhamDto.idTayAo.id">
          <option :value="ds.id" v-for="ds in tayAo">
                    {{ds.tenTayAo}}
          </option>
        </select>
      </div>
          
          <div class="col-md-4 mb-3">
        <label for="kieuAo" class="form-label fw-bolder mt-2">Kiểu áo</label>
        <select class="form-select" id="kieuAo" v-model="req.chiTietSanPhamDto.idKieuAo.id">
          <option :value="ds.id" v-for="ds in kieuAo">
                    {{ds.tenKieuAo}}
          </option>
        </select>
      </div>
<!-- 
      <div class="col-md-4 mb-3">
        <label for="mau" class="form-label">Màu</label>
        <select class="form-select" id="mau" v-model="req.chiTietSanPhamDto.idMau.id">
          <option :value="ds.id" v-for="ds in mau">
                    {{ds.ten}}
          </option>
        </select>
      </div> -->

      <div class="col-md-4 mb-3">
      <label for="mau" class="form-label fw-bolder mt-2">Màu</label>
      <Multiselect
          v-model="req.chiTietSanPhamDto.idMau"
          :options="mau"
          :multiple="true"
          :close-on-select="false"
          :clear-on-select="false"
          :preserve-search="true"
          placeholder="Chọn màu"
          label="ten"
          track-by="id"
          class="multiselect-bootstrap "
        >
          <template #selection="{ values, search, isOpen }">
            <span class="multiselect__single text-muted" v-if="values.length" v-show="!isOpen">
              {{ values.length }} màu cỡ được chọn
            </span>
          </template>
        </Multiselect>
      </div>
      <!-- <div class="col-md-4 mb-3">
        <label for="mau" class="form-label">Kích cỡ</label>
        <select class="form-select" id="mau" v-model="req.chiTietSanPhamDto.idSize.id">
          <option :value="ds.id" v-for="ds in size">
                    {{ds.soCo}}
          </option>
        </select>
      </div> -->
      <div class="col-md-4 mb-3 mt-2">
      <label for="mau" class="form-label fw-bolder">Kích cỡ</label>
      <Multiselect
          v-model="req.chiTietSanPhamDto.idSize"
          :options="size"
          :multiple="true"
          :close-on-select="false"
          :clear-on-select="false"
          :preserve-search="true"
          placeholder="Chọn kích cỡ"
          label="soCo"
          track-by="id"
          class="multiselect-bootstrap form-label fw-bolder"
        >
          <template #selection="{ values, search, isOpen }">
            <span class="multiselect__single text-muted" v-if="values.length" v-show="!isOpen">
              {{ values.length }} kích cỡ được chọn
            </span>
          </template>
        </Multiselect>
      </div>

      <div class="col-md-4 mb-3 mt-2">
        <label for="coAo" class="form-label fw-bolder">Cổ áo</label>
        <select class="form-select" id="coAo" v-model="req.chiTietSanPhamDto.idCoAo.id">
          <option :value="ds.id" v-for="ds in coAo">
                    {{ds.tenCoAo}}
          </option>
        </select>
      </div>
      <div class="col-md-12 mb-3 mt-2">
        <label for="coAo" class="form-label fw-bolder">Danh Muc</label>
        <select class="form-select" id="coAo" v-model="req.chiTietSanPhamDto.idDanhMuc.id">
          <option :value="ds.id" v-for="ds in danhMuc">
                    {{ds.tenDanhMuc}}
          </option>
        </select>
      </div>
      <div class="col-md-12 mb-3 mt-2">
        <label for="trongLuong" class="form-label fw-bolder">Trọng lượng</label>
        <input type="text" class="form-control" id="trongLuong" v-model="req.chiTietSanPhamDto.trongLuong">
      </div>
      <div class="col-md-12 mb-3 mt-2"> 
        <label for="trongLuong" class="form-label fw-bolder">Mô tả</label>
        <input type="text" class="form-control" v-model="req.chiTietSanPhamDto.moTa">
      </div>
    </div>
    </div>
      


    <div class="bg-white p-3 rounded shadow mb-4" v-if="show">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-semibold">Chi tiết sản phẩm</h5>
          </div>
          
          <table class="table">
            <colgroup>
              <col style="width: 5%; height: 5%;">
              <col style="width: 30%;"> <!-- Cột 1 -->
              <col style="width: 15%;">  <!-- Cột 2 -->
              <col style="width: 15%;">  <!-- Cột 3 -->
              <col style="width: 10%;"> <!-- Cột 4 -->

            </colgroup>
        <thead>
          <tr>
            <th style="text-align: center;">STT</th>
            <th style="text-align: center;">Tên sản phẩm</th>
            <th style="text-align: center;">Giá</th>
            <th style="text-align: center;">Số lượng</th>
            <th style="text-align: center;">Ảnh</th>
          </tr>
        </thead>
        <tbody v-for="(ds, index) in bienTheSP" :key="index">
          <tr style="text-align: center;">
            <td class="text-center align-middle">{{ index+1 }}</td>
            <td class="text-center align-middle">{{ ds }}</td>
            <td class="text-center align-middle">
              <input type="text" class="form-control form-control-sm" id="maChiTietSapPham"  v-model="req.chiTietSanPhamDto.gia[index]">
            </td>
            
            <td class="text-center align-middle">
              <input type="text" class="form-control form-control-sm" id="soLuong" v-model="req.chiTietSanPhamDto.soLuong[index]">
            </td>
            <td style="text-align: center; width: 100%; padding-left: 10%;">
            
              <div style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
              <div>
                <input
                  type="file"
                  :id="'fileInput-' + index"
                  class="custom-file-input d-none"
                  multiple
                  accept="image/*"
                  @change="e => handleFilesChange(e, index)"
                  hidden
                />
                <label :for="'fileInput-' + index" class="upload-label">
                  <i class="fa fa-plus"></i>
                  <div>Ảnh</div>
                </label>
              </div>

              <!-- Preview ảnh đã chọn -->
              <div v-if="files[index]?.length" style="flex-grow: 1;">
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                  <div v-for="(file, i) in files[index]" :key="file.name + file.size" style="position: relative;">
                    <img :src="file.preview" style="max-width: 80px;max-height: 50px;" alt="Preview" />
                    <button
                      @click="removeFile(index, i)"
                      style="position: absolute; top: 2px; right: 2px; background: red; color: white; border: none; max-width: 25px;">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
        </td>
          </tr>
        </tbody>
      </table>

    </div>

    <div class="text-end mt-3" v-if="show">
      <button class="btn text-white px-4" style="background-color: #0a2c57;" @click="uploadAllImages">Xác nhận</button>
    </div>
  </form>
  <!--  -->
  <!--  -->
  
  
</div>
</template>
<script setup>
import axios from 'axios';
import { onMounted,ref,computed } from 'vue';
import { onBeforeUnmount,watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
let chatLieu = ref()
let kieuAo = ref()
let size = ref([])
let coAo = ref()
let mau = ref([])
let tayAo = ref()
let danhMuc = ref()

let bienTheSP = ref()

let req = ref({
  "maSanPham": "",
  "tenSanPham": "",
  "idChatLieu": {
    "id": null
  },
  "chiTietSanPhamDto": 
    {
      "idSanPham": {"id": null},
      "maChiTietSapPham": "",
      "gia": [],
      "trongLuong": null,
      "soLuong": [],
      "moTa": "",
      "ngayTao": "",
      "trangThai": 1,
      "idMau": [],
      "idSize": [],
      "images": [],
      "idDanhMuc": {
        "id": null
      },
      "idCoAo": { "id": null },
      "idTayAo": { "id": null },
      "idKieuAo": { "id": null }
    }
})
onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8080/san-pham/add");
    chatLieu.value = response.data.chatLieus
    kieuAo.value = response.data.kieuAos
    mau.value = response.data.maus
    tayAo.value = response.data.tayAos
    coAo.value = response.data.coAos
    size.value = response.data.kichCos
    danhMuc.value = response.data.danhMucs
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
});

const show = computed(() => {
  const result = !!(
    req.value.tenSanPham &&
    req.value.idChatLieu.id &&
    req.value.chiTietSanPhamDto.idTayAo.id &&
    req.value.chiTietSanPhamDto.idKieuAo.id &&
    req.value.chiTietSanPhamDto.idMau.length>0 &&
    req.value.chiTietSanPhamDto.idSize.length>0 &&
    req.value.chiTietSanPhamDto.idCoAo.id
  )
  console.log("show =", result);  
  return result;
})


watchEffect(() => {
  if (
    show.value &&
    req.value.tenSanPham &&
    req.value.chiTietSanPhamDto?.idMau?.length &&
    req.value.chiTietSanPhamDto?.idSize?.length
  ) {

    
    axios.post("http://localhost:8080/san-pham/chi-tiet-san-pham", req.value)
      .then(response => {
        bienTheSP.value = response.data;
      })
      .catch(error => {
        console.error("Gửi thất bại:", error);
      });

    // Ngắt trigger sau khi gọi API xong (tránh lặp vô hạn nếu show vẫn true)
    show.value = false;
  }
});

const log = () =>{
  console.log(req.value);
  axios.post("http://localhost:8080/san-pham/add",req.value).then(Response => {
  })
}




// Danh sách files và URL theo từng dòng
const files = ref([])       // files[rowIndex] = [file1, file2, ...]
const imageUrls = ref([])   // imageUrls[rowIndex] = [url1, url2, ...]

// Cấu hình Cloudinary
const cloudName = 'drwg13d1l'         // ← Thay bằng tên cloud của bạn
const uploadPreset = 'hungdzvcl'   // ← Thay bằng upload preset

// Xử lý khi chọn file
function handleFilesChange(event, rowIndex) {
  const selectedFiles = Array.from(event.target.files).map(file => {
    file.preview = URL.createObjectURL(file)
    return file
  })

  if (!files.value[rowIndex]) files.value[rowIndex] = []
  files.value[rowIndex] = [...files.value[rowIndex], ...selectedFiles]

  event.target.value = null
}

// Thu hồi preview URL
function revokePreview(file) {
  if (file.preview) {
    URL.revokeObjectURL(file.preview)
  }
}

// Xóa một ảnh đã chọn
function removeFile(rowIndex, fileIndex) {
  const file = files.value[rowIndex][fileIndex]
  revokePreview(file)
  files.value[rowIndex].splice(fileIndex, 1)
}

// Upload ảnh lên Cloudinary theo dòng
async function uploadImages(rowIndex) {
  const currentFiles = files.value[rowIndex] || []

  if (!currentFiles.length) {
    alert('Vui lòng chọn ít nhất 1 ảnh')
    return
  }
  

  imageUrls.value[rowIndex] = []

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
        console.error(`❌ Lỗi khi upload file ${file.name}:`, err)
        return null
      })
  })

  const urls = await Promise.all(uploadPromises)
  imageUrls.value[rowIndex] = urls.filter(Boolean)

  currentFiles.forEach(file => revokePreview(file))
  files.value[rowIndex] = []
}
async function uploadAllImages() {
  let allUploadedUrls = []

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
          console.error(`❌ Lỗi khi upload file ${file.name}:`, err)
          return null
        })
    })

    const urls = await Promise.all(uploadPromises)
    const validUrls = urls.filter(Boolean)
    allUploadedUrls.push(...validUrls)

    // Cleanup
    currentFiles.forEach(file => revokePreview(file))
    files.value[rowIndex] = []
  }

  // ✅ Gán vào DTO: 1 mảng duy nhất
  req.value.chiTietSanPhamDto.images = allUploadedUrls.map(url => String(url))
  console.log('✅ Upload hoàn tất:', allUploadedUrls)
}
// Cleanup khi unmount
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
