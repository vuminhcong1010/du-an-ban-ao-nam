<script setup>
import { ref, onMounted } from "vue";

const search = ref("");
const selected = ref({});

let listSanPham = ref([]);

// Phân trang
const currentPage = ref(0);
const pageSize = ref(5);
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
    totalPages.value = data.totalPages;
  } catch (error) {
    console.error("Lỗi khi fetch sản phẩm:", error);
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
      giaMoi:"",
    };
  });

  emit("selected", result);
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
                <tr v-for="(item, index) in listSanPham" :key="index">
                  <td>{{ index + 1 }}</td>
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
                  <td>{{ item.gia.toLocaleString() }}đ</td>
                  <td>{{ item.soLuong }}</td>
                  
                  <td>
                    <input
                      type="checkbox"
                      :checked="selectedItems.some(i => i.maChiTietSapPham === item.maChiTietSapPham)"
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
