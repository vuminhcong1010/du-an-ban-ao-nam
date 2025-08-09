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
                <div v-if="product.images.length > 0">
                    <img :src="selectedImage" class="img-fluid product-detail-image mb-3" />

                    <div class="d-flex flex-wrap gap-2">
                        <img v-for="(img, index) in product.images.slice(0, 4)" :key="index" :src="img"
                            class="img-thumbnail" :class="{ 'border border-primary': img === selectedImage }"
                            @click="selectedImage = img"
                            style="width: 80px; height: 80px; object-fit: cover; cursor: pointer;" />
                    </div>

                    <span v-if="product.discount && product.discount > 0"

                        class="discount-badge-detail position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-3 rounded">
                        -{{ product.discount }}%
                    </span>
                </div>
                <div v-else>
                    <img src="https://via.placeholder.com/600x400?text=No+Image"
                        class="img-fluid product-detail-image mb-3" alt="No Image" />
                </div>
            </div>

            <div class="col-md-6 product-info-section">
                <div class="mb-2">
                    <h2 class="product-name-heading">{{ product.name }}</h2>
                    <div class="price-display">
                        <span
                            v-if="displayedMinOriginalPrice && displayedMaxOriginalPrice && displayedMinOriginalPrice !== displayedMaxOriginalPrice && (product.discount > 0 || displayedMinOriginalPrice > displayedMinPrice)"
                            class="original-price-detail">
                            {{ formatCurrency(displayedMinOriginalPrice) }} - {{
                                formatCurrency(displayedMaxOriginalPrice) }}
                        </span>
                        <span
                            v-else-if="displayedMinOriginalPrice && (product.discount > 0 || displayedMinOriginalPrice > displayedMinPrice)"
                            class="original-price-detail">
                            {{ formatCurrency(displayedMinOriginalPrice) }}
                        </span>

                        <span v-if="displayedMinPrice && displayedMaxPrice && displayedMinPrice !== displayedMaxPrice"
                            class="current-price-detail">
                            {{ formatCurrency(displayedMinPrice) }} - {{ formatCurrency(displayedMaxPrice) }}
                        </span>
                        <span v-else-if="displayedMinPrice" class="current-price-detail">
                            {{ formatCurrency(displayedMinPrice) }}
                        </span>
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
                    {{ product.description || 'Không có mô tả chi tiết.' }}
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
                    <button class="btn btn-dark add-to-cart-btn" :disabled="remainingQuantity === 0 || quantity === 0"
                        @click="themVaoGioHang">
                        Thêm vào giỏ hàng
                    </button>
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

// Ref để lưu trữ giá hiển thị (sẽ là khoảng giá min-max tổng thể)
const displayedMinPrice = ref(null);
const displayedMaxPrice = ref(null);
const displayedMinOriginalPrice = ref(null);
const displayedMaxOriginalPrice = ref(null);

const sizeEnabled = ref(false);
const availableSizes = ref([]);

let slideshowInterval = null;

function startSlideshow() {
    // Chỉ khởi động slideshow nếu có ảnh
    if (product.value && product.value.images && product.value.images.length > 0) {
        let index = 0;
        selectedImage.value = product.value.images[index]; // Set ảnh ban đầu

        slideshowInterval = setInterval(() => {
            index = (index + 1) % product.value.images.length;
            selectedImage.value = product.value.images[index];
        }, 3000); // Thay đổi thời gian slideshow nếu muốn
    } else {
        // Nếu không có ảnh, đảm bảo selectedImage là rỗng hoặc một placeholder
        selectedImage.value = '';
    }
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
    // Khi màu sắc thay đổi, reset kích thước đã chọn để yêu cầu chọn lại
    selectedSizes.value = [];
    updateVariantInfo(); // Cập nhật thông tin biến thể
}


async function toggleSize(size) {
    if (!selectedColors.value.length) {
        alert("Vui lòng chọn màu sắc trước.");
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
        const res = await axios.get("http://localhost:8080/client/san-pham-chi-tiet", {
            params: {
                idSanPham: product.value.id,
                mauSac: selectedColor,
                kichCo: size.soCo
            }
        });

        const detail = res.data;
        if (!detail) {
            alert("Không tìm thấy sản phẩm chi tiết.");
            return;
        }

        // Cập nhật UI từ dữ liệu backend
        product.value.price = detail.giaSauKhiGiam;
        product.value.originalPrice = detail.giaTruocKhiGiam;
        product.value.discount = detail.phamTramGiam;
        product.value.images = detail.anhSanPham || [];
        selectedImage.value = product.value.images[0] || '';
        product.value.quantity = detail.chiTietSanPhams[0]?.soLuong || 0;
        remainingQuantity.value = product.value.quantity > 0 ? product.value.quantity - quantity.value : 0;
    } catch (err) {
        console.error("Lỗi khi fetch chi tiết sản phẩm:", err);
        alert("Không thể cập nhật sản phẩm chi tiết.");
    }
    updateVariantInfo(); // Cập nhật thông tin biến thể
}

// Hàm để cập nhật thông tin biến thể đang được chọn
const updateVariantInfo = () => {
    if (!product.value || !product.value.listChiTietSanPham) return;

    const selectedColor = selectedColors.value[0];
    const selectedSize = selectedSizes.value[0];

    // Tìm biến thể khớp với màu và kích thước đã chọn
    const matchedVariant = product.value.listChiTietSanPham.find(variant =>
        (selectedColor ? variant.mauSac.trim() === selectedColor.trim() : true) &&
        (selectedSize ? variant.kichCo.trim() === selectedSize.trim() : true)
    );

    if (matchedVariant) {
        // Cập nhật giá hiển thị và số lượng tồn kho dựa trên biến thể được chọn
        displayedMinPrice.value = matchedVariant.giaSauKhiGiamBienThe;
        displayedMaxPrice.value = matchedVariant.giaSauKhiGiamBienThe; // Giờ nó là giá cụ thể của biến thể
        displayedMinOriginalPrice.value = matchedVariant.giaTruocKhiGiamBienThe;
        displayedMaxOriginalPrice.value = matchedVariant.giaTruocKhiGiamBienThe; // Giờ nó là giá cụ thể của biến thể

        remainingQuantity.value = matchedVariant.soLuongTon;
        // Cập nhật ảnh chính nếu biến thể có ảnh riêng
        if (matchedVariant.anhBienThe) {
            selectedImage.value = matchedVariant.anhBienThe;
            // Dừng slideshow nếu người dùng chọn ảnh cụ thể
            if (slideshowInterval) clearInterval(slideshowInterval);
        } else if (product.value.images.length > 0) {
            // Nếu biến thể không có ảnh, quay lại ảnh tổng thể đầu tiên
            selectedImage.value = product.value.images[0];
            // Khởi động lại slideshow nếu dừng
            if (slideshowInterval) clearInterval(slideshowInterval);
            startSlideshow(); // Bạn có thể quyết định có nên khởi động lại hay không
        } else {
            selectedImage.value = ''; // Không có ảnh
        }

    } else {
        // Nếu không tìm thấy biến thể khớp, hoặc chưa chọn đủ màu/size
        // Đặt lại số lượng tồn về 0 hoặc tổng số lượng sản phẩm (tùy logic mong muốn)
        remainingQuantity.value = 0; // Hoặc product.value.quantity nếu bạn muốn hiển thị tổng số lượng ban đầu

        // Reset giá về khoảng giá tổng thể nếu không có biến thể cụ thể được chọn
        calculateAndSetOverallPrices(product.value.listChiTietSanPham);

        // Quay lại ảnh tổng thể nếu có
        if (product.value.images.length > 0) {
            selectedImage.value = product.value.images[0];
            if (slideshowInterval) clearInterval(slideshowInterval);
            startSlideshow();
        } else {
            selectedImage.value = '';
        }
    }
    // Đảm bảo số lượng đặt hàng không vượt quá số lượng tồn
    if (quantity.value > remainingQuantity.value) {
        quantity.value = remainingQuantity.value > 0 ? 1 : 0;
    }
};


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

const themVaoGioHang = async () => {
    if (!product.value) return;

    if (selectedColors.value.length === 0) {
        toast.error('Vui lòng chọn màu sắc.');
        return;
    }

    if (selectedSizes.value.length === 0) {
        alert('Vui lòng chọn ít nhất một kích cỡ.');
        return;
    }

    if (quantity.value <= 0) {
        alert('Vui lòng chọn số lượng hợp lệ.');
        return;
    }

    if (quantity.value > product.value.quantity) {
        alert(`Chỉ còn ${product.value.quantity} sản phẩm trong kho.`);

        return;
    }

    const selectedColor = selectedColors.value[0];
    const selectedSizeObj = selectedSizes.value[0];
    const kichCo = selectedSizeObj.soCo;

    // Tìm chi tiết sản phẩm phù hợp dựa trên màu và kích cỡ đã chọn
    const selectedVariant = product.value.listChiTietSanPham.find(variant =>
        variant.mauSac.trim() === selectedColor.trim() &&
        variant.kichCo.trim() === selectedSize.trim()
    );

    if (!selectedVariant) {
        toast.error("Không tìm thấy phiên bản sản phẩm phù hợp. Vui lòng chọn lại màu và kích cỡ.");
        return;
    }

    if (quantity.value <= 0) {
        toast.error('Số lượng phải lớn hơn 0.');
        return;
    }

    if (quantity.value > selectedVariant.soLuongTon) {
        toast.error(`Số lượng vượt quá tồn kho! Chỉ còn ${selectedVariant.soLuongTon} sản phẩm.`);
        return;
    }

    try {
        const idChiTietSanPham = selectedVariant.idChiTietSanPham;
        // 🛒 B2: Gửi dữ liệu thêm vào giỏ hàng
        const payload = {
            idSanPham: product.value.id,
            soLuong: quantity.value,
            gia: selectedVariant.giaSauKhiGiamBienThe, // Lấy giá từ biến thể đã chọn
            tongTien: selectedVariant.giaSauKhiGiamBienThe * quantity.value,
            tenSanPham: product.value.name,
            anhSanPham: selectedVariant.anhBienThe || product.value.images?.[0] || '', // Ưu tiên ảnh biến thể, nếu không có thì ảnh tổng thể đầu tiên
            phanTramGiamGia: selectedVariant.phamTramGiamBienThe || 0, // Lấy phần trăm giảm giá từ biến thể

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

        // Thay đổi của Dat
        // 🛠️ B3: Gọi API cập nhật số lượng tồn kho (nếu backend của bạn yêu cầu điều này riêng)
        // (Lưu ý: Thường thì việc này nên được xử lý trong cùng một transaction với việc thêm vào giỏ hàng ở backend)
        await axios.post("http://localhost:8080/client/cap-nhat-so-luong", {
            idChiTietSanPham,
            soLuong: quantity.value
        });

        // 🎯 B4: Cập nhật UI: giảm số lượng tồn kho của biến thể đã chọn
        selectedVariant.soLuongTon -= quantity.value; // Giảm số lượng tồn của biến thể cụ thể
        remainingQuantity.value = selectedVariant.soLuongTon; // Cập nhật số lượng còn lại hiển thị
        // Reset quantity về 1 nếu còn hàng, ngược lại về 0
        quantity.value = remainingQuantity.value > 0 ? 1 : 0;

        // Thay đổi của Tuyen
        // ✅ Không trừ tồn kho nữa (vì BE đã không xử lý tồn kho)
        // Nếu bạn vẫn muốn hiển thị tồn kho, có thể gọi API load lại sản phẩm chi tiết

        // Gửi sự kiện cập nhật giỏ hàng
        window.dispatchEvent(new Event("cap-nhat-gio"));

    } catch (err) {
        // Thay đổi của Dat
        // console.error("❌ Lỗi khi xử lý giỏ hàng:", err);
        // // Kiểm tra lỗi từ server để hiển thị thông báo chi tiết hơn
        // const errorMessage = err.response?.data?.message || "Thêm sản phẩm thất bại. Vui lòng thử lại sau!";
        // toast.error(`❌ ${errorMessage}`, {

        console.error("❌ Lỗi khi thêm sản phẩm vào giỏ hàng:", err);
        toast.error("❌ Thêm sản phẩm thất bại. Vui lòng thử lại!", {

            timeout: 4000,
            position: "top-right"
        });
    }
};

// Hàm mới để tính toán và đặt khoảng giá min/max tổng thể
const calculateAndSetOverallPrices = (variants) => {
    if (!variants || variants.length === 0) {
        displayedMinPrice.value = null;
        displayedMaxPrice.value = null;
        displayedMinOriginalPrice.value = null;
        displayedMaxOriginalPrice.value = null;
        return;
    }

    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let minOriginalPrice = Infinity;
    let maxOriginalPrice = -Infinity;

    variants.forEach(variant => {
        if (variant.giaSauKhiGiamBienThe !== null) {
            minPrice = Math.min(minPrice, variant.giaSauKhiGiamBienThe);
            maxPrice = Math.max(maxPrice, variant.giaSauKhiGiamBienThe);
        }
        if (variant.giaTruocKhiGiamBienThe !== null) {
            minOriginalPrice = Math.min(minOriginalPrice, variant.giaTruocKhiGiamBienThe);
            maxOriginalPrice = Math.max(maxOriginalPrice, variant.giaTruocKhiGiamBienThe);
        }
    });

    displayedMinPrice.value = minPrice === Infinity ? null : minPrice;
    displayedMaxPrice.value = maxPrice === -Infinity ? null : maxPrice;
    displayedMinOriginalPrice.value = minOriginalPrice === Infinity ? null : minOriginalPrice;
    displayedMaxOriginalPrice.value = maxOriginalPrice === -Infinity ? null : maxOriginalPrice;
};





const fetchProductDetail = async (productId) => {
    loading.value = true;
    error.value = null;
    product.value = null;
    quantity.value = 1;
    selectedColors.value = []; // Reset selected colors
    selectedSizes.value = [];   // Reset selected sizes
    remainingQuantity.value = 0; // Reset remaining quantity

    // Clear slideshow interval before new fetch
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }


    if (!productId) {
        error.value = "Không có ID sản phẩm được cung cấp.";
        loading.value = false;
        return;
    }

    try {
        const res = await fetch(`http://localhost:8080/client/san-pham/${productId}`);
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Sản phẩm không tìm thấy hoặc lỗi server: ${errorText}`);
        }
        console.log("id san pha ", productId)
        const singleProduct = await res.json();

        // Chuẩn bị dữ liệu cho `product.value`
        product.value = {
            id: singleProduct.idSanPham,
            name: singleProduct.tenSanPham,
            // Images: Lấy ảnh từ các biến thể hoặc để rỗng nếu bạn không có ảnh tổng thể riêng biệt
            // Giờ bạn không có listAnhSanPham ở cấp tổng thể nữa,
            // nên nếu muốn hiển thị ảnh sản phẩm tổng thể, bạn phải lấy từ biến thể
            // Hoặc chỉnh lại backend để có một ảnh tổng thể.
            // Tạm thời, chúng ta sẽ thu thập tất cả ảnh từ các biến thể.
            images: singleProduct.listChiTietSanPham
                .map(variant => variant.anhBienThe)
                .filter(url => url && url.length > 0) || [],
            price: singleProduct.giaSauKhiGiam, // Giá này sẽ được thay thế bằng khoảng giá
            originalPrice: singleProduct.giaTruocKhiGiam, // Giá này sẽ được thay thế bằng khoảng giá
            discount: singleProduct.phamTramGiam,
            rating: singleProduct.diemDanhGia,
            reviews: singleProduct.soLuongDanhGia,
            category: singleProduct.tenDanhMuc,
            colors: singleProduct.listMauSac || [],
            sizes: singleProduct.listKichCo || [],
            // createdAt: singleProduct.ngayTaoChiTietSanPham, // Không có trường này trong JSON mới
            quantity: singleProduct.soLuong, // Tổng số lượng từ tất cả biến thể
            maSanPham: singleProduct.maSanPham,
            description: '', // Đã loại bỏ listMoTa từ backend, nên đặt rỗng
            listChiTietSanPham: singleProduct.listChiTietSanPham || [] // Lưu trữ chi tiết sản phẩm để dùng sau
        };

        // Tính toán và đặt khoảng giá tổng thể cho sản phẩm
        calculateAndSetOverallPrices(product.value.listChiTietSanPham);

        // Đặt ảnh hiển thị ban đầu (lấy ảnh đầu tiên của biến thể nếu có, hoặc rỗng)
        selectedImage.value = product.value.images?.[0] || '';

        // Đặt số lượng còn lại ban đầu là tổng số lượng
        remainingQuantity.value = product.value.quantity;

        // Bắt đầu slideshow
        startSlideshow();

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

// Watch cho quantity - giờ sẽ kiểm tra với remainingQuantity (tồn kho của biến thể)
watch(quantity, (newQuantity) => {
    if (newQuantity < 1) {
        quantity.value = 1; // Không cho phép số lượng < 1
    }
    if (newQuantity > remainingQuantity.value) {
        quantity.value = remainingQuantity.value; // Không cho phép vượt quá số lượng tồn
        toast.warning(`Chỉ còn ${remainingQuantity.value} sản phẩm này trong kho.`);
    }
}, { immediate: true }); // Chạy ngay khi component mounted


function formatCurrency(value) {
    if (typeof value !== 'number' && typeof value !== 'string') return '0 VND';
    // Chuyển đổi sang số nếu là string và là số hợp lệ
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(numValue)) return '0 VND';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(numValue);
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
    margin: auto;
}

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
    margin-bottom: 5px;
    color: #333;
    flex-grow: 1;
}

.product-price-section .price-display {
    display: flex;
    align-items: baseline;
    gap: 10px;
}

.product-price-section .original-price-detail {
    font-size: 1.5rem;
    color: #888;
    text-decoration: line-through;
    white-space: nowrap;
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

.rating-section .star i {
    font-size: 1.3rem;
    color: #ffc107;
}

.rating-section .text-muted {
    color: #888 !important;
}

.rating-count {
    font-size: 1rem;
    color: #888;
}

.rating-section .product-quantity-display {
    font-size: 1rem;
    color: #555;
    margin-left: 10px;
}

.product-meta p {
    margin-bottom: 5px;
    font-size: 1rem;
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
    color: #555;
    font-size: 1rem;
    border-bottom: 1px solid #eee;
    padding-bottom: 20px;
    margin-bottom: 20px;
}

.add-to-cart-section {
    margin-top: 20px;
}

.quantity-input-group {
    max-width: 150px;
}

.quantity-input {
    border-color: #ddd;
    box-shadow: none;
    font-size: 1.1rem;
}

.quantity-input-group .btn {
    border-color: #ddd;
    background-color: #f8f9fa;
    color: #333;
    font-size: 1.1rem;
}

.quantity-input-group .btn:hover {
    background-color: #e2e6ea;
}

.add-to-cart-btn {
    background-color: #212529;
    color: white;
    padding: 12px 30px;
    font-size: 1.2rem;
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
}

.action-link:hover {
    color: #000;
}

.color-box-detail {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #eee;
    margin-right: 10px;
    box-shadow: 0 0 3px rgba(0, 0, 0, 0.1);
    cursor: pointer;
}

.size-badge {
    padding: 8px 12px;
    font-size: 0.95rem;
    border-radius: 5px;
    background-color: #f0f0f0;
    color: #333;
    border: 1px solid #ddd;
}

@media (max-width: 991.98px) {
    .product-info-section {
        padding-left: 15px;
        padding-top: 20px;
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
    }

    .product-detail-content {
        padding: 15px;
    }

    .product-info-section {
        padding-left: 0;
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
        align-items: flex-start !important;
    }

    .quantity-input-group {
        margin-right: 0 !important;
        margin-bottom: 15px;
        width: 100%;
        max-width: none;
    }

    .add-to-cart-btn {
        width: 100%;
    }
}

.product-name-heading {
    font-size: 2.5rem;
    margin-bottom: 5px;
    color: #333;
}

.price-display {
    display: flex;
    align-items: baseline; /* Giúp các thành phần giá căn chỉnh theo đường cơ sở chữ */
    gap: 10px;
    margin-top: 5px;
    flex-wrap: wrap;
}

.original-price-detail {
    font-size: 1.2rem; /* Cỡ chữ nhỏ hơn */
    color: #888; /* Màu xám */
    text-decoration: line-through; /* Gạch ngang */
    white-space: nowrap;
}

.current-price-detail {
    font-size: 2.2rem; /* Cỡ chữ to hơn */
    font-weight: bold;
    color: #0a2c57; /* Màu mới theo yêu cầu */
    white-space: nowrap;
}

/* Các phần CSS khác giữ nguyên */

/* Ví dụ về cách điều chỉnh trên di động để giữ tỉ lệ */
@media (max-width: 991.98px) {
    .product-name-heading {
        font-size: 2rem;
    }
    .current-price-detail {
        font-size: 1.8rem; /* Điều chỉnh lại cỡ chữ cho màn hình trung bình */
    }
    .original-price-detail {
        font-size: 1rem; /* Điều chỉnh lại cỡ chữ cho màn hình trung bình */
    }
}

@media (max-width: 767.98px) {
    .current-price-detail {
        font-size: 1.6rem; /* Điều chỉnh lại cỡ chữ cho màn hình nhỏ */
    }
    .original-price-detail {
        font-size: 0.9rem; /* Điều chỉnh lại cỡ chữ cho màn hình nhỏ */
    }
}
</style>