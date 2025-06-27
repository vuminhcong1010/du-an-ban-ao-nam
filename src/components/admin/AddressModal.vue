<template>
    <div v-if="show" class="modal-backdrop-child">
        <div class="modal-box-child">
            <div class="modal-header">
                <h2 class="text-xl font-semibold">{{ isEditing ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới' }}</h2>
                <button type="button" @click="closeModal" class="modal-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>

            <div class="modal-body space-y-4">

                <div v-if="isEditing && fullAddressDisplay" class="current-address-display">
                    <p>Địa chỉ hiện tại:</p>
                    <p class="font-bold">{{ fullAddressDisplay }}</p>
                    <hr class="my-3" />
                </div>

                <label>Tỉnh/Thành phố:</label>
                <select v-model="addressForm.tinhId" @change="loadQuanHuyen" class="form-control">
                    <option value="" disabled>-- Chọn Tỉnh/Thành phố --</option>
                    <option v-for="tinh in tinhThanhList" :value="tinh.id" :key="tinh.id">{{ tinh.tenTinhThanh }}
                    </option>
                </select>

                <label>Quận/Huyện:</label>
                <select v-model="addressForm.quanId" @change="loadXaPhuong" class="form-control">
                    <option value="" disabled>-- Chọn Quận/Huyện --</option>
                    <option v-for="quan in quanHuyenList" :value="quan.id" :key="quan.id">{{ quan.tenQuanHuyen }}
                    </option>
                </select>

                <label>Xã/Phường:</label>
                <select v-model="addressForm.xaId" class="form-control">
                    <option value="" disabled>-- Chọn Xã/Phường --</option>
                    <option v-for="xa in xaPhuongList" :value="xa.id" :key="xa.id">{{ xa.tenXaPhuong }}</option>
                </select>

                <label>Địa chỉ chi tiết:</label>
                <input v-model="addressForm.chiTiet" type="text" placeholder="Số nhà, tên đường..."
                    class="form-control" />

                <label class="checkbox-label">
                    <input type="checkbox" v-model="addressForm.isMacDinh" class="checkbox-input" />
                    Đặt làm địa chỉ mặc định
                </label>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
                <button type="button" class="btn btn-primary" @click="saveAddress">{{ isEditing ? 'Cập nhật' : 'Thêm mới' }}</button>
            </div>
        </div>
    </div>
</template>
<script>
import axios from 'axios';
import { useToast } from "vue-toastification"; // Import useToast

export default {
    props: {
        show: {
            type: Boolean,
            default: false
        },
        initialAddress: {
            type: Object,
            default: () => null
        },
        customerId: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            addressForm: {
                id: null,
                tinhId: '', // Đặt rỗng để placeholder hiển thị
                quanId: '', // Đặt rỗng để placeholder hiển thị
                xaId: '', // Đặt rỗng để placeholder hiển thị
                chiTiet: '',
                isMacDinh: false
            },
            tinhThanhList: [],
            quanHuyenList: [],
            xaPhuongList: [],
            isEditing: false,
            //toastList: [], // Đảm bảo bạn có toastList nếu bạn đang dùng nó ở đây
            fullAddressDisplay: ''
        };
    },
      setup() {
        const toast = useToast();
        return { toast }; // Trả về toast để các phương thức khác có thể truy cập qua `this.toast`
    },
    watch: {
        show(newVal) {
            if (newVal) {
                this.loadTinhThanh(); // Luôn tải danh sách tỉnh/thành phố

                if (this.initialAddress) {
                    this.isEditing = true;
                    // Sao chép sâu đối tượng để tránh thay đổi trực tiếp prop
                    this.addressForm = JSON.parse(JSON.stringify(this.initialAddress));
                    // this.fullAddressDisplay = this.initialAddress.diaChi || '';

                    // Load các danh sách phụ thuộc và chọn giá trị đúng
                    if (this.addressForm.tinhId) {
                        this.loadQuanHuyen().then(() => {
                            if (this.addressForm.quanId) {
                                this.loadXaPhuong();
                            }
                        });
                    }
                    this.fullAddressDisplay = this.initialAddress.diaChi || '';
                } else {
                    this.isEditing = false;
                    // Reset form khi thêm mới
                    this.addressForm = {
                        id: null,
                        tinhId: '',
                        quanId: '',
                        xaId: '',
                        chiTiet: '',
                        isMacDinh: false
                    };
                    this.quanHuyenList = [];
                    this.xaPhuongList = [];
                    this.fullAddressDisplay = ''; // Reset khi thêm mới
                }
            }
        },
        // Các watcher để cập nhật hiển thị địa chỉ đầy đủ (giữ nguyên hoặc đã có)
        'addressForm.tinhId': 'updateFullAddressDisplay',
        'addressForm.quanId': 'updateFullAddressDisplay',
        'addressForm.xaId': 'updateFullAddressDisplay',
        'addressForm.chiTiet': 'updateFullAddressDisplay',
    },
    methods: {
        closeModal() {
            this.$emit('close');
        },
        async saveAddress() {
            // Kiểm tra các trường bắt buộc
            if (!this.addressForm.tinhId || !this.addressForm.quanId || !this.addressForm.xaId || !this.addressForm.chiTiet) {
                console.error('Thông tin địa chỉ không đầy đủ:', this.addressForm);
                this.toast.error("Vui lòng điền đầy đủ thông tin địa chỉ.");
                return;
            }

            const requestData = {
                idTinhThanhPho: this.addressForm.tinhId,
                idQuanHuyen: this.addressForm.quanId,
                idXaPhuong: this.addressForm.xaId,
                diaChiChiTiet: this.addressForm.chiTiet,
                isMacDinh: this.addressForm.isMacDinh
            };

            try {
                if (this.isEditing && this.addressForm.id) {
                    await axios.put(`/api/dia-chi/${this.addressForm.id}`, requestData);
                    this.toast.success("Cập nhật địa chỉ thành công!"); // Sử dụng this.toast.success()
                    this.$emit('address-saved'); // Phát sự kiện để component cha tải lại/cập nhật
                } else {
                    await axios.post(`/api/khach-hang/${this.customerId}/dia-chi`, requestData);
                    this.toast.success("Địa chỉ đã được thêm thành công!"); // Sử dụng this.toast.success()
                    this.$emit('address-saved'); // Phát sự kiện để component cha tải lại/cập nhật
                }
                this.closeModal();
            } catch (err) {
                console.error('Lỗi khi lưu địa chỉ:', err);
                this.toast.error("Thao tác thất bại: " + (err.response?.data?.message || err.message)); // Sử dụng this.toast.error()
            }
        },
        // Các hàm loadTinhThanh, loadQuanHuyen, loadXaPhuong giữ nguyên như bạn đã có
        async loadTinhThanh() {
            try {
                const res = await axios.get('/api/dia-chi/tinh-thanh');
                this.tinhThanhList = res.data;
            } catch (err) {
                console.error('Lỗi khi lấy Tỉnh/Thành Phố:', err);
                this.toast.error("Lỗi khi tải danh sách tỉnh/thành phố.");
            }
        },
        async loadQuanHuyen() {
            if (!this.addressForm.tinhId) {
                this.quanHuyenList = [];
                this.addressForm.quanId = ''; // Reset về rỗng để chọn lại
                this.xaPhuongList = [];
                this.addressForm.xaId = ''; // Reset về rỗng để chọn lại
                return;
            }
            try {
                const res = await axios.get('/api/dia-chi/quan-huyen-by-tinh', { params: { idTinhThanh: this.addressForm.tinhId } });
                this.quanHuyenList = res.data;
                // Nếu quanId hiện tại không tồn tại trong danh sách mới, reset nó
                if (this.addressForm.quanId && !this.quanHuyenList.some(q => q.id === this.addressForm.quanId)) {
                    this.addressForm.quanId = '';
                }
                this.xaPhuongList = [];
                this.addressForm.xaId = '';
            } catch (err) {
                console.error('Lỗi khi lấy Quận/Huyện:', err);
                this.toast.error("Lỗi khi tải danh sách quận/huyện.");
            }
        },
        async loadXaPhuong() {
            if (!this.addressForm.quanId) {
                this.xaPhuongList = [];
                this.addressForm.xaId = ''; // Reset về rỗng để chọn lại
                return;
            }
            try {
                const res = await axios.get('/api/dia-chi/xa-phuong-by-quan', { params: { idQuanHuyen: this.addressForm.quanId } });
                this.xaPhuongList = res.data;
                // Nếu xaId hiện tại không tồn tại trong danh sách mới, reset nó
                if (this.addressForm.xaId && !this.xaPhuongList.some(x => x.id === this.addressForm.xaId)) {
                    this.addressForm.xaId = '';
                }
            } catch (err) {
                console.error('Lỗi khi lấy Xã/Phường:', err);
                this.toast.error("Lỗi khi tải danh sách xã/phường.");
            }
        },
        updateFullAddressDisplay() {
// Chắc chắn các danh sách đã có dữ liệu trước khi cố gắng tìm
            if (this.tinhThanhList.length === 0 || this.quanHuyenList.length === 0 || this.xaPhuongList.length === 0) {
                 // Nếu đang sửa và các list chưa load xong, có thể dùng initialAddress.diaChi
                if (this.isEditing && this.initialAddress && this.initialAddress.diaChi) {
                    this.fullAddressDisplay = this.initialAddress.diaChi;
                    return;
                }
                this.fullAddressDisplay = ''; // Hoặc một giá trị mặc định nào đó
                return;
            }


            const tinh = this.tinhThanhList.find(t => t.id === this.addressForm.tinhId);
            const quan = this.quanHuyenList.find(q => q.id === this.addressForm.quanId);
            const xa = this.xaPhuongList.find(x => x.id === this.addressForm.xaId);

            let parts = [];
            if (this.addressForm.chiTiet) parts.push(this.addressForm.chiTiet);
            if (xa) parts.push(xa.tenXaPhuong);
            if (quan) parts.push(quan.tenQuanHuyen);
            if (tinh) parts.push(tinh.tenTinhThanh);

            this.fullAddressDisplay = parts.join(', ');
        },
    }
};
</script>

<style scoped>
/* CSS cho modal con */
.modal-backdrop-child {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5); /* Nền mờ hơn so với modal cha */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050; /* Cao hơn z-index của modal cha (ví dụ 1040) */
}

.modal-box-child {
    background: white;
    padding: 25px; /* Tăng padding */
    border-radius: 12px; /* Bo tròn hơn */
    width: 90%;
    max-width: 550px; /* Kích thước hợp lý cho popup địa chỉ */
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1); /* Đổ bóng mềm hơn */
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 25px; /* Tăng khoảng cách */
    padding-bottom: 15px; /* Padding dưới cho header */
    border-bottom: 1px solid #eee; /* Đường kẻ phân cách */
}

.modal-header h2 {
    font-size: 1.8rem; /* Kích thước tiêu đề lớn hơn */
    font-weight: bold;
    color: #333;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 1.8rem; /* Kích thước icon đóng lớn hơn */
    cursor: pointer;
    color: #6c757d;
    transition: color 0.2s ease-in-out;
}

.modal-close:hover {
    color: #343a40;
}

.modal-body {
    display: flex;
    flex-direction: column;
    gap: 15px; /* Khoảng cách giữa các phần tử input */
}

.modal-body label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #495057;
    font-size: 1rem; /* Kích thước font cho label */
}

.form-control {
    width: 100%;
    padding: 12px 15px; /* Tăng padding input */
    border: 1px solid #ced4da;
    border-radius: 8px; /* Bo tròn input */
    font-size: 1rem; /* Kích thước font lớn hơn */
    color: #495057;
    transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    box-sizing: border-box;
}

.form-control:focus {
    border-color: #0a2c57;
    box-shadow: 0 0 0 3px rgba(10, 44, 87, 0.2);
    outline: none;
}

/* Styles mới cho hiển thị địa chỉ cũ */
.current-address-display {
    background-color: #f0f3f6; /* Màu nền nhẹ hơn */
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 20px;
    border: 1px solid #e2e8f0;
}
.current-address-display p {
    margin: 0;
    font-size: 0.95em;
    color: #343a40;
}
.current-address-display .font-bold {
    font-weight: 700;
    margin-top: 5px;
    color: #212529;
}
.current-address-display hr {
    border-color: #d1d9e0;
}

/* Checkbox label */
.checkbox-label {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-weight: normal; /* Không in đậm */
    color: #495057;
    font-size: 1rem;
    margin-top: 10px;
}

.checkbox-input {
    width: 20px;
    height: 20px;
    cursor: pointer;
    accent-color: #0a2c57; /* Màu xanh đậm cho checkbox */
    flex-shrink: 0;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 15px;
    margin-top: 30px; /* Tăng khoảng cách */
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.btn {
    padding: 10px 25px; /* Tăng padding nút */
    border: none;
    border-radius: 8px; /* Bo tròn nút */
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    font-size: 1rem; /* Kích thước font cho nút */
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #5a6268;
    transform: translateY(-2px);
}

.btn-primary { /* Đã đổi tên từ btn-success sang btn-primary */
    background-color: #0a2c57; /* Màu xanh đậm theo yêu cầu */
    color: white;
}

.btn-primary:hover {
    background-color: #071f3e; /* Màu đậm hơn khi hover */
    transform: translateY(-2px);
}

/* Toast styles (đảm bảo hiển thị đúng nếu bạn sử dụng chung) */
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1100; /* Đảm bảo toast hiển thị trên tất cả các modal */
}

.toast-notification {
    padding: 10px 20px;
    border-radius: 5px;
    color: white;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
}

.toast-notification.success {
    background-color: #28a745;
}

.toast-notification.error {
    background-color: #dc3545;
}

/* Responsive adjustments */
@media (max-width: 600px) {
    .modal-box-child {
        padding: 15px;
        max-width: 95%;
    }
    .modal-header {
        margin-bottom: 15px;
    }
    .modal-header h2 {
        font-size: 1.5rem;
    }
    .modal-close {
        font-size: 1.5rem;
    }
    .modal-body {
        gap: 10px;
    }
    .modal-body label {
        font-size: 0.95rem;
    }
    .form-control {
        padding: 10px 12px;
        font-size: 0.95rem;
    }
    .modal-footer {
        flex-direction: column;
        gap: 10px;
        margin-top: 20px;
    }
    .btn {
        width: 100%;
        padding: 10px 15px;
        font-size: 1rem;
    }
}
</style>