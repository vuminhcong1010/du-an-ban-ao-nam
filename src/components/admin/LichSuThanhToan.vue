<script setup>
defineProps(["lichSuThanhToan"]);
defineEmits(["close"]);

function formatCurrency(value) {
  if (!value) return '0đ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value);
}

function formatDatetime(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString('vi-VN');
}
</script>

<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    style="background: rgba(0, 0, 0, 0.5)"
  >
    <div class="modal-dialog modal-lg">
      <div class="modal-content p-3">
        <div class="modal-header">
          <h5 class="modal-title">Lịch sử thanh toán</h5>
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
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
                <tr v-for="(item, index) in lichSuThanhToan" :key="item.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.idHinhThucThanhToan.maHinhThuc }}</td>
                  <td>{{ formatCurrency(item.idHinhThucThanhToan.soTien) }}</td>
                  <td>{{ formatDatetime(item.idHinhThucThanhToan.ngayTao) }}</td>
                  <td>{{ item.idHinhThucThanhToan.phuongThucThanhToan }}</td>
                  <td>{{ item.ghiChu || "Khong co ghi chu" }}</td>
                  <td>{{ item.idHoaDon.idNhanVien.tenNhanVien || "Ko có NNhanVieen " }}</td>
                  <td>
                    {{
                      item.idHinhThucThanhToan.trangThai === 0
                        ? "Đã thanh toán"
                        : "Chưa thanh toán"
                    }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>