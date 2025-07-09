// src/main.js

import { createApp } from 'vue';
import App from './App.vue';
import router from './router';

import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';

import '@fortawesome/fontawesome-free/css/all.min.css';

import Toast, { POSITION } from 'vue-toastification';
import 'vue-toastification/dist/index.css';

import Swal from 'sweetalert2';

// THAY ĐỔI: Import hàm setAxiosAppInstance
import { setAxiosAppInstance } from './api/axios';

const app = createApp(App);

const toastOptions = {
  timeout: 1800,
  position: POSITION.TOP_RIGHT,
};

// Cài đặt Vue-Toastification đầu tiên
app.use(Toast, toastOptions);

// **THAY ĐỔI LỚN NHẤT:** Truyền trực tiếp app instance
setAxiosAppInstance(app); // Truyền app instance vào axios.js

// Bạn có thể thêm console log để xác nhận toast instance có tồn tại sau khi use Toast
if (app.config.globalProperties.$toast) {
  console.log("Vue-Toastification instance is available on app.config.globalProperties.$toast.");
} else {
  console.warn("Lưu ý: Vue-Toastification instance có vẻ chưa hoàn toàn sẵn sàng trên global properties ngay sau khi cài đặt plugin.");
}

app.config.globalProperties.$swal = Swal;

app.use(BootstrapVue3);
app.use(router);

app.mount('#app');
