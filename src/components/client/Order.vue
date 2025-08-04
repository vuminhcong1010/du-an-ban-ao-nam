<template>
    <div class="order-container container my-5">
        <div class="row">
            <!-- Thông tin thanh toán -->
            <div class="col-md-7">
                <h4>Thông tin liên lạc</h4>
                <form @submit.prevent="thanhToan" novalidate>
                    <div class="mb-3">
                        <label for="email" class="form-label">E-MAIL</label>
                        <input type="email" id="email" class="form-control" v-model="form.email" required
                            placeholder="john@example.com" />
                    </div>

                    <h4 class="mt-4">Chi tiết thanh toán</h4>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="firstName" class="form-label">TÊN</label>
                            <input type="text" id="firstName" class="form-control" v-model="form.firstName" required
                                placeholder="John" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="lastName" class="form-label">HỌ</label>
                            <input type="text" id="lastName" class="form-control" v-model="form.lastName" required
                                placeholder="Doe" />
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="address1" class="form-label">ĐỊA CHỈ 1</label>
                        <input type="text" id="address1" class="form-control" v-model="form.address1" required
                            placeholder="Đường O'Connell 47" />
                    </div>

                    <div class="mb-3">
                        <label for="address2" class="form-label">ĐỊA CHỈ 2 (TÙY CHỌN)</label>
                        <input type="text" id="address2" class="form-control" v-model="form.address2"
                            placeholder="Căn hộ, studio hoặc tầng" />
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="city" class="form-label">THÀNH PHỐ</label>
                            <input type="text" id="city" class="form-control" v-model="form.city" required
                                placeholder="New York" />
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="state" class="form-label">TIỂU BANG (TÙY CHỌN)</label>
                            <input type="text" id="state" class="form-control" v-model="form.state"
                                placeholder="Kilkenny" />
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="country" class="form-label">QUỐC GIA</label>
                            <select id="country" class="form-select" v-model="form.country" required>
                                <option value="" disabled>Chọn quốc gia</option>
                                <option>Cộng hòa Ireland</option>
                                <option>Việt Nam</option>
                                <option>Hoa Kỳ</option>
                                <option>...</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="zip" class="form-label">MÃ BƯU CHÍNH / ZIP</label>
                            <input type="text" id="zip" class="form-control" v-model="form.zip" required
                                placeholder="10001" />
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="phone" class="form-label">ĐIỆN THOẠI (TÙY CHỌN)</label>
                        <input type="tel" id="phone" class="form-control" v-model="form.phone"
                            placeholder="+1 234 567 8901" />
                    </div>
                </form>
                <!-- Chọn phương thức vận chuyển -->
                <h5 class="mt-4">Chọn phương thức vận chuyển</h5>
                <div class="radio-card-group mb-3">
                    <label class="radio-card" :class="{ selected: form.shipping === '0' }">
                        <input type="radio" value="0" v-model="form.shipping" /> Miễn phí vận chuyển<br />
                        <small>0,00 đồng</small>
                    </label>

                    <label class="radio-card" :class="{ selected: form.shipping === '10' }">
                        <input type="radio" value="10" v-model="form.shipping" /> Vận chuyển tiêu chuẩn<br />
                        <small>10.000 đồng</small>
                    </label>

                    <label class="radio-card" :class="{ selected: form.shipping === '25' }">
                        <input type="radio" value="25" v-model="form.shipping" /> Vận chuyển nhanh<br />
                        <small>25.000 đồng</small>
                    </label>
                </div>

                <!-- Tùy chọn thanh toán -->
                <h5 class="mt-4">Tùy chọn thanh toán</h5>
                <div class="radio-card-group mb-3">
                    <label class="radio-card" :class="{ selected: form.paymentMethod === 'card' }">
                        <input type="radio" value="card" v-model="form.paymentMethod" /> 💳 Thẻ tín dụng / ghi nợ
                    </label>

                    <label class="radio-card" :class="{ selected: form.paymentMethod === 'paypal' }">
                        <input type="radio" value="paypal" v-model="form.paymentMethod" /> 🅿️ PayPal
                    </label>

                    <label class="radio-card" :class="{ selected: form.paymentMethod === 'cod' }">
                        <input type="radio" value="cod" v-model="form.paymentMethod" /> 💵 COD
                    </label>
                </div>

                <!-- Ghi chú đơn hàng -->
                <div class="mb-3">
                    <label for="orderNote" class="form-label">Ghi chú đơn hàng (Tùy chọn)</label>
                    <textarea id="orderNote" rows="3" v-model="form.orderNote"
                        placeholder="Ghi chú về đơn hàng, ví dụ ghi chú đặc biệt về việc giao hàng"></textarea>
                </div>


            </div>

            <!-- Tóm tắt đơn hàng -->
            <div class="col-md-5">
                <div class="card p-4 sticky-summary">
                    <h5 class="mb-3">Tóm tắt đơn hàng</h5>

                    <div v-for="(item, index) in order" :key="index" class="d-flex align-items-center mb-3">
                        <img :src="item.duongDanAnh" alt="Ảnh sản phẩm" width="60" class="me-3 rounded" />
                        <div>
                            <p class="mb-1">{{ item.tenSanPham }}</p>
                            <small>{{ item.soLuong }} × {{ formatCurrency(item.gia) }} = {{
                                formatCurrency(item.thanhTien) }}</small>
                        </div>
                    </div>

                    <div class="input-group mb-3">
                        <input type="text" class="form-control" placeholder="Mã giảm giá" v-model="maGiamGia" />
                        <button class="btn btn-dark" @click="apDungGiamGia">Áp dụng</button>
                    </div>

                    <div class="d-flex justify-content-between">
                        <span>Tổng phụ</span>
                        <span>{{ formatCurrency(tongTienSanPham) }}</span>
                    </div>
                    <div class="d-flex justify-content-between">
                        <span>Vận chuyển</span>
                        <span>{{ formatCurrency(phiVanChuyen) }}</span>
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
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router'; 

const router = useRouter();  
const route = useRoute();
const order = ref([]);

const phiVanChuyen = ref(0);
const maGiamGia = ref('');

const form = ref({
    email: '',
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    phone: '',
    shipping: '0',
    paymentMethod: 'card',
    orderNote: ''
});
function groupProducts(products) {
    const grouped = {};

    products.forEach((item) => {
        const id = item.idSanPham; // hoặc item.id nếu API trả về tên khác

        if (!grouped[id]) {
            grouped[id] = { ...item }; // clone object
        } else {
            grouped[id].soLuong += item.soLuong;
            grouped[id].thanhTien += item.thanhTien;
        }
    });

    return Object.values(grouped);
}
// Load dữ liệu từ API
async function fetchOrder() {
    try {
        const res = await axios.get(`http://localhost:8080/client/laySanPhamTheoHoaDon/${route.params.hoaDonId}`, {
            withCredentials: true
        });

        order.value = groupProducts(res.data);
    } catch (e) {
        console.error('Lỗi khi lấy đơn hàng:', e);
    }
}

function formatCurrency(value) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);
}

const tongTienSanPham = computed(() =>
    order.value.reduce((sum, item) => sum + item.thanhTien, 0)
);

const tongCong = computed(() => tongTienSanPham.value + phiVanChuyen.value);


async function thanhToan() {
    const diaChiGop = form.value.address1 + (form.value.address2 ? ', ' + form.value.address2 : '');

    const data = {
        tongTienSanPham: tongTienSanPham.value,
        phiVanChuyen: Number(form.value.shipping),
        hoTen: form.value.firstName + ' ' + form.value.lastName,
        diaChi: diaChiGop,
        ghiChu: form.value.orderNote,
          sdt: form.value.phone  
    };

    try {
        await axios.put(`http://localhost:8080/client/capNhatHoaDon/${route.params.hoaDonId}`, data, {
            withCredentials: true
        });

        alert("Thanh toán thành công!");
        // Có thể redirect hoặc xoá session/localStorage nếu cần
         router.push({ name: "client-san-pham" });  // chuyển hướng về trang client-san-pham
    } catch (e) {
        console.error("Lỗi thanh toán:", e);
        alert("Thanh toán thất bại");
    }
}

onMounted(() => {
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
