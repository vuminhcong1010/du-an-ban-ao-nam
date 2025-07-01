<template>
  <div>
    <div id="reader" style="width: 320px; margin: 0 auto;"></div>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, defineEmits } from 'vue'
import { Html5QrcodeScanner } from 'html5-qrcode'

const emit = defineEmits(['scanned'])
let scanner = null

const parseCCCDQR = (raw) => {
  let parts = raw.includes('@') ? raw.split('@') : raw.split('|')
  if (parts.length < 5) return null
  // Lấy mã CCCD ở phần tử 0
  let cccd = parts[0] || ''
  // Ngày sinh ddMMyyyy -> yyyy-MM-dd
  let ngaySinh = ''
  if (parts[3] && parts[3].length === 8) {
    const dd = parts[3].slice(0,2)
    const mm = parts[3].slice(2,4)
    const yyyy = parts[3].slice(4,8)
    ngaySinh = `${yyyy}-${mm}-${dd}`
  }
  return {
    cccd,
    hoTen: parts[2] || '',
    ngaySinh,
    gioiTinh: parts[4] || '',
    queQuan: parts[5] || ''
  }
}

onMounted(() => {
  scanner = new Html5QrcodeScanner('reader', { fps: 10, qrbox: 250 }, false)
  scanner.render((decodedText) => {
    const data = parseCCCDQR(decodedText)
    if (!data || !data.cccd) {
      alert('Không nhận diện được mã QR hợp lệ. Vui lòng đưa CCCD lại gần camera, đảm bảo đủ sáng và rõ nét!')
      return
    }
    emit('scanned', data)
    scanner.clear()
  }, (err) => {
    // Hiển thị lỗi tiếng Việt khi không quét được
    if (typeof err === 'string' && err.includes('No MultiFormat Readers')) {
      const errorDiv = document.querySelector('#reader .qr-error-vi')
      if (!errorDiv) {
        const div = document.createElement('div')
        div.className = 'qr-error-vi'
        div.style.color = 'red'
        div.style.margin = '8px 0'
        div.innerText = 'Không nhận diện được mã QR. Vui lòng đưa CCCD lại gần camera, đảm bảo đủ sáng và rõ nét!'
        document.querySelector('#reader').prepend(div)
      }
    }
  })
  // Đổi text các nút sang tiếng Việt sau khi render
  setTimeout(() => {
    const btn = document.querySelector('#reader button')
    if (btn && btn.innerText.includes('Request Camera Permissions')) btn.innerText = 'Yêu cầu quyền truy cập camera'
    const link = document.querySelector('#reader a')
    if (link && link.innerText.includes('Scan an Image File')) link.innerText = 'Quét từ ảnh'
  }, 500)
})

onBeforeUnmount(() => {
  if (scanner) scanner.clear()
})
</script> 