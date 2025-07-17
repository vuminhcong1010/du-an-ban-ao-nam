<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Eye,Plus,Trash,Delete, Edit } from 'lucide-vue-next';
import Cookies from 'js-cookie'

const token = Cookies.get('token')
let page = ref();
const res = ref();
let save = (id) =>{
  req.value.id = id
}
let req = ref({
  id: "",
  maKieuAo: "",
  tenKieuAo: ""
});
let details = ref({
  id: "",
  maKieuAo: "",
  tenKieuAo: ""
});
onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8080/kieu-ao",{
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
    res.value = response.data.data;
    page.value = Math.ceil(response.data.size/10)
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
});
const add = () =>{
    axios.post("http://localhost:8080/kieu-ao/add",req.value,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/10)
      reset()
    }).catch (err =>{
       console.log(err);
    })    
}

const update = () =>{
    console.log(req.value)
    axios.post("http://localhost:8080/kieu-ao/update",req.value,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/10)
      reset()
    }).catch (err =>{
       console.log(err);
    })    
}

const remove = (id) =>{
    axios.get(`http://localhost:8080/kieu-ao/delete/${id}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/10)
    }).catch (err =>{
       console.log(err);
    })    
}
const detail = (id) =>{
    
    axios.get(`http://localhost:8080/kieu-ao/detail/${id}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(Response =>{
      details.value = Response.data
    }).catch (err =>{
       console.log(err);
    })    
}
const paging = (id) =>{
    axios.get(`http://localhost:8080/kieu-ao/${id}`,{
    headers: {
      Authorization: `Bearer ${token}`
    }
  }).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/10)
    })
}
function reset(){
  req.value = {
        id: "",
        maKieuAo: "",
        tenKieuAo: "",
  }
}

</script>

<template>
  <div class="">
     
    <div class="bg-white p-3 rounded border mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="fw-semibold">Quản lý kiểu áo:</h5>
            <button class="btn" data-bs-toggle="modal" data-bs-target="#exampleModal" style="background-color: #0a2c57;">
          <Plus size="18" style="color: white;" />
        </button>
          </div>
            
        </div>
        <div class="bg-white p-3 rounded border mb-4">
          
          <div class="row g-3 align-items-end">
    <!-- Tìm kiếm -->
    <div class="col-12">
      <label class="form-label fw-bold">Bộ lọc</label>
      <input type="text" class="form-control" placeholder="Tìm theo mã, tên">
    </div>

   


  </div>
        </div>
     
      <div class="bg-white p-3 rounded border mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-semibold m-0">Danh sách kiểu áo</h5>

      </div>
      <table class="table table-hover text-center align-middle">
        <thead class="table-light">
        <tr>
          <th>STT</th>
          <th>Mã kiểu áo</th>
          <th>Tên kiểu áo</th>
          <th>Action</th>
      </tr>
        </thead>
        <tbody>
          <tr v-for="(ds, index) in res ">
            <td>{{ index + 1 }}</td>
            <td>{{ ds.maKieuAo }}</td>
            <td>{{ ds.tenKieuAo }}</td>
            <td>
              <Trash class="me-3" style="color: #CC0000;" @click="remove(ds.id)"></Trash>
              <Eye class="me-3" data-bs-toggle="modal" data-bs-target="#exampleModal1" @click="detail(ds.id)" style="color: #0a2c57;"></Eye>
              <Edit data-bs-toggle="modal" data-bs-target="#exampleModal2" @click="save(ds.id)" style="color: #66FF99"></Edit>
            </td>
            </tr>
            </tbody>
          </table>
        </div>
  </div>
  <nav aria-label="Page navigation example">
  <ul class="pagination">
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Previous">
        <span aria-hidden="true">&laquo;</span>
      </a>
    </li>
    <li class="page-item" v-for="ds in page"><a class="page-link" @click="paging(ds)">{{ ds }}</a></li>
    <li class="page-item">
      <a class="page-link" href="#" aria-label="Next">
        <span aria-hidden="true">&raquo;</span>
      </a>
        </li>
    </ul>
  </nav>
  <!-- modal add -->
  <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Thêm Kiểu Áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3" >
          <label for="form1" class="form-label">Tên Kiểu Áo</label>
          <input type="text" class="form-control" id="form1" v-model="req.tenKieuAo">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        <button type="button" class="btn btn-primary" @click="add" data-bs-dismiss="modal">Thêm </button>
      </div>
    </div>
  </div>
</div>

<!-- modal update -->
<div class="modal fade" id="exampleModal2" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Cập nhật thông tin Kiểu Áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
        <input type="hidden" v-model="req.id">
        <label for="form1" class="form-label">Tên Kiểu Áo</label>
        <input type="text" class="form-control" id="form1" v-model="req.tenKieuAo">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="update">Thêm </button>
      </div>
    </div>
  </div>
</div>

<!-- modal detail -->
<div class="modal fade" id="exampleModal1" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Thông tin Kiểu Áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
        <label for="form" class="form-label">Mã Kiểu Áo</label>
        <input type="text" class="form-control" id="form" v-model="details.maKieuAo" readonly>

        <label for="form1" class="form-label">Tên Kiểu Áo</label>
        <input type="text" class="form-control" id="form1" v-model="details.tenKieuAo" readonly>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
      </div>
    </div>
  </div>
</div>
</template>
