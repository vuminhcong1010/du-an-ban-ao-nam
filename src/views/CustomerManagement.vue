  <template>
    <div class=" full-width-container">
      <div class="d-flex align-items-center justify-content-between bg-white p-3 rounded mb-3 border">
        <h2 class="fw-bold mb-0">Quản lý khách hàng</h2>
        <div class="d-flex gap-2">
          <button class="btn file-btn me-2" @click="showConfirmExport">
            <Upload class="me-1" size="16" /> Xuất Excel
          </button>
          <button @click="navigateToAddCustomer" style="
              background-color: #0a2c57;
              color: white;
              border: none;
              border-radius: 5px;
            ">
            <Plus class="me-1" size="16" /> Thêm khách hàng
          </button>
        </div>
      </div>

      <div class="bg-white p-3 rounded mb-3 border">
        <SearchAndFilterKhachHang :value="searchQuery" :filter-data="filterData" @search="handleSearch"
          @filterApplied="handleFilter" />
      </div>

      <div class="bg-white p-3 rounded mb-4 border">
        <h5 class="text-start ps-3 pt-3">Danh sách khách hàng</h5>
        <KhachHangTable :reload="reloadTable" :search-query="searchQuery" :filter-data="filterData"
          @delete-customer="confirmDeleteCustomer" />
      </div>
    </div>
  </template>

  <script>
  import { Upload, Plus } from "lucide-vue-next";
  import Cookies from "js-cookie";
  import { useToast } from "vue-toastification";
  import KhachHangTable from "../components/admin/KhachHangTable.vue";
  import SearchAndFilterKhachHang from "@/components/admin/SearchAndFilterKhachHang.vue";
  import { useRouter } from "vue-router";
  import axios from "axios";

  export default {
    name: "CustomerManagement",
    components: {
      KhachHangTable,
      SearchAndFilterKhachHang,
      Upload,
      Plus,
    },
    setup() {
      const router = useRouter();
      const navigateToAddCustomer = () => {
        router.push({ name: "AddKhachHang" });
      };
      return { navigateToAddCustomer };
    },
    data() {
      return {
        reloadTable: false,
        searchQuery: "",
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
      async confirmDeleteCustomer(customerId) {
        const toast = useToast();
        const result = await this.$swal.fire({
          title: "Xác nhận xóa?",
          text: "Bạn có chắc chắn muốn xóa khách hàng này không? Hành động này không thể hoàn tác!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#dc3545",
          cancelButtonColor: "#6c757d",
          confirmButtonText: "Có, xóa ngay!",
          cancelButtonText: "Hủy bỏ",
          reverseButtons: true,
          customClass: {
            container: "my-swal-container",
            popup: "my-swal-popup",
            title: "my-swal-title",
            content: "my-swal-content",
            confirmButton: "my-swal-delete-button",
            cancelButton: "my-swal-cancel-button",
          },
        });
        if (result.isConfirmed) {
          try {
            const token = Cookies.get("token");
            if (!token) {
              toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
              console.error("Authentication token not found.");
              return;
            }
            await axios.delete(`/api/khach-hang/${customerId}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            toast.success("Xóa khách hàng thành công!");
            this.reloadTableData();
          } catch (error) {
            console.error("Lỗi khi xóa khách hàng:", error);
            if (
              error.response &&
              error.response.data &&
              error.response.data.message
            ) {
              toast.error(
                "Lỗi khi xóa khách hàng: " + error.response.data.message
              );
            } else {
              toast.error("Lỗi khi xóa khách hàng. Vui lòng thử lại.");
            }
          }
        } else if (result.dismiss === this.$swal.DismissReason.cancel) {
          toast.info("Đã hủy thao tác xóa khách hàng.");
        }
      },
      reloadTableData() {
        this.reloadTable = true;
        setTimeout(() => {
          this.reloadTable = false;
        }, 100);
      },
      async showConfirmExport() {
        const result = await this.$swal.fire({
          title: "Xác nhận xuất Excel?",
          text: "Bạn có chắc chắn muốn xuất danh sách khách hàng ra Excel không?",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#0a2c57",
          cancelButtonColor: "#d33",
          confirmButtonText: "Có, xuất ngay!",
          cancelButtonText: "Hủy bỏ",
          reverseButtons: true,
          customClass: {
            container: "my-swal-container",
            popup: "my-swal-popup",
            title: "my-swal-title",
            content: "my-swal-content",
            confirmButton: "my-swal-confirm-button",
            cancelButton: "my-swal-cancel-button",
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
          const token = Cookies.get("token");
          if (!token) {
            toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            console.error("Authentication token not found.");
            return;
          }
          const response = await axios.get("/api/khach-hang/export-excel", {
            responseType: "blob",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "DanhSachKhachHang.xlsx");
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
          setTimeout(() => {
            toast.success(
              "Yêu cầu xuất Excel đã được gửi. Vui lòng kiểm tra mục tải xuống của trình duyệt!"
            );
          }, 1500);
        } catch (error) {
          console.error("Lỗi khi xuất Excel:", error);
          toast.error("Lỗi khi xuất Excel. Vui lòng thử lại.");
        }
      },
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
    border: none;
    box-shadow: none;
  }

  /* Thêm hiệu ứng hover cho icon */
  .icon {
    width: 32px;
    height: 32px;
    transition: transform 0.3s ease, background-color 0.3s ease,
      border-radius 0.3s ease;
    padding: 5px;
    border-radius: 50%;
  }

  /* Hiệu ứng hover khi di chuột qua icon */
  .icon:hover {
    background-color: gray;
    transform: scale(1.3);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .add {
    margin-left: auto;
  }

  .my-swal-popup {
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    padding: 30px;
  }

  .my-swal-title {
    color: #0a2c57;
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
    border-radius: 5px !important;
    font-weight: bold;
    padding: 10px 20px;
  }

  .my-swal-confirm-button:hover {
    background-color: #061a38 !important;
  }

  .my-swal-cancel-button {
    background-color: #dc3545 !important;
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

  h2,
  h5 {
    font-weight: bold;
    color: #0a2c57;
  }

  .btn {
    border-radius: 0.25rem;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-outline-primary {
    color: #0a2c57;
    border: 1px solid #0a2c57;
  }

  .btn-outline-primary:hover {
    background-color: #0a2c57;
    color: white;
  }

  .btn.success {
    background-color: #0a2c57;
    color: white;
  }

  .btn.success:hover {
    background-color: #072140;
  }

  .custom-btn {
    background-color: #f0f0f0;
    color: #0a2c57;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .file-btn {
      background-color: transparent;
      border: none;
      color: #0a2c57;
  }

  .file-btn:hover {
      background-color: #0a2c57;
      color: white;
  }
  </style>