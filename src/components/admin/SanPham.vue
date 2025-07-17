<template>
  <div class="">
    <!-- Header -->
    <div class="bg-white p-3 rounded border mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="fw-bold mb-0">Quản lý sản phẩm:</h5>
        <a href="/san-pham/add" class="btn ms-auto" style="background-color: #0a2c57; color: white">
          <i class="fa-solid fa-plus pe-2"></i>Thêm sản phẩm
        </a>
      </div>
    </div>

    <!-- Bộ lọc -->
    <div class="bg-white p-3 rounded border mb-4">
      <div class="row g-3">
        <div class="col-md-12">
          <label class="form-label fw-bold">Bộ lọc</label>
          <div class="d-flex align-items-center gap-2">
            <input type="text" class="form-control" placeholder="Tìm theo mã, tên sản phẩm" v-model="timKiem" />
            <button type="button" class="btn" style="background-color: #0a2c57; color: white;  white-space: nowrap;" @click="locSanPham">
              Tìm kiếm
            </button>
          </div>
        </div>

        <!-- Trạng thái -->
        <div class="col-md-5 ms-2">
          <label class="form-label fw-bold">Trạng thái</label>
          <div class="d-flex gap-3">
            <div class="form-check" v-for="(label, value) in trangThaiOptions" :key="value">
              <input
                class="form-check-input"
                type="radio"
                :id="value"
                :value="value"
                v-model="selectedTrangThai"
                @change="locSanPham"
              />
              <label class="form-check-label" :for="value">{{ label }}</label>
            </div>
          </div>
        </div>

        <!-- Danh mục -->
        <div class="col-md-3">
          <label class="form-label fw-bold">Danh mục</label>
          <select class="form-select" v-model="selectedDanhMucId" @change="locSanPham">
            <option :value="null">Tất cả danh mục</option>
            <option v-for="dm in danhMuc" :key="dm.id" :value="dm.id">{{ dm.tenDanhMuc }}</option>
          </select>
        </div>

        <!-- Chất liệu -->
        <div class="col-md-3">
          <label class="form-label fw-bold">Chất liệu</label>
          <select class="form-select" v-model="selectedChatLieuId" @change="locSanPham">
            <option :value="null">Tất cả chất liệu</option>
            <option v-for="cl in danhSachChatLieu" :key="cl.id" :value="cl.id">{{ cl.tenChatLieu }}</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Danh sách sản phẩm -->
    <div class="bg-white p-3 rounded border mb-4">
      <h5 class="fw-semibold m-0 mb-3">Danh sách sản phẩm</h5>
      <table class="table table-hover text-center align-middle">
        <thead class="table-light">
          <tr>
            <th>STT</th>
            <th>Mã SP</th>
            <th>Tên SP</th>
            <!-- <th>Số lượng</th> -->
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
            <!-- <td>{{ sp.soLuong }}</td> -->
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

    <!-- Phân trang -->
    <nav>
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <a class="page-link" href="#" @click.prevent="chuyenTrangSo(currentPage - 1)">«</a>
        </li>
        <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: p === currentPage }">
          <a class="page-link" href="#" @click.prevent="chuyenTrangSo(p)">{{ p }}</a>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <a class="page-link" href="#" @click.prevent="chuyenTrangSo(currentPage + 1)">»</a>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue"
import axios from "axios"
import { Eye, Trash } from "lucide-vue-next"
import Cookies from 'js-cookie'
import { useToast } from "vue-toastification";

const toast = useToast();
const token = Cookies.get('token')
const allSP = ref([])
const danhMuc = ref([])
const danhSachChatLieu = ref([])
const currentPage = ref(1)
const pageSize = 5

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
      sp.maSanPham.toLowerCase().includes(keyword) ||
      sp.tenSanPham.toLowerCase().includes(keyword)
    )
  }

  filteredData.value = ketQua
  currentPage.value = 1
}

// Phân trang khi click
const chuyenTrangSo = (soTrang) => {
  if (soTrang >= 1 && soTrang <= totalPages.value) {
    currentPage.value = soTrang
  }
}

// Xoá sản phẩm
const remove = async (id) => {
  await axios.get(`http://localhost:8080/san-pham/delete/${id}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
  await fetchData()
}

// Xem chi tiết
const chuyenTrang = (id) => {
  window.location.href = `/san-pham/chi-tiet-san-pham/${id}`
}
const fetchData = async () => {
  try {
    const [spRes, dctRes, dmRes] = await Promise.all([
      axios.get("http://localhost:8080/san-pham/get-all",{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
      axios.get("http://localhost:8080/test",{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }),
      axios.get("http://localhost:8080/test1",{
    headers: {
      Authorization: `Bearer ${token}`
    }
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
</style>
