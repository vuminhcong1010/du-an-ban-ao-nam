<template>
    <div class="order-container container my-5">
        <div class="row">
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
                        <input type="radio" value="card" v-model="form.paymentMethod" /> 💳 Thẻ tín dụng / ghi nợ
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
                            <small class="text-success ms-2"> Tiết kiệm -{{ Math.round(item.phanTramGiamGia) }}%</small>
                            <!-- Giá gốc và giá sau giảm nếu có giảm -->
                            <div class="small mb-1">
                                <template v-if="item.phanTramGiamGia > 0">

                                    <span class="text-decoration-line-through text-muted me-2">
                                        {{ formatCurrency(item.giaBan) }}
                                    </span>
                                    <span class="text-danger fw-bold">
                                        {{ formatCurrency(item.giaSauGiam) }}
                                    </span>
                                </template>
                                <template v-else>
                                    <span>{{ formatCurrency(item.giaBan) }}</span>
                                </template>
                            </div>

                            <div class="text-muted small mb-1">
                                Màu: {{ item.tenMau }} | Size: {{ item.tenKichCo }}
                            </div>

                            <div class="fw-bold text-dark small">
                                Tổng: {{ formatCurrency((item.phanTramGiamGia > 0 ? item.giaSauGiam : item.giaBan) *
                                    item.soLuong) }}
                            </div>
                        </div>

                        <div class="ms-3 d-flex align-items-center">
                            <input type="number" v-model="item.soLuong" min="1"
                                class="form-control form-control-sm text-center" style="width: 60px;" />
                        </div>
                    </div>


                    <div class="d-flex mb-3">
                        <input type="text" class="form-control" placeholder="Mã giảm giá" v-model="maGiamGia"
                            style="flex: 10; margin-right: 8px;" />
                        <button class="btn btn-dark" @click="apDungGiamGia" style="flex: 3;">Áp dụng</button>
                    </div>


                    <div class="d-flex justify-content-between">
                        <span>Tổng Tiền</span>
                        <span>{{ formatCurrency(tongTienSanPham) }}</span>
                    </div>
                    <!-- Trước phần Tổng tiền -->
                    <div class="d-flex justify-content-between mt-2">
                        <span>Phí vận chuyển</span>
                        <span>{{ formatCurrency(shipFee) }}</span>
                    </div>
                    <!-- Mã giảm giá nếu có -->
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
</template>

<script setup>
import { ref, onMounted, computed, watch, watchEffect } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification'
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



async function apDungGiamGia() {
    if (!maGiamGia.value.trim()) {
        toast.warning("Vui lòng nhập mã giảm giá.");
        return;
    }

    try {
        const response = await axios.get(`http://localhost:8080/client/tim-phieu-giam-gia?maPhieuGG=${maGiamGia.value}`);
        const phieu = response.data;

        // Trường hợp backend trả về null hoặc không tìm thấy mã
        if (!phieu || !phieu.id || phieu.trangThai !== 1) {
            toast.error("❌ Mã giảm giá không tồn tại hoặc đã hết hạn sử dụng.");
            giamGiaDaApDung.value = null;
            tienGiam.value = 0;
            return;
        }

        // Kiểm tra thời gian hiệu lực
        const now = new Date();
        const ngayBatDau = new Date(phieu.ngayBatDau);
        const ngayKetThuc = new Date(phieu.ngayKetThuc);
        if (now < ngayBatDau || now > ngayKetThuc) {
            toast.error("❌ Mã giảm giá này đã hết hạn hoặc chưa bắt đầu.");
            giamGiaDaApDung.value = null;
            tienGiam.value = 0;
            return;
        }

        // Kiểm tra điều kiện đơn hàng tối thiểu
        if (phieu.giamToiThieu && tongTienSanPham.value < phieu.giamToiThieu) {
            toast.error(`⚠️ Đơn hàng tối thiểu ${formatCurrency(phieu.giamToiThieu)} để áp dụng mã này.`);
            return;
        }

        // Lưu mã giảm giá hợp lệ
        giamGiaDaApDung.value = phieu;

        // Tính tiền được giảm
        if (phieu.soTienGiam) {
            tienGiam.value = phieu.soTienGiam;
        } else if (phieu.phamTramGiamGia) {
            const giamTheoPhanTram = (tongTienSanPham.value * phieu.phamTramGiamGia) / 100;
            tienGiam.value = Math.min(giamTheoPhanTram, phieu.giamToiDa || giamTheoPhanTram);
        }

        toast.success("🎉 Áp dụng mã giảm giá thành công!");
    } catch (e) {
        console.error("Lỗi khi áp dụng mã giảm giá:", e);
        toast.error("⚠️ Có lỗi xảy ra khi kiểm tra mã giảm giá. Vui lòng thử lại.");
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
    // Only calculate if serviceId, selectedDistrict, and selectedWard are all set
    if (serviceId.value !== null && selectedDistrict.value !== '' && selectedWard.value !== '') {
        calculateShipFee();
    } else {
        // Optionally reset shipFee if dependencies are not met, to prevent stale data
        shipFee.value = 0;
    }
});


// Existing order fetching and currency formatting functions
const fetchOrder = async () => {
    try {
        const res = await axios.get(`http://localhost:8080/client/laySanPhamTheoHoaDon/${route.params.hoaDonId}`);
        const products = res.data;

        // Với từng sản phẩm, gọi API lấy phần trăm giảm
        const productsWithDiscount = await Promise.all(products.map(async (item) => {
            const discountRes = await axios.get(`http://localhost:8080/client/giam-gia-chi-tiet/${item.idSanPhamChiTiet}`);
            const discounts = discountRes.data.data;

            // Tính trung bình phần trăm giảm (nếu có)
            let avgDiscount = 0;
            if (discounts && discounts.length > 0) {
                const totalDiscount = discounts.reduce((acc, val) => acc + val, 0);
                avgDiscount = totalDiscount / discounts.length;
            }

            // Tính giá bán gốc (giá 1 sản phẩm = thanhTien / soLuong)
            const giaGoc = item.thanhTien / item.soLuong;

            // Tính giá sau giảm
            const giaSauGiam = giaGoc * (1 - avgDiscount / 100);

            return {
                ...item,
                giaBan: giaGoc,
                phanTramGiamGia: avgDiscount,
                giaSauGiam,
            };
        }));

        order.value = productsWithDiscount;
    } catch (error) {
        console.error('Lỗi lấy đơn hàng hoặc giảm giá:', error);
    }
};
const tongTienSanPham = computed(() => {
    return order.value.reduce((total, item) => {
        if (item.phanTramGiamGia > 0) {
            return total + item.giaSauGiam * item.soLuong;
        }
        return total + item.giaBan * item.soLuong;
    }, 0);
});


function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}


const tongCong = computed(() => tongTienSanPham.value + shipFee.value - tienGiam.value);

async function thanhToan() {
    // Validation: Check if required fields are filled and a shipping fee has been calculated
    if (!form.value.email || !form.value.firstName || !form.value.phone || !selectedProvince.value || !selectedDistrict.value || !selectedWard.value) {
        alert("Vui lòng điền đầy đủ thông tin liên hệ và địa chỉ nhận hàng.");
        return;
    }
    if (shipFee.value === 0 && selectedWard.value && selectedDistrict.value) {
        // If fee is 0 but addresses are chosen, it might mean no service or calculation error
        alert("Không thể tính phí vận chuyển. Vui lòng kiểm tra lại địa chỉ hoặc thử lại.");
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
        hoTen: form.value.firstName,
        diaChi: combinedAddress,
        ghiChu: form.value.orderNote,
        sdt: form.value.phone
    };

    try {
        await axios.put(`http://localhost:8080/client/capNhatHoaDon/${route.params.hoaDonId}`, data, {
            withCredentials: true
        });

        alert("Thanh toán thành công!");
        router.push({ name: "client-san-pham" });
    } catch (e) {
        console.error("Lỗi thanh toán:", e);
        alert("Thanh toán thất bại");
    }
}

onMounted(() => {
    fetchProvinces(); // Fetch provinces on component mount
    fetchOrder();
});
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
    /* Tăng khoảng cách giữa 2 cột */
    align-items: flex-start;
    max-width: 1200px;
    /* Giới hạn chiều rộng tổng thể */
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
</style>
