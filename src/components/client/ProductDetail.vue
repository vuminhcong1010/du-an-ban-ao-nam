<template>
    <div class="container product-detail-page-container">
        <nav aria-label="breadcrumb" class="mb-4">
            <ol class="breadcrumb">
                <li class="breadcrumb-item"><a href="/">Trang chủ</a></li>
                <li class="breadcrumb-item"><a href="/products">Các sản phẩm</a></li>
                <li class="breadcrumb-item active" aria-current="page">{{ product ? product.name : 'Chi tiết sản phẩm'
                }}</li>
            </ol>
        </nav>

        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Đang tải chi tiết sản phẩm...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger text-center my-5">
            {{ error }}
            <button class="btn btn-primary mt-3" @click="goBack">Quay lại trang sản phẩm</button>
        </div>

        <div v-else-if="product" class="row product-detail-content">
            <div class="col-md-6 position-relative">
                <img :src="product.image || 'https://woocommerce.com/wp-content/uploads/2020/03/product-image-placeholder.png'"
                    class="img-fluid product-detail-image" :alt="product.name" />
                <span v-if="product.discount && product.discount > 0"
                    class="discount-badge-detail position-absolute top-0  end-0 bg-danger text-white px-2 py-1 m-3 rounded">
                    -{{ product.discount }}%
                </span>
            </div>

            <div class="col-md-6 product-info-section">
                <div class="d-flex justify-content-between align-items-baseline mb-2 product-price-section">
                    <h2 class="product-name-heading">{{ product.name }}</h2>
                    <div class="price-display">
                        <span v-if="product.discount && product.discount > 0" class="original-price-detail">
                            {{ formatCurrency(product.originalPrice) }}
                        </span>
                        <span class="current-price-detail">{{ formatCurrency(product.price) }}</span>
                    </div>
                </div>

                <div class="rating-section mb-3">
                    <span v-for="star in 5" :key="star" class="star">
                        <i v-if="star <= product.rating" class="bi bi-star-fill text-warning"></i>
                        <i v-else class="bi bi-star text-muted"></i>
                    </span>

                    <span class="ms-2 product-quantity-display">
                        Còn lại: {{ displayQuantityLeft }} sản phẩm
                    </span>

                </div>

                <div class="product-meta mb-3">
                    <p class="availability">
                        Khả dụng:
                        <span :class="product.quantity > 0 ? 'text-success' : 'text-danger'">
                            {{ product.quantity > 0 ? 'Còn hàng' : 'Hết hàng' }}
                        </span>
                    </p>
                    <p class="sku">Mã sản phẩm: {{ product.maSanPham }}</p>
                </div>

                <p class="product-short-description mb-4">
                    {{ product.description }}
                </p>

                <div v-if="product.colors && product.colors.length > 0" class="mb-3">
                    <h6 class="mb-2">Màu sắc:</h6>
                    <div class="d-flex flex-wrap gap-2">
                        <div v-for="color in product.colors" :key="color"
                            :class="['color-box-detail', mapColorToCssClass(color)]" :title="color">
                        </div>
                    </div>
                </div>

                <div v-if="product.sizes && product.sizes.length > 0" class="mb-4">
                    <h6 class="mb-2">Kích cỡ:</h6>
                    <div class="d-flex flex-wrap gap-2">
                        <span v-for="size in product.sizes" :key="size" class="badge bg-secondary size-badge">
                            {{ size }}
                        </span>
                    </div>
                </div>
                <div class="d-flex align-items-center mb-4 add-to-cart-section">
                    <div class="input-group quantity-input-group me-3">
                        <button class="btn btn-outline-secondary" type="button" @click="decreaseQuantity">-</button>
                        <input type="number" class="form-control text-center quantity-input" v-model.number="quantity"
                            min="1" />
                        <button class="btn btn-outline-secondary" type="button" @click="increaseQuantity">+</button>
                    </div>
                    <div v-if="showQuantityWarning" class="text-danger small mt-1">
                        Bạn đã vượt quá số lượng tồn kho. Đã đặt về tối đa có thể.
                    </div>
                    <button class="btn btn-dark add-to-cart-btn" :disabled="product.quantity === 0 || quantity === 0"
                        @click="themVaoGioHang">
                        Thêm vào giỏ hàng
                    </button>
                </div>

                <p class="product-category-bottom mb-3">Thể loại: <span class="fw-bold">{{ product.category }}</span>
                </p>

                <div class="product-actions d-flex align-items-center">
                    <a href="#" class="action-link">
                        <i class="bi bi-heart me-1"></i> Thêm vào danh sách mong muốn
                    </a>
                    <span class="mx-2 text-muted">|</span>
                    <a href="#" class="action-link">
                        <i class="bi bi-share me-1"></i> Chia sẻ
                    </a>
                </div>
            </div>
        </div>
        <div v-else class="alert alert-info text-center my-5">
            Không tìm thấy thông tin chi tiết sản phẩm.
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import Cookies from 'js-cookie';

const route = useRoute();
const router = useRouter();
const token = Cookies.get('token');

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const quantity = ref(1);
const displayQuantityLeft = ref(0);
const showQuantityWarning = ref(false);

const themVaoGioHang = async () => {
    if (!product.value) return;

    const tongTien = product.value.price * quantity.value;

    const payload = {
        idSanPhamChiTiet: product.value.id,
        soLuong: quantity.value,
        gia: product.value.price,
        tongTien: tongTien,
        tenSanPham: product.value.name,
        anhSanPham: product.value.image,
        phanTramGiamGia: product.value.discount || 0

    };
    console.log("Giá gửi đi:", product.value.price);
    console.log("📦 Product:", product.value);

    try {
        const res = await axios.post(
            'http://localhost:8080/hoa-don/clientThemSanPham',
            payload,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            }
        );

        console.log('✅ Đã thêm vào giỏ hàng:', res.data);
        window.dispatchEvent(new Event("cap-nhat-gio"));
    } catch (err) {
        console.error('❌ Lỗi khi thêm vào giỏ hàng:', err);
        alert('Không thể thêm sản phẩm vào giỏ hàng.');
    }
};

watch(quantity, (newQty) => {
    if (!product.value) return;

    showQuantityWarning.value = false; // Mặc định tắt

    if (!Number.isInteger(newQty) || newQty <= 0) {
        quantity.value = 1;
        displayQuantityLeft.value = product.value.quantity - 1;
        return;
    }

    if (newQty > product.value.quantity) {
        quantity.value = product.value.quantity;
        displayQuantityLeft.value = 0;
        showQuantityWarning.value = true; // ⚠️ Bật cảnh báo
    } else {
        displayQuantityLeft.value = product.value.quantity - newQty;
    }
});


const fetchProductDetail = async (productId) => {
    loading.value = true;
    error.value = null;
    product.value = null;
    quantity.value = 1;

    if (!productId) {
        error.value = "Không có ID sản phẩm được cung cấp.";
        loading.value = false;
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/api/client/san-pham/chi-tiet/${productId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
        });
        console.log("Fetching product with ID:", productId);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("Sản phẩm không tìm thấy.");
            }
            throw new Error(`Lỗi HTTP! status: ${response.status}`);
        }

        const data = await response.json();
        if (data) {
            product.value = {
                id: data.idSanPham,
                name: data.tenSanPham,
                image: data.anhSanPham,
                price: data.giaSauKhiGiam,
                originalPrice: data.giaTruocKhiGiam,
                discount: data.phamTramGiam,
                rating: data.diemDanhGia,
                reviews: data.soLuongDanhGia,
                category: data.tenDanhMuc,
                // Giả định API trả về mảng màu và kích cỡ
                sizes: Array.isArray(data.kichCo) ? data.kichCo : (data.kichCo ? [data.kichCo] : []),
                colors: Array.isArray(data.mauSac) ? data.mauSac : (data.mauSac ? [data.mauSac] : []),
                createdAt: data.ngayTaoChiTietSanPham,
                quantity: data.soLuong, // Lượng tồn kho
                maSanPham: data.maSanPham, // Thêm mã sản phẩm

                description: data.moTa || "Cư dân Pellerntesque morbi tristique senectus et netus et malesuada nỗ tiếng ac turpis egestas. Vestibulum tortor quam, feugiat vita, ultricies eget, tempor sit amet, ame. Donec eu libero sit amet quam egestas semper. Aenean ultricies mị vitae est.Maris placerat eleifend leo."
            };
            displayQuantityLeft.value = product.value.quantity - quantity.value;
            if (product.value.quantity === 0) {
                quantity.value = 0;
            }
        } else {
            error.value = "Không có dữ liệu sản phẩm.";
        }
    } catch (e) {
        console.error("Lỗi khi fetch chi tiết sản phẩm:", e);
        error.value = `Không thể tải chi tiết sản phẩm: ${e.message}`;
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchProductDetail(route.params.id);
});

watch(() => route.params.id, (newId) => {
    fetchProductDetail(newId);
});

function increaseQuantity() {
    if (product.value && quantity.value < product.value.quantity) {
        quantity.value++;
    }
}

function decreaseQuantity() {
    // Không cho phép số lượng nhỏ hơn 1, trừ khi sản phẩm hết hàng thì có thể là 0
    if (quantity.value > 1) {
        quantity.value--;
    } else if (quantity.value === 1 && product.value.quantity === 0) {
        quantity.value = 0; // Nếu hết hàng và đang ở 1, cho phép về 0
    } else if (quantity.value === 1) {
        quantity.value = 1; // Giữ ở 1 nếu đang ở 1 và còn hàng
    }
}


function formatCurrency(value) {
    if (typeof value !== 'number') return '0 VND';
    // Format thành tiền Việt Nam Đồng
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    // Nếu muốn hiển thị EUR như hình ảnh, bạn cần chuyển đổi giá trị và format như sau:
    // const eurValue = value / 27000; // Ví dụ: 1 EUR = 27000 VND
    // return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(eurValue);
}

function mapColorToCssClass(apiColor) {
    if (!apiColor) return '';
    const lowerCaseColor = apiColor.toLowerCase();
    switch (lowerCaseColor) {
        case 'đỏ': return 'red';
        case 'xanh': return 'blue';
        case 'xanh lá': return 'green';
        case 'đen': return 'black';
        case 'xám': return 'gray';
        case 'cam': return 'orange';
        case 'vàng': return 'yellow';
        case 'trắng': return 'white';
        // Thêm các màu khác nếu cần
        default: return lowerCaseColor;
    }
}

function goBack() {
    router.back();
}
</script>

<style scoped>
.product-detail-page-container {
    padding: 30px 0;
    /* Giữ padding trên dưới */
    /* Loại bỏ max-width để nó chiếm toàn bộ chiều rộng có thể của container cha */
    /* Hoặc đặt một max-width lớn hơn nếu bạn có một layout tổng thể cố định */
    /* max-width: 1200px; /* Ví dụ: tăng chiều rộng tối đa */
    margin: auto;
    /* Để căn giữa nếu có max-width */
}

/* Breadcrumb */
.breadcrumb-item a {
    color: #007bff;
    text-decoration: none;
}

.breadcrumb-item.active {
    color: #6c757d;
}

.product-detail-content {
    background-color: #fff;
    padding: 25px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
}

.product-detail-image {
    width: 100%;
    height: auto;
    max-height: 600px;
    /* Tăng chiều cao tối đa của ảnh */
    object-fit: contain;
    border-radius: 8px;
}

.product-info-section {
    padding-left: 30px;
    display: flex;
    flex-direction: column;
}

.product-name-heading {
    font-size: 2.5rem;
    /* Tăng kích thước tiêu đề */
    margin-bottom: 5px;
    color: #333;
    flex-grow: 1;
    /* Cho phép tiêu đề chiếm không gian còn lại */
}

/* Updated Price Display Styles */
.product-price-section .price-display {
    display: flex;
    align-items: baseline;
    gap: 10px;
    /* Khoảng cách giữa các phần giá */
}

.product-price-section .original-price-detail {
    font-size: 1.5rem;
    /* Kích thước chữ cho giá gốc */
    color: #888;
    text-decoration: line-through;
    white-space: nowrap;
    /* Ngăn không cho giá gốc bị xuống dòng */
}

.product-price-section .current-price-detail {
    font-size: 2.2rem;
    font-weight: bold;
    color: #333;
    white-space: nowrap;
}

.product-price-section .discount-badge-detail {
    background-color: #dc3545;
    color: white;
    padding: 4px 8px;
    border-radius: 5px;
    font-size: 0.9rem;
    font-weight: bold;
    white-space: nowrap;
}

/* Điều chỉnh lại .product-price-top nếu không còn dùng */
.product-price-top {
    display: none;
    /* Ẩn product-price-top cũ vì đã có price-display mới */
}


.rating-section .star i {
    font-size: 1.3rem;
    /* Tăng kích thước sao */
    color: #ffc107;
}

.rating-section .text-muted {
    color: #888 !important;
}

.rating-count {
    font-size: 1rem;
    /* Tăng kích thước số lượng đánh giá */
    color: #888;
}

.rating-section .product-quantity-display {
    font-size: 1rem;
    /* Kích thước chữ cho số lượng sản phẩm */
    color: #555;
    margin-left: 10px;
    /* Khoảng cách từ rating-count */
}


.product-meta p {
    margin-bottom: 5px;
    font-size: 1rem;
    /* Tăng kích thước chữ */
    color: #555;
}

.product-meta .availability {
    font-weight: bold;
}

.product-meta .text-success {
    color: #28a745 !important;
}

.product-meta .text-danger {
    color: #dc3545 !important;
}

.product-meta .sku {
    color: #888;
}

.product-short-description {
    line-height: 1.8;
    /* Tăng khoảng cách dòng */
    color: #555;
    font-size: 1rem;
    /* Tăng kích thước chữ */
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    margin-bottom: 20px;
}

.add-to-cart-section {
    margin-top: 20px;
}

.quantity-input-group {
    max-width: 150px;
    /* Tăng chiều rộng input số lượng */
}

.quantity-input {
    border-color: #ddd;
    box-shadow: none;
    font-size: 1.1rem;
    /* Tăng kích thước chữ trong input */
}

.quantity-input-group .btn {
    border-color: #ddd;
    background-color: #f8f9fa;
    color: #333;
    font-size: 1.1rem;
    /* Tăng kích thước nút +/- */
}

.quantity-input-group .btn:hover {
    background-color: #e2e6ea;
}

.add-to-cart-btn {
    background-color: #212529;
    color: white;
    padding: 12px 30px;
    /* Tăng padding nút thêm vào giỏ hàng */
    font-size: 1.2rem;
    /* Tăng kích thước chữ nút */
    border-radius: 5px;
    border: none;
    transition: background-color 0.2s;
}

.add-to-cart-btn:hover:not(:disabled) {
    background-color: #000;
}

.add-to-cart-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.product-category-bottom {
    font-size: 1rem;
    /* Tăng kích thước chữ */
    color: #555;
}

.product-actions {
    margin-top: 15px;
    padding-top: 15px;
    border-top: 1px solid #eee;
}

.action-link {
    color: #6c757d;
    text-decoration: none;
    font-size: 1rem;
    /* Tăng kích thước chữ */
}

.action-link:hover {
    color: #000;
}

/* Các lớp màu cho color-box-detail nếu bạn muốn hiển thị các vòng tròn màu */
.color-box-detail {
    width: 30px;
    /* Tăng kích thước vòng tròn màu */
    height: 30px;
    /* Tăng kích thước vòng tròn màu */
    border-radius: 50%;
    border: 1px solid #eee;
    margin-right: 10px;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
    /* Thêm con trỏ để gợi ý click */
}

/* Thêm badge cho kích cỡ để trông đẹp hơn */
.size-badge {
    padding: 8px 12px;
    font-size: 0.95rem;
    border-radius: 5px;
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
}

/* Thêm các định nghĩa màu */
.color-box-detail.red {
    background-color: #dc3545;
}

.color-box-detail.blue {
    background-color: #007bff;
}

.color-box-detail.green {
    background-color: #28a745;
}

.color-box-detail.black {
    background-color: #000;
}

.color-box-detail.gray {
    background-color: #6c757d;
}

.color-box-detail.orange {
    background-color: #fd7e14;
}

.color-box-detail.yellow {
    background-color: #ffc107;
}

.color-box-detail.white {
    background-color: #fff;
    border: 1px solid #ccc;
}


/* Media queries để đảm bảo responsive trên các màn hình nhỏ hơn */
@media (max-width: 991.98px) {
    .product-info-section {
        padding-left: 15px;
        /* Giảm padding cho màn hình tablet trở xuống */
        padding-top: 20px;
        /* Thêm padding trên để tách khỏi ảnh */
    }

    .product-name-heading {
        font-size: 2rem;
    }

    .product-price-section .current-price-detail {
        font-size: 1.6rem;
    }

    .product-price-section .original-price-detail {
        font-size: 1.2rem;
    }

    .add-to-cart-btn {
        padding: 10px 20px;
        font-size: 1rem;
    }
}

@media (max-width: 767.98px) {
    .product-detail-page-container {
        padding: 20px 15px;
        /* Giảm padding tổng thể trên mobile */
    }

    .product-detail-content {
        padding: 15px;
    }

    .product-info-section {
        padding-left: 0;
        /* Loại bỏ padding trái trên mobile để căn chỉnh */
    }

    .product-detail-image {
        max-height: 400px;
    }

    .d-flex.justify-content-between.align-items-baseline.mb-2 {
        flex-direction: column;
        /* Xếp chồng tên sản phẩm và giá trên mobile */
        align-items: flex-start !important;
    }

    .product-price-section .price-display {
        margin-left: 0;
        margin-top: 5px;
    }

    .add-to-cart-section {
        flex-direction: column;
        /* Xếp chồng số lượng và nút thêm giỏ hàng */
        align-items: flex-start !important;
    }

    .quantity-input-group {
        margin-right: 0 !important;
        margin-bottom: 15px;
        width: 100%;
        /* Chiếm toàn bộ chiều rộng có thể */
        max-width: none;
        /* Bỏ giới hạn chiều rộng */
    }

    .add-to-cart-btn {
        width: 100%;
        /* Chiếm toàn bộ chiều rộng trên mobile */
    }
}
</style>