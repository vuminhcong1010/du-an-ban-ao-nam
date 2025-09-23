<template>
  <div class="container py-4">
    <form @submit.prevent="uploadAllImages">
      <div class="bg-white p-4 rounded shadow">
        <h5 class="fw-semibold mb-4">Thêm biến thể sản phẩm</h5>

        <div class="row">
          <!-- Cột trái - Thông tin sản phẩm -->
          <div class="col-md-8">
            <!-- Khung thông tin sản phẩm -->
            <div class="border rounded p-3 mb-3" style="background-color: #f8f9fa;">
              <h6 class="fw-semibold mb-3">Thông tin sản phẩm</h6>
              
              <!-- Nhóm 1: Tay áo, Kiểu áo, Cổ áo -->
              <div class="row">
                <!-- Tay áo -->
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bolder">Tay áo</label>
                  <v-select
                    v-model="req.idTayAo.id"
                    :options="tayAo"
                    :reduce="item => item.id"
                    label="tenTayAo"
                    placeholder="Chọn tay áo"
                    :clearable="false"
                    class="custom-vselect"
                    @search="search => handleSearch('tayAo', search)"
                  >
                    <template #no-options>
                      <div class="d-flex justify-content-between align-items-center px-2 py-1">
                        <span>Không tìm thấy tay áo</span>
                        <button type="button" class="btn btn-sm btn-outline-primary ms-2" @click="themTayAo(inputText.tayAo)">
                          + Thêm
                        </button>
                      </div>
                    </template>
                  </v-select>
                </div>

                <!-- Kiểu áo -->
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bolder">Kiểu áo</label>
                  <v-select
                    v-model="req.idKieuAo.id"
                    :options="kieuAo"
                    :reduce="item => item.id"
                    label="tenKieuAo"
                    :clearable="false"
                    placeholder="Chọn kiểu áo"
                    class="custom-vselect"
                    @search="search => handleSearch('kieuAo', search)"
                  >
                    <template #no-options>
                      <div class="d-flex justify-content-between align-items-center px-2 py-1">
                        <span>Không tìm thấy kiểu áo</span>
                        <button type="button" class="btn btn-sm btn-outline-primary ms-2" @click="themKieuAo(inputText.kieuAo)">
                          + Thêm
                        </button>
                      </div>
                    </template>
                  </v-select>
                </div>

                <!-- Cổ áo -->
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bolder">Cổ áo</label>
                  <v-select
                    v-model="req.idCoAo.id"
                    :options="coAo"
                    :reduce="item => item.id"
                    label="tenCoAo"
                    :clearable="false"
                    placeholder="Chọn cổ áo"
                    class="custom-vselect"
                    @search="search => handleSearch('coAo', search)"
                  >
                    <template #no-options>
                      <div class="d-flex justify-content-between align-items-center px-2 py-1">
                        <span>Không tìm thấy cổ áo</span>
                        <button type="button" class="btn btn-sm btn-outline-primary ms-2" @click="themCoAo(inputText.coAo)">
                          + Thêm
                        </button>
                      </div>
                    </template>
                  </v-select>
                </div>
              </div>

              <!-- Nhóm 2: Trọng lượng, Giá, Số lượng -->
              <div class="row">
                <!-- Trọng lượng -->
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bolder">Trọng lượng</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="req.trongLuong"
                    :class="{ 'is-invalid': errors.trongLuong }"
                    step="0.1"
                    />
                  <small v-if="errors.trongLuong" class="text-danger">{{ errors.trongLuong }}</small>
                </div>

                <!-- Giá -->
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bolder">Giá</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="req.gia"
                    :class="{ 'is-invalid': errors.gia }"
                  />
                  <small v-if="errors.gia" class="text-danger">{{ errors.gia }}</small>
                </div>

                <!-- Số lượng -->
                <div class="col-md-4 mb-3">
                  <label class="form-label fw-bolder">Số lượng</label>
                  <input
                    type="number"
                    class="form-control"
                    v-model="req.soLuong"
                    :class="{ 'is-invalid': errors.soLuong }"
                  />
                  <small v-if="errors.soLuong" class="text-danger">{{ errors.soLuong }}</small>
                </div>
              </div>

              <!-- Mô tả sản phẩm -->
              <div class="row mb-0">
                <div class="col-12">
                  <label class="form-label fw-bolder">Mô tả sản phẩm</label>
                  <textarea class="form-control rounded shadow-sm" v-model="req.moTa" placeholder="Nhập mô tả sản phẩm..." style="height: 195px;"></textarea>
                  <small v-if="errors.moTa" class="text-danger">{{ errors.moTa }}</small>
                </div>
              </div>
            </div>
          </div>

          <!-- Cột phải - Màu, Kích cỡ và Ảnh sản phẩm -->
          <div class="col-md-4">
            <!-- Khung màu, kích cỡ và ảnh -->
            <div class="border rounded p-3" style="background-color: #f8f9fa;">
              <!-- Nhóm: Màu, Kích cỡ -->
              <div class="row mb-3">
                <!-- Màu -->
                <div class="col-12 mb-3">
                  <label class="form-label fw-bolder">Màu</label>
                  <v-select
                    v-model="req.idMau.id"
                    :options="mau"
                    :reduce="item => item.id"
                    label="ten"
                    :clearable="false"
                    placeholder="Chọn màu"
                    class="custom-vselect"
                    @search="search => handleSearch('mau', search)"
                  >
                    <template #no-options>
                      <div class="d-flex justify-content-between align-items-center px-2 py-1">
                        <span>Không tìm thấy màu</span>
                        <button type="button" class="btn btn-sm btn-outline-primary ms-2" @click="themMau(inputText.mau)">
                          + Thêm
                        </button>
                      </div>
                    </template>
                  </v-select>
                </div>

                <!-- Kích cỡ -->
                <div class="col-12 mb-3">
                  <label class="form-label fw-bolder">Kích cỡ</label>
                  <v-select
                    v-model="req.idSize.id"
                    :options="size"
                    :reduce="item => item.id"
                    label="soCo"
                    :clearable="false"
                    placeholder="Chọn kích cỡ"
                    class="custom-vselect"
                    @search="search => handleSearch('size', search)"
                  >
                    <template #no-options>
                      <div class="d-flex justify-content-between align-items-center px-2 py-1">
                        <span>Không tìm thấy kích cỡ</span>
                        <button type="button" class="btn btn-sm btn-outline-primary ms-2" @click="themKichCo(inputText.size)">
                          + Thêm
                        </button>
                      </div>
                    </template>
                  </v-select>
                </div>
              </div>

              <!-- Ảnh sản phẩm -->
              <div class="mb-0">
                <label class="form-label fw-bolder">Ảnh sản phẩm</label>
                <div class="border rounded p-3 text-center bg-white" style="min-height: 200px;">
                  <div
                    v-if="previewUrl || existingImageUrl"
                    class="position-relative mb-3"
                  >
                    <img
                      :src="previewUrl || existingImageUrl"
                      class="img-fluid rounded"
                      style="max-height: 150px; object-fit: cover;"
                    />
                    <button
                      v-if="previewUrl"
                      @click.prevent="removeSelectedFile"
                      class="btn btn-sm btn-danger position-absolute top-0 end-0"
                      style="padding: 2px 5px;"
                    >
                      <i class="fa-solid fa-trash fa-xs"></i>
                    </button>
                    <button
                      v-else-if="existingImageUrl"
                      @click.prevent="removeExistingImage"
                      class="btn btn-sm btn-danger position-absolute top-0 end-0"
                      style="padding: 2px 5px;"
                    >
                      <i class="fa-solid fa-trash fa-xs"></i>
                    </button>
                  </div>
                  
                  <div v-else class="d-flex flex-column align-items-center justify-content-center" style="height: 150px;">
                    <div class="text-center mb-3">
                      <i class="fa-regular fa-image fa-2x text-muted mb-2"></i>
                      <p class="text-muted mb-0 small">Thả ảnh vào đây để tải lên</p>
                      <small class="text-muted">Hoặc click chọn ảnh</small>
                    </div>
                  </div>

                  <input
                    type="file"
                    id="fileInput"
                    class="d-none"
                    accept="image/*"
                    @change="handleFileChange"
                  />
                  <label
                    for="fileInput"
                    class="btn btn-outline-primary btn-sm"
                  >
                    <i class="fa fa-plus me-1"></i>
                    Chọn ảnh
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nút xác nhận -->
        <div class="text-end mt-4">
          <button type="submit" class="btn text-white px-4" style="background-color: #0a2c57;">
            Xác nhận
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
import vSelect from 'vue-select'
import 'vue-select/dist/vue-select.css';
import Swal from 'sweetalert2'
import Cookies from 'js-cookie'

const token = Cookies.get('token')
const toast = useToast();
const props = defineProps({
  idChiTietSanPham: {
    type: Number,
    required: false,
    default: null,
  }
})

// Data dropdown
let chatLieu = ref([])
let kieuAo = ref([])
let size = ref([])
let coAo = ref([])
let mau = ref([])
let tayAo = ref([])
let danhMuc = ref([])
let errors = ref({}) //
// Ảnh
const selectedFile = ref(null)
const previewUrl = ref('')
const existingImageUrl = ref('')


const inputText = ref({
  "tayAo": '',
  "kieuAo": '',
  "mau": '',
  "size": '',
  "coAo": '',
  "danhMuc": '',
  "chatLieu": ''
})

// Bắt sự kiện người dùng gõ vào input
function handleSearch(field, text) {
  inputText.value[field] = text
  console.log(`Gõ vào (${field}):`, text)
}

const call =async () => { 
  
  try {
    const response = await axios.get("http://localhost:8080/san-pham/add",{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    chatLieu.value = response.data.chatLieus
    kieuAo.value = response.data.kieuAos
    mau.value = response.data.maus
    tayAo.value = response.data.tayAos
    coAo.value = response.data.coAos
    size.value = response.data.kichCos
   
       
  } catch (err) {
    
    console.error("Lỗi khi gọi API:", err);
  }
}
const themTayAo = (tenTayAo) => {
  if (!tenTayAo || !tenTayAo.trim()) {
    toast.error("⚠️ Tên tay áo không được để trống");
    return;
  }

  const isDuplicate = tayAo.value.some(item =>
    item.tenTayAo.toLowerCase().trim() === tenTayAo.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên tay áo đã tồn tại");
    return;
  }

  let data = { tenTayAo };
  axios.post("http://localhost:8080/tay-ao/add", data,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(() => {
      toast.success("✅ Thêm tay áo thành công");
      call();
    })
    .catch(err => {
      toast.error("❌ Thêm tay áo thất bại");
      console.log(err);
    });
};

const themKieuAo = (tenKieuAo) => {
  if (!tenKieuAo || !tenKieuAo.trim()) {
    toast.error("⚠️ Tên kiểu áo không được để trống");
    return;
  }

  const isDuplicate = kieuAo.value.some(item =>
    item.tenKieuAo.toLowerCase().trim() === tenKieuAo.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên kiểu áo đã tồn tại");
    return;
  }

  let data = { tenKieuAo };
  axios.post("http://localhost:8080/kieu-ao/add", data,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(() => {
      toast.success("✅ Thêm kiểu áo thành công");
      call();
    })
    .catch(err => {
      toast.error("❌ Thêm kiểu áo thất bại");
      console.log(err);
    });
};

const themMau = (ten) => {
  if (!ten || !ten.trim()) {
    toast.error("⚠️ Tên màu không được để trống");
    return;
  }

  const isDuplicate = mau.value.some(item =>
    item.ten.toLowerCase().trim() === ten.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Màu đã tồn tại");
    return;
  }

  let data = { ten };
  axios.post("http://localhost:8080/mau/add", data,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(() => {
      toast.success("✅ Thêm màu thành công");
      call();
    })
    .catch(err => {
      toast.error("❌ Thêm màu thất bại");
      console.log(err);
    });
};

const themKichCo = (tenSize) => {
  if (!tenSize || !tenSize.trim()) {
    toast.error("⚠️ Kích cỡ không được để trống");
    return;
  }

  const isDuplicate = size.value.some(item =>
    item.soCo.toLowerCase().trim() === tenSize.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Kích cỡ đã tồn tại");
    return;
  }

  let data = { soCo: tenSize };
  axios.post("http://localhost:8080/kich-co/add", data,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(() => {
      toast.success("✅ Thêm kích cỡ thành công");
      call();
    })
    .catch(err => {
      toast.error("❌ Thêm kích cỡ thất bại");
      console.log(err);
    });
};
const themCoAo = (tenCoAo) => {
  if (!tenCoAo || !tenCoAo.trim()) {
    toast.error("⚠️ Tên cổ áo không được để trống");
    return;
  }

  const isDuplicate = coAo.value.some(item =>
    item.tenCoAo.toLowerCase().trim() === tenCoAo.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên cổ áo đã tồn tại");
    return;
  }

  let data = { tenCoAo };
  axios.post("http://localhost:8080/co-ao/add", data,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(() => {
      toast.success("✅ Thêm cổ áo thành công");
      call();
    })
    .catch(err => {
      toast.error("❌ Thêm cổ áo thất bại");
      console.log(err);
    });
};



// Cloudinary config
const cloudName = 'drwg13d1l'
const uploadPreset = 'hungdzvcl'

// Request body
let req = ref({
  idSanPham: { id: null },
  gia: null,
  trongLuong: null,
  soLuong: null,
  moTa: '',
  trangThai: 1,
  idMau: { id: null },
  idSize: { id: null },
  images: [],
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

const emit = defineEmits(['close-modal'])
function submitAndClose() {
  
  // thực hiện logic lưu ở đây (nếu có)
  emit('close-modal') // yêu cầu cha đóng modal
}

// Fetch dữ liệu khi idChiTietSanPham thay đổi
watch(() => props.idChiTietSanPham, async (newVal) => {
  if (!newVal) return
  console.log(token);
  
  try {
    const response = await axios.get(`http://localhost:8080/san-pham/find-by-id/${newVal}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    const data = response.data
    
    // Gán dropdown
    chatLieu.value = data.wrapper.chatLieus || []
    kieuAo.value = data.wrapper.kieuAos || []
    mau.value = data.wrapper.maus || []
    tayAo.value = data.wrapper.tayAos || []
    coAo.value = data.wrapper.coAos || []
    size.value = data.wrapper.kichCos || []
    danhMuc.value = data.wrapper.danhMucs || []
    req.value.idSanPham.id = newVal

    req.value.idMau.id = data.wrapper.maus[0].id
    req.value.idTayAo.id = data.wrapper.tayAos[0].id
    req.value.idKieuAo.id = data.wrapper.kieuAos[0].id
    req.value.idSize.id = data.wrapper.kichCos[0].id
    req.value.idCoAo.id = data.wrapper.coAos[0].id

    
    // Ảnh cũ
    existingImageUrl.value = ''
    previewUrl.value = ''
    selectedFile.value = null
    
  } catch (err) {
    console.error("❌ Lỗi khi fetch dữ liệu sản phẩm:", err)
  }
})
function clearForm(){
  req.value.gia = null
  req.value.soLuong = null
  req.value.trongLuong = null
  req.value.moTa = null
  
}
// Xử lý chọn file
function handleFileChange(event) {
  const file = event.target.files[0]
  if (!file) return
  // Thu hồi preview cũ
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  // Xóa ảnh cũ nếu chọn mới
  existingImageUrl.value = ''
  event.target.value = null
}

function removeSelectedFile() {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
  selectedFile.value = null
  previewUrl.value = ''
}
function removeExistingImage() {
  existingImageUrl.value = ''
}

onBeforeUnmount(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

// Upload và submit
async function uploadAllImages() {
  const result = await Swal.fire({
                    title: 'Xác nhận thêm?',
                    text: 'Bạn có chắc muốn thêm dữ liệu này không?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Thêm',
                    cancelButtonText: 'Hủy'
                });
    if (!result.isConfirmed) {
      toast.info('Hủy thao tác thêm');
      console.log('User cancelled');
      return;
    }
  // Xử lý Cloudinary
  if(validateForm() && validateImage()){
    let imageUrls = []
  if (selectedFile.value) {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('upload_preset', uploadPreset)
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      console.log('Cloudinary response', data)
      if (data.secure_url) imageUrls.push(data.secure_url)
    } catch (err) {
      console.error('❌ Lỗi upload Cloudinary:', err)
    }
  } else if (existingImageUrl.value) {
    imageUrls.push(existingImageUrl.value)
  }
  req.value.images = imageUrls
  console.log('Request body:', req.value)
  // Gửi request
  try {
     await axios.post("http://localhost:8080/san-pham/chi-tiet-san-pham/add", req.value,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
     setTimeout(() => {
  }, 1000);
    toast.success("Cập nhật thành công");
    clearForm()
    submitAndClose()
  } catch (err) {
    toast.error("Cập nhật thất bại");
  }
  }else{
    toast.error("Vui lòng kiểm tra lại thông tin");
  }
  
}
function validateImage() {
  if (!selectedFile.value && !existingImageUrl.value) {
    
    return false;
  }
  return true;
}
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
    