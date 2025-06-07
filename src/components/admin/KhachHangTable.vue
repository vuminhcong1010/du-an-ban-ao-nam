<template>
    <div class="container mt-4">
        <table class="table table-bordered table-striped table-hover text-center">
            <thead class="thead-dark">
                <tr>
                    <th>ID</th>
                    <th>Mã KH</th>
                    <th>Họ tên</th>
                    <th>SDT</th>
                    <th>Giới tính</th>
                    <th>Sinh nhật</th>
                    <th>Email</th>
                    <th>Số đơn đã mua</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(kh, index) in khachHangs" :key="index">
                    <td>{{ index + 1 + page * size }}</td>
                    <td>{{ kh.maKhachHang }}</td>
                    <td>{{ kh.tenKhachHang }}</td>
                    <td>{{ kh.soDienThoai }}</td>
                    <td>{{ kh.gioiTinh ? 'Nam' : 'Nữ' }}</td>
                    <td>{{ kh.ngaySinh ? new Date(kh.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật' }}</td>
                    <td>{{ kh.email || 'Chưa cập nhật' }}</td>
                    <td>{{ kh.soHoaDonDaMua || 0 }}</td>
                    <td>{{ kh.tongTien ? formatCurrency(kh.tongTien) : '0' }}</td>
                    <td>
                        <span :class="{
                            'badge badge-success': kh.trangThai === 1,
                            'badge badge-danger': kh.trangThai === 0
                        }">
                            {{ kh.trangThai === 1 ? 'Đang hoạt động' : 'Dừng hoạt động' }}
                        </span>
                    </td>
                    <td>
                        <!-- Nút sửa thông tin khách hàng -->
                        <button class="btn btn-warning mr-2" @click="openEditModal(kh)">✏️</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Phân trang -->
        <div class="mt-4 d-flex align-items-center justify-content-center gap-2">
            <button class="btn btn-secondary" @click="prevPage" :disabled="page === 0">Trước</button>
            <input v-model.number="inputPage" @keyup.enter="goToPage" type="number" min="1" :max="totalPages"
                class="form-control w-auto text-center" />
            <span>/ {{ totalPages }}</span>
            <button class="btn btn-secondary" @click="nextPage" :disabled="page >= totalPages - 1">Tiếp</button>
        </div>

        <!-- Modal Sửa Khách Hàng -->
        <div v-if="showModal" class="modal-backdrop">
            <div class="modal-box">
                <h2 class="text-xl font-bold mb-4">Sửa thông tin khách hàng</h2>

                <form @submit.prevent="handleSubmit">
                    <!-- Ẩn ID trong form nhưng vẫn gửi nó -->
                    <input v-model="form.id" type="hidden" />

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label>Họ tên:</label>
                            <input v-model="form.tenKhachHang" type="text" required />
                        </div>
                        <div>
                            <label>Email:</label>
                            <input v-model="form.email" type="email" />
                        </div>
                        <div>
                            <label>Số điện thoại:</label>
                            <input v-model="form.soDienThoai" type="text" />
                        </div>
                        <div>
                            <label>Ngày sinh:</label>
                            <input v-model="form.ngaySinh" type="date" />
                        </div>
                        <div class="col-span-2">
                            <label>Giới tính:</label>
                            <label><input type="radio" value="true" v-model="form.gioiTinh" /> Nam</label>
                            <label><input type="radio" value="false" v-model="form.gioiTinh" /> Nữ</label>
                        </div>
                        <div class="col-span-2">
                            <label>Trạng thái:</label>
                            <select v-model="form.trangThai">
                                <option :value="1">Đang hoạt động</option>
                                <option :value="0">Ngừng hoạt động</option>
                            </select>
                        </div>
                    </div>

                    <div class="mt-4 flex justify-end gap-2">
                        <button type="button" class="btn btn-secondary" @click="closeModal">Huỷ</button>
                        <button type="submit" class="btn btn-success">Lưu</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";

export default {
    name: "KhachHangTable",
    data() {
        return {
            khachHangs: [],
            page: 0,
            size: 10,
            totalPages: 1,
            inputPage: 1,
            form: {
                id: '',
                maKhachHang: '',
                tenKhachHang: '',
                email: '',
                soDienThoai: '',
                gioiTinh: 'true',
                ngaySinh: '',
                trangThai: 1,
            },
            showModal: false,
            selectedCustomer: null,
        };
    },
    mounted() {
        this.fetchData();
    },
    methods: {
        fetchData() {
            axios
                .get(`/api/khach-hang?page=${this.page}&size=${this.size}`)
                .then((res) => {
                    this.khachHangs = res.data.content;
                    this.totalPages = res.data.totalPages;
                });
        },
        formatCurrency(val) {
            return new Intl.NumberFormat("vi-VN").format(val);
        },
        prevPage() {
            if (this.page > 0) {
                this.page--;
                this.inputPage = this.page + 1;
                this.fetchData();
            }
        },
        nextPage() {
            if (this.page < this.totalPages - 1) {
                this.page++;
                this.inputPage = this.page + 1;
                this.fetchData();
            }
        },
        goToPage() {
            if (this.inputPage >= 1 && this.inputPage <= this.totalPages) {
                this.page = this.inputPage - 1;
                this.fetchData();
            }
        },
        openEditModal(khachHang) {
            console.log("Khách hàng:", khachHang); // Kiểm tra xem có trường `id` không
            this.selectedCustomer = khachHang;
            this.form = { ...khachHang };
            this.showModal = true;
        },
        closeModal() {
            this.showModal = false;
            this.selectedCustomer = null;
            this.form = {
                maKhachHang: '',
                tenKhachHang: '',
                email: '',
                soDienThoai: '',
                gioiTinh: 'true',
                ngaySinh: '',
                trangThai: 1,
            };
        },
        handleSubmit() {
            if (!this.form.id) {
                alert("ID khách hàng không hợp lệ!");
                return;
            }
            axios
                .put(`/api/khach-hang/${this.form.id}`, this.form)
                .then(() => {
                    alert("Cập nhật thành công!");
                    this.fetchData();
                    this.closeModal();
                })
                .catch((err) => {
                    alert("Cập nhật thất bại: " + err.message);
                });
        },
    },
};
</script>

<style scoped>
/* Các kiểu CSS cho bảng khách hàng và phân trang */
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
}

.modal-box {
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    width: 500px;
}

input,
select {
    width: 100%;
    padding: 0.4rem;
    border: 1px solid #ccc;
    border-radius: 5px;
}

.badge-success {
    background-color: #28a745 !important;
    /* Màu xanh */
}

.badge-danger {
    background-color: #dc3545 !important;
    /* Màu đỏ */
}
</style>
