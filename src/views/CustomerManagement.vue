<template>
  <div class="mt-4 px-3">
    <!-- Thẻ nổi (card) -->
    <div class="bg-white p-3 rounded shadow mb-4">
      <!-- Component AddKhachHang -->
      <AddKhachHang @added="handleAdded" />
      <!-- Bảng hiển thị khách hàng -->
      <KhachHangTable :khachHangs="khachHangs" />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import KhachHangTable from '../components/admin/KhachHangTable.vue';
import AddKhachHang from '../components/admin/AddKhachHang.vue';
import axios from 'axios';

export default {
  name: 'ParentComponent',
  components: {
    KhachHangTable,
    AddKhachHang,
  },
  setup() {
    const khachHangs = ref([]); // 👈 tạo biến lưu danh sách KH

    // ✅ Hàm load danh sách khách hàng
    const loadData = async () => {
      try {
        const response = await axios.get('/api/khach-hang');
        khachHangs.value = response.data;
      } catch (error) {
        console.error('Lỗi khi load KH:', error);
      }
    };

    // ✅ Hàm xử lý khi thêm thành công
    const handleAdded = () => {
      loadData(); // load lại dữ liệu bảng
    };

    // ✅ Gọi load dữ liệu khi component được mount
    onMounted(() => {
      loadData();
    });

    return {
      khachHangs,
      loadData,
      handleAdded,
    };
  },
};
</script>


<style scoped>
/* Các kiểu CSS cho component cha */
</style>
