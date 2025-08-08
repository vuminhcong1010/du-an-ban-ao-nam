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
                                <option v-for="p in provinces" :key="p.code" :value="p.code">
                                    {{ p.name }}
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
                                <option v-for="d in districts" :key="d.code" :value="d.code">
                                    {{ d.name }}
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
                                <option v-for="w in wards" :key="w.code" :value="w.code">
                                    {{ w.name }}
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

                        <!-- Thông tin sản phẩm -->
                        <div style="flex-grow: 1;">
                            <!-- Tên sản phẩm -->
                            <p class="mb-1 fw-semibold">{{ item.tenSanPham }}</p>

                            <!-- Giá bán -->
                            <div class="text-muted small mb-1">
                                {{ formatCurrency(item.giaBan) }}
                            </div>

                            <!-- Tổng tiền sản phẩm -->
                            <div class="fw-bold text-dark small">
                                Tổng: {{ formatCurrency(item.giaBan * item.soLuong) }}
                            </div>

                        </div>

                        <!-- Ô nhập số lượng -->
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
                    <hr />
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
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

const router = useRouter();
const route = useRoute();
const order = ref([]);

const phiVanChuyen = ref(0);
const maGiamGia = ref('');

const provinces = ref([]);
const districts = ref([]);
const wards = ref([]);
const selectedProvince = ref('');
const selectedDistrict = ref('');
const selectedWard = ref('');

const form = ref({
    email: '',
    firstName: '',
    thonXom: '', // Changed from 'address'
    phone: '',
    paymentMethod: 'card',
    orderNote: ''
});

// Fetching address data from API
const fetchProvinces = async () => {
    try {
        const res = await axios.get('http://provinces.open-api.vn/api/p/');
        provinces.value = res.data;
    } catch (error) {
        console.error("Error fetching provinces:", error);
    }
};

const fetchDistricts = async (provinceCode) => {
    try {
        const res = await axios.get(`http://provinces.open-api.vn/api/p/${provinceCode}?depth=2`);
        districts.value = res.data.districts;
    } catch (error) {
        console.error("Error fetching districts:", error);
    }
};

const fetchWards = async (districtCode) => {
    try {
        const res = await axios.get(`http://provinces.open-api.vn/api/d/${districtCode}?depth=2`);
        wards.value = res.data.wards;
    } catch (error) {
        console.error("Error fetching wards:", error);
    }
};

watch(selectedProvince, (newVal) => {
    if (newVal) {
        fetchDistricts(newVal);
        selectedDistrict.value = '';
        wards.value = [];
        selectedWard.value = '';
    } else {
        districts.value = [];
        wards.value = [];
        selectedDistrict.value = '';
        selectedWard.value = '';
    }
});

watch(selectedDistrict, (newVal) => {
    if (newVal) {
        fetchWards(newVal);
        selectedWard.value = '';
    } else {
        wards.value = [];
        selectedWard.value = '';
    }
});

async function fetchOrder() {
    try {
        const res = await axios.get(`http://localhost:8080/client/laySanPhamTheoHoaDon/${route.params.hoaDonId}`, {
            withCredentials: true
        });

        // Gán thêm thuộc tính giaBan khi load dữ liệu
        order.value = res.data.map(item => {
            const giaBan = item.thanhTien / item.soLuong;
            return {
                ...item,
                giaBan, // lưu lại đơn giá gốc
            };
        });
    } catch (e) {
        console.error('Lỗi khi lấy đơn hàng:', e);
    }
}



function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

const tongTienSanPham = computed(() =>
    order.value.reduce((sum, item) => sum + (item.giaBan * item.soLuong), 0)
);

const tongCong = computed(() => tongTienSanPham.value); // Ensure shipping is a number

async function thanhToan() {
    const provinceName = provinces.value.find(p => p.code == selectedProvince.value)?.name || '';
    const districtName = districts.value.find(d => d.code == selectedDistrict.value)?.name || '';
    const wardName = wards.value.find(w => w.code == selectedWard.value)?.name || '';


    let fullAddress = [];
    if (form.value.thonXom) fullAddress.push(form.value.thonXom);
    if (wardName) fullAddress.push(wardName);
    if (districtName) fullAddress.push(districtName);
    if (provinceName) fullAddress.push(provinceName);

    const combinedAddress = fullAddress.join(', ');

    const data = {
        tongTienSanPham: tongTienSanPham.value,
        phiVanChuyen: Number(form.value.shipping),
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
    background-color: #f9f9f9;
    padding: 1rem;
    min-height: 80vh;
    display: flex;
    gap: 2rem;
    justify-content: center;
    align-items: flex-start;
    flex-wrap: wrap;
}

/* Cột Thông tin thanh toán */
.col-md-7 {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 0 12px rgb(0 0 0 / 0.1);
    padding: 2rem 2.5rem;
    flex: 1 1 480px;
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
