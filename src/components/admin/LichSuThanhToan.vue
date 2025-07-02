<script setup>
defineProps(['lichSuThanhToan'])
defineEmits(['close'])
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content p-3">
        <div class="modal-header">
          <h5 class="modal-title">Lịch sử thanh toán</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>STT</th>
                <th>Mã giao dịch</th>
                <th>Số tiền</th>
                <th>Thời gian</th>
                <th>Phương thức thanh toán</th>
                <th>Ghi chú</th>
                <th>Nhân viên</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              <tr >
                <td>1</td>
                <td>MAXH01</td>
                <td>4.000.000đ</td>
                <td>2025-06-07 28:13</td>
                <td>Chuyển khoản</td>
                <td>admin</td>
                <td>Nguyễn Văn Mạnh</td>
                <td>Đã thanh toán</td>
              </tr>
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  </div>
</template>
