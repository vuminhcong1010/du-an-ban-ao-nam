<template>
    <div class="container-fluid py-4">
        <div class="header-section">
            <button @click="goBack" class="back-button">
                <i class="fa-solid fa-arrow-left"></i> Quay lại
            </button>
            <h2 class="page-title-aligned">Thêm đợt giảm giá mới</h2>
        </div>

        <div class="bg-white p-4 rounded-3 shadow-sm">
            <div class="row gx-5">
                <div class="col-md-6 border-end">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Mã đợt giảm giá</label>
                        <input type="text" class="form-control" v-model="form.maDotGiamGia"
                            :class="{ 'is-invalid': errors.maDotGiamGia }" @input="validateField('maDotGiamGia')" />
                        <small class="text-muted">Để trống để tự động sinh mã</small>
                        <div class="invalid-feedback">{{ errors.maDotGiamGia }}</div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Tên đợt giảm giá <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" v-model="form.tenDotGiamGia"
                            :class="{ 'is-invalid': errors.tenDotGiamGia }" @input="validateField('tenDotGiamGia')" />
                        <div class="invalid-feedback">{{ errors.tenDotGiamGia }}</div>
                    </div>

                    <div class="mb-3">
                        <label class="form-label fw-bold">Phần trăm giảm <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <input type="number" class="form-control" v-model.number="form.giaTri"
                                :class="{ 'is-invalid': errors.giaTri }" @input="validateField('giaTri')" min="0.01"
                                max="100" />
                            <span class="input-group-text">%</span>
                        </div>
                        <div class="invalid-feedback d-block">{{ errors.giaTri }}</div>
                    </div>

                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Ngày bắt đầu <span class="text-danger">*</span></label>
                            <input type="datetime-local" class="form-control" v-model="form.ngayBatDau"
                                :class="{ 'is-invalid': errors.ngayBatDau }" :min="minDateTime"
                                @input="validateField('ngayBatDau')" />
                            <div class="invalid-feedback">{{ errors.ngayBatDau }}</div>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-bold">Ngày kết thúc <span class="text-danger">*</span></label>
                            <input type="datetime-local" class="form-control" v-model="form.ngayKetThuc"
                                :class="{ 'is-invalid': errors.ngayKetThuc }" :min="minDateTime"
                                @input="validateField('ngayKetThuc')" />
                            <div class="invalid-feedback">{{ errors.ngayKetThuc }}</div>
                        </div>
                    </div>
                </div>

                <div class="col-md-6">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <label class="fw-bold">Danh sách sản phẩm</label>
                        <div class="input-group input-group-sm w-50">
                            <input type="text" class="form-control" placeholder="Tìm theo tên..." v-model="searchQuery"
                                @input="filterProducts" />
                            <span class="input-group-text search-icon"><i class="fa fa-search"></i></span>
                        </div>
                    </div>
                    <div class="table-container">
                        <table class="table table-hover product-table">
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
                                            :class="{ 'bg-success': sanpham.trangThai === 1, 'bg-danger': sanpham.trangThai !== 1 }">
                                            {{ sanpham.trangThai === 1 ? 'Đang bán' : 'Ngừng bán' }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <nav class="mt-4">
                        <ul class="pagination justify-content-end">
                            <li class="page-item" :class="{ disabled: productPage === 0 }">
                                <a class="page-link" href="#" @click.prevent="prevProductPage">«</a>
                            </li>
                            <li class="page-item" v-for="p in productTotalPages" :key="p"
                                :class="{ 'active-pagination': p - 1 === productPage }">
                                <a class="page-link" href="#" @click.prevent="goToProductPage(p - 1)">{{ p }}</a>
                            </li>
                            <li class="page-item" :class="{ disabled: productPage >= productTotalPages - 1 }">
                                <a class="page-link" href="#" @click.prevent="nextProductPage">»</a>
                            </li>
                        </ul>
                    </nav>
                    <div class="invalid-feedback d-block" v-if="errors.sp">{{ errors.sp }}</div>
                </div>
            </div>

            <div v-if="selectedProductIds.length > 0" class="mt-5 p-4 rounded-3 border">
                <h4>Danh sách sản phẩm chi tiết</h4>
                <div class="row g-3 align-items-end mt-2 mb-4">
                    <div class="col-md-2">
                        <label class="form-label fw-bold">Tìm kiếm</label>
                        <div class="input-group">
                            <input type="text" class="form-control" placeholder="Nhập tên, mã"
                                v-model="variantSearchQuery" @input="filterVariants" />
                            <span class="input-group-text search-icon"><i class="fa fa-search"></i></span>
                        </div>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table table-hover variant-table">
                        <thead class="table-light">
                            <tr>
                                <th>
                                    <input type="checkbox"
                                        :checked="selectedVariantIds.length === filteredVariants.length && filteredVariants.length > 0"
                                        @change="toggleSelectAllVariants" />
                                </th>
                                <th>STT</th>
                                <th>Ảnh sản phẩm</th>
                                <th>Mã sản phẩm</th>
                                <th>Tên sản phẩm</th>
                                <th>Số lượng tồn</th>
                                <th>Giá bán</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(variant, index) in paginatedVariants" :key="variant.id">
                                <td><input type="checkbox" :value="variant.id" v-model="selectedVariantIds"
                                        @change="validateField('selectedVariantIds')" /></td>
                                <td>{{ (variantPage * itemsPerPage) + index + 1 }}</td>
                                <td>
                                    <div class="icon-container">
                                        <img :src="variant.images.length > 0 ? variant.images[0].duongDanAnh : 'https://via.placeholder.com/50'"
                                            alt="Ảnh sản phẩm" style="width: 50px; height: 50px; object-fit: cover;" />
                                        <span v-if="variant.images.length > 1"
                                            class="badge bg-secondary position-absolute top-0 end-0 translate-middle badge-plus">+{{
                                            variant.images.length - 1 }}</span>
                                    </div>
                                </td>
                                <td>{{ variant.maChiTietSanPham || 'N/A' }}</td>
                                <td>{{ variant.idSanPham?.tenSanPham || 'N/A' }}</td>
                                <td>{{ variant.soLuong || 0 }}</td>
                                <td>{{ variant.gia ? variant.gia.toLocaleString('vi-VN', {
                                    style: 'currency', currency:
                                    'VND' }) : 'N/A' }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <nav class="mt-4">
                    <ul class="pagination justify-content-end">
                        <li class="page-item" :class="{ disabled: variantPage === 0 }">
                            <a class="page-link" href="#" @click.prevent="prevVariantPage">«</a>
                        </li>
                        <li class="page-item" v-for="p in variantTotalPages" :key="p"
                            :class="{ 'active-pagination': p - 1 === variantPage }">
                            <a class="page-link" href="#" @click.prevent="goToVariantPage(p - 1)">{{ p }}</a>
                        </li>
                        <li class="page-item" :class="{ disabled: variantPage >= variantTotalPages - 1 }">
                            <a class="page-link" href="#" @click.prevent="nextVariantPage">»</a>
                        </li>
                    </ul>
                </nav>
                <div class="invalid-feedback d-block" v-if="errors.selectedVariantIds">{{ errors.selectedVariantIds }}
                </div>
            </div>

            <div class="d-flex justify-content-end mt-4">
                <button class="btn btn-cancel me-2" @click="goBack">Hủy</button>
                <button class="btn btn-save" @click="submitForm">Lưu</button>
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
            form: {
                maDotGiamGia: '',
                tenDotGiamGia: '',
                giaTri: null,
                ngayBatDau: '',
                ngayKetThuc: '',
                moTa: ''
            },
            errors: {
                maDotGiamGia: '',
                tenDotGiamGia: '',
                giaTri: '',
                ngayBatDau: '',
                ngayKetThuc: '',
                selectedVariantIds: '',
                sp: ''
            },
            minDateTime: '',
            itemsPerPage: 5,
            productPage: 0,
            variantPage: 0,
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
                !this.errors.maDotGiamGia &&
                !this.errors.tenDotGiamGia &&
                !this.errors.giaTri &&
                !this.errors.ngayBatDau &&
                !this.errors.ngayKetThuc &&
                !this.errors.selectedVariantIds &&
                !this.errors.sp &&
                this.form.tenDotGiamGia &&
                this.form.giaTri > 0 &&
                this.form.ngayBatDau &&
                this.form.ngayKetThuc &&
                (this.filteredVariants.length === 0 || this.selectedVariantIds.length > 0) &&
                this.selectedProductIds.length > 0
            );
        },
        paginatedProducts() {
            const start = this.productPage * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredProducts.slice(start, end);
        },
        productTotalPages() {
            return Math.ceil(this.filteredProducts.length / this.itemsPerPage);
        },
        paginatedVariants() {
            const start = this.variantPage * this.itemsPerPage;
            const end = start + this.itemsPerPage;
            return this.filteredVariants.slice(start, end);
        },
        variantTotalPages() {
            return Math.ceil(this.filteredVariants.length / this.itemsPerPage);
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
                this.chatLieu = await res.json() || [];
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
                this.tayAo = await res.json() || [];
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
                this.coAo = await res.json() || [];
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
                this.kichCo = await res.json() || [];
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
                this.mau = await res.json() || [];
                if (!this.mau.length) {
                    toast.warning('Không có dữ liệu màu từ server');
                }
            } catch (error) {
                toast.error('Lỗi tải danh sách màu: ' + error.message);
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
                if (!response.ok) throw new Error(`Không thể lấy danh sách sản phẩm: ${response.statusText}`);
                const json = await response.json();
                if (json.message !== 'Success') throw new Error(json.message);
                // Lọc sản phẩm có trạng thái đang bán và số lượng lớn hơn 0
                this.allDanhSachSP = (json.data || []).filter(sp => sp.trangThai === 1 && (json.soLuong[sp.id] || 0) > 0);
                this.soLuongTheoSanPham = json.soLuong || {};
                this.filteredProducts = [...this.allDanhSachSP];
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm:', error);
                toast.error('Lỗi tải danh sách sản phẩm: ' + error.message);
            }
        },
        // Cập nhật hàm fetchProductVariants để lọc ngay từ đầu
        async fetchProductVariants() {
            const toast = useToast();
            try {
                this.productVariants = [];
                this.filteredVariants = [];
                this.selectedVariantIds = [];
                this.selectAllVariants = false;

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
                        chiTietSanPhamResults.flat()
                            .filter(variant => variant.soLuong > 0) // Lọc ngay từ đầu
                            .map(async (variant) => {
                                try {
                                    const response = await fetch(`http://localhost:8080/san-pham/anh-san-pham/${variant.id}`, {
                                        headers: {
                                            Authorization: `Bearer ${this.token}`
                                        }
                                    });
                                    const images = await response.json();
                                    const maChiTietSanPham = variant.maChiTietSanPham || `SPCT-${variant.id}`;
                                    return {
                                        ...variant,
                                        maChiTietSanPham,
                                        images: images || [],
                                        mainImage: images.length > 0 ? images[0].duongDanAnh : 'https://via.placeholder.com/50'
                                    };
                                } catch (error) {
                                    console.error(`Lỗi khi lấy ảnh cho variant ${variant.id}:`, error);
                                    return {
                                        ...variant,
                                        maChiTietSanPham: variant.maChiTietSanPham || `SPCT-${variant.id}`,
                                        images: [],
                                        mainImage: 'https://via.placeholder.com/50'
                                    };
                                }
                            })
                    );

                    this.productVariants = variantWithImages;
                    this.filteredVariants = [...this.productVariants];
                    this.selectedVariantIds = this.productVariants.map(variant => variant.id);
                    this.selectAllVariants = this.productVariants.length > 0;
                    this.validateField('selectedVariantIds');
                } else {
                    this.errors.selectedVariantIds = '';
                    this.validateField('selectedVariantIds');
                }
                this.goToVariantPage(0);
            } catch (error) {
                console.error('Lỗi khi lấy danh sách sản phẩm chi tiết:', error);
                toast.error('Lỗi tải danh sách sản phẩm chi tiết: ' + error.message);
            }
        },
        // Cập nhật hàm filterVariants trong methods
        filterVariants() {
            this.filteredVariants = this.productVariants.filter(variant => {
                // Chỉ hiển thị sản phẩm có số lượng tồn > 0
                const hasPositiveInventory = variant.soLuong > 0;

                const matchesSearch = !this.variantSearchQuery ||
                    variant.maChiTietSanPham?.toLowerCase().includes(this.variantSearchQuery.toLowerCase()) ||
                    variant.idSanPham?.tenSanPham?.toLowerCase().includes(this.variantSearchQuery.toLowerCase());

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

                // Trả về true chỉ khi tất cả điều kiện đều thỏa mãn VÀ số lượng tồn > 0
                return hasPositiveInventory && matchesSearch && matchesChatLieu && matchesMau && matchesKichCo && matchesCoAo && matchesTayAo;
            });

            // Cập nhật selectedVariantIds để loại bỏ các variant không còn trong filteredVariants
            this.selectedVariantIds = this.selectedVariantIds.filter(id =>
                this.filteredVariants.some(variant => variant.id === id)
            );

            // Cập nhật trạng thái checkbox "Chọn tất cả"
            this.selectAllVariants = this.selectedVariantIds.length === this.filteredVariants.length && this.filteredVariants.length > 0;

            // Validate lại field
            this.validateField('selectedVariantIds');

            // Reset về trang đầu
            this.goToVariantPage(0);
        },
        showImageGallery(images) {
            const toast = useToast();
            toast.info(`Đang hiển thị ${images.length} ảnh sản phẩm`);
        },
        selectAllProducts() {
            if (this.selectAll) {
                this.selectedProductIds = this.allDanhSachSP.map(sp => sp.id);
            } else {
                this.selectedProductIds = [];
            }
            this.fetchProductVariants();
            this.validateField('sp');
        },
        toggleSelectAllVariants() {
            if (this.selectedVariantIds.length === this.filteredVariants.length && this.filteredVariants.length > 0) {
                this.selectedVariantIds = [];
                this.selectAllVariants = false;
            } else {
                this.selectedVariantIds = this.filteredVariants.map(variant => variant.id);
                this.selectAllVariants = true;
            }
            this.validateField('selectedVariantIds');
        },
        filterProducts() {
            this.filteredProducts = this.allDanhSachSP.filter(sp =>
                sp.tenSanPham.toLowerCase().includes(this.searchQuery.toLowerCase())
            );
            this.selectedProductIds = this.selectedProductIds.filter(id =>
                this.filteredProducts.some(sp => sp.id === id)
            );
            this.fetchProductVariants();
            this.validateField('sp');
            this.goToProductPage(0);
        },
        validateField(field) {
            this.errors[field] = '';
            const now = new Date();
            switch (field) {
                case 'maDotGiamGia':
                    if (this.form.maDotGiamGia && this.form.maDotGiamGia.length > 100) {
                        this.errors.maDotGiamGia = 'Mã không được vượt quá 100 ký tự';
                    }
                    break;
                case 'tenDotGiamGia':
                    const trimmedTenDotGiamGia = this.form.tenDotGiamGia ? this.form.tenDotGiamGia.trim() : '';
                    if (!trimmedTenDotGiamGia) {
                        this.errors.tenDotGiamGia = 'Vui lòng nhập tên đợt giảm giá';
                    } else if (trimmedTenDotGiamGia.length > 255) {
                        this.errors.tenDotGiamGia = 'Tên không được vượt quá 255 ký tự';
                    }
                    break;
                case 'giaTri':
                    if (this.form.giaTri === null || this.form.giaTri === undefined || this.form.giaTri === '') {
                        this.errors.giaTri = 'Vui lòng nhập phần trăm giảm giá';
                    } else if (this.form.giaTri <= 0) {
                        this.errors.giaTri = 'Phần trăm giảm phải lớn hơn 0';
                    } else if (this.form.giaTri > 100) {
                        this.errors.giaTri = 'Phần trăm giảm không được vượt quá 100';
                    }
                    break;
                case 'ngayBatDau':
                    if (!this.form.ngayBatDau) {
                        this.errors.ngayBatDau = 'Vui lòng chọn ngày bắt đầu';
                    } else {
                        const selectedDate = new Date(this.form.ngayBatDau);
                        if (selectedDate < now) {
                            this.errors.ngayBatDau = 'Ngày bắt đầu không được ở quá khứ';
                        }
                    }
                    break;
                case 'ngayKetThuc':
                    if (!this.form.ngayKetThuc) {
                        this.errors.ngayKetThuc = 'Vui lòng chọn ngày kết thúc';
                    } else {
                        const selectedDate = new Date(this.form.ngayKetThuc);
                        if (selectedDate < now) {
                            this.errors.ngayKetThuc = 'Ngày kết thúc không được ở quá khứ';
                        } else if (this.form.ngayBatDau && selectedDate <= new Date(this.form.ngayBatDau)) {
                            this.errors.ngayKetThuc = 'Ngày kết thúc phải sau ngày bắt đầu';
                        }
                    }
                    break;
                case 'selectedVariantIds':
                    if (this.filteredVariants.length > 0 && this.selectedVariantIds.length === 0) {
                        this.errors.selectedVariantIds = 'Vui lòng chọn ít nhất một sản phẩm chi tiết';
                    }
                    break;
                case 'sp':
                    if (this.selectedProductIds.length === 0 && this.filteredProducts.length > 0) {
                        this.errors.sp = 'Vui lòng chọn ít nhất một sản phẩm';
                    }
                    break;
            }
            this.$forceUpdate();
        },
        validateForm() {
            this.validateField('maDotGiamGia');
            this.validateField('tenDotGiamGia');
            this.validateField('giaTri');
            this.validateField('ngayBatDau');
            this.validateField('ngayKetThuc');
            this.validateField('selectedVariantIds');
            this.validateField('sp');
            return this.isFormValid;
        },
        async submitForm() {
            const toast = useToast();
            if (!this.validateForm()) {
                toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
                return;
            }

            const result = await Swal.fire({
                title: 'Xác nhận thêm?',
                text: "Bạn có chắc muốn thêm dữ liệu này không?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Thêm',
                cancelButtonText: 'Hủy'
            });

            if (!result.isConfirmed) {
                return;
            }

            const dotGiamGia = {
                maDotGiamGia: this.form.maDotGiamGia ? this.form.maDotGiamGia.trim() : null,
                tenDotGiamGia: this.form.tenDotGiamGia.trim(),
                phamTramGiam: this.form.giaTri,
                ngayBatDau: new Date(this.form.ngayBatDau).toISOString(),
                ngayKetThuc: new Date(this.form.ngayKetThuc).toISOString(),
                ngayTao: new Date().toISOString(),
                moTa: this.form.moTa ? this.form.moTa.trim() : null,
                trangThai: 1,
                chiTietSanPhamIds: this.selectedVariantIds
            };

            try {
                const response = await fetch('http://localhost:8080/doi-giam-gia', {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${this.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dotGiamGia)
                });
                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.message || 'Không thể thêm đợt giảm giá');
                }
                toast.success(`Thêm đợt giảm giá thành công! Mã: ${result.data.maDotGiamGia}`);
                this.$router.push('/dot-giam-gia');
            } catch (error) {
                console.error('Lỗi khi thêm đợt giảm giá:', error);
                toast.error(`Lỗi: ${error.message}`);
            }
        },
        prevProductPage() {
            if (this.productPage > 0) this.productPage--;
        },
        nextProductPage() {
            if (this.productPage < this.productTotalPages - 1) this.productPage++;
        },
        goToProductPage(page) {
            if (page >= 0 && page < this.productTotalPages) this.productPage = page;
        },
        prevVariantPage() {
            if (this.variantPage > 0) this.variantPage--;
        },
        nextVariantPage() {
            if (this.variantPage < this.variantTotalPages - 1) this.variantPage++;
        },
        goToVariantPage(page) {
            if (page >= 0 && page < this.variantTotalPages) this.variantPage = page;
        }
    },
    watch: {
        selectedProductIds(newIds) {
            this.selectAll = newIds.length === this.allDanhSachSP.length && newIds.length > 0;
            this.fetchProductVariants();
            this.validateField('sp');
        },
        selectedVariantIds(newVariantIds) {
            this.selectAllVariants = newVariantIds.length === this.filteredVariants.length && newVariantIds.length > 0;
            this.validateField('selectedVariantIds');
        },
        'form.maDotGiamGia'() {
            this.validateField('maDotGiamGia');
        },
        'form.tenDotGiamGia'() {
            this.validateField('tenDotGiamGia');
        },
        'form.giaTri'() {
            this.validateField('giaTri');
        },
        'form.ngayBatDau'() {
            this.validateField('ngayBatDau');
        },
        'form.ngayKetThuc'() {
            this.validateField('ngayKetThuc');
        }
    },
    mounted() {
        const now = new Date();
        this.minDateTime = now.toISOString().slice(0, 16);
        this.getAllDanhSachSP();
        this.getChatLieu();
        this.getCoAo();
        this.getKichCo();
        this.getTayAo();
        this.getMau();
    }
};
</script>

<style scoped>
/* General Layout and Background */

.bg-white {
    background-color: #ffffff;
}

/* Header Section */
.header-section {
    display: flex;
    align-items: center;
    margin-bottom: 2.5rem;
    gap: 2rem;
}

.back-button {
    background-color: #e9ecef;
    /* Màu xám nhạt */
    color: #495057;
    /* Màu chữ xám đậm */
    padding: 0.75rem 1.25rem;
    /* Tăng padding cho nút */
    border-radius: 0.4rem;
    /* Bo tròn vừa phải */
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
    flex-shrink: 0;
    /* Không co lại */
    font-size: 1rem;
    /* Kích thước font cho nút */
}

.back-button:hover {
    background-color: #dee2e6;
    color: #0a2c57;
}

.page-title-aligned {
    font-size: 2.2rem;
    font-weight: 700;
    color: #0a2c57;
    margin: 0;
    line-height: 1;
}

/* Form Styling */
.form-label {
    font-weight: 600;
    color: #495057;
}

.form-control,
.form-select {
    border-radius: 6px;
    border: 1px solid #e0e0e0;
}

.form-control:focus,
.form-select:focus {
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
    border-color: #86b7fe;
}

/* Table and Pagination */
.table-container {
    max-height: 400px;
    overflow-y: auto;
}

.product-table,
.variant-table {
    width: 100%;
    margin-bottom: 0;
}

.table thead th {
    background-color: #f8f9fa;
    color: #495057;
    font-weight: 600;
}

.table-hover tbody tr:hover {
    background-color: #f1f1f1;
}

.page-item.active-pagination .page-link {
    background-color: #0b2253;
    border-color: #0b2253;
    color: #fff;
}

.page-link {
    color: #0b2253;
}

.pagination {
    margin-bottom: 0;
}

.search-icon {
    background-color: #e9ecef;
    border-color: #ced4da;
    color: #495057;
}

/* Image and Badges */
.icon-container {
    position: relative;
    display: inline-block;
}

.badge-plus {
    background-color: #6c757d !important;
    font-size: 0.75rem;
    padding: 0.3em 0.6em;
}

/* Action Buttons */
.btn-save {
    background-color: #0a2c57;
    color: white;
    font-weight: 600;
    border: none;
    padding: 10px 20px;
}

.btn-save:hover {
    background-color: #071f3e;
    color: white;
    transform: translateY(-1px);
}

.btn-cancel {
    background-color: #6c757d;
    color: white;
    font-weight: 600;
    border: none;
    padding: 10px 20px;
}

.btn-cancel:hover {
    background-color: #5c636a;
    transform: translateY(-1px);
    color: white;
}

.border-end {
    border-right: 1px solid #e0e0e0 !important;
}
</style>