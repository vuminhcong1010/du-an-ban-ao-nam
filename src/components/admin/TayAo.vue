<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Eye,Plus,Trash,Delete, Edit } from 'lucide-vue-next';
let page = ref();
const res = ref();
let save = (id) =>{
  req.value.id = id
}
let req = ref({
  id: "",
  maTayAo: "",
  tenTayAo: ""
});
let details = ref({
  id: "",
  maTayAo: "",
  tenTayAo: ""
});
onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8080/tay-ao");
    res.value = response.data.data;
    page.value = Math.ceil(response.data.size/5)
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
});
const add = () =>{    
    axios.post("http://localhost:8080/tay-ao/add",req.value).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/5)
      reset()
    }).catch (err =>{
       console.log(err);
    })    
}

const update = () =>{
    console.log(req.value)
    axios.post("http://localhost:8080/tay-ao/update",req.value).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/5)
      reset()
    }).catch (err =>{
       console.log(err);
    })    
}

const remove = (id) =>{
    axios.get(`http://localhost:8080/tay-ao/delete/${id}`).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/5)
    }).catch (err =>{
       console.log(err);
    })    
}
const detail = (id) =>{
    
    axios.get(`http://localhost:8080/tay-ao/detail/${id}`).then(Response =>{
      details.value = Response.data
    }).catch (err =>{
       console.log(err);
    })    
}
const paging = (id) =>{
    axios.get(`http://localhost:8080/tay-ao/${id}`).then(Response =>{
    res.value = Response.data.data
    page.value = Math.ceil(Response.data.size/5);
    })
}
function reset(){
  req.value = {
        id: "",
        maTayAo: "",
        tenTayAo: "",
  }
}
</script>

<template>
  <div class="">
      
    <div class="bg-white p-3 rounded border mb-4">
          <div class="d-flex justify-content-between align-items-center">
            <h5 class="fw-semibold">Quản lý tay áo:</h5>
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
        <h5 class="fw-semibold m-0">Danh sách tay áo</h5>

      </div>
      <table class=" table table-hover text-center align-middle">
        <thead class="table-light">
        <tr>
          <th>STT</th>
          <th>Mã tay áo</th>
          <th>Tên tay áo</th>
          <th>Action</th>
      </tr>
        </thead>
        <tbody>
          <tr v-for="(ds, index) in res ">
            <td>{{ index + 1 }}</td>
            <td>{{ ds.maTayAo }}</td>
            <td>{{ ds.tenTayAo }}</td>
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
        <h1 class="modal-title fs-5" id="exampleModalLabel">Thêm tay áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">

        <label for="form1" class="form-label">Tên tay áo</label>
        <input type="text" class="form-control" id="form1" v-model="req.tenTayAo">
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
        <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="add">Thêm </button>
      </div>
    </div>
  </div>
</div>

<!-- modal update -->
<div class="modal fade" id="exampleModal2" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="exampleModalLabel">Cập nhật thông tin tay áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
        <input type="hidden" v-model="req.id">

        <label for="form1" class="form-label">Tên tay áo</label>
        <input type="text" class="form-control" id="form1" v-model="req.tenTayAo">
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
        <h1 class="modal-title fs-5" id="exampleModalLabel">Thông tin tay áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
        <label for="form" class="form-label">Mã tay áo</label>
        <input type="text" class="form-control" id="form" v-model="details.maTayAo" readonly>

        <label for="form1" class="form-label">Tên tay áo</label>
        <input type="text" class="form-control" id="form1" v-model="details.tenTayAo" readonly>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
      </div>
    </div>
  </div>
</div>
</template>
