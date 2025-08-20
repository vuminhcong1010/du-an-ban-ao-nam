<template>
    <div class="order-container container my-5">
        <div v-if="order.length === 0" class="empty-cart-wrapper">
            <div class="empty-cart text-center">
                <div class="empty-icon">🛒</div>
                <h4>Giỏ hàng của bạn đang trống.</h4>
                <p>Vui lòng thêm một số sản phẩm vào giỏ hàng của bạn.</p>
                <button class="btn browse-products-btn" @click="quayLaiSanPham">
                    Duyệt qua các sản phẩm của chúng tôi
                </button>
            </div>
        </div>



        <div v-else class="row">
            <div class="col-md-7">
                <h4>Thông tin liên lạc</h4>
                <form @submit.prevent="thanhToan" novalidate>
                    <div class="mb-3">
                        <label for="email" class="form-label">E-MAIL</label>
                        <input type="email" id="email" class="form-control" v-model="form.email" required
                            placeholder="coolmen@gmail.com" />
                    </div>

                    <h4 class="mt-4">Chi tiết thanh toán</h4>
                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="firstName" class="form-label">Họ và TÊN</label>
                            <input type="text" id="firstName" class="form-control" v-model="form.firstName" required
                                placeholder="John" />
                        </div>
                    </div>

                    <div class="mb-3 position-relative d-flex align-items-center justify-content-between">
                        <label for="thonXom" class="form-label mb-0">THÔN XÓM</label>
                        <button class="btn btn-outline-secondary btn-icon" type="button"
                            @click="showDiaChiModal = true">
                            📍
                        </button>
                    </div>
                    <div class="input-group position-relative">
                        <input type="text" id="thonXom" class="form-control rounded-input" v-model="form.thonXom"
                            placeholder="Tổ dân phố 1" />
                    </div>



                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="province" class="form-label">TỈNH/THÀNH PHỐ</label>
                            <select id="province" class="form-select" v-model="selectedProvince" required>
                                <option value="" disabled>Chọn tỉnh/thành phố</option>
                                <option v-for="p in provinces" :key="p.ProvinceID" :value="p.ProvinceID">
                                    {{ p.ProvinceName }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="district" class="form-label">QUẬN/HUYỆN</label>
                            <select id="district" class="form-select" v-model="selectedDistrict" required
                                :disabled="!selectedProvince">
                                <option value="" disabled>Chọn quận/huyện</option>
                                <option v-for="d in districts" :key="d.DistrictID" :value="d.DistrictID">
                                    {{ d.DistrictName }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-12 mb-3">
                            <label for="ward" class="form-label">XÃ/PHƯỜNG</label>
                            <select id="ward" class="form-select" v-model="selectedWard" required
                                :disabled="!selectedDistrict">
                                <option value="" disabled>Chọn xã/phường</option>
                                <option v-for="w in wards" :key="w.WardCode" :value="w.WardCode">
                                    {{ w.WardName }}
                                </option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="phone" class="form-label">ĐIỆN THOẠI</label>
                        <input type="tel" id="phone" class="form-control" v-model="form.phone" required
                            placeholder="+84 123 456 789" />
                    </div>
                </form>
                <h5 class="mt-4">Tùy chọn thanh toán</h5>
                <div class="radio-card-group mb-3">
                    <label class="radio-card" :class="{ selected: form.paymentMethod === 'card' }">
                        <input type="radio" value="card" v-model="form.paymentMethod" />
                        <img src="/src/assets/vnpay-logo-vinadesign-25-12-57-55.jpg" alt="VNPay Logo" class="vnpay-logo" />VNPay
                    </label>

                    <label class="radio-card" :class="{ selected: form.paymentMethod === 'cod' }">
                        <input type="radio" value="cod" v-model="form.paymentMethod" />
                        💵 COD
                    </label>
                </div>


                <div class="mb-3">
                    <label for="orderNote" class="form-label">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea id="orderNote" rows="3" v-model="form.orderNote"
                        placeholder="Ghi chú về đơn hàng, ví dụ ghi chú đặc biệt về việc giao hàng"></textarea>
                </div>
            </div>

            <div class="col-md-5">
                <div class="card p-4 sticky-summary">
                    <h5 class="mb-3">Tóm tắt đơn hàng</h5>
                    <div v-for="(item, index) in order" :key="index" class="d-flex align-items-center mb-3">
                        <img :src="item.duongDanAnh" alt="Ảnh sản phẩm" width="60" class="me-3 rounded" />

                        <div style="flex-grow: 1;">
                            <p class="mb-1 fw-semibold">{{ item.tenSanPham }}</p>
                            <div class="small mb-1">
                                <template v-if="item.hasDiscount">
                                    <small class="text-success ms-2" v-if="item.phanTramGiamGia > 0">
                                        Tiết kiệm -{{ item.phanTramGiamGia }}%
                                    </small>
                                    <div>
                                        <span class="text-decoration-line-through text-muted me-2">
                                            {{ formatCurrency(item.giaTruocKhiGiam) }}
                                        </span>
                                        <span class="text-danger fw-bold">
                                            {{ formatCurrency(item.giaSauKhiGiam) }}
                                        </span>
                                    </div>
                                </template>
                                <template v-else>
                                    <span class="fw-bold">{{ formatCurrency(item.giaTruocKhiGiam) }}</span>
                                </template>
                            </div>

                            <div class="text-muted small mb-1">
                                Màu: {{ item.tenMau }} | Size: {{ item.tenKichCo }}
                            </div>

                            <div class="fw-bold text-dark small">
                                Tổng:
                                {{ formatCurrency((item.hasDiscount ? item.giaSauKhiGiam : item.giaTruocKhiGiam) *
                                    item.soLuong) }}
                            </div>

                        </div>

                        <div class="ms-3 d-flex align-items-center">
                            <input type="number" v-model="item.soLuong" @change="kiemTraSoLuong(item)"
                                class="form-control form-control-sm " style="width: 80px;" />

                        </div>

                    </div>

                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <img src="/src/assets/293cb84a6429a3426672.svg" alt="voucher-icon"
                            style="width: 20px; height: 20px; margin-right: 6px;">
                        <span style="flex-grow: 1; font-size: 15px; color: #333333; font-weight: bolder;">Coolmen
                            Voucher</span>
                        <a href="#" style="color: #0088ff; font-size: 14px; text-decoration: none;"
                            @click="showVoucherModal = true">Chọn
                            hoặc nhập
                            mã</a>
                    </div>

                    <div class="d-flex justify-content-between">
                        <span>Tổng Tiền</span>
                        <span>{{ formatCurrency(tongTienSanPham) }}</span>
                    </div>
                    <div class="d-flex justify-content-between mt-2">
                        <span>Phí vận chuyển</span>
                        <span>{{ formatCurrency(shipFee) }}</span>
                    </div>
                    <div v-if="giamGiaDaApDung" class="d-flex justify-content-between text-success">
                        <span>Giảm giá
                            <template v-if="giamGiaDaApDung.soTienGiam">
                                (-{{ formatCurrency(giamGiaDaApDung.soTienGiam) }})
                            </template>
                            <template v-else>
                                (-{{ giamGiaDaApDung.phamTramGiamGia }}%)
                            </template>
                        </span>
                        <span>-{{ formatCurrency(tienGiam) }}</span>
                    </div>

                    <div class="d-flex justify-content-between fw-bold fs-5">
                        <span>Tổng cộng</span>
                        <span>{{ formatCurrency(tongCong) }}</span>
                    </div>

                    <button class="btn btn-primary w-100 mt-3 d-flex align-items-center justify-content-center"
                        :disabled="isLoading" @click="thanhToan">
                        <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status"
                            aria-hidden="true"></span>
                        {{ isLoading ? 'Đang gửi mail...' : 'Thanh toán' }}
                    </button>

                </div>
            </div>
        </div>
    </div>
    <div v-if="showVoucherModal" class="modal-backdrop">
        <div class="modal-box">
            <div class="modal-header">
                <h5 class="modal-title">Chọn Coolmen Voucher</h5>
                <button @click="showVoucherModal = false" class="close-button">&times;</button>
            </div>
            <div class="modal-body">
                <div class="voucher-row">
                    <label class="voucher-label">Mã Voucher</label>
                    <input type="text" v-model="maGiamGia" class="voucher-input" placeholder="Mã Coolmen Voucher" />
                    <button class="voucher-button" @click="apDungGiamGia">ÁP DỤNG</button>
                </div>


                <div class="voucher-list">
                    <div class="voucher-card" :class="{ selected: giamGiaDaApDung?.id === voucher.data.id }"
                        v-for="voucher in voucherDeXuat" :key="voucher.id">
                        <div class="voucher-left">
                            <div class="voucher-logo">
                                <img src="/src/assets/logo.png" alt="Coolmen Logo" />
                                <div class="voucher-brand">COOLMEN</div>
                            </div>
                        </div>

                        <div class="voucher-content">
                            <div class="voucher-top">
                                <span class="voucher-flash">⚡ Số lượng có hạn</span>
                                <span class="voucher-discount">
                                    {{ voucher.moTa }}
                                </span>
                            </div>
                            <div class="voucher-min-order">Đơn Tối Thiểu {{ voucher.donToiThieu }}</div>
                            <div class="voucher-max-discount" v-if="voucher.data.giamToiDa">
                                Giảm Tối Đa {{ formatCurrency(voucher.data.giamToiDa) }}
                            </div>
                            <div class="voucher-expired">
                                HSD: {{ voucher.hsd }}
                            </div>
                        </div>

                        <div class="voucher-select">
                            <input type="radio" :value="voucher.id" v-model="selectedVoucher"
                                @click="chonVoucher(voucher)" />
                        </div>

                        <div v-if="giamGiaDaApDung?.id === voucher.data.id" class="voucher-applied-message">
                            🎉 Mã giảm giá đã được áp dụng!
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button class="btn cancel" @click="showVoucherModal = false">TRỞ LẠI</button>
                <button class="btn ok" @click="showVoucherModal = false">OK</button>
            </div>
        </div>
    </div>


    <div v-if="showDiaChiModal" class="modal-custom">
        <div class="modal-dialog-custom">
            <div class="modal-header-custom"
                style="display: flex; align-items: center; justify-content: space-between;">
                <h5 style="margin: 0;">Chọn địa chỉ của khách hàng</h5>
                <button class="btn btn-success btn-sm" @click="themDiaChi()" style="margin-left: 10px;">
                    Thêm Địa Chỉ khách hàng
                </button>
                <button class="close-button" @click="showDiaChiModal = false, dongForm()"
                    style="margin-left: 10px;">&times;</button>
            </div>

            <div v-for="diaChi in danhSachDiaChi" :key="diaChi.id" class="address-option"
                :class="{ selected: diaChiDuocChon?.id === diaChi.id }" @click="chonDiaChiClick(diaChi)">
                <div class="address-content">
                    <div>
                        <div><strong>Thôn :</strong> {{ diaChi.diaChiChiTiet }}</div>
                        <div>{{ diaChi.xaPhuong }}, {{ diaChi.quanHuyen }}, {{ diaChi.tinhThanhPho }}</div>
                    </div>
                    <div v-if="diaChi.isMacDinh" class="default-address-label mt-1">MẶC ĐỊNH</div>
                    <button v-if="!diaChi.isMacDinh" class="btn btn-outline-secondary btn-set-default"
                        @click.stop="datLamMacDinh(diaChi)">
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
    <!-- Form Thêm/Sửa địa chỉ (trượt từ phải) -->
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
                <select v-model="formData.quanHuyen" @change="onDistrictChange" required>
                    <option value="">-- Chọn Quận/Huyện --</option>
                    <option v-for="district in districts" :key="district.DistrictID" :value="district.DistrictID">
                        {{ district.DistrictName }}
                    </option>
                </select>
            </div>

            <div class="form-group">
                <label>Xã/Phường:</label>
                <select v-model="formData.xaPhuong" required>
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

</template>

<script setup>
import { ref, onMounted, computed, watch, watchEffect } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification'
import { nextTick } from 'vue';
import { Eye, Edit, Plus, Trash, Delete, Home, EyeOff } from 'lucide-vue-next';
import Swal from 'sweetalert2';
const toast = useToast();


const router = useRouter();
const route = useRoute();
const order = ref([]);

const maGiamGia = ref('');
const tokenGHN = 'c6846aa1-74f6-11f0-bae3-5e3443de31a0';
const shopId = 5939518; // Replace with your actual shop_id
const fromDistrictId = 1644; // Your shop's sending district/county ID (int)

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvince = ref('');
const selectedDistrict = ref('');
const selectedWard = ref('');

const availableServices = ref([]);
const serviceId = ref(null); // This will hold the service_id once available
const shipFee = ref(0);
const giamGiaDaApDung = ref(null);
const tienGiam = ref(0);
const showVoucherModal = ref(false);

const voucherDeXuat = ref([]);
const selectedVoucher = ref(null);
const danhSachPhieu = ref([]);
const daHienThongBaoKhongCoMa = ref(false);
const daHienThongBaoThanhCong = ref(false);
const tongTienTruocDo = ref(0);
const dangTuHuyMaGiamGia = ref(false);
const isLoading = ref(false);
const daTuChoiTuDongApDung = ref(false); // ✅ Cờ người dùng đã từ chối auto áp dụng
const danhSachDiaChi = ref([]);
const showDiaChiModal = ref(false); // ❌ Thiếu
const diaChiDuocChon = ref(null); // Chứa địa chỉ được chọn
const isEditing = ref(false);

// Form Thêm/Sửa địa chỉ
const showForm = ref(false); // Hiển thị form
const isClosing = ref(false); // Trạng thái đang đóng

// Dữ liệu địa chỉ đang thêm/sửa
const formData = ref({
    id: null,
    tinhThanhPho: '',
    quanHuyen: '',
    xaPhuong: '',
    diaChiChiTiet: '',
    isMacDinh: false
});

function openForm(diaChi = null) {
    if (diaChi) {
        formData.value = { ...diaChi };
    } else {
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
    fetchProvinces();
    fetchDistricts();
    fetchWards();
}
function dongForm() {
    isClosing.value = true;
    setTimeout(() => {
        showForm.value = false;
    }, 400);
}

async function luuDiaChi() {
    const { tinhThanhPho, quanHuyen, xaPhuong, diaChiChiTiet, isMacDinh, id } = formData.value;

    if (!tinhThanhPho || !quanHuyen || !xaPhuong || !diaChiChiTiet) {
        toast.error('Vui lòng điền đầy đủ thông tin');
        return;
    }

    const userRaw = localStorage.getItem('loggedInUser');
    const user = userRaw ? JSON.parse(userRaw) : null;
    const khachHangId = user?.id;
    if (!khachHangId) {
        toast.error('Không tìm thấy thông tin khách hàng');
        return;
    }

    // ✅ Tìm tên từ ID
    const province = provinces.value.find(p => p.ProvinceID == tinhThanhPho);
    const district = districts.value.find(d => d.DistrictID == quanHuyen);
    const ward = wards.value.find(w => w.WardCode == xaPhuong);

    const provinceName = province?.ProvinceName || '';
    const districtName = district?.DistrictName || '';
    const wardName = ward?.WardName || '';

    // ✅ Kiểm tra trùng lặp
    const diaChiDaTonTai = danhSachDiaChi.value.find(dc =>
        dc.tinhThanhPho === provinceName &&
        dc.quanHuyen === districtName &&
        dc.xaPhuong === wardName &&
        dc.diaChiChiTiet.trim().toLowerCase() === diaChiChiTiet.trim().toLowerCase() &&
        (!id || dc.id !== id)
    );

    if (diaChiDaTonTai) {
        toast.warning('Địa chỉ này đã được thêm');
        return;
    }

    try {
        const payload = {
            tinhThanhPho: provinceName,
            quanHuyen: districtName,
            xaPhuong: wardName,
            diaChiChiTiet,
            isMacDinh: !!isMacDinh
        };

        if (id) {
            await axios.put(`http://localhost:8080/client/sua-dia-chi/${id}`, payload);
            toast.success('Cập nhật địa chỉ thành công');
        } else {
            await axios.post(`http://localhost:8080/client/them-dia-chi/${khachHangId}`, payload);
            toast.success('Thêm địa chỉ thành công');
        }

        dongForm();
        await layDiaChiTheoKhachHang();
    } catch (error) {
        console.error("Lỗi lưu địa chỉ:", error);
        toast.error("Đã xảy ra lỗi khi lưu địa chỉ");
    }
}

const onProvinceChange = async () => {
    const provinceId = formData.value.tinhThanhPho;

    formData.value.quanHuyen = '';
    formData.value.xaPhuong = '';
    districts.value = [];
    wards.value = [];

    if (!provinceId) return;

    await fetchDistricts(provinceId);
};
const onDistrictChange = async () => {
    const districtId = formData.value.quanHuyen;

    formData.value.xaPhuong = '';
    wards.value = [];

    if (!districtId) return;

    await fetchWards(districtId);
};
function getProvinceIdByName(name) {
    const match = provinces.value.find(p => p.ProvinceName === name);
    return match?.ProvinceID || '';
}

function getDistrictIdByName(name) {
    const match = districts.value.find(d => d.DistrictName === name);
    return match?.DistrictID || '';
}

function getWardCodeByName(name) {
    const match = wards.value.find(w => w.WardName === name);
    return match?.WardCode || '';
}

async function suaDiaChi(diaChi) {
    isEditing.value = true;

    try {
        const userRaw = localStorage.getItem('loggedInUser');
        const user = userRaw ? JSON.parse(userRaw) : null;
        const khachHangId = user?.id;

        if (!khachHangId) {
            toast.error("Không tìm thấy thông tin khách hàng");
            return;
        }

        const res = await axios.get(`http://localhost:8080/client/dia-chi-theo-khach-hang/${khachHangId}/dia-chi/${diaChi.id}`);
        const diaChiCanSua = res.data;

        if (!diaChiCanSua) {
            toast.error("Không tìm thấy địa chỉ cần sửa");
            return;
        }

        // 1. Gán tỉnh trước
        formData.value.tinhThanhPho = getProvinceIdByName(diaChiCanSua.tinhThanhPho);
        formData.value.id = diaChiCanSua.id;
        formData.value.diaChiChiTiet = diaChiCanSua.diaChiChiTiet;
        formData.value.isMacDinh = diaChiCanSua.isMacDinh;

        // 2. Load huyện theo tỉnh đã gán
        await onProvinceChange();

        // 3. Sau khi districts đã load xong, gán huyện
        formData.value.quanHuyen = getDistrictIdByName(diaChiCanSua.quanHuyen);

        // 4. Load xã theo huyện đã gán
        await onDistrictChange();

        // 5. Sau khi wards đã load xong, gán xã
        formData.value.xaPhuong = getWardCodeByName(diaChiCanSua.xaPhuong);

        showForm.value = true;
        isClosing.value = false;

    } catch (error) {
        console.error("Lỗi khi load địa chỉ để sửa:", error);
        toast.error("Không thể tải địa chỉ để sửa");
    }
}



function themDiaChi() {
    isEditing.value = false;
    openForm();
}


async function xoaDiaChi(diaChi) {
    const result = await Swal.fire({
        icon: 'warning',
        title: 'Xóa địa chỉ',
        html: `Địa chỉ sẽ bị xóa vĩnh viễn.<br>Bạn có chắc chắn muốn thực hiện?`,
        showCancelButton: true,
        confirmButtonText: 'Đồng ý',
        cancelButtonText: 'Bỏ qua',
        reverseButtons: true,
        customClass: {
            confirmButton: 'swal2-confirm btn btn-danger',
            cancelButton: 'swal2-cancel btn btn-secondary'
        }
    });

    if (result.isConfirmed) {
        try {
            await axios.delete(`http://localhost:8080/client/xoa-dia-chi/${diaChi.id}`);
            toast.success("Xóa địa chỉ thành công");
            await layDiaChiTheoKhachHang();
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
    // Gán form
    form.value.thonXom = dc.diaChiChiTiet || '';

    // Gọi hàm gán địa chỉ và tính phí ship
    await handleLayPhiVanChuyen(dc);
    // Đóng modal
    showDiaChiModal.value = false;
};

const handleLayPhiVanChuyen = async (diaChi) => {
    if (!diaChi) return;

    const normalizeVietnamese = (str) => {
        if (!str) return '';
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/^(tinh|thanh pho|quan|huyen|thi xa|xa|phuong|thi tran)\s+/i, '')
            .toLowerCase()
            .trim();
    };

    try {
        // === GÁN selectedProvince ===
        const provinceObj = provinces.value.find(p =>
            normalizeVietnamese(diaChi.tinhThanhPho).includes(normalizeVietnamese(p.ProvinceName))
        );
        if (!provinceObj) {
            console.warn("Không tìm thấy mã tỉnh.");
            return;
        }
        selectedProvince.value = provinceObj.ProvinceID;
        await fetchDistricts(provinceObj.ProvinceID);

        // === GÁN selectedDistrict ===
        const districtObj = districts.value.find(d =>
            normalizeVietnamese(diaChi.quanHuyen).includes(normalizeVietnamese(d.DistrictName))
        );
        if (!districtObj) {
            console.warn("Không tìm thấy mã huyện.");
            return;
        }
        selectedDistrict.value = districtObj.DistrictID;
        await fetchWards(districtObj.DistrictID);
        await fetchAvailableServices(districtObj.DistrictID);

        // === GÁN selectedWard ===
        const wardObj = wards.value.find(w =>
            normalizeVietnamese(diaChi.xaPhuong).includes(normalizeVietnamese(w.WardName))
        );
        if (!wardObj) {
            console.warn("Không tìm thấy mã xã.");
            return;
        }
        selectedWard.value = wardObj.WardCode;

    } catch (err) {
        console.error("Lỗi gán địa chỉ và tính phí:", err);
    }
};

const datLamMacDinh = async (diaChi) => {
    try {
        const userRaw = localStorage.getItem('loggedInUser');
        if (!userRaw) {
            console.warn("Không tìm thấy thông tin người dùng trong localStorage");
            return;
        }

        const user = JSON.parse(userRaw);
        const khachHangId = user?.id;

        if (!khachHangId) {
            console.warn("Không có ID khách hàng");
            return;
        }

        // Gọi API PUT để cập nhật địa chỉ mặc định
        await axios.put("http://localhost:8080/client/capNhatDiaChiMacDinh", null, {
            params: {
                khachHangId: khachHangId,
                diaChiId: diaChi.id
            }
        });

        // Sau khi cập nhật thành công thì gọi lại API lấy danh sách địa chỉ
        await layDiaChiTheoKhachHang();

    } catch (error) {
        console.error("Lỗi khi cập nhật địa chỉ mặc định:", error);
    }
};



const layDiaChiTheoKhachHang = async () => {
    try {
        const userRaw = localStorage.getItem('loggedInUser');
        if (!userRaw) {
            console.warn("Không tìm thấy thông tin người dùng trong localStorage");
            return;
        }

        const user = JSON.parse(userRaw);
        const khachHangId = user?.id;

        if (!khachHangId) {
            console.warn("Không có ID khách hàng");
            return;
        }

        const res = await axios.get("http://localhost:8080/client/timDiaChiTheoIdKhachHang", {
            params: { khachHangId }
        });

        if (res.status === 200 && res.data.length > 0) {
            danhSachDiaChi.value = res.data;
            console.log("Đã lấy được địa chỉ:", danhSachDiaChi.value);
        } else {
            console.warn("Không có địa chỉ nào được tìm thấy.");
        }
    } catch (error) {
        console.error("Lỗi khi lấy địa chỉ theo ID khách hàng:", error);
    }
};


async function fetchPhieuGiamGia() {
    try {
        const userRaw = localStorage.getItem('loggedInUser');
        let idKhachHang = null;
        if (userRaw) {
            const user = JSON.parse(userRaw);
            idKhachHang = user?.id || null;
        }

        const response = await axios.get("http://localhost:8080/client/phieuGiamGias", {
            params: {
                idKhachHang: idKhachHang
            }
        });

        const allVouchers = response.data
            .filter(p => p.trangThai === 1); // Lọc trạng thái hợp lệ

        voucherDeXuat.value = allVouchers.map(v => ({
            id: v.id,
            moTa: v.phamTramGiamGia
                ? `Giảm ${v.phamTramGiamGia}%`
                : `Giảm ${formatCurrency(v.soTienGiam)}`,
            donToiThieu: formatCurrency(v.giamToiThieu || 0),
            hsd: new Date(v.ngayKetThuc).toLocaleDateString("vi-VN"),
            data: v,
            ...v // giữ nguyên thông tin gốc để tiện xử lý sau
        }));

        danhSachPhieu.value = allVouchers;

        // ✅ Tự động áp dụng phiếu tốt nhất sau khi lấy xong
        if (!dangTuHuyMaGiamGia.value && !daTuChoiTuDongApDung.value) {
            apDungTuDongPhieuTotNhat(allVouchers);
        }

    } catch (error) {
        console.error("Lỗi khi lấy phiếu giảm giá:", error);
        toast.error("Không thể tải danh sách phiếu giảm giá.");
    }
}


function xoaMaGiamGia() {
    giamGiaDaApDung.value = null;
    tienGiam.value = 0;
    selectedVoucher.value = null;
    maGiamGia.value = '';
}
function kiemTraSoLuong(item) {
    // ⚠️ Nếu người dùng nhập chuỗi hoặc để trống
    const soLuong = Number(item.soLuong);

    if (isNaN(soLuong) || item.soLuong === '' || soLuong <= 0) {
        item.soLuong = 1;
        nextTick(() => {
            toast.warning(`❌ Số lượng không hợp lệ.`, { timeout: 3000 });
        });
        return;
    }

    if (soLuong > item.soLuongTon) {
        item.soLuong = item.soLuongTon;
        nextTick(() => {
            toast.warning(`⚠️ Chỉ còn ${item.soLuongTon} sản phẩm trong kho.`, { timeout: 3000 });
        });
    }

    if (soLuong < 1) {
        item.soLuong = 1;
        nextTick(() => {
            toast.warning(`❌ Số lượng phải tối thiểu là 1.`, { timeout: 3000 });
        });
    }
}

function apDungTuDongPhieuTotNhat(danhSachPhieu) {
    const tong = tongTienSanPham.value;
    if (tong === 0) {
        xoaMaGiamGia();
        daHienThongBaoKhongCoMa.value = false; // reset khi không có sản phẩm
        return;
    }

    let phieuTotNhat = null;
    let giamTotNhat = 0;

    for (const p of danhSachPhieu) {
        const donToiThieu = p.giamToiThieu || 0;
        if (tong < donToiThieu) continue;

        let tienGiam = 0;

        if (p.soTienGiam) {
            tienGiam = Math.min(p.soTienGiam, tong);
        } else if (p.phamTramGiamGia) {
            const giamPhanTram = Math.round((tong * p.phamTramGiamGia) / 100);
            tienGiam = Math.min(giamPhanTram, p.giamToiDa || tong);
        }

        if (
            tienGiam > giamTotNhat ||
            (tienGiam === giamTotNhat && p.soTienGiam && !phieuTotNhat?.soTienGiam)
        ) {
            giamTotNhat = tienGiam;
            phieuTotNhat = p;
        }
    }

    if (phieuTotNhat) {
        giamGiaDaApDung.value = phieuTotNhat;
        tienGiam.value = giamTotNhat;
        selectedVoucher.value = phieuTotNhat.id;
        maGiamGia.value = phieuTotNhat.maPhieuGiamGia;

        if (!daHienThongBaoThanhCong.value) {
            toast.success(`Tự động áp dụng mã giảm ${phieuTotNhat.soTienGiam ? 'tiền mặt' : 'phần trăm'} tốt nhất!`);
            daHienThongBaoThanhCong.value = true;
        }


        daHienThongBaoKhongCoMa.value = false; // reset thông báo lỗi
    } else {
        xoaMaGiamGia();
        daHienThongBaoThanhCong.value = false;

        if (!daHienThongBaoKhongCoMa.value) {
            daHienThongBaoKhongCoMa.value = true;
        }
    }

}

function chonVoucher(voucher) {
    if (selectedVoucher.value === voucher.id) {
        dangTuHuyMaGiamGia.value = true; // ✅ đặt trước
        daTuChoiTuDongApDung.value = true;
        xoaMaGiamGia();
        toast.info("Mã giảm giá đã được hủy.");
        daHienThongBaoThanhCong.value = false;
        daHienThongBaoKhongCoMa.value = false;

        // ❌ Không nên reset ngay lập tức
        // Đợi vài giây hoặc thao tác khác rồi reset nếu cần
        // Ví dụ sau 3 giây mới reset:
        setTimeout(() => {
            dangTuHuyMaGiamGia.value = false;
        }, 5000); // Hoặc để mặc định nếu không cần reset

    } else {
        selectedVoucher.value = voucher.id;
        maGiamGia.value = voucher.data.maPhieuGiamGia;
        apDungGiamGia();
        daTuChoiTuDongApDung.value = false;
        // ✅ Khi áp dụng lại thì reset cờ
        dangTuHuyMaGiamGia.value = false;
    }
}



function tinhTienGiam(phieu) {
    const tong = tongTienSanPham.value;

    let tienGiam = 0;

    if (phieu.soTienGiam) {
        tienGiam = Math.min(phieu.soTienGiam, tong);
    } else if (phieu.phamTramGiamGia) {
        tienGiam = Math.round((tong * phieu.phamTramGiamGia) / 100);

        // Áp dụng giảm tối đa nếu có
        if (phieu.giamToiDa) {
            tienGiam = Math.min(tienGiam, phieu.giamToiDa);
        }
    }

    return tienGiam;
}


async function apDungGiamGia() {
    const voucher = voucherDeXuat.value.find(v => v.id === selectedVoucher.value);

    if (!voucher && !maGiamGia.value.trim()) {
        toast.warning("Vui lòng chọn hoặc nhập mã giảm giá.");
        return;
    }

    // Nếu đã áp dụng phiếu này rồi => không làm gì
    if (giamGiaDaApDung.value && voucher && giamGiaDaApDung.value.id === voucher.data.id) {
        toast.info("Mã giảm giá này đã được áp dụng.");
        return;
    }

    try {
        let response;
        if (voucher) {
            response = await axios.get(`http://localhost:8080/client/TimPhieuGiamGias/${voucher.data.maPhieuGiamGia}`);
        } else {
            response = await axios.get(`http://localhost:8080/client/TimPhieuGiamGias/${maGiamGia.value}`);
        }

        const phieu = response.data;

        // Check điều kiện đơn tối thiểu
        const donToiThieu = phieu.giamToiThieu || 0;
        if (tongTienSanPham.value < donToiThieu) {
            toast.warning(`Đơn hàng phải tối thiểu ${formatCurrency(donToiThieu)} để dùng mã này.`);
            return;
        }

        giamGiaDaApDung.value = phieu;
        tienGiam.value = tinhTienGiam(phieu);
        toast.success("Áp dụng mã giảm giá thành công!");
    } catch (err) {
        console.error(err);
        toast.error("Mã giảm giá không hợp lệ hoặc đã hết hạn.");
        giamGiaDaApDung.value = null;
        tienGiam.value = 0;
    }
}



const form = ref({
    email: '',
    firstName: '',
    thonXom: '',
    phone: '',
    paymentMethod: 'cod',
    orderNote: ''
});

const headers = {
    token: tokenGHN,
    'Content-Type': 'application/json',
};


// 1. Fetch Provinces on Component Mount
const fetchProvinces = async () => {
    try {
        const { data } = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', { headers });
        provinces.value = data.data;
    } catch (e) {
        console.error('Lỗi khi lấy danh sách tỉnh/thành phố:', e);
    }
};

// 2. Fetch Districts based on selected Province
const fetchDistricts = async (provinceId) => {
    // Reset lower level selections and fees when province changes
    districts.value = [];
    wards.value = [];
    selectedDistrict.value = '';
    selectedWard.value = '';
    availableServices.value = [];
    serviceId.value = null;
    shipFee.value = 0;

    if (!provinceId) return; // Don't fetch if no province is selected

    try {
        const { data } = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/master-data/district', { province_id: provinceId }, { headers });
        districts.value = data.data;
    } catch (e) {
        console.error('Lỗi khi lấy danh sách quận/huyện:', e);
    }
};

// 3. Fetch Wards based on selected District
const fetchWards = async (districtId) => {
    // Reset lower level selections and fees when district changes
    wards.value = [];
    selectedWard.value = '';
    availableServices.value = []; // Also reset services as they depend on the destination district
    serviceId.value = null;
    shipFee.value = 0;

    if (!districtId) return; // Don't fetch if no district is selected

    try {
        const { data } = await axios.post('https://online-gateway.ghn.vn/shiip/public-api/master-data/ward', { district_id: districtId }, { headers });
        wards.value = data.data;
    } catch (e) {
        console.error('Lỗi khi lấy danh sách xã/phường:', e);
    }
};

// 4. Fetch Available Services based on origin and destination districts
const fetchAvailableServices = async (toDistrictId) => {
    availableServices.value = [];
    serviceId.value = null; // Clear serviceId
    shipFee.value = 0; // Clear shipping fee

    if (!toDistrictId) return; // Don't fetch if no destination district is selected

    try {
        const { data } = await axios.post(
            'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services',
            { shop_id: shopId, from_district: fromDistrictId, to_district: Number(toDistrictId) },
            { headers }
        );
        availableServices.value = data.data || [];
        if (availableServices.value.length > 0) {
            // Automatically select the first available service
            serviceId.value = availableServices.value[0].service_id;
            // No need to call calculateShipFee here, the watchEffect will handle it
        } else {
            console.warn('Không có dịch vụ vận chuyển khả dụng cho tuyến này.');
        }
    } catch (e) {
        console.error('Lỗi khi lấy danh sách dịch vụ vận chuyển:', e);
    }
};

// 5. Calculate Shipping Fee
const calculateShipFee = async () => {
    shipFee.value = 0; // Reset fee before calculating

    // Ensure all necessary parameters are available before making the call
    if (!serviceId.value || !selectedWard.value || !selectedDistrict.value) {
        // console.log("Missing parameters for fee calculation:", { serviceId: serviceId.value, selectedWard: selectedWard.value, selectedDistrict: selectedDistrict.value });
        return;
    }

    try {
        const { data } = await axios.post(
            'https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee',
            {
                service_id: serviceId.value,
                insurance_value: 0, // Adjust as needed
                coupon: null,
                from_district_id: fromDistrictId,
                to_district_id: Number(selectedDistrict.value),
                to_ward_code: selectedWard.value,
                weight: 1000, // Example weight in grams
                length: 15,  // Example dimensions in cm
                width: 15,
                height: 15
            },
            { headers: { ...headers, shop_id: shopId } }
        );
        if (data.code === 200 && data.data) {
            shipFee.value = data.data.service_fee || data.data.total || 0;
            console.log('Phí vận chuyển:', shipFee.value);
        } else {
            console.warn('Không thể tính phí vận chuyển:', data.message);
        }
    } catch (e) {
        console.error('Lỗi khi tính phí vận chuyển:', e);
        shipFee.value = 0; // Ensure fee is 0 on error
    }
};

// *** Centralized Watchers for a More Robust Flow ***

// Watcher for Province selection: Triggers fetching districts
watch(selectedProvince, (newProvinceId) => {
    fetchDistricts(newProvinceId);
});

// Watcher for District selection: Triggers fetching wards and available services
watch(selectedDistrict, (newDistrictId) => {
    fetchWards(newDistrictId);
    fetchAvailableServices(newDistrictId); // Services depend on selectedDistrict
});

// WatchEffect for Shipping Fee Calculation: Triggers when ALL dependencies are ready
// This is the most crucial part to ensure the fee is calculated
watchEffect(() => {
    if (serviceId.value !== null && selectedDistrict.value !== '' && selectedWard.value !== '') {
        calculateShipFee();
    } else {
        shipFee.value = 0;
    }
});

const fetchOrder = async () => {
    try {
        const res = await axios.get(`http://localhost:8080/client/laySanPhamTheoHoaDon/${route.params.hoaDonId}`);
        const products = res.data;

        // Nếu không có sản phẩm nào => clear giỏ hàng
        if (!products || products.length === 0) {
            order.value = [];
            return;
        }

        const productsWithDiscount = await Promise.all(products.map(async (item) => {
            const discountRes = await axios.get(`http://localhost:8080/client/giam-gia-chi-tiet/${item.idSanPhamChiTiet}`);
            const discounts = discountRes.data.data;

            let avgDiscount = 0;
            if (discounts && discounts.length > 0) {
                const totalDiscount = discounts.reduce((acc, val) => acc + val, 0);
                avgDiscount = totalDiscount / discounts.length;
            }

            return {
                ...item,
                phanTramGiamGia: Math.round(avgDiscount),
                hasDiscount: item.giaTruocKhiGiam !== item.giaSauKhiGiam
            };
        }));

        order.value = productsWithDiscount;
    } catch (error) {
        console.error('Lỗi lấy đơn hàng hoặc giảm giá:', error);
        order.value = []; // fallback nếu lỗi
    }
};



const tongTienSanPham = computed(() => {
    return order.value.reduce((total, item) => {
        const gia = item.hasDiscount ? item.giaSauKhiGiam : item.giaTruocKhiGiam;
        return total + gia * item.soLuong;
    }, 0);
});



function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}


const tongCong = computed(() => tongTienSanPham.value + shipFee.value - tienGiam.value);

async function thanhToan() {
    if (!form.value.phone || !selectedProvince.value || !selectedDistrict.value || !selectedWard.value) {
        toast.warning("Vui lòng điền đầy đủ thông tin liên hệ và địa chỉ nhận hàng.");
        return;
    }

    if (shipFee.value === 0) {
        toast.error("Không thể tính phí vận chuyển.");
        return;
    }

    isLoading.value = true;

    try {
        // 👉 Khởi tạo dữ liệu trước
        const provinceName = provinces.value.find(p => p.ProvinceID == selectedProvince.value)?.ProvinceName || '';
        const districtName = districts.value.find(d => d.DistrictID == selectedDistrict.value)?.DistrictName || '';
        const wardName = wards.value.find(w => w.WardCode == selectedWard.value)?.WardName || '';
        const fullAddress = [form.value.thonXom, wardName, districtName, provinceName].filter(Boolean).join(', ');

        const loggedInUser = localStorage.getItem('loggedInUser');
        let idKhachHang = null;
        if (loggedInUser) {
            try {
                const user = JSON.parse(loggedInUser);
                idKhachHang = user?.id || null;
            } catch (err) {
                console.error("Lỗi khi parse loggedInUser:", err);
            }
        }

        const data = {
            tongTienSanPham: tongTienSanPham.value,
            phiVanChuyen: shipFee.value,
            tongCong: tongCong.value,
            tienGiam: tienGiam.value || 0,
            hoTen: form.value.firstName,
            diaChi: fullAddress,
            ghiChu: form.value.orderNote,
            sdt: form.value.phone,
            email: form.value.email,
            idKhachHang: idKhachHang,
            maPhieuGiamGia: maGiamGia.value || null,
            hinhThucThanhToan: form.value.paymentMethod,
            sanPhamTrongGio: order.value.map(item => ({
                idSanPhamChiTiet: item.idSanPhamChiTiet,
                soLuong: item.soLuong,
                gia: item.phanTramGiamGia > 0 ? item.giaSauKhiGiam : item.giaTruocKhiGiam
            }))
        };

        // 👉 Nếu chọn VNPay
        if (form.value.paymentMethod === 'card') {
            sessionStorage.setItem("dataHoaDon", JSON.stringify(data));

            const vnpayRequest = {
                amount: tongCong.value.toString(),
                hoaDonId: route.params.hoaDonId
            };

            const response = await axios.post(`http://localhost:8080/vnpay`, vnpayRequest);
            const vnpayUrl = response.data;

            window.location.href = vnpayUrl;
            sessionStorage.removeItem("gioHang");
            localStorage.removeItem("gioHang");
            window.dispatchEvent(new Event("cap-nhat-gio"));
            return;
        }

        // 👉 Nếu không chọn VNPay thì cập nhật hóa đơn ngay
        await axios.put(`http://localhost:8080/client/capNhatHoaDon/${route.params.hoaDonId}`, data, {
            withCredentials: true
        });

        sessionStorage.removeItem("gioHang");
        localStorage.removeItem("gioHang");
        window.dispatchEvent(new Event("cap-nhat-gio"));

        router.push({ name: "client-san-pham" }).then(() => {
            toast.success("✅ Thanh toán thành công!");
        });

    } catch (e) {
        console.error("Lỗi thanh toán:", e);
        alert("Thanh toán thất bại");
    } finally {
        isLoading.value = false;
    }
}






onMounted(async () => {
    await fetchProvinces();
    await fetchOrder();
    await layDiaChiTheoKhachHang();
    window.addEventListener("cap-nhat-gio", fetchOrder);
    fetchPhieuGiamGia();
    watchEffect(() => {
        if (
            tongTienSanPham.value > 0 &&
            danhSachPhieu.value.length > 0 &&
            !giamGiaDaApDung.value &&
            !dangTuHuyMaGiamGia.value &&
            !daHienThongBaoThanhCong.value &&
            !daTuChoiTuDongApDung.value
        ) {
            apDungTuDongPhieuTotNhat(danhSachPhieu.value);
        }
    });

    watch(order, (newOrder, oldOrder) => {
        if (!oldOrder.length) return; // tránh lỗi lúc khởi tạo
        newOrder.forEach((item, idx) => {
            if (item.soLuong !== oldOrder[idx]?.soLuong) {
                nextTick(() => kiemTraSoLuong(item));
            }
        });
    }, { deep: true });

    watch(order, () => {
        const tongHienTai = tongTienSanPham.value;

        if (danhSachPhieu.value.length === 0) return;

        const daCoMa = !!giamGiaDaApDung.value;

        const donToiThieu = giamGiaDaApDung.value?.giamToiThieu || 0;

        if (tongHienTai < donToiThieu && daCoMa) {
            xoaMaGiamGia();

            if (!daHienThongBaoKhongCoMa.value) {
                daHienThongBaoKhongCoMa.value = true;
                daHienThongBaoThanhCong.value = false; // reset
            }
        } else if (tongHienTai >= donToiThieu &&
            !daCoMa &&
            !dangTuHuyMaGiamGia.value &&
            !daTuChoiTuDongApDung.value) {
            apDungTuDongPhieuTotNhat(danhSachPhieu.value);
        }


        tongTienTruocDo.value = tongHienTai;
    }, { deep: true });

    // Lấy thông tin người dùng từ localStorage
    const userRaw = localStorage.getItem('loggedInUser');
    if (!userRaw) return;

    const user = JSON.parse(userRaw);

    // Gán thông tin form
    form.value.email = user.email || user.tenTaiKhoan || '';
    form.value.firstName = user.tenKhachHang || '';
    form.value.phone = user.soDienThoai || '';

    // Tìm địa chỉ mặc định
    const diaChiMacDinh = user.diaChis?.find(dc => dc.isMacDinh === true);
    if (!diaChiMacDinh) {
        console.warn("Không tìm thấy địa chỉ mặc định.");
        return;
    }

    form.value.thonXom = diaChiMacDinh.diaChiChiTiet || '';

    // Tìm mã tỉnh/huyện/xã từ tên
    function normalizeVietnamese(str) {
        if (!str) return '';
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "") // remove diacritics
            .replace(/^(tinh|thanh pho|quan|huyen|thi xa|xa|phuong|thi tran)\s+/i, '') // remove prefixes
            .toLowerCase()
            .trim();
    }

    const provinceObj = provinces.value.find(p =>
        normalizeVietnamese(diaChiMacDinh.tinhThanhPho).includes(normalizeVietnamese(p.ProvinceName))
    );

    if (!provinceObj) {
        console.warn("Không tìm thấy mã tỉnh tương ứng.");
        return;
    }

    selectedProvince.value = provinceObj.ProvinceID;
    await fetchDistricts(provinceObj.ProvinceID);

    const districtObj = districts.value.find(d =>
        normalizeVietnamese(diaChiMacDinh.quanHuyen).includes(normalizeVietnamese(d.DistrictName))
    );

    if (!districtObj) {
        console.warn("Không tìm thấy mã huyện tương ứng.");
        return;
    }

    selectedDistrict.value = districtObj.DistrictID;
    await fetchWards(districtObj.DistrictID);
    await fetchAvailableServices(districtObj.DistrictID);

    const wardObj = wards.value.find(w =>
        normalizeVietnamese(diaChiMacDinh.xaPhuong).includes(normalizeVietnamese(w.WardName))
    );

    if (!wardObj) {
        console.warn("Không tìm thấy mã xã/phường tương ứng.");
        return;
    }

    selectedWard.value = wardObj.WardCode;
});
function quayLaiSanPham() {
    router.push({ name: "client-san-pham" });
}

</script>
<style scoped>
.order-container {
    margin-top: 3rem;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: #1c1c1c;
    background-color: #F3F4F6;
    padding: 1rem;
    min-height: 80vh;
    display: flex;
    justify-content: space-between;
    gap: 3rem;
    align-items: flex-start;
    max-width: 1200px;
    margin-left: auto;
    margin-right: auto;
}

/* Cột Thông tin thanh toán */
.col-md-7 {
    margin-top: 50px;
    padding: 2rem 3rem;
    flex: 1;
    max-width: 700px;
}

h4 {
    font-weight: 600;
    font-size: 1.7rem;
    margin-bottom: 1.5rem;
    color: #222;
}

/* Form label */
label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #444;
    margin-bottom: 0.3rem;
    display: block;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

/* Input styles */
input.form-control {
    width: 100%;
    padding: 10px 12px;
    font-size: 1rem;
    border-radius: 5px;
    border: 1.8px solid #ccc;
    outline-offset: 0;
    transition: border-color 0.3s ease;
}

input.form-control:focus {
    border-color: #6f42c1;
    box-shadow: 0 0 6px rgba(111, 66, 193, 0.4);
}

.row {
    display: flex;
    gap: 1.5rem;
    margin-bottom: 1.4rem;
}

.col-md-6 {
    flex: 1;
}

/* Optional small text */
.mb-3 {
    margin-bottom: 1.2rem;

}

/* Cột Tóm tắt đơn hàng */
.col-md-5 {
    flex: 0 0 400px;
    max-width: 400px;
    margin-left: 80px;
    margin-top: 100px;
    /* đẩy cột này xa hơn khỏi cột trái */
}

.card {
    background-color: white;
    border-radius: 10px;
    padding: 2rem 2.5rem;
    box-shadow: 0 3px 14px rgb(0 0 0 / 0.08);
    display: flex;
    flex-direction: column;
}

h5 {
    font-weight: 700;
    font-size: 1.5rem;
    margin-bottom: 1.5rem;
    color: #1c1c1c;
}

.d-flex {
    display: flex;
    align-items: center;
}

.align-items-center {
    align-items: center;
}

.mb-3 {
    margin-bottom: 1rem;
}

.me-3 {
    margin-right: 1rem;
}

.rounded {
    border-radius: 8px;
}

/* Sản phẩm */
.card>div.d-flex>div p {
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 0.2rem;
    line-height: 1.1;
    color: #333;
}

.card>div.d-flex>div small {
    color: #666;
    font-size: 0.85rem;
}

/* Input nhóm mã giảm giá */
.input-group {
    display: flex;
    margin-bottom: 1.5rem;
}

input.form-control,
select.form-select,
textarea {
    width: 100%;
    padding: 12px 14px;
    font-size: 1rem;
    border-radius: 6px;
    border: 1.8px solid #ccc;
    box-sizing: border-box;
}

.input-group input.form-control {
    flex-grow: 1;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    font-size: 1rem;
    padding-left: 15px;
    color: #555;
    border: 1.8px solid #ccc;
    border-right: none;
}

.input-group input.form-control::placeholder {
    color: #bbb;
    font-style: italic;
}

.input-group button.btn {
    background-color: #222;
    color: white;
    border: none;
    border-top-right-radius: 6px;
    border-bottom-right-radius: 6px;
    padding: 0 1.3rem;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.3s ease;
    border: 1.8px solid #222;
    border-left: none;
}

.input-group button.btn:hover {
    background-color: #6f42c1;
    border-color: #6f42c1;
}

/* Tổng phụ, vận chuyển, tổng cộng */
.d-flex.justify-content-between {
    justify-content: space-between;
    font-weight: 500;
    font-size: 1rem;
    margin-top: 0.4rem;
    margin-bottom: 0.4rem;
    color: #444;
}

.d-flex.justify-content-between.fw-bold.fs-5 {
    font-weight: 700;
    font-size: 1.4rem;
    color: #1a1a1a;
}

hr {
    border-color: #ddd;
    margin: 1rem 0;
}

/* Nút thanh toán */
.btn-primary {
    background-color: #6f42c1;
    border-color: #6f42c1;
    font-weight: 700;
    font-size: 1.15rem;
    padding: 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    width: 100%;
    margin-top: 1.8rem;
    color: white;
    box-shadow: 0 4px 12px rgb(111 66 193 / 0.35);
}

.sticky-summary {
    position: sticky;
    top: 100px;
}

.btn-primary:hover {
    background-color: #5930a3;
    border-color: #5930a3;
}

/* Responsive cho màn hình nhỏ */
@media (max-width: 991px) {
    .order-container {
        flex-direction: column;
        padding: 1rem;
    }

    .col-md-7,
    .col-md-5 {
        max-width: 100%;
        flex: 1 1 100%;
    }
}

/* Giao diện chọn thẻ vận chuyển và thanh toán */
.radio-card-group {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
}

.radio-card {
    position: relative;
    padding: 12px 20px;
    border: 2px solid #d1d5db;
    border-radius: 10px;
    background-color: white;
    cursor: pointer;
    min-width: 200px;
    text-align: left;
    transition: all 0.3s ease;
    font-weight: 500;
}

.radio-card:hover {
    border-color: #9f7aea;
}

.radio-card input[type="radio"] {
    display: none;
}

.radio-card.selected {
    border-color: #9f7aea;
    background-color: #f5f3ff;
    color: #4c1d95;
}

.radio-card.selected::after {
    content: "✔";
    position: absolute;
    top: 8px;
    right: 12px;
    font-size: 18px;
    color: #6b21a8;
}

/* Giao diện input thẻ, textarea */
input[type="text"],
textarea {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 10px 12px;
    width: 100%;
    transition: border 0.3s ease;
}

input[type="text"]:focus,
textarea:focus {
    outline: none;
    border-color: #9f7aea;
    box-shadow: 0 0 0 3px rgba(167, 139, 250, 0.3);
}

.modal-backdrop {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-box {
    background: #fff;
    width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 8px;
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.2);
    animation: fadeIn 0.2s ease-in-out;
}

.modal-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 16px;
    font-weight: 600;
}

.close-button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
}

.modal-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
}

.tab {
    flex: 1;
    padding: 10px 0;
    text-align: center;
    font-weight: 500;
    background: #f5f5f5;
    border: none;
    cursor: pointer;
}

.tab.active {
    background: #fff;
    border-bottom: 2px solid #ee4d2d;
    color: #ee4d2d;
}

.modal-body {
    padding: 16px;
}

.voucher-input-section {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
}

.voucher-input {
    flex: 1;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.apply-button {
    padding: 8px 12px;
    background-color: #ee4d2d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
}

.voucher-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}


.voucher-card {
    position: relative;
    border: 2px solid #ddd;
    border-radius: 8px;
    padding: 10px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    transition: border-color 0.3s;
    background-color: #fff;
}

.voucher-card.selected {
    border-color: #28a745;
    background-color: #f0fff5;
}

.voucher-applied-message {
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-size: 13px;
    color: #28a745;
    font-weight: 500;
}

.voucher-left {
    display: flex;
    gap: 10px;
}

.voucher-tag {
    background: #2dc258;
    color: white;
    font-weight: bold;
    font-size: 12px;
    padding: 4px 6px;
    border-radius: 4px;
}

.voucher-info {
    display: flex;
    flex-direction: column;
}

.voucher-desc {
    font-weight: 500;
    margin: 0;
}

.voucher-expiry {
    font-size: 12px;
    color: gray;
    margin: 0;
}

.alert-success {
    background-color: #d4edda;
    color: #155724;
    padding: 10px;
    border-radius: 4px;
    margin-top: 10px;
    font-size: 14px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 12px 16px;
    border-top: 1px solid #eee;
    gap: 10px;
}

.btn {
    padding: 8px 16px;
    border-radius: 4px;
    border: none;
    font-weight: bold;
    cursor: pointer;
}

.btn.cancel {
    background: #f5f5f5;
}

.btn.ok {
    background: #ee4d2d;
    color: white;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: scale(0.95);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

.voucher-row {
    display: flex;
    align-items: center;
    gap: 10px;
    /* khoảng cách giữa các phần tử */
    margin-bottom: 16px;
}

.voucher-label {
    min-width: 90px;
    font-weight: 500;
}

.voucher-input {
    flex: 1;
    /* để chiếm hết phần còn lại */
    padding: 8px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    height: 38px;
}

.voucher-button {
    background-color: #ee4d2d;
    color: white;
    border: none;
    padding: 0 16px;
    height: 38px;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
}

.voucher-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: 20px;
}

.voucher-card {
    display: flex;
    background: white;
    border-radius: 6px;
    border: 1px solid #f0f0f0;
    padding: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    align-items: center;
}

.voucher-left {
    width: 90px;
    position: relative;
    text-align: center;
}

.voucher-logo {
    position: relative;
}

.voucher-logo img {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin: 0 auto;
}

.voucher-badge {
    position: absolute;
    top: -8px;
    left: -12px;
    background: #fbc02d;
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;
}

.voucher-brand {
    margin-top: 8px;
    font-size: 12px;
    font-weight: bold;
    color: #666;
}

.voucher-content {
    flex: 1;
    padding-left: 16px;
}

.voucher-top {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
}

.voucher-flash {
    font-size: 11px;
    background-color: #ffebee;
    color: #e53935;
    padding: 2px 6px;
    border-radius: 3px;
    font-weight: bold;
}

.voucher-discount {
    font-size: 16px;
    color: #333;
    font-weight: bold;
}

.voucher-min-order {
    font-size: 13px;
    color: #666;
}

.voucher-note {
    font-size: 12px;
    color: #e53935;
    border: 1px solid #e53935;
    display: inline-block;
    padding: 2px 6px;
    margin-top: 4px;
    border-radius: 2px;
}

.voucher-expired {
    font-size: 12px;
    color: #999;
    margin-top: 6px;
}

.voucher-select {
    margin-left: auto;
}

.empty-cart {
    text-align: center;
    padding: 40px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin-left: 370px;
    margin-top: 70px;
}

.empty-cart img {
    width: 120px;
    margin-bottom: 20px;
}

.empty-cart h4 {
    font-weight: bold;
    margin-bottom: 5px;
    color: #333;
}

.empty-cart p {
    margin-bottom: 20px;
    color: #777;
}

.empty-cart .empty-icon {
    font-size: 120px;
    color: #ccc;
    margin-bottom: 10px;
}

.browse-products-btn {
    background-color: #6f42c1;
    color: white;
    border: none;
    padding: 10px 25px;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
}

.browse-products-btn:hover {
    background-color: #5a32a3;
    color: white;
}


.modal-custom {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
}

.modal-dialog-custom {
    background: white;
    padding: 20px;
    width: 600px;
    border-radius: 8px;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
}

.modal-header-custom {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.modal-body-custom {
    max-height: 300px;
    overflow-y: auto;
}

.address-option {
    position: relative;
    /* Thêm dòng này */
    border: 1px solid #ccc;
    padding: 12px 16px 50px 16px;
    /* Thêm khoảng padding dưới để đủ chỗ chứa nút */
    margin-bottom: 10px;
    border-radius: 8px;
    background-color: #fff;
    transition: border-color 0.3s;
}

.address-option:hover {
    border-color: #007bff;
}

.address-content {
    font-size: 14px;
    color: #333;
}

.btn-set-default {
    font-size: 13px;
    padding: 4px 8px;
    white-space: nowrap;
    border: 1px solid #696969;
}

.default-address-label {
    display: inline-block;
    background-color: #d1e7dd;
    /* nền xanh nhạt */
    color: #0f5132;
    /* chữ xanh đậm */
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;
    font-weight: 600;
    margin-top: 8px;
}

.modal-footer-custom {
    display: flex;
    justify-content: flex-end;
    margin-top: 15px;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    line-height: 1;
    padding: 0;
    margin: 0;
    transition: color 0.2s ease;
}

.close-button:hover {
    color: #000;
}

.default-address-label {
    display: inline-block;
    background-color: #d1e7dd;
    color: #0f5132;
    padding: 2px 8px;
    font-size: 12px;
    border-radius: 4px;
    font-weight: 600;
    margin-top: 4px;
}

.set-default-button {
    border: 1px solid #ccc;
    background: white;
    color: #333;
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
}

.set-default-button:hover {
    background-color: #f1f1f1;
}

.modal-footer-custom.no-gap {
    margin-top: 8px;
    padding-top: 0;
}

.modal-footer-custom {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
    flex-wrap: wrap;
}

.close-button {
    background: none;
    border: none;
    font-size: 24px;
    font-weight: bold;
    color: #666;
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s ease;
}

.close-button:hover {
    color: #000;
}

.mb-3.position-relative.d-flex {
    gap: 8px;
}

.btn-icon {
    border-radius: 50%;
    width: 32px;
    height: 32px;
    padding: 0;
    font-size: 18px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid #5930a3;
}

.input-group.position-relative {
    position: relative;
    margin-top: 4px;
}

.rounded-input {
    border-radius: 8px;
    padding-right: 40px;
    /* nếu thêm nút trong input thì dành chỗ */
}

.default-address-label {
    display: inline-block;
    background-color: #d1e7dd;
    /* nền xanh nhạt */
    color: #0f5132;
    /* chữ xanh đậm */
    padding: 2px 6px;
    font-size: 12px;
    border-radius: 4px;
    font-weight: 600;
}



.address-option.selected {
    border: 2px solid #007bff;
    background-color: #eaf3ff;
}

address-option {
    position: relative;
    /* quan trọng để chứa nút action */
    border: 1px solid #ddd;
    padding: 10px 10px 50px 10px;
    /* để dành chỗ cho nút action ở dưới */
    margin-bottom: 12px;
    border-radius: 6px;
}

.address-content {
    /* Nội dung địa chỉ */
}

/* Nút "Thiết lập mặc định" */
.btn-set-default {
    margin-top: 10px;
}

/* Khung chứa nút action nhỏ */
.address-action-buttons {
    position: absolute;
    bottom: 12px;
    right: 12px;
    display: flex;
    gap: 6px;
    /* khoảng cách giữa các nút */
}

.address-action-buttons button {
    font-size: 12px;
    /* nhỏ lại */
    padding: 4px 8px;
    border-radius: 4px;
}

/* Các nút nhỏ gọn */
.address-action-buttons .btn {
    width: 28px;
    height: 28px;
    padding: 0;
    font-size: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
    cursor: pointer;
}

.address-action-buttons .btn-add {
    background-color: #6f42c1;
    /* tím */
    color: white;
    border: none;
}

.address-action-buttons .btn-edit {
    background-color: #ffc107;
    /* vàng */
    border: none;
    color: black;
}

.address-action-buttons .btn-delete {
    background-color: #dc3545;
    /* đỏ */
    border: none;
    color: white;
}

/* Nút chọn địa chỉ giao hàng */
.btn-select-address {
    width: 100%;
    padding: 12px;
    font-weight: bold;
    font-size: 1.1em;
    border-radius: 6px;
    margin-top: 12px;
}

.slide-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 420px;
    height: 100%;
    background-color: #fff;
    box-shadow: -3px 0 6px rgba(0, 0, 0, 0.2);
    transition: transform 0.4s ease;
    z-index: 9999;
}

.slide-in {
    transform: translateX(0%);
}

.slide-out {
    transform: translateX(100%);
}

.slide-header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.slide-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 10px;
    padding: 16px;
    border-top: 1px solid #eee;
}

/* Base button */
.btn {
    height: 40px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s ease;
}

/* Cancel Button */
.btn-cancel {
    background-color: #6c757d;
    color: white;
    width: 100px;
}

.form-group select,
.form-group input[type="text"] {
    width: 100%;
    padding: 10px 12px;
    font-size: 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.3s;
}

.form-group select:focus,
.form-group input[type="text"]:focus {
    border-color: #6f42c1;
}

/* Save Button */
.btn-save {
    background-color: #6f42c1;
    color: white;
    min-width: 140px;
    padding: 0 24px;
}

.btn-cancel:hover {
    background-color: #3a3e43;
    /* hoặc giữ #6c757d nếu bạn không muốn đổi màu */
    color: white;
}

.btn-save:hover {
    background-color: #4d1aab;
    /* hoặc giữ #6f42c1 nếu bạn không muốn đổi */
    color: white;
}

.btn-footer {
    flex: 1;
    padding: 10px 12px;
    font-size: 14px;
    min-width: 100px;
}

.slide-body {
    padding: 16px;
    overflow-y: auto;
}

.form-group {
    margin-bottom: 16px;
}

.swal2-container {
    z-index: 99999 !important;
}
.vnpay-logo {
  height: 20px;
  margin-left: 6px;
  vertical-align: middle;
}
</style>
