<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Eye, Plus, Trash, Edit, Filter as FilterIcon } from 'lucide-vue-next';
import Cookies from 'js-cookie';
import { useToast } from 'vue-toastification';

const token = Cookies.get('token');
const res = ref([]);
const totalItems = ref(0);
const pageSize = 5;
const currentPage = ref(1);
const totalPages = ref(1);
const inputPage = ref(1);
const searchText = ref("");
const searchResult = ref([]);

const toast = useToast();
let req = ref({
  id: "",
  tenDanhMuc: ""
});
let details = ref({
  id: "",
  maDanhMuc: "",
  tenDanhMuc: ""
});

// Hàm lấy dữ liệu từ API
const fetchData = async () => {
  try {
    const response = await axios.get("http://localhost:8080/danh-muc", {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.value = response.data.data;
    totalItems.value = res.value.length;
    totalPages.value = Math.ceil(totalItems.value / pageSize);
    inputPage.value = currentPage.value;
    updateSearchResult();
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
};

onMounted(() => {
  fetchData();
});

// Hàm cập nhật kết quả tìm kiếm và phân trang
const updateSearchResult = () => {
  const filtered = res.value.filter(item =>
    (item.maDanhMuc || "").toLowerCase().includes(searchText.value.toLowerCase()) ||
    (item.tenDanhMuc || "").toLowerCase().includes(searchText.value.toLowerCase())
  );
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  searchResult.value = filtered.slice(start, end);
};

// Theo dõi thay đổi của từ khóa tìm kiếm và trang hiện tại
watch([searchText, currentPage], () => {
  updateSearchResult();
});

const add = async () => {
  if (!req.value.tenDanhMuc.trim()) {
    toast.error("Vui lòng nhập đầy đủ thông tin");
    return;
  }
  const isDuplicate = res.value.some(
    (item) => item.tenDanhMuc.trim().toLowerCase() === req.value.tenDanhMuc.trim().toLowerCase()
  );
  if (isDuplicate) {
    toast.error("Tên danh mục đã tồn tại!");
    return;
  }
  try {
    await axios.post("http://localhost:8080/danh-muc/add", req.value, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Thêm thành công!");
    await fetchData();
    reset();
  } catch (err) {
    console.error(err);
    toast.error("Lỗi khi thêm danh mục!");
  }
};

const update = async () => {
  if (!req.value.tenDanhMuc.trim()) {
    toast.error("Vui lòng nhập đầy đủ thông tin");
    return;
  }
  const isDuplicate = res.value.some(
    (item) => item.tenDanhMuc.trim().toLowerCase() === req.value.tenDanhMuc.trim().toLowerCase() && item.id !== req.value.id
  );
  if (isDuplicate) {
    toast.error("Tên danh mục đã tồn tại!");
    return;
  }
  try {
    await axios.post("http://localhost:8080/danh-muc/update", req.value, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Cập nhật thành công!");
    await fetchData();
    reset();
  } catch (err) {
    console.error(err);
    toast.error("Lỗi khi cập nhật danh mục!");
  }
};

const remove = async (id) => {
  try {
    await axios.get(`http://localhost:8080/danh-muc/delete/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    toast.success("Xóa thành công!");
    await fetchData();
  } catch (err) {
    console.error(err);
    toast.error("Lỗi khi xóa danh mục!");
  }
};

const detail = async (id) => {
  try {
    const response = await axios.get(`http://localhost:8080/danh-muc/detail/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    details.value = response.data;
  } catch (err) {
    console.error(err);
    toast.error("Lỗi khi lấy thông tin chi tiết!");
  }
};

const save = (id) => {
  req.value.id = id;
  const item = res.value.find(r => r.id === id);
  if (item) {
    req.value.tenDanhMuc = item.tenDanhMuc;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const goToPage = () => {
  if (inputPage.value >= 1 && inputPage.value <= totalPages.value) {
    currentPage.value = inputPage.value;
  } else {
    toast.error(`Vui lòng nhập số trang từ 1 đến ${totalPages.value}`);
  }
};

function reset() {
  req.value = { id: "", tenDanhMuc: "" };
}
</script>

<template>
  <div class="full-width-container">
    <div class="d-flex align-items-center justify-content-between bg-white p-3 rounded mb-3 border">
      <h2 class="fw-bold mb-0">Quản lý danh mục</h2>
      <div class="d-flex gap-2">
        <button
          @click="reset"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
          style="background-color: #0a2c57; color: white; border: none"
          class="btn"
        >
          <Plus class="me-1" size="16" /> Thêm danh mục
        </button>
      </div>
    </div>

    <div class="bg-white p-3 rounded mb-3 border">
      <h5 style="margin-bottom: 1em">
        <i>
          <FilterIcon></FilterIcon>
        </i> Bộ lọc
      </h5>
      <input
        type="text"
        class="form-control"
        placeholder="Tìm theo mã, tên danh mục..."
        v-model="searchText"
      />
    </div>

    <div class="bg-white p-3 rounded mb-4 border">
      <h5 class="text-start ps-3 pt-3">Danh sách danh mục</h5>
      <div class="table-responsive">
        <table class="table table-hover text-center align-middle">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Mã Danh Mục</th>
              <th>Tên Danh Mục</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(ds, index) in searchResult" :key="ds.id">
              <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
              <td>{{ ds.maDanhMuc }}</td>
              <td>{{ ds.tenDanhMuc }}</td>
              <td>
                <Eye
                  class="me-3"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal1"
                  @click="detail(ds.id)"
                  style="color: #0a2c57"
                />
                <Edit
                  class="me-3"
                  data-bs-toggle="modal"
                  data-bs-target="#exampleModal2"
                  @click="save(ds.id)"
                  style="color: #4ccc7a"
                />
                <Trash
                  style="color: #dc3545"
                  @click="remove(ds.id)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4 d-flex align-items-center justify-content-center gap-2">
        <button class="btn custom-btn" @click="prevPage" :disabled="currentPage === 1">Trước</button>
        <input v-model.number="inputPage" @keyup.enter="goToPage" type="number" min="1" :max="totalPages"
          class="form-control" style="width: 70px; text-align: center" />
        <span>/ {{ totalPages }}</span>
        <button class="btn custom-btn" @click="nextPage" :disabled="currentPage === totalPages">Tiếp</button>
      </div>
    </div>
  </div>

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
          <h1 class="modal-title fs-5" id="exampleModalLabel">Thêm danh mục</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="form1" class="form-label">Tên danh mục</label>
            <input type="text" class="form-control" id="form1" v-model="req.tenDanhMuc" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          <button
            type="button"
            class="btn btn-primary"
            @click="add"
            data-bs-dismiss="modal"
          >
            Thêm
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="exampleModal2"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Cập nhật thông tin danh mục</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <input type="hidden" v-model="req.id" />
            <label for="form1" class="form-label">Tên danh mục</label>
            <input type="text" class="form-control" id="form1" v-model="req.tenDanhMuc" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          <button
            type="button"
            class="btn btn-primary"
            data-bs-dismiss="modal"
            @click="update"
          >
            Cập nhật
          </button>
        </div>
      </div>
    </div>
  </div>

  <div
    class="modal fade"
    id="exampleModal1"
    tabindex="-1"
    aria-labelledby="exampleModalLabel"
    aria-hidden="true"
  >
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5" id="exampleModalLabel">Thông tin danh mục</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label for="form" class="form-label">Mã danh mục</label>
            <input type="text" class="form-control" id="form" v-model="details.maDanhMuc" readonly />
            <label for="form1" class="form-label">Tên danh mục</label>
            <input
              type="text"
              class="form-control"
              id="form1"
              v-model="details.tenDanhMuc"
              readonly
            />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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