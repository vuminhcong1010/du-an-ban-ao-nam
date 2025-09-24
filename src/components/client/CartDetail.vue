<template>
    <div class="container py-4">
        <div class="cart-header">
            <h3>Giỏ hàng</h3>
        </div>

        <!-- Header -->
        <div class="cart-header-row">
            <div class="col-checkbox">
                <input type="checkbox" v-model="chonTatCa" @change="chonTatCaChange" />
            </div>
            <div class="col-name">Sản Phẩm</div>
            <div></div>
            <div class="col-price">Đơn Giá</div>
            <div class="col-quantity">Số Lượng</div>
            <div class="col-total">Số Tiền</div>
            <div class="col-action">Thao Tác</div>
        </div>

        <div class="cart-items">
            <!-- Có sản phẩm -->
            <div v-if="danhSachGio.length > 0">
                <!-- Nhóm theo danh mục -->
                <div v-for="(spTheoDanhMuc, tenDanhMuc) in nhomTheoDanhMuc" :key="tenDanhMuc" class="category-group">

                    <!-- Tên danh mục -->
                    <div class="cart-item category-header">
                        <div class="col-checkbox">
                            <input type="checkbox" :checked="danhMucDaChon[tenDanhMuc]"
                                @change="chonTheoDanhMuc(tenDanhMuc, $event)" />

                        </div>
                        <div class="col-name">
                            <span class="category-name">{{ tenDanhMuc }}</span>
                        </div>
                    </div>

                    <!-- Các sản phẩm -->
                    <div class="cart-item" v-for="sp in spTheoDanhMuc" :key="sp.idSanPhamChiTiet">

                        <!-- Checkbox -->
                        <div class="col-checkbox">
                            <input type="checkbox" v-model="sp.chon" />
                        </div>

                        <!-- Tên sản phẩm + ảnh -->
                        <div class="col-name product-cell">
                            <img :src="sp.anhSanPham || '/placeholder.png'" class="item-img" />
                            <div class="product-info">
                                <p class="item-name">{{ sp.tenSanPham }}</p>
                                <p v-if="sp.phanTramGiamGia > 0" class="discount-save">
                                    Tiết kiệm {{ sp.phanTramGiamGia }}%
                                </p>
                            </div>
                        </div>

                        <!-- Màu + Size -->
                        <div class="col-variant">
                            <p
                                v-if="(sp.mauSacList && sp.mauSacList.length) || (sp.kichCoList && sp.kichCoList.length)">
                                <span v-if="sp.mauSacList && sp.mauSacList.length">
                                    {{ sp.mauSacList.join(', ') }}
                                </span>
                                <span v-if="sp.kichCoList && sp.kichCoList.length">
                                    , {{ sp.kichCoList.join(', ') }}
                                </span>
                            </p>
                        </div>

                        <!-- Giá -->
                        <div class="col-price">
                            <template v-if="sp.phanTramGiamGia > 0">
                                <span class="old-price">
                                    {{ formatGiaVND(sp.gia / (1 - sp.phanTramGiamGia / 100)) }} đ
                                </span>

                                <span class="new-price">{{ formatGiaVND(sp.gia) }} đ</span>

                            </template>
                            <template v-else>
                                <span class="new-price">{{ formatGiaVND(sp.gia) }} đ</span>

                            </template>
                        </div>

                        <!-- Số lượng -->
                        <div class="col-quantity">
                            <div class="quantity-box">
                                <input type="number" v-model="sp.soLuong" @change="capNhatSoLuong(sp)" />
                            </div>
                        </div>

                        <!-- Thành tiền -->
                        <div class="col-total">
                            {{ formatGiaVND(sp.gia * sp.soLuong) }} đ
                        </div>

                        <!-- Xóa -->
                        <div class="col-action">
                            <button class="remove-btn" @click="xoaSanPham(sp)">Xóa</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Giỏ trống -->
            <div v-else class="empty-cart">
                <div class="empty-icon">🛒</div>
                <h4>Giỏ hàng của bạn đang trống.</h4>
                <p>Vui lòng thêm một số sản phẩm vào giỏ hàng của bạn.</p>
                <button class="btn btn-primary browse-products-btn" @click="goToProducts">
                    Duyệt qua các sản phẩm của chúng tôi
                </button>
            </div>
        </div>
        <!-- Footer cố định -->
        <div class="cart-footer-static" v-if="danhSachGio.length > 0">
            <div class="footer-content">
                <div class="footer-left">
                    <input type="checkbox" v-model="chonTatCa" @change="chonTatCaChange" />
                    <span>Chọn Tất Cả ({{ soSanPhamTrongGio }})</span>
                    <button @click="xoaGioHang" class="footer-delete">Xóa</button>
                </div>
                <div class="footer-right">
                    <span class="total-label">
                        Tổng cộng ({{ tongSoLuongDaChon }} sản phẩm):
                    </span>
                    <span class="total-amount">
                        {{ tongSoLuongDaChon > 0 ? formatGiaVND(tongTienDaChon) + ' đ' : '0 đ' }}
                    </span>
                    <button class="footer-checkout" @click="thanhToan">
                        Mua Hàng
                    </button>
                </div>
            </div>
        </div>


    </div>
</template>




<script>
import axios from 'axios';
import { useToast } from 'vue-toastification'
import Swal from 'sweetalert2'
const toast = useToast();

export default {
    props: {
        danhSachGio: {
            type: Array,
            required: true
        },
    },
    computed: {
        tongSoLuong() {
            return this.danhSachGio.reduce((sum, item) => sum + item.soLuong, 0);
        },
        tongTien() {
            return this.danhSachGio.reduce((sum, item) => sum + item.gia * item.soLuong, 0);
        },
        nhomTheoDanhMuc() {
            return this.danhSachGio.reduce((acc, sp) => {
                if (!acc[sp.tenDanhMuc]) {
                    acc[sp.tenDanhMuc] = [];
                }
                acc[sp.tenDanhMuc].push(sp);
                return acc;
            }, {});
        },
        /** ✅ Tổng số sản phẩm được chọn */
        tongSoLuongDaChon() {
            return this.danhSachGio.filter(sp => sp.chon).length;
        },


        /** ✅ Tổng số sản phẩm trong giỏ (theo item, không cộng số lượng) */
        soSanPhamTrongGio() {
            return this.danhSachGio.length;
        },
        tongTienDaChon() {
            return this.danhSachGio
                .filter(sp => sp.chon)
                .reduce((sum, sp) => sum + sp.gia * sp.soLuong, 0);
        },

    },
    mounted() {
        this.$watch(
            () => this.danhSachGio.map(sp => sp.chon),
            () => {
                this.capNhatTrangThaiChon();
            },
            { deep: true }
        );
    },
    methods: {
        formatGiaVND(gia) {
            return Math.round(gia).toLocaleString('vi-VN');
        },

        capNhatTrangThaiChon() {
            // Cập nhật theo từng danh mục
            for (const tenDanhMuc in this.nhomTheoDanhMuc) {
                const spTrongDanhMuc = this.nhomTheoDanhMuc[tenDanhMuc];
                const tatCaChon = spTrongDanhMuc.every(sp => sp.chon);
                this.danhMucDaChon[tenDanhMuc] = tatCaChon;

            }

            // Cập nhật tổng "Chọn tất cả"
            this.kiemTraChonTatCa();
        },
        goToProducts() {
            this.$emit('close'); // Đóng popup giỏ hàng
            this.$router.push({ name: 'client-san-pham' }); // Chuyển sang trang sản phẩm
        },

        async xoaGioHang() {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Xóa giỏ hàng',
                html: `Toàn bộ sản phẩm trong giỏ hàng sẽ bị xóa vĩnh viễn.<br>Bạn có chắc chắn muốn thực hiện?`,
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Bỏ qua',
                reverseButtons: true,
                customClass: {
                    confirmButton: 'swal2-confirm btn btn-danger',
                    cancelButton: 'swal2-cancel btn btn-secondary'
                }
            });

            if (!result.isConfirmed) return;

            try {

                await axios.delete(`http://localhost:8080/client/XoaGioHang`, {

                    withCredentials: true
                });

                this.$emit('update:danhSachGio', []);
                this.$emit('capNhatGio');
                window.dispatchEvent(new Event("cap-nhat-gio"));

                toast.success("✅ Giỏ hàng đã được xóa!", {
                    timeout: 3000,
                    position: "top-right"
                });
            } catch (err) {
                console.error("Lỗi khi xóa giỏ hàng:", err);
                toast.error("❌ Xóa giỏ hàng thất bại, vui lòng thử lại.", {
                    timeout: 3000,
                    position: "top-right"
                });
            }
        }
        ,
        async xoaSanPham(sp) {
            const result = await Swal.fire({
                icon: 'warning',
                title: 'Xóa sản phẩm',
                html: `Sản phẩm <strong>"${sp.tenSanPham}"</strong> sẽ bị xóa khỏi giỏ hàng.<br>Bạn có chắc chắn muốn xóa?`,
                showCancelButton: true,
                confirmButtonText: 'Đồng ý',
                cancelButtonText: 'Bỏ qua',
                reverseButtons: true,
                customClass: {
                    confirmButton: 'swal2-confirm btn btn-primary',
                    cancelButton: 'swal2-cancel btn btn-secondary'
                }
            });

            if (!result.isConfirmed) return;

            try {
                await axios.delete(`http://localhost:8080/client/XoaSanPham/${sp.idSanPhamChitiet}`, {
                    withCredentials: true
                });

                const gioMoi = this.danhSachGio.filter(item => item.idSanPhamChiTiet !== sp.idSanPhamChiTiet);
                this.$emit('update:danhSachGio', gioMoi);
                this.$emit('capNhatGio');
                window.dispatchEvent(new Event("cap-nhat-gio"));

                toast.success(`✅ Đã xóa sản phẩm "${sp.tenSanPham}" khỏi giỏ hàng!`, {
                    timeout: 3000,
                    position: "top-right"
                });
            } catch (err) {
                console.error("Lỗi khi xóa sản phẩm:", err);
                toast.error("❌ Xóa sản phẩm thất bại, vui lòng thử lại.", {
                    timeout: 3000,
                    position: "top-right"
                });
            }
        }
        ,
        async capNhatSoLuong(sp) {
            try {
                this.dangCapNhat = true;

                // Ép kiểu về số
                const soLuong = parseInt(sp.soLuong);

                // ✅ Nếu không phải số hợp lệ
                if (isNaN(soLuong) || sp.soLuong === '') {
                    if (sp.soLuong !== 1) {
                        toast.warning(`❌ Số lượng không hợp lệ.`, { timeout: 3000 });
                    }
                    sp.soLuong = 1;
                    return;
                }

                // ✅ Nếu vượt quá số lượng tồn
                if (soLuong > sp.soLuongTon) {
                    toast.warning(`⚠️ Chỉ còn ${sp.soLuongTon} sản phẩm trong kho.`, { timeout: 3000 });
                    sp.soLuong = sp.soLuongTon;
                    return;
                }

                // ✅ Nếu nhỏ hơn 1
                if (soLuong < 1) {
                    toast.warning(`❌ Số lượng phải tối thiểu là 1.`, { timeout: 3000 });
                    sp.soLuong = 1;
                    return;
                }

                // Gửi API cập nhật số lượng
                await axios.post("http://localhost:8080/client/CapNhatSoLuong", sp, {
                    withCredentials: true
                });
            } catch (err) {
                console.error("Lỗi cập nhật số lượng:", err);
                alert("Lỗi khi cập nhật số lượng sản phẩm.");
            } finally {
                this.dangCapNhat = false;
            }
        }
        ,
        async thanhToan() {
            if (this.dangCapNhat) {
                toast.warning(" Đang cập nhật số lượng sản phẩm. Vui lòng đợi một chút...", {
                    timeout: 4000,
                    position: "top-right"
                });
                return;
            }

            try {
                const sanPhamDuocChon = this.danhSachGio.filter(sp => sp.chon);

                if (sanPhamDuocChon.length === 0) {
                    toast.warning("⚠️ Vui lòng chọn ít nhất 1 sản phẩm để thanh toán.");
                    return;
                }

                const res = await axios.post(
                    "http://localhost:8080/client/clientTaoHoaDonChiTiet",
                    sanPhamDuocChon,
                    { withCredentials: true }
                );

                const hoaDonId = res.data.hoaDonId;
                this.$router.push({
                    name: "client-Oder",
                    params: { hoaDonId }
                })
            } catch (err) {
                console.error(err);
                toast.error("❌ Mua hàng  thất bại, vui lòng thử lại.", {
                    timeout: 3000,
                    position: "top-right"
                });
            }
        }
        ,
        mapColorToCssClass(apiColor) {
            if (!apiColor) return '#CCCCCC';
            const key = apiColor.trim().toLowerCase();
            return this.colorMap[key] || '#CCCCCC';
        },
        isLightColor(colorName) {
            const hex = this.mapColorToCssClass(colorName);
            if (!hex || hex === '#CCCCCC') return false;

            const c = hex.substring(1);
            const rgb = parseInt(c, 16);
            const r = (rgb >> 16) & 0xff;
            const g = (rgb >> 8) & 0xff;
            const b = (rgb >> 0) & 0xff;

            const yiq = (r * 299 + g * 587 + b * 114) / 1000;
            return yiq > 160;
        },
        chonTheoDanhMuc(tenDanhMuc, event) {
            const chon = event.target.checked;
            this.danhMucDaChon[tenDanhMuc] = chon;

            this.nhomTheoDanhMuc[tenDanhMuc].forEach(sp => {
                sp.chon = chon;
            });

            // Kiểm tra lại chọn tất cả
            this.kiemTraChonTatCa();
        },

        kiemTraChonTatCa() {
            let tatCaChon = true;
            for (const danhMuc in this.nhomTheoDanhMuc) {
                for (const sp of this.nhomTheoDanhMuc[danhMuc]) {
                    if (!sp.chon) {
                        tatCaChon = false;
                        break;
                    }
                }
            }
            this.chonTatCa = tatCaChon;
        }
    },
    data() {
        return {
            chonTatCa: false,
            danhMucDaChon: {},
            dangCapNhat: false,
            colorMap: {
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
            }
        }

    },
    watch: {
        // Đồng bộ "Chọn tất cả"
        chonTatCa(val) {
            // Gán giá trị cho từng danh mục
            for (const danhMuc in this.nhomTheoDanhMuc) {
                this.danhMucDaChon[danhMuc] = val;

                this.nhomTheoDanhMuc[danhMuc].forEach(sp => {
                    sp.chon = val;
                });
            }
        }
    }
};

</script>

<style scoped>
.container {
    background-color: #F3F4F6;
    padding: 20px;
}

.cart-header {
    background-color: #fff;
    padding: 16px;
    border-radius: 6px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
}

/* Header bảng giỏ hàng */
.cart-header-row {
    display: grid;
    grid-template-columns: 50px 2fr 1fr 1fr 1fr 1fr 1fr;
    font-weight: 600;
    font-size: 14px;
    padding: 12px 10px;
    border-bottom: 2px solid #ddd;
    background-color: #fff;
    margin-bottom: 10px;
}

.cart-item {
    display: grid;
    grid-template-columns: 50px 2fr 1fr 1fr 1fr 1fr 1fr;
    align-items: center;
    padding: 12px 10px;
    border-bottom: 1px solid #eee;
    background: #fff;
}

.col-price .old-price {
    text-decoration: line-through;
    color: #aaa;
    margin-right: 6px;
    font-size: 12px;
}

.col-price .new-price {
    color: #818181;
}


.category-header {
    background: #ffffff;
    margin-top: 20px;
    padding: 8px 12px;
    font-weight: bold;
    font-size: 14px;
    border-bottom: 2px solid #e5e5e5;
}

/* Nút thùng rác ở header */
.trash-btn {
    background: white;
    border: 1px solid #ddd;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    cursor: pointer;
    font-size: 18px;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s ease;
}

.trash-btn:hover {
    background-color: #f0f0f0;
}

input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
}

.col-variant {
    margin-top: 15px;
}

/* Bảng giỏ hàng */
.cart-table {
    width: 100%;
    border-collapse: collapse;
    background: #fff;
    font-size: 14px;
}

.cart-table th,
.cart-table td {
    border-bottom: 1px solid #eee;
    padding: 12px 10px;
    text-align: center;
    vertical-align: middle;
}

.cart-table th {
    background-color: #fafafa;
    font-weight: 600;
    font-size: 14px;
}

/* Cột sản phẩm */
.product-cell {
    display: flex;
    align-items: center;
    text-align: left;
}

.product-cell img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-right: 10px;
}

.discount-save {
    color: #28a745;
    font-weight: 600;
    font-size: 13px;
}

.product-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.item-name {
    font-weight: 600;
    margin: 0;
}

.old-price {
    text-decoration: line-through;
    color: #aaa;
    font-size: 12px;
}

.new-price {
    font-weight: bold;
}

/* Ô số lượng */
.quantity-box {
    display: flex;
    align-items: center;
    justify-content: center;
}

.quantity-box button {
    padding: 4px 10px;
    border: 1px solid #ccc;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
}

.quantity-box input {
    width: 50px;
    height: 32px;
    text-align: center;
    border: 1px solid #ccc;
    margin: 0 5px;
    border-radius: 4px;
}

.col-total {
    font-weight: 700;
    color: #000000;
}

/* Nút xóa */
.remove-btn {
    background: none;
    border: none;
    color: #ff4d4f;
    cursor: pointer;
    font-size: 14px;
    transition: color 0.3s ease;
}

.remove-btn:hover {
    color: #d9363e;
}

/* Footer thanh toán */
.cart-footer-static {
    width: 100%;
    background: white;
    border-top: 1px solid #e0e0e0;
    padding: 12px 24px;
    margin-top: 32px;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.03);
    z-index: 1000;
}

.footer-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    max-width: 1200px;
    margin: 0 auto;
}

.footer-left {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
}

.footer-right {
    display: flex;
    align-items: center;
    gap: 12px;
}

.footer-delete {
    color: #ee4d2d;
    background: none;
    border: none;
    cursor: pointer;
}

.total-label {
    font-weight: 500;
}

.total-amount {
    color: #ee4d2d;
    font-weight: bold;
    font-size: 16px;
}

.footer-checkout {
    background-color: #6f42c1;
    border-color: #6f42c1;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
}


/* Giỏ hàng trống */
.empty-cart {
    text-align: center;
    padding: 40px 20px;
    color: #999;
    background: #fff;
    border-radius: 6px;
}

.empty-cart .empty-icon {
    font-size: 60px;
    color: #ccc;
    margin-bottom: 10px;
}

.empty-cart h4 {
    font-weight: bold;
    margin-bottom: 5px;
    color: #666;
}

.empty-cart p {
    margin-bottom: 20px;
    color: #999;
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
}
</style>