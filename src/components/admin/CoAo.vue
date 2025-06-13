<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { Eye,Plus,Trash,Delete, Edit } from 'lucide-vue-next';

const res = ref();
let page = ref();
let save = (id) =>{
  req.value.id = id
}
let req = ref({
  id: "",
  maCoAo: "",
  tenCoAo: ""
});
let details = ref({
  id: "",
  maCoAo: "",
  tenCoAo: ""
});
onMounted(async () => {
  try {
    const response = await axios.get("http://localhost:8080/co-ao");
    res.value = response.data.data;
    page.value = Math.ceil(response.data.size/10)
  } catch (err) {
    console.error("Lỗi khi gọi API:", err);
  }
});
const add = () =>{
    axios.post("http://localhost:8080/co-ao/add",req.value).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/10)
      reset()
    }).catch (err =>{
       console.log(err);
    })    
}

const update = () =>{
    console.log(req.value)
    axios.post("http://localhost:8080/co-ao/update",req.value).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/10)
      reset()
    }).catch (err =>{
       console.log(err);
    })    
}

const remove = (id) =>{
    axios.get(`http://localhost:8080/co-ao/delete/${id}`).then(Response =>{
      res.value = Response.data.data
      page.value = Math.ceil(Response.data.size/10)
    }).catch (err =>{
       console.log(err);
    })    
}
const detail = (id) =>{
    
    axios.get(`http://localhost:8080/co-ao/detail/${id}`).then(Response =>{
      details.value = Response.data
    }).catch (err =>{
       console.log(err);
    })    
}
const paging = (id) =>{
    axios.get(`http://localhost:8080/co-ao/${id}`).then(Response =>{
      res.value = Response.data.data;
    })
}
function reset(){
  req.value = {
        id: "",
        maCoAo: "",
        tenCoAo: "",
  }
}
</script>

<template>
  <div class="container my-4">
    
    <div class="bg-white p-3 rounded shadow mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-semibold">Bộ lọc</h5>
      </div>
      <label class="ps-4 pt-3">Tìm kiếm</label>
      <div class="container rounded d-flex align-items-center gap-2 m-2 me-5">
        <input type="text" class="form-control" placeholder="Tìm Kiếm Theo Giá" style="width: 40%">
        <button class="btn text-white" style="background-color: #0a2c57;color: white;">Tìm Kiếm</button>
        <button class="btn btn-light">Làm Mới</button>

          <!-- <div class="btn-group ms-5" role="group">
            <button type="button" class="btn btn-outline-primary active">Thương hiệu</button>
            <button type="button" class="btn btn-outline-secondary">trạng thái</button>
          </div> -->
        
        </div>
    </div>
     
      <div class="bg-white p-3 rounded shadow mb-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h5 class="fw-semibold m-0">Quản lý cổ áo</h5>
        <button class="btn" data-bs-toggle="modal" data-bs-target="#exampleModal" style="background-color: #0a2c57;">
          <Plus size="18" style="color: white;" />
        </button>
      </div>
      <table class="table table-hover text-center align-middle">
        <thead class="table-light">
        <tr>
          <th>STT</th>
          <th>Mã cổ áo</th>
          <th>Tên cổ áo</th>
          <th>Action</th>
      </tr>
        </thead>
        <tbody>
          <tr v-for="(ds, index) in res ">
            <td>{{ index + 1 }}</td>
            <td>{{ ds.maCoAo }}</td>
            <td>{{ ds.tenCoAo }}</td>
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
        <h1 class="modal-title fs-5" id="exampleModalLabel">Thêm Cổ áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
        <label for="form1" class="form-label">Tên Cổ áo</label>
        <input type="text" class="form-control" id="form1" v-model="req.tenCoAo">
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
        <h1 class="modal-title fs-5" id="exampleModalLabel">Cập nhật thông tin Cổ áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">



        <label for="form1" class="form-label">Tên Cổ áo</label>
        <input type="text" class="form-control" id="form1" v-model="req.tenCoAo">
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
        <h1 class="modal-title fs-5" id="exampleModalLabel">Thông tin Cổ áo</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
        <label for="form" class="form-label">Mã Cổ áo</label>
        <input type="text" class="form-control" id="form" v-model="details.maCoAo" readonly>

        <label for="form1" class="form-label">Tên Cổ áo</label>
        <input type="text" class="form-control" id="form1" v-model="details.tenCoAo" readonly>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
      </div>
    </div>
  </div>
</div>
</template>
