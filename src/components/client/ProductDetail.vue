<template>
    <div class="container product-detail-page-container">
        <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Đang tải chi tiết sản phẩm...</p>
        </div>

        <div v-else-if="product" class="row product-detail-content">
            <div class="col-md-6 position-relative">
                <div v-if="product.images.length > 0">
                    <img :src="selectedImage" class="img-fluid product-detail-image mb-3" />

                    <div class="d-flex flex-wrap gap-2">
                        <img v-for="(img, index) in product.images.slice(0, 4)" :key="index" :src="img"
                            class="img-thumbnail" :class="{ 'border border-primary': img === selectedImage }"
                            @click="selectedImage = img"
                            style="width: 80px; height: 80px; object-fit: cover; cursor: pointer;" />
                    </div>

                    <span v-if="product.discount && product.discount > 0"
                        class="discount-badge-detail position-absolute top-0  end-0 bg-danger text-white px-2 py-1 m-3 rounded">
                        -{{ product.discount }}%
                    </span>
                </div>
            </div>

            <div class="col-md-6 product-info-section">
                <div class="mb-2 product-price-section">
                    <h2 class="product-name-heading">{{ product.name }}</h2>
                    <div class="price-display mt-1">
                        <!-- Nếu có giảm giá -->
                        <template v-if="product.discount > 0">
                            <span class="original-price-detail">
                                {{ formatCurrency(product.minOriginalPrice) }}
                                <template v-if="product.minOriginalPrice !== product.maxOriginalPrice">
                                    - {{ formatCurrency(product.maxOriginalPrice) }}
                                </template>
                            </span>
                            <span class="current-price-detail">
                                {{ formatCurrency(product.minPrice) }}
                                <template v-if="product.minPrice !== product.maxPrice">
                                    - {{ formatCurrency(product.maxPrice) }}
                                </template>
                            </span>
                        </template>

                        <!-- Không giảm giá -->
                        <template v-else>
                            <span class="current-price-detail">
                                {{ formatCurrency(product.minPrice) }}
                                <template v-if="product.minPrice !== product.maxPrice">
                                    - {{ formatCurrency(product.maxPrice) }}
                                </template>
                            </span>
                        </template>
                    </div>

                </div>

                <div class="rating-section mb-3">
                    <span v-for="star in 5" :key="star" class="star">
                        <i v-if="star <= product.rating" class="bi bi-star-fill text-warning"></i>
                        <i v-else class="bi bi-star text-muted"></i>
                    </span>

                    <span class="ms-2 product-quantity-display">
                        Còn lại: {{ remainingQuantity > 0 ? remainingQuantity : 0 }} sản phẩm
                    </span>


                </div>

                <div class="product-meta mb-3">
                    <p>
                        <strong>Khả dụng:</strong>
                        <span :style="{ color: product.quantity > 0 ? 'green' : 'red' }">
                            {{ product.quantity > 0 ? 'Còn hàng' : 'Hết hàng' }}
                        </span>
                    </p>

                    <p class="sku">Mã sản phẩm: {{ product.maSanPham }}</p>
                </div>

                <p class="product-short-description mb-4">
                    {{ product.description }}
                </p>
                <div class="d-flex flex-wrap gap-2">
                    <h6 class="mb-2">Màu Sắc:</h6>
                    <div v-for="color in product.colors" :key="color" class="color-box-detail position-relative"
                        :style="{ backgroundColor: mapColorToCssClass(color), cursor: 'pointer' }" :title="color"
                        @click="toggleColor(color)">
                        <span v-if="selectedColors.includes(color)"
                            class="position-absolute top-50 start-50 translate-middle text-white fw-bold">
                            ✓
                        </span>
                    </div>
                </div>
                <div class="mb-4">
                    <h6 class="mb-2">Kích cỡ:</h6>
                    <div class="d-flex flex-wrap gap-2">
                        <span v-for="size in availableSizes" :key="size.soCo" class="badge size-badge" :class="{
                            'bg-primary text-white': selectedSizes.includes(size),
                            'bg-secondary text-light': !selectedSizes.includes(size)
                        }" :style="{
                            cursor: 'pointer',
                            opacity: size.soLuong > 0 ? 1 : 0.4
                        }" @click="toggleSize(size)"
                            :title="size.soLuong > 0 ? `Còn ${size.soLuong} sản phẩm` : 'Hết hàng'">
                            {{ size.soCo }}
                        </span>

                    </div>
                </div>

                <div class="d-flex align-items-center mb-4 add-to-cart-section">
                    <div class="input-group quantity-input-group me-3">
                        <input type="number" class="form-control text-center quantity-input" v-model.number="quantity"
                            min="1" />
                    </div>
                    <div class="d-flex align-items-stretch gap-2 mt-3">
                        <button class="btn btn-dark flex-grow-1" @click="themVaoGioHang">
                            Thêm vào giỏ hàng
                        </button>
                        <button class="btn btn-danger flex-grow-1" @click="muaNgay">
                            <i class="fa fa-bolt me-1"></i> Mua ngay
                        </button>
                    </div>
                </div>
                <p class="product-category-bottom mb-3">Thể loại: <span class="fw-bold">{{ product.category }}</span>
                </p>
                <div v-if="product.quantity === 0" class="alert alert-warning mt-3">
                    Sản phẩm bạn chọn hiện đã hết hàng. Vui lòng chọn màu sắc hoặc kích cỡ khác.
                </div>

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
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useToast } from 'vue-toastification'
const toast = useToast();

const route = useRoute();
const router = useRouter();

const product = ref(null);
const loading = ref(true);
const error = ref(null);
const quantity = ref(1);
const selectedImage = ref('');
const selectedColors = ref([]);
const selectedSizes = ref([]);
const remainingQuantity = ref(0);
const sizeEnabled = ref(false);
const availableSizes = ref([]);
let slideshowInterval = null;

function startSlideshow() {
    if (!product.value || product.value.images.length === 0) return;

    let index = 0;

    slideshowInterval = setInterval(() => {
        index = (index + 1) % product.value.images.length;
        selectedImage.value = product.value.images[index];
    }, 1500);
}


onUnmounted(() => {
    if (slideshowInterval) clearInterval(slideshowInterval);
});

async function toggleColor(color) {
    if (selectedColors.value.includes(color)) {
        selectedColors.value = [];
        selectedSizes.value = [];
        sizeEnabled.value = false;
        return;
    }

    selectedColors.value = [color];
    selectedSizes.value = [];
    quantity.value = 1;

    try {
        const res = await axios.get('http://localhost:8080/client/Tim-kich-co', {
            params: {
                idSp: product.value.id,
                tenMau: color
            }
        });

        if (res.data?.data?.length > 0) {
            sizeEnabled.value = true;
            availableSizes.value = res.data.data.map(kc => ({
                id: kc.id,
                soCo: kc.idSize.soCo,
                hienThi: kc.hienThi || kc.idSize.soCo,
                soLuong: kc.soLuong
            }));

        } else {
            sizeEnabled.value = false;
        }
    } catch (e) {
        console.error("Lỗi gọi API kích cỡ:", e);
        sizeEnabled.value = false;
    }
}

function getDiscountPercentage(discounts) {
    if (!discounts || !discounts.length) return 0;
    const unique = [...new Set(discounts)];
    if (unique.length === 1) return unique[0];
    // trung bình
    const sum = discounts.reduce((a, b) => a + b, 0);
    return Math.round(sum / discounts.length);
}

async function toggleSize(size) {
    if (!selectedColors.value.length) {
        toast.warning("Vui lòng chọn màu sắc trước.");
        return;
    }

    if (product.value.quantity <= 0) {
        toast.warning("Sản phẩm bạn chọn đã hết hàng. Vui lòng chọn loại khác.");
    }

    const selectedColor = selectedColors.value[0];

    if (selectedSizes.value.includes(size)) {
        selectedSizes.value = [];
        return;
    }

    selectedSizes.value = [size];
    quantity.value = 1;

    try {
        // Gọi API chi tiết sản phẩm theo màu và size
        const resDetail = await axios.get("http://localhost:8080/client/san-pham-chi-tiet", {
            params: { idSanPham: product.value.id, mauSac: selectedColor, kichCo: size.soCo }
        });

        const detail = resDetail.data;
        const chiTiet = detail.chiTietSanPhams?.[0];

        if (!chiTiet || typeof chiTiet.gia !== 'number') {
            toast.error("Không tìm thấy thông tin sản phẩm phù hợp.");
            return;
        }

        const originalPrice = chiTiet.gia;

        // Gọi API giảm giá theo ID chi tiết sản phẩm
        const resDisc = await axios.get(`http://localhost:8080/client/giam-gia-chi-tiet/${chiTiet.id}`);
        const discounts = resDisc.data?.data || [];

        const discountPerc = getDiscountPercentage(discounts);
        const discountedPrice = Math.round(originalPrice * (100 - discountPerc) / 100);

        // Cập nhật product
        product.value.discount = discountPerc;

        product.value.minOriginalPrice = originalPrice;
        product.value.maxOriginalPrice = originalPrice;

        product.value.minPrice = discountedPrice;
        product.value.maxPrice = discountedPrice;

        product.value.images = detail.anhSanPham || [];
        selectedImage.value = product.value.images[0] || '';

        product.value.quantity = chiTiet.soLuong || 0;
        remainingQuantity.value = product.value.quantity - quantity.value;

        // Cập nhật các thông tin bổ sung nếu cần
        product.value.maSanPham = chiTiet.idSanPham.maSanPham || "";
        product.value.description = chiTiet.moTa || "";
        product.value.category = detail.tenDanhMuc?.[0] || "Không rõ"; // Lấy danh mục đầu tiên

    } catch (err) {
        console.error("Lỗi khi fetch chi tiết sản phẩm:", err);
        toast.error("Không thể cập nhật sản phẩm chi tiết.");
    }
}




const colorMap = {
    'đỏ': '#FF0000',
    'đỏ đậm': '#8B0000',
    'đỏ tươi': '#FF2400',
    'đỏ cam': '#FF4500',
    'hồng': '#FFC0CB',
    'hồng đậm': '#FF69B4',
    'hồng phấn': '#FFB6C1',
    'tím': '#800080',
    'tím nhạt': '#DA70D6',
    'tím huế': '#9932CC',
    'xanh': '#0000FF',
    'xanh dương': '#0000CD',
    'xanh da trời': '#87CEEB',
    'xanh navy': '#000080',
    'xanh lá': '#008000',
    'xanh lá nhạt': '#00FF7F',
    'xanh rêu': '#556B2F',
    'xanh ngọc': '#20B2AA',
    'xanh lục bảo': '#50C878',
    'xanh pastel': '#77DD77',
    'vàng': '#FFFF00',
    'vàng nghệ': '#FFD700',
    'vàng nhạt': '#FFFACD',
    'cam': '#FFA500',
    'cam đất': '#E9967A',
    'nâu': '#8B4513',
    'nâu nhạt': '#A0522D',
    'nâu đất': '#7B3F00',
    'đen': '#000000',
    'xám': '#808080',
    'xám nhạt': '#D3D3D3',
    'trắng': '#FFFFFF',
    'be': '#F5F5DC',
    'kem': '#FAF0E6',
    'bạc': '#C0C0C0',
    'vàng đồng': '#B8860B',
    'xanh mint': '#98FF98',
    'xanh lam': '#1E90FF',
    'xanh teal': '#008080',
    'hồng đất': '#C48189',
    'hồng đào': '#FFDAB9',
    'đỏ rượu': '#800000',
    'đỏ đô': '#8B0000',
    'tím than': '#4B0082',
    'tím oải hương': '#E6E6FA',
    'xanh coban': '#0047AB',
    'xanh ngọc bích': '#00CED1',
    'nâu socola': '#381819',
    'cam san hô': '#FF7F50',
    'xanh olive': '#808000',
    'vàng chanh': '#FFF44F'
};

const muaNgay = async () => {
    if (!product.value) return;

    // Kiểm tra màu sắc
    if (selectedColors.value.length === 0) {
        toast.error("❌ Vui lòng chọn ít nhất một màu sắc");
        return;
    }

    // Kiểm tra kích cỡ
    if (selectedSizes.value.length === 0) {
        toast.error("❌ Vui lòng chọn ít nhất một kích cỡ.");
        return;
    }

    // Kiểm tra số lượng
    if (quantity.value <= 0 || quantity.value > product.value.quantity) {
        toast.error(`❌ Số lượng không hợp lệ.`);
        return;
    }

    // Chuẩn bị dữ liệu gửi BE
    const selectedColor = selectedColors.value[0];
    const selectedSizeObj = selectedSizes.value[0];
    const kichCo = selectedSizeObj.soCo;

    const payload = {
        idSanPham: product.value.id,
        soLuong: quantity.value,
        mauSacList: [selectedColor],
        kichCoList: [kichCo]
    };

    try {
        // ✅ Gọi trực tiếp API Mua Ngay
        const res = await axios.post("http://localhost:8080/client/MuaNgay", payload, {
            withCredentials: true
        });

        const hoaDonId = res.data.hoaDonId;

        if (!hoaDonId) {
            toast.error("❌ Không tạo được hóa đơn.");
            return;
        }

        toast.success("🎉 Mua ngay thành công!", {
            timeout: 3000,
            position: "top-right"
        });

        // ✅ Điều hướng đến trang hóa đơn
        router.push({
            name: "client-Oder",
            params: { hoaDonId }
        });

    } catch (err) {
        console.error("❌ Lỗi khi thực hiện mua ngay:", err);
        toast.error("❌ Mua ngay thất bại, vui lòng thử lại.");
    }
};



const themVaoGioHang = async () => {
    if (!product.value) return;

    if (selectedColors.value.length === 0) {
        toast.error("❌ Vui lòng chọn ít nhất một màu sắc", {
            timeout: 4000,
            position: "top-right"
        });
        return;
    }

    if (selectedSizes.value.length === 0) {
        toast.error("❌ Vui lòng chọn ít nhất một kích cỡ.", {
            timeout: 4000,
            position: "top-right"
        });
        return;
    }

    if (quantity.value <= 0) {
        toast.error("❌ Vui lòng chọn số lượng hợp lệ.", {
            timeout: 4000,
            position: "top-right"
        });
        return;
    }

    if (quantity.value > product.value.quantity) {
        alert(`Chỉ còn ${product.value.quantity} sản phẩm trong kho.`);
        return;
    }

    const selectedColor = selectedColors.value[0];
    const selectedSizeObj = selectedSizes.value[0];
    const kichCo = selectedSizeObj.soCo;

    try {
        const payload = {
            idSanPham: product.value.id,
            soLuong: quantity.value,
            mauSacList: [selectedColor],
            kichCoList: [kichCo]
        };

        const res = await axios.post("http://localhost:8080/client/ThemSanPham", payload, {
            withCredentials: true
        });

        toast.success("🎉 " + res.data, {
            timeout: 3000,
            position: "top-right"
        });

        // ✅ Sau khi thêm thành công, tải lại chi tiết sản phẩm để cập nhật tồn kho

        // Gửi sự kiện cập nhật giỏ hàng
        window.dispatchEvent(new Event("cap-nhat-gio"));

    } catch (err) {
        console.error("❌ Lỗi khi thêm sản phẩm vào giỏ hàng:", err);
        toast.error("❌ Thêm sản phẩm thất bại. Vui lòng thử lại!", {
            timeout: 4000,
            position: "top-right"
        });
    }
};


const fetchProductDetail = async (productId) => {
    loading.value = true;
    error.value = null;
    product.value = null;
    quantity.value = 1;

    try {
        const res = await fetch(`http://localhost:8080/client/san-pham/${productId}`);
        if (!res.ok) throw new Error("Sản phẩm không tìm thấy.");
        const singleProduct = await res.json();

        const dgRes = await fetch(`http://localhost:8080/client/giam-gia/${productId}`);
        let discountPercentage = 0;
        if (dgRes.ok) {
            const list = await dgRes.json();
            const arr = Array.isArray(list) ? list : (list.data || []);
            const discountList = arr
                .map(d => Number(d))
                .filter(p => !isNaN(p));


            if (discountList.length > 0) {
                const sum = discountList.reduce((a, b) => a + b, 0);
                discountPercentage = Math.round(sum / discountList.length);
            }
        }


        const prices = singleProduct.giaTruocKhiGiam || [];
        const minOriginal = Math.min(...prices);
        const maxOriginal = Math.max(...prices);

        let minDiscount = minOriginal;
        let maxDiscount = maxOriginal;
        if (discountPercentage > 0) {
            minDiscount = Math.round(minOriginal * (100 - discountPercentage) / 100);
            maxDiscount = Math.round(maxOriginal * (100 - discountPercentage) / 100);
        }

        product.value = {
            id: singleProduct.idSanPham,
            name: singleProduct.tenSanPham,
            images: singleProduct.listAnhSanPham || [],
            discount: discountPercentage,

            // Gốc
            minOriginalPrice: minOriginal,
            maxOriginalPrice: maxOriginal,

            // Sau giảm
            minPrice: minDiscount,
            maxPrice: maxDiscount,

            rating: singleProduct.diemDanhGia,
            reviews: singleProduct.soLuongDanhGia,
            category: singleProduct.tenDanhMuc,
            colors: singleProduct.listMauSac || [],
            sizes: singleProduct.listKichCo || [],
            description: (singleProduct.listMoTa || []).join(' '),
            maSanPham: singleProduct.maSanPham,
            quantity: singleProduct.soLuong
        };

        selectedImage.value = product.value.images[0] || '';
        remainingQuantity.value = product.value.quantity > 0 ? product.value.quantity - 1 : 0;
        startSlideshow();

    } catch (e) {
        console.error("Error fetching product:", e);
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

watch(quantity, (newQuantity) => {
    if (product.value) {
        const goc = product.value.quantity;
        remainingQuantity.value = goc - newQuantity;
    }
});

watch(quantity, (val) => {
    if (val > product.value.quantity) {
        quantity.value = product.value.quantity;
        toast.error("❌ Không thể mua quá số lượng tồn kho!", {
            timeout: 4000,
            position: "top-right"
        });
    }
});



function formatCurrency(value) {
    if (typeof value !== 'number') return '0 VND';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

}

function mapColorToCssClass(apiColor) {
    if (!apiColor) return '#CCCCCC';
    const key = apiColor.trim().toLowerCase();
    return colorMap[key] || '#CCCCCC';
}


function goBack() {
    router.back();
}
</script>

<style scoped>
.disabled-size {
    pointer-events: none;
    opacity: 0.5;
}

.product-detail-page-container {
    padding: 30px 0;
    /* Giữ padding trên dưới */
    /* Loại bỏ max-width để nó chiếm toàn bộ chiều rộng có thể của container cha */
    /* Hoặc đặt một max-width lớn hơn nếu bạn có một layout tổng thể cố định */
    /* max-width: 1200px; /* Ví dụ: tăng chiều rộng tối đa */
    margin: auto;
    margin-top: 50px;
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

.quantity-input {
    width: 80px;
    /* hoặc auto nếu bạn muốn nhỏ gọn hơn */
    height: 100%;
    /* đảm bảo bằng chiều cao nút */
}
</style>