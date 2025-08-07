<template class="view">
    <div class="container product-page-container">
        <div class="row">
            <div class="col-md-3">
                <div class="filter-sidebar">
                    <div class="filter-section" v-if="allProducts.length > 0">
                        <div class="filter-header" @click="toggleSection('price')">
                            <h5>Giá</h5>
                            <i :class="expandedSections.price ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </div>
                        <div v-show="expandedSections.price" class="filter-content">
                            <div class="mb-3 d-flex align-items-center gap-2">
                                <div class="input-group" style="max-width: 900px;">
                                    <span class="input-group-text">VND</span>
                                    <input type="number max-width: 600px" class="form-control form-control-sm"
                                        v-model.number="priceRange[0]" @change="onPriceInputChange(0)" :min="minPrice"
                                        :max="priceRange[1]" />
                                </div>
                                <div class="input-group" style="max-width: 900px;">
                                    <span class="input-group-text">VND</span>
                                    <input type="number max-width: 600px" class="form-control form-control-sm"
                                        v-model.number="priceRange[1]" @change="onPriceInputChange(1)"
                                        :min="priceRange[0]" :max="maxPrice" />
                                </div>
                            </div>
                            <Slider v-model="priceRange" :min="minPrice" :max="maxPrice" :tooltip="false"
                                :dot-labels="false" :lazy="true" :step="1" :range="true" class="my-3" />
                        </div>
                    </div>

                    <div class="filter-section">
                        <div class="filter-header" @click="toggleSection('category')">
                            <h5>Thể loại</h5>
                            <span class="filter-count" v-if="categoryCounts.total > 0">({{ categoryCounts.total
                            }})</span>
                            <i :class="expandedSections.category ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </div>
                        <div v-show="expandedSections.category" class="filter-content">
                            <div v-for="cat in uniqueCategories" :key="cat" class="form-check">
                                <input class="form-check-input" type="checkbox" :id="cat" :value="cat"
                                    v-model="selectedCategories" />
                                <label class="form-check-label" :for="cat">
                                    {{ cat }}
                                    <span class="filter-item-count" v-if="categoryCounts[cat]">({{ categoryCounts[cat]
                                    }})</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="filter-section">
                        <div class="filter-header" @click="toggleSection('size')">
                            <h5>Kích cỡ</h5>
                            <span class="filter-count" v-if="sizeCounts.total > 0">({{ sizeCounts.total }})</span>
                            <i :class="expandedSections.size ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </div>
                        <div v-show="expandedSections.size" class="filter-content">
                            <div v-for="sz in uniqueSizes" :key="sz" class="form-check">
                                <input class="form-check-input" type="checkbox" :id="sz" :value="sz"
                                    v-model="selectedSizes" />
                                <label class="form-check-label" :for="sz">
                                    {{ sz }}
                                    <span class="filter-item-count" v-if="sizeCounts[sz]">({{ sizeCounts[sz] }})</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="filter-section">
                        <div class="filter-header" @click="toggleSection('color')">
                            <h5>Màu sắc</h5>
                            <span class="filter-count" v-if="colorCounts.total > 0">({{ colorCounts.total }})</span>
                            <i :class="expandedSections.color ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </div>
                        <div v-show="expandedSections.color" class="filter-content">
                            <div class="color-options mb-3">
                                <div v-for="color in uniqueColors" :key="color" class="color-box"
                                    :style="{ backgroundColor: mapColorToCssClass(color) }"
                                    :class="{ selected: selectedColors.includes(color) }" @click="toggleColor(color)">
                                    <span v-if="selectedColors.includes(color)" class="checkmark">✓</span>
                                </div>
                            </div>
                            <div v-for="color in uniqueColors" :key="color + '-label'" class="form-check">
                                <input class="form-check-input visually-hidden" type="checkbox"
                                    :id="color + '-checkbox'" :value="color" v-model="selectedColors" />
                                <label class="form-check-label" :for="color + '-checkbox'" @click="toggleColor(color)">
                                    {{ color }}
                                    <span class="filter-item-count" v-if="colorCounts[color]">({{ colorCounts[color]
                                    }})</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="filter-section">
                        <div class="filter-header" @click="toggleSection('discount')">
                            <h5>Chỉ sản phẩm giảm giá</h5>
                            <span class="filter-count" v-if="discountCount > 0">({{ discountCount }})</span>
                            <i :class="expandedSections.discount ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </div>
                        <div v-show="expandedSections.discount" class="filter-content">
                            <div class="form-check mb-3">
                                <input class="form-check-input" type="checkbox" id="discountOnly"
                                    v-model="discountOnly" />
                                <label class="form-check-label" for="discountOnly">Chỉ sản phẩm giảm giá</label>
                            </div>
                        </div>
                    </div>

                    <div class="filter-section">
                        <div class="filter-header" @click="toggleSection('rating')">
                            <h5>Xếp hạng</h5>
                            <span class="filter-count" v-if="ratingCounts.total > 0">({{ ratingCounts.total }})</span>
                            <i :class="expandedSections.rating ? 'bi bi-chevron-up' : 'bi bi-chevron-down'"></i>
                        </div>
                        <div v-show="expandedSections.rating" class="filter-content">
                            <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="form-check rating-item">
                                <input class="form-check-input" type="radio" :id="`rating-${star}`" :value="star"
                                    v-model="selectedRating" />
                                <label class="form-check-label" :for="`rating-${star}`">
                                    <span class="stars">{{ '★'.repeat(star) }}</span> & hướng lên
                                    <span class="filter-item-count" v-if="ratingCounts[star]">({{ ratingCounts[star]
                                    }})</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <button class="btn btn-clear-filters" @click="clearFilters">Xóa bộ lọc</button>
                </div>
            </div>
            <div class="col-md-9">
                <div v-if="filteredProducts.length === 0 && !loading" class="no-products">
                    <div class="emoji">😕</div>
                    <h4>Không tìm thấy sản phẩm nào</h4>
                    <p>Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc để tìm được thông tin bạn đang tìm kiếm.</p>
                    <button class="btn btn-primary" @click="clearFilters">Xóa tất cả bộ lọc và tìm kiếm</button>
                </div>

                <div v-else>
                    <div class="product-header">
                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                Hiển thị từ {{ filteredProducts.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0
                                }} đến
                                {{ Math.min(currentPage * itemsPerPage, filteredProducts.length) }} (trong tổng số
                                {{ filteredProducts.length }} sản phẩm)
                            </div>
                            <div class="dropdown">
                                <div class="d-flex align-items-center gap-2">
                                    <button class="btn btn-outline-secondary px-2" @click="toggleSortDirection">
                                        <i :class="sortDirection === 'desc' ? 'bi bi-sort-down-alt' : 'bi bi-sort-up-alt'"
                                            style="font-size: 1rem;"></i>
                                    </button>
                                    <div style="min-width: 170px;">
                                        <select class="form-select" v-model="sortOrder" style="width: 100%;">
                                            <option value="latest">Mới nhất</option>
                                            <option value="alphabet">Theo thứ tự bằng chữ cái</option>
                                            <option value="price">Giá</option>
                                            <option value="rating">Xếp hạng</option>
                                            <option value="discount">Giảm giá</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="product-grid">
                        <div class="product-card" v-for="allProducts in paginatedProducts" :key="allProducts.id">
                            <div class="card h-100 position-relative" @click="goToProductDetail(allProducts.id)">
                                <img :src="allProducts.image || 'https://woocommerce.com/wp-content/uploads/2020/03/product-image-placeholder.png'"
                                    class="card-img-top" :alt="allProducts.name" />
                                <div v-if="allProducts.discount && allProducts.discount > 0" class="discount-badge">
                                    -{{ allProducts.discount }}%
                                </div>
                                <div class="card-body">
                                    <h6 class="card-title">{{ allProducts.name }}</h6>
                                    <div class="rating-section">
                                        <span v-for="star in 5" :key="star" class="star">
                                            <i v-if="star <= allProducts.rating" class="bi bi-star-fill"></i>
                                            <i v-else class="bi bi-star"></i>
                                        </span>
                                        <small v-if="allProducts.reviews !== undefined && allProducts.reviews > 0">({{
                                            allProducts.reviews }})</small>
                                        <small v-else>({{ allProducts.quantity }})</small>
                                    </div>
                                    <div class="price-section">
                                        <span v-if="allProducts.discount && allProducts.discount > 0"
                                            class="original-price">
                                            {{ formatCurrency(allProducts.originalPrice) }}
                                        </span>
                                        <span class="current-price">{{ formatCurrency(allProducts.price) }}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <div class="col-md-3"></div>
            <div class="col-md-9">
                <div class="pagination-container">
                    <nav class="pagination-wrapper">
                        <ul class="pagination">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">«</a>
                            </li>
                            <li v-for="page in totalPages" :key="page" class="page-item"
                                :class="{ active: currentPage === page }">
                                <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">»</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import '@vueform/slider/themes/default.css'
import Slider from '@vueform/slider'
import { useRouter } from 'vue-router'

const router = useRouter()
const allProducts = ref([]);
const loading = ref(true);

const minPrice = ref(0);
const maxPrice = ref(0);

const priceRange = ref([0, 0])
const selectedCategories = ref([])
const selectedSizes = ref([])
const sortOrder = ref('latest')
const sortDirection = ref('desc')
const selectedColors = ref([])
const discountOnly = ref(false)
const selectedRating = ref(0)
const currentPage = ref(1)
const itemsPerPage = 24


const expandedSections = ref({
    price: true,
    category: false,
    size: false,
    color: true,
    discount: false,
    rating: false
})
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
// === Computed properties for dynamic filters and counts ===

// Compute counts for categories
const categoryCounts = computed(() => {
    const counts = {};
    let total = 0;
    allProducts.value.forEach(p => {
        if (p.category) {
            counts[p.category] = (counts[p.category] || 0) + 1;
            total++;
        }
    });
    counts.total = total;
    return counts;
});
function goToProductDetail(productId) {
    router.push({ name: 'client-san-pham-detail', params: { id: productId } })
    window.scrollTo({ top: 0, behavior: 'smooth' })
}
// Unique categories (already exists, but ensures it's based on loaded products)
const uniqueCategories = computed(() => {
    // Filter out 'total' key and ensure it's sorted alphabetically
    return Object.keys(categoryCounts.value)
        .filter(key => key !== 'total')
        .sort((a, b) => a.localeCompare(b));
});

// Compute counts for sizes
const sizeCounts = computed(() => {
    const counts = {};
    let total = 0;
    allProducts.value.forEach(p => {
        if (p.sizes && Array.isArray(p.sizes)) {
            p.sizes.forEach(size => {
                if (size) {
                    counts[size] = (counts[size] || 0) + 1;
                    total++;
                }
            });
        }
    });
    counts.total = total;
    return counts;
});

const uniqueSizes = computed(() => {

    return Object.keys(sizeCounts.value)
        .filter(key => key !== 'total')
        .sort((a, b) => a.localeCompare(b));
});


const colorCounts = computed(() => {
    const counts = {};
    let total = 0;
    allProducts.value.forEach(p => {
        if (p.colors && Array.isArray(p.colors)) {
            p.colors.forEach(color => {
                if (color) {
                    counts[color] = (counts[color] || 0) + 1;
                    total++;
                }
            });
        }
    });
    counts.total = total;
    return counts;
});

// Unique colors (already exists, but ensures it's based on loaded products)
const uniqueColors = computed(() => {
    // Filter out 'total' key and ensure it's sorted alphabetically
    return Object.keys(colorCounts.value)
        .filter(key => key !== 'total')
        .sort((a, b) => a.localeCompare(b));
});


// Compute discount count
const discountCount = computed(() => {
    return allProducts.value.filter(p => p.discount !== undefined && p.discount > 0).length;
});

// Compute counts for ratings
const ratingCounts = computed(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, total: 0 };
    allProducts.value.forEach(p => {
        if (p.rating !== undefined && p.rating > 0) {
            for (let i = Math.floor(p.rating); i >= 1; i--) {
                if (counts[i] !== undefined) { // Ensure the star key exists
                    counts[i]++;
                }
            }
            counts.total++; // Total products with any rating > 0
        }
    });
    return counts;
});

function toggleSection(sectionName) {
    expandedSections.value[sectionName] = !expandedSections.value[sectionName]
}

function clearFilters() {
    selectedColors.value = []
    discountOnly.value = false
    selectedRating.value = 0
    priceRange.value = [minPrice.value, maxPrice.value]
    selectedCategories.value = []
    selectedSizes.value = []
    currentPage.value = 1
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage
    const end = start + itemsPerPage
    return sortedProducts.value.slice(start, end)
})

const totalPages = computed(() => Math.ceil(sortedProducts.value.length / itemsPerPage))

function changePage(page) {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }
}

function toggleColor(color) {
    const index = selectedColors.value.indexOf(color);
    if (index > -1) {
        selectedColors.value.splice(index, 1);
    } else {
        selectedColors.value.push(color);
    }
    currentPage.value = 1; // Reset page when filter changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function toggleSortDirection() {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

const filteredProducts = computed(() => {
    return allProducts.value.filter((p) => {
        const productPrice = typeof p.price === 'number' ? p.price : 0;
        const inPriceRange = productPrice >= priceRange.value[0] && productPrice <= priceRange.value[1];
        const inCategory = selectedCategories.value.length === 0 || (p.category && selectedCategories.value.includes(p.category));
        const inSize = selectedSizes.value.length === 0 || (p.sizes && p.sizes.some((s) => selectedSizes.value.includes(s)));
        const inColor = selectedColors.value.length === 0 || (p.colors && p.colors.some((c) => selectedColors.value.includes(c)));
        const isDiscounted = !discountOnly.value || (p.discount !== undefined && p.discount > 0);
        const meetsRating = selectedRating.value === 0 || (p.rating !== undefined && p.rating >= selectedRating.value);
        return inPriceRange && inCategory && inSize && inColor && isDiscounted && meetsRating;
    });
});


const sortedProducts = computed(() => {
    const sorted = filteredProducts.value.slice(); // bản sao an toàn, không gây thay đổi dữ liệu gốc

    const dir = sortDirection.value === 'asc' ? 1 : -1;
    switch (sortOrder.value) {
        case 'alphabet':
            sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '') * dir);
            break;
        case 'price':
            sorted.sort((a, b) => ((a.price || 0) - (b.price || 0)) * dir);
            break;
        case 'rating':
            sorted.sort((a, b) => ((b.rating || 0) - (a.rating || 0)) * dir);
            break;
        case 'discount':
            sorted.sort((a, b) => ((b.discount || 0) - (a.discount || 0)) * dir);
            break;
        case 'latest':
            sorted.sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime();
                const dateB = new Date(b.createdAt).getTime();
                return (dateA - dateB) * dir;
            });
            break;
    }

    return sorted;
});


function onPriceInputChange(index) {
    // Ensure the input value stays within the overall minPrice and maxPrice bounds
    let value = priceRange.value[index];
    if (value < minPrice.value) {
        value = minPrice.value;
    } else if (value > maxPrice.value) {
        value = maxPrice.value;
    }

    // Update the specific end of the price range
    priceRange.value[index] = value;

    // Ensure priceRange[0] <= priceRange[1]
    if (priceRange.value[0] > priceRange.value[1]) {
        if (index === 0) {
            priceRange.value[1] = priceRange.value[0];
        } else {
            priceRange.value[0] = priceRange.value[1];
        }
    }
    currentPage.value = 1; // Reset page when filter changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
}

function formatCurrency(value) {
    if (typeof value !== 'number') return '0 VND';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function mapColorToCssClass(apiColor) {
    if (!apiColor) return '#CCCCCC';
    const key = apiColor.trim().toLowerCase();
    return colorMap[key] || '#CCCCCC';
}

const fetchProducts = async () => {
    loading.value = true;
    try {
        const response = await fetch('http://localhost:8080/client/danh-sach');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log("Raw data from API:", data);
        const products = data.data || [];
        if (Array.isArray(products) && products.length > 0) {
            const filteredData = products.filter(item => item.sp?.trangThai == 1);
            console.log("Filtered (trangThai == 1):", filteredData);

            const mapped = filteredData.map(item => {
                const firstChiTietDotGiamGia = item.chiTietDotGiamGia?.[0] || {};
                const firstDotGiamGia = firstChiTietDotGiamGia.idDotGiamGia || {};
                const firstDanhMuc = item.danhMucs?.[0] || {};
                const danhGiaList = item.danhGias || [];
                const ctspList = item.ctsp || [];

                let currentPrice = ctspList[0]?.gia || 0; // Default to original product price
                let originalProductPrice = currentPrice; // Initialize original price

                let discountPercentage = 0;
                let hasDiscount = false;

                if (
                    firstDotGiamGia &&
                    firstChiTietDotGiamGia &&
                    firstDotGiamGia.phamTramGiam > 0
                ) {
                    currentPrice = firstChiTietDotGiamGia.giaSauKhiGiam || currentPrice;
                    originalProductPrice = firstChiTietDotGiamGia.giaTruocKhiGiam || originalProductPrice;
                    discountPercentage = firstDotGiamGia.phamTramGiam;
                    hasDiscount = true;
                }

                return {
                    id: item.sp.id,
                    name: item.sp.tenSanPham,
                    image: item.anhSanPham?.[0] || 'https://woocommerce.com/wp-content/uploads/2020/03/product-image-placeholder.png',

                    price: currentPrice,
                    originalPrice: hasDiscount ? originalProductPrice : 0,
                    discount: hasDiscount ? discountPercentage : 0,

                    rating: danhGiaList.length > 0
                        ? (danhGiaList.reduce((sum, dg) => sum + dg.diemDanhGia, 0) / danhGiaList.length)
                        : 0,
                    reviews: danhGiaList.length,

                    category: firstDanhMuc.tenDanhMuc || '',

                    sizes: [...new Set(ctspList.map(ct => ct.idSize?.soCo).filter(Boolean))],
                    colors: [...new Set(ctspList.map(ct => ct.idMau?.ten).filter(Boolean))],

                    createdAt: ctspList[0]?.ngayTao || null,
                    quantity: ctspList.reduce((sum, ct) => sum + (ct.soLuong || 0), 0)
                };
            });

            allProducts.value = mapped;

            const allPrices = allProducts.value
                .map(p => p.price)
                .filter(price => typeof price === 'number');

            if (allPrices.length > 0) {
                minPrice.value = Math.min(...allPrices);
                maxPrice.value = Math.max(...allPrices);
            } else {
                minPrice.value = 0;
                maxPrice.value = 1000000;
            }

            priceRange.value = [minPrice.value, maxPrice.value];

        } else {
            minPrice.value = 0;
            maxPrice.value = 0;
            priceRange.value = [0, 0];
        }

    } catch (error) {
        console.error("Lỗi khi fetch sản phẩm:", error);
        minPrice.value = 0;
        maxPrice.value = 0;
        priceRange.value = [0, 0];
    } finally {
        loading.value = false;
    }
};

onMounted(fetchProducts);

watch(sortOrder, () => {
    currentPage.value = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' })
})

// Combined watcher for all filters to reset page and scroll
watch([selectedCategories, selectedSizes, selectedColors, discountOnly, selectedRating, priceRange], () => {
    currentPage.value = 1;
    window.scrollTo({ top: 0, behavior: 'smooth' })
}, { deep: true })

</script>


<style scoped>
@import 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css';

/* Container chính */
.view {
    background-color: #F3F4F6;
}
.product-page-container {
    margin-left: 88px;
    padding-top: 120px;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: #F3F4F6;
}

/* Ẩn tooltip slider */
:deep(.slider-tooltip) {
    display: none !important;
}

/* Filter Sidebar */
.filter-sidebar {
    padding: 20px;
}

/* Filter Section */
.filter-section {
    border-bottom: 1px solid #e5e7eb;
    margin-bottom: 0;
}

.filter-section:last-child {
    border-bottom: none;
}

.filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 0;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-header:hover {
    background-color: #f9fafb;
}

.filter-header h5 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #374151;
}

.filter-header i {
    font-size: 14px;
    color: #6b7280;
    transition: transform 0.3s ease;
}

/* Styling for filter counts in header and items */
.filter-count {
    font-size: 14px;
    color: #6b7280;
    margin-left: 5px;
    /* Adjust as needed */
    font-weight: 500;
}

.filter-item-count {
    font-size: 13px;
    color: #9ca3af;
    margin-left: 5px;
}

.filter-content {
    padding: 0 0 16px 0;
    /* Adjust padding as needed */
}

.filter-content .form-check {
    margin-bottom: 8px;
}

.filter-content .form-check-label {
    font-size: 15px;
    color: #4b5563;
    cursor: pointer;
}

.filter-content .form-check-input {
    margin-right: 8px;
}

/* Color Options */
.color-options {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 15px;
    /* Space between color boxes and color names */
}

.color-box {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 1px solid #e5e7eb;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
    transition: all 0.2s ease;
}

.color-box.selected {
    border-color: #007bff;
    /* Highlight selected color */
    box-shadow: 0 0 0 2px #007bff, 0 1px 3px rgba(0, 0, 0, 0.1);
}

.color-box .checkmark {
    color: white;
    font-size: 18px;
    font-weight: bold;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    /* Make checkmark stand out */
}

/* Predefined colors - map to actual CSS colors */
.color-box.black {
    background-color: black;
}

.color-box.blue {
    background-color: blue;
}

.color-box.gray {
    background-color: gray;
}

.color-box.green {
    background-color: green;
}

.color-box.orange {
    background-color: orange;
}

.color-box.red {
    background-color: red;
}

.color-box.yellow {
    background-color: yellow;
}

.color-box.white {
    background-color: white;
    border-color: #ccc;
}

/* White needs a visible border */

/* Rating Item */
.rating-item .stars {
    color: gold;
    font-size: 1.1em;
    letter-spacing: -1px;
}

/* Clear Filters Button */
.btn-clear-filters {
    width: 100%;
    background-color: #f3f4f6;
    color: #374151;
    padding: 10px 15px;
    border-radius: 6px;
    margin-top: 20px;
    font-weight: 500;
    transition: all 0.2s ease;
}

.btn-clear-filters:hover {
    background-color: #e5e7eb;
    border-color: #9ca3af;
}

/* Product Header */

.product-header .form-select {
    border-radius: 6px;
    font-size: 15px;
}

/* Product Grid giống ảnh 2 */
.product-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
}

/* Card sản phẩm */
.product-card .card {
    border: none !important;
    border-radius: 0;
    box-shadow: none;
    transition: all 0.2s ease-in-out;
    text-align: center;
  background-color: #F3F4F6;
}



/* Ảnh sản phẩm */
.product-card .card-img-top {
    width: 100%;
    height: 300px;
    object-fit: cover;
}

/* Tên sản phẩm */
.product-card .card-title {
    font-size: 14px;
    font-weight: normal;
    color: #333;
    margin: 10px 0;
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Giá sản phẩm */
.product-card .price-section {
    display: block;
    margin-top: 5px;
}

.product-card .current-price {
    font-size: 16px;
    font-weight: bold;
    color: #000;
}

.product-card .original-price {
    text-decoration: line-through;
    color: #888;
    font-size: 14px;
    margin-left: 5px;
}

/* Rating */
.product-card .rating-section {
    margin: 5px 0;
    font-size: 12px;
    color: #999;
}

/* Discount badge */
.product-card .discount-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background-color: #dc3545;
    color: #fff;
    padding: 3px 6px;
    font-size: 12px;
    font-weight: bold;
    border-radius: 2px;
}

/* Responsive */
@media (max-width: 768px) {
    .product-card .card-img-top {
        height: 200px;
        padding: 10px;
    }
}


/* No Products Found */
.no-products {
    text-align: center;
    padding: 50px;
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-top: 30px;
}

.no-products .emoji {
    font-size: 3em;
    margin-bottom: 15px;
}

.no-products h4 {
    color: #333;
    margin-bottom: 10px;
}

.no-products p {
    color: #6c757d;
    margin-bottom: 20px;
}

/* Pagination */
.pagination-container {
    display: flex;
    justify-content: center;
    padding: 20px 0;
    margin-top: 20px;
}

.pagination-wrapper .pagination .page-item .page-link {
    border-radius: 5px;
    margin: 0 5px;
    color: #007bff;
    border: 1px solid #dee2e6;
    transition: background-color 0.2s, color 0.2s, border-color 0.2s;
}

.pagination-wrapper .pagination .page-item .page-link:hover {
    background-color: #e9ecef;
    border-color: #0056b3;
    color: #0056b3;
}

.pagination-wrapper .pagination .page-item.active .page-link {
    background-color: #007bff;
    border-color: #007bff;
    color: white;
}

.pagination-wrapper .pagination .page-item.disabled .page-link {
    color: #6c757d;
    pointer-events: none;
    background-color: #e9ecef;
    border-color: #dee2e6;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .product-page-container {
        margin-left: 0;
        padding-top: 90px;
    }

    .filter-sidebar {
        margin-bottom: 20px;
    }

    .product-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    }

    .product-card .card-img-top {
        height: 150px;
    }
}

@media (max-width: 576px) {
    .product-grid {
        grid-template-columns: 1fr;
        /* Single column on very small screens */
    }

    .product-header .d-flex {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 15px;
    }
}
</style>