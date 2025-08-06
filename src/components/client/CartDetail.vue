<template>
    <div class="cart-overlay" @click.self="$emit('close')">
        <div class="cart-panel" @click.stop>
            <div class="cart-header">
                <button class="close-btn" @click.stop="$emit('close')">×</button>
                <h3>Giỏ hàng ({{ tongSoLuong }})</h3>
                <button class="trash-btn" @click="xoaToanBoGioHang()">
                    🗑️
                </button>
            </div>

            <div class="cart-items">
                <div class="cart-item" v-for="sp in danhSachGio" :key="sp.idSanPhamChiTiet">
                    <img :src="sp.anhSanPham || '/placeholder.png'" alt="Sản phẩm" class="item-img" />
                    <div class="item-info">
                        <div class="item-info">
                            <p class="item-name">{{ sp.tenSanPham }}</p>

                            <!-- Hiển thị Tiết kiệm nếu có giảm giá -->
                            <p v-if="sp.phanTramGiamGia && sp.phanTramGiamGia > 0" class="discount-info">
                                Tiết kiệm {{ sp.phanTramGiamGia }}%
                            </p>

                            <!-- Giá cũ gạch ngang nếu có -->
                            <p class="item-price">
                                <!-- Nếu có giảm giá, hiển thị cả giá cũ và mới -->
                                <template v-if="sp.phanTramGiamGia && sp.phanTramGiamGia > 0">
                                    <span class="old-price">{{ ((sp.gia / (1 - sp.phanTramGiamGia /
                                        100))).toLocaleString() }} đ</span>
                                    <span class="new-price">{{ sp.gia.toLocaleString() }} đ</span>
                                </template>

                                <!-- Nếu KHÔNG giảm giá, chỉ hiển thị giá hiện tại -->
                                <template v-else>
                                    <span class="new-price">{{ sp.gia.toLocaleString() }} đ</span>
                                </template>
                            </p>
                            <!-- Hiển thị Màu sắc -->
                            <p v-if="sp.mauSacList && sp.mauSacList.length">
                                <span v-for="mau in sp.mauSacList" :key="mau" class="color-circle"
                                    :style="{ backgroundColor: mapColorToCssClass(mau) }" :title="mau"></span>
                            </p>



                            <!-- Hiển thị Kích cỡ -->
                            <p v-if="sp.kichCoList && sp.kichCoList.length">
                                <span v-for="size in sp.kichCoList" :key="size" class="badge size-badge">{{ size
                                }}</span>
                            </p>

                            <!-- Tổng tiền của món này -->
                            <p class="item-total">Tổng: {{ (sp.gia * sp.soLuong).toLocaleString() }} đ</p>
                        </div>

                    </div>

                    <!-- Nút tăng giảm số lượng nằm ngang, cùng hàng với ảnh và info -->
                    <div class="item-quantity">
                        <button @click="sp.soLuong = Math.max(1, sp.soLuong - 1)">−</button>
                        <span>{{ sp.soLuong }}</span>
                        <button @click="sp.soLuong++">+</button>
                    </div>

                    <!-- Nút xóa sản phẩm -->
                    <button class="remove-btn" @click="xoaSanPhamVaTraTonKho(sp.idSanPhamChiTiet)">🗑️</button>
                </div>
            </div>

            <!-- Thanh toán cố định dưới cùng -->
            <div class="cart-footer">
                <button class="checkout-btn" @click.self="thanhToan, $emit('close')">
                    Thanh toán <span class="total-price">{{ tongTien.toLocaleString() }} đ</span>
                </button>
            </div>

        </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    props: {
        danhSachGio: {
            type: Array,
            required: true
        }
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
        async traVeTonKho(sp) {
            try {
                const res = await axios.get("http://localhost:8080/client/san-pham/chi-tiet-id", {
                    params: {
                        idSanPham: sp.idSanPham,
                        mauSac: sp.mauSacList?.[0],
                        kichCo: sp.kichCoList?.[0]
                    }
                });
                const idChiTiet = res.data;

                if (!idChiTiet) {
                    console.warn("Không tìm thấy idChiTietSanPham để trả lại tồn kho");
                    return;
                }

                await axios.post("http://localhost:8080/client/cap-nhat-so-luong", {
                    idChiTietSanPham: idChiTiet,
                    soLuong: -sp.soLuong  // dùng số âm để cộng ngược trở lại
                });
            } catch (err) {
                console.error("Lỗi khi trả lại tồn kho:", err);
            }
        },

        async xoaSanPhamVaTraTonKho(idSanPhamChiTiet) {
            const sp = this.danhSachGio.find(item => item.idSanPhamChiTiet === idSanPhamChiTiet);
            if (sp) {
                await this.traVeTonKho(sp);
            }

            this.$emit('removeItem', idSanPhamChiTiet);
            window.dispatchEvent(new Event("cap-nhat-gio"));
        },

        async xoaToanBoGioHang() {
            try {
                // Gọi API trả lại tồn kho từng sản phẩm
                for (const sp of this.danhSachGio) {
                    await this.traVeTonKho(sp);
                }

                // Xóa giỏ hàng sau khi đã hoàn tất cộng lại số lượng tồn kho
                await axios.delete("http://localhost:8080/client/XoaGioHang", {
                    withCredentials: true
                });


                window.dispatchEvent(new Event('cap-nhat-gio'));

                this.$emit('update:danhSachGio', []);
                this.$emit('capNhatGio');

                alert("Đã xóa toàn bộ giỏ hàng thành công!");
            } catch (err) {
                console.error("Lỗi khi xóa giỏ hàng:", err);
                alert("Xóa giỏ hàng thất bại, vui lòng thử lại.");
            }
        },
        async thanhToan() {
            try {
                const res = await axios.post("http://localhost:8080/client/clientTaoHoaDonChiTiet", null, {
                    withCredentials: true
                });

                const hoaDonId = res.data.hoaDonId;

                this.$emit('clearCart');
                this.$router.push({ name: 'client-Oder', params: { hoaDonId } });
                console.log("Thanh toán thành công, chuyển đến trang đơn hàng:", hoaDonId);
            } catch (err) {
                console.error(err);
                alert("Thanh toán thất bại.");
            }
        },
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
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid #eee;
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
    margin-top: 4px;
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

/* Số lượng nằm ngang, cùng hàng với sản phẩm */
.item-quantity {
    display: flex;
    align-items: center;
    gap: 5px;
    border: 1px solid #ddd;
    border-radius: 5px;
    padding: 3px 8px;
    user-select: none;
}

.item-quantity button {
    border: none;
    background: none;
    font-size: 18px;
    cursor: pointer;
    width: 25px;
    height: 25px;
    line-height: 25px;
    text-align: center;
    color: #333;
    font-weight: bold;
    transition: background-color 0.3s ease;
}

.item-quantity button:hover:not(:disabled) {
    background-color: #eee;
    border-radius: 3px;
}

.item-quantity button:disabled {
    color: #ccc;
    cursor: not-allowed;
}

.item-quantity span {
    min-width: 20px;
    text-align: center;
    font-weight: 600;
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
</style>
