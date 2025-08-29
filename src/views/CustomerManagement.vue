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
import Cookies from 'js-cookie'; // <-- Import Cookies
import { useToast } from "vue-toastification"; 
import KhachHangTable from '../components/admin/KhachHangTable.vue';
import SearchAndFilterKhachHang from '@/components/admin/SearchAndFilterKhachHang.vue';
import { useRouter } from 'vue-router';
import axios from 'axios'; 

export default {
    name: 'CustomerManagement',
    components: {
        KhachHangTable,
        SearchAndFilterKhachHang,
    },
    setup() {
        const router = useRouter(); 
        const navigateToAddCustomer = () => {
            router.push({ name: 'AddKhachHang' }); 
        };
        return { navigateToAddCustomer }; 
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
                    // Lấy token từ cookie
                    const token = Cookies.get('token');

                    // Kiểm tra xem token có tồn tại không
                    if (!token) {
                        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                        console.error('Authentication token not found.');
                        return; // Ngừng thực hiện hàm nếu không có token
                    }
                    
                    // Thêm token vào header Authorization
                    await axios.delete(`/api/khach-hang/${customerId}`, {
                        headers: {
Authorization: `Bearer ${token}`
                        }
                    }); 

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
        // ... (các methods khác)
        reloadTableData() {
            this.reloadTable = true;
            setTimeout(() => {
                this.reloadTable = false;
            }, 100);
        },
        async showConfirmExport() {
            // ... (phần code này giữ nguyên)
            const result = await this.$swal.fire({
                title: 'Xác nhận xuất Excel?',
                text: "Bạn có chắc chắn muốn xuất danh sách khách hàng ra Excel không?",
                icon: 'warning', 
                showCancelButton: true, 
                confirmButtonColor: '#0a2c57', 
                cancelButtonColor: '#d33', 
                confirmButtonText: 'Có, xuất ngay!', 
                cancelButtonText: 'Hủy bỏ', 
                reverseButtons: true, 
                customClass: {
                    container: 'my-swal-container', 
                    popup: 'my-swal-popup', 
                    title: 'my-swal-title',
                    content: 'my-swal-content',
                    confirmButton: 'my-swal-confirm-button',
                    cancelButton: 'my-swal-cancel-button',
                },
            });
            if (result.isConfirmed) {
                this.exportToExcel();
            } else if (result.dismiss === this.$swal.DismissReason.cancel) {
                this.toast.info("Đã hủy thao tác xuất Excel.");
            }
        },
        async exportToExcel() {
            const toast = useToast(); 
            try {
                // Lấy token từ cookie
                const token = Cookies.get('token');
                
                // Kiểm tra xem token có tồn tại không
                if (!token) {
                    toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                    console.error('Authentication token not found.');
                    return; // Ngừng thực hiện hàm nếu không có token
                }

                const response = await axios.get('/api/khach-hang/export-excel', {
responseType: 'blob', 
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', 'DanhSachKhachHang.xlsx'); 
                document.body.appendChild(link);
                link.click(); 
                link.remove(); 
                window.URL.revokeObjectURL(url); 

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





