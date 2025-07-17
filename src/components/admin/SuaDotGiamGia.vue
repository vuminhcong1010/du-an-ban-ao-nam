<template>
    <div class="container-fluid mt-3">
        <div class="bg-white p-4 rounded shadow">
            <h3 class="fw-bold mb-4">
                <router-link to="/dot-giam-gia" class="text-decoration-none text-dark"> <i
                        class="fa fa-arrow-left me-2"></i>Đợt Giảm Giá</router-link> /
                <span class="text-primary">Sửa Đợt Giảm Giá</span>
            </h3>
            <div class="row g-4">
                <!-- Bên trái: Form chỉnh sửa -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Mã đợt giảm giá <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="dotGiamGia.maDotGiamGia" disabled />
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Tên đợt giảm giá <span
                                class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="dotGiamGia.tenDotGiamGia"
                            @input="validateTenDotGiamGia" />
                        <div v-if="errors.tenDotGiamGia" class="text-danger small">{{ errors.tenDotGiamGia }}</div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-semibold">Giá trị <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <input type="number" class="form-control" v-model.number="discountValue"
                                :max="discountType === '%' ? 100 : undefined" @input="validateDiscountValue" />
                            <span class="input-group-text">%</span>
                        </div>
                        <div v-if="errors.discountValue" class="text-danger small">{{ errors.discountValue }}</div>
                    </div>
                    <div class="row">
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Ngày bắt đầu <span
                                    class="text-danger">*</span></label>
                            <input type="datetime-local" class="form-control" v-model="dotGiamGia.ngayBatDau"
                                @input="validateDates" :min="minDate" />
                            <div v-if="errors.ngayBatDau" class="text-danger small">{{ errors.ngayBatDau }}</div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold">Ngày kết thúc <span
                                    class="text-danger">*</span></label>
                            <input type="datetime-local" class="form-control" v-model="dotGiamGia.ngayKetThuc"
                                @input="validateDates" :min="minDate" />
                            <div v-if="errors.ngayKetThuc" class="text-danger small">{{ errors.ngayKetThuc }}</div>
                        </div>
                    </div>
                  
                </div>
                <!-- Danh sách sản phẩm bên phải -->
                <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <label class="fw-bold fs-5">Danh sách sản phẩm</label>
                        <div class="input-group input-group-sm w-50">
                            <input type="text" class="form-control" placeholder="Tìm theo tên..." v-model="searchQuery"
                                @input="filterProducts" />
                            <span class="input-group-text"><i class="fa fa-search"></i></span>
                        </div>
                    </div>
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th><input type="checkbox" @change="selectAllProducts" v-model="selectAll" /></th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="sanpham in paginatedProducts" :key="sanpham.id">
                                <td>
                                    <input type="checkbox" :value="sanpham.id" v-model="selectedProductIds"
                                        @change="fetchProductVariants" />
                                </td>
                                <td>{{ sanpham.tenSanPham }}</td>
                                <td>{{ soLuongTheoSanPham[sanpham.id] || 0 }}</td>
                                <td>
                                    <span class="badge rounded-pill"
                                        :style="{ backgroundColor: sanpham.trangThai === 1 ? '#10b981' : '#D14343' }">
                                        {{ sanpham.trangThai === 1 ? 'Đang bán' : 'Ngừng bán' }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="d-flex justify-content-center">
                        <button class="btn btn-outline-secondary btn-sm me-1" :disabled="productPage === 1"
                            @click="goToProductPage(productPage - 1)"><</button>
                          
                                <button v-for="page in totalProductPages" :key="page"
                                    class="btn btn-outline-secondary btn-sm mx-1"
                                    :class="{ 'active': page === productPage }" @click="goToProductPage(page)">{{ page
                                    }}</button>
                                <button class="btn btn-outline-secondary btn-sm ms-1"
                                    :disabled="productPage === totalProductPages"
                                    @click="goToProductPage(productPage + 1)">></button>
                    </div>
                    <div class="invalid-feedback d-block" v-if="errors.sp">{{ errors.sp }}</div>
                </div>
            </div>
            <div v-if="selectedProductIds.length > 0" class="mt-4 p-4 border rounded bg-light">
                <div>
                    <h4>Danh sách sản phẩm chi tiết</h4>
                    <div class="row g-3 align-items-end mt-2">
                        <div class="col-md-2">
                            <label class="form-label">Tìm kiếm</label>
                            <input type="text" class="form-control rounded-pill" placeholder="Nhập tên, mã"
                                v-model="variantSearchQuery" @input="filterVariants" />
                        </div>
                        <div class="col-md-2" v-if="chatLieu.length > 0">
                            <label for="loaiChatLieu" class="form-label">Chất liệu:</label>
                            <select id="loaiChatLieu" v-model="selectedLoai" class="form-select"
                                @change="filterVariants">
                                <option value="">Tất cả</option>
                                <option v-for="chat in chatLieu" :key="chat.id" :value="chat.id">
                                    {{ chat.tenChatLieu }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-2" v-if="mau.length > 0">
                            <label for="loaiMau" class="form-label">Màu:</label>
                            <select id="loaiMau" v-model="selectedLoai1" class="form-select" @change="filterVariants">
                                <option value="">Tất cả</option>
                                <option v-for="m in mau" :key="m.id" :value="m.id">
                                    {{ m.ten }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-2" v-if="kichCo.length > 0">
                            <label for="LoaiKichCo" class="form-label">Kích cỡ:</label>
                            <select id="LoaiKichCo" v-model="selectedLoai2" class="form-select"
                                @change="filterVariants">
                                <option value="">Tất cả</option>
                                <option v-for="k in kichCo" :key="k.id" :value="k.id">
                                    {{ k.soCo }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-2" v-if="coAo.length > 0">
                            <label for="loaiCoAo" class="form-label">Cổ áo:</label>
                            <select id="loaiCoAo" v-model="selectedLoai3" class="form-select" @change="filterVariants">
                                <option value="">Tất cả</option>
                                <option v-for="c in coAo" :key="c.id" :value="c.id">
                                    {{ c.tenCoAo }}
                                </option>
                            </select>
                        </div>
                        <div class="col-md-2" v-if="tayAo.length > 0">
                            <label for="loaiTayAo" class="form-label">Tay áo:</label>
                            <select id="loaiTayAo" v-model="selectedLoai4" class="form-select" @change="filterVariants">
                                <option value="">Tất cả</option>
                                <option v-for="t in tayAo" :key="t.id" :value="t.id">
                                    {{ t.tenTayAo }}
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th><input type="checkbox"
                                    :checked="selectedVariantIds.length === filteredVariants.length && filteredVariants.length > 0"
                                    @change="toggleSelectAllVariants" /></th>
                            <th>STT</th>
                            <th>Ảnh sản phẩm</th>
                            <th>Mã sản phẩm</th>
                            <th>Tên sản phẩm</th>
                            <th>Chất liệu</th>
                            <th>Số lượng tồn</th>
                            <th>Màu sắc</th>
                            <th>Kích cỡ</th>
                            <th>Cổ áo</th>
                            <th>Tay áo</th>
                            <th>Giá bán</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(variant, index) in paginatedVariants" :key="variant.id">
                            <td><input type="checkbox" :value="variant.id" v-model="selectedVariantIds"
                                    @change="validateSelectedVariantIds" /></td>
                            <td>{{ (variantPage - 1) * variantsPerPage + index + 1 }}</td>
                            <td>
                                <div v-if="variant.images.length > 0" class="icon-container">
                                    <img :src="variant.images[0].duongDanAnh" alt="Ảnh sản phẩm"
                                        style="width: 100px; height: 100px; object-fit: cover; cursor: pointer;"
                                        @click="showImageGallery(variant.images)" />
                                    <span v-if="variant.images.length > 1" class="badge bg-secondary">+{{
                                        variant.images.length - 1 }}</span>
                                    <div class="percentage-tag" v-if="variant.discountPercentage > 0">
                                        +{{ variant.discountPercentage }}%
                                    </div>
                                </div>
                                <div v-else class="icon-container">
                                    <img src="https://via.placeholder.com/50" alt="Ảnh sản phẩm"
                                        style="width: 50px; height: 50px; object-fit: cover;" />
                                    <div class="percentage-tag" v-if="variant.discountPercentage > 0">
                                        +{{ variant.discountPercentage }}%
                                    </div>
                                </div>
                            </td>
                            <td>{{ variant.maChiTietSanPham || 'N/A' }}</td>
                            <td>{{ variant.idSanPham?.tenSanPham || 'N/A' }}</td>
                            <td>{{ variant.idSanPham?.idChatLieu?.tenChatLieu || 'N/A' }}</td>
                            <td>{{ variant.soLuong || 0 }}</td>
                            <td>{{ variant.idMau?.ten || 'N/A' }}</td>
                            <td>{{ variant.idSize?.soCo || 'N/A' }}</td>
                            <td>{{ variant.idCoAo?.tenCoAo || 'N/A' }}</td>
                            <td>{{ variant.idTayAo?.tenTayAo || 'N/A' }}</td>
                            <td>{{ variant.gia ? variant.gia.toLocaleString('vi-VN', {
                                style: 'currency', currency: 'VND'
                            }) : 'N/A' }}</td>
                        </tr>
                    </tbody>
                </table>
                <div class="d-flex justify-content-center">
                    <button class="btn btn-outline-secondary btn-sm me-1" :disabled="variantPage === 1"
                        @click="goToVariantPage(variantPage - 1)"><</button>
                      
                            <button v-for="page in totalVariantPages" :key="page"
                                class="btn btn-outline-secondary btn-sm mx-1"
                                :class="{ 'active': page === variantPage }" @click="goToVariantPage(page)">{{ page
                                }}</button>
                            <button class="btn btn-outline-secondary btn-sm ms-1"
                                :disabled="variantPage === totalVariantPages"
                                @click="goToVariantPage(variantPage + 1)">></button>
                </div>
                <div class="invalid-feedback d-block" v-if="errors.selectedVariantIds">{{ errors.selectedVariantIds }}
                </div>
            </div>
              <div class="mt-4 d-flex gap-2">
                        <button class="btn btn-primary" @click="updateDotGiamGia">
                            <i class="fas fa-save me-1"></i> Cập nhật
                        </button>
                        <router-link to="/dot-giam-gia" class="btn btn-outline-secondary">
                            <i class="fas fa-arrow-left me-1"></i> Quay lại
                        </router-link>
                    </div>
        </div>
    </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie'
export default {
    data() {
        return {
            token: Cookies.get('token'),
            dotGiamGia: {
                maDotGiamGia: '',
                tenDotGiamGia: '',
                phamTramGiam: null,
                soTienGiam: null,
                ngayBatDau: '',
                ngayKetThuc: '',
                trangThai: null
            },
            discountType: '%',
            discountValue: null,
            allDanhSachSP: [],
            soLuongTheoSanPham: {},
            selectedProductIds: [],
            productVariants: [],
            filteredVariants: [],
            selectedVariantIds: [],
            selectAll: false,
            selectAllVariants: false,
            searchQuery: '',
            variantSearchQuery: '',
            filteredProducts: [],
            productPage: 1,
            productsPerPage: 5,
            variantPage: 1,
            variantsPerPage: 5,
            errors: {
                tenDotGiamGia: '',
                discountValue: '',
                ngayBatDau: '',
                ngayKetThuc: '',
                selectedVariantIds: '',
                sp: ''
            },
            minDate: new Date().toISOString().slice(0, 16),
            chatLieu: [],
            coAo: [],
            kichCo: [],
            mau: [],
            tayAo: [],
            selectedLoai: '',
            selectedLoai1: '',
            selectedLoai2: '',
            selectedLoai3: '',
            selectedLoai4: ''
        };
    },
    computed: {
        isFormValid() {
            return (
                !this.errors.tenDotGiamGia &&
                !this.errors.discountValue &&
                !this.errors.ngayBatDau &&
                !this.errors.ngayKetThuc &&
                !this.errors.selectedVariantIds &&
                !this.errors.sp
            );
        },
        paginatedProducts() {
            const start = (this.productPage - 1) * this.productsPerPage;
            const end = start + this.productsPerPage;
            return this.filteredProducts.slice(start, end);
        },
        totalProductPages() {
            return Math.ceil(this.filteredProducts.length / this.productsPerPage);
        },
        paginatedVariants() {
            const start = (this.variantPage - 1) * this.variantsPerPage;
            const end = start + this.variantsPerPage;
            return this.filteredVariants.slice(start, end);
        },
        totalVariantPages() {
            return Math.ceil(this.filteredVariants.length / this.variantsPerPage);
        }
    },
    methods: {
        async getChatLieu() {
            const toast = useToast();
            try {
                const res = await fetch('http://localhost:8080/doi-giam-gia/chat-lieu', {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                if (!res.ok) throw new Error(`Không thể lấy danh sách chất liệu: ${res.statusText}`);
                const json = await res.json();
                this.chatLieu = json || [];
                if (!this.chatLieu.length) {
                    toast.warning('Không có dữ liệu chất liệu từ server');
                }
            } catch (error) {
                toast.error('Lỗi tải danh sách chất liệu: ' + error.message);
            }
        },
        async getTayAo() {
            const toast = useToast();
            try {
                const res = await fetch('http://localhost:8080/doi-giam-gia/tay-ao', {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                if (!res.ok) throw new Error(`Không thể lấy danh sách tay áo: ${res.statusText}`);
                const json = await res.json();
                this.tayAo = json || [];
                if (!this.tayAo.length) {
                    toast.warning('Không có dữ liệu tay áo từ server');
                }
            } catch (error) {
                toast.error('Lỗi tải danh sách tay áo: ' + error.message);
            }
        },
        async getCoAo() {
            const toast = useToast();
            try {
                const res = await fetch('http://localhost:8080/doi-giam-gia/co-ao', {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                if (!res.ok) throw new Error(`Không thể lấy danh sách cổ áo: ${res.statusText}`);
                const json = await res.json();
                this.coAo = json || [];
                if (!this.coAo.length) {
                    toast.warning('Không có dữ liệu cổ áo từ server');
                }
            } catch (error) {
                toast.error('Lỗi tải danh sách cổ áo: ' + error.message);
            }
        },
        async getKichCo() {
            const toast = useToast();
            try {
                const res = await fetch('http://localhost:8080/doi-giam-gia/kich-co', {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                if (!res.ok) throw new Error(`Không thể lấy danh sách kích cỡ: ${res.statusText}`);
                const json = await res.json();
                this.kichCo = json || [];
                if (!this.kichCo.length) {
                    toast.warning('Không có dữ liệu kích cỡ từ server');
                }
            } catch (error) {
                toast.error('Lỗi tải danh sách kích cỡ: ' + error.message);
            }
        },
        async getMau() {
            const toast = useToast();
            try {
                const res = await fetch('http://localhost:8080/doi-giam-gia/mau', {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                if (!res.ok) throw new Error(`Không thể lấy danh sách màu: ${res.statusText}`);
                const json = await res.json();
                this.mau = json || [];
                if (!this.mau.length) {
                    toast.warning('Không có dữ liệu màu từ server');
                }
            } catch (error) {
                toast.error('Lỗi tải danh sách màu: ' + error.message);
            }
        },
        async getDotGiamGia() {
            const toast = useToast();
            try {
                const id = this.$route.params.id;
                if (!id) throw new Error('ID đợt giảm giá không hợp lệ');

                // Fetch DotGiamGia details
                const response = await fetch(`http://localhost:8080/doi-giam-gia/${id}`, {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Không thể lấy thông tin đợt giảm giá: ${errorText}`);
                }
                const { data } = await response.json();
                console.log('DotGiamGia Data:', data);

                // Map data to form
                this.dotGiamGia = {
                    maDotGiamGia: data.maDotGiamGia || '',
                    tenDotGiamGia: data.tenDotGiamGia || '',
                    phamTramGiam: data.phamTramGiam || null,
                    soTienGiam: data.soTienGiam || null,
                    ngayBatDau: data.ngayBatDau ? new Date(data.ngayBatDau).toISOString().slice(0, 16) : '',
                    ngayKetThuc: data.ngayKetThuc ? new Date(data.ngayKetThuc).toISOString().slice(0, 16) : '',
                    trangThai: data.trangThai || null
                };

                // Set discount type and value
                this.discountType = data.phamTramGiam ? '%' : data.soTienGiam ? 'VND' : '%';
                this.discountValue = data.phamTramGiam || data.soTienGiam || null;

                // Fetch associated ChiTietDotGiamGia
                const chiTietResponse = await fetch(`http://localhost:8080/chi-tiet-dot-giam-gia/${id}`, {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                if (!chiTietResponse.ok) {
                    const errorText = await chiTietResponse.text();
                    throw new Error(`Không thể lấy danh sách sản phẩm chi tiết: ${errorText}`);
                }
                const chiTietData = await chiTietResponse.json();
                console.log('ChiTietDotGiamGia Data:', chiTietData);

                this.selectedVariantIds = chiTietData.map(item => item.idChiTietSanPham?.id).filter(id => id);
                this.selectedProductIds = [...new Set(chiTietData.map(item => item.idChiTietSanPham?.idSanPham?.id).filter(id => id))];

                // Fetch product variants for selected products
                await this.fetchProductVariants();
                this.filteredVariants = [...this.productVariants];

                // Validate form after data is loaded
                this.validateTenDotGiamGia();
                this.validateDiscountValue();
                this.validateDates();
                this.validateSelectedVariantIds();
            } catch (error) {
                console.error('Lỗi khi lấy thông tin đợt giảm giá:', error);
                toast.error('Lỗi: ' + error.message, { timeout: 5000 });
            }
        },
        async getAllDanhSachSP() {
            const toast = useToast();
            try {
                const response = await fetch('http://localhost:8080/doi-giam-gia/san-pham-giam-gia', {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                if (!response.ok) throw new Error('Không thể lấy danh sách sản phẩm');
                const json = await response.json();
                this.allDanhSachSP = (json.data || []).filter(sp => sp.trangThai === 1);
                this.soLuongTheoSanPham = json.soLuong || {};
                this.filteredProducts = [...this.allDanhSachSP];
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm:', error);
                toast.error('Lỗi tải danh sách sản phẩm: ' + error.message, { timeout: 5000 });
            }
        },
        async fetchProductVariants() {
            const toast = useToast();
            try {
                this.productVariants = [];
                this.filteredVariants = [];
                this.selectAllVariants = false;
                this.variantPage = 1; // Reset variant page when fetching new variants
                if (this.selectedProductIds.length > 0) {
                    const promises = this.selectedProductIds.map(id =>
                        fetch(`http://localhost:8080/doi-giam-gia/san-pham-chi-tiet/${id}`, {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
}).then(res => {
                            if (!res.ok) throw new Error(`Không thể lấy biến thể cho sản phẩm ${id}`);
                            return res.json();
                        })
                    );
                    const chiTietSanPhamResults = await Promise.all(promises);

                    const variantWithImages = await Promise.all(
                        chiTietSanPhamResults.flat().map(async (variant) => {
                            try {
                                const response = await fetch(`http://localhost:8080/san-pham/anh-san-pham/${variant.id}`, {
  headers: {
    Authorization: `Bearer ${this.token}` 
  }
});
                                const images = await response.json();
                                const maChiTietSanPham = variant.maChiTietSanPham || `SPCT-${variant.id}`;
                                const discountPercentage = await this.calculateDiscountPercentage(variant.id);
                                return {
                                    ...variant,
                                    maChiTietSanPham,
                                    images: images || [],
                                    mainImage: images.length > 0 ? images[0].duongDanAnh : 'https://via.placeholder.com/50',
                                    discountPercentage: discountPercentage.toFixed(2)
                                };
                            } catch (error) {
                                console.error(`Lỗi khi lấy ảnh hoặc tính phần trăm giảm cho variant ${variant.id}:`, error);
                                return {
                                    ...variant,
                                    images: [],
                                    mainImage: 'https://via.placeholder.com/50',
                                    discountPercentage: '0.00'
                                };
                            }
                        })
                    );

                    this.productVariants = variantWithImages;
                    this.filteredVariants = [...this.productVariants];
                    this.selectedVariantIds = this.productVariants
                        .filter(v => this.selectedVariantIds.includes(v.id))
                        .map(v => v.id);
                    this.selectAllVariants = this.selectedVariantIds.length === this.productVariants.length;
                    this.validateSelectedVariantIds();
                }
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm chi tiết:', error);
                toast.error('Lỗi tải danh sách sản phẩm chi tiết: ' + error.message, { timeout: 5000 });
            }
        },
        async calculateDiscountPercentage(variantId) {
            try {
                // Lấy tất cả đợt giảm giá hiện có
                const response = await fetch('http://localhost:8080/doi-giam-gia');
                if (!response.ok) throw new Error('Không thể lấy danh sách đợt giảm giá');
                const allDiscounts = await response.json();

                // Lấy chi tiết giảm giá cho variant này
                const chiTietResponse = await fetch(`http://localhost:8080/chi-tiet-dot-giam-gia/variant/${variantId}`);
                if (!chiTietResponse.ok) throw new Error('Không thể lấy chi tiết giảm giá');
                const variantDiscounts = await chiTietResponse.json();

                const now = new Date();
                let totalPercentage = 0;
                let activeCount = 0;

                // Tính toán các đợt giảm giá đang áp dụng
                variantDiscounts.forEach(item => {
                    const discount = allDiscounts.find(d => d.id === item.idDotGiamGia?.id);
                    if (discount) {
                        const startDate = new Date(discount.ngayBatDau);
                        const endDate = new Date(discount.ngayKetThuc);

                        // Chỉ tính nếu trạng thái khác 0 (không bị hủy)
                if (discount.trangThai !== 0 && startDate <= now && endDate >= now) {
                    totalPercentage += discount.phamTramGiam;
                    activeCount++;
                }
                    }
                });

                // Tính phần trăm trung bình nếu có nhiều đợt giảm giá cùng áp dụng
                if (activeCount > 0) {
                    return Math.round(totalPercentage / activeCount);
                }

                return 0; // Không có đợt giảm giá nào đang áp dụng
            } catch (error) {
                console.error('Lỗi tính phần trăm giảm giá:', error);
                return 0;
            }
        },
        async updateDotGiamGia() {
            const toast = useToast();
            try {
                // Show confirmation dialog
                const result = await Swal.fire({
                    title: 'Xác nhận sửa?',
                    text: 'Bạn có chắc muốn sửa dữ liệu này không?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Sửa',
                    cancelButtonText: 'Hủy'
                });

                this.validateTenDotGiamGia();
                this.validateDiscountValue();
                this.validateDates();
                this.validateSelectedVariantIds();

                if (!this.isFormValid) {
                    toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
                    return;
                }

                if (!result.isConfirmed) {
                    return;
                }

                const id = this.$route.params.id;
                const payload = {
                    maDotGiamGia: this.dotGiamGia.maDotGiamGia,
                    tenDotGiamGia: this.dotGiamGia.tenDotGiamGia,
                    phamTramGiam: this.discountType === '%' ? this.discountValue : null,
                    soTienGiam: this.discountType === 'VND' ? this.discountValue : null,
                    ngayBatDau: new Date(this.dotGiamGia.ngayBatDau).toISOString(),
                    ngayKetThuc: new Date(this.dotGiamGia.ngayKetThuc).toISOString(),
                    chiTietSanPhamIds: this.selectedVariantIds
                };
                console.log('Update Payload:', payload);

                const response = await fetch(`http://localhost:8080/doi-giam-gia/${id}`, {
                    method: 'PUT',
                    headers: {
                         Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                     },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Cập nhật thất bại: ${errorText}`);
                }
                const resultApi = await response.json();
                toast.success('Cập nhật đợt giảm giá thành công!', { timeout: 1000 });
                this.$router.push('/dot-giam-gia');
            } catch (error) {
                console.error('Lỗi khi cập nhật đợt giảm giá:', error);
                toast.error(`Lỗi: ${error.message}`, { timeout: 5000 });
            }
        },
        showImageGallery(images) {
            const toast = useToast();
            console.log('Showing gallery for images:', images);
            toast.info(`Đang hiển thị ${images.length} ảnh sản phẩm`, { timeout: 3000 });
        },
        selectAllProducts() {
            if (this.selectAll) {
                this.selectedProductIds = this.allDanhSachSP.map(sp => sp.id);
            } else {
                this.selectedProductIds = [];
            }
            this.fetchProductVariants();
        },
        toggleSelectAllVariants() {
            if (this.selectedVariantIds.length === this.filteredVariants.length) {
                this.selectedVariantIds = [];
            } else {
                this.selectedVariantIds = this.filteredVariants.map(variant => variant.id);
            }
            this.validateSelectedVariantIds();
        },
        filterProducts() {
            this.filteredProducts = this.allDanhSachSP.filter(sp =>
                sp.tenSanPham.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
            this.selectedProductIds = this.selectedProductIds.filter(id =>
                this.filteredProducts.some(sp => sp.id === id)
            );
            this.productPage = 1; // Reset to first page on filter
            this.fetchProductVariants();
        },
        filterVariants() {
            this.filteredVariants = this.productVariants.filter(variant => {
                const matchesSearch = !this.variantSearchQuery ||
                    (variant.maChiTietSanPham?.toLowerCase().includes(this.variantSearchQuery.toLowerCase()) ||
                        variant.idSanPham?.tenSanPham?.toLowerCase().includes(this.variantSearchQuery.toLowerCase()));

                const matchesChatLieu = !this.selectedLoai ||
                    variant.idSanPham?.idChatLieu?.id === this.selectedLoai;

                const matchesMau = !this.selectedLoai1 ||
                    variant.idMau?.id === this.selectedLoai1;

                const matchesKichCo = !this.selectedLoai2 ||
                    variant.idSize?.id === this.selectedLoai2;

                const matchesCoAo = !this.selectedLoai3 ||
                    variant.idCoAo?.id === this.selectedLoai3;

                const matchesTayAo = !this.selectedLoai4 ||
                    variant.idTayAo?.id === this.selectedLoai4;

                return matchesSearch && matchesChatLieu && matchesMau && matchesKichCo && matchesCoAo && matchesTayAo;
            });

            this.selectedVariantIds = this.selectedVariantIds.filter(id =>
                this.filteredVariants.some(v => v.id === id)
            );
            this.selectAllVariants = this.selectedVariantIds.length === this.filteredVariants.length && this.filteredVariants.length > 0;
            this.validateSelectedVariantIds();
            this.variantPage = 1; // Reset to first page on filter
        },
        updateDiscountValue() {
            this.discountValue = null;
            this.validateDiscountValue();
        },
        validateTenDotGiamGia() {
            if (!this.dotGiamGia.tenDotGiamGia) {
                this.errors.tenDotGiamGia = 'Tên đợt giảm giá là bắt buộc';
            } else if (this.dotGiamGia.tenDotGiamGia.length > 255) {
                this.errors.tenDotGiamGia = 'Tên đợt giảm giá không được vượt quá 255 ký tự';
            } else {
                this.errors.tenDotGiamGia = '';
            }
        },
        validateDiscountValue() {
            if (this.discountValue === null || this.discountValue <= 0) {
                this.errors.discountValue = 'Giá trị giảm phải lớn hơn 0';
            } else if (this.discountType === '%' && this.discountValue > 100) {
                this.errors.discountValue = 'Phần trăm giảm không được vượt quá 100';
            } else {
                this.errors.discountValue = '';
            }
        },
        validateDates() {
            const now = new Date();
            if (!this.dotGiamGia.ngayBatDau) {
                this.errors.ngayBatDau = 'Ngày bắt đầu là bắt buộc';
            } else if (new Date(this.dotGiamGia.ngayBatDau) < now) {
                this.errors.ngayBatDau = 'Ngày bắt đầu không được ở quá khứ';
            } else {
                this.errors.ngayBatDau = '';
            }

            if (!this.dotGiamGia.ngayKetThuc) {
                this.errors.ngayKetThuc = 'Ngày kết thúc là bắt buộc';
            } else if (this.dotGiamGia.ngayBatDau && new Date(this.dotGiamGia.ngayKetThuc) <= new Date(this.dotGiamGia.ngayBatDau)) {
                this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
            } else {
                this.errors.ngayKetThuc = '';
            }
        },
        validateSelectedVariantIds() {
            if (this.selectedProductIds.length === 0) {
                this.errors.sp = 'Phải chọn ít nhất một sản phẩm';
            } else {
                this.errors.sp = '';
            }
            if (this.selectedVariantIds.length === 0) {
                this.errors.selectedVariantIds = 'Phải chọn ít nhất một sản phẩm chi tiết';
            } else {
                this.errors.selectedVariantIds = '';
            }
        },
        goToProductPage(page) {
            if (page >= 1 && page <= this.totalProductPages) {
                this.productPage = page;
            }
        },
        goToVariantPage(page) {
            if (page >= 1 && page <= this.totalVariantPages) {
                this.variantPage = page;
            }
        }
    },
    watch: {
        selectedProductIds(newIds) {
            this.selectAll = newIds.length === this.allDanhSachSP.length && newIds.length > 0;
            this.validateSelectedVariantIds();
        },
        selectedVariantIds(newVariantIds) {
            this.selectAllVariants = newVariantIds.length === this.filteredVariants.length && newVariantIds.length > 0;
            this.validateSelectedVariantIds();
        }
    },
    mounted() {
        this.getAllDanhSachSP();
        this.getDotGiamGia();
        this.getChatLieu();
        this.getCoAo();
        this.getKichCo();
        this.getTayAo();
        this.getMau();
    }
};
</script>

<style>
.Toastify__toast--error {
    white-space: pre-line;
    font-size: 14px;
}

.icon-container {
    position: relative;
    display: inline-block;
}

.percentage-tag {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: #ff3333;
    color: white;
    padding: 2px 6px;
    border-radius: 3px;
    font-size: 12px;
}
</style>