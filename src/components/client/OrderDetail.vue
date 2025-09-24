<template>
    <div class="order-detail-wrapper responsive-container">
        <div class="header-section">
            <button @click="$router.go(-1)" class="btn-back">
                <i class="fas fa-arrow-left"></i> Đơn mua / Chi tiết đơn mua {{ order.maHoaDon }}
            </button>
        </div>


        <div class="order-status-bar">
            <div class="status-step" :class="{ 'active': order.trangThai === 0 }">
                <span class="step-text">Chờ xác nhận</span>
            </div>
            <div class="status-step" :class="{ 'active': order.trangThai >= 1 }">
                <span class="step-text">Chờ giao hàng</span>
            </div>
            <div class="status-step" :class="{ 'active': order.trangThai >= 2 }">
                <span class="step-text">Đang vận chuyển</span>
            </div>
            <div class="status-step" :class="{ 'active': order.trangThai >= 3 }">
                <span class="step-text">Đã giao hàng</span>
            </div>
            <div class="status-step" :class="{ 'active': order.trangThai >= 4 }">
                <span class="step-text">Hoàn thành</span>
            </div>
            <div class="status-step" :class="{ 'active': order.trangThai === 5 }">
                <span class="step-text">Đã hủy</span>
            </div>
        </div>


        <div class="main-content-grid">
            <div class="left-panel">
                <div class="info-block invoice-info">
                    <h3>Thông tin hóa đơn</h3>
                    <div class="info-group">
                        <p><strong>Mã hóa đơn:</strong> {{ order.maHoaDon }}</p>
                        <p><strong>Ngày đặt:</strong> {{ formatDate(order.ngayDat) }}</p>
                        <p><strong>Trạng thái:</strong> <span :class="getStatusClass(order.trangThai)">{{
                            getStatusText(order.trangThai) }}</span></p>
                        <p><strong>Loại hóa đơn:</strong> {{ order.loaiHoaDon || 'Online' }}</p>
                        <p><strong>Ghi chú:</strong> {{ order.ghiChu || 'Không có' }}</p>
                    </div>
                </div>


                <div class="info-block customer-info-block">
                    <h3>Thông tin khách hàng</h3>
                    <p>{{ order.maKhachHang || 'N/A' }} - {{ order.tenKhachHang || 'N/A' }} - {{ order.soDienThoai ||
                        'N/A' }}</p>
                </div>


                <div class="info-block product-list-detail">
                    <h3>Sản phẩm</h3>
                    <ul v-if="tempOrder && tempOrder.danhSachSanPham && tempOrder.danhSachSanPham.length > 0"
                        class="order-items-list-detail">
                        <li v-for="item in tempOrder.danhSachSanPham" :key="item.idHoaDonChiTiet">
                            <div class="item-info-detail">
                                <img :src="item.duongDanAnh" alt="Product Image" class="product-thumbnail">
                                <div class="product-details">
                                    <span class="product-name">{{ item.tenSanPham }}</span>
                                    <span class="product-variant">({{ item.tenKichCo }} / {{ item.tenMau }})</span>
                                    <span>Số lượng: {{ item.soLuong }}</span>
                                    <span>Giá: {{ formatCurrency(item.giaBanTaiThoiDiem) }}</span>
                                    <span>Thành tiền: {{ formatCurrency(item.thanhTien) }}</span>
                                </div>
                            </div>
                            <div class="item-actions-detail">
                                <button @click="confirmUpdateOrderItem(item.idHoaDonChiTiet, item.soLuong)"
                                    class="btn-edit" v-if="order.trangThai === 0">
                                    Cập nhật số lượng
                                </button>
                                <button @click="confirmDeleteOrderItem(item.idHoaDonChiTiet)" class="btn-delete"
                                    v-if="order.trangThai === 0 && tempOrder.danhSachSanPham.length > 1">
                                    Xóa
                                </button>
                            </div>
                        </li>
                    </ul>
                    <p v-else class="no-items-message">Không có sản phẩm nào trong đơn hàng này.</p>
                </div>
            </div>


            <div class="right-panel">
                <div class="info-block shipping-info">
                    <h3>Thông tin nhận hàng</h3>
                    <div v-if="order.trangThai === 0">
                        <p>
                            <strong>Tên người nhận:</strong>
                            <input type="text" v-model="editableShippingInfo.tenNguoiNhan" class="editable-input" />
                        </p>
                        <p>
                            <strong>SĐT người nhận:</strong>
                            <input type="tel" v-model="editableShippingInfo.sdtNguoiNhan" class="editable-input" />
                        </p>
                    </div>
                    <div v-else>
                        <p><strong>Tên người nhận:</strong> {{ order.tenNguoiNhan }}</p>
                        <p><strong>SĐT người nhận:</strong> {{ order.sdtNguoiNhan }}</p>
                    </div>
                    <p class="address-line">
                        <strong>Địa chỉ nhận hàng:</strong> {{ tempOrder ? tempOrder.diaChiNguoiNhan :
                            order.diaChiNguoiNhan }}
                        <i v-if="order.trangThai === 0" @click="openAddressModal"
                            class="fas fa-map-marker-alt address-action-icon"></i>
                    </p>
                    <button v-if="order.trangThai === 0 && hasChanges" @click="saveDirectChanges"
                        class="btn-save-direct-changes">Lưu tên/SĐT</button>
                </div>


                <div v-if="showUpdateDetails && updateSummary" id="update-summary-div"
                    class="info-block update-summary-block">
                    <h2 class="section-title">Tóm Tắt Thay Đổi Đơn Hàng</h2>
                    <div class="summary-line">
                        <p class="label">Tổng tiền cũ (Không VC):</p>
                        <p class="value old-total">{{ formatCurrency(updateSummary.oldTotal) }}</p>
                    </div>


                    <div class="change-details">
                        <h4 class="change-title">Chi tiết các thay đổi:</h4>
                        <ul class="change-list">
                            <li v-for="(change, index) in updateSummary.changes" :key="index">
                                <span v-if="change.type === 'address'" class="change-text">
                                    Địa chỉ nhận hàng: <span class="change-highlight">Đã thay đổi.</span>
                                </span>
                                <span v-else-if="change.type === 'quantity'" class="change-text">
                                    Thay đổi SL "{{ change.name }}": {{ change.oldQty }} ->
                                    <span class="change-highlight"
                                        :class="{ 'text-green-600': change.price < 0, 'text-red-600': change.price > 0 }">
                                        {{ change.newQty }} ({{ change.price > 0 ? '+' : '' }}{{
                                            formatCurrency(change.price) }})
                                    </span>
                                </span>
                                <span v-else-if="change.type === 'delete'" class="change-text">
                                    Xóa "{{ change.name }}" <span class="change-highlight text-red-600">(-{{
                                        formatCurrency(change.price) }})</span>
                                </span>
                            </li>
                        </ul>
                    </div>

                    <div v-if="Object.keys(shippingServices).length > 0" class="shipping-options">
                        <h4 class="change-title">Phí vận chuyển:</h4>
                        <p class="old-shipping-fee">Phí cũ: {{ formatCurrency(updateSummary.oldShippingFee) }}</p>
                        <div class="radio-group">
                            <label v-for="(service, key) in shippingServices" :key="key" class="radio-label">
                                <input type="radio" :value="service.fee" v-model="selectedShippingFee"
                                    @change="calculateUpdateSummary" class="radio-input">
                                <span class="radio-text">{{ service.name }} ({{ formatCurrency(service.fee) }})</span>
                                <span v-if="service.isFastest" class="fastest-badge">Nhanh nhất</span>
                            </label>
                        </div>
                        <p v-if="updateSummary.addressChanged" class="shipping-warning">Vui lòng chọn lại đơn vị vận
                            chuyển để tính toán phí mới.</p>
                    </div>

                    <div class="total-summary">
                        <p class="label final-total-label">Tổng tiền mới (Đã bao gồm VC):</p>
                        <p class="value final-total"
                            :class="{ 'text-blue-600': updateSummary.finalChange === 0, 'text-red-600': updateSummary.finalChange > 0, 'text-green-600': updateSummary.finalChange < 0 }">
                            {{ formatCurrency(updateSummary.newTotalWithShipping) }}
                        </p>
                        <p class="change-amount">
                            Tổng chênh lệch:
                            <span
                                :class="{ 'text-red-600': updateSummary.finalChange > 0, 'text-green-600': updateSummary.finalChange < 0 }">
                                ({{ updateSummary.finalChange > 0 ? '+' : '' }}{{
                                    formatCurrency(updateSummary.finalChange) }})
                            </span>
                        </p>
                    </div>


                    <div class="action-buttons">
                        <button @click="confirmFinalChanges" class="btn btn-primary btn-confirm">Xác nhận Lưu Thay
                            Đổi</button>
                    </div>
                </div>


                <div class="info-block payment-history-block">
                    <h3>Lịch sử thanh toán</h3>
                    <p class="no-history-message">Hiện tại không có thông tin lịch sử thanh toán.</p>
                    <div v-if="updateSummary && updateSummary.finalChange > 0">
                        <p class="payment-required-text">Bạn cần thanh toán thêm: {{
                            formatCurrency(updateSummary.finalChange) }}</p>
                        <div class="payment-buttons">
                            <button @click="handlePayment('cod')" class="btn btn-cod">Trả COD khi nhận hàng</button>
                            <button @click="handlePayment('vnpay')" class="btn btn-vnpay">Thanh toán VNPay ngay</button>
                        </div>
                    </div>
                    <div v-else-if="updateSummary && updateSummary.finalChange < 0">
                        <p class="refund-text">Bạn sẽ được hoàn lại: {{
                            formatCurrency(Math.abs(updateSummary.finalChange)) }} (Admin sẽ xác nhận hoàn tiền)</p>
                    </div>
                </div>
            </div>
        </div>
    </div>


    <div v-if="showAddressModal" class="modal-overlay" @click.self="closeAddressModal">
        <div class="modal-content-single">
            <button class="close-button" @click="closeAddressModal">&times;</button>
            <h2>Thay đổi địa chỉ nhận hàng</h2>
            <div class="address-management-single">
                <div class="saved-addresses-list">
                    <button @click="openAddAddressModal" class="btn btn-add-address">
                        <i class="fas fa-plus"></i> Thêm nhanh địa chỉ
                    </button>
                    <div v-if="savedAddresses.length > 0" class="address-list">
                        <div v-for="address in savedAddresses" :key="address.id" class="address-item">
                            <div class="address-info">
                                <p><strong>{{ address.hoTen }}</strong> - {{ address.sdt }}</p>
                                <p>{{ address.diaChiChiTiet }}, {{ address.xaPhuong }}, {{ address.quanHuyen }}, {{
                                    address.tinhThanhPho }}</p>
                                <span v-if="address.isMacDinh" class="default-badge">Mặc định</span>
                            </div>
                            <div class="address-actions">
                                <button @click="selectAddress(address)" class="btn-select">Chọn</button>
                                <button @click="openEditAddressModal(address)" class="btn-edit-small">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button @click="deleteAddress(address.id)" class="btn-delete-small">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <p v-else class="no-addresses-message">Bạn chưa có địa chỉ đã lưu nào. Vui lòng thêm địa chỉ mới.
                    </p>
                </div>
            </div>
        </div>
    </div>


    <AddressModal :show="showAddEditModal" :initialAddress="currentAddress" :customerId="getUserId()"
        @close="closeAddEditModal" @address-saved="refreshAddressList" />
</template>


<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import Cookies from 'js-cookie'
import AddressModal from '@/components/client/ClientAddressModel.vue';
import Swal from 'sweetalert2';


// --- Khởi tạo và Biến Ref ---
const route = useRoute();
const router = useRouter();
const toast = useToast();
const order = ref({});
const editableShippingInfo = ref({
    tenNguoiNhan: '',
    sdtNguoiNhan: ''
});


const showAddressModal = ref(false);
const showAddEditModal = ref(false);
const savedAddresses = ref([]);
const currentAddress = ref(null);


// Trạng thái quản lý thay đổi (TRỌNG TÂM CỦA CƠ CHẾ MỚI)
const tempOrder = ref(null); // Bản sao tạm thời của order sau các thay đổi về sản phẩm/địa chỉ
const changesQueue = ref([]); // Danh sách các thay đổi chi tiết (quantity, delete)
const showUpdateDetails = ref(false);
const updateSummary = ref(null);
const shippingServices = ref({});
const selectedShippingFee = ref(0);
const isLoading = ref(false);


const apiClient = axios.create({
    baseURL: 'http://localhost:8080/client',
    headers: { 'Content-Type': 'application/json' }
});

const shopId = 5939518; // Hoặc ID shop thực tế của bạn
const fromDistrictId = 1644;


const getUserId = () => {
    let userId = null;
    const userIdFromStorage = localStorage.getItem('userId');
    if (userIdFromStorage) {
        userId = parseInt(userIdFromStorage);
    } else {
        try {
            const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
            userId = loggedInUser ? loggedInUser.id : null;
        } catch (e) {
            console.error('Lỗi khi parse loggedInUser từ localStorage:', e);
        }
    }
    console.log('User ID đã lấy từ localStorage (OrderDetail):', userId);
    return userId;
};


const hasChanges = computed(() => {
    return order.value.tenNguoiNhan !== editableShippingInfo.value.tenNguoiNhan ||
        order.value.sdtNguoiNhan !== editableShippingInfo.value.sdtNguoiNhan;
});


watch(order, (newOrder) => {
    if (newOrder && newOrder.tenNguoiNhan && newOrder.sdtNguoiNhan) {
        editableShippingInfo.value.tenNguoiNhan = newOrder.tenNguoiNhan;
        editableShippingInfo.value.sdtNguoiNhan = newOrder.sdtNguoiNhan;


        // Khởi tạo tempOrder khi order được tải lần đầu
        if (!tempOrder.value) {
            tempOrder.value = JSON.parse(JSON.stringify(newOrder));
        }
    }
}, { immediate: true });


const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('vi-VN', options);
    } catch (e) {
        return dateString;
    }
};


const formatCurrency = (value) => {
    if (value === null || value === undefined) return '0 VND';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};


const getStatusText = (status) => {
    switch (status) {
        case 0: return 'Chờ xác nhận';
        case 1: return 'Chờ giao hàng';
        case 2: return 'Đang vận chuyển';
        case 3: return 'Đã giao hàng';
        case 4: return 'Hoàn thành';
        case 5: return 'Đã hủy';
        default: return 'Không xác định';
    }
};


const getStatusClass = (status) => {
    switch (status) {
        case 0: return 'status-pending';
        case 1: return 'status-confirmed';
        case 2: return 'status-shipping';
        case 3: return 'status-delivered';
        case 4: return 'status-completed';
        case 5: return 'status-cancelled';
        default: return '';
    }
};


// --- Fetch Initial Data ---
const fetchOrderDetail = async () => {
    const id = route.params.id;
    const userId = getUserId();
    if (userId === null) {
        toast.warning("Bạn chưa đăng nhập. Vui lòng đăng nhập để xem chi tiết đơn hàng.");
        router.push('/coolmen/dang-nhap-khach-hang');
        return;
    }
    try {
        const res = await apiClient.get(`/orders/${id}`, { headers: { 'X-User-ID': userId } });
        if (res.data && res.data.data) {
            order.value = res.data.data;
            // THÊM DÒNG NÀY ĐỂ KIỂM TRA
            console.log("Dữ liệu đơn hàng ĐÃ GÁN vào order.value:", JSON.stringify(order.value, null, 2));
            // Cập nhật tempOrder sau khi fetch thành công
            tempOrder.value = JSON.parse(JSON.stringify(res.data.data));
            // Đặt lại trạng thái thay đổi
            changesQueue.value = [];
            showUpdateDetails.value = false;
            updateSummary.value = null;
        } else {
            toast.error(res.data.message || 'Không tìm thấy chi tiết đơn hàng.');
            router.go(-1);
        }
    } catch (error) {
        console.error('Lỗi khi tải chi tiết đơn hàng:', error);
        toast.error(error.response?.data?.message || 'Không thể tải chi tiết đơn hàng. Vui lòng thử lại sau.');
        router.go(-1);
    }
};


onMounted(() => {
    fetchOrderDetail();
});


// --- Address Modal Logic (giữ nguyên, trừ phần selectAddress) ---
const openAddressModal = async () => {
    if (order.value.trangThai !== 0) {
        toast.warning("Chỉ có thể thay đổi địa chỉ khi đơn hàng đang 'Chờ xác nhận'.");
        return;
    }
    await fetchSavedAddresses();
    showAddressModal.value = true;
};


const closeAddressModal = () => {
    showAddressModal.value = false;
};


const fetchSavedAddresses = async () => {
    const userId = getUserId();
    if (!userId) {
        toast.warning("Bạn chưa đăng nhập.");
        return;
    }

    try {
        const token = Cookies.get('token');
        const response = await apiClient.get('/addresses', {
            headers: {
                'X-User-ID': userId,
                // 'Authorization': `Bearer ${token}`
            }
        });
        if (response.data && response.data.data) {
            savedAddresses.value = response.data.data;
        } else {
            savedAddresses.value = [];
        }
    } catch (error) {
        console.error('Lỗi khi tải địa chỉ:', error);
        toast.error(error.response?.data?.message || 'Không thể tải danh sách địa chỉ. Vui lòng thử lại sau.');
    }
};


const openAddAddressModal = () => {
    currentAddress.value = null;
    showAddEditModal.value = true;
};


const openEditAddressModal = (address) => {
    currentAddress.value = address;
    showAddEditModal.value = true;
};


const closeAddEditModal = () => {
    showAddEditModal.value = false;
    currentAddress.value = null;
};


const refreshAddressList = async () => {
    await fetchSavedAddresses();
};


const deleteAddress = async (addressId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) {
        return;
    }
    const userId = getUserId();
    if (!userId) {
        toast.warning("Bạn chưa đăng nhập.");
        return;
    }


    try {
        const token = Cookies.get('token');
        await apiClient.delete(`/addresses/${addressId}`, {
            headers: {
                'X-User-ID': userId,
                'Authorization': `Bearer ${token}`
            }
        });
        toast.success("Đã xóa địa chỉ thành công.");
        await fetchSavedAddresses();
    } catch (error) {
        toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xóa địa chỉ.');
    }
};


const saveDirectChanges = async () => {
    // Chỉ lưu thay đổi Tên và SĐT
    const userId = getUserId();
    if (!userId) {
        toast.warning("Bạn chưa đăng nhập.");
        return;
    }


    // Sử dụng thông tin từ editableShippingInfo
    const updateDto = {
        tenNguoiNhan: editableShippingInfo.value.tenNguoiNhan,
        sdtNguoiNhan: editableShippingInfo.value.sdtNguoiNhan,
        diaChiNguoiNhan: order.value.diaChiNguoiNhan // Địa chỉ giữ nguyên của order
    };


    try {
        const token = Cookies.get('token');
        await apiClient.put(`/orders/${order.value.id}/thong-tin-nguoi-nhan`, updateDto, {
            headers: {
                'X-User-ID': userId,
                'Authorization': `Bearer ${token}`
            }
        });
        toast.success("Cập nhật thông tin người nhận thành công!");
        await fetchOrderDetail(); // Tải lại để cập nhật order.value
    } catch (error) {
        console.error('Lỗi khi cập nhật thông tin:', error);
        toast.error(error.response?.data?.message || 'Không thể cập nhật thông tin. Vui lòng thử lại.');
    }
};


// --- CƠ CHẾ TÍNH TOÁN VÀ XÁC NHẬN TỔNG HỢP ---
const selectAddress = async (address) => {
    if (order.value.trangThai !== 0) {
        toast.warning("Chỉ có thể thay đổi địa chỉ khi đơn hàng đang 'Chờ xác nhận'.");
        return;
    }


    // 1. Chuẩn hóa chuỗi địa chỉ mới
    const addressParts = [
        address.diaChiChiTiet,
        address.xaPhuong,
        address.quanHuyen,
        address.tinhThanhPho
    ].filter(part => part && typeof part === 'string' && part.trim() !== '');


    const newDiaChiNguoiNhan = addressParts.join(', ');


    // 2. Cập nhật vào tempOrder
    tempOrder.value.diaChiNguoiNhan = newDiaChiNguoiNhan;
    // Cần lưu cả địa chỉ chi tiết cho mock API
    tempOrder.value.selectedAddressDetail = address;


    // 3. Đánh dấu thay đổi địa chỉ trong changesQueue (để kích hoạt tính phí)
    const addressChangeIndex = changesQueue.value.findIndex(c => c.type === 'address');
    if (addressChangeIndex === -1) {
        changesQueue.value.push({
            type: 'address',
            description: 'Đã thay đổi địa chỉ nhận hàng.',
            address: address // Lưu address object để tính phí
        });
    } else {
        changesQueue.value[addressChangeIndex].address = address;
    }


    toast.info("Địa chỉ đã được chọn. Vui lòng xác nhận thay đổi cuối cùng.");
    closeAddressModal();
    calculateUpdateSummary();
};


const confirmUpdateOrderItem = async (hoaDonChiTietId, currentQuantity) => {
    if (order.value.trangThai !== 0) {
        toast.warning("Chỉ có thể cập nhật/xóa sản phẩm khi đơn hàng ở trạng thái 'Chờ xác nhận'.");
        return;
    }

    // Tìm sản phẩm tương ứng trong danh sách để lấy thông tin tồn kho
    const item = tempOrder.value.danhSachSanPham.find(i => i.idHoaDonChiTiet === hoaDonChiTietId);
    if (!item) {
        toast.error("Không tìm thấy sản phẩm này trong đơn hàng.");
        return;
    }

    const soLuongTonKho = item.soLuongTonKho;

    const { value: newQuantityInput } = await Swal.fire({
        title: 'Cập nhật số lượng',
        input: 'text',
        inputValue: currentQuantity,
        inputLabel: `Nhập số lượng mới cho sản phẩm (Tồn kho: ${soLuongTonKho}, Hiện tại: ${currentQuantity})`,
        inputPlaceholder: 'Số lượng mới...',
        showCancelButton: true,
        confirmButtonText: 'Cập nhật',
        cancelButtonText: 'Hủy bỏ',
        inputValidator: (value) => {
            const num = parseInt(value);
            if (isNaN(num) || num <= 0) {
                return 'Vui lòng nhập số lượng hợp lệ (> 0)';
            }
            if (num > soLuongTonKho) {
                return `Số lượng nhập (${num}) vượt quá số lượng tồn kho (${soLuongTonKho}).`;
            }
        }
    });


    if (newQuantityInput) {
        const newQuantity = parseInt(newQuantityInput);
        const item = tempOrder.value.danhSachSanPham.find(i => i.idHoaDonChiTiet === hoaDonChiTietId);


        if (item) {
            const pricePerUnit = item.giaBanTaiThoiDiem;
            const oldAmount = item.soLuong * pricePerUnit;
            const newAmount = newQuantity * pricePerUnit;
            const priceChange = newAmount - oldAmount;


            // Cập nhật tempOrder
            item.soLuong = newQuantity;
            item.thanhTien = newAmount;


            // Cập nhật changesQueue
            const changeIndex = changesQueue.value.findIndex(c => c.type === 'quantity' && c.idHoaDonChiTiet === hoaDonChiTietId);


            if (changeIndex !== -1) {
                changesQueue.value[changeIndex] = {
                    type: 'quantity',
                    idHoaDonChiTiet: hoaDonChiTietId,
                    name: item.tenSanPham,
                    oldQty: currentQuantity,
                    newQty: newQuantity,
                    price: priceChange
                };
            } else {
                changesQueue.value.push({
                    type: 'quantity',
                    idHoaDonChiTiet: hoaDonChiTietId,
                    name: item.tenSanPham,
                    oldQty: currentQuantity,
                    newQty: newQuantity,
                    price: priceChange
                });
            }


            toast.info(`Đã ghi nhận thay đổi số lượng. Vui lòng xác nhận cuối cùng.`);
            calculateUpdateSummary();
        }
    }
};


const confirmDeleteOrderItem = async (hoaDonChiTietId) => {
    if (order.value.trangThai !== 0) {
        toast.warning("Chỉ có thể cập nhật/xóa sản phẩm khi đơn hàng ở trạng thái 'Chờ xác nhận'.");
        return;
    }
    if (tempOrder.value.danhSachSanPham.length === 1) {
        toast.error("Không thể xóa sản phẩm cuối cùng. Vui lòng hủy đơn hàng nếu không muốn mua.");
        return;
    }


    const result = await Swal.fire({
        title: 'Xác nhận xóa?',
        text: "Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng không?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Có, xóa ngay!',
        cancelButtonText: 'Hủy bỏ',
    });


    if (result.isConfirmed) {
        const itemIndex = tempOrder.value.danhSachSanPham.findIndex(i => i.idHoaDonChiTiet === hoaDonChiTietId);
        if (itemIndex !== -1) {
            const item = tempOrder.value.danhSachSanPham[itemIndex];
            const priceChange = item.thanhTien;


            // Xóa khỏi tempOrder
            tempOrder.value.danhSachSanPham.splice(itemIndex, 1);


            // Cập nhật changesQueue
            const changeIndex = changesQueue.value.findIndex(c => c.idHoaDonChiTiet === hoaDonChiTietId);


            if (changeIndex === -1) {
                changesQueue.value.push({
                    type: 'delete',
                    idHoaDonChiTiet: hoaDonChiTietId,
                    name: item.tenSanPham,
                    price: priceChange
                });
            } else {
                // Nếu đã có thay đổi SL trước đó, thay thế bằng thay đổi xóa
                changesQueue.value[changeIndex] = {
                    type: 'delete',
                    idHoaDonChiTiet: hoaDonChiTietId,
                    name: item.tenSanPham,
                    price: priceChange
                };
            }


            toast.info(`Đã ghi nhận xóa sản phẩm. Vui lòng xác nhận cuối cùng.`);
            calculateUpdateSummary();
        }
    }
};


// CÁC HÀM TƯƠNG TÁC VỚI API BACKEND
const getProvinceIdByName = async (provinceName) => {
    const normalizedName = provinceName
        .replace(/(tỉnh|thành phố)\s/gi, '')
        .trim();
    try {
        const response = await apiClient.post('/ghn/provinces');
        if (response.data && response.data.data) {
            const province = response.data.data.find(p => p.ProvinceName.toLowerCase() === normalizedName.toLowerCase());
            if (province) {
                return province.ProvinceID;
            }
        }
    } catch (e) {
        console.error("Lỗi khi lấy danh sách tỉnh/thành phố:", e);
    }
    return null;
};


const getDistrictIdByName = async (districtName, provinceId) => {
    try {
        const response = await apiClient.post('/ghn/districts', {
            province_id: provinceId
        });
        if (response.data && response.data.data) {
            const district = response.data.data.find(d => d.DistrictName.toLowerCase() === districtName.toLowerCase());
            if (district) {
                return district.DistrictID;
            }
        }
    } catch (e) {
        console.error("Lỗi khi lấy danh sách quận/huyện:", e);
    }
    return null;
};


const getWardCodeByName = async (wardName, districtId) => {
    try {
        const response = await apiClient.post('/ghn/wards', {
            district_id: districtId
        });
        if (response.data && response.data.data) {
            const ward = response.data.data.find(w => w.WardName.toLowerCase() === wardName.toLowerCase());
            if (ward) {
                return ward.WardCode;
            }
        }
    } catch (e) {
        console.error("Lỗi khi lấy danh sách xã/phường:", e);
    }
    return null;
};


// Bổ sung: Hàm để tính tổng trọng lượng của đơn hàng
// Thay đổi trong hàm calculateTotalWeight
// Bổ sung: Hàm để tính tổng trọng lượng của đơn hàng
const getTotalWeight = () => {
    // Kiểm tra xem order.value có tồn tại và danhSachSanPham có phải là mảng không
    if (!order.value || !Array.isArray(order.value.danhSachSanPham)) {
        console.log("Không có dữ liệu sản phẩm để tính trọng lượng.");
        return 0;
    }

    const totalWeight = order.value.danhSachSanPham.reduce((total, item) => {
        const weightKg = item.trongLuong || 0;
        // Chuyển đổi kg sang gram và cộng dồn
        return total + (weightKg * item.soLuong);
    }, 0);

    // GHN yêu cầu trọng lượng tối thiểu là 100g, nên cần kiểm tra và gán giá trị tối thiểu
    const finalWeightInGrams = Math.max(100, Math.round(totalWeight));

    console.log("📦 Tổng trọng lượng đơn hàng (gram):", finalWeightInGrams);
    return finalWeightInGrams;
};



const calculateUpdateSummary = async () => {
    if (!tempOrder.value || (changesQueue.value.length === 0 && selectedShippingFee.value === order.value.phiVanChuyen)) {
        showUpdateDetails.value = false;
        return;
    }

    let newTotal = tempOrder.value.danhSachSanPham.reduce((sum, item) => sum + item.thanhTien, 0);
    let addressChange = changesQueue.value.find(c => c.type === 'address');
    // Nếu không đổi địa chỉ thì fallback dùng địa chỉ gốc trong order
    let addressForShipping = addressChange 
    ? addressChange.address 
    : (order.value.selectedAddressDetail || {
          tinhThanhPho: order.value.tinhThanhPho,
          quanHuyen: order.value.quanHuyen,
          xaPhuong: order.value.xaPhuong
      });
     const weight = getTotalWeight(); // Tính tổng trọng lượng đơn hàng

    shippingServices.value = {};
    selectedShippingFee.value = 0;

    // if (addressChange || (changesQueue.value.length > 0 && !showUpdateDetails.value)) {
    // if (addressChange || changesQueue.value.length > 0) {
    if (addressChange) {
        isLoading.value = true;
        try {
            const toProvinceId = await getProvinceIdByName(addressForShipping.tinhThanhPho);
            const fromProvinceId = 244; // Tỉnh Thái Nguyên

            if (!toProvinceId) {
                toast.error('Không tìm thấy ID tỉnh/thành phố tương ứng. Vui lòng kiểm tra lại địa chỉ đã lưu.');
                isLoading.value = false;
                return;
            }

            const fromDistrictId = await getDistrictIdByName('Thành phố Thái Nguyên', fromProvinceId);
            const toDistrictId = await getDistrictIdByName(addressForShipping.quanHuyen, toProvinceId);

            if (!fromDistrictId || !toDistrictId) {
                toast.error('Không tìm thấy ID quận/huyện tương ứng.');
                isLoading.value = false;
                return;
            }

            const servicesRes = await fetchAvailableServices(toDistrictId, fromDistrictId);

            if (servicesRes && servicesRes.data && servicesRes.data.length > 0) {
                const serviceId = servicesRes.data[0].service_id;
                const toWardCode = await getWardCodeByName(addressForShipping.xaPhuong, toDistrictId);

                if (!toWardCode) {
                    toast.error('Không tìm thấy mã xã/phường tương ứng. Vui lòng kiểm tra lại địa chỉ.');
                    isLoading.value = false;
                    return;
                }

                const feeRes = await calculateShipFee({
                    service_id: serviceId,
                    insurance_value: newTotal,
                    coupon: null,
                    from_district_id: fromDistrictId,
                    to_district_id: toDistrictId,
                    to_ward_code: toWardCode,
                    height: 15,
                    length: 15,
                    weight: weight || 1000,
                    width: 15
                });

                if (feeRes.code === 200 && feeRes.data) {
                    selectedShippingFee.value = feeRes.data.total;
                    shippingServices.value.ghn = {
                        name: 'Giao Hàng Nhanh',
                        fee: selectedShippingFee.value,
                        isFastest: true
                    };
                    toast.success("Đã tính phí vận chuyển GHN thành công!");
                } else {
                    toast.error(`Không thể tính phí GHN: ${feeRes.message}`);
                }
            } else {
                toast.warning("Không có dịch vụ vận chuyển nào khả dụng cho địa chỉ này.");
            }
        } catch (e) {
            console.error('❌ Lỗi khi tính phí vận chuyển GHN:', e.response?.data || e);
            toast.error(e.response?.data?.message || 'Lỗi khi tính phí vận chuyển GHN.');
            selectedShippingFee.value = order.value.phiVanChuyen;
        } finally {
            isLoading.value = false;
        }
    } else {
        selectedShippingFee.value = order.value.phiVanChuyen;
    }

    // ⛔ BỎ LOGIC TÍNH LẠI GIẢM GIÁ
    // Giữ nguyên tiền giảm giá cũ của đơn hàng gốc, vì backend sẽ tự hủy voucher
    const discountAmount = order.value.giamGia || 0;

    // Tính tổng tiền mới (chỉ để hiển thị cho người dùng)
    const newTotalWithShipping = newTotal + selectedShippingFee.value - discountAmount;

    updateSummary.value = {
        // ... (Giữ nguyên các thuộc tính khác)
        oldTotal: order.value.tongTienSanPham, // Sửa lại thành tiền sản phẩm cũ
        oldTotalWithShipping: order.value.tongTien,
        oldShippingFee: order.value.phiVanChuyen,
        newShippingFee: selectedShippingFee.value,
        newTotal: newTotal,
        discountAmount: discountAmount, // Sử dụng giá trị cũ từ order.value
        newTotalWithShipping: newTotalWithShipping,
        finalChange: newTotalWithShipping - order.value.tongTien,
        changes: changesQueue.value.filter(c => c.type !== 'address' || c.description),
        addressChanged: addressChange !== undefined
    };

    console.group("📊 DEBUG: Cập nhật đơn hàng");
    console.log("🛒 Subtotal cũ:", updateSummary.value.oldTotal);
    console.log("🛒 Subtotal mới:", updateSummary.value.newTotal);
    console.log("🚚 Phí ship cũ:", updateSummary.value.oldShippingFee);
    console.log("🚚 Phí ship mới:", updateSummary.value.newShippingFee);
    console.log("🎟️ Giảm giá áp dụng:", updateSummary.value.discountAmount);
    console.log("💰 Tổng tiền cũ (gồm ship):", updateSummary.value.oldTotalWithShipping);
    console.log("💰 Tổng tiền mới (gồm ship):", updateSummary.value.newTotalWithShipping);
    console.log("📉 Tiền chênh lệch:", updateSummary.value.finalChange);
    console.groupEnd();

    showUpdateDetails.value = true;
    await nextTick();
    const summaryDiv = document.getElementById('update-summary-div');
    if (summaryDiv) {
        summaryDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};


// Cập nhật hàm gọi API tính phí vận chuyển
const calculateShipFee = async (requestBody) => {
    try {
        const payload = {
            ...requestBody,
            shop_id: shopId // THÊM LẠI shop_id VÀO PAYLOAD
        };
        const { data } = await apiClient.post('/ghn/calculate-fee', payload);
        return data;
    } catch (e) {
        console.error('Lỗi khi tính phí vận chuyển GHN:', e.response?.data || e);
        throw e;
    }
};


// Cập nhật hàm gọi API lấy dịch vụ
const fetchAvailableServices = async (toDistrictId, fromDistrictId) => {
    try {
        const payload = {
            from_district: fromDistrictId,
            to_district: toDistrictId,
            shop_id: shopId // THÊM LẠI shop_id VÀO PAYLOAD
        };
        const { data } = await apiClient.post('/ghn/available-services', payload);
        return data;
    } catch (e) {
        console.error('Lỗi khi lấy danh sách dịch vụ vận chuyển:', e.response?.data || e);
        throw e;
    }
};




const confirmFinalChanges = async () => {
    if (!updateSummary.value) {
        toast.error("Không có thay đổi nào để lưu.");
        return;
    }


    const userId = getUserId();
    if (!userId) {
        toast.warning("Bạn chưa đăng nhập.");
        return;
    }

    const finalPaymentMethod = 'cod'; // hoặc 'vnpay' tuỳ vào lựa chọn của người dùng


    // TẠO DTO ĐỂ GỬI LÊN SERVER - ĐÃ SỬA LẠI CHO KHỚP VỚI BACKEND
    const updateDto = {
        idHoaDon: order.value.id,


        // Nhóm thông tin người nhận vào đối tượng con
        thongTinNguoiNhan: {
            tenNguoiNhan: tempOrder.value.tenNguoiNhan,
            sdtNguoiNhan: tempOrder.value.sdtNguoiNhan,
            diaChiNguoiNhan: tempOrder.value.diaChiNguoiNhan,
        },


        // Đổi tên trường cho khớp với backend
        phiVanChuyen: updateSummary.value.newShippingFee,

        // Bổ sung phương thức thanh toán mới
        phuongThucThanhToanMoi: 'cod', // Cần lấy từ trạng thái của user hoặc logic khác


        // Đổi tên trường cho khớp và ánh xạ lại
        capNhatSanPham: changesQueue.value
            .filter(change => change.type !== 'address')
            .map(change => ({
                idHoaDonChiTiet: change.idHoaDonChiTiet,
                // Nếu xóa, số lượng mới là 0. Nếu cập nhật, lấy số lượng mới.
                soLuongMoi: change.type === 'quantity' ? change.newQty : 0,
            })),


        // Giữ nguyên các trường khác
        tongTienCu: updateSummary.value.oldTotalWithShipping,
    };

    console.log("Dữ liệu gửi lên server (updateDto):", updateDto);


    try {
        const token = Cookies.get('token');

        // SỬA LẠI ĐÚNG ĐƯỜNG DẪN API
        await apiClient.put(`/orders/update-all`, updateDto, {
            headers: { 'X-User-ID': userId, 'Authorization': `Bearer ${token}` }
        });


        toast.success("Cập nhật đơn hàng thành công!");


        const finalChange = updateSummary.value.finalChange;

        // 2. Xử lý thanh toán bổ sung nếu cần
        if (finalChange > 0) {
            try {
                sessionStorage.setItem('dataHoaDon', JSON.stringify(updateDto));
                localStorage.setItem('dataHoaDon', JSON.stringify(updateDto));
            } catch (e) {
                console.warn('Không thể lưu dataHoaDon vào storage:', e);
            }

            // Nếu có thay đổi dương, hiển thị popup để người dùng chọn cách thanh toán
            await handleExtraPayment(finalChange, order.value.id, userId);
        } else if (finalChange < 0) {
            // Nếu có thay đổi âm, thông báo hoàn tiền và cập nhật lại dữ liệu
            await Swal.fire(
                'Cập nhật thành công',
                `Bạn sẽ được hoàn lại ${formatCurrency(Math.abs(finalChange))}. Admin sẽ xử lý hoàn tiền cho bạn.`,
                'success'
            );
            await fetchOrderDetail();
        } else {
            // Nếu không có thay đổi tiền, chỉ cần cập nhật lại dữ liệu
            await Swal.fire('Cập nhật thành công', '', 'success');
            await fetchOrderDetail();
        }

    } catch (error) {
        console.error("Lỗi khi cập nhật đơn hàng:", error);
        toast.error(error.response?.data?.message || 'Không thể cập nhật đơn hàng. Vui lòng thử lại.');
    } finally {
        showUpdateDetails.value = false;
        updateSummary.value = null;
        changesQueue.value = [];
    }
};

// Đặt hàm này bên ngoài confirmFinalChanges để tái sử dụng
async function handleExtraPayment(amount, orderId, userId) {
    const { value: paymentMethod } = await Swal.fire({
        title: 'Cần thanh toán bổ sung',
        text: `Đơn hàng của bạn đã thay đổi, cần thanh toán thêm: ${formatCurrency(amount)}`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Thanh toán VNPay ngay',
        cancelButtonText: 'Trả COD khi nhận hàng',
        reverseButtons: true
    });

    if (paymentMethod) { // Người dùng chọn VNPay (bấm Confirm)
        try {
            toast.info("Đang tạo link thanh toán VNPay...");
            const vnpayRequest = {
                amount: Math.round(amount),
                hoaDonId: orderId,
                ghiChu: `Thanh toan phu phi cho don hang ${orderId}`,
                // Thêm URL thành công và thất bại vào request gửi lên backend
                cancelPage: "http://localhost:5173/vnpay-return",
                successPage: "http://localhost:5173/coolmen" // <--- Thêm dòng này để chỉ định trang thành công
            };
            const vnpayRes = await axios.post(`http://localhost:8080/vnpay`, vnpayRequest);

            if (vnpayRes.data) {
                window.location.href = vnpayRes.data; // Chuyển hướng đến URL VNPAY
            } else {
                toast.error("Không thể tạo link thanh toán VNPay. Vui lòng thử lại.");
            }
        } catch (vnpayError) {
            console.error('Lỗi khi tạo VNPay URL:', vnpayError);
            toast.error(vnpayError.response?.data?.message || 'Lỗi khi tạo link thanh toán. Vui lòng thử lại.');
        }
    } else { // Người dùng chọn COD (bấm Cancel)
        toast.success("Đã ghi nhận thanh toán bằng COD. Vui lòng thanh toán số tiền chênh lệch khi nhận hàng.");
    }
}
</script>

<style scoped>
/* --- General Layout & Typography --- */
body {
    background-color: #f0f2f5;
    font-family: 'Segoe UI', Arial, sans-serif;
}


.order-detail-wrapper {
    background-color: #f0f2f5;
    padding: 2rem 5%;
    box-sizing: border-box;
    /* Dùng margin-top để tránh bị thanh header cố định che */
    margin-top: 60px;
    /* Điều chỉnh giá trị này nếu thanh header của bạn cao hơn */
}


@media (max-width: 768px) {
    .order-detail-wrapper {
        padding: 1rem 2%;
        margin-top: 50px;
        /* Điều chỉnh cho màn hình nhỏ */
    }
}


h3 {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    border-left: 4px solid #3498db;
    padding-left: 1rem;
}


/* --- Header Section --- */
.header-section {
    margin-bottom: 2rem;
}


.btn-back {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background-color: #fff;
    border: 1px solid #dcdfe6;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #606266;
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}


.btn-back:hover {
    background-color: #ecf5ff;
    border-color: #b3d8ff;
    color: #409eff;
}


.btn-back i {
    margin-right: 0.75rem;
    color: #909399;
}


@media (max-width: 480px) {
    .btn-back {
        width: 100%;
        justify-content: center;
    }


    .btn-back i {
        display: none;
    }
}


/* --- Status Bar --- */
.order-status-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 2.5rem;
    overflow: hidden;
    position: relative;
    padding: 1.5rem;
}


.status-step {
    flex: 1;
    text-align: center;
    font-weight: bold;
    color: #909399;
    position: relative;
    padding: 0 1rem;
    transition: color 0.4s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    z-index: 2;
    /* Đảm bảo các bước không bị chồng chéo */
}


/* Vấn đề bị đè lên nhau đã được khắc phục bằng cách điều chỉnh flexbox và z-index */
.status-step .step-text {
    word-break: break-word;
    /* Ngăn chữ tràn ra ngoài */
}




@media (max-width: 768px) {
    .status-step .step-text {
        font-size: 0.7rem;
    }


    .status-step {
        padding: 0 0.2rem;
    }


    .order-status-bar {
        padding: 0.5rem 0.2rem;
    }
}


.status-step.active {
    color: #3498db;
}


.status-step:nth-child(1).active {
    color: #3498db;
}


.status-step:nth-child(2).active {
    color: #e67e22;
}


.status-step:nth-child(3).active {
    color: #2ecc71;
}


.status-step:nth-child(4).active {
    color: #f1c40f;
}


.status-step:nth-child(5).active {
    color: #9b59b6;
}


.status-step:nth-child(6).active {
    color: #e74c3c;
}


.status-step::before {
    content: '';
    position: relative;
    top: 0;
    left: 0;
    width: 20px;
    height: 20px;
    background-color: #e4e7ed;
    border-radius: 50%;
    z-index: 10;
    border: 3px solid #fff;
    transition: background-color 0.4s ease;
    margin-bottom: 5px;
    /* Thêm khoảng trống giữa chấm và chữ */
}


@media (max-width: 768px) {
    .status-step::before {
        width: 16px;
        height: 16px;
    }
}


.status-step.active::before {
    background-color: #3498db;
}


.status-step:nth-child(1).active::before {
    background-color: #3498db;
}


.status-step:nth-child(2).active::before {
    background-color: #e67e22;
}


.status-step:nth-child(3).active::before {
    background-color: #2ecc71;
}


.status-step:nth-child(4).active::before {
    background-color: #f1c40f;
}


.status-step:nth-child(5).active::before {
    background-color: #9b59b6;
}


.status-step:nth-child(6).active::before {
    background-color: #e74c3c;
}


.status-step::after {
    content: '';
    position: absolute;
    top: calc(50% + 1px);
    left: -50%;
    width: 100%;
    height: 3px;
    background-color: #e4e7ed;
    z-index: 1;
}


.status-step:first-child::after {
    content: none;
}


.status-step.active::after,
.status-step.active+.status-step::after {
    background-color: #3498db;
}


.status-step:nth-child(2).active::after {
    background-color: #e67e22;
}


.status-step:nth-child(3).active::after {
    background-color: #2ecc71;
}


.status-step:nth-child(4).active::after {
    background-color: #f1c40f;
}


.status-step:nth-child(5).active::after {
    background-color: #9b59b6;
}


.status-step:nth-child(6).active::after {
    background-color: #e74c3c;
}


.status-step.active::after {
    background-color: #3498db;
}


/* --- Main Content Grid --- */
.main-content-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2.5rem;
}


@media (max-width: 1024px) {
    .main-content-grid {
        grid-template-columns: 1fr;
    }
}


/* --- Info Blocks --- */
.info-block {
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    padding: 2rem;
    margin-bottom: 2rem;
}


@media (max-width: 768px) {
    .info-block {
        padding: 1.5rem;
    }
}


.info-block p strong {
    color: #555;
}


.info-group {
    line-height: 1.8;
}


/* --- Status Text Colors --- */
.status-pending {
    color: #3498db;
    font-weight: bold;
}


.status-confirmed {
    color: #e67e22;
    font-weight: bold;
}


.status-shipping {
    color: #2ecc71;
    font-weight: bold;
}


.status-delivered {
    color: #f1c40f;
    font-weight: bold;
}


.status-completed {
    color: #9b59b6;
    font-weight: bold;
}


.status-cancelled {
    color: #e74c3c;
    font-weight: bold;
}


/* --- Shipping Info Editable --- */
.editable-input {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 0.5rem 0.75rem;
    width: 100%;
    margin-top: 0.5rem;
    transition: border-color 0.3s;
}


.editable-input:focus {
    border-color: #409eff;
    outline: none;
}


.address-line {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
}


.address-action-icon {
    cursor: pointer;
    color: #409eff;
    font-size: 1rem;
    transition: color 0.3s;
}


.address-action-icon:hover {
    color: #1a73e8;
}


.btn-save-direct-changes {
    margin-top: 1rem;
    background-color: #67c23a;
    color: #fff;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.3s;
    width: 100%;
}


.btn-save-direct-changes:hover {
    background-color: #52a134;
}


/* --- Product List --- */
.order-items-list-detail {
    list-style: none;
    padding: 0;
}


.order-items-list-detail li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid #eee;
    padding: 1.5rem 0;
    flex-wrap: wrap;
}


.order-items-list-detail li:last-child {
    border-bottom: none;
}


.item-info-detail {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    flex: 1;
    min-width: 200px;
}


.product-thumbnail {
    width: 100px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e4e7ed;
}


.product-details {
    display: flex;
    flex-direction: column;
}


.product-name {
    font-weight: 600;
    color: #2c3e50;
    font-size: 1.1rem;
}


.product-variant {
    font-size: 0.9rem;
    color: #909399;
}


.item-actions-detail {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
}


/* --- Update Summary Block --- */
.update-summary-block {
    border-left: 5px solid #f1c40f;
}


.section-title {
    font-size: 1.5rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 1.5rem;
}


.summary-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 1rem;
    border-bottom: 1px solid #eee;
}


.label {
    color: #606266;
    font-size: 1rem;
}


.value {
    font-size: 1.2rem;
    font-weight: 600;
}


.old-total {
    text-decoration: line-through;
    color: #a0a0a0;
}


.change-details {
    margin-top: 1.5rem;
}


.change-title {
    font-weight: bold;
    color: #333;
    margin-bottom: 0.75rem;
}


.change-list {
    list-style-type: none;
    padding: 0;
}


.change-list li {
    margin-bottom: 0.5rem;
    line-height: 1.5;
}


.change-text {
    font-size: 0.95rem;
    color: #606266;
}


.change-highlight {
    font-weight: 600;
    color: #34495e;
}


.shipping-options {
    margin-top: 1.5rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
}


.old-shipping-fee {
    font-size: 0.9rem;
    color: #a0a0a0;
    margin-bottom: 0.75rem;
}


.radio-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}


.radio-label {
    display: flex;
    align-items: center;
    cursor: pointer;
}


.radio-input {
    margin-right: 0.75rem;
}


.radio-text {
    font-size: 1rem;
    color: #34495e;
}


.fastest-badge {
    background-color: #409eff;
    color: #fff;
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
    border-radius: 12px;
    margin-left: 0.75rem;
}


.total-summary {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px dashed #dcdfe6;
}


.final-total-label {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
}


.final-total {
    font-size: 2.2rem;
    font-weight: bold;
    margin-top: 0.5rem;
}


.change-amount {
    font-size: 1rem;
    font-weight: 500;
    color: #a0a0a0;
    margin-top: 0.25rem;
}


.action-buttons {
    margin-top: 2rem;
    text-align: right;
}


.btn-confirm {
    background-color: #3498db;
    color: #fff;
    padding: 1rem 2rem;
    border-radius: 8px;
    font-size: 1.1rem;
    border: none;
    transition: background-color 0.3s;
    width: 100%;
}


.btn-confirm:hover {
    background-color: #2980b9;
}


/* --- Payment History & Actions --- */
.payment-history-block {
    border-left: 5px solid #9b59b6;
}


.no-history-message {
    font-style: italic;
    color: #909399;
    text-align: center;
    padding: 2rem;
}


.payment-required-text {
    font-size: 1.1rem;
    font-weight: bold;
    color: #e74c3c;
    margin-top: 1rem;
    text-align: center;
}


.payment-buttons {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
    flex-wrap: wrap;
}


.btn-cod,
.btn-vnpay {
    padding: 0.75rem 1.5rem;
    border-radius: 6px;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    flex: 1;
    min-width: 150px;
}


.btn-cod {
    background-color: #f1c40f;
    color: #fff;
}


.btn-vnpay {
    background-color: #2980b9;
    color: #fff;
}


.refund-text {
    font-size: 1.1rem;
    font-weight: bold;
    color: #2ecc71;
    margin-top: 1rem;
    text-align: center;
}


/* --- Modal Styles --- */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}


.modal-content-single {
    background: #fff;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 650px;
    position: relative;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
    max-height: 90vh;
    overflow-y: auto;
}


.close-button {
    position: absolute;
    top: 15px;
    right: 20px;
    background: transparent;
    border: none;
    font-size: 2.5rem;
    cursor: pointer;
    color: #95a5a6;
}


.address-management-single {
    margin-top: 1rem;
}


.btn-add-address {
    background-color: #2ecc71;
    color: #fff;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 1rem;
    margin-bottom: 1.5rem;
    display: block;
    width: 100%;
}


.address-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}


.address-item {
    border: 1px solid #e4e7ed;
    padding: 1.5rem;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: box-shadow 0.3s ease;
    flex-wrap: wrap;
}


.address-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}


.address-info {
    flex-grow: 1;
}


.address-info p {
    margin: 0;
    font-size: 1rem;
    color: #34495e;
}


.address-info p:first-child {
    font-weight: bold;
}


.default-badge {
    background-color: #3498db;
    color: #fff;
    font-size: 0.75rem;
    padding: 0.3rem 0.6rem;
    border-radius: 12px;
    margin-top: 0.5rem;
    display: inline-block;
}


.address-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
}


.btn-select,
.btn-edit-small,
.btn-delete-small {
    padding: 0.75rem 1.25rem;
    border-radius: 6px;
    cursor: pointer;
    border: none;
    font-size: 0.9rem;
    transition: background-color 0.3s;
}


.btn-select {
    background-color: #3498db;
    color: #fff;
}


.btn-select:hover {
    background-color: #2980b9;
}


.btn-edit-small {
    background-color: #f39c12;
    color: #fff;
}


.btn-edit-small:hover {
    background-color: #e08e0b;
}


.btn-delete-small {
    background-color: #e74c3c;
    color: #fff;
}


.btn-delete-small:hover {
    background-color: #c0392b;
}


.no-items-message,
.no-addresses-message {
    font-style: italic;
    color: #909399;
    text-align: center;
    padding: 2rem;
}


/* --- Nút Cập nhật và Xóa sản phẩm --- */
.item-actions-detail {
    display: flex;
    gap: 0.75rem;
    /* Khoảng cách giữa 2 nút */
    margin-top: 1rem;
    align-items: center;
    /* Căn giữa theo chiều dọc */
    flex-wrap: wrap;
    /* Cho phép các nút xuống dòng trên màn hình nhỏ */
}


.btn-edit,
.btn-delete {
    padding: 0.75rem 1.5rem;
    /* Padding mặc định */
    border-radius: 8px;
    /* Bo góc mềm mại hơn */
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    /* Hiệu ứng chuyển động mượt mà */
    border: 1px solid transparent;
    /* Tạo viền ban đầu */
    min-width: 120px;
    /* Đặt chiều rộng tối thiểu cho nút */
    text-align: center;
    /* Căn giữa chữ trong nút */
}


/* Nút "Cập nhật SL" */
.btn-edit {
    background-color: #409eff;
    /* Màu xanh dương hiện đại */
    color: #fff;
    flex-grow: 2;
    /* Cho phép nút này giãn ra nhiều hơn */
    padding: 0.75rem 1.8rem;
    /* Tăng padding ngang để rộng hơn một chút */
}


.btn-edit:hover {
    background-color: #1a73e8;
    /* Đậm hơn khi hover */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}


/* Nút "Xóa" */
.btn-delete {
    background-color: #f56c6c;
    /* Màu đỏ nổi bật cho hành động xóa */
    color: #fff;
    flex-grow: 1;
    /* Nút Xóa vẫn giãn ra nhưng ít hơn nút Cập nhật */
}


.btn-delete:hover {
    background-color: #c94040;
    /* Đậm hơn khi hover */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}


/* Responsive cho màn hình nhỏ hơn */
@media (max-width: 480px) {
    .item-actions-detail {
        width: 100%;
        justify-content: space-between;
        flex-direction: column;
        /* Xếp chồng nút lên nhau trên màn hình siêu nhỏ */
        gap: 0.5rem;
        /* Khoảng cách nhỏ hơn khi xếp chồng */
    }


    .btn-edit,
    .btn-delete {
        flex: 1 1 100%;
        /* Cả hai nút chiếm toàn bộ chiều rộng khi xếp chồng */
        padding: 0.6rem 0.75rem;
        /* Giảm padding trên mobile */
        min-width: auto;
        /* Bỏ min-width để nút co giãn linh hoạt */
    }
}
</style>