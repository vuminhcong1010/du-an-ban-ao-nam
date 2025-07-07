<template>
  <div class="mt-4 px-3">
    <div class="d-flex align-items-center justify-content-between bg-white p-3 rounded shadow mb-4 gap-2">
      <h4 class="mb-0">Quản lý khách hàng</h4>
      <div class="d-flex gap-2">
        <button @click="showConfirmExport"
          style="background-color: #0a2c57; color: white; border: none; padding: 10px 20px; border-radius: 5px;">
          <i class="fas fa-file-excel"></i> Xuất Excel
        </button>
        <button @click="navigateToAddCustomer"
          style="background-color: #0a2c57; color: white; border: none; padding: 10px 20px; border-radius: 5px;">
          <i class="fa-solid fa-plus"></i> Thêm khách hàng
        </button>
      </div>
    </div>
    <div class="d-flex align-items-center justify-content-between bg-white p-3 rounded shadow mb-4 gap-2">
      <SearchAndFilterKhachHang :value="searchQuery" :filter-data="filterData" @search="handleSearch"
        @filterApplied="handleFilter" />
    </div>
    <div class="bg-white p-3 rounded shadow mb-4">
      <h5 class="mb-0">Danh sách khách hàng</h5>
      <KhachHangTable :reload="reloadTable" :search-query="searchQuery" :filter-data="filterData"
        @delete-customer="confirmDeleteCustomer" />
    </div>
  </div>
</template>
<script>
import KhachHangTable from '../components/admin/KhachHangTable.vue';
import SearchAndFilterKhachHang from '@/components/admin/SearchAndFilterKhachHang.vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; // <-- Import axios
import { useToast } from "vue-toastification"; // <-- Import useToast





export default {
  name: 'CustomerManagement',
  components: {
    KhachHangTable,
    SearchAndFilterKhachHang,
  },
  setup() {
    const router = useRouter(); // Khởi tạo router instance trong setup
    const navigateToAddCustomer = () => {
      router.push({ name: 'AddKhachHang' }); // Chuyển hướng đến route 'AddCustomer'
    };
    // exportToExcel không nên nằm ở đây nếu bạn muốn dùng Options API methods
    // Nếu bạn muốn tất cả trong setup, xem Cách 2
    return { navigateToAddCustomer }; // Vẫn trả về navigateToAddCustomer từ setup
  },
  data() {
    return {
      reloadTable: false,
      searchQuery: '',
      filterData: {},
    };
  },
  methods: {
    handleAdded() {
      this.reloadTable = true;
      setTimeout(() => {
        this.reloadTable = false;
      }, 100);
    },
    handleSearch(query) {
      this.searchQuery = query;
    },
    handleFilter(filter) {
      this.filterData = filter;
    },
    // Hàm hiển thị SweetAlert2 confirm cho việc xóa
    async confirmDeleteCustomer(customerId) {
      const toast = useToast();




      const result = await this.$swal.fire({
        title: 'Xác nhận xóa?',
        text: "Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Có, xóa ngay!',
        cancelButtonText: 'Hủy bỏ',
        reverseButtons: true,
        customClass: {
          container: 'my-swal-container',
          popup: 'my-swal-popup',
          title: 'my-swal-title',
          content: 'my-swal-content',
          confirmButton: 'my-swal-delete-button',
          cancelButton: 'my-swal-cancel-button',
        },
      });




      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/khach-hang/${customerId}`); // Gọi API xóa khách hàng




          toast.success("Xóa khách hàng thành công!");
          this.reloadTableData(); // Kích hoạt reload bảng sau khi xóa thành công
        } catch (error) {
          console.error('Lỗi khi xóa khách hàng:', error);
          if (error.response && error.response.data && error.response.data.message) {
            toast.error("Lỗi khi xóa khách hàng: " + error.response.data.message);
          } else {
            toast.error("Lỗi khi xóa khách hàng. Vui lòng thử lại.");
          }
        }
      } else if (result.dismiss === this.$swal.DismissReason.cancel) {
        toast.info("Đã hủy thao tác xóa khách hàng.");
      }
    },
    // Hàm để kích hoạt reload bảng
    reloadTableData() {
      this.reloadTable = true;
      // Đặt lại reloadTable về false sau một khoảng thời gian ngắn
      // để có thể kích hoạt reload lần nữa trong tương lai
      setTimeout(() => {
        this.reloadTable = false;
      }, 100);
    },
    // Hàm mới để hiển thị SweetAlert2 confirm
    async showConfirmExport() {
      const result = await this.$swal.fire({
        title: 'Xác nhận xuất Excel?',
        text: "Bạn có chắc chắn muốn xuất danh sách khách hàng ra Excel không?",
        icon: 'warning', // Biểu tượng cảnh báo
        showCancelButton: true, // Hiển thị nút "Hủy"
        confirmButtonColor: '#0a2c57', // Màu nút xác nhận
        cancelButtonColor: '#d33', // Màu nút hủy
        confirmButtonText: 'Có, xuất ngay!', // Chữ trên nút xác nhận
        cancelButtonText: 'Hủy bỏ', // Chữ trên nút hủy
        reverseButtons: true, // Đảo ngược thứ tự nút (Cancel bên trái, Confirm bên phải)
        customClass: {
          container: 'my-swal-container', // Class tùy chỉnh cho container
          popup: 'my-swal-popup', // Class tùy chỉnh cho popup
          title: 'my-swal-title',
          content: 'my-swal-content',
          confirmButton: 'my-swal-confirm-button',
          cancelButton: 'my-swal-cancel-button',
        },
        // Để căn giữa, SweetAlert2 đã tự làm. Bạn không cần CSS đặc biệt cho việc này.
        // Tuy nhiên, bạn có thể điều chỉnh theme hoặc khoảng cách nếu muốn.
      });




      if (result.isConfirmed) {
        // Người dùng đã nhấn nút "Có, xuất ngay!"
        this.exportToExcel();
      } else if (result.dismiss === this.$swal.DismissReason.cancel) {
        // Người dùng đã nhấn nút "Hủy bỏ"
        this.toast.info("Đã hủy thao tác xuất Excel.");
      }
    },
    // Đặt exportToExcel VÀO TRONG PHẦN METHODS
    async exportToExcel() {
      const toast = useToast(); // Khởi tạo toast instance trong methods




      try {
        const response = await axios.get('/api/khach-hang/export-excel', {
          responseType: 'blob' // Rất quan trọng: Báo cho Axios biết đây là dữ liệu binary (blob)
        });




        // Tạo một URL tạm thời cho blob dữ liệu
        const url = window.URL.createObjectURL(new Blob([response.data]));




        // Tạo một thẻ <a> ẩn để tải file
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'DanhSachKhachHang.xlsx'); // Tên file khi tải về
        document.body.appendChild(link);
        link.click(); // Kích hoạt sự kiện click để tải file
        link.remove(); // Xóa thẻ <a> sau khi tải xong
        window.URL.revokeObjectURL(url); // Giải phóng URL tạm thời




        //toast.success("Xuất Excel thành công!");
        setTimeout(() => {
          toast.success("Yêu cầu xuất Excel đã được gửi. Vui lòng kiểm tra mục tải xuống của trình duyệt!");
        }, 1500);
      } catch (error) {
        console.error('Lỗi khi xuất Excel:', error);
        toast.error("Lỗi khi xuất Excel. Vui lòng thử lại.");
      }
    }
  },
};
</script>


<style scoped>
/* ❌ Không cần phần này nếu bạn dùng Bootstrap gap-2 */
.d-flex .SearchKhachHang {
  flex-grow: 1;
  margin-right: 10px;
}


/* Loại bỏ outline và viền khi nút được nhấn hoặc focus */
.btn:focus,
.btn:active {
  outline: none;
  /* Loại bỏ outline */
  border: none;
  /* Loại bỏ viền nếu có */
  box-shadow: none;
  /* Loại bỏ bóng đổ khi nút được focus hoặc nhấn */
}


/* Thêm hiệu ứng hover cho icon */
.icon {
  width: 32px;
  height: 32px;
  transition: transform 0.3s ease, background-color 0.3s ease, border-radius 0.3s ease;
  /* Thêm hiệu ứng mượt mà */
  padding: 5px;
  border-radius: 50%;
  /* Ban đầu là hình tròn */
}


/* Hiệu ứng hover khi di chuột qua icon */
.icon:hover {
  background-color: gray;
  /* Màu nền khi hover */
  transform: scale(1.3);
  /* Phóng to icon khi hover */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  /* Thêm bóng đổ khi hover */
}


.add {
  margin-left: auto;
  /* Đẩy nút thêm sang bên phải */
}


.my-swal-popup {
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  /* Màu nền gradient */
  padding: 30px;
}


.my-swal-title {
  color: #0a2c57;
  /* Màu chữ tiêu đề */
  font-size: 1.8em;
  font-weight: bold;
  margin-bottom: 15px;
}


.my-swal-content {
  color: #333;
  font-size: 1.1em;
  line-height: 1.5;
  margin-bottom: 25px;
}


.my-swal-confirm-button {
  background-color: #0a2c57 !important;
  /* Màu xanh lá cho nút xác nhận */
  border-radius: 5px !important;
  font-weight: bold;
  padding: 10px 20px;
}


.my-swal-confirm-button:hover {
  background-color: #061a38 !important;
}


.my-swal-cancel-button {
  background-color: #dc3545 !important;
  /* Màu đỏ cho nút hủy */
  border-radius: 5px !important;
  font-weight: bold;
  padding: 10px 20px;
}


.my-swal-cancel-button:hover {
  background-color: #c82333 !important;
}


#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>





