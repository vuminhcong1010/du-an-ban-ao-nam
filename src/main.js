import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue3 from 'bootstrap-vue-3';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css';
import '@fortawesome/fontawesome-free/css/all.min.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import Swal from 'sweetalert2';
import axios from 'axios';
import { createPinia } from 'pinia';


const app = createApp(App);
const pinia = createPinia();


const options = {
  // Thời gian hiển thị (ms) — ví dụ 1500ms = 1.5 giây
  timeout: 1800,
}




app.use(pinia); // Sử dụng Pinia cho quản lý trạng thái
app.use(BootstrapVue3);
app.use(Toast, options);
app.use(router); // Router có thể sử dụng Pinia, nên đặt sau


app.config.globalProperties.$swal = Swal;
app.mount('#app');


// axios.defaults.withCredentials = true;



