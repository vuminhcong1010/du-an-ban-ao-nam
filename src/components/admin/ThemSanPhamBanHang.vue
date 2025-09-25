<script setup>
import { ref, onMounted, computed } from "vue";
import { QrcodeStream } from "vue-qrcode-reader";
import { QrCode } from "lucide-vue-next";
import Cookies from "js-cookie";


const search = ref("");
const selected = ref({});
const mau = ref([]);     // dữ liệu màu từ API
const kichco = ref([]);  // dữ liệu kích cỡ từ API
const token = Cookies.get("token");
const anhMap = ref({}); // Lưu ảnh theo id sản phẩm
let listSanPham = ref([]);
const selectedKichCoId = ref(null);
const selectedMauId = ref(null);
// ---- Biến lọc giá ----
const revenueFilter = ref(0);
const minRevenue = ref(0);
const maxRevenue = ref(0);
// Phân trang
const currentPage = ref(0);
const pageSize = ref(5);



// Phân trang
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
    if (listSanPham.value.length > 0) {
      const giaArr = listSanPham.value.map(sp => sp.gia);
      minRevenue.value = Math.min(...giaArr);
      maxRevenue.value = Math.max(...giaArr);
      revenueFilter.value = maxRevenue.value; // mặc định hiển thị hết
    }
    // lấy ảnh:
    listSanPham.value.forEach((sp) => {
      fetchAnhSanPham(sp.id);
    });

    totalPages.value = data.totalPages;
  } catch (error) {
    console.error("Lỗi khi fetch sản phẩm:", error);
  }
};

const fetchMau = async () => {
  try {
    const response = await fetch("http://localhost:8080/doi-giam-gia/mau", {
      headers: { Authorization: `Bearer ${token}` },
    });
    mau.value = await response.json();   // 🔥 dùng response
  } catch (err) {
    console.error("Lỗi khi gọi API màu:", err);
  }
};

const fetchKichCo = async () => {
  try {
    const response = await fetch("http://localhost:8080/doi-giam-gia/kich-co", {
      headers: { Authorization: `Bearer ${token}` },
    });
    kichco.value = await response.json();  // 🔥 dùng response
  } catch (err) {
    console.error("Lỗi khi gọi API kích cỡ:", err);
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
  fetchMau();
  fetchKichCo();
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
  return listSanPham.value.filter((sp) => {
    const matchSearch =
      search.value === "" ||
      sp.maChiTietSapPham.toLowerCase().includes(search.value.toLowerCase()) ||
      sp.idSanPham.tenSanPham.toLowerCase().includes(search.value.toLowerCase());

    const matchSize =
      !selectedKichCoId.value || sp.idSize.id === selectedKichCoId.value;

    const matchMau =
      !selectedMauId.value || sp.idMau.id === selectedMauId.value;

    const matchGia =
      !revenueFilter.value || sp.gia <= revenueFilter.value;

    return sp.soLuong > 0 && matchSearch && matchSize && matchMau && matchGia;
  });
});

// ✅ QUÉT QR CODE
const showScanner = ref(false);

const startScan = () => {
  showScanner.value = true;
};

const stopScan = () => {
  showScanner.value = false;
};

const onDetect = async (detectedCodes) => {
  if (!detectedCodes.length) return;

  const result = detectedCodes[0].rawValue; // lấy QR đầu tiên
  console.log("QR code:", result);

  try {
    const response = await fetch(
      `http://localhost:8080/chi-tiet-san-pham/${result}`
    );
    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Có lỗi xảy ra khi tìm sản phẩm!");
      return;
    }

    await fetchAnhSanPham(data.id);
    selectedItems.value = [data];
    apply();
  } catch (error) {
    console.error("Lỗi khi tìm sản phẩm bằng QR:", error);
    alert("Không thể kết nối đến server!");
  }
};


</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050">
    <div class="modal-dialog custom-modal modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chọn nhiều sản phẩm</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <div class="modal-body">
          <!-- bo loc -->
          <div class="">
            <div class="row g-3">
              <div class="col-md-12">
                <label class="form-label fw-bold">Bộ lọc</label>
                <div class="d-flex align-items-center gap-2">
                  <input type="text" class="form-control" placeholder="Tìm theo mã, tên sản phẩm" v-model="search" />
                  <!-- Nút bật camera -->
                  <button class="btn d-flex align-items-center justify-content-center" style="
                      background-color: #0a2c57;
                      color: white;
                      width: 42px;
                      height: 38px;
                    " @click="startScan" v-if="!showScanner">
                    <QrCode :size="20" />
                  </button>

                  <!-- Camera + nút X -->
                  <div v-if="showScanner" class="position-relative d-inline-block mb-3">
                    <!-- Camera -->
                    <qrcode-stream @detect="onDetect" :paused="!showScanner" style="
                        width: 100px;
                        height: 100px;
                        border: 1px solid #ccc;
                        border-radius: 8px;
                      " />

                    <!-- Nút X -->
                    <button class="btn-close position-absolute" style="top: 5px; right: 5px; background-color: white"
                      @click="stopScan"></button>
                  </div>
                  <button type="button" class="btn" style="
                      background-color: #0a2c57;
                      color: white;
                      white-space: nowrap;
                    " @click="locSanPham">
                    Tìm kiếm
                  </button>
                </div>
              </div>

              <!-- Kích cỡ -->
              <div class="col-md-3">
                <label class="form-label fw-bold" style="color: #0a2c57;">Kích cỡ</label>
                <select class="form-select" v-model="selectedKichCoId" @change="locSanPham">
                  <option :value="null">Tất cả Kích cỡ</option>
                  <option v-for="kc in kichco" :key="kc.id" :value="kc.id">
                    {{ kc.soCo }}
                  </option>
                </select>
              </div>

              <!-- Màu -->
              <div class="col-md-3">
                <label class="form-label fw-bold" style="color: #0a2c57;">Màu</label>
                <select class="form-select" v-model="selectedMauId" @change="locSanPham">
                  <option :value="null">Tất cả màu</option>
                  <option v-for="m in mau" :key="m.id" :value="m.id">
                    {{ m.ten }}
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
                    <img :src="anhMap[item.id] || 'https://via.placeholder.com/50'"
                      style="width: 50px; height: 50px; object-fit: cover" />
                  </td>
                  <td>{{ item.maChiTietSapPham }}</td>
                  <td>{{ item.idSanPham.tenSanPham }}</td>
                  <td>{{ item.idSize.soCo }}</td>
                  <td>{{ item.idMau.ten }}</td>
                  <td>{{ item.idSanPham.idChatLieu.tenChatLieu }}</td>
                  <td>{{ item.gia.toLocaleString() }}đ</td>
                  <td>{{ item.soLuong }}</td>

                  <td>
                    <input type="checkbox" :checked="selectedItems.some(
                      (i) => i.maChiTietSapPham === item.maChiTietSapPham
                    )
                      " @change="toggleSelection(item)" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Phân trang -->
          <div class="d-flex justify-content-between align-items-center mt-3">
            <button class="btn btn-outline-primary" :disabled="currentPage === 0" @click="prevPage">
              Trang trước
            </button>
            <span>Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
            <button class="btn btn-outline-primary" :disabled="currentPage >= totalPages - 1" @click="nextPage">
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