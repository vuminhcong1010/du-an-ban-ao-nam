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

                    <div class="mb-3">
                        <label for="thonXom" class="form-label">THÔN XÓM</label>
                        <input type="text" id="thonXom" class="form-control" v-model="form.thonXom"
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
                        <input type="radio" value="card" v-model="form.paymentMethod" /> 💳 Thanh Toán Qua VNPay
                    </label>
                    <label class="radio-card" :class="{ selected: form.paymentMethod === 'cod' }">
                        <input type="radio" value="cod" v-model="form.paymentMethod" /> 💵 COD
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

                    <button class="btn btn-primary w-100 mt-3" @click="thanhToan">
                        Thanh toán
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
</template>

<script setup>
import { ref, onMounted, computed, watch, watchEffect } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification'
import { nextTick } from 'vue';
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


async function fetchPhieuGiamGia() {
    try {
        const response = await axios.get("http://localhost:8080/client/phieuGiamGias");
        voucherDeXuat.value = response.data.filter(p =>
            p.loaiPhieu === 'Công khai' && p.trangThai === 1
        ).map(v => ({
            id: v.id,
            moTa: v.phamTramGiamGia
                ? `Giảm ${v.phamTramGiamGia}%`
                : `Giảm ${formatCurrency(v.soTienGiam)}`,
            donToiThieu: formatCurrency(v.giamToiThieu || 0),
            hsd: new Date(v.ngayKetThuc).toLocaleDateString("vi-VN"),
            data: v,
        }));
        danhSachPhieu.value = response.data;
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
        // Người dùng click lại mã đang áp dụng => hủy
        xoaMaGiamGia();
        toast.info("Mã giảm giá đã được hủy.");
        daHienThongBaoThanhCong.value = false;
        daHienThongBaoKhongCoMa.value = false;

        // Đánh dấu là hủy bằng tay => ngăn auto-apply
        dangTuHuyMaGiamGia.value = true;

        nextTick(() => {
            dangTuHuyMaGiamGia.value = false;
        });

    } else {
        selectedVoucher.value = voucher.id;
        maGiamGia.value = voucher.data.maPhieuGiamGia;
        apDungGiamGia();
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
    paymentMethod: 'card',
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
        toast.warning("Vui lòng điền đầy đủ thông tin liên hệ và địa chỉ nhận hàng.", {
            timeout: 4000,
            position: "top-right"
        });
        return;
    }
    if (shipFee.value === 0) {
        toast.error("❌ Không thể tính phí vận chuyển. Vui lòng kiểm tra lại địa chỉ hoặc thử lại.", {
            timeout: 4000,
            position: "top-right"
        });
        return;
    }

    const provinceName = provinces.value.find(p => p.ProvinceID == selectedProvince.value)?.ProvinceName || '';
    const districtName = districts.value.find(d => d.DistrictID == selectedDistrict.value)?.DistrictName || '';
    const wardName = wards.value.find(w => w.WardCode == selectedWard.value)?.WardName || '';

    let fullAddress = [];
    if (form.value.thonXom) fullAddress.push(form.value.thonXom);
    if (wardName) fullAddress.push(wardName);
    if (districtName) fullAddress.push(districtName);
    if (provinceName) fullAddress.push(provinceName);

    const combinedAddress = fullAddress.join(', ');

    const data = {
        tongTienSanPham: tongTienSanPham.value,
        phiVanChuyen: shipFee.value,
        tongCong: tongCong.value,
        tienGiam: tienGiam.value || 0,
        hoTen: form.value.firstName,
        diaChi: combinedAddress,
        ghiChu: form.value.orderNote,
        sdt: form.value.phone,
        email: form.value.email,
        maPhieuGiamGia: maGiamGia.value || null,
        sanPhamTrongGio: order.value.map(item => ({
            idSanPhamChiTiet: item.idSanPhamChiTiet,
            soLuong: item.soLuong,
            gia: item.phanTramGiamGia > 0 ? item.giaSauKhiGiam : item.giaTruocKhiGiam
        }))

    };
    console.log("Dữ liệu thanh toán:", data);


    try {
        await axios.put(`http://localhost:8080/client/capNhatHoaDon/${route.params.hoaDonId}`, data, {
            withCredentials: true
        });

        sessionStorage.removeItem("gioHang");     // Xóa local/session storage nếu có
        localStorage.removeItem("gioHang");
        window.dispatchEvent(new Event("cap-nhat-gio"));  // Gửi sự kiện để AppHeader reload lại giỏ hàng
        toast.success("✅ Thanh toán thành công!", {
            timeout: 4000,
            position: "top-right"
        });
        router.push({ name: "client-san-pham" });
    } catch (e) {
        console.error("Lỗi thanh toán:", e);
        alert("Thanh toán thất bại");
    }

}

onMounted(() => {
    fetchProvinces(); // Fetch provinces on component mount
    fetchOrder();
    window.addEventListener("cap-nhat-gio", fetchOrder);
    fetchPhieuGiamGia();
    watchEffect(() => {
        if (
            tongTienSanPham.value > 0 &&
            danhSachPhieu.value.length > 0 &&
            !giamGiaDaApDung.value &&
            !dangTuHuyMaGiamGia.value // thêm điều kiện này
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
        } else if (tongHienTai >= donToiThieu && !daCoMa && !dangTuHuyMaGiamGia.value) {
            apDungTuDongPhieuTotNhat(danhSachPhieu.value);
        }


        tongTienTruocDo.value = tongHienTai;
    }, { deep: true });

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

</style>
