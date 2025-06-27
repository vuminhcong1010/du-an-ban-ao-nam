<script setup>
import { onMounted, ref, inject, computed, watch } from 'vue'
import search from '@/assets/search.png'
import { Eye,Edit,Plus,Trash,Delete, Home, EyeOff } from 'lucide-vue-next';
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification';

const toggleSidebar = inject('toggleSidebar')

const listNhanVien = ref({
  id: "",
  maNhanVien: "",
  tenKhachHang: "",
  tenTaiKhoan: "",
  matKhau: "",
  anh: "",
  email: "",
  sdt: "",
  ngayTao: "",
  ngaySua: "",
  diaChi: "",
  gioiTinh: "",
  trangThai: "",
  idVaiTro: {
    id: ""
  }
});

const vaiTroList = ref([]);
const getData = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/home')
    listNhanVien.value = response.data;
    // console.log('NhanVien:', listNhanVien.value);
  } catch (error) {
    console.log(error);
  }
}
const getVaiTro = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/vai-tro');
    vaiTroList.value = response.data;
  } catch (error) {
    console.error("Lỗi khi load chức vụ:", error);
  }
}

const allColumns = [
  { key: 'anh', label: 'Ảnh' },
  { key: 'maNhanVien', label: 'Mã nhân viên' },
  { key: 'tenKhachHang', label: 'Tên nhân viên' },
  { key: 'tenTaiKhoan', label: 'Tên tài khoản' },
  { key: 'matKhau', label: 'Mật khẩu' },
  { key: 'email', label: 'Email' },
  { key: 'sdt', label: 'Số điện thoại' },
  { key: 'ngayTao', label: 'Ngày tạo' },
  { key: 'ngaySua', label: 'Ngày sửa' },
  { key: 'diaChi', label: 'Địa chỉ' },
  { key: 'gioiTinh', label: 'Giới tính' },
  { key: 'trangThai', label: 'Trạng thái' },
  { key: 'tenRole', label: 'Chức vụ' },
];
const visibleColumns = ref([
  'anh',
  'maNhanVien',
  'tenKhachHang',
  'ngayTao',
  'trangThai',
  'tenRole'
]);
const showColumnBox = ref(false);
const expandedRow = ref(null);
const showFilter = ref(false);
const filterHovered = ref(false);

// Filter states
const filterState = ref({
  trangThai: '1',
  vaiTro: '',
  ngayTao: '',
  ngaySua: '',
  search: ''
});

const showPassword = ref({}); // Track password visibility for each employee

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
const showAddRoleModal = ref(false);
const newRoleName = ref("");
const addRoleError = ref("");
const router = useRouter();
const showConfirmModal = ref(false);
const selectedNhanVien = ref(null);
const confirmMessage = ref("");
const confirmLoading = ref(false);
const showDeleteModal = ref(false);
const nhanVienToDelete = ref(null);
const statusUpdateMessage = ref('');
const showBackToWorkModal = ref(false);
const nhanVienBackToWork = ref(null);
const isExporting = ref(false);

function openAddRoleModal() {
  showAddRoleModal.value = true;
  newRoleName.value = "";
  addRoleError.value = "";
}
function closeAddRoleModal() {
  showAddRoleModal.value = false;
  newRoleName.value = "";
  addRoleError.value = "";
}
async function addVaiTro() {
  addRoleError.value = "";
  if (!newRoleName.value.trim()) {
    addRoleError.value = 'Vui lòng nhập tên chức vụ';
    toast.error('Vui lòng nhập tên chức vụ');
    return;
  }
  try {
    await axios.post('http://localhost:8080/api/addVaiTro', { tenRole: newRoleName.value });
    await getVaiTro();
    closeAddRoleModal();
    toast.success('Thêm chức vụ thành công!');
  } catch (e) {
    toast.error('Thêm chức vụ thất bại!');
  }
}

function openConfirmModal(nhanVien) {
  selectedNhanVien.value = nhanVien;
  confirmMessage.value = `Hệ thống sẽ ghi nhận nhân viên ${nhanVien.tenKhachHang} ngừng làm việc. Tuy nhiên, các dữ liệu của nhân viên này sẽ vẫn được giữ lại.`;
  showConfirmModal.value = true;
}
function closeConfirmModal() {
  showConfirmModal.value = false;
  selectedNhanVien.value = null;
  confirmMessage.value = "";
}
async function confirmDoiTrangThai() {
  if (!selectedNhanVien.value) return;
  confirmLoading.value = true;
  try {
    await axios.put(`http://localhost:8080/api/doiTrangThaiVe0/${selectedNhanVien.value.id}`);
    closeConfirmModal();
    await getData();
    toast.success('Cập nhật trạng thái nhân viên thành công!');
  } catch (e) {
    toast.error('Có lỗi khi cập nhật trạng thái!');
  } finally {
    confirmLoading.value = false;
  }
}

function openBackToWorkModal(nhanVien) {
  nhanVienBackToWork.value = nhanVien;
  showBackToWorkModal.value = true;
}
function closeBackToWorkModal() {
  showBackToWorkModal.value = false;
  nhanVienBackToWork.value = null;
}

async function confirmBackToWork() {
  if (!nhanVienBackToWork.value) return;
  try {
    await axios.put(`http://localhost:8080/api/doiTrangThaiVe1/${nhanVienBackToWork.value.id}`);
    closeBackToWorkModal();
    await getData();
    toast.success('Nhân viên đã quay lại làm việc!');
  } catch (e) {
    toast.error('Có lỗi khi cập nhật trạng thái!');
  }
}

function openDeleteModal(nhanVien) {
  nhanVienToDelete.value = nhanVien;
  showDeleteModal.value = true;
}
function closeDeleteModal() {
  showDeleteModal.value = false;
  nhanVienToDelete.value = null;
}

async function confirmDeleteNhanVien() {
  if (!nhanVienToDelete.value) return;
  try {
    await axios.delete(`http://localhost:8080/api/delete/${nhanVienToDelete.value.id}`);
    closeDeleteModal();
    await getData();
    toast.success('Xóa nhân viên thành công!');
  } catch (e) {
    toast.error('Có lỗi khi xóa nhân viên!');
  }
}

const exportExcelFile = async () => {
  if (isExporting.value) return;
  isExporting.value = true;
  try {
    const response = await axios.get('http://localhost:8080/api/nhan-vien/export-excel', {
      responseType: 'blob',
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

const filteredNhanVien = computed(() => {
  if (!Array.isArray(listNhanVien.value)) return [];
  // Lọc theo trạng thái trước
  let result = listNhanVien.value.filter(
    nv => String(nv.trangThai) === String(filterState.value.trangThai)
  );

  // Lọc theo chức vụ (theo tenRole)
  if (filterState.value.vaiTro && filterState.value.vaiTro !== '') {
    result = result.filter(
      nv => nv.tenRole && String(nv.tenRole) === String(filterState.value.vaiTro)
    );
  }

  // Lọc theo ngày tạo
  if (filterState.value.ngayTao) {
    result = result.filter(nv => {
      if (!nv.ngayTao) return false;
      return nv.ngayTao.slice(0, 10) === filterState.value.ngayTao;
    });
  }

  // Lọc theo ngày sửa
  if (filterState.value.ngaySua) {
    result = result.filter(nv => {
      if (!nv.ngaySua) return false;
      return nv.ngaySua.slice(0, 10) === filterState.value.ngaySua;
    });
  }

  // Sắp xếp theo ngày tạo và ngày sửa mới nhất lên đầu
  result.sort((a, b) => {
    // Ưu tiên theo ngày sửa trước (nếu có)
    if (a.ngaySua && b.ngaySua) {
      const dateA = new Date(a.ngaySua);
      const dateB = new Date(b.ngaySua);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateB.getTime() - dateA.getTime(); // Mới nhất lên đầu
      }
    }
    
    // Nếu ngày sửa bằng nhau hoặc không có, sắp xếp theo ngày tạo
    if (a.ngayTao && b.ngayTao) {
      const dateA = new Date(a.ngayTao);
      const dateB = new Date(b.ngayTao);
      return dateB.getTime() - dateA.getTime(); // Mới nhất lên đầu
    }
    
    // Nếu không có ngày, giữ nguyên thứ tự
    return 0;
  });

  return result;
});
// Thêm hàm searchNhanVien
const searchNhanVien = async (keyword) => {
  try {
    if (!keyword) {
      await getData(); // Nếu không có từ khóa thì load lại toàn bộ
      return;
    }
    const response = await axios.get(`http://localhost:8080/api/search?keyword=${encodeURIComponent(keyword)}`);
    listNhanVien.value = response.data;
  } catch (error) {
    console.log('Lỗi tìm kiếm:', error);
  }
};

// Theo dõi filterState.search, debounce 300ms
let searchTimeout = null;
watch(() => filterState.value.search, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchNhanVien(newVal);
  }, 300);
});

// Function to toggle password visibility
const togglePasswordVisibility = (nhanVienId) => {
  showPassword.value[nhanVienId] = !showPassword.value[nhanVienId];
};

// Function to mask password
const maskPassword = (password) => {
  if (!password) return '';
  return '•'.repeat(password.length);
};

onMounted(() => {
  getData();
  getVaiTro();
  if (route.query.success === 'true') {
    toast.success('Thêm mới nhân viên thành công');
    window.history.replaceState({}, document.title, route.path);
  } else if (route.query.updated === 'true') {
    toast.success('Cập nhật nhân viên thành công');
    window.history.replaceState({}, document.title, route.path);
  }
})
</script>

<template>
  <div class="nhanvien-page-wrapper">
    <div class="nhanvien-header bg-white p-3 rounded shadow mb-4"
         style="display: flex; align-items: center; justify-content: flex-start; box-shadow: 0 5px 10px #d1cac0; border-radius: 12px; padding: 6px 16px !important; position: relative; gap: 16px;">
      <div>
        <h2 style="margin: 0; font-size: 18px !important;">Quản Lý nhân viên</h2>
      </div>
      <div style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
        <router-link to="/nhan-vien/them" class="nv-btn"><span style="font-size: 15px !important;">+</span> Nhân viên</router-link>
        <button class="nv-btn"><span style="font-size: 15px !important;">⭳</span> Nhập file</button>
        <button class="nv-btn" @click="exportExcelFile" :disabled="isExporting">
          <span v-if="isExporting" class="spinner"></span>
          <span v-else style="font-size: 15px !important;">⭱</span>
          {{ isExporting ? 'Đang xuất...' : 'Xuất file' }}
        </button>
      </div>
    </div>
    <div class="filter-bar bg-white p-3 rounded shadow mb-4">
      <div class="filter-title">
        <span class="filter-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-filter"><polygon points="22 3 2 3 10 13 10 19 14 19 14 13 22 3"></polygon></svg>
        </span>
        <span class="filter-label">Bộ lọc</span>
      </div>
      <div class="filter-fields" style="display: flex; flex-wrap: nowrap; gap: 16px; align-items: flex-end;">
        <div class="filter-search-wrapper" style="min-width: 200px; max-width: 220px; flex: 1 1 200px; position: relative;">
          <img :src="search" alt="search" class="filter-search-icon" />
          <input
            class="filter-search"
            type="text"
            placeholder="Tìm theo mã, tên nhân viên"
            v-model="filterState.search"
          />
        </div>
        <div class="filter-section" style="min-width: 120px; max-width: 150px; flex: 1 1 120px;">
          <label>Trạng thái</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="1" v-model="filterState.trangThai" />
              Đang làm việc
            </label>
            <label class="radio-label">
              <input type="radio" value="0" v-model="filterState.trangThai" />
              Đã nghỉ
            </label>
          </div>
        </div>
        <div class="filter-section filter-section-role" style="min-width: 120px; max-width: 150px; flex: 1 1 120px;">
          <div class="label-row">
            <label>Chức vụ</label>
            <button class="btn-add-role" title="Thêm chức vụ" @click="openAddRoleModal"><span>+</span></button>
          </div>
          <select v-model="filterState.vaiTro">
            <option value="">Tất cả</option>
            <option v-for="vaiTro in vaiTroList" :key="vaiTro.id" :value="vaiTro.tenRole">
              {{ vaiTro.tenRole }}
            </option>
          </select>
        </div> 
        <div class="filter-section" style="min-width: 120px; max-width: 150px; flex: 1 1 120px;">
          <label>Ngày tạo</label>
          <input type="date" v-model="filterState.ngayTao">
        </div>
        <div class="filter-section" style="min-width: 120px; max-width: 150px; flex: 1 1 120px;">
          <label>Ngày sửa</label>
          <input type="date" v-model="filterState.ngaySua">
        </div>
      </div>
    </div>
    <div class="table-wrapper bg-white p-3 rounded shadow mb-4">
      <div style="margin-bottom: 10px; display: flex; align-items: center;">
        <button class="column-toggle-btn column-toggle-align" @click="showColumnBox = !showColumnBox">
          <span style="font-size: 20px;">≡</span>
        </button>
        <span style="font-size: 18px !important; font-weight: 600; color: #212529;">Danh sách nhân viên</span>
        <div v-if="showColumnBox" class="column-select-box">
          <div v-for="col in allColumns" :key="col.key" style="margin-bottom: 6px;">
            <input type="checkbox" :id="col.key" v-model="visibleColumns" :value="col.key" />
            <label :for="col.key">{{ col.label }}</label>
          </div>
        </div>
      </div>
      <div class="table-container">
        <table class="employee-table">
          <thead>
            <tr>
              <th>STT</th>
              <th v-for="col in allColumns.filter(c => visibleColumns.includes(c.key))" :key="col.key">{{ col.label }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="filteredNhanVien.length">
              <template v-for="(nhanVien, index) in filteredNhanVien" :key="nhanVien.id">
                <tr
                  @click="expandedRow = expandedRow === nhanVien.id ? null : nhanVien.id"
                  :class="{ 'row-selected': expandedRow === nhanVien.id }"
                  style="cursor: pointer;"
                >
                  <td>{{ index + 1 }}</td>
                  <td v-for="col in allColumns.filter(c => visibleColumns.includes(c.key))" :key="col.key">
                    <template v-if="col.key === 'anh'">
                      <img v-if="nhanVien.anh" :src="nhanVien.anh" style="width: 40px; height: 40px; object-fit: cover; background: #eee;">
                    </template>
                    <template v-else-if="col.key === 'matKhau'">
                      {{ maskPassword(nhanVien.matKhau) }}
                    </template>
                    <template v-else-if="col.key === 'gioiTinh'">
                      {{ nhanVien.gioiTinh ? 'Nam' : 'Nữ' }}
                    </template>
                    <template v-else-if="col.key === 'trangThai'">
                      <span :class="['status-badge', nhanVien.trangThai == 1 ? 'active' : 'inactive']">
                        {{ nhanVien.trangThai == 1 ? 'Đang làm việc' : 'Đã nghỉ' }}
                      </span>
                    </template>
                    <template v-else-if="col.key === 'ngayTao' || col.key === 'ngaySua'">
                      {{ formatDate(nhanVien[col.key]) }}
                    </template>
                    <template v-else>
                      {{ nhanVien[col.key] }}
                    </template>
                  </td>
                </tr>
                <tr v-if="expandedRow === nhanVien.id">
                  <td :colspan="visibleColumns.length + 2">
                    <div class="employee-detail-expand detail-2col">
                      <!-- Ảnh bên trái -->
                      <div style="min-width: 140px; max-width: 180px;">
                        <img v-if="nhanVien.anh" :src="nhanVien.anh" style="width: 100%; max-width: 160px; height: auto; object-fit: cover; border-radius: 8px; border: 1px solid #eee;">
                      </div>
                      <!-- Thông tin bên phải, chia 2 cột -->
                      <div class="detail-fields">
                        <div v-for="(col, i) in allColumns.filter(c => c.key !== 'anh')" :key="col.key" class="detail-field">
                          <template v-if="col.key === 'matKhau'">
                            <div class="password-flex-row">
                              <b class="detail-label" style="margin-right: 6px;">{{ col.label }}:</b>
                              <span class="password-value">{{ showPassword[nhanVien.id] ? nhanVien.matKhau : maskPassword(nhanVien.matKhau) }}</span>
                              <button
                                @click.stop="togglePasswordVisibility(nhanVien.id)"
                                class="password-toggle-btn"
                                :title="showPassword[nhanVien.id] ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'"
                              >
                                <Eye v-if="!showPassword[nhanVien.id]" size="16" />
                                <EyeOff v-else size="16" />
                              </button>
                            </div>
                          </template>
                          <template v-else-if="col.key === 'gioiTinh'">
                            <b class="detail-label">{{ col.label }}:</b> {{ nhanVien.gioiTinh ? 'Nam' : 'Nữ' }}
                          </template>
                          <template v-else-if="col.key === 'trangThai'">
                            <b class="detail-label">{{ col.label }}:</b>
                            <span :class="['status-badge', nhanVien.trangThai == 1 ? 'active' : 'inactive']">
                              {{ nhanVien.trangThai == 1 ? 'Đang làm việc' : 'Đã nghỉ' }}
                            </span>
                          </template>
                          <template v-else-if="col.key === 'ngayTao' || col.key === 'ngaySua'">
                            <b class="detail-label">{{ col.label }}:</b> {{ formatDate(nhanVien[col.key]) }}
                          </template>
                          <template v-else>
                            <b class="detail-label">{{ col.label }}:</b> {{ nhanVien[col.key] }}
                          </template>
                        </div>
                      </div>
                      <!-- Nút thao tác -->
                      <div class="employee-detail-actions detail-actions-abs">
                        <template v-if="nhanVien.trangThai == 1">
                          <button class="action-btn edit" title="Sửa" @click="router.push(`/nhan-vien/sua/${nhanVien.id}`)"><Edit /></button>
                          <button class="action-btn delete" title="Ngừng làm việc" @click="openConfirmModal(nhanVien)"><Trash /></button>
                        </template>
                        <template v-else>
                          <div class="info-footer-btns">
                            <button class="icon-btn" title="Quay Lại làm việc" @click="openBackToWorkModal(nhanVien)">
                              <svg class="icon-green" width="22" height="22" fill="none" stroke="#22b34c" stroke-width="2" viewBox="0 0 24 24"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
                            </button>
                            <button class="icon-btn" title="Xóa Nhân Viên" @click="openDeleteModal(nhanVien)">
                              <svg class="icon-red" width="22" height="22" fill="none" stroke="#e53935" stroke-width="2" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>
                            </button>
                          </div>
                        </template>
                      </div>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-else>
              <td :colspan="visibleColumns.length + 1" style="text-align:center; padding: 40px 0; color: #8a99a8; font-size: 18px; background: #fafbfc;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                  <svg width="48" height="48" fill="none" stroke="#8a99a8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M16 16a4 4 0 0 0-8 0"/></svg>
                  <div>Không tìm thấy kết quả nào phù hợp</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <!-- Modal thêm chức vụ -->
    <div v-if="showAddRoleModal" class="modal-overlay">
      <div class="modal-add-role">
        <div class="modal-header">
          <span>Thêm mới chức vụ</span>
          <button class="modal-close" @click="closeAddRoleModal">&times;</button>
        </div>
        <div class="modal-body">
          <label for="roleName">Tên chức vụ</label>
          <input id="roleName" v-model="newRoleName" type="text" placeholder="Nhập tên chức vụ" />
          <span v-if="addRoleError" class="error-msg">{{ addRoleError }}</span>
        </div>
        <div class="modal-actions">
          <button class="btn-save" @click="addVaiTro"><span style="margin-right:6px">💾</span>Lưu</button>
          <button class="btn-cancel" @click="closeAddRoleModal"><span style="margin-right:6px">🚫</span>Bỏ qua</button>
        </div>
      </div>
    </div>
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-add-role" style="min-width:400px;max-width:95vw;">
        <div class="modal-header">
          <span><b>Xác nhận nhân viên ngừng làm việc?</b></span>
          <button class="modal-close" @click="closeConfirmModal">&times;</button>
        </div>
        <div class="modal-body">
          <div>
            Hệ thống sẽ ghi nhận nhân viên <b>{{ selectedNhanVien?.tenKhachHang }}</b> ngừng làm việc. Tuy nhiên, các dữ liệu của nhân viên này sẽ vẫn được giữ lại.
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-save" :disabled="confirmLoading" @click="confirmDoiTrangThai"><span style="margin-right:6px">✔</span>Đồng ý</button>
          <button class="btn-cancel" :disabled="confirmLoading" @click="closeConfirmModal"><span style="margin-right:6px">🚫</span>Bỏ qua</button>
        </div>
      </div>
    </div>
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal-add-role" style="min-width:400px;max-width:95vw;">
        <div class="modal-header">
          <span><b>Xóa nhân viên</b></span>
          <button class="modal-close" @click="closeDeleteModal">&times;</button>
        </div>
        <div class="modal-body">
          <div>
            Hệ thống sẽ <b>xóa hoàn toàn</b> nhân viên này. Bạn có chắc chắn muốn xóa?
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-save" @click="confirmDeleteNhanVien"><span style="margin-right:6px">✔</span>Đồng ý</button>
          <button class="btn-cancel" @click="closeDeleteModal"><span style="margin-right:6px">🚫</span>Bỏ qua</button>
        </div>
      </div>
    </div>
    <div v-if="showBackToWorkModal" class="modal-overlay">
      <div class="modal-add-role" style="min-width:400px;max-width:95vw;">
        <div class="modal-header">
          <span><b>Xác nhận nhân viên quay lại làm việc?</b></span>
          <button class="modal-close" @click="closeBackToWorkModal">&times;</button>
        </div>
        <div class="modal-body">
          <div>
            Hệ thống sẽ ghi nhận nhân viên <b>{{ nhanVienBackToWork?.tenKhachHang }}</b> quay lại làm việc.
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-save" @click="confirmBackToWork"><span style="margin-right:6px">✔</span>Đồng ý</button>
          <button class="btn-cancel" @click="closeBackToWorkModal"><span style="margin-right:6px">🚫</span>Bỏ qua</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nhanvien-page-wrapper {
  max-width: 1200px;
  margin-left: 0;
  margin-right: auto;
  width: 100%;
}
.nv-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 20px;
  border-radius: 10px;
  border: none;
  background: #0a2a5c;
  cursor: pointer;
  font-weight: 600;
  color: #fff;
  font-size: 15px;
  transition: all 0.18s cubic-bezier(.4,0,.2,1);
  text-decoration: none;
  user-select: none;
  caret-color: transparent;
  box-shadow: 0 2px 8px #0a2a5c11;
}
.nv-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #e3eafc;
}
.nv-btn:hover {
  background: #143d6d;
  color: #fff;
  box-shadow: 0 4px 16px #0a2a5c22;
}
.nv-btn span {
  font-size: 18px !important;
  font-weight: bold;
  margin-right: 4px;
}
.column-toggle-btn.column-toggle-align {
  height: 32px;
  min-width: 32px;
  max-width: 40px;
  margin-right: 10px;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #d1cac0;
  background: #fff;
  color: #212529;
  border-radius: 8px;
  transition: all 0.18s cubic-bezier(.4,0,.2,1);
}
.column-toggle-btn.column-toggle-align:hover {
  background: #e3f2fd;
  border-color: #339cf1;
  color: #1976d2;
}
.nhanvien-header {
  margin-top: -20px;
}
.nhanvien-header input {
  border: 1.5px solid #ddd !important;
  box-shadow: none;
  outline: none;
  background: #fff;
  transition: border 0.18s;
}
.nhanvien-header input:focus {
  border: 1.5px solid #339cf1 !important;
  box-shadow: 0 0 0 2px #e3eafc;
  outline: none;
  background: #fff;
}


.table-container {
  overflow-x: auto;
}

.employee-table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

.employee-table th {
  background-color: #eaeaea;
  padding: 10px 10px;
  font-weight: bold;
  color: #111;
  font-size: 14px;
  white-space: nowrap;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
}


.employee-table tbody tr:hover {
  background-color: #f8f9fa;
}

.employee-table td {
  padding: 5px 5px;
  border-bottom: 1px solid #eee;
  font-size: 13px;
  text-align: center;
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

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}
.action-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  padding: 0;
  transition: background 0.15s;
}
.action-btn.view {
  color: #1a237e;
}
.action-btn.edit {
  color: #4eeaaf;
}
.action-btn.delete {
  color: #e53935;
}
.action-btn:hover {
  background: #f5f5f5;
  border-radius: 4px;
}
.table-wrapper {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 5px 10px #d1cac0;
  padding: 16px 12px;
  margin-top: 18px;
}
.column-select-box {
  position: absolute;
  right: 0;
  top: 48px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 16px #0001;
  padding: 16px 20px;
  z-index: 100;
  min-width: 220px;
}
.employee-detail-expand {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px #0001;
  padding: 24px 32px;
  margin: 8px 0;
  animation: fadeIn 0.2s;
  border: 1.5px solid #609bbb;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px);}
  to { opacity: 1; transform: none;}
}
.employee-detail-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}
.row-selected {
  background: #e3f2fd !important;
}
.detail-2col {
  position: relative;
  display: flex;
  gap: 32px;
  align-items: flex-start;
}
.detail-fields {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 32px;
  text-align: left;
}
.detail-field {
  min-width: 180px;
  margin-bottom: 8px;
  text-align: left;
}
.detail-actions-abs {
  position: absolute;
  right: 24px;
  bottom: 24px;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.filter-toggle-bar {
  position: absolute;
  left: 50%;
  top: 100%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  z-index: 30;
}
.filter-arrow-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #d1cac0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px #0001;
  cursor: pointer;
  transition: box-shadow 0.18s, border 0.18s;
  outline: none;
  padding: 0;
}
.filter-arrow-btn:hover {
  box-shadow: 0 4px 16px #0002;
  border-color: #339cf1;
}
.arrow-icon {
  font-size: 18px;
  color: #222;
  font-weight: bold;
}
.filter-toggle-label {
  background: #182952;
  color: #fff;
  border-radius: 6px;
  padding: 7px 18px;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 8px #0001;
  cursor: pointer;
  transition: background 0.2s;
}
.filter-toggle-label:hover {
  background: #29407a;
}
.filter-bar {
  display: block;
  width: 100%;
}
.filter-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-weight: bold;
  font-size: 20px;
  margin-bottom: 16px;
  width: 100%;
}
.filter-icon {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
}
.filter-label {
  display: inline-block;
  vertical-align: middle;
}
.filter-fields {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: flex-start;
  margin-top: 0;
}
.filter-fields filter-fields-row {
  flex-wrap: nowrap !important;
  gap: 12px !important;
}
.filter-search-wrapper filter-search-inline {
  min-width: 180px;
  max-width: 220px;
  flex: 1 1 180px;
}
.filter-section {
  min-width: 120px !important;
  max-width: 180px !important;
  flex: 1 1 120px !important;
}
.filter-section label {
  font-size: 13px;
  color: #222;
  margin-bottom: 4px;
  font-weight: 500;
}
.filter-section select,
.filter-section input {
  width: 100%;
  padding: 7px 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
}
.label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}
.btn-add-role {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  border: 1.2px solid #d1cac0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  color: #222;
  cursor: pointer;
  transition: border 0.18s, box-shadow 0.18s;
  margin-left: 8px;
  outline: none;
  padding: 0;
}
.btn-add-role:hover {
  border-color: #339cf1;
  box-shadow: 0 2px 8px #339cf122;
  color: #339cf1;
}
.filter-search-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  opacity: 0.6;
  pointer-events: none;
}
.filter-search {
  padding-left: 36px;
  width: 100%;
  padding: 7px 12px 7px 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 400;
}
.radio-group {
  display: flex;
  gap: 24px;
  align-items: center;
  margin-top: 2px;
}
.radio-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 15px;
  font-weight: 400;
  cursor: pointer;
}
.radio-label input[type="radio"] {
  accent-color: #1976d2;
  width: 18px;
  height: 18px;
}
*:not(input):not(textarea):not(select) {
  caret-color: transparent !important;
}
.modal-overlay {
  position: fixed;
  top: -450px; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.25);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-add-role {
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 8px 32px #0002;
  min-width: 350px;
  max-width: 95vw;
  padding: 28px 32px 22px 32px;
  position: relative;
  animation: fadeIn 0.2s;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 18px;
}
.modal-close {
  background: none;
  border: none;
  font-size: 26px;
  color: #888;
  cursor: pointer;
  margin-left: 12px;
}
.modal-body {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}
.modal-body label {
  font-size: 15px;
  font-weight: 500;
  color: #222;
}
.modal-body input {
  padding: 8px 12px;
  border: 1.5px solid #ddd;
  border-radius: 8px;
  font-size: 15px;
  margin-top: 2px;
}
.modal-actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}
.btn-save {
  background: #22b34c;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.18s;
}
.btn-save:hover {
  background: #17913b;
}
.btn-cancel {
  background: #6c757d;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 24px;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background 0.18s;
}
.btn-cancel:hover {
  background: #495057;
}
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.nv-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.password-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle-btn:hover {
  background: #f0f0f0;
  color: #333;
}

.password-toggle-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #e3eafc;
}

.file-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 20px;
  border-radius: 10px;
  border: 1.5px solid #1976d2;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #1976d2;
  font-size: 15px;
  transition: all 0.18s cubic-bezier(.4,0,.2,1);
  text-decoration: none;
  user-select: none;
  caret-color: transparent;
  box-shadow: 0 2px 8px #0a2a5c11;
}
.file-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px #e3eafc;
}
.file-btn:hover {
  background: #e3f2fd;
  border-color: #339cf1;
  color: #0a2a5c;
  box-shadow: 0 4px 16px #0a2a5c22;
}
.btn-small-action {
  min-width: 110px;
  font-size: 14px;
  font-weight: 500;
  padding: 7px 14px;
  border-radius: 6px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  transition: background 0.18s, box-shadow 0.18s;
  box-shadow: 0 1px 4px #0001;
}
.btn-green {
  background: #22b34c;
  color: #fff;
}
.btn-green:hover {
  background: #17913b;
}
.btn-red {
  background: #e53935;
  color: #fff;
}
.btn-red:hover {
  background: #b71c1c;
}
.icon-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: transparent;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.18s;
  font-size: 20px;
}
.icon-btn:focus {
  outline: none;
}
.icon-btn:hover {
  background: #f0f0f0;
}
.icon-btn .icon-red {
  color: #e53935;
}
.icon-btn .icon-green {
  color: #22b34c;
}
.info-footer-btns {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}
.password-flex-row {
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  text-align: left;
}
.password-value {
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
}
.detail-label {
  display: inline-block;
  min-width: 120px;
  font-weight: bold;
  text-align: left;
}
</style>


