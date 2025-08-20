<template>
    <div class="cart-overlay" @click.self="$emit('close')">
        <div class="cart-panel" @click.stop>
            <div class="cart-header">
                <button class="close-btn" @click.stop="$emit('close')">×</button>
                <h3>Giỏ hàng ({{ tongSoLuong }})</h3>

                <!-- Nút xóa toàn bộ giỏ hàng chỉ hiện khi có sản phẩm -->
                <button v-if="danhSachGio.length > 0" class="trash-btn" @click="xoaGioHang()">
                    🗑️
                </button>
            </div>

            <div class="cart-items">
                <!-- Khi có sản phẩm -->
                <div v-if="danhSachGio.length > 0">
                    <div class="cart-item" v-for="sp in danhSachGio" :key="sp.idSanPhamChiTiet">
                        <img :src="sp.anhSanPham || '/placeholder.png'" alt="Sản phẩm" class="item-img" />
                        <div class="item-info">
                            <p class="item-name">{{ sp.tenSanPham }}</p>

                            <p v-if="sp.phanTramGiamGia && sp.phanTramGiamGia > 0" class="discount-info">
                                Tiết kiệm {{ sp.phanTramGiamGia }}%
                            </p>

                            <p class="item-price">
                                <template v-if="sp.phanTramGiamGia && sp.phanTramGiamGia > 0">
                                    <span class="old-price">{{
                                        (
                                            sp.gia /
                                            (1 - sp.phanTramGiamGia / 100)
                                        ).toLocaleString()
                                    }}
                                        đ</span>
                                    <span class="new-price">{{
                                        sp.gia.toLocaleString()
                                    }}
                                        đ</span>
                                </template>
                                <template v-else>
                                    <span class="new-price">{{
                                        sp.gia.toLocaleString()
                                    }}
                                        đ</span>
                                </template>
                            </p>

                            <p class="color-size-group" v-if="
                                (sp.mauSacList && sp.mauSacList.length) ||
                                (sp.kichCoList && sp.kichCoList.length)
                            ">
                                <span v-for="mau in sp.mauSacList" :key="mau" class="color-circle"
                                    :style="{ backgroundColor: mapColorToCssClass(mau) }" :title="mau"></span>

                                <span v-for="size in sp.kichCoList" :key="size" class="badge size-badge">
                                    {{ size }}
                                </span>
                            </p>

                            <p class="item-total">
                                Tổng: {{ (sp.gia * sp.soLuong).toLocaleString() }} đ
                            </p>
                        </div>

                        <input class="item-quantity" type="number" v-model="sp.soLuong" @change="capNhatSoLuong(sp)" />

                        <button class="remove-btn" @click="xoaSanPham(sp)">
                            🗑️
                        </button>
                    </div>
                </div>

                <!-- Khi giỏ hàng trống -->
                <div v-else class="empty-cart">
                    <div class="empty-icon">🛒</div>
                    <h4>Giỏ hàng của bạn đang trống.</h4>
                    <p>Vui lòng thêm một số sản phẩm vào giỏ hàng của bạn.</p>
                    <button class="btn btn-primary browse-products-btn" @click="goToProducts">
                        Duyệt qua các sản phẩm của chúng tôi
                    </button>

                </div>
            </div>

            <!-- Thanh toán chỉ hiển thị khi có sản phẩm -->
            <div v-if="danhSachGio.length > 0" class="cart-footer">
                <button class="checkout-btn" @click.self="thanhToan">
                    Thanh toán
                    <span class="total-price">{{ tongTien.toLocaleString() }} đ</span>
                </button>
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
        }
    },
    methods: {
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

                this.$emit('capNhatGio');
                window.dispatchEvent(new Event("cap-nhat-gio"));

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
                const res = await axios.post(
                    "http://localhost:8080/client/clientTaoHoaDonChiTiet",
                    this.danhSachGio,
                    { withCredentials: true }
                );

                const hoaDonId = res.data.hoaDonId;
                this.$emit('close');
                this.$router.push({
                    name: "client-Oder",
                    params: { hoaDonId }
                }).then(() => {
                    window.location.reload();
                });

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
        }
    },
    data() {
        return {
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

    }
};

</script>

<style scoped>
.cart-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: flex-end;
    z-index: 9999;
}

.cart-panel {
    background: white;
    width: 530px;
    height: 100%;
    box-shadow: -3px 0 10px rgba(0, 0, 0, 0.2);
    padding: 20px;
    padding-bottom: 90px;
    /* dành chỗ cho footer */
    overflow-y: auto;
    position: relative;
    display: flex;
    flex-direction: column;
}

.color-badge {
    display: inline-block;
    padding: 4px 10px;
    border-radius: 12px;
    font-weight: 600;
    margin-right: 6px;
    user-select: none;
    cursor: default;
    font-size: 14px;
    min-width: 50px;
    text-align: center;
}

.color-circle {
    display: inline-block;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    margin-right: 6px;
    border: 1px solid #ccc;
    vertical-align: middle;
}

.cart-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 1.2rem;
    margin-bottom: 10px;
}

.badge {
    display: inline-block;
    padding: 2px 6px;
    margin-right: 4px;
    border-radius: 4px;
    font-size: 0.8rem;
    color: white;
}

.color-badge {
    background-color: #007bff;
    /* màu xanh dương */
}

.size-badge {
    background-color: #6c757d;
    /* màu xám */
}

/* nút đóng tròn */
.close-btn {
    width: 35px;
    height: 35px;
    border-radius: 50%;
    border: 1px solid #ddd;
    background-color: white;
    font-size: 20px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: background-color 0.3s ease;
}

.close-btn:hover {
    background-color: #f0f0f0;
}

/* nút thùng rác ở header */
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

.cart-items {
    flex-grow: 1;
    overflow-y: auto;
}

/* mỗi item giỏ hàng */
.cart-item {
    border-bottom: 1px solid #eee;
    padding: 12px 0;
    display: flex;
    align-items: center;
    gap: 12px;
}

.discount-info {
    font-size: 0.85rem;
    color: #28a745;
    /* xanh lá đẹp */
    font-weight: 600;
    margin-bottom: 5px;
}

.item-total {
    font-size: 0.9rem;
    color: #444;
    font-weight: 600;
    margin-top: 8px;
}

.item-img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.item-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    /* khoảng cách giữa các dòng info */
}

.item-info p {
    margin: 0;
    /* bỏ margin mặc định */
    line-height: 1.3;
    /* giúp các dòng dễ đọc */
}

.item-name {
    font-weight: 600;
    margin-bottom: 5px;
}

.item-price {
    font-size: 0.9rem;
    color: #666;
}

.old-price {
    text-decoration: line-through;
    margin-right: 8px;
    color: #aaa;
}

.new-price {
    font-weight: bold;
    color: #000;
}

.item-quantity {
    width: 60px;
    height: 32px;
    padding: 4px 8px;
    font-size: 14px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    outline: none;
    margin-left: 10px;

}

.item-quantity:focus {
    border-color: #1e90ff;
    box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.2);
    background-color: #f9fbff;
}

.item-quantity:hover {
    border-color: #888;
    background-color: #f7f7f7;
}

/* Nút xóa từng sản phẩm */
.remove-btn {
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
    font-size: 18px;
    padding: 5px;
    transition: color 0.3s ease;
    margin-left: 8px;
}

.remove-btn:hover {
    color: #000;
}

.cart-footer {
    position: fixed;
    bottom: 20px;
    right: 0;
    width: 34%;
    display: flex;
    justify-content: center;
    z-index: 10000;
    pointer-events: none;
    /* Cho footer ko chặn scroll */
}

/* Nút thanh toán như ảnh số 2 */
.checkout-btn {
    background-color: #1a1f2b;
    color: #fff;
    font-weight: 600;
    font-size: 1rem;
    border: none;
    border-radius: 10px;
    padding: 14px 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    min-width: 80%;
    max-width: 90%;
    pointer-events: auto;
    /* Cho phép click */
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: background-color 0.3s ease;
}

.checkout-btn:hover {
    background-color: #2c3542;
}

.total-price {
    font-weight: 600;
    font-size: 1rem;
    color: #fff;
}

.empty-cart {
    text-align: center;
    padding: 40px 20px;
    color: #999;
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
    /* màu tím giống hình */
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
