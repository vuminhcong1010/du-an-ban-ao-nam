
<template> 
      <div class="bg-white p-3 rounded shadow mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold">Bộ lọc</h5>
        </div>
        <label class="ps-4 pt-3">Tìm kiếm</label>
        <div class="container rounded d-flex align-items-center gap-2 m-2 me-5">
          
          <input type="text" class="form-control" placeholder="Tìm Kiếm Theo Giá" style="width: 40%">
          <button class="btn text-white" style="background-color: #0a2c57;color: white;">Tìm Kiếm</button>
          <button class="btn btn-light">Làm Mới</button>
          </div>
      </div>
       

        <div class="bg-white p-3 rounded shadow mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold m-0">Quản lý chất liệu</h5>
          <button class="btn" data-bs-toggle="modal" data-bs-target="#exampleModal" style="background-color: #0a2c57;">
            <Plus size="18" style="color: white;" />
          </button>
        </div>

        <table class="table table-hover text-center align-middle">
          
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Tên SP</th>
              <th>Màu</th>
              <th>Kích cỡ</th>
              <th>Số lượng</th>
              <th>Giá</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(ds, index) in res">
              <td>{{ index + 1 }}</td>
              <td>{{ ds.idSanPham.tenSanPham }}</td>
              <td>{{ ds.idMau.ten }}</td>
              <td>{{ ds.idSize.soCo }}</td>
              <td>{{ ds.soLuong }}</td>
              <td>{{ ds.gia }}</td>
              <td>
                <span v-if="ds.trangThai === 1" class="text-success">Đang bán</span>
                <span v-else class="text-danger">Ngừng bán</span>
              </td>
              <td>
                <Trash class="me-3" style="color: #CC0000;" @click="remove(ds.id)"></Trash>
                <Eye class="me-3" data-bs-toggle="modal" data-bs-target="#exampleModal" @click="moModal(ds.id)" style="color: #0a2c57;"></Eye>
                <Edit data-bs-toggle="modal" data-bs-target="#exampleModal2" @click="save(ds.id)" style="color: #66FF99"></Edit>
              </td>
            </tr>
          </tbody>
        </table>

    </div>
<!-- modal add -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-xl">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Thêm chất liệu</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <component
        :is="UpdateSanPham"
      :idChiTietSanPham="send"
    />
      </div>
    </div>
  </div>
</div>
</template>
<script setup>
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import { Eye,Plus,Trash,Delete, Edit } from 'lucide-vue-next';

import UpdateSanPham from './UpdateSanPham.vue';
let res = ref({});



const route = useRoute()
let idChiTietSanPham = Number(route.params.id1)
let send = ref(null)


onMounted(() => {
  axios.get(`http://localhost:8080/san-pham/bien-the-san-pham/${idChiTietSanPham}`).then(response => {
    res.value = response.data;
  });
});
function moModal(id) {
  console.log(id); 
  send.value = id
}
</script>
