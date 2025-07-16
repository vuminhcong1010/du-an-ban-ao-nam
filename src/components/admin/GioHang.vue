<script setup>
import { ref } from "vue";
import { Plus, Trash } from "lucide-vue-next";
import ThemSanPham from "./ThemSanPhamBanHang.vue";

const props = defineProps({
  order: Object,
  activeTab: Number,
  orders: Array,
});

const hienThiThemSanPham = ref(false);

const moPopupThemSanPham = () => {
  hienThiThemSanPham.value = true;
};

const nhanSanPhamDaChon = (danhSachSanPham) => {
  if (props.order) {
    props.order.listSanPham.push(...danhSachSanPham);
  }
};

const xoaSanPhamKhoiDonHang = (index) => {
  props.order.listSanPham.splice(index, 1);
};
</script>

<template>
  <div class="bg-white p-3 rounded mb-4 align-items-center border">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">🛒 Giỏ hàng</h5>
      <button
        class="btn border rounded-circle d-flex align-items-center justify-content-center"
        style="width: 36px; height: 36px; background-color: #0a2c57; color: white"
        @click="moPopupThemSanPham"
        title="Thêm sản phẩm"
      >
        <Plus size="20" />
      </button>
    </div>

    <div class="table-responsive bg-light rounded">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>STT</th>
            <th>Ảnh</th>
            <th>Thông tin chung</th>
            <th>Chi tiết</th>
            <th>Số lượng</th>
            <th>Giá bán</th>
            <th>Thành tiền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in order.listSanPham" :key="index">
            <td>{{ index + 1 }}</td>
            <td></td>
            <td>{{ item.idSanPham.tenSanPham }}</td>
            <td>
              <span>Size: {{ item.idSize.soCo }}</span> <br />
              <span>Màu sắc: {{ item.idMau.ten }}</span>
            </td>
            <td>
              <input
                type="number"
                class="form-control text-center"
                style="width: 70px"
                min="1"
                v-model.number="item.soLuong"
              />
            </td>
            <td>{{ item.gia.toLocaleString() }}đ</td>
            <td>{{ (item.gia * item.soLuong).toLocaleString() }}đ</td>
            <td>
              <button
                class="btn p-1 border-0 bg-transparent d-flex align-items-center justify-content-center mx-auto"
                @click="xoaSanPhamKhoiDonHang(index)"
              >
                <Trash style="width: 16px; height: 16px; color: #0a2c57" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ThemSanPham
      v-if="hienThiThemSanPham"
      :maHoaDon="order.maHoaDon"
      @selected="nhanSanPhamDaChon"
      @close="hienThiThemSanPham = false"
    />
  </div>
</template>