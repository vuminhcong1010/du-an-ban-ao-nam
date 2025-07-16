<template>
  <div class="container-fluid mt-4">
    <div v-if="!isLoading && !isSendingEmail" class="card mb-4">
      <div class="card-body">
        <h2 class="fw-bold mb-4">Sửa Phiếu Giảm Giá</h2>
        <div class="row gx-4">
          <!-- Cột 1 -->
          <div class="col-md-3">
            <div class="mb-3">
              <label class="form-label">Mã phiếu giảm giá</label>
              <input v-model="maPhieu" type="text" class="form-control" readonly />
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
              <input v-model="giaTriToiThieuFormatted" type="text" class="form-control" placeholder="VD: 100.000"
                :class="{ 'is-invalid': errors.giaTriToiThieu }" @input="handleGiaTriToiThieuInput" />
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
            <div class="mb-3">
              <label class="form-label">Giá trị giảm <span class="text-danger">*</span></label>
              <div class="input-group">
                <input v-model="giaTriGiamFormatted" type="text" class="form-control mt-2"
                  :placeholder="giaTriOption === 'phanTram' ? 'VD: 10, 20...' : 'VD: 50.000, 100.000...'"
                  :class="{ 'is-invalid': errors.giaTriGiam }" @input="handleGiaTriGiamInput" />
                <span class="input-group-text mt-2" id="giaTri-addon">
                  {{ giaTriOption === 'phanTram' ? '%' : 'VND' }}
                </span>
              </div>
              <div v-if="errors.giaTriGiam" class="invalid-feedback d-block">
                {{ errors.giaTriGiam }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Giá trị đơn tối đa <span class="text-danger">*</span></label>
              <input v-model="giaTriToiDaFormatted" type="text" class="form-control" placeholder="VD: 500.000"
                :readonly="giaTriOption === 'vnd'" :class="{ 'is-invalid': errors.giaTriToiDa }"
                @input="handleGiaTriToiDaInput" />
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
                              <th>Số lần mua</th>
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
                    <td>{{ kh.soLanMua || 0 }}</td> <!-- Hiển thị số lần mua -->
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
            <div v-if="errors.selectedRows" class="invalid-feedback d-block">
              {{ errors.selectedRows }}
            </div>
          </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
          <button @click="$router.push('/phieu-giam-gia')" class="btn btn-danger me-2">
            Quay lại
          </button>
          <button @click="confirmUpdatePhieuGiamGia" class="btn btn-primary" :disabled="isLoading || isSendingEmail">
            Sửa phiếu giảm giá
          </button>
        </div>
      </div>
    </div>
    <div v-else class="loading-overlay">
      <div class="text-center">
        <div class="spinner"></div>
        <p>{{ isSendingEmail ? 'Đang sửa phiếu giảm giá và gửi email...' : 'Đang tải...' }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { useToast } from 'vue-toastification';
import Swal from 'sweetalert2';

export default {
  name: "SuaPhieuGiamGia",
  setup() {
    const toast = useToast();
    return { toast };
  },
  data() {
    return {
      submitted: false,
      id: null,
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
      isInitialLoad: true,
      maPhieu: "",
      tenPhieu: "",
      giaTriGiam: null,
      giaTriToiThieu: null,
      giaTriToiDa: null,
      giaTriGiamFormatted: "",
      giaTriToiThieuFormatted: "",
      giaTriToiDaFormatted: "",
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
      },
      dataFetchFailed: false,
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
      console.log(`giaTriOption changed from ${oldVal} to ${newVal}`);
      if (newVal !== oldVal && !this.isInitialLoad) {
        console.log('Resetting giaTriGiam and giaTriToiDa due to giaTriOption change');
        this.giaTriGiam = null;
        this.giaTriGiamFormatted = "";
        this.giaTriToiDa = null;
        this.giaTriToiDaFormatted = "";
      }
      this.validateGiaTriOption();
    },
    loaiPhieu(newVal) {
      console.log(`loaiPhieu changed to ${newVal}`);
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
      console.log(`giaTriGiam changed to ${newVal}`);
      if (this.giaTriOption === 'vnd') {
        this.giaTriToiDa = newVal;
        this.giaTriToiDaFormatted = this.formatCurrency(newVal);
      }
      this.giaTriGiamFormatted = this.giaTriOption === 'vnd' ? this.formatCurrency(newVal) : newVal;
      if (!this.isInitialLoad) {
        this.validateGiaTriGiam();
      }
    },
    giaTriToiThieu(newVal) {
      this.giaTriToiThieuFormatted = this.formatCurrency(newVal);
      if (!this.isInitialLoad) {
        this.validateGiaTriToiThieu();
      }
    },
    giaTriToiDa(newVal) {
      this.giaTriToiDaFormatted = this.formatCurrency(newVal);
      if (!this.isInitialLoad) {
        this.validateGiaTriToiDa();
      }
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
    formatCurrency(value) {
      if (value === null || value === "" || isNaN(value)) return "";
      return Number(value).toLocaleString("vi-VN", { minimumFractionDigits: 0 });
    },
    parseCurrency(value) {
      if (!value) return null;
      const cleaned = value.replace(/[^\d]/g, "");
      return cleaned ? Number(cleaned) : null;
    },
    handleGiaTriGiamInput(event) {
      const value = event.target.value;
      if (this.giaTriOption === "phanTram") {
        this.giaTriGiam = this.parseCurrency(value);
        this.giaTriGiamFormatted = value;
      } else {
        this.giaTriGiam = this.parseCurrency(value);
        this.giaTriGiamFormatted = this.formatCurrency(this.giaTriGiam);
      }
      if (this.giaTriOption === "vnd") {
        this.giaTriToiDa = this.giaTriGiam;
        this.giaTriToiDaFormatted = this.giaTriGiamFormatted;
      }
      this.validateGiaTriGiam();
    },
    handleGiaTriToiThieuInput(event) {
      const value = event.target.value;
      this.giaTriToiThieu = this.parseCurrency(value);
      this.giaTriToiThieuFormatted = this.formatCurrency(this.giaTriToiThieu);
      this.validateGiaTriToiThieu();
    },
    handleGiaTriToiDaInput(event) {
      if (this.giaTriOption === "vnd") return;
      const value = event.target.value;
      this.giaTriToiDa = this.parseCurrency(value);
      this.giaTriToiDaFormatted = this.formatCurrency(this.giaTriToiDa);
      this.validateGiaTriToiDa();
    },
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
    const data = await response.json();
    this.danhSachKhachHang = data.map(kh => ({
      id: kh.id,
      maKhachHang: kh.maKhachHang,
      tenTaiKhoan: kh.tenTaiKhoan,
      matKhau: kh.matKhau,
      tenKhachHang: kh.tenKhachHang,
      email: kh.email,
      gioiTinh: kh.gioiTinh,
      soDienThoai: kh.soDienThoai,
      ngaySinh: kh.ngaySinh,
      ghiChu: kh.ghiChu,
      ngayTao: kh.ngayTao,
      hinhAnh: kh.hinhAnh,
      trangThai: kh.trangThai,
      soLanMua: kh.soLanMua || 0 // Thêm số lần mua
    }));
    this.currentPage = 1;
  } catch (err) {
    console.error("Lỗi:", err);
    this.danhSachKhachHang = [];
    this.dataFetchFailed = true;
    this.toast.error("Không thể tải danh sách khách hàng: " + err.message);
  }
},
    async getPhieuGiamGiaById() {
      try {
        const response = await fetch(`http://localhost:8080/phieuGiamGias/${this.$route.params.id}`);
        if (response.ok) {
          const phieu = await response.json();
          console.log("API Response:", JSON.stringify(phieu, null, 2));

          this.id = phieu.id;
          this.maPhieu = phieu.maPhieuGiamGia || "";
          this.tenPhieu = phieu.tenPhieu || "";
          this.loaiPhieu = phieu.loaiPhieu || "Công khai";
          this.soLuong = phieu.soLuong != null ? phieu.soLuong : (phieu.loaiPhieu === "Cá nhân" ? 1 : null);
          this.giaTriToiThieu = phieu.giamToiThieu != null ? Number(parseFloat(phieu.giamToiThieu).toFixed(2)) : null;
          this.giaTriToiThieuFormatted = this.formatCurrency(this.giaTriToiThieu);
          this.giaTriToiDa = phieu.giamToiDa != null ? Number(parseFloat(phieu.giamToiDa).toFixed(2)) : null;
          this.giaTriToiDaFormatted = this.formatCurrency(this.giaTriToiDa);
          this.ngayBatDau = phieu.ngayBatDau ? new Date(phieu.ngayBatDau).toISOString().slice(0, 16) : "";
          this.ngayKetThuc = phieu.ngayKetThuc ? new Date(phieu.ngayKetThuc).toISOString().slice(0, 16) : "";

          console.log("Processing discount: soTienGiam =", phieu.soTienGiam, ", phamTramGiamGia =", phieu.phamTramGiamGia);
          if (phieu.soTienGiam != null && !isNaN(parseFloat(phieu.soTienGiam))) {
            this.giaTriOption = "vnd";
            this.giaTriGiam = Math.max(0, Number(parseFloat(phieu.soTienGiam).toFixed(2)));
            this.giaTriGiamFormatted = this.formatCurrency(this.giaTriGiam);
            this.giaTriToiDa = this.giaTriGiam;
            this.giaTriToiDaFormatted = this.giaTriGiamFormatted;
            console.log("Set giaTriOption to 'vnd', giaTriGiam to", this.giaTriGiam, ", giaTriToiDa to", this.giaTriToiDa);
          } else if (phieu.phamTramGiamGia != null && !isNaN(parseFloat(phieu.phamTramGiamGia))) {
            this.giaTriOption = "phanTram";
            this.giaTriGiam = Math.max(0, Math.min(100, Number(parseFloat(phieu.phamTramGiamGia).toFixed(2))));
            this.giaTriGiamFormatted = this.giaTriGiam.toString();
            console.log("Set giaTriOption to 'phanTram', giaTriGiam to", this.giaTriGiam);
          } else {
            console.warn("No valid discount value found in API response");
            this.giaTriOption = "phanTram";
            this.giaTriGiam = null;
            this.giaTriGiamFormatted = "";
          }

          if (this.loaiPhieu === "Cá nhân") {
            const chiTietResponse = await fetch(`http://localhost:8080/chiTietPhieuGiamGias/${this.$route.params.id}`);
            if (chiTietResponse.ok) {
              const chiTietData = await chiTietResponse.json();
              this.selectedRows = chiTietData.map((chiTiet) => chiTiet.idKhachHang.id);
              console.log("Loaded selectedRows:", this.selectedRows);
            } else {
              throw new Error("Không thể tải chi tiết phiếu giảm giá");
            }
          }

          this.isInitialLoad = false;
          this.validateForm();
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      } catch (error) {
        console.error("Lỗi khi tải phiếu giảm giá:", error);
        this.dataFetchFailed = true;
        this.toast.error("Không thể tải dữ liệu phiếu giảm giá: " + error.message);
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
      console.log("Validating giaTriGiam:", this.giaTriGiam, "with giaTriOption:", this.giaTriOption);
      if (this.giaTriGiam === null || this.giaTriGiam === "" || isNaN(this.giaTriGiam)) {
        this.errors.giaTriGiam = "Giá trị giảm là bắt buộc!";
        return;
      }
      if (this.giaTriOption === "phanTram") {
        if (this.giaTriGiam < 0 || this.giaTriGiam > 100) {
          this.errors.giaTriGiam = "Giá trị giảm phải từ 0 đến 100!";
          this.giaTriGiam = this.giaTriGiam < 0 ? 0 : this.giaTriGiam > 100 ? 100 : this.giaTriGiam;
          this.giaTriGiamFormatted = this.giaTriGiam.toString();
        } else {
          this.errors.giaTriGiam = "";
        }
      } else if (this.giaTriOption === "vnd") {
        if (this.giaTriGiam < 1000) {
          this.errors.giaTriGiam = "Giá trị giảm phải từ 1000 trở lên!";
          this.giaTriToiDa = this.giaTriGiam;
          this.giaTriToiDaFormatted = this.formatCurrency(this.giaTriGiam);
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
        this.giaTriToiThieu = 0;
        this.giaTriToiThieuFormatted = "";
      } else {
        this.errors.giaTriToiThieu = "";
      }
    },
    validateGiaTriToiDa() {
      if (this.giaTriToiDa === null || this.giaTriToiDa === "" || isNaN(this.giaTriToiDa)) {
        this.errors.giaTriToiDa = "Giá trị tối đa là bắt buộc!";
      } else if (this.giaTriToiDa < 0) {
        this.errors.giaTriToiDa = "Giá trị tối đa không được âm!";
        this.giaTriToiDa = 0;
        this.giaTriToiDaFormatted = "";
      } else if (this.giaTriOption === "vnd" && this.giaTriToiDa !== this.giaTriGiam) {
        this.errors.giaTriToiDa = "Giá trị tối đa phải bằng giá trị giảm khi chọn VNĐ!";
        this.giaTriToiDa = this.giaTriGiam;
        this.giaTriToiDaFormatted = this.giaTriGiamFormatted;
      } else {
        this.errors.giaTriToiDa = "";
      }
    },
    validateNgayBatDau() {
      if (!this.ngayBatDau) {
        this.errors.ngayBatDau = "Ngày bắt đầu là bắt buộc!";
      } else {
        const now = new Date();
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
        const now = new Date();
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
      if (this.isInitialLoad) {
        this.errors.selectedRows = "";
        return;
      }
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
      console.log("Form validation errors:", this.errors);
      return Object.values(this.errors).every((error) => error === "");
    },
    async confirmUpdatePhieuGiamGia() {
      this.submitted = true;
      if (this.validateForm()) {
        const result = await Swal.fire({
          title: "Xác nhận",
          text: "Bạn có muốn sửa phiếu giảm giá không?",
          icon: "question",
          showCancelButton: true,
          confirmButtonText: "Đồng ý",
          cancelButtonText: "Hủy",
          buttonsStyling: true,
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger me-2'
          }
        });
        if (result.isConfirmed) {
          await this.updatePhieuGiamGia();
        }
      } else {
        this.toast.error("Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu!");
      }
    },
    async updatePhieuGiamGia() {
      this.isSendingEmail = true;
      const toastId = this.toast.info("Đang sửa phiếu giảm giá và gửi email...", {
        timeout: false,
      });
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
      try {
        const response = await fetch(`http://localhost:8080/phieuGiamGias/${this.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(phieu),
        });
        if (response.ok) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          this.toast.dismiss(toastId);
          this.toast.success("Sửa phiếu giảm giá thành công");
          this.$router.push("/phieu-giam-gia");
        } else {
          this.toast.dismiss(toastId);
          let errorMessage = "Có lỗi xảy ra khi sửa phiếu giảm giá.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
            console.error("Update failed with error:", errorData);
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
              this.toast.error(errorMessage);
            }
          } catch (jsonError) {
            this.toast.error(errorMessage + " (Lỗi server không trả về JSON)");
          }
        }
      } catch (error) {
        this.toast.dismiss(toastId);
        console.error("Lỗi:", error);
        this.toast.error("Có lỗi xảy ra khi sửa phiếu giảm giá: " + error.message);
      } finally {
        this.isSendingEmail = false;
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
    Promise.all([this.getDanhSachKhachHang(), this.getPhieuGiamGiaById()]).finally(() => {
      if (!this.dataFetchFailed) {
        console.log("Mounted - Initial state: giaTriOption =", this.giaTriOption, ", giaTriGiam =", this.giaTriGiam);
        this.isLoading = false;
      }
    });
  },
};
</script>

<style scoped>
.btn-primary {
  background-color: #0a2c57;
  border-color: #0a2c57;
}
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
  margin-left: 40%;
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