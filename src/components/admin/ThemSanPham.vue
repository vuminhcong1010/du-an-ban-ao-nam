
<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const search = ref("");
const selected = ref({});
const quantities = ref({});

const route = useRoute();
const maHoaDon = route.params.maHoaDon;

let listSanPham = ref([]);

const fetchTodos = async () => {
  try {
    const response = await fetch("http://localhost:8080/chi-tiet-san-pham");
    const json = await response.json();
    listSanPham.value = json;
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error);
  }
};

onMounted(() => {
  fetchTodos();
});

// thêm sản phẩm vào cthd

const emit = defineEmits(["chonSanPham"]);
const selectedItems = ref([]);
const toggleSelection = (item) => {
  const index = selectedItems.value.findIndex(
    (i) => i.maChiTietSapPham === item.maChiTietSapPham
  );

  if (index === -1) {
    selectedItems.value.push(item);
    quantities.value[item.maChiTietSapPham] = 1;
  } else {
    selectedItems.value.splice(index, 1);
    delete quantities.value[item.maChiTietSapPham];
  }
};

const apply = async () => {
  const result = selectedItems.value.map((item) => {
    const soLuongMua = quantities.value[item.maChiTietSapPham] || 1;
    const gia = item.gia;
    return {
      idSanPhamChiTiet: item.maChiTietSapPham,
      gia: item.gia,
      soLuong: soLuongMua,
      thanhTien: gia * soLuongMua,
      idHoaDon: maHoaDon,
      trangThai: 0, // hoặc trạng thái mặc định
    };
  });

  //kiểm tra dữ liệu: 
   // 👉 Kiểm tra dữ liệu gốc
  console.log("✅ Dữ liệu result gửi xuống:", result);

  const bodyUpdateSoLuong = result.map((r) => ({
    idSanPhamChiTiet: r.idSanPhamChiTiet,
    soLuongMua: r.soLuong,
  }));

  // 👉 Kiểm tra body gửi xuống API update số lượng
  console.log("📦 Body gửi update số lượng:", bodyUpdateSoLuong);

  // 1. Cập nhật tồn kho
  try {
    await fetch("http://localhost:8080/chi-tiet-san-pham/update-so-luong", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyUpdateSoLuong),
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng tồn kho:", error);
  }

  // 2. Lưu chi tiết hóa đơn
  try {
    await fetch("http://localhost:8080/hoa-don-chi-tiet/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });
  } catch (error) {
    console.error("Lỗi khi lưu hóa đơn chi tiết:", error);
  }
  emit("selected", selectedItems.value);
  emit("close");
};

</script>

<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050"
  >
    <div class="modal-dialog custom-modal modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chọn nhiều sản phẩm</h5>
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <input
            type="text"
            class="form-control mb-3"
            placeholder="Tìm kiếm theo tên, mã SKU, Barcode sản phẩm"
            v-model="search"
          />

          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ảnh</th>
                  <th>Mã</th>
                  <th>Sản phẩm</th>
                  <th>Kích thước</th>
                  <th>Màu sắc</th>
                  <th>Chất liệu</th>
                  <th>Giá</th>
                  <th>Kho</th>
                  <th>Số lượng mua</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in listSanPham" :key="index">
                  <td>{{ index }}</td>
                  <td>
                    <img
                      src="https://img.lovepik.com/free-png/20210923/lovepik-t-shirt-png-image_401190055_wh1200.png"
                      style="width: 20px; height: 20px"
                    />
                  </td>
                  <td>{{ item.maChiTietSapPham }}</td>
                  <td>{{ item.idSanPham.tenSanPham }}</td>
                  <td>{{ item.idSize.soCo }}</td>
                  <td>{{ item.idMau.ten }}</td>
                  <td>{{ item.idSanPham.idChatLieu.tenChatLieu }}</td>
                  <td>{{ item.gia }}</td>
                  <td>
                    {{
                      item.soLuong - (quantities[item.maChiTietSapPham] || 0)
                    }}
                  </td>
                  <td >
                    <input
                      type="number"
                      min="1"
                      :max="item.soLuong"
                      v-model.number="quantities[item.maChiTietSapPham]"
                      :disabled="
                        !selectedItems.some(
                          (i) => i.maChiTietSapPham === item.maChiTietSapPham
                        )
                      "
                      class="form-control form-control-sm"
                      style="width: 70px"
                    />
                  </td>
                  <td class="text-center">
                    <input
                      type="checkbox"
                      :checked="
                        selectedItems.some(
                          (i) => i.maChiTietSapPham === item.maChiTietSapPham
                        )
                      "
                      @change="toggleSelection(item)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button class="btn btn-primary" @click="apply">Áp dụng</button>

<template>
    
  <div class="container py-4">
    
  
    <form @submit.prevent="uploadAllImages()">
  
      <div class="row">
        <div class="col-md-8 mb-3">
        <div class="bg-white p-3 rounded shadow mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold b">Thông tin chung</h5>
            </div>
            <div class="row">
              
        <div class="col-md-11 mb-3">
          <label for="tenSP" class="form-label fw-bolder">Tên sản phẩm</label>
          <v-select
            v-model="req.idSanPham.id"
            :options="sanPham"
            :reduce="item => item.id"
            label="tenSanPham"
            :clearable="false"
            placeholder="Chọn sản phẩm"
            class="custom-vselect"
          >
            <!-- Nếu không có option nào -->
            <template #no-options>
              <div class="d-flex justify-content-between align-items-center px-2 py-1">
                <span>Không tìm thấy sản phẩm này</span></div>
            </template>
          </v-select>
        </div>
        <div class="col-md-1 mt-4" >
          <button type="button" class="btn mt-2" style="background-color: #0a2c57;color: white;" data-bs-toggle="modal" data-bs-target="#exampleModal"><Plus></Plus></button>
        </div>
    <div class="col-md-6 mb-3">
          <label for="tayAo" class="form-label fw-bolder mt-2">Tay áo</label>
          <!-- <select class="form-select" id="tayAo" v-model="req.chiTietSanPhamDto.idTayAo.id">
            <option :value="ds.id" v-for="ds in tayAo">
                      {{ds.tenTayAo}}
            </option>
          </select> -->
          <v-select
            v-model="req.chiTietSanPhamDto.idTayAo.id"
            :options="tayAo"
            :reduce="item => item.id"
            label="tenTayAo"
            placeholder="Chọn tay áo"
            :clearable="false"       
            class="custom-vselect"    
            @search="search => handleSearch('tayAo', search)" 
          >
            <!-- Nếu không có option nào -->
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
            
            <div class="col-md-6 mb-3">
          <label for="kieuAo" class="form-label fw-bolder mt-2">Kiểu áo</label>
          <!-- <select class="form-select" id="kieuAo" v-model="req.chiTietSanPhamDto.idKieuAo.id">
            <option :value="ds.id" v-for="ds in kieuAo">
                      {{ds.tenKieuAo}}
            </option>
          </select> -->
          <v-select
            v-model="req.chiTietSanPhamDto.idKieuAo.id"
            :options="kieuAo"
            :reduce="item => item.id"
            label="tenKieuAo"
            :clearable="false"
            placeholder="Chọn kiểu áo"
            class="custom-vselect"
            @search="search => handleSearch('kieuAo', search)" 
          >
            <!-- Nếu không có option nào -->
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
  
  
        <div class="col-md-6 mt-2">
          <label for="coAo" class="form-label fw-bolder">Cổ áo</label>
          <!-- <select class="form-select" id="coAo" v-model="req.chiTietSanPhamDto.idCoAo.id">
            <option :value="ds.id" v-for="ds in coAo">
                      {{ds.tenCoAo}}
            </option>
          </select> -->
          <v-select
            v-model="req.chiTietSanPhamDto.idCoAo.id"
            :options="coAo"
            :reduce="item => item.id"
            label="tenCoAo"
            :clearable="false"
            placeholder="Chọn cổ áo"
            class="custom-vselect"
            @search="search => handleSearch('coAo', search)" 
          >
            <!-- Nếu không có option nào -->
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
        <div class="col-md-6 mb-3 mt-2">
          <label for="trongLuong" class="form-label fw-bolder">Trọng lượng</label>
          <input type="number" class="form-control" id="trongLuong" v-model="req.chiTietSanPhamDto.trongLuong" step="0.1">
        </div>
        <div class="col-md-12 mb-3 mt-2"> 
          <label for="moTa" class="form-label fw-bolder">Mô tả sản phẩm</label>
          <textarea
            id="moTa"
            class="form-control"
            rows="3"
            v-model="req.chiTietSanPhamDto.moTa"
            placeholder="Nhập mô tả sản phẩm"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
  <div class="col-md-4 mb-3">
  <div class="bg-white p-3 rounded shadow mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold b">Thuộc tính sản phẩm</h5>
            </div>
            <div class="row">
        
        <!-- <div class="col-md-4 mb-3">
          <label for="mau" class="form-label">Kích cỡ</label>
          <select class="form-select" id="mau" v-model="req.chiTietSanPhamDto.idSize.id">
            <option :value="ds.id" v-for="ds in size">
                      {{ds.soCo}}
            </option>
          </select>
        </div> -->
        <div class="col-md-12 mb-3 mt-2">
        <label for="mau" class="form-label fw-bolder">Kích cỡ</label>
        <!-- <Multiselect
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
          </Multiselect> -->
          <v-select
            v-model="req.chiTietSanPhamDto.idSize"
            :options="size"
            @update:modelValue="dongBoMangBienThe"
            :reduce="item => item"
            label="soCo"
            :clearable="false"
            placeholder="Chọn kích cỡ"
            class="custom-vselect"
            :multiple="true"
            @search="search => handleSearch('size', search)"
            
          >
            <!-- Nếu không có option nào -->
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
      
        <div class="col-md-12 mb-3 ">
          <label for="mau" class="form-label fw-bolder mt-2">Màu</label>
        <!-- <Multiselect
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
          </Multiselect> -->
          <v-select
            v-model="req.chiTietSanPhamDto.idMau"
            :options="mau"
            :reduce="item => item"
            label="ten"
            :clearable="false"
            placeholder="Chọn màu"
            class="custom-vselect"
            :multiple="true" 
            @search="search => handleSearch('mau', search)"
            @update:modelValue="dongBoMangBienThe"
          >
            <!-- Nếu không có option nào -->
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
        </div>
      </div>
    </div>
  </div>
  
  
      <div class="bg-white p-3 rounded shadow mb-4" v-if="show">
        <div class="d-flex justify-content-between align-items-center mb-3">
    <h5 class="fw-semibold mb-0">Biến thể sản phẩm</h5>
  
    
  
    <div class="d-flex" style="gap: 0.5rem; margin-right: 1rem;">
      <input
        type="text"
        class="form-control form-control-sm"
        v-model="allGia"
        @input="apDungGiaChoTatCa"
        placeholder="áp dụng cho tất cả giá"
        style="width: 160px;"
      />
      <input
        type="text"
        class="form-control form-control-sm"
        v-model="allSoLuong"
        @input="apDungSoLuongChoTatCa"
        placeholder="áp dụng cho tất cả số lượng"
        style="width: 180px;"
      />
      <button
    type="button"
    class="btn d-flex justify-content-center align-items-center"
    style="background-color: #0a2c57; color: white; width: 130px; height: 40px;"
    @click="toggleAll"
  >
    {{ tt }}
  </button>
    </div>
  </div>
           <div v-for="(ds, index) in bienTheSP" :key="index">
            <div class="text-center fw-semibold text-dark py-2 px-3 my-2 rounded border bg-light shadow-sm mt-3"style="font-size: 1rem;">
    Các sản phẩm màu {{ dsMau[index].ten }}
  </div>
            <table class="table mb-4">
              <colgroup>
                <col style="width: 5%;"> <!-- Cột 1 -->
                <col style="width: 10%;">  <!-- Cột 2 -->
                <col style="width: 20%;">  <!-- Cột 3 -->
                <col style="width: 15%;"> <!-- Cột 4 -->
                <col style="width: 15%;">
              </colgroup>
          <thead>
            
            <tr>
              <th style="text-align: center;">#</th>
              <th style="text-align: center;">STT</th>
              <th style="text-align: center;">Tên sản phẩm</th>
              <th style="text-align: center;">Giá</th>
              <th style="text-align: center;">Số lượng</th>
              <th style="text-align: center;">Ảnh</th>
            </tr>
          </thead>
          
          <tbody>
    <tr v-for="(item, subIndex) in ds" :key="`${index}-${subIndex}`" style="text-align: center;" class="mt-5">
      <td class="text-center align-middle"><input type="checkbox"  v-model="checked[index][subIndex]"></td>
  
  
      <td class="text-center align-middle">{{ index+1 }}.{{ subIndex+1 }}</td>
      <td class="text-center align-middle">{{ item }}</td>
      
      <td class="text-center align-middle mt-2">
        <input
            type="number"
            class="form-control form-control-sm mt-4"
            v-model="req.chiTietSanPhamDto.gia[index * ds.length + subIndex]"
            :class="{ 'is-invalid': errors[index * ds.length + subIndex]?.gia }"
          />
          <div class="invalid-feedback" style="min-height: 1.3rem;" v-if="errors[index * ds.length + subIndex]?.gia">
            {{ errors[index * ds.length + subIndex].gia }}
          </div>
          <div
            v-else
            style="min-height: 1.3rem;"
          ></div>
      </td>
      <td class="text-center align-middle">
        <input
            type="number"
            class="form-control form-control-sm mt-4"
            v-model="req.chiTietSanPhamDto.soLuong[index * ds.length + subIndex]"
            :class="{ 'is-invalid': errors[index * ds.length + subIndex]?.soLuong }"
            
          />
          <div class="invalid-feedback" style="min-height: 1.3rem;" v-if="errors[index * ds.length + subIndex]?.soLuong">
            {{ errors[index * ds.length + subIndex].soLuong }}
          </div>
          <div
            v-else
            style="min-height: 1.3rem;"
          ></div>

      </td>
      
      <!-- Chỉ hiển thị ô upload ảnh ở dòng đầu của mỗi nhóm -->
      <td v-if="subIndex === 0" :rowspan="ds.length" style="text-align: center; width: 100%; padding-left: 10%;">
        <div style="display: flex; align-items: flex-start; gap: 20px; flex-wrap: wrap;">
          <div>
            <input type="file" :id="'fileInput-' + index"
                   class="custom-file-input d-none" multiple accept="image/*"
                   @change="e => handleFilesChange(e, index)" hidden />
            <label :for="'fileInput-' + index"
                   class="d-flex flex-column justify-content-center align-items-center border rounded shadow-sm p2"
                   style="width: 120%; height: 60px; cursor: pointer; background-color: #f8f9fa;">
              <i class="fa fa-plus fs-4 text-body-tertiary"></i>
              <small class="text-muted">Thêm ảnh</small>
            </label>
          </div>
          
          <div v-if="files[index]?.length" style="flex-grow: 1;" class="ms-2">
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
              <div v-for="(file, i) in files[index]" :key="file.name + file.size" style="position: relative;">
                <img :src="file.preview" style="max-width: 80px;max-height: 50px;" alt="Preview" />
                <button @click="removeFile(index, i)"
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
      </div>
  
      <div class="text-end mt-3" v-if="show">
        <button class="btn text-white px-4" style="background-color: #0a2c57;">Xác nhận</button>
      </div>
  
    </form>
      
    <!--  -->
    <!--  -->
    
    
  </div>
  
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Thêm Kích Cỡ</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="chatLieu" class="form-label fw-bolder">Tên sản phẩm</label>
            <input type="text" class="form-control" v-model="reqSanPham.tenSanPham">
  
            <label for="chatLieu" class="form-label fw-bolder">Chất liệu</label>
            <v-select
            v-model="reqSanPham.idChatLieu.id"
            :options="chatLieu"
            :reduce="item => item.id"
            label="tenChatLieu"
            :clearable="false"
            placeholder="Chọn chất liệu"
            class="custom-vselect"
            @search="search => handleSearch('chatLieu', search)" 
          >
            <!-- Nếu không có option nào -->
            <template #no-options>
              <div class="d-flex justify-content-between align-items-center px-2 py-1">
                <span>Không tìm thấy chất liệu</span>
                <button type="button" class="btn btn-sm btn-outline-primary ms-2" @click="themChatLieu(inputText.chatLieu)">
                  + Thêm
                </button>
              </div>
            </template>
          </v-select>
          <label for="danhMuc" class="form-label fw-bolder">Danh mục</label>
          <v-select
            v-model="reqSanPham.idDanhMuc.id"
            :options="danhMuc"
            :reduce="item => item.id"
            label="tenDanhMuc"
            :clearable="false"
            placeholder="Chọn danh mục"
            class="custom-vselect"
            @search="search => handleSearch('danhMuc', search)" 
          >
            <!-- Nếu không có option nào -->
            <template #no-options>
              <div class="d-flex justify-content-between align-items-center px-2 py-1">
                <span>Không tìm Chọn danh mục</span>
                <button type="button" class="btn btn-sm btn-outline-primary ms-2"  @click="themDanhMuc(inputText.danhMuc)">
                  + Thêm
                </button>
              </div>
            </template>
          </v-select>
  
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="themSP">Thêm </button>

        </div>
      </div>
    </div>
  </div>

  <h2>{{ maHoaDon }}</h2>
</template>

<style scoped>
.custom-modal {
  max-width: 80vw;
}
</style>

  
  </template>
  <script setup>
  import axios from 'axios';
  import { onMounted,ref,computed } from 'vue';
  import { onBeforeUnmount,watch,watchEffect } from 'vue';
  import 'vue-multiselect/dist/vue-multiselect.css';
  import { Check, Plus } from 'lucide-vue-next';
  import vSelect from 'vue-select'
  import 'vue-select/dist/vue-select.css';
  import { useToast } from "vue-toastification";
  import { useRouter } from 'vue-router'
  
  const router = useRouter()
  const toast = useToast();
  let kieuAo = ref()
  let size = ref([])
  let coAo = ref()
  let mau = ref([])
  let tayAo = ref()
  let danhMuc = ref()
  let sanPham = ref()
  let bienTheSP = ref()
  let chatLieu = ref()
  let dsMau = ref([])
  let errors = ref({})
  let reqSanPham = ref({
    "idChatLieu": {"id": null},
    "idDanhMuc": {"id": null},
    "tenSanPham": null
  })
  let tt = ref('Chọn tất cả')
  const checked = ref([])       // Trạng thái các checkbox con
  let checkAll = ref(false) 
  // Khi bấm "chọn tất cả" → áp dụng cho toàn bộ
  const toggleAll = () => {
    if(checkAll.value === true){
      checkAll.value = false
      tt.value ='Chọn tất cả'
    }else{
      checkAll.value = true
      tt.value ='Bỏ chọn tất cả'
    }
    
    checked.value = bienTheSP.value.map(group =>
      group.map(() => checkAll.value)
    )
  }
  
  // Khi dữ liệu đến → khởi tạo mảng checked tương ứng
  watch(bienTheSP, (val) => {
    if (Array.isArray(val) && val.length > 0) {
      dongBoMangBienThe() // ✅ Đồng bộ giá, số lượng, checked ở đây
    }
  })
  
  
  const validateForm = () => {
  errors.value = {} // reset lỗi
  let isValid = true

  const giaList = req.value.chiTietSanPhamDto.gia
  const soLuongList = req.value.chiTietSanPhamDto.soLuong

  for (let i = 0; i < giaList.length; i++) {
    const gia = giaList[i]
    const soLuong = soLuongList[i]

    // Kiểm tra lỗi giá
    if (gia === null || gia === "" || gia <= 0) {
      isValid = false
      if (!errors.value[i]) errors.value[i] = {}
      errors.value[i].gia = "Giá phải lớn hơn 0"
    }

    // Kiểm tra lỗi số lượng
    if (soLuong === null || soLuong === "" || soLuong <= 0) {
      isValid = false
      if (!errors.value[i]) errors.value[i] = {}
      errors.value[i].soLuong = "Số lượng phải lớn hơn 0"
    }
  }

  return isValid
}


  
  // Theo dõi tất cả các checkbox con → cập nhật lại checkAll
  watch(checked, (val) => {
    const allChecked =
      val.length > 0 &&
      val.every(group => group.every(v => v))
  
    checkAll.value = allChecked
  }, { deep: true })
  
  
  const themSP = async() =>{
    
    await axios.post("http://localhost:8080/san-pham/them-nhanh-san-pham",reqSanPham.value)
    setTimeout(()=>{
      reqSanPham.value.idChatLieu.id = null
      reqSanPham.value.idDanhMuc.id = null
      reqSanPham.value.tenSanPham = null
    },200)
    call()
  }
  const call =async () => {
    try {
      const response = await axios.get("http://localhost:8080/san-pham/add");
  
      chatLieu.value = response.data.chatLieus
      kieuAo.value = response.data.kieuAos
      mau.value = response.data.maus
      tayAo.value = response.data.tayAos
      coAo.value = response.data.coAos
      size.value = response.data.kichCos
      sanPham.value = response.data.sanPhams
      danhMuc.value = response.data.danhMucs   
       
      req.value.idSanPham.id = sanPham.value[0].id
      req.value.chiTietSanPhamDto.idTayAo.id = tayAo.value[0].id
      req.value.chiTietSanPhamDto.idKieuAo.id = kieuAo.value[0].id
      req.value.chiTietSanPhamDto.idCoAo.id = coAo.value[0].id
       reqSanPham.value.idDanhMuc.id = danhMuc.value[0].id
       reqSanPham.value.idChatLieu.id = chatLieu.value[0].id
    } catch (err) {
    }
  }
  onMounted(()=>{
    call()
  });
  
  let req = ref({
    "idSanPham": {"id": null},
    "tenSanPham": "",
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
  
  
  // Giá trị chung để áp dụng
  const allGia = ref(null)
  const allSoLuong = ref(null)
  
  
  // Hàm đồng bộ lại mảng giá và số lượng khi thay đổi màu/size
  const dongBoMangBienThe = () => {
    const idMau = req.value.chiTietSanPhamDto.idMau || []
    const idSize = req.value.chiTietSanPhamDto.idSize || []
    const soLuongBienTheMoi = idMau.length * idSize.length
    if (soLuongBienTheMoi === 0) return
  
    // ===== Đồng bộ giá =====
    const giaHienTai = [...req.value.chiTietSanPhamDto.gia]
    if (giaHienTai.length !== soLuongBienTheMoi) {
      const newGia = new Array(soLuongBienTheMoi)
      for (let i = 0; i < soLuongBienTheMoi; i++) {
        newGia[i] = i < giaHienTai.length ? giaHienTai[i] : allGia.value || 0
      }
      req.value.chiTietSanPhamDto.gia = newGia
    }
  
    // ===== Đồng bộ số lượng =====
    const soLuongHienTai = [...req.value.chiTietSanPhamDto.soLuong]
    if (soLuongHienTai.length !== soLuongBienTheMoi) {
      const newSoLuong = new Array(soLuongBienTheMoi)
      for (let i = 0; i < soLuongBienTheMoi; i++) {
        newSoLuong[i] = i < soLuongHienTai.length ? soLuongHienTai[i] : allSoLuong.value || 0
      }
      req.value.chiTietSanPhamDto.soLuong = newSoLuong
    }
  
    // ===== Đồng bộ checked (nếu cần) =====
    if (!Array.isArray(bienTheSP.value)) return
    const rowLengths = bienTheSP.value.map(row => row.length)
    const flatChecked = checked.value.flat()
    const newCheckedFlat = new Array(soLuongBienTheMoi).fill(false)
  
    for (let i = 0; i < soLuongBienTheMoi; i++) {
      newCheckedFlat[i] = i < flatChecked.length ? flatChecked[i] : false
    }
  
    let index = 0
    checked.value = rowLengths.map(len => {
      const group = newCheckedFlat.slice(index, index + len)
      index += len
      return group
    })
  }
  
  // Hàm áp dụng giá chung cho tất cả các biến thể
  const apDungGiaChoTatCa = () => {
    if (allGia.value === null || allGia.value === undefined) {
  
      return
    }
  
  
  
    // Gộp checked từ mảng lồng → mảng phẳng
    const flatChecked = checked.value.flat()
  
    // Áp dụng giá chỉ với các phần tử đã được chọn
    req.value.chiTietSanPhamDto.gia = req.value.chiTietSanPhamDto.gia.map((giaCu, index) => {
      return flatChecked[index] ? allGia.value : giaCu
    })
  }
  // Hàm áp dụng số lượng chung cho tất cả các biến thể
  const apDungSoLuongChoTatCa = () => {
    if (allSoLuong.value === null || allSoLuong.value === undefined) {
  
      return
    }
  
  
  
    const flatChecked = checked.value.flat()
    req.value.chiTietSanPhamDto.soLuong = req.value.chiTietSanPhamDto.soLuong.map((slCu, index) => {
      return flatChecked[index] ? allSoLuong.value : slCu
    })
  }
  // Chuỗi người dùng đang gõ
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
  
  const themTayAo = (tenTayAo) =>{  
    let data = {
      "tenTayAo": tenTayAo
    }  
      axios.post("http://localhost:8080/tay-ao/add",data).then(Response =>{
        call()
      }).catch (err =>{
  
      })    
  }
  const themKieuAo = (tenKieuAo) =>{  
    let data = {
      "tenKieuAo": tenKieuAo
    }  
      axios.post("http://localhost:8080/kieu-ao/add",data).then(Response =>{
        call()
      }).catch (err =>{
      })    
  }
  const themMau = (ten) =>{  
    let data = {
      "ten": ten
    }  
      axios.post("http://localhost:8080/mau/add",data).then(Response =>{
        call()
      }).catch (err =>{
         console.log(err);
      })    
  }
  const themKichCo = (tenSize) =>{  
    let data = {
      "soCo": tenSize
    }  
      axios.post("http://localhost:8080/kich-co/add",data).then(Response =>{
        call()
      }).catch (err =>{
         console.log(err);
      })    
  }
  const themCoAo = (tenCoAo) =>{  
    let data = {
      "tenCoAo": tenCoAo
    }  
      axios.post("http://localhost:8080/co-ao/add",data).then(Response =>{
        call()
      }).catch (err =>{
         console.log(err);
      })    
  }
  
  const themDanhMuc = (tenDanhMuc) =>{  
    let data = {
      "tenDanhMuc": tenDanhMuc
    }  
      axios.post("http://localhost:8080/danh-muc/add",data).then(Response =>{
        call()
      }).catch (err =>{
         console.log(err);
      })    
  }
  const themChatLieu = (tenChatLieu) =>{  
    let data = {
      "tenChatLieu": tenChatLieu
    }  
      axios.post("http://localhost:8080/chat-lieu/add",data).then(Response =>{
        call()
      }).catch (err =>{
         console.log(err);
      })    
  }
  const show = computed(() => {
    const result = !!(
      req.value.idSanPham.id &&
      req.value.chiTietSanPhamDto.idTayAo.id &&
      req.value.chiTietSanPhamDto.idKieuAo.id &&
      req.value.chiTietSanPhamDto.idMau.length>0 &&
      req.value.chiTietSanPhamDto.idSize.length>0 &&
      req.value.chiTietSanPhamDto.idCoAo.id &&
      req.value.chiTietSanPhamDto.moTa &&
      req.value.chiTietSanPhamDto.trongLuong
    )
    console.log("show =", result);  
    console.log(req.value);
    
    return result;
  })
  
  
  watchEffect(() => {
    if (
      show.value &&
      req.value.idSanPham.id &&
      req.value.chiTietSanPhamDto?.idMau?.length &&
      req.value.chiTietSanPhamDto?.idSize?.length &&
      req.value.chiTietSanPhamDto.idCoAo.id &&
      req.value.chiTietSanPhamDto.idTayAo.id &&
      req.value.chiTietSanPhamDto.idKieuAo.id &&
      req.value.chiTietSanPhamDto.moTa &&
      req.value.chiTietSanPhamDto.trongLuong
    ) {
  
      console.log(req.value);
      
      axios.post("http://localhost:8080/san-pham/chi-tiet-san-pham", req.value)
        .then(response => {
          bienTheSP.value = response.data;
          dsMau.value = req.value.chiTietSanPhamDto.idMau
          console.log(dsMau.value);
          
        })
        .catch(error => {
          console.error("Gửi thất bại:", error);
        });
  
      // Ngắt trigger sau khi gọi API xong (tránh lặp vô hạn nếu show vẫn true)
      show.value = false;
    }
  });
  
  // Danh sách sản phẩm (được fetch từ backend)
  
  
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
  
    // Upload theo từng nhóm biến thể
    for (let groupIndex = 0; groupIndex < bienTheSP.value.length; groupIndex++) {
      const currentFiles = files.value[groupIndex] || []
      if (!currentFiles.length) continue
  
      const uploadPromises = currentFiles.map(file => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', uploadPreset)
  
        return fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        })
          .then(res => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            return res.json()
          })
          .then(data => data.secure_url)
          .catch(err => {
            console.error(`❌ Lỗi khi upload file ${file.name}:`, err)
            return null
          })
      })
  
      const urls = await Promise.all(uploadPromises)
      const validUrls = urls.filter(Boolean)
      
      // Ảnh của nhóm này sẽ áp dụng cho tất cả sản phẩm trong nhóm
      const groupSize = bienTheSP.value[groupIndex].length
      for (let i = 0; i < groupSize; i++) {
        allUploadedUrls.push(...validUrls)
      }
  
      // Cleanup
      currentFiles.forEach(file => revokePreview(file))
      files.value[groupIndex] = []
    }
  
    req.value.chiTietSanPhamDto.images = allUploadedUrls.map(url => String(url))
    console.log('✅ Upload hoàn tất:', allUploadedUrls)
    try {
      if(validateForm()){
       await axios.post("http://localhost:8080/san-pham/add", req.value)
       toast.success("Thêm thành công");
       router.push('/san-pham')
      }else{
        toast.error("Vui lòng điền đầy đủ thông tin");
      }
    } catch (err) {
      toast.error("Cập nhật thất bại");
      console.log(err)
    }
    
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
    border-color: royalblue;
  }
  
  .upload-label {
    color: white;
    font-size: 14px;
    background-color: gray;
  }
  
  .upload-label i {
    font-size: 20px;
    margin-bottom: 4px;
  }
  .custom-vselect {
    min-height: 38px;
    padding: 0;
    border-radius: 0.375rem;
    background-color: white;
    font-size: 1rem;
  }
  
  .custom-vselect .vs__dropdown-toggle {
    border: 1px solid #ced4da;
    
    border-radius: 0.375rem;
    min-height: 38px;
    background-color: white;
  }
  
  .custom-vselect .vs__selected {
    color: #b7bdc4;
  
  }
  
  .custom-vselect .vs__clear,
  .custom-vselect .vs__open-indicator {
    color: #b8bcc0;
  }
  
  .custom-vselect .vs__dropdown-menu {
    border-radius: 0.375rem;
    box-shadow: 0 0.25rem 0.5rem rgba(0,0,0,0.1);
  }
  
  
  
  .custom-vselect .vs__dropdown-toggle {
    background-color: white; /* màu nền */
    color: #333; /* màu chữ */
  }
  
  .custom-vselect .vs__selected {
    color: black; /* màu chữ option đã chọn */
  }
  
  .custom-vselect .vs__dropdown-menu {
    background-color: #fff;
    color: #000;
  }
  
  .custom-vselect .vs__dropdown-option--highlight {
    background-color: #0a2c57;
    color: white;
  }
  .custom-vselect .vs__dropdown-option--selected {
    background-color: gray !important; /* Màu xanh dương sáng */
    color: white !important;              /* Màu chữ đen */
  }
  .custom-vselect .vs__dropdown-option {
    margin-bottom: 3px; /* tạo khoảng cách dưới */
    border-radius: 3px; /* nếu cần bo góc cho đẹp */
    padding: 3px 3px;
  }
  
  </style>
  

