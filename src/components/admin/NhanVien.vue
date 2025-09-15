<script setup>
import { onMounted, ref, inject, computed, watch } from 'vue'
import search from '@/assets/search.png'
import { Eye, Edit, Plus, Trash, Delete, Home, EyeOff } from 'lucide-vue-next';
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
    // console.log('NhanVien:', listNhanVien.value);
  } catch (error) {
    console.log(error);
  }
}

const allColumns = [
  { key: 'anh', label: 'Ảnh' },
  { key: 'maNhanVien', label: 'Mã nhân viên' },
  { key: 'tenNhanVien', label: 'Tên nhân viên' },
  { key: 'cccd', label: 'CCCD' },
  { key: 'ngaySinh', label: 'Ngày sinh' },
  { key: 'sdt', label: 'Số điện thoại' },
  { key: 'gioiTinh', label: 'Giới tính' },
  { key: 'vaiTro', label: 'Vai trò' },
  { key: 'diaChi', label: 'Địa chỉ' }, // Thêm dòng này
  { key: 'email', label: 'Email' },
  { key: 'ghiChu', label: 'Ghi chú' },
  { key: 'trangThai', label: 'Trạng thái' },
];
const visibleColumns = ref([
  'anh',
  'maNhanVien',
  'tenNhanVien',
  'sdt',
  'diaChi',
  'email',
  'trangThai',
]);
const showColumnBox = ref(false);
const showFilter = ref(false);
const filterHovered = ref(false);

// Filter states
const filterState = ref({
  trangThai: '1',
  vaiTro: '', // vai trò
  tinhThanh: '', // tỉnh thành
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
const router = useRouter();
const showAddressModal = ref(false);
const addressNhanVien = ref(null);
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvince = ref(null);
const selectedDistrict = ref(null);
const selectedWard = ref(null);
const fileInput = ref(null);
const roles = ref([]); // Danh sách vai trò

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

  // Nếu có từ khóa tìm kiếm, KHÔNG lọc trạng thái nữa (vì API đã trả về đúng rồi)
  if (!filterState.value.search) {
    result = result.filter(
      nv => String(nv.trangThai) === String(filterState.value.trangThai)
    );
  }

  // Lọc theo tên vai trò
  if (filterState.value.vaiTro) {
    result = result.filter(nv => nv.tenVaiTro === filterState.value.vaiTro);
  }

  // Lọc theo tỉnh thành
  if (filterState.value.tinhThanh) {
    result = result.filter(nv => nv.tinhThanh === filterState.value.tinhThanh);
  }

  // Nếu có từ khóa tìm kiếm, không cần filter FE nữa (API đã trả về đúng)
  if (!filterState.value.search) {
    // FE filter theo tên/mã nếu không dùng API search
    const keyword = filterState.value.search.trim().toLowerCase();
    if (keyword) {
      if (/^\d{4}$/.test(keyword)) {
        result = result.filter(nv => {
          if (!nv.ngaySinh) return false;
          const year = new Date(nv.ngaySinh).getFullYear();
          return String(year) === keyword;
        });
      } else {
        result = result.filter(nv =>
          nv.maNhanVien?.toLowerCase().includes(keyword) ||
          nv.tenNhanVien?.toLowerCase().includes(keyword)
        );
      }
    }
  }

  // Sắp xếp theo mã nhân viên giảm dần
  result.sort((a, b) => {
    const getNumber = (ma) => parseInt(ma?.replace(/\D/g, '') || '0', 10);
    return getNumber(b.maNhanVien) - getNumber(a.maNhanVien);
  });

  return result;
});
// Thêm hàm searchNhanVien
const searchNhanVien = async (keyword) => {
  try {
    const trimmedKeyword = keyword?.trim();

    if (!trimmedKeyword) {
      await getData();
      return;
    }

    const response = await axios.get(`http://localhost:8080/api/search?keyword=${encodeURIComponent(trimmedKeyword)}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const filtered = (Array.isArray(response.data) ? response.data : []).filter(
      nv => String(nv.trangThai) === String(filterState.value.trangThai)
    );

    listNhanVien.value = filtered;

  } catch (error) {
    console.log('Lỗi tìm kiếm:', error);
    listNhanVien.value = [];
  }
};


// Theo dõi filterState.search, debounce 300ms
let searchTimeout = null;
watch(() => filterState.value.search, (newVal) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    searchNhanVien(newVal);
  }, 30);
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

function fetchProvinces() {
  axios.get('http://provinces.open-api.vn/api/p/').then(res => {
    provinces.value = res.data;
  });
}

function fetchDistricts(provinceCode) {
  if (!provinceCode) { districts.value = []; return; }
  axios.get(`http://provinces.open-api.vn/api/p/${provinceCode}?depth=2`).then(res => {
    districts.value = res.data.districts;
  });
}

function fetchWards(districtCode) {
  if (!districtCode) { wards.value = []; return; }
  axios.get(`http://provinces.open-api.vn/api/d/${districtCode}?depth=2`).then(res => {
    wards.value = res.data.wards;
  });
}

function openAddressModal(nhanVien) {
  addressNhanVien.value = nhanVien;
  showAddressModal.value = true;
  fetchProvinces();
  // Tìm code tỉnh, quận, xã theo tên hiện tại
  selectedProvince.value = '';
  selectedDistrict.value = '';
  selectedWard.value = '';
  // Tìm code tỉnh
  axios.get('http://provinces.open-api.vn/api/p/').then(res => {
    const province = res.data.find(p => p.name === nhanVien.tinhThanh);
    if (province) {
      selectedProvince.value = province.code;
      fetchDistricts(province.code);
      // Tìm code quận
      axios.get(`http://provinces.open-api.vn/api/p/${province.code}?depth=2`).then(res2 => {
        const district = res2.data.districts.find(d => d.name === nhanVien.quanHuyen);
        if (district) {
          selectedDistrict.value = district.code;
          fetchWards(district.code);
          // Tìm code xã
          axios.get(`http://provinces.open-api.vn/api/d/${district.code}?depth=2`).then(res3 => {
            const ward = res3.data.wards.find(w => w.name === nhanVien.xaPhuong);
            if (ward) {
              selectedWard.value = ward.code;
            }
          });
        }
      });
    }
  });
}

watch(selectedProvince, (newVal) => {
  fetchDistricts(newVal);
  selectedDistrict.value = '';
  wards.value = [];
  selectedWard.value = '';
});

watch(selectedDistrict, (newVal) => {
  fetchWards(newVal);
  selectedWard.value = '';
});

function saveAddress() {
  // Cập nhật lại địa chỉ cho nhân viên (gọi API backend nếu cần)
  const provinceName = provinces.value.find(p => p.code == selectedProvince.value)?.name || '';
  const districtName = districts.value.find(d => d.code == selectedDistrict.value)?.name || '';
  const wardName = wards.value.find(w => w.code == selectedWard.value)?.name || '';
  addressNhanVien.value.tinhThanh = provinceName;
  addressNhanVien.value.quanHuyen = districtName;
  addressNhanVien.value.xaPhuong = wardName;
  // Nếu cần gọi API backend để lưu, thêm đoạn này:
  // axios.put(`http://localhost:8080/api/update/${addressNhanVien.value.id}`, { ...addressNhanVien.value })
  showAddressModal.value = false;
}

const currentPage = ref(1);
const pageSize = ref(5);
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
watch(filteredNhanVien, () => { currentPage.value = 1; });

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
      // Lấy lại giá trị radio tại thời điểm xác nhận
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
    // Nếu lỗi là mảng (backend trả về danh sách lỗi từng dòng)
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

// Sửa hàm handleToggleVaiTro để xác nhận trước khi đổi vai trò
async function handleToggleVaiTro(nhanVien, event) {
  // Xác định vai trò hiện tại
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
    // Nếu không xác nhận, ngăn chuyển đổi trạng thái của switch
    if (event) event.target.checked = isAdmin; // đảo lại trạng thái
    return;
  }
  try {
    await axios.put(`http://localhost:8080/api/doi-vai-tro/${nhanVien.id}`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    await getData();
    const updatedNV = Array.isArray(listNhanVien.value)
      ? listNhanVien.value.find(nv => nv.id === nhanVien.id)
      : null;
    if (updatedNV && updatedNV.tenVaiTro) {
      if (updatedNV.tenVaiTro === 'ADMIN') {
        toast.success('Đã sửa vai trò thành quản lý');
      } else if (updatedNV.tenVaiTro === 'STAFF') {
        toast.success('Đã sửa vai trò thành nhân viên');
      }
    }
  } catch (error) {
    toast.error(error.response?.data || 'Đổi vai trò thất bại!');
  }
}
</script>

<template>
  <div class="nhanvien-page-wrapper">
    <div class="nhanvien-header bg-white p-3 rounded shadow mb-4"
      style="display: flex; align-items: center; justify-content: flex-start; box-shadow: 0 5px 10px #d1cac0; border-radius: 12px; padding: 6px 16px !important; position: relative; gap: 16px;">
      <div>
        <h2 style="margin: 0; font-size: 20px !important; font-weight: bold;">Quản Lý nhân viên</h2>
      </div>
      <div style="margin-left: auto; display: flex; gap: 8px; align-items: center;">
        <router-link to="/nhan-vien/them" class="nv-btn" title="Thêm nhân viên mới"><span
            style="font-size: 15px !important;">+</span> Nhân viên</router-link>
        <button class="nv-btn" @click="triggerFileInput" :disabled="isImporting" title="Nhập dữ liệu từ file Excel">
          <span v-if="isImporting" class="spinner"></span>
          <span v-else style="font-size: 15px !important;">⭳</span>
          {{ isImporting ? 'Đang nhập...' : 'Nhập file' }}
        </button>
        <input ref="fileInput" type="file" accept=".xlsx,.xls" style="display: none" @change="handleFileChange" />
        <button class="nv-btn" @click="confirmExportExcel" :disabled="isExporting"
          title="Xuất danh sách nhân viên ra file Excel">
          <span v-if="isExporting" class="spinner"></span>
          <span v-else style="font-size: 15px !important;">⭱</span>
          {{ isExporting ? 'Đang xuất...' : 'Xuất file' }}
        </button>
      </div>
    </div>
    <div class="filter-bar bg-white p-3 rounded shadow mb-4">
      <!-- Title -->
      <div class="filter-title mb-3">
        <span class="filter-icon">
          <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" class="feather feather-filter">
            <polygon points="22 3 2 3 10 13 10 19 14 19 14 13 22 3"></polygon>
          </svg>
        </span>
        <span class="filter-label">Bộ lọc</span>
      </div>

      <!-- Row 1: Tìm kiếm -->
      <div class="filter-fields filter-fields-row mb-3">
        <div class="filter-item">
          <label>Tìm kiếm</label>
          <div class="filter-search-wrapper">
            <img :src="search" alt="search" class="filter-search-icon" />
            <input class="filter-search" type="text" placeholder="Tìm theo mã, tên nhân viên"
              v-model="filterState.search" title="Tìm kiếm theo mã, tên nhân viên" />
          </div>
        </div>
      </div>

      <!-- Row 2: Trạng thái, Vai trò, Tỉnh/Thành -->
      <div class="filter-fields filter-fields-row">
        <!-- Trạng thái -->
        <div class="filter-item">
          <label>Trạng thái</label>
          <div class="radio-group">
            <label class="radio-label">
              <input type="radio" value="1" v-model="filterState.trangThai" title="Lọc nhân viên đang làm việc" />
              Đang làm việc
            </label>
            <label class="radio-label">
              <input type="radio" value="0" v-model="filterState.trangThai" title="Lọc nhân viên đã nghỉ" />
              Đã nghỉ
            </label>
          </div>
        </div>

        <!-- Vai trò -->
        <div class="filter-item">
          <label>Vai trò</label>
          <select v-model="filterState.vaiTro" title="Lọc theo vai trò">
            <option value="">Tất cả</option>
            <option value="ADMIN">Quản lý</option>
            <option value="STAFF">Nhân viên</option>
          </select>
        </div>

        <!-- Tỉnh/Thành -->
        <div class="filter-item">
          <label>Tỉnh/Thành</label>
          <select v-model="filterState.tinhThanh" title="Lọc theo tỉnh/thành">
            <option value="">Tất cả</option>
            <option v-for="province in provinces" :key="province.code" :value="province.name">
              {{ province.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="table-wrapper bg-white p-3 rounded shadow mb-4">
      <div style="margin-bottom: 10px; display: flex; align-items: center;">
        <button class="column-toggle-btn column-toggle-align" @click="showColumnBox = !showColumnBox"
          title="Tùy chọn cột hiển thị">
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
              <th v-for="col in allColumns.filter(c => visibleColumns.includes(c.key))" :key="col.key">{{ col.label }}
              </th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="pagedNhanVien.length">
              <template v-for="(nhanVien, index) in pagedNhanVien" :key="nhanVien.id">
                <tr>
                  <td>{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td v-for="col in allColumns.filter(c => visibleColumns.includes(c.key))" :key="col.key">
                    <template v-if="col.key === 'anh'">
                      <img v-if="nhanVien.anh" :src="getImageUrl(nhanVien.anh)"
                        style="width: 40px; height: 40px; object-fit: cover; background: #eee;">
                    </template>
                    <template v-else-if="col.key === 'cccd'">
                      {{ maskPassword(nhanVien.cccd) }}
                    </template>
                    <template v-else-if="col.key === 'gioiTinh'">
                      {{ nhanVien.gioiTinh ? 'Nam' : 'Nữ' }}
                    </template>
                    <template v-else-if="col.key === 'trangThai'">
                      <span :class="['status-badge', nhanVien.trangThai == 1 ? 'active' : 'inactive']">
                        {{ nhanVien.trangThai == 1 ? 'Đang làm việc' : 'Đã nghỉ' }}
                      </span>
                    </template>
                    <template v-else-if="col.key === 'ngaySinh'">
                      {{ formatDate(nhanVien[col.key]) }}
                    </template>
                    <template v-else-if="col.key === 'vaiTro'">
                      {{ nhanVien.tenVaiTro === 'ADMIN' ? 'Quản lý' : nhanVien.tenVaiTro === 'STAFF' ? 'Nhân viên' : ''
                      }}
                    </template>
                    <template v-else-if="col.key === 'diaChi'">
                      {{ [nhanVien.thonXom, nhanVien.xaPhuong, nhanVien.quanHuyen,
                      nhanVien.tinhThanh].filter(Boolean).join(', ') }}
                    </template>
                    <template v-else>
                      {{ nhanVien[col.key] }}
                    </template>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <template v-if="nhanVien.trangThai == 1">
                        <button class="action-btn edit" title="Sửa thông tin nhân viên"
                          @click="router.push(`/nhan-vien/sua/${nhanVien.id}`)">
                          <Edit />
                        </button>
                        <button class="action-btn delete" title="Ngừng làm việc" @click="openConfirmModal(nhanVien)">
                          <Trash />
                        </button>
                        <!-- Nút bật/tắt vai trò -->
                        <label class="switch" title="Đổi vai trò">
                          <input type="checkbox" :checked="nhanVien.tenVaiTro === 'ADMIN'"
                            @change="event => handleToggleVaiTro(nhanVien, event)" />
                          <span class="slider"></span>
                        </label>
                      </template>
                      <template v-else>
                        <button class="action-btn edit" title="Quay lại làm việc"
                          @click="openBackToWorkModal(nhanVien)">
                          <svg class="icon-green" width="22" height="22" fill="none" stroke="#22b34c" stroke-width="2"
                            viewBox="0 0 24 24">
                            <path d="M1 4v6h6" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                          </svg>
                        </button>
                        <button class="action-btn delete" title="Xóa nhân viên" @click="openDeleteModal(nhanVien)">
                          <svg class="icon-red" width="22" height="22" fill="none" stroke="#e53935" stroke-width="2"
                            viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </template>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-else>
              <td :colspan="visibleColumns.length + 2"
                style="text-align:center; padding: 40px 0; color: #8a99a8; font-size: 18px; background: #fafbfc;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
                  <svg width="48" height="48" fill="none" stroke="#8a99a8" stroke-width="2" stroke-linecap="round"
                    stroke-linejoin="round" viewBox="0 0 24 24">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M16 16a4 4 0 0 0-8 0" />
                  </svg>
                  <div>Không tìm thấy kết quả nào phù hợp</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination"
        style="display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 18px;">
        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">«</button>
        <span v-for="page in totalPages" :key="page" style="margin: 0 4px;">
          <button @click="goToPage(page)" :class="{ 'active': currentPage === page }">{{ page }}</button>
        </span>
        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">»</button>
      </div>
    </div>
    <div v-if="showAddressModal" class="modal-overlay">
      <div class="modal-add-role" style="min-width:400px;max-width:95vw;">
        <div class="modal-header">
          <span><b>Chỉnh sửa địa chỉ</b></span>
          <button class="modal-close" @click="showAddressModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div>
            <label for="province">Tỉnh/Thành</label>
            <select id="province" v-model="selectedProvince" title="Chọn tỉnh/thành cho địa chỉ nhân viên">
              <option value="">Chọn tỉnh/thành</option>
              <option v-for="province in provinces" :key="province.code" :value="province.code">
                {{ province.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="district">Quận/Huyện</label>
            <select id="district" v-model="selectedDistrict" title="Chọn quận/huyện cho địa chỉ nhân viên">
              <option value="">Chọn quận/huyện</option>
              <option v-for="district in districts" :key="district.code" :value="district.code">
                {{ district.name }}
              </option>
            </select>
          </div>
          <div>
            <label for="ward">Xã/Phường</label>
            <select id="ward" v-model="selectedWard" title="Chọn xã/phường cho địa chỉ nhân viên">
              <option value="">Chọn xã/phường</option>
              <option v-for="ward in wards" :key="ward.code" :value="ward.code">
                {{ ward.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-actions">
          <button class="btn-save" @click="saveAddress" title="Lưu địa chỉ nhân viên">Lưu</button>
          <button class="btn-cancel" @click="showAddressModal = false" title="Bỏ qua chỉnh sửa địa chỉ">Bỏ qua</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.nhanvien-page-wrapper {
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
  transition: all 0.18s cubic-bezier(.4, 0, .2, 1);
  text-decoration: none;
  user-select: none;
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
  transition: all 0.18s cubic-bezier(.4, 0, .2, 1);
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
  min-height: 300px;
  max-height: 440px;
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
  from {
    opacity: 0;
    transform: translateY(-8px);
  }

  to {
    opacity: 1;
    transform: none;
  }
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

.filter-search-wrapper {
  position: relative;
  width: 100%;
  min-width: 180px;
  max-width: 260px;
  display: block;
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
  z-index: 2;
}

.filter-search {
  width: 100%;
  padding: 7px 12px 7px 36px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 400;
  box-sizing: border-box;
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

.modal-overlay {
  position: fixed;
  top: -450px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.25);
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
  to {
    transform: rotate(360deg);
  }
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
  transition: all 0.18s cubic-bezier(.4, 0, .2, 1);
  text-decoration: none;
  user-select: none;
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

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 18px;
}

.pagination button {
  min-width: 36px;
  height: 36px;
  border: 1.5px solid #d1cac0;
  background: #fff;
  color: #222;
  font-size: 16px;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.18s;
  outline: none;
  margin: 0 2px;
  box-shadow: 0 2px 8px #0001;
}

.pagination button.active,
.pagination button:focus {
  background: #339cf1;
  color: #fff;
  border-color: #339cf1;
  box-shadow: 0 2px 8px #339cf133;
}

.pagination button:hover:not(:disabled):not(.active) {
  background: #e3eafc;
  color: #339cf1;
  border-color: #339cf1;
}

.pagination button:disabled {
  background: #f5f5f5;
  color: #bbb;
  border-color: #eee;
  cursor: not-allowed;
  box-shadow: none;
}

.filter-fields-row {
  display: flex;
  gap: 32px;
  align-items: flex-end;
  justify-content: flex-start;
}

.filter-item {
  flex: 1 1 0;
  min-width: 180px;
  max-width: 260px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.filter-item label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 2px;
  color: #222;
}

/* Thêm vào <style scoped> */
.switch {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
  margin-left: 8px;
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
  background-color: #2196F3;
  border-radius: 24px;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  border-radius: 50%;
  transition: .4s;
}

.switch input:checked+.slider {
  background-color: #22b34c;
}

.switch input:checked+.slider:before {
  transform: translateX(20px);
}
</style>
