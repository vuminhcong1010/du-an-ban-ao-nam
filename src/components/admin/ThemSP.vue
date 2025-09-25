<template>
  <div class=" full-width-container">
    <div class="header-section">
      <button @click="goBack" class="back-button">
        <i class="fa-solid fa-arrow-left"></i> Quay lại
      </button>
      <h2 class="page-title-aligned">Thêm sản phẩm mới</h2>
    </div>
    
    <form @submit.prevent="uploadAllImages()">
      <div class="row">
        <div class="col-md-8 mb-3">
          <div class="bg-white p-3 rounded shadow mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold">Thông tin chung</h5>
            </div>
            <div class="row">
              <div class="col-md-11 mb-3">
                <label for="tenSP" class="form-label fw-bolder"
                  >Tên sản phẩm</label
                >
                <v-select
                  v-model="req.idSanPham.id"
                  :options="sanPham"
                  :reduce="(item) => item.id"
                  label="tenSanPham"
                  :clearable="false"
                  placeholder="Chọn sản phẩm"
                  class="custom-vselect"
                >
                  <template #no-options>
                    <div
                      class="d-flex justify-content-between align-items-center px-2 py-1"
                    >
                      <span>Không tìm thấy sản phẩm này</span>
                    </div>
                  </template>
                </v-select>
              </div>
              <div class="col-md-1 mt-4">
                <button
                  type="button"
                  class="btn mt-2"
                  style="background-color: #0a2c57; color: white"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal"
                >
                  <Plus />
                </button>
              </div>
              <div class="col-md-6 mb-3">
                <label for="tayAo" class="form-label fw-bolder mt-2"
                  >Tay áo</label
                >
                <v-select
                  v-model="req.idTayAo.id"
                  :options="tayAo"
                  :reduce="(item) => item.id"
                  label="tenTayAo"
                  :clearable="false"
                  placeholder="Chọn tay áo"
                  class="custom-vselect"
                  @search="(search) => handleSearch('tayAo', search)"
                >
                  <template #no-options>
                    <div
                      class="d-flex justify-content-between align-items-center px-2 py-1"
                    >
                      <span>Không tìm thấy tay áo</span>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary ms-2"
                        @click="themTayAo(inputText.tayAo)"
                      >
                        + Thêm
                      </button>
                    </div>
                  </template>
                </v-select>
              </div>
              <div class="col-md-6 mb-3">
                <label for="kieuAo" class="form-label fw-bolder mt-2"
                  >Kiểu áo</label
                >
                <v-select
                  v-model="req.idKieuAo.id"
                  :options="kieuAo"
                  :reduce="(item) => item.id"
                  label="tenKieuAo"
                  :clearable="false"
                  placeholder="Chọn kiểu áo"
                  class="custom-vselect"
                  @search="(search) => handleSearch('kieuAo', search)"
                >
                  <template #no-options>
                    <div
                      class="d-flex justify-content-between align-items-center px-2 py-1"
                    >
                      <span>Không tìm thấy kiểu áo</span>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary ms-2"
                        @click="themKieuAo(inputText.kieuAo)"
                      >
                        + Thêm
                      </button>
                    </div>
                  </template>
                </v-select>
              </div>
              <div class="col-md-6 mt-2">
                <label for="coAo" class="form-label fw-bolder">Cổ áo</label>
                <v-select
                  v-model="req.idCoAo.id"
                  :options="coAo"
                  :reduce="(item) => item.id"
                  label="tenCoAo"
                  :clearable="false"
                  placeholder="Chọn cổ áo"
                  class="custom-vselect"
                  @search="(search) => handleSearch('coAo', search)"
                >
                  <template #no-options>
                    <div
                      class="d-flex justify-content-between align-items-center px-2 py-1"
                    >
                      <span>Không tìm thấy cổ áo</span>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary ms-2"
                        @click="themCoAo(inputText.coAo)"
                      >
                        + Thêm
                      </button>
                    </div>
                  </template>
                </v-select>
              </div>
              <div class="col-md-6 mb-3 mt-2">
                <label for="trongLuong" class="form-label fw-bolder"
                  >Trọng lượng(Kg)</label
                >
                <input
                  type="number"
                  class="form-control"
                  id="trongLuong"
                  v-model="req.trongLuong"
                  step="0.1"
                />
              </div>
              <div class="col-md-12 mb-3 mt-2">
                <label for="moTa" class="form-label fw-bolder"
                  >Mô tả sản phẩm</label
                >
                <textarea
                  id="moTa"
                  class="form-control"
                  rows="3"
                  v-model="req.moTa"
                  placeholder="Nhập mô tả sản phẩm"
                ></textarea>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4 mb-3">
          <div class="bg-white p-3 rounded shadow mb-4">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="fw-semibold">Thuộc tính sản phẩm</h5>
            </div>
            <div class="row">
              <div class="col-md-12 mb-3 mt-2">
                <label for="size" class="form-label fw-bolder">Kích cỡ</label>
                <v-select
                  v-model="tempSize"
                  :options="size"
                  @update:modelValue="updateSizes"
                  :reduce="(item) => item"
                  label="soCo"
                  :clearable="false"
                  placeholder="Chọn kích cỡ"
                  class="custom-vselect"
                  :multiple="true"
                  @search="(search) => handleSearch('size', search)"
                >
                  <template #no-options>
                    <div
                      class="d-flex justify-content-between align-items-center px-2 py-1"
                    >
                      <span>Không tìm thấy kích cỡ</span>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary ms-2"
                        @click="themKichCo(inputText.size)"
                      >
                        + Thêm
                      </button>
                    </div>
                  </template>
                </v-select>
              </div>
              <div class="col-md-12 mb-3">
                <label for="mau" class="form-label fw-bolder mt-2">Màu</label>
                <v-select
                  v-model="tempMau"
                  :options="mau"
                  :reduce="(item) => item"
                  label="ten"
                  :clearable="false"
                  placeholder="Chọn màu"
                  class="custom-vselect"
                  :multiple="true"
                  @search="(search) => handleSearch('mau', search)"
                  @update:modelValue="updateMau"
                >
                  <template #no-options>
                    <div
                      class="d-flex justify-content-between align-items-center px-2 py-1"
                    >
                      <span>Không tìm thấy màu</span>
                      <button
                        type="button"
                        class="btn btn-sm btn-outline-primary ms-2"
                        @click="themMau(inputText.mau)"
                      >
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
        <div class="d-flex justify-content-between align-items-center mb-3 ">
          <h5 class="fw-semibold mb-0">Biến thể sản phẩm</h5>
          <div class="d-flex" style="gap: 0.5rem; margin-right: 1rem">
            <div class="form-group mb-2 me-3">
          <lable class="form-label small fw-bold">Giá:</lable>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="giaAllFormatted"
              @focus="onFocusAllGia"
              @blur="updateAllGia"
              placeholder="Áp dụng cho tất cả giá"
              style="width: 160px"
            />
          </div>

          <div class="form-group mb-2 me-3">
            <lable class="form-label small fw-bold ">Số lượng:</lable>
            <input
              type="text"
              class="form-control form-control-sm"
              v-model="allSoLuong"
              @input="apDungSoLuongChoTatCa"
              placeholder="Áp dụng cho tất cả số lượng"
              style="width: 160px"
            />
          </div>
            <button
              type="button"
              class="btn d-flex justify-content-center align-items-center mt-4"
              style="
                background-color: #0a2c57;
                color: white;
                width: 130px;
                height: 30px;
              "
              @click="toggleAll"
            >
              {{ tt }}
            </button>
          </div>
        </div>
        <div v-for="(group, mauId) in groupedByMau" :key="mauId">
          <div
            class="text-center fw-semibold text-dark py-2 px-3 my-2 rounded border bg-light shadow-sm mt-3"
            style="font-size: 1rem"
          >
            Các sản phẩm màu {{ mau.find((m) => m.id == mauId)?.ten || "N/A" }}
          </div>

          <table class="table mb-4">
            <colgroup>
              <col style="width: 5%" />
              <col style="width: 10%" />
              <col style="width: 20%" />
              <col style="width: 15%" />
              <col style="width: 15%" />
              <col style="width: 5%" />
              <col style="width: 30%" />
            </colgroup>
            <thead>
              <tr>
                <th class="text-center">#</th>
                <th class="text-center">STT</th>
                <th class="text-center">Sản phẩm</th>
                <th class="text-center">Giá</th>
                <th class="text-center">Số lượng</th>
                <th class="text-center">Action</th>
                <th class="text-center">Ảnh</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in group" :key="item.index">
                <td class="text-center align-middle">
                  <input type="checkbox" v-model="checked[item.index]" />
                </td>
                <td class="text-center align-middle">{{ idx + 1 }}</td>
                <td class="text-center align-middle">
                  {{
                    `${tenSP} [ ${mau.find((m) => m.id == mauId)?.ten}-${
                      size.find((s) => s.id === item.idSize)?.soCo || "N/A"
                    } ]`
                  }}
                </td>

                <td class="text-center align-middle ">
                  <input
                  type="text"
                  class="form-control form-control-sm mt-3"
                  v-model="giaFormatted[item.index]"
                  :class="{ 'is-invalid': errors[item.index]?.gia }"
                  @focus="onFocusGia(item.index)"
                  @blur="updateGia(item.index)"
                  placeholder="Nhập giá"
                />
                  <div
                    class="invalid-feedback"
                    style="min-height: 1.3rem"
                    v-if="errors[item.index]?.gia"
                  >
                    {{ errors[item.index].gia }}
                  </div>
                  <div v-else style="min-height: 1.3rem"></div>
                </td>

                <td class="text-center align-middle">
                  <input
                    type="number"
                    class="form-control form-control-sm mt-3"
                    v-model="req.chiTietSanPhamDto[item.index].soLuong"
                    :class="{'is-invalid': errors[item.index]?.soLuong}"
                  />
                  <div
                    class="invalid-feedback"
                    style="min-height: 1.3rem"
                    v-if="errors[item.index]?.soLuong"
                  >
                    {{ errors[item.index].soLuong }}
                  </div>
                  <div v-else style="min-height: 1.3rem"></div>
                </td>

                <td class="text-center align-middle">
                  <i
                    class="fa-solid fa-trash"
                    @click="deleteBienThe(item.index)"
                  ></i>
                </td>
                <!-- Ảnh: chỉ hiển thị ở hàng đầu tiên của nhóm màu -->
                <td
                  v-if="idx === 0"
                  :rowspan="group.length"
                  class="text-center align-middle"
                  style="padding-left: 10%"
                >
                  <div
                    style="
                      display: flex;
                      align-items: flex-start;
                      gap: 20px;
                      flex-wrap: wrap;
                    "
                  >
                    <div>
                      <input
                        type="file"
                        :id="'fileInput-' + mauId"
                        class="custom-file-input d-none"
                        multiple
                        accept="image/*"
                        @change="(e) => handleFilesChange(e, mauId)"
                        hidden
                      />
                      <label
                        :for="'fileInput-' + mauId"
                        class="d-flex flex-column justify-content-center align-items-center border rounded shadow-sm p-2"
                        style="
                          width: 120px;
                          height: 60px;
                          cursor: pointer;
                          background-color: #f8f9fa;
                        "
                      >
                        <i class="fa fa-plus fs-4 text-body-tertiary"></i>
                        <small class="text-muted">Thêm ảnh</small>
                      </label>
                    </div>

                    <div
                      v-if="files[mauId]?.length"
                      style="flex-grow: 1"
                      class="ms-2"
                    >
                      <div style="display: flex; gap: 10px; flex-wrap: wrap">
                        <div
                          v-for="(file, i) in files[mauId]"
                          :key="file.name + file.size"
                          style="position: relative"
                        >
                          <img
                            :src="file.preview"
                            style="max-width: 80px; max-height: 50px"
                            alt="Preview"
                          />
                          <button
                            @click="removeFile(mauId, i)"
                            style="
                              position: absolute;
                              top: 2px;
                              right: 2px;
                              background: red;
                              color: white;
                              border: none;
                              max-width: 25px;
                            "
                          >
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
        <button
          type="submit"
          class="btn text-white px-4"
          style="background-color: #0a2c57"
        >
          Xác nhận
        </button>
      </div>
    </form>
  </div>

  <!-- Modal -->
  <div
    class="modal fade"
    id="exampleModal"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Thêm Sản Phẩm</h1>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="modal"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="tenSanPham" class="form-label fw-bolder"
              >Tên sản phẩm</label
            >
            <input
              type="text"
              class="form-control"
              id="tenSanPham"
              v-model="reqSanPham.tenSanPham"
            />
            <label for="chatLieu" class="form-label fw-bolder mt-3"
              >Chất liệu</label
            >
            <v-select
              v-model="reqSanPham.idChatLieu.id"
              :options="chatLieu"
              :reduce="(item) => item.id"
              label="tenChatLieu"
              :clearable="false"
              placeholder="Chọn chất liệu"
              class="custom-vselect"
              @search="(search) => handleSearch('chatLieu', search)"
            >
              <template #no-options>
                <div
                  class="d-flex justify-content-between align-items-center px-2 py-1"
                >
                  <span>Không tìm thấy chất liệu</span>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary ms-2"
                    @click="themChatLieu(inputText.chatLieu)"
                  >
                    + Thêm
                  </button>
                </div>
              </template>
            </v-select>
            <label for="danhMuc" class="form-label fw-bolder mt-3"
              >Danh mục</label
            >
            <v-select
              v-model="reqSanPham.idDanhMuc.id"
              :options="danhMuc"
              :reduce="(item) => item.id"
              label="tenDanhMuc"
              :clearable="false"
              placeholder="Chọn danh mục"
              class="custom-vselect"
              @search="(search) => handleSearch('danhMuc', search)"
            >
              <template #no-options>
                <div
                  class="d-flex justify-content-between align-items-center px-2 py-1"
                >
                  <span>Không tìm thấy danh mục</span>
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-primary ms-2"
                    @click="themDanhMuc(inputText.danhMuc)"
                  >
                    + Thêm
                  </button>
                </div>
              </template>
            </v-select>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            data-bs-dismiss="modal"
          >
            Đóng
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            @click="themSP"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from "axios";
import {
  onMounted,
  ref,
  computed,
  watch,
  watchEffect,
  onBeforeUnmount,
} from "vue";
import "vue-select/dist/vue-select.css";
import vSelect from "vue-select";
import {Plus} from "lucide-vue-next";
import {useToast} from "vue-toastification";
import {useRouter} from "vue-router";
import Swal from 'sweetalert2'
import Cookies from 'js-cookie'


let isLoading = ref(false); // Vue 3: setup script
const token = Cookies.get('token')
const router = useRouter();
const toast = useToast();

const kieuAo = ref([]);
const size = ref([]);
const coAo = ref([]);
const mau = ref([]);
const tayAo = ref([]);
const danhMuc = ref([]);
const sanPham = ref([]);
const bienTheSP = ref([]);
const chatLieu = ref([]);
const dsMau = ref([]);
const errors = ref({});
const reqSanPham = ref({
  idChatLieu: {id: null},
  idDanhMuc: {id: null},
  tenSanPham: null,
});
const tt = ref("Chọn tất cả");
const checked = ref([]);
const checkAll = ref(false);
const allGia = ref(null);
const allSoLuong = ref(null);
const tempMau = ref([]);
const tempSize = ref([]);
const variantData = ref([]);
let tenSP = ref();
const inputText = ref({
  tayAo: "",
  kieuAo: "",
  mau: "",
  size: "",
  coAo: "",
  danhMuc: "",
  chatLieu: "",
});

// Initialize req as specified
const req = ref({
  idSanPham: {id: null},
  tenSanPham: "",
  trongLuong: null,
  moTa: "",
  idCoAo: {id: null},
  idTayAo: {id: null},
  idKieuAo: {id: null},
  chiTietSanPhamDto: [
    {
      gia: null,
      soLuong: null,
      trangThai: 1,
      idMau: {id: null},
      idSize: {id: null},
      images: [],
    },
  ],
});
const groupedByMau = computed(() => {
  const groups = {};
  req.value.chiTietSanPhamDto.forEach((item, index) => {
    const mauId = item.idMau;
    if (!groups[mauId]) {
      groups[mauId] = [];
    }
    groups[mauId].push({...item, index});
  });
  return groups;
});

// Toggle all checkboxes
const toggleAll = () => {
  const newCheck = !checkAll.value;
  checkAll.value = newCheck;
  tt.value = newCheck ? "Bỏ chọn tất cả" : "Chọn tất cả";
  checked.value = Array(req.value.chiTietSanPhamDto.length).fill(newCheck);
};

// Update idMau
const updateMau = (newMau) => {
  tempMau.value = newMau;
  dongBoMangBienThe();
};

// Update idSize
const updateSizes = (newSizes) => {
  tempSize.value = newSizes;
  dongBoMangBienThe();
};
function deleteBienThe(index) {
  req.value.chiTietSanPhamDto.splice(index, 1);
  variantData.value.splice(index, 1); // nếu bạn dùng cả variantData
  checked.value.splice(index, 1); // nếu bạn dùng checked
}

// --- Navigation ---
  const goBack = () => {
  router.push('/san-pham');
  };

// Synchronize variant arrays
const dongBoMangBienThe = () => {
  const idMau = tempMau.value || [];
  const idSize = tempSize.value || [];
  const soLuongBienTheMoi = idMau.length * idSize.length;

  if (soLuongBienTheMoi === 0) {
    variantData.value = [];
    req.value.chiTietSanPhamDto = [];
    checked.value = [];
    return;
  }

  const newVariantData = [];
  const newChiTietSanPhamDto = [];
  const oldData = req.value.chiTietSanPhamDto;
  const oldChecked = checked.value;

  let index = 0;
  for (const mau of idMau) {
    for (const size of idSize) {
      const old = oldData[index] || {};
      const gia = variantData.value[index]?.gia || allGia.value || 0;
      const soLuong =
        variantData.value[index]?.soLuong || allSoLuong.value || 0;

      newVariantData.push({
        idMau: mau,
        idSize: size,
        gia,
        soLuong,
      });

      newChiTietSanPhamDto.push({
        gia,
        soLuong,
        trangThai: 1,
        idMau: mau.id,
        idSize: size.id,
        images: old.images || [],
      });

      index++;
    }
  }

  variantData.value = newVariantData;
  req.value.chiTietSanPhamDto = newChiTietSanPhamDto;

  // Cập nhật checked: nếu đã có thì giữ, nếu chưa thì false
  const newChecked = [];
  for (let i = 0; i < soLuongBienTheMoi; i++) {
    newChecked[i] = oldChecked[i] ?? false;
  }
  checked.value = newChecked;
};

// Watch bienTheSP to sync arrays
watch(bienTheSP, (val) => {
  if (Array.isArray(val) && val.length > 0) {
    dongBoMangBienThe();
  }
});

watch(
  checked,
  (val) => {
    const allChecked = val.length > 0 && val.every((v) => v === true);
    checkAll.value = allChecked;
  },
  {deep: true}
);

function validateForm() {
  let isValid = true;
  errors.value = {}; // reset

  // Validate trường thông tin chung
  if (!req.value.idSanPham?.id) {
    isValid = false;
    alert("Vui lòng chọn sản phẩm.");
  }
  if (!req.value.idTayAo?.id) {
    isValid = false;
    alert("Vui lòng chọn tay áo.");
  }
  if (!req.value.idKieuAo?.id) {
    isValid = false;
    alert("Vui lòng chọn kiểu áo.");
  }
  if (!req.value.idCoAo?.id) {
    isValid = false;
    alert("Vui lòng chọn cổ áo.");
  }
  if (!req.value.trongLuong || req.value.trongLuong <= 0) {
    isValid = false;
    alert("Trọng lượng không hợp lệ.");
  }
  if (!req.value.moTa || req.value.moTa.trim() === "") {
    isValid = false;
    alert("Vui lòng nhập mô tả sản phẩm.");
  }

  // Validate biến thể sản phẩm
  req.value.chiTietSanPhamDto.forEach((ct, index) => {
    if (!errors.value[index]) errors.value[index] = {};

    if (!ct.gia || ct.gia <= 0) {
      errors.value[index].gia = "Giá không hợp lệ.";
      isValid = false;
    }
    if (!ct.soLuong || ct.soLuong <= 0) {
      errors.value[index].soLuong = "Số lượng không hợp lệ.";
      isValid = false;
    }
  });

  return isValid;
}

// Apply allGia to selected variants
const apDungGiaChoTatCa = () => {
  if (allGia.value === null || allGia.value === undefined) return;
  const checkedArray = checked.value;

  req.value.chiTietSanPhamDto = req.value.chiTietSanPhamDto.map(
    (variant, index) => ({
      ...variant,
      gia: checkedArray[index] ? allGia.value : variant.gia,
    })
  );
};

// Apply allSoLuong to selected variants
const apDungSoLuongChoTatCa = () => {
  if (allSoLuong.value === null || allSoLuong.value === undefined) return;
  const checkedArray = checked.value;

  req.value.chiTietSanPhamDto = req.value.chiTietSanPhamDto.map(
    (variant, index) => ({
      ...variant,
      soLuong: checkedArray[index] ? allSoLuong.value : variant.soLuong,
    })
  );
};

// Handle search input
const handleSearch = (field, text) => {
  inputText.value[field] = text;
};

// API calls for adding attributes
const themTayAo = async (tenTayAo) => {
  if (!tenTayAo || !tenTayAo.trim()) {
    toast.error("⚠️ Tên tay áo không được để trống");
    return;
  }

  const isDuplicate = tayAo.value.some(
    (item) =>
      item.tenTayAo.toLowerCase().trim() === tenTayAo.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên tay áo đã tồn tại");
    return;
  }

  try {
    await axios.post("http://localhost:8080/tay-ao/add", {tenTayAo},{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    await call();
    toast.success("✅ Thêm tay áo thành công");
  } catch (err) {
    toast.error("❌ Thêm tay áo thất bại");
    console.error(token);
  }
};

const themKieuAo = async (tenKieuAo) => {
  if (!tenKieuAo || !tenKieuAo.trim()) {
    toast.error("⚠️ Tên kiểu áo không được để trống");
    return;
  }

  const isDuplicate = kieuAo.value.some(
    (item) =>
      item.tenKieuAo.toLowerCase().trim() === tenKieuAo.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên kiểu áo đã tồn tại");
    return;
  }

  try {
    await axios.post("http://localhost:8080/kieu-ao/add", {tenKieuAo},{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    await call();
    toast.success("✅ Thêm kiểu áo thành công");
  } catch (err) {
    toast.error("❌ Thêm kiểu áo thất bại");
    console.error(err);
  }
};
const mauSacCoSan = ['đỏ', 'đỏ đậm', 'đỏ tươi', 'đỏ cam', 'hồng', 'hồng đậm', 'hồng phấn', 'tím', 'tím nhạt', 'tím huế', 'xanh', 'xanh dương', 'xanh da trời', 'xanh navy', 'xanh lá', 'xanh lá nhạt', 'xanh rêu', 'xanh ngọc', 'xanh lục bảo', 'xanh pastel', 'vàng', 'vàng nghệ', 'vàng nhạt', 'cam', 'cam đất', 'nâu', 'nâu nhạt', 'nâu đất', 'đen', 'xám', 'xám nhạt', 'trắng', 'be', 'kem', 'bạc', 'vàng đồng', 'xanh mint', 'xanh lam', 'xanh teal', 'hồng đất', 'hồng đào', 'đỏ rượu', 'đỏ đô', 'tím than', 'tím oải hương', 'xanh coban', 'xanh ngọc bích', 'nâu socola', 'cam san hô', 'xanh olive', 'vàng chanh']


const themMau = async (ten) => {
  if (!ten || !ten.trim()) {
    toast.error("⚠️ Tên màu không được để trống");
    return;
  }

  const isDuplicate = mau.value.some(
    (item) => item.ten.toLowerCase().trim() === ten.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Màu đã tồn tại");
    return;
  }
  if (!mauSacCoSan.some(mau => mau.toLowerCase() === ten.toLowerCase())) {
    toast.error("Màu sắc không hợp lệ");
    return;
  }

  try {
    await axios.post("http://localhost:8080/mau/add", {ten},{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    await call();
    toast.success("✅ Thêm màu thành công");
  } catch (err) {
    toast.error("❌ Thêm màu thất bại");
    console.error(err);
  }
};
const kichCoCoSan = ['S', 'M', 'L', 'XL', 'XXL','XXXL']; // Thêm các kích cỡ hợp lệ tại đây
const themKichCo = async (soCo) => {
  
  if (!soCo || !soCo.trim()) {
    toast.error("⚠️ Kích cỡ không được để trống");
    return;
  }

  const isDuplicate = size.value.some(
    (item) => item.soCo.toLowerCase().trim() === soCo.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Kích cỡ đã tồn tại");
    return;
  }
  if (!kichCoCoSan.includes(soCo)) {
    toast.error("Kích cỡ không hợp lệ"); // hoặc hiển thị thông báo bằng toast
    return;
  }
  try {
    await axios.post("http://localhost:8080/kich-co/add", {soCo},{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    await call();
    toast.success("✅ Thêm kích cỡ thành công");
  } catch (err) {
    toast.error("❌ Thêm kích cỡ thất bại");
    console.error(err);
  }
};

const themCoAo = async (tenCoAo) => {
  if (!tenCoAo || !tenCoAo.trim()) {
    toast.error("⚠️ Tên cổ áo không được để trống");
    return;
  }

  const isDuplicate = coAo.value.some(
    (item) => item.tenCoAo.toLowerCase().trim() === tenCoAo.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên cổ áo đã tồn tại");
    return;
  }

  try {
    await axios.post("http://localhost:8080/co-ao/add", {tenCoAo},{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    await call();
    toast.success("✅ Thêm cổ áo thành công");
  } catch (err) {
    toast.error("❌ Thêm cổ áo thất bại");
    console.error(err);
  }
};

const themDanhMuc = async (tenDanhMuc) => {
  if (!tenDanhMuc || !tenDanhMuc.trim()) {
    toast.error("⚠️ Tên danh mục không được để trống");
    return;
  }

  const isDuplicate = danhMuc.value.some(
    (item) =>
      item.tenDanhMuc.toLowerCase().trim() === tenDanhMuc.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên danh mục đã tồn tại");
    return;
  }

  try {
    await axios.post("http://localhost:8080/danh-muc/add", {tenDanhMuc},{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    await call();
    toast.success("✅ Thêm danh mục thành công");
  } catch (err) {
    toast.error("❌ Thêm danh mục thất bại");
    console.error(err);
  }
};

const themChatLieu = async (tenChatLieu) => {
  if (!tenChatLieu || !tenChatLieu.trim()) {
    toast.error("⚠️ Tên chất liệu không được để trống");
    return;
  }

  const isDuplicate = chatLieu.value.some(
    (item) =>
      item.tenChatLieu.toLowerCase().trim() === tenChatLieu.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên chất liệu đã tồn tại");
    return;
  }

  try {
    await axios.post("http://localhost:8080/chat-lieu/add", {tenChatLieu},{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    await call();
    toast.success("✅ Thêm chất liệu thành công");
  } catch (err) {
    toast.error("❌ Thêm chất liệu thất bại");
    console.error(err);
  }
};

const themSP = async () => {
  const {tenSanPham, idChatLieu, idDanhMuc} = reqSanPham.value;

  if (!tenSanPham || !tenSanPham.trim()) {
    toast.error("⚠️ Tên sản phẩm không được để trống");
    return;
  }

  if (!idChatLieu?.id) {
    toast.error("⚠️ Vui lòng chọn chất liệu");
    return;
  }

  if (!idDanhMuc?.id) {
    toast.error("⚠️ Vui lòng chọn danh mục");
    return;
  }

  const isDuplicate = sanPham.value.some(
    (sp) =>
      sp.tenSanPham.toLowerCase().trim() === tenSanPham.toLowerCase().trim()
  );
  if (isDuplicate) {
    toast.error("⚠️ Tên sản phẩm đã tồn tại");
    return;
  }

  try {
    await axios.post(
      "http://localhost:8080/san-pham/them-nhanh-san-pham",
      reqSanPham.value
    ,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

    // Reset form
    reqSanPham.value = {
      tenSanPham: null,
      idChatLieu: {id: null},
      idDanhMuc: {id: null},
    };

    await call();
    toast.success("✅ Thêm sản phẩm thành công");
  } catch (err) {
    toast.error("❌ Thêm sản phẩm thất bại");
    console.error(err);
  }
};

// Fetch initial data
const call = async () => {
  try {
    const response = await axios.get("http://localhost:8080/san-pham/add",{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    chatLieu.value = response.data.chatLieus || [];
    kieuAo.value = response.data.kieuAos || [];
    mau.value = response.data.maus || [];
    tayAo.value = response.data.tayAos || [];
    coAo.value = response.data.coAos || [];
    size.value = response.data.kichCos || [];
    sanPham.value = response.data.sanPhams || [];
    danhMuc.value = response.data.danhMucs || [];

    if (sanPham.value.length) req.value.idSanPham.id = sanPham.value[0].id;
    if (tayAo.value.length) req.value.idTayAo.id = tayAo.value[0].id;
    if (kieuAo.value.length) req.value.idKieuAo.id = kieuAo.value[0].id;
    if (coAo.value.length) req.value.idCoAo.id = coAo.value[0].id;
    if (danhMuc.value.length)
      reqSanPham.value.idDanhMuc.id = danhMuc.value[0].id;
    if (chatLieu.value.length)
      reqSanPham.value.idChatLieu.id = chatLieu.value[0].id;
  } catch (err) {
    console.error(err);
    console.log(token);
    
  }
};

onMounted(() => call());

// Computed to show variant table
const show = computed(() => {
  return !!(
    req.value.idSanPham.id &&
    req.value.idTayAo.id &&
    req.value.idKieuAo.id &&
    tempMau.value.length > 0 &&
    tempSize.value.length > 0 &&
    req.value.idCoAo.id &&
    req.value.moTa &&
    req.value.trongLuong
  );
});

// Watch for variant table generation
watchEffect(() => {
  if (show.value) {
    let id = req.value.idSanPham.id;
    axios
      .get(`http://localhost:8080/san-pham/chi-tiet-san-pham/${id}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
      .then((response) => {
        req.value.tenSanPham = response.data;
        tenSP.value = response.data;
        console.log(req.value);
      })
      .catch((error) => {
        console.error("Gửi thất bại:", error);
      });
  }
});

// Image handling
const files = ref([]);
const cloudName = "drwg13d1l";
const uploadPreset = "hungdzvcl";

// const handleFilesChange = (event, rowIndex) => {
//   const selectedFiles = Array.from(event.target.files).map((file) => {
//     file.preview = URL.createObjectURL(file);
//     return file;
//   });
//   if (!files.value[rowIndex]) files.value[rowIndex] = [];
//   files.value[rowIndex] = [...files.value[rowIndex], ...selectedFiles];
//   event.target.value = null;
// };
const handleFilesChange = (event, rowIndex) => {
  const selectedFile = event.target.files[0];
  if (!selectedFile) return;

  selectedFile.preview = URL.createObjectURL(selectedFile);

  // Gán trực tiếp 1 ảnh duy nhất cho rowIndex
  files.value[rowIndex] = [selectedFile];

  // Reset input để chọn lại được cùng 1 ảnh nếu cần
  event.target.value = null;
};

const revokePreview = (file) => {
  if (file.preview) URL.revokeObjectURL(file.preview);
};

const removeFile = (rowIndex, fileIndex) => {
  const file = files.value[rowIndex][fileIndex];
  revokePreview(file);
  files.value[rowIndex].splice(fileIndex, 1);
};

const uploadAllImages = async () => {
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
  if (validateForm()) {
    let allUploadedUrls = {};
    
    for (const mauId in groupedByMau.value) {
      const currentFiles = files.value[mauId] || [];

      // Không có ảnh
      if (!currentFiles.length) {
        toast.error(
          `❌ Vui lòng thêm ít nhất 1 ảnh cho màu "${
            mau.value.find((m) => m.id == mauId)?.ten || "không xác định"
          }"`
        );
        return;
      }

      // Validate từng ảnh
      for (const file of currentFiles) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
          toast.error(
            `❌ Ảnh "${file.name}" của màu "${
              mau.value.find((m) => m.id == mauId)?.ten
            }" không hợp lệ (chỉ chấp nhận jpg, png, webp)`
          );
          return;
        }

        if (file.size > 5 * 1024 * 1024) {
          toast.error(
            `❌ Ảnh "${file.name}" của màu "${
              mau.value.find((m) => m.id == mauId)?.ten
            }" vượt quá 5MB`
          );
          return;
        }
      }
    }
  // Hiện loading
  isLoading.value = true;
  Swal.fire({
    title: 'Đang thêm sản phẩm ...',
    html: 'Vui lòng đợi trong giây lát',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });

    // Duyệt qua từng nhóm màu (mauId là key trong files)
    for (const mauId in files.value) {
      const currentFiles = files.value[mauId] || [];
      if (!currentFiles.length) continue;

      // Upload từng ảnh
      const uploadPromises = currentFiles.map((file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);
        return fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        )
          .then((res) => {
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            return res.json();
          })
          .then((data) => data.secure_url)
          .catch((err) => {
            console.error(`❌ Lỗi khi upload file ${file.name}:`, err);
            return null;
          });
      });

      const urls = await Promise.all(uploadPromises);
      const validUrls = urls.filter(Boolean);
      allUploadedUrls[mauId] = validUrls;

      // Gán ảnh vào các biến thể có idMau tương ứng
      req.value.chiTietSanPhamDto.forEach((variant) => {
        if (String(variant.idMau) === String(mauId)) {
          variant.images = validUrls;
        }
      });

      currentFiles.forEach((file) => revokePreview(file));
      files.value[mauId] = [];
    }
      isLoading.value = false;
    Swal.close();
    try {
      const payload = {
        ...req.value,
        chiTietSanPhamDto: req.value.chiTietSanPhamDto.map((variant) => ({
          ...variant,
          idMau: {id: variant.idMau},
          idSize: {id: variant.idSize},
        })),
      };

      await axios.post("http://localhost:8080/san-pham/add", payload,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

      toast.success("Thêm thành công");
      router.push("/san-pham");
    } catch (err) {
      toast.error("Cập nhật thất bại");
      console.error(err);
    }
  } else {
    toast.error("Vui lòng kiểm tra lại thông tin");
  }
};
// Mảng formatted strings cho mỗi biến thể
const giaFormatted = ref([]);
// Optional: áp dụng cho tất cả giá cùng lúc
const giaFormattedAll = ref('');

const giaAllFormatted = ref("");

watch(allGia, (val) => {
  giaAllFormatted.value = formatGia(val);
});



// Bỏ định dạng

// Khi focus vào input, bỏ định dạng để dễ sửa
const onFocusAllGia = () => {
  giaAllFormatted.value = allGia.value?.toString() || "";
};

// Khi blur khỏi input, parse lại số và áp dụng
const updateAllGia = () => {
  const parsed = parseGia(giaAllFormatted.value);
  allGia.value = parsed;
  giaAllFormatted.value = formatGia(parsed);
  apDungGiaChoTatCa();
};
// Hàm định dạng số -> chuỗi có dấu chấm
function formatGia(gia) {
  if (gia === null || gia === undefined) return '';
  return gia.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Hàm parse chuỗi '1.000.000' -> number
function parseGia(text) {
  if (!text) return null;
  const n = parseInt(text.replace(/\./g, ''), 10);
  return isNaN(n) ? null : n;
}

// Đồng bộ ban đầu & khi req.chiTietSanPhamDto thay đổi
watch(
  () => req.value.chiTietSanPhamDto,
  (newList) => {
    giaFormatted.value = newList.map(item => formatGia(item.gia));
  },
  { immediate: true, deep: true }
);

// Khi input focus: hiện giá gốc không format
function onFocusGia(index) {
  const g = req.value.chiTietSanPhamDto[index]?.gia;
  giaFormatted.value[index] = g != null ? g.toString() : '';
}

// Khi blur: parse, gán lại vào req và format lại
function updateGia(index) {
  const text = giaFormatted.value[index];
  const val = parseGia(text);
  // gán nếu tồn tại
  if (req.value.chiTietSanPhamDto[index]) {
    req.value.chiTietSanPhamDto[index].gia = val;
    giaFormatted.value[index] = formatGia(val);
  }
}

// Áp dụng giá cho tất cả biến thể được chọn
function applyGiaToAll() {
  const val = parseGia(giaFormattedAll.value);
  if (val == null) return;
  checked.value.forEach((c, i) => {
    if (c) {
      req.value.chiTietSanPhamDto[i].gia = val;
      giaFormatted.value[i] = formatGia(val);
    }
  });
}

onBeforeUnmount(() => {
  files.value.flat().forEach((file) => revokePreview(file));
});
</script>

<style scoped>
/* Header Section (Quay lại và Tiêu đề) */
.header-section {
  display: flex;
  align-items: center;
  /* Căn giữa theo chiều dọc */
  margin-bottom: 2.5rem;
  /* Khoảng cách lớn hơn dưới header */
  gap: 2rem;
  /* Khoảng cách lớn hơn giữa nút và tiêu đề */
}

.back-button {
  background-color: #e9ecef;
  /* Màu xám nhạt */
  color: #495057;
  /* Màu chữ xám đậm */
  padding: 0.75rem 1.25rem;
  /* Tăng padding cho nút */
  border-radius: 0.4rem;
  /* Bo tròn vừa phải */
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  flex-shrink: 0;
  /* Không co lại */
  font-size: 1rem;
  /* Kích thước font cho nút */
}
.back-button:hover {
  background-color: #dee2e6;
  color: #0a2c57;
}

.page-title-aligned {
  font-size: 2.2rem;
  /* Tăng kích thước font cho tiêu đề */
  font-weight: 700;
  /* Đậm hơn */
  color: #0a2c57;
  /* Màu chữ rất đậm */
  margin: 0;
  /* Đảm bảo không có margin mặc định */
  line-height: 1;
  /* Căn chỉnh dòng */
}

td > {
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
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.1);
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
  color: white !important; /* Màu chữ đen */
}
.custom-vselect .vs__dropdown-option {
  margin-bottom: 3px; /* tạo khoảng cách dưới */
  border-radius: 3px; /* nếu cần bo góc cho đẹp */
  padding: 3px 3px;
}
</style>