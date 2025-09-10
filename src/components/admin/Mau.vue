<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Eye, Plus, Trash, Edit } from 'lucide-vue-next';
import Cookies from 'js-cookie';
import { useToast } from 'vue-toastification';

const token = Cookies.get('token');
const res = ref([]);          // dữ liệu gốc từ API
const page = ref(1);          // tổng số trang
const searchText = ref("");   // nội dung ô tìm kiếm
const searchResult = ref([]); // kết quả tìm kiếm hiển thị

const toast = useToast();
let req = ref({
  id: "",
  ten: ""
});
let details = ref({
  id: "",
  maMau: "",
  ten: ""
});

onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8080/mau", {
      headers: { Authorization: `Bearer ${token}` }
    });
    res.value = response.data.data;
    searchResult.value = res.value; // mặc định hiển thị tất cả
    page.value = Math.ceil(response.data.size / 5);
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
});

// Tìm kiếm realtime
watch(searchText, (newValue) => {
  if (!newValue.trim()) {
    searchResult.value = res.value; // reset full nếu trống
    return;
  }
  searchResult.value = res.value.filter(item =>
    (item.maMau || "").toLowerCase().includes(newValue.toLowerCase()) ||
    (item.ten || "").toLowerCase().includes(newValue.toLowerCase())
  );
});

const add = () => {
  if (!req.value.ten.trim()) {
    toast.error("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  // Kiểm tra trùng tên màu
  const isDuplicate = res.value.some(
    (item) => item.ten.trim().toLowerCase() === req.value.ten.trim().toLowerCase()
  );

  if (isDuplicate) {
    toast.error("Tên màu đã tồn tại!");
    return;
  }
const mauSacCoSan = [
  'Đỏ', 'Xanh Dương', 'Xanh Lá', 'Vàng', 'Trắng', 'Đen',
  'Hồng', 'Tím', 'Cam', 'Nâu', 'Xám', 'Bạc',
  'Xanh Ngọc', 'Xanh Navy', 'Vàng Chanh', 'Xanh Mint', 'Be', 'Rượu Vang'
];

if (!mauSacCoSan.includes(req.value.ten)) {
  toast.error("Màu không hợp lệ");
  reset()
  return;
}
  axios.post("http://localhost:8080/mau/add", req.value, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    res.value = response.data.data;
    searchResult.value = res.value;
    page.value = Math.ceil(response.data.size / 5);
    reset();
    toast.success("Thêm thành công!");
  }).catch(err => {
    console.error(err);
    toast.error("Lỗi khi thêm màu sắc!");
  });
};

const update = () => {
  if (!req.value.ten.trim()) {
    toast.error("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  // Kiểm tra trùng tên (trừ chính nó)
  const isDuplicate = res.value.some(
    (item) =>
      item.ten.trim().toLowerCase() === req.value.ten.trim().toLowerCase() &&
      item.id !== req.value.id
  );

  if (isDuplicate) {
    toast.error("Tên màu đã tồn tại!");
    return;
  }
const mauSacCoSan = [
  'Đỏ', 'Xanh Dương', 'Xanh Lá', 'Vàng', 'Trắng', 'Đen',
  'Hồng', 'Tím', 'Cam', 'Nâu', 'Xám', 'Bạc',
  'Xanh Ngọc', 'Xanh Navy', 'Vàng Chanh', 'Xanh Mint', 'Be', 'Rượu Vang'
];

if (!mauSacCoSan.includes(req.value.ten)) {
  toast.error("Màu không hợp lệ");
  reset()
  return;
}
  axios.post("http://localhost:8080/mau/update", req.value, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    res.value = response.data.data;
    searchResult.value = res.value;
    page.value = Math.ceil(response.data.size / 5);
    reset();
    toast.success("Cập nhật thành công!");
  }).catch(err => {
    console.error(err);
    toast.error("Lỗi khi cập nhật màu sắc!");
  });
};

const remove = (id) => {
  axios.get(`http://localhost:8080/mau/delete/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    res.value = response.data.data;
    searchResult.value = res.value;
    page.value = Math.ceil(response.data.size / 5);
    toast.success("Xóa thành công!");
  }).catch(err => {
    console.error(err);
    toast.error("Lỗi khi xóa màu sắc!");
  });
};

const detail = (id) => {
  axios.get(`http://localhost:8080/mau/detail/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    details.value = response.data;
  }).catch(err => {
    console.error(err);
    toast.error("Lỗi khi lấy thông tin chi tiết!");
  });
};

const save = (id) => {
  req.value.id = id;
  const item = res.value.find(r => r.id === id);
  if (item) {
    req.value.ten = item.ten;
  }
};

const paging = (id) => {
  axios.get(`http://localhost:8080/mau/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(response => {
    res.value = response.data.data;
    searchResult.value = res.value;
  }).catch(err => {
    console.error(err);
    toast.error("Lỗi khi phân trang!");
  });
};

function reset() {
  req.value = { id: "", ten: "" };
}
</script>

<template>
  <div class="container my-4">
    <div class="bg-white p-3 rounded shadow mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <h5 class="fw-semibold">Quản lý màu sắc:</h5>
        <button
          class="btn"
          data-bs-toggle="modal"
          data-bs-target="#exampleModal"
          style="background-color: #0a2c57;"
        >
          <Plus size="18" style="color: white;" />
        </button>
      </div>
    </div>

    <!-- Tìm kiếm realtime -->
    <div class="bg-white p-3 rounded shadow mb-4">
      <div class="row g-3 align-items-end">
        <div class="col-12">
          <label class="form-label fw-bold">Bộ lọc</label>
          <div class="d-flex align-items-center gap-2">
            <input
              type="text"
              class="form-control"
              placeholder="Tìm theo mã, tên màu"
              v-model="searchText"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Danh sách -->
    <div class="bg-white p-3 rounded shadow mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-semibold m-0">Danh sách màu</h5>
      </div>
      <table class="table table-hover text-center align-middle">
        <thead class="table-light">
          <tr>
            <th>STT</th>
            <th>Mã Màu</th>
            <th>Tên Màu</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(ds, index) in searchResult" :key="ds.id">
            <td>{{ index + 1 }}</td>
            <td>{{ ds.maMau }}</td>
            <td>{{ ds.ten }}</td>
            <td>
              <Trash class="me-3" style="color: #CC0000;" @click="remove(ds.id)" />
              <Eye
                class="me-3"
                data-bs-toggle="modal"
                data-bs-target="#exampleModal1"
                @click="detail(ds.id)"
                style="color: #0a2c57;"
              />
              <Edit
                data-bs-toggle="modal"
                data-bs-target="#exampleModal2"
                @click="save(ds.id)"
                style="color: #66FF99"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <nav aria-label="Page navigation example">
      <ul class="pagination">
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Previous">
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        <li class="page-item" v-for="ds in page" :key="ds">
          <a class="page-link" @click="paging(ds)">{{ ds }}</a>
        </li>
        <li class="page-item">
          <a class="page-link" href="#" aria-label="Next">
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
      </ul>
    </nav>

    <!-- modal add -->
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
            <h1 class="modal-title fs-5" id="exampleModalLabel">Thêm màu sắc</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="form1" class="form-label">Tên màu</label>
              <input type="text" class="form-control" id="form1" v-model="req.ten" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
            <button type="button" class="btn btn-primary" @click="add" data-bs-dismiss="modal">
              Thêm
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- modal update -->
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
            <h1 class="modal-title fs-5" id="exampleModalLabel">Cập nhật thông tin màu sắc</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <input type="hidden" v-model="req.id" />
              <label for="form1" class="form-label">Tên màu</label>
              <input type="text" class="form-control" id="form1" v-model="req.ten" />
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

    <!-- modal detail -->
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
            <h1 class="modal-title fs-5" id="exampleModalLabel">Thông tin màu sắc</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="form" class="form-label">Mã màu</label>
              <input type="text" class="form-control" id="form" v-model="details.maMau" readonly />
              <label for="form1" class="form-label">Tên màu</label>
              <input
                type="text"
                class="form-control"
                id="form1"
                v-model="details.ten"
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
  </div>
</template>