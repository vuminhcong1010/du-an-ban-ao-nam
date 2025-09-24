<template>
  <div class="">
    <div class="bg-white p-3 rounded border mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h2 class="fw-bold mb-0">Quản lý sản phẩm</h2>
        
        <a href="/san-pham/add" class="btn ms-auto" style="background-color: #0a2c57; color: white">
           <Plus class="me-1" size="16" />Thêm sản phẩm
        </a>
      </div>
    </div>

    <div class="bg-white p-3 rounded border mb-4">
      <div class="row g-3">
        <div class="col-md-12">
          <h5 style="margin-bottom: 1em">
            <i>
              <FilterIcon></FilterIcon>
            </i> Bộ lọc
          </h5>
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" placeholder="Tìm kiếm theo mã, tên" v-model="timKiem" />
          </div>
        </div>

        <div class="col-md-5 ms-2">
          <label class="form-label fw-bold" style="color: #0a2c57;">Trạng thái</label>
          <div class="d-flex gap-3">
            <div class="form-check" v-for="(label, value) in trangThaiOptions" :key="value">
              <input class="form-check-input" type="radio" :id="value" :value="value" v-model="selectedTrangThai" />
              <label class="form-check-label" :for="value">{{ label }}</label>
            </div>
          </div>
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold" style="color: #0a2c57;">Danh mục</label>
          <select class="form-select" v-model="selectedDanhMucId">
            <option :value="null">Tất cả danh mục</option>
            <option v-for="dm in danhMuc" :key="dm.id" :value="dm.id">{{ dm.tenDanhMuc }}</option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label fw-bold" style="color: #0a2c57;">Chất liệu</label>
          <select class="form-select" v-model="selectedChatLieuId">
            <option :value="null">Tất cả chất liệu</option>
            <option v-for="cl in danhSachChatLieu" :key="cl.id" :value="cl.id">{{ cl.tenChatLieu }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="bg-white p-3 rounded border mb-4">
      <h5 class="text-start ps-3 pt-3">Danh sách sản phẩm</h5>
      <table class="table table-hover text-center align-middle">
        <thead class="table-light">
          <tr>
            <th>STT</th>
            <th>Mã SP</th>
            <th>Tên SP</th>
            <th>Chất liệu</th>
            <th>Danh mục</th>
            <th>Số lượng</th>
            <th>Trạng thái</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sp, index) in sanPhamTheoTrang" :key="sp.id">
            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
            <td>{{ sp.maSanPham }}</td>
            <td>{{ sp.tenSanPham }}</td>
            <td>{{ sp.idChatLieu?.tenChatLieu }}</td>
            <td>
              <span v-for="dm in sp.dsDanhMuc" :key="dm.id" class="badge bg-secondary me-1">
                {{ dm.tenDanhMuc }}
              </span>
            </td>
            <td>{{ sp.soLuong }}</td>
            <td>
              <span :class="['status-badge', sp.trangThai === 1 ? 'active' : 'inactive']">
                {{ sp.trangThai === 1 ? 'Đang bán' : 'Ngừng bán' }}
              </span>
            </td>
            <td>
              <Trash class="me-3" style="color: #cc0000" @click="remove(sp.id)" />
              <Eye class="me-3" style="color: #0a2c57" @click="chuyenTrang(sp.id)" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="mt-4 d-flex align-items-center justify-content-center gap-2">
      <button 
        class="btn custom-btn" 
        @click="prevPage" 
        :disabled="currentPage === 1">
        Trước
      </button>
      <input 
        v-model.number="inputPage" 
        @keyup.enter="goToPage" 
        type="number" 
        min="1" 
        :max="totalPages"
        class="form-control w-auto text-center" />
      <span>/ {{ totalPages }}</span>
      <button 
        class="btn custom-btn" 
        @click="nextPage" 
        :disabled="currentPage >= totalPages">
        Tiếp
      </button>
    </div>
  </div>
</template>

<script setup>
import { Eye, FilterIcon, Trash, Plus } from "lucide-vue-next";
import { ref, computed, onMounted, watch } from "vue"
import axios from "axios"
import Cookies from 'js-cookie'
import { useToast } from "vue-toastification";

const toast = useToast();
const token = Cookies.get('token')
const allSP = ref([])
const danhMuc = ref([])
const danhSachChatLieu = ref([])
const currentPage = ref(1) // Thay đổi từ `page` thành `currentPage` cho nhất quán
const pageSize = 5
const inputPage = ref(1) // Thêm biến inputPage

const selectedDanhMucId = ref(null)
const selectedChatLieuId = ref(null)
const selectedTrangThai = ref("dangBan")
const timKiem = ref("")

const trangThaiOptions = {
  tatCa: "Tất cả",
  dangBan: "Đang bán",
  ngungBan: "Ngừng bán"
}

// Tính sản phẩm theo trang hiện tại
const filteredData = ref([])
const sanPhamTheoTrang = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredData.value.slice(start, start + pageSize)
})

const totalPages = computed(() => Math.ceil(filteredData.value.length / pageSize))

// Lọc sản phẩm
const locSanPham = () => {
  let ketQua = [...allSP.value]

  if (selectedDanhMucId.value) {
    ketQua = ketQua.filter(sp => sp.dsDanhMuc.some(dm => dm.id === selectedDanhMucId.value))
  }

  if (selectedChatLieuId.value) {
    ketQua = ketQua.filter(sp => sp.idChatLieu?.id === selectedChatLieuId.value)
  }

  if (selectedTrangThai.value === "dangBan") {
    ketQua = ketQua.filter(sp => sp.trangThai === 1)
  } else if (selectedTrangThai.value === "ngungBan") {
    ketQua = ketQua.filter(sp => sp.trangThai === 2)
  }

  if (timKiem.value.trim()) {
    const keyword = timKiem.value.toLowerCase()
    ketQua = ketQua.filter(sp =>
      (sp.maSanPham || "").toLowerCase().includes(keyword) ||
      (sp.tenSanPham || "").toLowerCase().includes(keyword)
    )
  }

  filteredData.value = ketQua
  currentPage.value = 1 // Reset trang về 1 khi lọc
  inputPage.value = 1 // Reset inputPage về 1 khi lọc
}

// Theo dõi các thay đổi để lọc thời gian thực
watch([timKiem, selectedDanhMucId, selectedChatLieuId, selectedTrangThai], () => {
  locSanPham();
});

// Phân trang
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const goToPage = () => {
  if (inputPage.value >= 1 && inputPage.value <= totalPages.value) {
    currentPage.value = inputPage.value;
  } else {
    toast.error("Số trang không hợp lệ!");
  }
};

watch(currentPage, (newPage) => {
  inputPage.value = newPage;
});

// Xoá sản phẩm
const remove = async (id) => {
  try {
    await axios.get(`http://localhost:8080/san-pham/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await fetchData();
    toast.success("Xóa sản phẩm thành công!");
  } catch (err) {
    console.error("Lỗi khi xóa sản phẩm:", err);
    toast.error("Lỗi khi xóa sản phẩm!");
  }
}

// Xem chi tiết
const chuyenTrang = (id) => {
  window.location.href = `/san-pham/chi-tiet-san-pham/${id}`
}

// Tải dữ liệu
const fetchData = async () => {
  try {
    const [spRes, dctRes, dmRes] = await Promise.all([
      axios.get("http://localhost:8080/san-pham/get-all", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:8080/test", {
        headers: { Authorization: `Bearer ${token}` }
      }),
      axios.get("http://localhost:8080/test1", {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])

    const allSanPhams = spRes.data.data
    const dctList = dctRes.data
    danhMuc.value = dmRes.data

    const soLuongRaw = spRes.data.soLuong
    const mapSoLuong = new Map(
      Object.entries(soLuongRaw).map(([idSanPham, soLuong]) => [Number(idSanPham), soLuong])
    )

    allSP.value = allSanPhams.map(sp => {
      const dsDanhMuc = dctList
        .filter(dct => dct.idSanPham.id === sp.id)
        .map(dct => dct.idDanhMuc)

      const soLuong = mapSoLuong.get(sp.id) || 0

      return { ...sp, dsDanhMuc, soLuong }
    })

    // Lọc chất liệu duy nhất
    const mapCL = new Map()
    allSanPhams.forEach(sp => {
      if (sp.idChatLieu) mapCL.set(sp.idChatLieu.id, sp.idChatLieu)
    })
    danhSachChatLieu.value = Array.from(mapCL.values())

    locSanPham()

  } catch (e) {
    console.error("Lỗi tải dữ liệu:", e)
    toast.error("Lỗi khi tải dữ liệu sản phẩm!");
  }
}

onMounted(fetchData)
</script>

<style scoped>
.badge {
  font-size: 0.85rem;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.status-badge.active {
  background-color: #e6f4ea;
  color: #1e7e34;
}

.status-badge.inactive {
  background-color: #fbe9e7;
  color: #d32f2f;
}

h2, h5 {
  font-weight: bold;
  color: #0a2c57;
}

.custom-btn {
  background-color: #f0f0f0;
  color: #0a2c57;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.custom-btn:hover {
  background-color: #0a2c57;
  color: white;
}

.custom-btn:disabled {
  cursor: not-allowed;
  background-color: #e0e0e0;
  color: #999;
  border: 1px solid #ddd;
}
</style>