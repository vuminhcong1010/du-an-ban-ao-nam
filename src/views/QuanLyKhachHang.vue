<template>
    <div class="mt-4 px-3">
        <div class="bg-white p-3 rounded shadow mb-4">
            <ThemKhachHang @added="handleAdded" :reload="reloadTable" />
        </div>

        <!-- Bảng khách hàng -->
        <div class="bg-white p-3 rounded shadow mb-4">
            <h4>Quản lý khách hàng</h4>
            <SearchKhachHang :value="searchQuery" :page="page" :size="size" @search="handleSearch" />
            <LocKhachHang @filterApplied="handleFilterApplied" />
            <BangKhachHang :reload="reloadTable" :search-query="searchQuery" :khach-hangs-input="searchResultList"
                :filter-data="filterData" />
        </div>
    </div>
</template>

<script>
import SearchKhachHang from "@/components/admin/SearchKhachHang.vue";
import LocKhachHang from "@/components/admin/LocKhachHang.vue";
import BangKhachHang from "../components/admin/BangKhachHang.vue";
import ThemKhachHang from "@/components/admin/ThemKhachHang.vue";

export default {
    components: {
        SearchKhachHang,
        LocKhachHang,
        BangKhachHang,
        ThemKhachHang,
    },
    data() {
        return {
            reloadTable: false,
            searchQuery: '',
            searchResultList: [],
            filterData: {}, // Bộ lọc dữ liệu
            page: 0,
            size: 10
        };
    },
    methods: {
        handleAdded() {
            this.reloadTable = true;
        },
        handleSearch(searchResult) {
            this.searchResultList = searchResult;  // Nhận kết quả tìm kiếm từ component con
        },
        handleFilterApplied(filter) {
            console.log("Bộ lọc nhận được:", filter);  // Kiểm tra bộ lọc nhận được
            this.filterData = filter;  // Nhận bộ lọc từ LocKhachHang
            this.page = 0;  // Reset trang khi thay đổi bộ lọc
            this.loadCustomers(); // Tải lại dữ liệu với bộ lọc mới
        },
    }
    };
</script>
