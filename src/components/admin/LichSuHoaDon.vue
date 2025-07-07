<script setup>
defineProps(['lichSu'])
defineEmits(['close'])


</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
  <div class="modal-dialog" style="max-width: 1000px">
    <div class="modal-content p-3">
      <div class="modal-header">
        <h5 class="modal-title">Lịch sử hóa đơn</h5>
        <button type="button" class="btn-close" @click="$emit('close')"></button>
      </div>
      <div class="modal-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>STT</th>
                <th>Người thực hiện</th>
                <th>Nội dung</th>
                <th>Ghi chú</th>
                <th>Thời gian</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in lichSu" :key="item.id">
                <td>{{ index + 1 }}</td>
                <td>{{ item.nguoiThucHien }}</td>
                <td>{{ item.noiDungThayDoi }}</td>
                <td>{{ item.ghiChu }}</td>
                <td>{{ new Date(item.thoiGianThayDoi).toLocaleString("vi-VN") }}</td>
              </tr>
              <tr v-if="lichSu.length === 0">
                <td colspan="4" class="text-center text-muted">Chưa có lịch sử thay đổi</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
</template>