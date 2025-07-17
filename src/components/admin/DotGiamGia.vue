<template>
    <div class="container-fluid">
        <div class="bg-white p-4 rounded shadow-sm mb-3 border">
            <div class="d-flex justify-content-between align-items-center">
                <h5 class="fw-bold mb-0">Quản lý phiếu đợt giảm giá</h5>
                <router-link to="/dot-giam-gia/them" class="btn btn-primary btn-sm rounded-pill">
                    <i class="fa-solid fa-plus me-2"></i><span class="fw-bold">Thêm đợt giảm giá</span>
                </router-link>
            </div>
        </div>
        <div class="bg-white p-4 rounded shadow-sm mb-4 border">
            <div class="card-body p-0">
                <h5 class="mb-3">
                    <i>
                        <FilterIcon class="me-2" />
                    </i>Bộ lọc
                </h5>
                <div class="row g-3 align-items-end">
                    <div class="col-md-7">
                        <label class="form-label fw-medium">Tìm kiếm</label>
                        <div class="input-group">
                            <input type="text" class="form-control input-search"
                                placeholder="Tìm theo tên, mã, mô tả..." v-model="searchQuery"
                                @input="filterDotGiamGia" />
                            <button class="btn btn-primary btn-sm rounded-pill" type="button" @click="filterDotGiamGia">
                                <i class="fa-solid fa-magnifying-glass"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="row g-3 align-items-end mt-2">
                    <div class="col-md-3">
                        <label class="form-label fw-medium">Ngày bắt đầu</label>
                        <input type="date" class="form-control rounded-pill" v-model="filterStartDate"
                            @change="filterDotGiamGia" />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-medium">Ngày kết thúc</label>
                        <input type="date" class="form-control rounded-pill" v-model="filterEndDate"
                            @change="filterDotGiamGia" />
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-medium">Trạng thái</label>
                        <select class="form-select rounded-pill" v-model="filterStatus" @change="filterDotGiamGia">
                            <option value="">Tất cả</option>
                            <option value="0">Đã hủy</option>
                            <option value="1">Đang diễn ra</option>
                            <option value="2">Chưa diễn ra</option>
                            <option value="3">Đã kết thúc</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label fw-medium">Giá trị giảm</label>
                        <select class="form-select rounded-pill" v-model="filterDiscountType"
                            @change="filterDotGiamGia">
                            <option value="">Tất cả</option>
                            <option value="0">%</option>
                            <option value="1">VND</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="card-body p-0 mt-4">
                <h5 class="fw-bold mb-3">Danh sách đợt giảm giá</h5>
                <div class="table-responsive">
                    <table class="table table-hover ">
                        <thead class="table-light">
                            <tr>
                                <th scope="col" class="text-center">STT</th>
                                <th scope="col">Mã</th>
                                <th scope="col">Tên</th>
                                <th scope="col">Giá trị giảm</th>
                                <th scope="col">Ngày bắt đầu</th>
                                <th scope="col">Ngày kết thúc</th>
                                <th scope="col">Trạng thái</th>
                                <th scope="col" class="text-center">Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(dot, index) in paginatedDoiGiamGia" :key="dot.id">
                                <td class="text-center">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                                <td>{{ dot.maDotGiamGia }}</td>
                                <td>{{ dot.tenDotGiamGia }}</td>
                                <td>{{ dot.phamTramGiam ? dot.phamTramGiam + "%" : formatCurrency(dot.soTienGiam) }}
                                </td>
                                <td>{{ formatDate(dot.ngayBatDau) }}</td>
                                <td>{{ formatDate(dot.ngayKetThuc) }}</td>
                                <td><span :class="getTrangThaiClass(dot.trangThai)">{{ getTrangThaiText(dot.trangThai)
                                }}</span></td>
                                <td class="d-flex align-items-center justify-content-center gap-2">
                                    <RouterLink :to="{ name: 'suadoigiamgia', params: { id: dot.id } }"
                                        title="Chỉnh sửa đợt giảm giá" data-bs-toggle="tooltip" data-bs-placement="top"
                                        data-bs-custom-class="custom-tooltip">
                                        <Edit style="color: #4ccc7a;" />
                                    </RouterLink>

                                    <div class="form-check form-switch ms-2" v-if="dot.trangThai !== 3"
                                        :title="dot.trangThai === 0 ? 'Kích hoạt lại đợt giảm giá' : 'Hủy đợt giảm giá'"
                                        data-bs-toggle="tooltip" data-bs-placement="top"
                                        data-bs-custom-class="custom-tooltip">
                                        <input class="form-check-input" type="checkbox" v-model="dot.isChecked"
                                            @change="toggleStatus(dot.id, dot.isChecked)" :disabled="dot.loading" />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="d-flex justify-content-center mt-3">
                    <button class="btn btn-outline-secondary btn-sm rounded-pill me-1" :disabled="currentPage === 1"
                        @click="goToPage(currentPage - 1)">
                        <i class="fa-solid fa-chevron-left"></i>
                    </button>
                    <button v-for="page in totalPages" :key="page"
                        class="btn btn-outline-secondary btn-sm rounded-pill mx-1"
                        :class="{ 'active': page === currentPage }" @click="goToPage(page)">
                        {{ page }}
                    </button>
                    <button class="btn btn-outline-secondary btn-sm rounded-pill ms-1"
                        :disabled="currentPage === totalPages" @click="goToPage(currentPage + 1)">
                        <i class="fa-solid fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { FilterIcon, Edit } from "lucide-vue-next";
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';
import Cookies from 'js-cookie'


export default {
    components: {
        FilterIcon,
        Edit
    },
    

    data() {
        return {
            token: Cookies.get('token'),
            allDoiGiamGia: [],
            filteredDoiGiamGia: [],
            searchQuery: '',
            filterStartDate: '',
            filterEndDate: '',
            filterStatus: '',
            filterDiscountType: '',
            currentPage: 1,
            pageSize: 5
        };
    },
    computed: {
        totalPages() {
            return Math.ceil(this.filteredDoiGiamGia.length / this.pageSize);
        },
        paginatedDoiGiamGia() {
            const start = (this.currentPage - 1) * this.pageSize;
            const end = start + this.pageSize;
            return this.filteredDoiGiamGia.slice(start, end);
        }
    },
    methods: {
        async getAllDotGiamGia() {
            const toast = useToast();
            try {
                const response = await fetch("http://localhost:8080/doi-giam-gia",{
                    headers: {
                    Authorization: `Bearer ${this.token}`
                    }
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const json = await response.json();
                this.allDoiGiamGia = json.map(dot => ({
                    ...dot,
                    ngayBatDau: new Date(dot.ngayBatDau),
                    ngayKetThuc: new Date(dot.ngayKetThuc),
                    isChecked: dot.trangThai !== 0,
                    loading: false
                }));
                this.filterDotGiamGia();
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đợt giảm giá:", error);
                toast.error("Không thể tải danh sách đợt giảm giá. Vui lòng thử lại sau.", { timeout: 1800 });
            }
        },
       async toggleStatus(id, isActive) {
    const toast = useToast();
    const dot = this.allDoiGiamGia.find(dot => dot.id === id);
    if (!dot) return;

    // Kiểm tra trạng thái 3 (Đã kết thúc) - không cần vì đã ẩn switch
    if (dot.trangThai === 3) {
        dot.isChecked = !isActive; // Đặt lại trạng thái nếu vô tình gọi
        return;
    }

    const confirmText = isActive
        ? 'Bạn có muốn kích hoạt đợt giảm giá?'
        : 'Bạn có muốn hủy đợt giảm giá không?';

    const result = await Swal.fire({
        title: 'Xác nhận ?',
        text: confirmText,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sửa',
        cancelButtonText: 'Hủy'
    });

    if (!result.isConfirmed) {
        dot.isChecked = !isActive;
        return;
    }

    dot.loading = true;
    const previousChecked = dot.isChecked;
    try {
        const response = await fetch(`http://localhost:8080/doi-giam-gia/toggle/${id}`, {
            method: 'PUT',
            headers: { 
                 Authorization: `Bearer ${this.token}`,
                'Content-Type': 'application/json'
             },
            body: JSON.stringify({ active: isActive })
        });
        const result = await response.json();
        if (response.ok) {
            const index = this.allDoiGiamGia.findIndex(dot => dot.id === id);
            if (index !== -1) {
                this.allDoiGiamGia[index] = {
                    ...result.data,
                    ngayBatDau: new Date(result.data.ngayBatDau),
                    ngayKetThuc: new Date(result.data.ngayKetThuc),
                    isChecked: result.data.trangThai !== 0,
                    loading: false
                };
                this.filterDotGiamGia();
                if (result.data.trangThai !== 0) {
                    toast.success('Kích hoạt đợt giảm giá thành công!', { timeout: 1000 });
                } else {
                    toast.success('Hủy đợt giảm giá thành công!', { timeout: 1000 });
                }
            }
        } else {
            console.error("Lỗi khi cập nhật trạng thái:", result.message);
            dot.isChecked = previousChecked;
            toast.error(`Lỗi: ${result.message}`, { timeout: 1800 });
        }
    } catch (error) {
        console.error("Lỗi khi gọi API toggle status:", error);
        dot.isChecked = previousChecked;
        toast.error("Lỗi hệ thống. Vui lòng thử lại sau.", { timeout: 1800 });
    } finally {
        dot.loading = false;
    }
},
        filterDotGiamGia() {
            this.currentPage = 1;
            this.filteredDoiGiamGia = this.allDoiGiamGia.filter(dot => {
                const matchesSearch = !this.searchQuery ||
                    dot.maDotGiamGia.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    dot.tenDotGiamGia.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
                    (dot.moTa && dot.moTa.toLowerCase().includes(this.searchQuery.toLowerCase()));
                const matchesStartDate = !this.filterStartDate ||
                    new Date(dot.ngayBatDau).toISOString().split('T')[0] >= this.filterStartDate;
                const matchesEndDate = !this.filterEndDate ||
                    new Date(dot.ngayKetThuc).toISOString().split('T')[0] <= this.filterEndDate;
                const matchesStatus = !this.filterStatus ||
                    dot.trangThai.toString() === this.filterStatus;
                const matchesDiscountType = !this.filterDiscountType ||
                    (this.filterDiscountType === '0' && dot.phamTramGiam) ||
                    (this.filterDiscountType === '1' && dot.soTienGiam);
                return matchesSearch && matchesStartDate && matchesEndDate && matchesStatus && matchesDiscountType;
            });
        },
        getTrangThaiClass(trangThai) {
            switch (trangThai) {
                case 0: return "badge custom-primary";
                case 1: return "badge custom-accent";
                case 2: return "badge custom-accent1";
                case 3: return "badge custom-primary1";
                default: return "badge custom-primary";
            }
        },
        formatCurrency(val) {
            return val ? val.toLocaleString("vi-VN") + " VNĐ" : "";
        },
        formatDate(date) {
            return date ? new Date(date).toLocaleString("vi-VN", {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }) : "";
        },
        getTrangThaiText(status) {
            switch (status) {
                case 0: return 'Đã hủy';
                case 1: return 'Đang diễn ra';
                case 2: return 'Chưa diễn ra';
                case 3: return 'Đã kết thúc';
                default: return 'Không rõ';
            }
        },
        goToPage(page) {
            this.currentPage = page;
        }
    },
    mounted() {
        this.getAllDotGiamGia();
    }
};
</script>

<style scoped>
.input-search {
    border-radius: 30px;
    padding-left: 2.5rem;
    background-color: #f1f3f5;
    border: none;
    transition: all 0.2s ease-in-out;
}

.input-search:focus {
    border: 1px solid #0d6efd;
    background-color: white;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.table th,
.table td {
    vertical-align: middle;
    padding: 0.75rem;
}

.btn-primary {
    background-color: #0a2c57;
    border-color: #0a2c57;
    color: white;
}

.btn-primary:hover {
    background-color: #08203e;
    border-color: #08203e;
}

.badge {
    font-size: 0.85rem;
    padding: 0.5em 1em;
}

.custom-primary {
    background-color: #cc0000;
    color: white;
    border-radius: 50rem !important;
}

.custom-primary1 {
    background-color: #0a2c57;
    color: white;
    border-radius: 50rem !important;
}

.custom-accent {
    background-color: #66ff99;
    color: #0a2c57;
    border-radius: 50rem !important;
}

.custom-accent1 {
    background-color: #66ff99;
    color: white;
    border-radius: 50rem !important;
}

.btn-flat {
    background: none;
    border: none;
    padding: 0.25rem;
}

.btn-flat:hover .edit-icon {
    color: #4ccc7a;
}

.custom-tooltip .tooltip-inner {
    background-color: #4ccc7a;
    /* Màu nền của tooltip */
    color: #ffffff;
    /* Màu chữ trong tooltip */
    border: 1px solid #4ccc7a;
    /* Viền tùy chọn */
}

.custom-tooltip .tooltip-arrow::before {
    border-top-color: #4ccc7a;
    /* Màu của mũi tên tooltip (nếu là top) */
}
</style>