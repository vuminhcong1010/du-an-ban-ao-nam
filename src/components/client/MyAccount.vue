<template>
  <div>
    <h1>Thông tin cá nhân khách hàng</h1>
    <p>Đây là trang thông tin tài khoản của bạn.</p>

    <div v-if="user">
      <p><strong>Tên tài khoản:</strong> {{ user.tenTaiKhoan }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Tên khách hàng:</strong> {{ user.tenKhachHang }}</p>
      </div>
    <div v-else>
      <p>Đang tải thông tin cá nhân hoặc không tìm thấy thông tin.</p>
    </div>

   
    <section class="personal-details">
      <h2>Chi tiết cá nhân</h2>
      <label for="firstName">Tên:</label>
      <input type="text" id="firstName" :value="user ? user.tenKhachHang : ''" readonly />

      <label for="email">Email:</label>
      <input type="email" id="email" :value="user ? user.email : ''" readonly />
      <button @click="editDetails">Cập nhật chi tiết</button>
    </section>

    <section class="billing-details">
      <h2>Thông tin thanh toán</h2>
      <label for="billingAddress">Địa chỉ mặc định:</label>
      <input type="text" id="billingAddress" :value="user && user.diaChis && user.diaChis.length > 0 ? user.diaChis[0].diaChiChiTiet + ', ' + user.diaChis[0].xaPhuong + ', ' + user.diaChis[0].quanHuyen + ', ' + user.diaChis[0].tinhThanhPho : 'Chưa có địa chỉ mặc định'" readonly />
      </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const user = ref(null);

onMounted(() => {
  // Retrieve the user data stored in localStorage after successful login
  const storedUser = localStorage.getItem('loggedInUser');
  if (storedUser) {
    user.value = JSON.parse(storedUser);
    console.log('User data loaded in MyAccount:', user.value);
  } else {
    console.warn('No user data found in localStorage.');
  }
});

const editDetails = () => {
  alert('Chức năng cập nhật chi tiết chưa được triển khai!');
  // In a real application, you'd navigate to an edit form or enable input fields
};
</script>

<style scoped>
/* Basic styling for the MyAccount page */
div {
  padding: 20px;
  max-width: 900px;
  margin: 20px auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #0a2c57;
  text-align: center;
  margin-bottom: 25px;
}

h2 {
  color: #0a2c57;
  margin-top: 30px;
  margin-bottom: 15px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

p {
  font-size: 16px;
  margin-bottom: 10px;
  color: #555;
}

strong {
  color: #333;
}

section {
  margin-bottom: 30px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

input[type="text"],
input[type="email"] {
  width: calc(100% - 22px); /* Account for padding and border */
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  background-color: #f9f9f9; /* Slightly grey background for readonly */
}

button {
  background-color: #007bff;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}
</style>