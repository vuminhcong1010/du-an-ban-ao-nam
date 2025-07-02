<script setup>
defineProps(['lichSu'])
defineEmits(['close'])
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)">
    <div class="modal-dialog modal-lg">
      <div class="modal-content p-3">
        <div class="modal-header">
          <h5 class="modal-title">Lịch sử hóa đơn</h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <ul>
            <li v-for="item in lichSu" :key="item.id">
              #{{ item.nguoiThucHien }} – {{ item.ghiChu }} – {{ item.thoiGianThayDoi }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
