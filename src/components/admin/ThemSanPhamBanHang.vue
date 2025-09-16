<script setup>
import { ref, onMounted, computed } from "vue";

const search = ref("");
const selected = ref({});

const anhMap = ref({}); // Lưu ảnh theo id sản phẩm
let listSanPham = ref([]);

// Phân trang
const currentPage = ref(0);
const pageSize = ref(5);
3;
const totalPages = ref(0);

// Props
const props = defineProps({
  maHoaDon: {
    type: String,
    required: true,
  },
});
const maHoaDon = props.maHoaDon;

// Emits
const emit = defineEmits(["selected", "close"]);
const selectedItems = ref([]);

// Fetch sản phẩm có phân trang
const fetchSanPhamPaginated = async () => {
  try {
    const response = await fetch(
      `http://localhost:8080/chi-tiet-san-pham/phan-trang?page=${currentPage.value}&size=${pageSize.value}`
    );
    const data = await response.json();
    listSanPham.value = data.content;

    // lấy ảnh:
    listSanPham.value.forEach((sp) => {
      fetchAnhSanPham(sp.id);
    });

    totalPages.value = data.totalPages;
  } catch (error) {
    console.error("Lỗi khi fetch sản phẩm:", error);
  }
};

// lay ảnh sản phẩm
const fetchAnhSanPham = async (id) => {
  console.log(id);
  try {
    const response = await fetch(
      `http://localhost:8080/chi-tiet-san-pham/lay-anh/${id}`
    );
    if (response.ok) {
      const url = await response.text();
      console.log(url);
      anhMap.value[id] = url; // Gán đường dẫn ảnh vào map
    } else {
      anhMap.value[id] = "https://via.placeholder.com/50"; // Ảnh mặc định khi không có ảnh
    }
  } catch (error) {
    anhMap.value[id] = "https://via.placeholder.com/50"; // Ảnh mặc định khi lỗi
  }
};

// Mounted
onMounted(() => {
  fetchSanPhamPaginated();
});

// Phân trang
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchSanPhamPaginated();
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchSanPhamPaginated();
  }
};

// Chọn / bỏ chọn sản phẩm
const toggleSelection = (item) => {
  const index = selectedItems.value.findIndex(
    (i) => i.maChiTietSapPham === item.maChiTietSapPham
  );
  if (index === -1) {
    selectedItems.value.push(item);
    // quantities.value[item.maChiTietSapPham] = 1;
  } else {
    selectedItems.value.splice(index, 1);
    // delete quantities.value[item.maChiTietSapPham];
  }
};

// Xác nhận chọn sản phẩm
const apply = () => {
  const result = selectedItems.value.map((item) => {
    return {
      ...item,
      idSanPhamChiTiet: item.maChiTietSapPham,
      soLuong: 1, // gán mặc định là 1
      soLuongTruocDo: 1,
      giaGoc: item.gia,
      kho: item.soLuong,
      thanhTien: item.gia,
      idHoaDon: maHoaDon,
      baoGiaThayDoi: false,
      giaMoi: "",
      urlAnh: anhMap.value[item.id],
    };
  });

  emit("selected", result);
  emit("close");
};

const filteredSanPham = computed(() => {
  return listSanPham.value.filter((sp) => sp.soLuong > 0);
});
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
          <!-- bo loc -->
          <div class="">
            <div class="row g-3">
              <div class="col-md-12">
                <label class="form-label fw-bold">Bộ lọc</label>
                <div class="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Tìm theo mã, tên sản phẩm"
                    v-model="timKiem"
                  />
                  <button
                    type="button"
                    class="btn"
                    style="
                      background-color: #0a2c57;
                      color: white;
                      white-space: nowrap;
                    "
                    @click="locSanPham"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>

              <!-- Trạng thái -->
              <div class="col-md-5 ms-2">
                <label class="form-label fw-bold">Trạng thái</label>
                <div class="d-flex gap-3">
                  <input type="radio" /> Đang bán <input type="radio" /> Ngừng
                  bán
                </div>
              </div>

              <!-- Danh mục -->
              <div class="col-md-3">
                <label class="form-label fw-bold">Danh mục</label>
                <select
                  class="form-select"
                  v-model="selectedDanhMucId"
                  @change="locSanPham"
                >
                  <option :value="null">Tất cả danh mục</option>
                  <option v-for="dm in danhMuc" :key="dm.id" :value="dm.id">
                    {{ dm.tenDanhMuc }}
                  </option>
                </select>
              </div>

              <!-- Chất liệu -->
              <div class="col-md-3">
                <label class="form-label fw-bold">Chất liệu</label>
                <select
                  class="form-select"
                  v-model="selectedChatLieuId"
                  @change="locSanPham"
                >
                  <option :value="null">Tất cả chất liệu</option>
                  <option
                    v-for="cl in danhSachChatLieu"
                    :key="cl.id"
                    :value="cl.id"
                  >
                    {{ cl.tenChatLieu }}
                  </option>
                </select>
              </div>
            </div>
          </div>
          <!-- --------------- -->

          <!-- Table sản phẩm -->
          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ảnh</th>
                  <th>Mã</th>
                  <th>Tên sản phẩm</th>
                  <th>Size</th>
                  <th>Màu</th>
                  <th>Chất liệu</th>
                  <th>Giá</th>
                  <th>Kho</th>

                  <th>Chọn</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredSanPham" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <img
                      :src="anhMap[item.id] || 'https://via.placeholder.com/50'"
                      style="width: 50px; height: 50px; object-fit: cover"
                    />
                  </td>
                  <td>{{ item.maChiTietSapPham }}</td>
                  <td>{{ item.idSanPham.tenSanPham }}</td>
                  <td>{{ item.idSize.soCo }}</td>
                  <td>{{ item.idMau.ten }}</td>
                  <td>{{ item.idSanPham.idChatLieu.tenChatLieu }}</td>
                  <td>{{ item.gia.toLocaleString() }}đ</td>
                  <td>{{ item.soLuong }}</td>

                  <td>
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

          <!-- Phân trang -->
          <div class="d-flex justify-content-between align-items-center mt-3">
            <button
              class="btn btn-outline-primary"
              :disabled="currentPage === 0"
              @click="prevPage"
            >
              Trang trước
            </button>
            <span>Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
            <button
              class="btn btn-outline-primary"
              :disabled="currentPage >= totalPages - 1"
              @click="nextPage"
            >
              Trang sau
            </button>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button class="btn btn-primary" @click="apply">Áp dụng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-modal {
  max-width: 80vw;
}
</style>