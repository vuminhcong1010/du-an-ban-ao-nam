<template>
  <div class="gio-hang-page">
    <CartDetail
      :danhSachGio="danhSachGio"
      @update:danhSachGio="capNhatGioHangLocal"
      @capNhatGio="capNhatGioHang"
    />
  </div>
</template>

<script>
import CartDetail from '@/components/client/CartDetail.vue'
import axios from 'axios'

export default {
  components: { CartDetail },
  data() {
    return {
      danhSachGio: []
    }
  },
  created() {
    this.capNhatGioHang()
  },
  methods: {
    async capNhatGioHang() {
      try {
        const res = await axios.get('http://localhost:8080/client/LoadSanPham', {
          withCredentials: true
        })

        const data = Array.isArray(res.data) ? res.data : []
        this.danhSachGio = data
      } catch (err) {
        console.error('Lỗi khi lấy giỏ hàng:', err)
        this.danhSachGio = []
      }
    },
    capNhatGioHangLocal(newDanhSach) {
      this.danhSachGio = newDanhSach
    }
  }
}
</script>

<style scoped>
.gio-hang-page {
background-color: #F3F4F6;
margin: 50px auto;
}
</style>
