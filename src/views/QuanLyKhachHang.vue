<template>
    <div class="mt-4 px-3">
        <div class=" bg-white p-3 rounded shadow mb-4 ">
            <ThemKhachHang @added="handleAdded" :reload="reloadTable" />
        </div>
        <!-- Bảng khách hàng -->
        <div class=" bg-white p-3 rounded shadow mb-4 ">
            <h4>Quản lý khách hàng</h4>
            <!-- <KhachHangTable :reload="reloadTable" :search-query="searchQuery" :filter-data="filterData" /> -->
            <BangKhachHang />
        </div>
    </div>
</template>

<script>
import BangKhachHang from '../components/admin/BangKhachHang.vue';
import ThemKhachHang from '@/components/admin/ThemKhachHang.vue';

export default {
    components: {
        BangKhachHang,  // Đảm bảo component đã được import và đăng ký đúng
        ThemKhachHang,  // Component để thêm khách hàng
    },
    data() {
        return {
            reloadTable: false, // Biến để reload bảng khách hàng
            searchQuery: '',  // Biến để lưu trữ truy vấn tìm kiếm  

            showFilter: false, // Biến để điều khiển hiển thị popup lọc
            filterData: {} // Biến để lưu trữ dữ liệu lọc
        };
    },
    methods: {
        // Hàm này sẽ được gọi khi thêm khách hàng thành công
        handleAdded() {
            this.reloadTable = true; // Kích hoạt reload
        },
    },
    watch: {
    reloadTable(newVal) {
        if (newVal) {
            this.loadCustomers();  // Gọi API để lấy lại danh sách khách hàng
            this.reloadTable = false;  // Reset lại reload sau khi hoàn thành
        }
    }
}
};
</script>