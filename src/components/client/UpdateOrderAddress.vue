<template>
  <div>
    <div v-if="showDiaChiModal" class="modal-custom">
      <div class="modal-dialog-custom">
        <div class="modal-header-custom" style="display: flex; align-items: center; justify-content: space-between;">
          <h5 style="margin: 0;">Chọn địa chỉ của khách hàng</h5>
          <button class="btn btn-success btn-sm" @click="themDiaChi()" style="margin-left: 10px;">
            Thêm Địa Chỉ
          </button>
          <button class="close-button" @click="dongModalDiaChi" style="margin-left: 10px;">&times;</button>
        </div>


        <div v-for="diaChi in danhSachDiaChi" :key="diaChi.id" class="address-option"
          :class="{ selected: diaChiDuocChon?.id === diaChi.id }" @click="chonDiaChiClick(diaChi)">
          <div class="address-content">
            <div>
              <div><strong>Thôn :</strong> {{ diaChi.diaChiChiTiet }}</div>
              <div>{{ diaChi.xaPhuong }}, {{ diaChi.quanHuyen }}, {{ diaChi.tinhThanhPho }}</div>
            </div>
            <div v-if="diaChi.isMacDinh" class="default-address-label mt-1">MẶC ĐỊNH</div>
            <button v-if="!diaChi.isMacDinh" class="btn btn-outline-secondary btn-set-default" @click.stop="datLamMacDinh(diaChi)">
              Thiết lập mặc định
            </button>
          </div>
          <div class="address-action-buttons">
            <button class="btn btn-sm btn-edit" @click.stop="suaDiaChi(diaChi)" title="Sửa">
              <Edit />
            </button>
            <button class="btn btn-sm btn-delete" @click.stop="xoaDiaChi(diaChi)" title="Xóa">
              <Trash />
            </button>
          </div>
        </div>
        <div class="modal-footer-custom">
          <button class="btn btn-primary" :disabled="!diaChiDuocChon" @click="chonDiaChi">
            Chọn địa chỉ giao hàng
          </button>
        </div>
      </div>
    </div>


    <div class="slide-panel" v-if="showForm" :class="{ 'slide-in': showForm, 'slide-out': isClosing }">
      <div class="slide-header">
        <h5>{{ isEditing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới' }}</h5>
        <button class="close-button" @click="dongForm">×</button>
      </div>
      <div class="slide-body">
        <div class="form-group">
          <label>Tỉnh/Thành phố:</label>
          <select v-model="formData.tinhThanhPho" @change="onProvinceChange" required>
            <option value="">-- Chọn Tỉnh/Thành phố --</option>
            <option v-for="province in provinces" :key="province.ProvinceID" :value="province.ProvinceID">
              {{ province.ProvinceName }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Quận/Huyện:</label>
          <select v-model="formData.quanHuyen" @change="onDistrictChange" required :disabled="!formData.tinhThanhPho">
            <option value="">-- Chọn Quận/Huyện --</option>
            <option v-for="district in districts" :key="district.DistrictID" :value="district.DistrictID">
              {{ district.DistrictName }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Xã/Phường:</label>
          <select v-model="formData.xaPhuong" required :disabled="!formData.quanHuyen">
            <option value="">-- Chọn Xã/Phường --</option>
            <option v-for="ward in wards" :key="ward.WardCode" :value="ward.WardCode">
              {{ ward.WardName }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Địa chỉ chi tiết:</label>
          <input type="text" v-model="formData.diaChiChiTiet" placeholder="Số nhà, tên đường..." required />
        </div>
        <div class="form-group">
          <label><input type="checkbox" v-model="formData.isMacDinh" /> Đặt làm địa chỉ mặc định</label>
        </div>
      </div>
      <div class="slide-footer">
        <button class="btn btn-cancel" @click="dongForm">Hủy</button>
        <button class="btn btn-save" @click="luuDiaChi">
          {{ formData.id ? 'Cập nhật' : 'Thêm mới' }}
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, defineProps, defineEmits, watch } from 'vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import { Edit, Trash } from 'lucide-vue-next';
import Swal from 'sweetalert2';


// Định nghĩa Props và Emits
const props = defineProps({
  customerId: {
    type: [Number, String],
    required: true,
  },
  showModal: {
    type: Boolean,
    default: false,
  }
});
const emit = defineEmits(['close', 'address-selected']);


const toast = useToast();
const tokenGHN = 'c6846aa1-74f6-11f0-bae3-5e3443de31a0';
const shopId = 5939518;
const fromDistrictId = 1644;
const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const danhSachDiaChi = ref([]);
const showDiaChiModal = ref(false);
const diaChiDuocChon = ref(null);
const isEditing = ref(false);
const showForm = ref(false);
const isClosing = ref(false);
const formData = ref({
  id: null,
  tinhThanhPho: '',
  quanHuyen: '',
  xaPhuong: '',
  diaChiChiTiet: '',
  isMacDinh: false,
});


// Watch để kiểm soát việc đóng mở modal chính từ component cha
watch(() => props.showModal, (newVal) => {
  showDiaChiModal.value = newVal;
  if (newVal) {
    layDiaChiTheoKhachHang();
  }
});


// API Calls
const fetchProvinces = async () => {
  try {
    const res = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
      headers: { 'Token': tokenGHN }
    });
    console.log('Danh sách tỉnh:', res.data.data);
    provinces.value = res.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy Tỉnh/Thành Phố:", error);
    toast.error("Không thể tải danh sách tỉnh/thành phố.");
  }
};
const fetchDistricts = async (provinceId) => {
  try {
    const res = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', {
      province_id: provinceId
    }, {
      headers: { 'Token': tokenGHN }
    });
    console.log('Danh sách quận/huyện:', res.data.data);
    districts.value = res.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy Quận/Huyện:", error);
    toast.error("Không thể tải danh sách quận/huyện.");
  }
};
const fetchWards = async (districtId) => {
  try {
    const res = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/master-data/ward', {
      district_id: districtId
    }, {
      headers: { 'Token': tokenGHN }
    });
    console.log('Danh sách xã/phường:', res.data.data);
    wards.value = res.data.data;
  } catch (error) {
    console.error("Lỗi khi lấy Xã/Phường:", error);
    toast.error("Không thể tải danh sách xã/phường.");
  }
};
const fetchShippingFee = async (districtId, wardCode) => {
  try {
    const servicesRes = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services', {
      shop_id: shopId,
      from_district: fromDistrictId,
      to_district: districtId,
    }, {
      headers: { 'Token': tokenGHN }
    });
    if (servicesRes.data.data && servicesRes.data.data.length > 0) {
      const serviceId = servicesRes.data.data[0].service_id;
      const feeRes = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee', {
        service_id: serviceId,
        from_district_id: fromDistrictId,
        to_district_id: districtId,
        to_ward_code: wardCode,
        weight: 1000,
      }, {
        headers: { 'Token': tokenGHN, 'ShopId': shopId }
      });
      if (feeRes.data.code === 200 && feeRes.data.data) {
        toast.success("Đã tính phí vận chuyển thành công!");
        return feeRes.data.data.total;
      }
    }
    toast.warning("Không tìm thấy dịch vụ hoặc phí vận chuyển.");
    return 0;
  } catch (error) {
    console.error("Lỗi khi tính phí vận chuyển:", error.response?.data || error.message);
    toast.error("Lỗi khi tính phí vận chuyển.");
    return 0;
  }
};


// Form & Data manipulation
function dongModalDiaChi() {
  emit('close');
}
function dongForm() {
  isClosing.value = true;
  setTimeout(() => {
    showForm.value = false;
  }, 400);
}
function openForm(diaChi = null) {
  fetchProvinces();
  if (diaChi) {
    isEditing.value = true;
    formData.value = { ...diaChi };
    // Cần lấy lại các ID từ tên để gán vào select box
    const provinceId = getProvinceIdByName(diaChi.tinhThanhPho);
    if (provinceId) {
      formData.value.tinhThanhPho = provinceId;
      fetchDistricts(provinceId).then(() => {
        const districtId = getDistrictIdByName(diaChi.quanHuyen);
        if (districtId) {
          formData.value.quanHuyen = districtId;
          fetchWards(districtId).then(() => {
            const wardCode = getWardCodeByName(diaChi.xaPhuong);
            if (wardCode) {
              formData.value.xaPhuong = wardCode;
            }
          });
        }
      });
    }
  } else {
    isEditing.value = false;
    formData.value = {
      id: null,
      tinhThanhPho: '',
      quanHuyen: '',
      xaPhuong: '',
      diaChiChiTiet: '',
      isMacDinh: false
    };
  }
  showForm.value = true;
  isClosing.value = false;
}
function themDiaChi() {
  openForm();
}
async function suaDiaChi(diaChi) {
  openForm(diaChi);
}
const onProvinceChange = async () => {
  console.log('Province ID:', formData.value.tinhThanhPho); // Kiểm tra giá trị province ID


  // Nếu không có giá trị province, dừng lại
  if (!formData.value.tinhThanhPho) {
    toast.error("Vui lòng chọn tỉnh/thành phố.");
    return;
  }


  // Reset các giá trị Quận/Huyện và Xã/Phường
  formData.value.quanHuyen = '';
  formData.value.xaPhuong = '';
  districts.value = [];
  wards.value = [];


  // Lấy các quận/huyện dựa trên provinceId
  await fetchDistricts(formData.value.tinhThanhPho);
};
const onDistrictChange = async () => {
  formData.value.xaPhuong = '';
  wards.value = [];
  if (formData.value.quanHuyen) {
    await fetchWards(formData.value.quanHuyen);
  }
};
async function luuDiaChi() {
  const { tinhThanhPho, quanHuyen, xaPhuong, diaChiChiTiet, isMacDinh, id } = formData.value;


  if (!tinhThanhPho || !quanHuyen || !xaPhuong || !diaChiChiTiet) {
    toast.error('Vui lòng điền đầy đủ thông tin');
    return;
  }


  const provinceObj = provinces.value.find(p => p.ProvinceID === tinhThanhPho);
  const districtObj = districts.value.find(d => d.DistrictID === quanHuyen);
  const wardObj = wards.value.find(w => w.WardCode === xaPhuong);


  const payload = {
    tinhThanhPho: provinceObj?.ProvinceName || '',
    quanHuyen: districtObj?.DistrictName || '',
    xaPhuong: wardObj?.WardName || '',
    diaChiChiTiet,
    isMacDinh: !!isMacDinh,
    tinhThanhId: tinhThanhPho,
    quanHuyenId: quanHuyen,
    xaPhuongId: xaPhuong,
  };


  try {
    if (id) {
      await axios.put(`http://localhost:8080/client/sua-dia-chi/${id}`, payload);
      toast.success('Cập nhật địa chỉ thành công');
    } else {
      await axios.post(`http://localhost:8080/client/them-dia-chi/${props.customerId}`, payload);
      toast.success('Thêm địa chỉ thành công');
    }
    dongForm();
    layDiaChiTheoKhachHang();
  } catch (error) {
    console.error("Lỗi lưu địa chỉ:", error);
    toast.error("Đã xảy ra lỗi khi lưu địa chỉ");
  }
}
async function xoaDiaChi(diaChi) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Xóa địa chỉ',
    html: `Bạn có chắc chắn muốn xóa địa chỉ này?`,
    showCancelButton: true,
    confirmButtonText: 'Đồng ý',
    cancelButtonText: 'Bỏ qua',
  });
  if (result.isConfirmed) {
    try {
      await axios.delete(`http://localhost:8080/client/xoa-dia-chi/${diaChi.id}`);
      toast.success("Xóa địa chỉ thành công");
      layDiaChiTheoKhachHang();
    } catch (error) {
      console.error("Lỗi khi xóa địa chỉ:", error);
      toast.error("Không thể xóa địa chỉ");
    }
  }
}
const chonDiaChiClick = (diaChi) => {
  diaChiDuocChon.value = diaChi;
};
const chonDiaChi = async () => {
  if (!diaChiDuocChon.value) return;
  const dc = diaChiDuocChon.value;
  // Truyền đối tượng địa chỉ và phí ship ra ngoài component cha
  const shipFee = await fetchShippingFee(dc.quanHuyenId, dc.xaPhuongId);
  emit('address-selected', { address: dc, shipFee });
  dongModalDiaChi();
};
const datLamMacDinh = async (diaChi) => {
  try {
    await axios.put("http://localhost:8080/client/capNhatDiaChiMacDinh", null, {
      params: {
        khachHangId: props.customerId,
        diaChiId: diaChi.id
      }
    });
    layDiaChiTheoKhachHang();
    toast.success("Đã đặt địa chỉ mặc định thành công");
  } catch (error) {
    console.error("Lỗi khi cập nhật địa chỉ mặc định:", error);
    toast.error("Không thể đặt địa chỉ mặc định");
  }
};
const layDiaChiTheoKhachHang = async () => {
  try {
    const res = await axios.get("http://localhost:8080/client/timDiaChiTheoIdKhachHang", {
      params: { khachHangId: props.customerId }
    });
    danhSachDiaChi.value = res.data;
  } catch (error) {
    console.error("Lỗi khi lấy địa chỉ:", error);
    toast.error("Không thể tải danh sách địa chỉ.");
  }
};
const getProvinceIdByName = (name) => {
  const match = provinces.value.find(p => p.ProvinceName === name);
  return match?.ProvinceID || '';
};
const getDistrictIdByName = (name) => {
  const match = districts.value.find(d => d.DistrictName === name);
  return match?.DistrictID || '';
};
const getWardCodeByName = (name) => {
  const match = wards.value.find(w => w.WardName === name);
  return match?.WardCode || '';
};


// Khởi tạo
onMounted(() => {
  fetchProvinces();
  if (props.showModal) {
    layDiaChiTheoKhachHang();
  }
});
</script>


<style scoped>
/* CSS styles của bạn từ đoạn code gốc */
.modal-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-dialog-custom {
  background: white;
  border-radius: 8px;
  padding: 20px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}
.modal-header-custom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
  margin-bottom: 15px;
}
.modal-footer-custom {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #eee;
  padding-top: 15px;
  margin-top: 15px;
}
.address-option {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.address-option:hover {
  background-color: #f9f9f9;
}
.address-option.selected {
  border-color: #0d6efd;
  background-color: #eaf2ff;
}
.default-address-label {
  background-color: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  display: inline-block;
}
.btn-set-default {
  font-size: 12px;
  padding: 4px 8px;
}
.address-action-buttons {
  display: flex;
  gap: 8px;
}
.btn-edit, .btn-delete {
  border: none;
  background: none;
  padding: 0;
}
.slide-panel {
  position: fixed;
  top: 0;
  right: -100%;
  width: 400px;
  max-width: 90%;
  height: 100%;
  background: white;
  z-index: 1060;
  transition: right 0.4s ease-in-out;
  box-shadow: -2px 0 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}
.slide-panel.slide-in {
  right: 0;
}
.slide-panel.slide-out {
  right: -100%;
}
.slide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}
.slide-body {
  padding: 20px;
  overflow-y: auto;
  flex-grow: 1;
}
.slide-footer {
  display: flex;
  justify-content: flex-end;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}
.form-group {
  margin-bottom: 15px;
}
.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}
.form-group select, .form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.btn-cancel {
  background-color: #6c757d;
  color: white;
}
.btn-save {
  background-color: #0d6efd;
  color: white;
  margin-left: 10px;
}
</style>



