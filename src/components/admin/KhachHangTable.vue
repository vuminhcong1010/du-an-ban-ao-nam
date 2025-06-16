<template>
  <div class="container mt-4">
    <!-- Toast -->
    <div class="toast-container">
      <div v-for="toast in toastList" :key="toast.id" class="toast-notification" :class="toast.type">
        <span v-if="toast.type === 'success'">✅</span>
        <span v-else-if="toast.type === 'error'">❌</span>
        <span>{{ toast.message }}</span>
      </div>
    </div>

    <!-- Bảng khách hàng -->
    <table class="table table-bordered table-striped table-hover text-center mt-3">
      <thead class="thead-dark">
        <tr>
          <th>STT</th>
          <th>Mã KH</th>
          <th>Họ tên</th>
          <th>Giới tính</th>
          <th>Ngày sinh</th>
          <th>SDT</th>
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
          <td>{{ kh.gioiTinh ? 'Nam' : 'Nữ' }}</td>
          <td>{{ kh.ngaySinh ? new Date(kh.ngaySinh).toLocaleDateString('vi-VN') : 'Chưa cập nhật' }}</td>
          <td>{{ kh.soDienThoai }}</td>
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
            <button class="btn btn-warning mr-2" @click="openEditModal(kh)">
              <img src="@/assets/view_edit.png" alt="View_update Icon" class="icon" /></button>
            <!-- <button class="btn btn-warning mr-2" @click="openAddressModal(kh)">✏️</button> -->
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

    <!-- Modal sửa khách hàng -->
    <div v-if="showModal" class="modal-backdrop">
      <div class="modal-box">
        <h2 class="text-xl font-bold mb-4">Sửa thông tin khách hàng</h2>
        <form @submit.prevent="handleSubmit">
          <input v-model="form.id" type="hidden" />
          <div class="grid grid-cols-2 gap-6"> <!-- Hai cột cho phần nhập thông tin khách hàng và địa chỉ -->
            <!-- Cột thông tin khách hàng -->
            <div>
              <div><label>Họ tên:</label><input v-model="form.tenKhachHang" type="text" required /></div>
              <div><label>Email:</label><input v-model="form.email" type="email" /></div>
              <div><label>Số điện thoại:</label><input v-model="form.soDienThoai" type="text" /></div>
              <div><label>Ngày sinh:</label><input v-model="form.ngaySinh" type="date" /></div>
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

            <!-- Cột địa chỉ -->
            <div class="space-y-4">
              <h2 class="text-xl font-bold mb-4">Địa chỉ của khách hàng</h2>
              <button @click.prevent="addAddress"
                style="background-color: #0a2c57; color: white; border: none; padding: 10px 20px; border-radius: 5px;">+</button>

              <ul v-if="addresses.length > 0">
                <li v-for="address in addresses" :key="address.id">
                  {{ address.diaChi }} <!-- Cập nhật tên trường địa chỉ phù hợp -->
                </li>
              </ul>
              <p v-else>Không có địa chỉ nào.</p>

              <!-- Hiển thị phần thêm địa chỉ ngay bên dưới -->
              <div v-if="showAddressSection" class="address-section space-y-4">
                <h3>Thêm địa chỉ mới</h3>

                <!-- Tỉnh/Thành phố -->
                <label>Tỉnh/Thành phố:</label>
                <select v-model="newAddress.tinhId" @change="loadQuanHuyen">
                  <option v-for="tinh in tinhThanhList" :value="tinh.id" :key="tinh.id">{{ tinh.tenTinhThanh }}</option>
                </select>

                <!-- Quận/Huyện -->
                <label>Quận/Huyện:</label>
                <select v-model="newAddress.quanId" @change="loadXaPhuong">
                  <option v-for="quan in quanHuyenList" :value="quan.id" :key="quan.id">{{ quan.tenQuanHuyen }}</option>
                </select>

                <!-- Xã/Phường -->
                <label>Xã/Phường:</label>
                <select v-model="newAddress.xaId">
                  <option v-for="xa in xaPhuongList" :value="xa.id" :key="xa.id">{{ xa.tenXaPhuong }}</option>
                </select>

                <!-- Địa chỉ chi tiết -->
                <label>Địa chỉ chi tiết:</label>
                <input v-model="newAddress.chiTiet" type="text" placeholder="Số nhà, tên đường..." />

                <div class="popup-actions">
                  <button @click="saveNewAddress">Lưu</button>
                  <button @click="cancelAddress">Hủy</button>
                </div>
              </div>
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
import FilterKhachHang from "../admin/FilterKhachHang.vue";

    export default {
      name: "KhachHangTable",
      components: { FilterKhachHang },
  props: {
    searchQuery: {
      type: String,
      default: ''
    },
    reload: {
      type: Boolean,
      default: false
    },
    filterData: {
      type: Object,
      default: () => ({})
    }
  },
  mounted() {
    this.fetchKhachHang();
    this.loadTinhThanh();
    this.loadQuanHuyen();
    this.loadXaPhuong();
  },
  data() {
    return {
      khachHangs: [],
      addresses: [], // Dữ liệu địa chỉ
      page: 0,
      size: 10,
      totalPages: 1,
      inputPage: 1,
      showModal: false,
      toastList: [],
      form: {
        id: '',
        maKhachHang: '',
        tenKhachHang: '',
        email: '',
        soDienThoai: '',
        gioiTinh: 'true',
        ngaySinh: '',
        trangThai: 1,
        diaChi: {
          idTinhThanhPho: '', // Tỉnh
          idQuanHuyen: '',   // Quận
          idXaPhuong: '',    // Xã
          diaChiChiTiet: '',
          isMacDinh: false,  // Địa chỉ mặc định
        } // Đảm bảo trường địa chỉ có trong form,
      },
      showAddressSection: false, // Biến để kiểm soát phần thêm địa chỉ
      tinhThanhList: [],
      quanHuyenList: [],
      xaPhuongList: [],
      selectedTinh: null,
      selectedQuan: null,
      selectedXa: null,
      newAddress: {
        tinhId: null,
        quanId: null,
        xaId: null,
        chiTiet: ''
      } // Modal địa chỉ
    };
  },
  watch: {
    searchQuery: {
      immediate: true,
      handler() {
        this.page = 0;
        this.fetchKhachHang();
      }
    },
    reload(newVal) {
      if (newVal) {
        this.fetchKhachHang();
      }
    },
    filterData: {
      deep: true,
      immediate: true,
      handler() {
        this.page = 0;
        this.fetchKhachHang();
      }
    }
  },
  methods: {
    fetchKhachHang() {
      // Tạo đối tượng params chung để gửi cho cả hai API
      const params = {
        page: this.page,
        size: this.size,
        ...this.filterData  // Thêm các bộ lọc vào params
      };

      // Gọi cả API tìm kiếm và lọc song song
      const searchPromise = this.searchQuery
        ? axios.get('/api/khach-hang/search', { params: { ...params, keyword: this.searchQuery } }) // Gọi API tìm kiếm nếu có keyword
        : Promise.resolve(null); // Nếu không có từ khóa tìm kiếm, trả về null

      const filterPromise = axios.get('/api/khach-hang/filter', { params }); // Luôn gọi API lọc

      // Đợi cả hai API hoàn thành đồng thời
      Promise.all([searchPromise, filterPromise])
        .then(([searchResponse, filterResponse]) => {
          if (searchResponse) {
            // Nếu có kết quả tìm kiếm
            this.khachHangs = searchResponse.data.content;
            this.totalPages = searchResponse.data.totalPages;
          } else if (filterResponse) {
            // Nếu chỉ có kết quả lọc
            this.khachHangs = filterResponse.data.content;
            this.totalPages = filterResponse.data.totalPages;
          }
        })
        .catch((err) => {
          console.error('Lỗi khi gọi API:', err);
        });
    },
    prevPage() {
      if (this.page > 0) {
        this.page--;
        this.inputPage = this.page + 1;
        this.fetchKhachHang();
      }
    },
    nextPage() {
      if (this.page < this.totalPages - 1) {
        this.page++;
        this.inputPage = this.page + 1;
        this.fetchKhachHang();
      }
    },
    goToPage() {
      if (this.inputPage >= 1 && this.inputPage <= this.totalPages) {
        this.page = this.inputPage - 1;
        this.fetchKhachHang();
      }
    },
    openEditModal(kh) {
      this.form = { ...kh };
      // Lấy và gán địa chỉ vào form.diaChi
      axios.get(`/api/khach-hang/${kh.id}/dia-chi`)
        .then(response => {
          // Gán địa chỉ vào form.diaChi (sử dụng dữ liệu từ API)
          if (response.data && response.data.length > 0) {
            this.form.diaChi = response.data[0].diaChi; // Gán địa chỉ đầu tiên vào form
            this.addresses = response.data;  // Cập nhật danh sách địa chỉ
          } else {
            this.form.diaChi = '';  // Nếu không có địa chỉ nào, đặt về giá trị rỗng
          }
        })
        .catch(error => {
          console.error('Lỗi khi lấy địa chỉ:', error);
          this.form.diaChi = '';  // Nếu lỗi, đặt địa chỉ thành rỗng
        });

      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.form = {
        ...kh,
        maKhachHang: '',
        tenKhachHang: '',
        email: '',
        soDienThoai: '',
        gioiTinh: 'true',
        ngaySinh: '',
        trangThai: 1,
        diaChi: {
          idTinhThanhPho: '', // Tỉnh
          idQuanHuyen: '',   // Quận
          idXaPhuong: '',    // Xã
          diaChiChiTiet: '',
          isMacDinh: false,  // Địa chỉ mặc định
        } // Đảm bảo trường địa chỉ được reset
      };
    },

    handleSubmit() {
  if (!this.form.id) {
    this.showToastMessage("ID khách hàng không hợp lệ!", "error");
    return;
  }

  // Gửi yêu cầu PUT để cập nhật thông tin khách hàng
  axios.put(`/api/khach-hang/${this.form.id}`, this.form)
    .then(() => {
      this.showToastMessage("Cập nhật thành công!", "success");
      this.fetchKhachHang(); // Tải lại danh sách khách hàng

      // Không đóng modal chính, chỉ đóng phần thêm địa chỉ
      this.showAddressSection = false;  // Đóng phần thêm địa chỉ

      // Sau khi cập nhật thành công, lấy lại địa chỉ của khách hàng
      axios.get(`/api/khach-hang/${this.form.id}/dia-chi`)
        .then(response => {
          this.addresses = response.data; // Cập nhật địa chỉ của khách hàng
          this.showModal = true; // Đóng modal sau khi cập nhật thành công
        })
        .catch(error => {
          console.error('Lỗi khi lấy địa chỉ:', error);
          this.showToastMessage("Không thể lấy địa chỉ của khách hàng.", "error");
        });
    })
    .catch(err => {
      this.showToastMessage("Cập nhật thất bại: " + err.message, "error");
    });
},
    // Hiển thị phần thêm địa chỉ ngay bên dưới nút "+"
    addAddress() {
      this.showAddressSection = true; // Mở phần thêm địa chỉ
    },

    // Lưu địa chỉ mới
    saveNewAddress() {
  if (!this.form.id) {
    this.showToastMessage("ID khách hàng không hợp lệ!", "error");
    return;
  }

  // Kiểm tra nếu không có đầy đủ thông tin địa chỉ
  if (!this.newAddress.tinhId || !this.newAddress.quanId || !this.newAddress.xaId || !this.newAddress.chiTiet) {
    this.showToastMessage("Vui lòng điền đầy đủ thông tin địa chỉ", "error");
    return;
  }

  console.log('Dữ liệu gửi đi:', this.newAddress);

  const requestData = {
    idTinhThanhPho: this.newAddress.tinhId,
    idQuanHuyen: this.newAddress.quanId,
    idXaPhuong: this.newAddress.xaId,
    diaChiChiTiet: this.newAddress.chiTiet,
    isMacDinh: false  // Hoặc tùy chọn nếu có
  };

  // Gửi yêu cầu POST với headers đúng
  axios.post(`http://localhost:8080/api/khach-hang/${this.form.id}/dia-chi`, requestData, {
    headers: {
      'Content-Type': 'application/json' // Đảm bảo gửi đúng Content-Type
    }
  })
    .then(response => {
      console.log('Địa chỉ đã được thêm:', response.data);
      // this.showToastMessage("Địa chỉ đã được thêm!", "success");
      this.addresses.push(this.newAddress); // Cập nhật địa chỉ mới vào danh sách
      this.showAddressSection = false;  // Đóng phần thêm địa chỉ
    })
    .catch(err => {
      console.error('Lỗi khi thêm địa chỉ:', err.response || err);
      this.showToastMessage("Lỗi khi thêm địa chỉ: " + (err.response?.data?.message || err.message), "error");
    });
},

    // Hủy thêm địa chỉ
    cancelAddress() {
      this.showAddressSection = false; // Đóng phần thêm địa chỉ
    },
    showToastMessage(message, type = "success") {
      const id = Date.now();
      this.toastList.push({ id, message, type });
      setTimeout(() => {
        this.toastList = this.toastList.filter(t => t.id !== id);
      }, 3000);
    },
    formatCurrency(val) {
      return new Intl.NumberFormat("vi-VN").format(val);
    },
    // Hàm để mở modal và lấy địa chỉ
    openAddressModal(kh) {
      axios.get(`/api/khach-hang/${kh.id}/dia-chi`)
        .then(response => {
          this.addresses = response.data; // Cập nhật địa chỉ của khách hàng
          this.showAddressModal = true;  
          this.showAddressModal = true; // Hiển thị modal
        })
        .catch(error => {
          console.error('Lỗi khi lấy địa chỉ:', error);
          this.showToastMessage("Không thể lấy địa chỉ của khách hàng.", "error");
        });
    },
    // Hàm đóng modal địa chỉ
    closeAddressModal() {
      this.showAddressModal = false;
      this.addresses = []; // Xóa danh sách địa chỉ khi đóng modal
    },
    loadTinhThanh() {
      axios.get('/api/dia-chi/tinh-thanh')
        .then(res => {
          this.tinhThanhList = res.data; // Lưu danh sách tỉnh/thành phố vào biến
        })
        .catch(err => {
          console.error('Lỗi khi lấy Tỉnh/Thành Phố:', err);
        });
    },

    loadQuanHuyen() {
      if (!this.newAddress.tinhId) return;  // Kiểm tra xem tỉnh đã được chọn chưa

      // Gọi API lấy quận/huyện theo tỉnh
      axios.get('/api/dia-chi/quan-huyen-by-tinh', { params: { idTinhThanh: this.newAddress.tinhId } })
        .then(res => {
          this.quanHuyenList = res.data; // Lưu danh sách quận huyện
          this.newAddress.quanId = null;  // Reset quận/huyện khi tỉnh thay đổi
          this.xaPhuongList = [];  // Reset danh sách xã/phường khi thay đổi quận/huyện
        })
        .catch(err => {
          console.error('Lỗi khi lấy Quận/Huyện:', err);
        });
    },

    loadXaPhuong() {
      if (!this.newAddress.quanId) return;  // Kiểm tra xem quận đã được chọn chưa

      // Gọi API lấy xã/phường theo quận
      axios.get('/api/dia-chi/xa-phuong-by-quan', { params: { idQuanHuyen: this.newAddress.quanId } })
        .then(res => {
          this.xaPhuongList = res.data; // Lưu danh sách xã/phường
          this.newAddress.xaId = null;  // Reset xã/phường khi quận thay đổi
        })
        .catch(err => {
          console.error('Lỗi khi lấy Xã/Phường:', err);
        });
    }
  }
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
}

.badge-danger {
  background-color: #dc3545 !important;
}

.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.toast-notification {
  min-width: 250px;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  font-weight: bold;
  color: #fff;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  animation: slideInOut 3s forwards;
}

.toast-notification.success {
  background-color: #E6F8EC;
  border: 1px solid #00B63E;
  color: #00B63E;
}

.toast-notification.error {
  background-color: #FFE6E6;
  border: 1px solid #BE4141;
  color: #BE4141;
}

@keyframes slideInOut {
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }

  10%,
  90% {
    opacity: 1;
    transform: translateY(0);
  }

  100% {
    opacity: 0;
    transform: translateY(20px);
  }
}

/* Modal Box: Điều chỉnh chiều rộng của modal */
.modal-box {
  width: 80%;
  /* Đảm bảo modal không quá rộng */
  max-width: 900px;
  /* Giới hạn chiều rộng tối đa */
  margin: 0 auto;
  /* Canh giữa modal */
  padding: 20px;
  background-color: white;
  border-radius: 8px;
}

/* Đảm bảo modal có không gian hợp lý */
.grid {
  display: grid;
  gap: 20px;
  grid-template-columns: 1fr 1fr;
  /* Hai cột với độ rộng bằng nhau */
}

/* Cột trái là phần thông tin khách hàng */
.grid-cols-2 {
  grid-template-columns: 1fr 1fr;
  /* Hai cột có độ rộng bằng nhau */
}

/* Cột phải là phần địa chỉ */
.space-y-4 {
  margin-top: 16px;
}

.address-section {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 8px;
  margin-top: 10px;
}

/* Các nút trong phần thêm địa chỉ */
.popup-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-start;
}

/* Style cho button */
button {
  cursor: pointer;
  padding: 8px 16px;
  background-color: #0a2c57;
  color: white;
  border: none;
  border-radius: 5px;
  margin-top: 10px;
}
</style>
