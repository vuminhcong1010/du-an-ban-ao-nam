<template>
  <div v-if="!isLoading" class="container-fluid mt-4">
    <div class="card mb-4">
      <div class="card-body">
        <h2 class="fw-bold mb-4">Thêm Phiếu Giảm Giá</h2>
        <div class="row gx-4">
          <!-- Cột 1 -->
          <div class="col-md-3">
            <div class="mb-3">
              <label class="form-label">Mã phiếu giảm giá</label>
              <input v-model="maPhieu" type="text" class="form-control"
                placeholder="Nhập mã hoặc để trống để tự động sinh" :class="{ 'is-invalid': errors.maPhieu }"
                @input="validateMaPhieu" />
              <div v-if="errors.maPhieu" class="invalid-feedback">
                {{ errors.maPhieu }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Hình thức giảm <span class="text-danger">*</span></label>
              <div style="margin-top: 15px; margin-bottom: 23px;">
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="giatri" id="phanTram" value="phanTram"
                    v-model="giaTriOption" @change="validateGiaTriOption" />
                  <label class="form-check-label" for="phanTram">Phần trăm</label>
                </div>
                <div class="form-check form-check-inline">
                  <input class="form-check-input" type="radio" name="giatri" id="vnd" value="vnd" v-model="giaTriOption"
                    @change="validateGiaTriOption" />
                  <label class="form-check-label" for="vnd">VNĐ</label>
                </div>
              </div>
              <div v-if="errors.giaTriOption" class="invalid-feedback d-block">
                {{ errors.giaTriOption }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Giá trị đơn tối thiểu <span class="text-danger">*</span></label>
              <input v-model.number="giaTriToiThieu" type="number" class="form-control" placeholder="VD: 100000" min="0"
                step="0.01" :class="{ 'is-invalid': errors.giaTriToiThieu }" @input="validateGiaTriToiThieu" />
              <div v-if="errors.giaTriToiThieu" class="invalid-feedback">
                {{ errors.giaTriToiThieu }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Ngày bắt đầu <span class="text-danger">*</span></label>
              <input v-model="ngayBatDau" type="datetime-local" class="form-control" :min="minDateTime"
                :class="{ 'is-invalid': errors.ngayBatDau }" @input="validateNgayBatDau" />
              <div v-if="errors.ngayBatDau" class="invalid-feedback">
                {{ errors.ngayBatDau }}
              </div>
            </div>
            <div class="mb-3" v-if="loaiPhieu === 'Công khai'">
              <label class="form-label">Số lượng <span class="text-danger">*</span></label>
              <input v-model.number="soLuong" type="number" class="form-control" placeholder="VD: 100" min="1"
                :class="{ 'is-invalid': errors.soLuong }" @input="validateSoLuong" />
              <div v-if="errors.soLuong" class="invalid-feedback">
                {{ errors.soLuong }}
              </div>
            </div>
          </div>
          <!-- Cột 2 -->
          <div class="col-md-3">
            <div class="mb-3">
              <label class="form-label">Tên phiếu giảm giá <span class="text-danger">*</span></label>
              <input v-model="tenPhieu" type="text" class="form-control" placeholder="Nhập tên phiếu giảm giá"
                :class="{ 'is-invalid': errors.tenPhieu }" @input="validateTenPhieu" />
              <div v-if="errors.tenPhieu" class="invalid-feedback">
                {{ errors.tenPhieu }}
              </div>
            </div>
            <div class="mb-4">
              <label class="form-label">Giá trị giảm <span class="text-danger">*</span></label>
              <div class="input-group">
                <input v-model.number="giaTriGiam" type="number" class="form-control"
                  :placeholder="giaTriOption === 'phanTram' ? 'VD: 10, 20...' : 'VD: 50000, 100000...'"
                  :min="giaTriOption === 'phanTram' ? 0 : 1000" :max="giaTriOption === 'phanTram' ? 100 : null"
                  :step="giaTriOption === 'phanTram' ? '0.01' : '1'" :class="{ 'is-invalid': errors.giaTriGiam }"
                  @input="validateGiaTriGiam" />
                <span class="input-group-text">
                  {{ giaTriOption === 'phanTram' ? '%' : 'VND' }}
                </span>
              </div>
              <div v-if="errors.giaTriGiam" class="invalid-feedback d-block">
                {{ errors.giaTriGiam }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Giá trị đơn tối đa <span class="text-danger">*</span></label>
              <input v-model.number="giaTriToiDa" type="number" class="form-control" placeholder="VD: 500000" min="0"
                step="0.01" :class="{ 'is-invalid': errors.giaTriToiDa }" :readonly="giaTriOption === 'vnd'"
                @input="validateGiaTriToiDa" />
              <div v-if="errors.giaTriToiDa" class="invalid-feedback">
                {{ errors.giaTriToiDa }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Ngày kết thúc <span class="text-danger">*</span></label>
              <input v-model="ngayKetThuc" type="datetime-local" class="form-control" :min="minDateTime"
                :class="{ 'is-invalid': errors.ngayKetThuc }" @input="validateNgayKetThuc" />
              <div v-if="errors.ngayKetThuc" class="invalid-feedback">
                {{ errors.ngayKetThuc }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Loại phiếu giảm giá <span class="text-danger">*</span></label>
              <br>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="loai" id="congkhai" value="Công khai"
                  v-model="loaiPhieu" @change="validateLoaiPhieu" />
                <label class="form-check-label" for="congkhai">Công khai</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="loai" id="canhan" value="Cá nhân" v-model="loaiPhieu"
                  @change="validateLoaiPhieu" />
                <label class="form-check-label" for="canhan">Cá nhân</label>
              </div>
              <div v-if="errors.loaiPhieu" class="invalid-feedback d-block">
                {{ errors.loaiPhieu }}
              </div>
            </div>
          </div>
          <!-- Cột 3: Bảng khách hàng -->
          <div class="col-md-6" v-if="loaiPhieu === 'Cá nhân'">
            <div class="mb-2">
              <label class="form-label">Tìm kiếm:</label>
              <input v-model="searchQuery" type="text" class="form-control"
                placeholder="Nhập tên, email hoặc số điện thoại" @input="currentPage = 1" />
              <label class="form-label mt-2" style="margin-right: 20px;">Giới tính:</label>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="gioitinh" id="gioiTinhTatCa" value=""
                  v-model="gioiTinhFilter" />
                <label class="form-check-label" for="gioiTinhTatCa">Tất cả</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="gioitinh" id="gioiTinhNam" :value="true"
                  v-model="gioiTinhFilter" />
                <label class="form-check-label" for="gioiTinhNam">Nam</label>
              </div>
              <div class="form-check form-check-inline">
                <input class="form-check-input" type="radio" name="gioitinh" id="gioiTinhNu" :value="false"
                  v-model="gioiTinhFilter" />
                <label class="form-check-label" for="gioiTinhNu">Nữ</label>
              </div>
            </div>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th style="width: 5%;">
                      <input type="checkbox" v-model="selectAll" @change="toggleAllCheckboxes" />
                    </th>
                    <th>Tên</th>
                    <th>Email</th>
                    <th>Số điện thoại</th>
                    <th>Giới tính</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="kh in paginatedKhachHang" :key="kh.id">
                    <td>
                      <input type="checkbox" :value="kh.id" v-model="selectedRows" @change="validateSelectedRows" />
                    </td>
                    <td>{{ kh.tenKhachHang }}</td>
                    <td>{{ kh.email }}</td>
                    <td>{{ kh.soDienThoai }}</td>
                    <td>{{ kh.gioiTinh ? "Nam" : "Nữ" }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <nav class="d-flex justify-content-center mt-3">
              <ul class="pagination mb-0">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Trước</a>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Tiếp</a>
                </li>
              </ul>
            </nav>
            <div v-if="errors.selectedRows" class="text-danger mt-2">
              {{ errors.selectedRows }}
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button @click="$router.push('/phieu-giam-gia')" class="btn btn-danger me-2">
            Quay lại
          </button>
          <button @click="confirmThemPhieuGiamGia" class="btn btn-primary" :disabled="isLoading">
            Thêm phiếu giảm giá
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="text-center mt-5"><i class="fas fa-spinner fa-spin"></i> Đang tải...</div>
  <!-- Lớp phủ loading khi gửi email -->
  <div v-if="isSendingEmail" class="loading-overlay">
    <div class="spinner"></div>
    <p>Đang gửi email phiếu giảm giá...</p>
  </div>
</template>

<script>
import { useToast } from "vue-toastification";
import Swal from "sweetalert2";

export default {
  name: "ThemPhieuGiamGia",
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      submitted: false,
      giaTriOption: "phanTram",
      loaiPhieu: "Công khai",
      selectAll: false,
      selectedRows: [],
      danhSachKhachHang: [],
      searchQuery: "",
      gioiTinhFilter: "",
      currentPage: 1,
      itemsPerPage: 5,
      isLoading: false,
      isSendingEmail: false,
      maPhieu: "",
      tenPhieu: "",
      giaTriGiam: null,
      giaTriToiThieu: null,
      giaTriToiDa: null,
      ngayBatDau: "",
      ngayKetThuc: "",
      soLuong: null,
      errors: {
        maPhieu: "",
        tenPhieu: "",
        giaTriOption: "",
        giaTriGiam: "",
        giaTriToiThieu: "",
        giaTriToiDa: "",
        ngayBatDau: "",
        ngayKetThuc: "",
        loaiPhieu: "",
        soLuong: "",
        selectedRows: "",
        general: "",
      },
    };
  },
  computed: {
    minDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },
    filteredKhachHang() {
      return this.danhSachKhachHang.filter((kh) => {
        const matchesSearch =
          !this.searchQuery ||
          kh.tenKhachHang
            ?.toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          kh.email?.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          kh.soDienThoai?.includes(this.searchQuery);
        const matchesGioiTinh =
          this.gioiTinhFilter === "" || kh.gioiTinh === this.gioiTinhFilter;
        return matchesSearch && matchesGioiTinh;
      });
    },
    paginatedKhachHang() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      const end = start + this.itemsPerPage;
      return this.filteredKhachHang.slice(start, end);
    },
    totalPages() {
      return Math.ceil(this.filteredKhachHang.length / this.itemsPerPage);
    },
    isAllSelectedOnPage() {
      return this.paginatedKhachHang.every((kh) =>
        this.selectedRows.includes(kh.id)
      );
    },
  },
  watch: {
    currentPage() {
      this.selectAll = this.isAllSelectedOnPage;
    },
    giaTriOption(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.giaTriGiam = null;
        this.giaTriToiDa = null;
        this.validateGiaTriOption();
        this.validateGiaTriGiam();
      }
    },
    loaiPhieu(newVal) {
      if (newVal === "Công khai") {
        this.selectedRows = [];
        this.soLuong = null;
        this.errors.selectedRows = "";
        this.errors.soLuong = "";
      } else if (newVal === "Cá nhân") {
        this.soLuong = 1;
        this.errors.soLuong = "";
      }
      this.validateLoaiPhieu();
    },
    maPhieu() {
      this.validateMaPhieu();
    },
    tenPhieu() {
      this.validateTenPhieu();
    },
    giaTriGiam(newVal) {
      if (this.giaTriOption === "vnd") {
        this.giaTriToiDa = newVal;
      }
      this.validateGiaTriGiam();
    },
    giaTriToiThieu() {
      this.validateGiaTriToiThieu();
    },
    giaTriToiDa() {
      this.validateGiaTriToiDa();
    },
    ngayBatDau() {
      this.validateNgayBatDau();
      this.validateNgayKetThuc();
    },
    ngayKetThuc() {
      this.validateNgayKetThuc();
    },
    selectedRows() {
      this.validateSelectedRows();
    },
    soLuong() {
      this.validateSoLuong();
    },
  },
  methods: {
    toggleAllCheckboxes() {
      const currentPageIds = this.paginatedKhachHang.map((kh) => kh.id);
      if (this.selectAll) {
        this.selectedRows = [...new Set([...this.selectedRows, ...currentPageIds])];
      } else {
        this.selectedRows = this.selectedRows.filter(
          (id) => !currentPageIds.includes(id)
        );
      }
      this.validateSelectedRows();
    },
    async getDanhSachKhachHang() {
      try {
        const response = await fetch("http://localhost:8080/danhSachKhachHang");
        if (!response.ok) throw new Error("Không thể tải danh sách khách hàng");
        this.danhSachKhachHang = await response.json();
        this.currentPage = 1;
      } catch (err) {
        console.error("Lỗi tải danh sách khách hàng:", err);
        this.danhSachKhachHang = [];
        this.toast.error("Không thể tải danh sách khách hàng: " + err.message);
      } finally {
        this.isLoading = false;
        console.log("Loading state after fetch:", this.isLoading);
      }
    },
    validateMaPhieu() {
      this.errors.maPhieu = this.maPhieu && this.maPhieu.trim() === ""
        ? "Mã phiếu không được để trống nếu đã nhập!"
        : "";
    },
    validateTenPhieu() {
      this.errors.tenPhieu = !this.tenPhieu || this.tenPhieu.trim() === ""
        ? "Tên phiếu là bắt buộc!"
        : "";
    },
    validateGiaTriOption() {
      this.errors.giaTriOption = !["phanTram", "vnd"].includes(this.giaTriOption)
        ? "Vui lòng chọn hình thức giảm!"
        : "";
      this.validateGiaTriGiam();
    },
    validateGiaTriGiam() {
      if (this.giaTriGiam === null || this.giaTriGiam === "" || isNaN(this.giaTriGiam)) {
        this.errors.giaTriGiam = "Giá trị giảm là bắt buộc!";
        return;
      }
      const giaTriGiamNum = Number(this.giaTriGiam);
      if (giaTriGiamNum < 0) {
        this.errors.giaTriGiam = "Giá trị giảm không được âm!";
        return;
      }
      if (this.giaTriOption === "phanTram") {
        if (giaTriGiamNum > 100) {
          this.errors.giaTriGiam = "Giá trị giảm phải từ 0 đến 100!";
        } else {
          this.errors.giaTriGiam = "";
        }
      } else if (this.giaTriOption === "vnd") {
        if (giaTriGiamNum < 1000) {
          this.errors.giaTriGiam = "Giá trị giảm phải từ 1000 trở lên!";
        } else {
          this.errors.giaTriGiam = "";
        }
      }
    },
    validateGiaTriToiThieu() {
      if (this.giaTriToiThieu === null || this.giaTriToiThieu === "" || isNaN(this.giaTriToiThieu)) {
        this.errors.giaTriToiThieu = "Giá trị tối thiểu là bắt buộc!";
      } else if (this.giaTriToiThieu < 0) {
        this.errors.giaTriToiThieu = "Giá trị tối thiểu không được âm!";
      } else {
        this.errors.giaTriToiThieu = "";
      }
    },
    validateGiaTriToiDa() {
      if (this.giaTriToiDa === null || this.giaTriToiDa === "" || isNaN(this.giaTriToiDa)) {
        this.errors.giaTriToiDa = "Giá trị tối đa là bắt buộc!";
      } else if (this.giaTriToiDa < 0) {
        this.errors.giaTriToiDa = "Giá trị tối đa không được âm!";
      } else if (this.giaTriOption === "vnd" && this.giaTriToiDa !== this.giaTriGiam) {
        this.errors.giaTriToiDa = "Giá trị tối đa phải bằng giá trị giảm khi chọn VNĐ!";
      } else {
        this.errors.giaTriToiDa = "";
      }
    },
    validateNgayBatDau() {
      if (!this.ngayBatDau) {
        this.errors.ngayBatDau = "Ngày bắt đầu là bắt buộc!";
      } else {
        const now = new Date('2025-07-01T15:40:00+07:00');
        const startDate = new Date(this.ngayBatDau);
        if (startDate < now) {
          this.errors.ngayBatDau = "Ngày bắt đầu không được là ngày trong quá khứ!";
        } else if (this.ngayKetThuc && startDate > new Date(this.ngayKetThuc)) {
          this.errors.ngayBatDau = "Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc!";
        } else {
          this.errors.ngayBatDau = "";
        }
      }
    },
    validateNgayKetThuc() {
      if (!this.ngayKetThuc) {
        this.errors.ngayKetThuc = "Ngày kết thúc là bắt buộc!";
      } else {
        const now = new Date('2025-07-01T15:40:00+07:00');
        const endDate = new Date(this.ngayKetThuc);
        if (endDate < now) {
          this.errors.ngayKetThuc = "Ngày kết thúc không được là ngày trong quá khứ!";
        } else if (this.ngayBatDau && endDate < new Date(this.ngayBatDau)) {
          this.errors.ngayKetThuc = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu!";
        } else {
          this.errors.ngayKetThuc = "";
        }
      }
    },
    validateLoaiPhieu() {
      this.errors.loaiPhieu = !["Công khai", "Cá nhân"].includes(this.loaiPhieu)
        ? "Vui lòng chọn loại phiếu!"
        : "";
      this.validateSelectedRows();
      this.validateSoLuong();
    },
    validateSelectedRows() {
      if (this.loaiPhieu === "Cá nhân" && this.selectedRows.length === 0) {
        this.errors.selectedRows = "Vui lòng chọn ít nhất một khách hàng cho phiếu Cá nhân!";
      } else {
        this.errors.selectedRows = "";
      }
    },
    validateSoLuong() {
      if (this.loaiPhieu === "Công khai" && (this.soLuong === null || this.soLuong < 1)) {
        this.errors.soLuong = "Số lượng phải lớn hơn hoặc bằng 1 cho phiếu Công khai!";
      } else {
        this.errors.soLuong = "";
      }
    },
    validateForm() {
      this.validateMaPhieu();
      this.validateTenPhieu();
      this.validateGiaTriOption();
      this.validateGiaTriGiam();
      this.validateGiaTriToiThieu();
      this.validateGiaTriToiDa();
      this.validateNgayBatDau();
      this.validateNgayKetThuc();
      this.validateLoaiPhieu();
      this.validateSelectedRows();
      this.validateSoLuong();
      console.log("Errors:", this.errors);
      return Object.values(this.errors).every((error) => error === "");
    },
    async confirmThemPhieuGiamGia() {
      this.submitted = true;
      console.log("Form validated:", this.validateForm());
      if (this.validateForm()) {
        const result = await Swal.fire({
          title: "Xác nhận",
          text: "Bạn có muốn thêm phiếu giảm giá không?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Hủy",
          buttonsStyling: true,
          customClass: {
            confirmButton: "btn btn-primary",
            cancelButton: "btn btn-danger me-2",
          },
        });
        if (result.isConfirmed) {
          await this.themPhieuGiamGia();
        }
      } else {
        this.toast.error("Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu!");
      }
    },
    async themPhieuGiamGia() {
      this.isLoading = true;
      const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };
      const phieu = {
        maPhieuGiamGia: this.maPhieu.trim(),
        tenPhieu: this.tenPhieu.trim(),
        loaiPhieu: this.loaiPhieu,
        phanTramGiam: this.giaTriOption === "phanTram" ? Number(this.giaTriGiam.toFixed(2)) : null,
        soTienGiam: this.giaTriOption === "vnd" ? Number(this.giaTriGiam.toFixed(2)) : null,
        giaTriToiThieu: Number(this.giaTriToiThieu.toFixed(2)),
        giaTriToiDa: Number(this.giaTriToiDa.toFixed(2)),
        ngayBatDau: formatDate(this.ngayBatDau),
        ngayKetThuc: formatDate(this.ngayKetThuc),
        soLuong: this.soLuong,
        danhSachKhachHangId: this.loaiPhieu === "Cá nhân" ? this.selectedRows : [],
      };
      console.log("Sending data:", phieu);
      try {
        const response = await fetch("http://localhost:8080/phieuGiamGia", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(phieu),
        });
        console.log("Response status:", response.status);
        if (response.ok) {
          this.isSendingEmail = true;
          await new Promise((resolve) => setTimeout(resolve, 2000));
          this.toast.success("Thêm phiếu giảm giá thành công");
          this.$router.push("/phieu-giam-gia");
        } else {
          const errorData = await response.json();
          console.log("Error data:", errorData);
          this.toast.error("Thêm thất bại: " + (errorData.message || "Có lỗi xảy ra"));
          if (errorData.message.includes("Mã phiếu giảm giá")) {
            this.errors.maPhieu = errorData.message;
          } else if (errorData.message.includes("Tên phiếu")) {
            this.errors.tenPhieu = errorData.message;
          } else if (errorData.message.includes("Loại phiếu")) {
            this.errors.loaiPhieu = errorData.message;
          } else if (errorData.message.includes("Phần trăm giảm giá") || errorData.message.includes("Số tiền giảm")) {
            this.errors.giaTriGiam = errorData.message;
          } else if (errorData.message.includes("Giá trị tối thiểu")) {
            this.errors.giaTriToiThieu = errorData.message;
          } else if (errorData.message.includes("Giá trị tối đa")) {
            this.errors.giaTriToiDa = errorData.message;
          } else if (errorData.message.includes("Ngày bắt đầu")) {
            this.errors.ngayBatDau = errorData.message;
          } else if (errorData.message.includes("Ngày kết thúc")) {
            this.errors.ngayKetThuc = errorData.message;
          } else if (errorData.message.includes("Số lượng")) {
            this.errors.soLuong = errorData.message;
          } else if (errorData.message.includes("khách hàng")) {
            this.errors.selectedRows = errorData.message;
          } else {
            this.errors.general = "Có lỗi không xác định từ server.";
          }
        }
      } catch (error) {
        console.error("Lỗi:", error);
        this.toast.error("Có lỗi xảy ra khi thêm phiếu giảm giá: " + error.message);
      } finally {
        this.isLoading = false;
        this.isSendingEmail = false;
        console.log("Loading state after request:", this.isLoading);
      }
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    },
  },
  mounted() {
    this.isLoading = true;
    console.log("Loading started:", this.isLoading);
    this.getDanhSachKhachHang().finally(() => {
      this.isLoading = false;
      console.log("Loading finished:", this.isLoading);
    });
  },
};
</script>

<style scoped>
.btn-primary {
  background-color: #0a2c57;
  border-color: #0a2c57;
}

/* Loading Overlay Styles */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 64px;
  height: 64px;
  border: 8px solid #f3f3f3;
  border-top: 8px solid #0a2c57;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: white;
  font-size: 1.2rem;
  margin-top: 10px;
}
</style>