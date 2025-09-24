<template>
    <div>
        <div class="bg-white p-3 rounded mb-4 d-flex align-items-center justify-content-between border"
            style="height: 60px; border: none; box-shadow: none">
            <h2 class="fw-bold mb-0" style="color: #0a2c57;">Quản lý nhân viên</h2>
            <div>
                <button class="btn file-btn me-2" @click="triggerFileInput">
                    <Upload class="me-1" size="16" /> Nhập file
                </button>
                <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none"
                    @change="handleFileChange" />
                <button class="btn file-btn me-2" @click="confirmExportExcel">
                    <Upload class="me-1" size="16" /> Xuất file
                </button>
                <RouterLink to="/nhan-vien/them" class="btn success" style="background-color: #0a2c57; color: white">
                    <Plus class="me-1" size="16" /> Thêm nhân viên
                </RouterLink>
            </div>
        </div>

        <div class="bg-white p-3 rounded mb-4 border">
            <h5 style="margin-bottom: 1em">
                <i>
                    <FilterIcon></FilterIcon>
                </i> Bộ lọc
            </h5>
            <div class="px-3">
                <input type="text" class="form-control mb-3" v-model="filterState.search"
                    placeholder="Tìm kiếm theo mã, tên, email và số điện thoại" />
                <div class="d-flex flex-wrap gap-3">
                    <div class="d-flex flex-column" style="width: 250px;">
                        <label class="form-label fw-bold" style="color: #0a2c57;">Trạng thái</label>
                        <select class="form-select" v-model="filterState.trangThai">
                            <option value="">Tất cả</option>
                            <option value="1">Đang làm việc</option>
                            <option value="0">Đã nghỉ việc</option>
                        </select>
                    </div>
                    <div class="d-flex flex-column" style="width: 250px;">
                        <label class="form-label fw-bold" style="color: #0a2c57;">Vai trò</label>
                        <select class="form-select" v-model="filterState.vaiTro">
                            <option value="">Tất cả</option>
                            <option v-for="role in roles" :key="role.id" :value="role.tenVaiTro">{{ role.tenVaiTro }}
                            </option>
                        </select>
                    </div>
                    <div class="d-flex flex-column" style="width: 250px;">
                        <label class="form-label fw-bold" style="color: #0a2c57;">Tỉnh/Thành</label>
                        <select class="form-select" v-model="filterState.tinhThanh">
                            <option value="">Tất cả</option>
                            <option v-for="province in provinces" :key="province.code" :value="province.name">
                                {{ province.name }}
                            </option>
                        </select>
                    </div>
                </div>
            </div>
        </div>

        <div class="bg-white p-3 rounded mb-4 border" style="height: auto;">
            <h5 class="text-start ps-3 pt-3">Danh sách nhân viên</h5>
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>STT</th>
                            <th>Ảnh</th>
                            <th>Mã NV</th>
                            <th>Tên nhân viên</th>
                            <th>SDT</th>
                            <th>Email</th>                          
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                            <th>Vai trò</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-if="pagedNhanVien.length > 0" v-for="(nhanVien, index) in pagedNhanVien"
                            :key="nhanVien.id">
                            <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                            <td>
                                <img :src="getImageUrl(nhanVien.anh)" class="employee-avatar" />
                            </td>
                            <td>{{ nhanVien.maNhanVien }}</td>
                            <td>{{ nhanVien.tenNhanVien }}</td>
                            <td>{{ nhanVien.sdt }}</td>
                            <td>{{ nhanVien.email }}</td>
                            
                            <td>
                                <span :class="['status-badge', nhanVien.trangThai === 1 ? 'active' : 'inactive']">
                                    {{ nhanVien.trangThai === 1 ? 'Đang làm việc' : 'Đã nghỉ việc' }}
                                </span>
                            </td>
                            <td>
                                <div class="d-flex gap-2">
                                    <RouterLink :to="`/nhan-vien/sua/${nhanVien.id}`"
                                        title="Sửa thông tin">
                                        <Edit style="color: #4ccc7a;" />
                                    </RouterLink>
                                    <button v-if="nhanVien.trangThai === 1" @click="openConfirmModal(nhanVien)"
                                        title="Ngừng làm việc" class="no-hover-effect">
                                        <Trash style="color: #CC0000;" />
                                    </button>
                                    <button v-else @click="openBackToWorkModal(nhanVien)"
                                        class="btn btn-sm btn-back-to-work" title="Quay lại làm việc">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                                            viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                                            stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-rotate-ccw">
                                            <path d="M1 4v6h6" />
                                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                                        </svg>
                                    </button>
                                </div>
                            </td>
                            <td>
                                <label class="switch" title="Đổi vai trò">
                                    <input type="checkbox" :checked="nhanVien.tenVaiTro === 'ADMIN'"
                                        @change="event => handleToggleVaiTro(nhanVien, event)" />
                                    <span class="slider"></span>
                                </label>
                                <span class="ms-2">{{ nhanVien.tenVaiTro === 'ADMIN' ? 'Quản lý' : 'Nhân viên' }}</span>
                            </td>
                        </tr>
                        <tr v-else>
                            <td colspan="9" class="text-center py-4">Không tìm thấy kết quả nào.</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-4 d-flex align-items-center justify-content-center gap-2">
                <button class="btn custom-btn" @click="prevPage" :disabled="currentPage === 1">Trước</button>
                <input v-model.number="inputPage" @keyup.enter="goToPage(inputPage)" type="number" min="1"
                    :max="totalPages" class="form-control w-auto text-center" />
                <span>/ {{ totalPages }}</span>
                <button class="btn custom-btn" @click="nextPage" :disabled="currentPage >= totalPages">Tiếp</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref, inject, computed, watch } from 'vue'
import { Eye, Edit, Plus, Trash, EyeOff, Upload, FilterIcon } from 'lucide-vue-next';
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie'

const token = Cookies.get('token')
const toggleSidebar = inject('toggleSidebar')

const isExporting = ref(false);
const isImporting = ref(false);

const listNhanVien = ref([]);

const getData = async () => {
    try {
        const response = await axios.get('http://localhost:8080/api/home', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        listNhanVien.value = Array.isArray(response.data) ? response.data : [];
    } catch (error) {
        console.log(error);
    }
}

const showPassword = ref({});

const filterState = ref({
    trangThai: '',
    vaiTro: '',
    tinhThanh: '',
    search: ''
});

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

const route = useRoute();
const toast = useToast();
const router = useRouter();
const fileInput = ref(null);
const roles = ref([]);
const provinces = ref([]);

function getImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `http://localhost:8080${path}`;
}

function openConfirmModal(nhanVien) {
    Swal.fire({
        icon: 'warning',
        title: 'Xác nhận nhân viên ngừng làm việc?',
        html: `Hệ thống sẽ ghi nhận nhân viên <b>${nhanVien.tenNhanVien}</b> ngừng làm việc. Tuy nhiên, các dữ liệu của nhân viên này sẽ vẫn được giữ lại.`,
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Bỏ qua',
        reverseButtons: true,
        customClass: {
            confirmButton: 'swal2-confirm btn-save',
            cancelButton: 'swal2-cancel btn-cancel'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:8080/api/doiTrangThaiVe0/${nhanVien.id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                await getData();
                toast.success('Cập nhật trạng thái nhân viên thành công!');
            } catch (e) {
                toast.error('Có lỗi khi cập nhật trạng thái!');
            }
        }
    });
}

function openDeleteModal(nhanVien) {
    Swal.fire({
        icon: 'error',
        title: 'Xóa nhân viên',
        html: 'Hệ thống sẽ <b>xóa hoàn toàn</b> nhân viên này. Bạn có chắc chắn muốn xóa?',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Bỏ qua',
        reverseButtons: true,
        customClass: {
            confirmButton: 'swal2-confirm btn-save',
            cancelButton: 'swal2-cancel btn-cancel'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.delete(`http://localhost:8080/api/delete/${nhanVien.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                await getData();
                toast.success('Xóa nhân viên thành công!');
            } catch (e) {
                toast.error('Có lỗi khi xóa nhân viên!');
            }
        }
    });
}

function openBackToWorkModal(nhanVien) {
    Swal.fire({
        icon: 'question',
        title: 'Xác nhận nhân viên quay lại làm việc?',
        html: `Hệ thống sẽ ghi nhận nhân viên <b>${nhanVien.tenNhanVien}</b> quay lại làm việc.`,
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Bỏ qua',
        reverseButtons: true,
        customClass: {
            confirmButton: 'swal2-confirm btn-save',
            cancelButton: 'swal2-cancel btn-cancel'
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.put(`http://localhost:8080/api/doiTrangThaiVe1/${nhanVien.id}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                await getData();
                toast.success('Nhân viên đã quay lại làm việc!');
            } catch (e) {
                toast.error('Có lỗi khi cập nhật trạng thái!');
            }
        }
    });
}

const exportExcelFile = async () => {
    if (isExporting.value) return;
    isExporting.value = true;
    try {
        const response = await axios.get('http://localhost:8080/api/nhan-vien/export-excel', {
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        link.setAttribute('download', `DanhSachNhanVien_${timestamp}.xlsx`);

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        toast.success('Xuất file thành công!');
    } catch (error) {
        console.error("Lỗi khi xuất file Excel:", error);
        toast.error('Xuất file thất bại!');
    } finally {
        isExporting.value = false;
    }
};

const confirmExportExcel = async () => {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Xác nhận xuất Excel?',
        text: 'Bạn có chắc chắn muốn xuất danh sách nhân viên ra Excel không?',
        showCancelButton: true,
        confirmButtonText: 'Có, xuất ngay!',
        cancelButtonText: 'Hủy bỏ',
        reverseButtons: true,
        customClass: {
            confirmButton: 'swal2-confirm btn-save',
            cancelButton: 'swal2-cancel btn-cancel'
        }
    });
    if (result.isConfirmed) {
        await exportExcelFile();
    }
};

const filteredNhanVien = computed(() => {
    if (!Array.isArray(listNhanVien.value)) return [];
    let result = listNhanVien.value;

    const keyword = filterState.value.search?.trim().toLowerCase();
    if (keyword) {
        result = result.filter(nv =>
            nv.maNhanVien?.toLowerCase().includes(keyword) ||
            nv.tenNhanVien?.toLowerCase().includes(keyword) ||
            nv.sdt?.toLowerCase().includes(keyword) ||
            nv.email?.toLowerCase().includes(keyword)
        );
    }

    if (filterState.value.trangThai !== '') {
        result = result.filter(nv => String(nv.trangThai) === String(filterState.value.trangThai));
    }

    if (filterState.value.vaiTro) {
        result = result.filter(nv => nv.tenVaiTro === filterState.value.vaiTro);
    }

    if (filterState.value.tinhThanh) {
        result = result.filter(nv => nv.tinhThanh === filterState.value.tinhThanh);
    }

    result.sort((a, b) => {
        const getNumber = (ma) => parseInt(ma?.replace(/\D/g, '') || '0', 10);
        return getNumber(b.maNhanVien) - getNumber(a.maNhanVien);
    });
    return result;
});

const togglePasswordVisibility = (nhanVienId) => {
    showPassword.value[nhanVienId] = !showPassword.value[nhanVienId];
};

const maskPassword = (password) => {
    if (!password) return '';
    return '•'.repeat(password.length);
};

function fetchProvinces() {
    axios.get('http://provinces.open-api.vn/api/p/').then(res => {
        provinces.value = res.data;
    });
}

const currentPage = ref(1);
const pageSize = ref(5);
const inputPage = ref(1);

const totalPages = computed(() => Math.ceil(filteredNhanVien.value.length / pageSize.value));

const pagedNhanVien = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value;
    return filteredNhanVien.value.slice(start, start + pageSize.value);
});

function goToPage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
}

function prevPage() {
    if (currentPage.value > 1) {
        currentPage.value--;
    }
}

function nextPage() {
    if (currentPage.value < totalPages.value) {
        currentPage.value++;
    }
}

watch(filteredNhanVien, () => {
    currentPage.value = 1;
    inputPage.value = 1;
});
watch(currentPage, (newPage) => {
    inputPage.value = newPage;
});

onMounted(() => {
    getData();
    fetchProvinces();
    axios.get('http://localhost:8080/vai-tro/list-vai-Tro', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    }).then(res => {
        roles.value = res.data;
    });
    if (route.query.success === 'true') {
        toast.success('Thêm mới nhân viên thành công');
        window.history.replaceState({}, document.title, route.path);
    } else if (route.query.updated === 'true') {
        toast.success('Cập nhật nhân viên thành công');
        window.history.replaceState({}, document.title, route.path);
    }
})

let importOption = 'stop';

async function triggerFileInput() {
    importOption = 'stop';
    await Swal.fire({
        title: 'Nhập nhân viên từ File dữ liệu',
        html: `
            <div style='text-align:left;'>
                <div style='margin-bottom:16px;'><b>Xử lý khi gặp lỗi nhập file?</b></div>
                <div style='margin-bottom:12px;'>
                    <label style='display:flex;align-items:center;gap:8px;'>
                        <input type='radio' name='importOption' value='stop' checked style='accent-color:#1976d2;' /> Dừng nhập file
                    </label>
                    <label style='display:flex;align-items:center;gap:8px;margin-top:6px;'>
                        <input type='radio' name='importOption' value='continue' style='accent-color:#1976d2;' /> Bỏ qua và tiếp tục nhập file
                    </label>
                </div>
                <div style='margin-bottom:18px;color:#888;font-size:14px;'><b>Lưu ý:</b> Hệ thống cho phép nhập tối đa 500 nhân viên mỗi lần từ file.</div>
            </div>
        `,
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonText: 'Xác nhận nhập',
        denyButtonText: 'Tải file mẫu',
        cancelButtonText: 'Hủy',
        reverseButtons: true,
        customClass: {
            confirmButton: 'swal2-confirm btn-save',
            denyButton: 'swal2-deny btn-cancel',
            cancelButton: 'swal2-cancel btn-cancel'
        },
        didOpen: () => {
            const radios = Swal.getHtmlContainer().querySelectorAll('input[name="importOption"]');
            radios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    importOption = e.target.value;
                });
            });
        }
    }).then(async (result) => {
        if (result.isDenied) {
            const link = document.createElement('a');
            link.href = '/EmployeeTemplate.xlsx';
            link.download = 'fileMauDanhSachNhanVien.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (result.isConfirmed) {
            const checkedRadio = document.querySelector('input[name="importOption"]:checked');
            if (checkedRadio) importOption = checkedRadio.value;
            fileInput.value && fileInput.value.click();
        }
    });
}

async function handleFileChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    isImporting.value = true;
    const formData = new FormData();
    formData.append('file', file);
    try {
        const response = await axios.post(
            'http://localhost:8080/api/nhan-vien/import-excel',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${token}` } }
        );
        toast.success(response.data || 'Nhập dữ liệu thành công!');
        await getData();
    } catch (error) {
        if (error.response && Array.isArray(error.response.data)) {
            error.response.data.forEach(msg => toast.error(msg));
        } else if (error.response && error.response.data) {
            toast.error(error.response.data);
        } else {
            toast.error('Nhập file thất bại');
        }
    } finally {
        isImporting.value = false;
        event.target.value = '';
    }
}

async function handleToggleVaiTro(nhanVien, event) {
    const isAdmin = nhanVien.tenVaiTro === 'ADMIN';
    const confirmText = isAdmin
        ? 'Bạn có chắc chắn muốn chuyển Quản Lý này thành NHÂN VIÊN (không còn là quản lý)?'
        : 'Bạn có chắc chắn muốn chuyển Nhân Viên này thành QUẢN LÝ (ADMIN)?';
    const confirmTitle = isAdmin ? 'Xác nhận chuyển thành nhân viên' : 'Xác nhận chuyển thành quản lý';
    const result = await Swal.fire({
        icon: 'question',
        title: confirmTitle,
        text: confirmText,
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Bỏ qua',
        reverseButtons: true,
        customClass: {
            confirmButton: 'swal2-confirm btn-save',
            cancelButton: 'swal2-cancel btn-cancel'
        }
    });
    if (!result.isConfirmed) {
        if (event) event.target.checked = isAdmin;
        return;
    }
    try {
        await axios.put(`http://localhost:8080/api/doi-vai-tro/${nhanVien.id}`, {}, {
            headers: { Authorization: `Bearer ${token}` }
        });
        await getData();
        const updatedNV = listNhanVien.value.find(nv => nv.id === nhanVien.id);
        if (updatedNV) {
            if (updatedNV.tenVaiTro === 'ADMIN') {
                toast.success('Đã sửa vai trò thành quản lý');
            } else {
                toast.success('Đã sửa vai trò thành nhân viên');
            }
        }
    } catch (error) {
        toast.error(error.response?.data || 'Đổi vai trò thất bại!');
    }
}
</script>

<style scoped>
/* Existing styles */
.bg-white {
    background-color: #fff;
}

.rounded {
    border-radius: 0.5rem;
}

.p-3 {
    padding: 1rem !important;
}

.mb-4 {
    margin-bottom: 1.5rem !important;
}

.border {
    border: 1px solid #e0e0e0;
}

.d-flex {
    display: flex;
}

.align-items-center {
    align-items: center;
}

.justify-content-between {
    justify-content: space-between;
}

.fw-bold {
    font-weight: 700;
}

.mb-0 {
    margin-bottom: 0 !important;
}

.btn {
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-outline-primary {
    color: #0a2c57;
    border: 1px solid #0a2c57;
}

.btn-outline-primary:hover {
    background-color: #0a2c57;
    color: white;
}

.btn.success {
    background-color: #0a2c57;
    color: white;
}

.btn.success:hover {
    background-color: #072140;
}

.form-control {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #ccc;
    border-radius: 0.25rem;
}

.form-select {
    display: block;
    width: 100%;
    padding: 0.5rem 2.25rem 0.5rem 0.75rem;
    font-size: 1rem;
    line-height: 1.5;
    color: #495057;
    background-color: #fff;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 16px 12px;
    border: 1px solid #ced4da;
    border-radius: 0.25rem;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}

.employee-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
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

/* Toggle switch for role */
.switch {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 20px;
    vertical-align: middle;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    transition: .4s;
    border-radius: 20px;
}

.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
}

input:checked+.slider {
    background-color: #2196F3;
}

input:checked+.slider:before {
    transform: translateX(20px);
}

/* --- Thêm CSS mới --- */
.no-hover-effect {
    background-color: transparent !important;
    border: none !important;
    padding: 0;
    cursor: pointer;
}

.no-hover-effect:hover {
    background-color: transparent !important;
    border: none !important;
    color: #CC0000 !important;
}

.file-btn {
    background-color: transparent;
    border: none;
    color: #0a2c57;
}

.file-btn:hover {
    background-color: #0a2c57;
    color: white;
}

h2, h5 {
  font-weight: bold;
  color: #0a2c57;
}
</style>
```eof