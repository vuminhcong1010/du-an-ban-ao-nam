<script setup>
import { onMounted,ref,defineAsyncComponent } from 'vue';
import axios from 'axios';
import { Eye,Plus,Trash,Delete, Edit } from 'lucide-vue-next';

  let res = ref()
  onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8080/san-pham");
    res.value = response.data
    console.log(res.value); 
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
});
const remove = (id) =>{
  axios.get(`http://localhost:8080/san-pham/delete/${id}`).then(Response =>{
    res.value = Response.data
    console.log(res.value); 
  })
}
const paging = (id) =>{
  axios.get(`http://localhost:8080/san-pham/${id}`).then(Response =>{
    res.value = Response.data
    console.log(res.value); 
  })
}

const chuyenTrang = (id) =>{
  window.location.href = `/san-pham/chi-tiet-san-pham/${id}`;
}
</script>
<template>
      <div class="container my-4">
        <div class="bg-white p-3 rounded shadow mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-semibold">Danh Sách Sản Phẩm</h5>
          </div>
          <label class="ps-4 pt-3">Tìm kiếm</label>
          <div class="container rounded  d-flex align-items-center gap-2 m-2 me-5">
        <input type="text" class="form-control" placeholder="Tìm Kiếm Theo Giá" style="width: 40%">
        <button class="btn text-white" style="background-color: #0a2c57;color: white;">Tìm Kiếm</button>

            <!-- <div class="btn-group ms-5" role="group">
              <button type="button" class="btn btn-outline-primary active">Thương hiệu</button>
              <button type="button" class="btn btn-outline-secondary">trạng thái</button>
            </div> -->
             
          </div>
        </div>
        
        <div class="bg-white p-3 rounded shadow mb-4">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h5 class="fw-semibold">Danh sách sản phẩm</h5>
            <a href="/san-pham/add" class="btn ms-auto" style="background-color: #0a2c57;color: white;"><i class="fa-solid fa-plus"></i></a> 
          </div>
           

     
    <table class="table table-hover text-center align-middle">
      <!-- <colgroup>
              <col style="width: 5%; height: 5%;">
              <col style="width: 10%;">
              <col style="width: 15%;">  
              <col style="width: 10%;"> 
              <col style="width: 15%;">
              <col style="width: 20%;">
            </colgroup> -->
      <thead class="table-light">
        <tr>
          <th>STT</th>
          <th>Mã Sản phẩm</th>
          <th>Tên sản phẩm</th>
          <th>Chất liệu</th>
          <th>Trạng thái</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ds, index) in res">
          <td>{{ index + 1 }}</td>
          <td>{{ ds.maSanPham }}</td>
          <td>{{ ds.tenSanPham }}</td>
          <td>{{ ds.idChatLieu.tenChatLieu }}</td>
          <td> <span class="badge rounded-pill text-bg" style="background-color: #3B82F6">
            {{ ds.trangThai==1?'Đang bán':'Ngừng bán' }}</span>
          </td>
          <td>
            <Trash class="me-3" style="color: #CC0000;" @click="remove(ds.id)"></Trash>
            <Eye class="me-3" @click="chuyenTrang(ds.id)" style="color: #0a2c57;"></Eye>
            <Edit data-bs-toggle="modal" data-bs-target="#exampleModal2" @click="save(ds.id)" style="color: #66FF99"></Edit>
          </td>
        </tr>
      </tbody>
    </table>

        </div>

  </div>
</template>
