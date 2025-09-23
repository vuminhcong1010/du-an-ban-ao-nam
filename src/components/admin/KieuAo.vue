<script setup>
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { Eye, Plus, Trash, Edit, Filter as FilterIcon } from 'lucide-vue-next';
import Cookies from 'js-cookie';
import { useToast } from 'vue-toastification';

const token = Cookies.get('token');
const res = ref([]); // Dữ liệu gốc từ API
const totalItems = ref(0);
const pageSize = 5;
const currentPage = ref(1);
const totalPages = ref(1);
const inputPage = ref(1);
const searchText = ref("");
const searchResult = ref([]); // Kết quả tìm kiếm và phân trang hiển thị

const toast = useToast();
let req = ref({
    id: "",
    tenKieuAo: ""
});
let details = ref({
    id: "",
    maKieuAo: "",
    tenKieuAo: ""
});

const fetchData = async () => {
    try {
        const response = await axios.get("http://localhost:8080/kieu-ao", {
            headers: { Authorization: `Bearer ${token}` }
        });
        res.value = response.data.data;
        totalItems.value = res.value.length;
        totalPages.value = Math.ceil(totalItems.value / pageSize);
        inputPage.value = currentPage.value;
        updateSearchResult();
    } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        toast.error("Lỗi khi tải dữ liệu!");
    }
};

onMounted(() => {
    fetchData();
});

const updateSearchResult = () => {
    const filtered = res.value.filter(item =>
        (item.maKieuAo || "").toLowerCase().includes(searchText.value.toLowerCase()) ||
        (item.tenKieuAo || "").toLowerCase().includes(searchText.value.toLowerCase())
    );
    const start = (currentPage.value - 1) * pageSize;
    const end = start + pageSize;
    searchResult.value = filtered.slice(start, end);
    totalItems.value = filtered.length;
    totalPages.value = Math.ceil(totalItems.value / pageSize);
};

watch([searchText, currentPage], () => {
    updateSearchResult();
});

const add = async () => {
    if (!req.value.tenKieuAo.trim()) {
        toast.error("Vui lòng nhập đầy đủ thông tin");
        return;
    }
    const isDuplicate = res.value.some(
        (item) => item.tenKieuAo.trim().toLowerCase() === req.value.tenKieuAo.trim().toLowerCase()
    );
    if (isDuplicate) {
        toast.error("Tên kiểu áo đã tồn tại!");
        return;
    }
    try {
        await axios.post("http://localhost:8080/kieu-ao/add", req.value, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Thêm thành công!");
        await fetchData();
        reset();
    } catch (err) {
        console.error(err);
        toast.error("Lỗi khi thêm kiểu áo!");
    }
};

const update = async () => {
    if (!req.value.tenKieuAo.trim()) {
        toast.error("Vui lòng nhập đầy đủ thông tin");
        return;
    }
    const isDuplicate = res.value.some(
        (item) => item.tenKieuAo.trim().toLowerCase() === req.value.tenKieuAo.trim().toLowerCase() && item.id !== req.value.id
    );
    if (isDuplicate) {
        toast.error("Tên kiểu áo đã tồn tại!");
        return;
    }
    try {
        await axios.post("http://localhost:8080/kieu-ao/update", req.value, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Cập nhật thành công!");
        await fetchData();
        reset();
    } catch (err) {
        console.error(err);
        toast.error("Lỗi khi cập nhật kiểu áo!");
    }
};

const remove = async (id) => {
    try {
        await axios.get(`http://localhost:8080/kieu-ao/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Xóa thành công!");
        await fetchData();
    } catch (err) {
        console.error(err);
        toast.error("Lỗi khi xóa kiểu áo!");
    }
};

const detail = async (id) => {
    try {
        const response = await axios.get(`http://localhost:8080/kieu-ao/detail/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        details.value = response.data;
    } catch (err) {
        console.error(err);
        toast.error("Lỗi khi lấy thông tin chi tiết!");
    }
};

const save = (id) => {
    const item = res.value.find(r => r.id === id);
    if (item) {
        req.value = { ...item };
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
    req.value = { id: "", tenKieuAo: "" };
}
</script>

<template>
    <div class="full-width-container">
        <div class="d-flex align-items-center justify-content-between bg-white p-3 rounded mb-3 border">
            <h2 class="fw-bold mb-0">Quản lý kiểu áo</h2>
            <div class="d-flex gap-2">
                <button @click="reset" data-bs-toggle="modal" data-bs-target="#addModal"
                    style="background-color: #0a2c57; color: white; border: none" class="btn">
                    <Plus class="me-1" size="16" /> Thêm kiểu áo
                </button>
            </div>
        </div>

        <div class="bg-white p-3 rounded mb-3 border">
            <h5 style="margin-bottom: 1em">
                <i>
                    <FilterIcon></FilterIcon>
                </i> Bộ lọc
            </h5>
            <input type="text" class="form-control" placeholder="Tìm theo mã, tên kiểu áo..." v-model="searchText" />
        </div>

        <div class="bg-white p-3 rounded mb-4 border">
            <h5 class="text-start ps-3 pt-3">Danh sách kiểu áo</h5>
            <div class="table-responsive">
                <table class="table table-hover text-center align-middle">
                    <thead class="table-light">
                        <tr>
                            <th>STT</th>
                            <th>Mã Kiểu Áo</th>
                            <th>Tên Kiểu Áo</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(ds, index) in searchResult" :key="ds.id">
                            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                            <td>{{ ds.maKieuAo }}</td>
                            <td>{{ ds.tenKieuAo }}</td>
                            <td>
                                <Eye class="me-3" data-bs-toggle="modal" data-bs-target="#detailModal"
                                    @click="detail(ds.id)" style="color: #0a2c57" />
                                <Edit class="me-3" data-bs-toggle="modal" data-bs-target="#updateModal"
                                    @click="save(ds.id)" style="color: #4ccc7a" />
                                <Trash style="color: #dc3545" @click="remove(ds.id)" />
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

    <div class="modal fade" id="addModal" tabindex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="addModalLabel">Thêm kiểu áo</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="addFormTenKieuAo" class="form-label">Tên kiểu áo</label>
                        <input type="text" class="form-control" id="addFormTenKieuAo" v-model="req.tenKieuAo" />
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

    <div class="modal fade" id="updateModal" tabindex="-1" aria-labelledby="updateModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="updateModalLabel">Cập nhật thông tin kiểu áo</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <input type="hidden" v-model="req.id" />
                        <label for="updateFormTenKieuAo" class="form-label">Tên kiểu áo</label>
                        <input type="text" class="form-control" id="updateFormTenKieuAo" v-model="req.tenKieuAo" />
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="update">
                        Cập nhật
                    </button>
                </div>
            </div>
        </div>
    </div>

    <div class="modal fade" id="detailModal" tabindex="-1" aria-labelledby="detailModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="detailModalLabel">Thông tin kiểu áo</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="detailMaKieuAo" class="form-label">Mã kiểu áo</label>
                        <input type="text" class="form-control" id="detailMaKieuAo" v-model="details.maKieuAo" readonly />
                        <label for="detailTenKieuAo" class="form-label">Tên kiểu áo</label>
                        <input type="text" class="form-control" id="detailTenKieuAo" v-model="details.tenKieuAo" readonly />
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
h2,
h5 {
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