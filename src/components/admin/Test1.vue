<template>
  <div class="text-center">
    <canvas ref="qrCanvas"></canvas>
    <br />
    <button @click="taiQR" class="btn btn-success mt-2">Tải mã QR</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'

const qrCanvas = ref(null)
const maSanPham = 'SP123456' // Mã sản phẩm muốn tạo QR

// Hàm tạo mã QR
const taoQR = async (ma) => {
  if (!qrCanvas.value) return

  try {
    // Tạo mã QR trên canvas
    await QRCode.toCanvas(qrCanvas.value, ma, {
      width: 200,
      color: {
        dark: '#000000', // Màu tối của mã QR
        light: '#ffffff' // Màu sáng của mã QR
      }
    })
  } catch (err) {
    console.error('Lỗi tạo mã QR:', err)
  }
}

// Hàm tải mã QR về máy
const taiQR = () => {
  if (!qrCanvas.value) return

  // Tạo đường dẫn tải về
  const link = document.createElement('a')
  link.href = qrCanvas.value.toDataURL('image/png') // Chuyển canvas thành hình ảnh PNG
  link.download = `${maSanPham}.png` // Đặt tên tệp khi tải về
  link.click() // Thực hiện tải xuống
}

// Gọi khi component được mount
onMounted(() => {
  taoQR(maSanPham) // Gọi hàm tạo mã QR khi component được mount
})
</script>

<style scoped>
/* Thêm các style cho canvas hoặc button nếu cần */
</style>
