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

// Hàm tạo QR
const taoQR = async (ma) => {
  if (!qrCanvas.value) return

  try {
    await QRCode.toCanvas(qrCanvas.value, ma, {
      width: 200,
      color: {
        dark: '#000',
        light: '#fff'
      }
    })
  } catch (err) {
    console.error('Lỗi tạo mã QR:', err)
  }
}

// Hàm tải QR về máy
const taiQR = () => {
  if (!qrCanvas.value) return

  const link = document.createElement('a')
  link.href = qrCanvas.value.toDataURL('image/png')
  link.download = `${maSanPham}.png`
  link.click()
}

// Gọi khi mount
onMounted(() => {
  taoQR(maSanPham)
})
</script>
