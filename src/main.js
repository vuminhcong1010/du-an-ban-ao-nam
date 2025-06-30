import {createApp} from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);

import BootstrapVue3 from "bootstrap-vue-3";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-3/dist/bootstrap-vue-3.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

const options = {
  timeout: 1800,
};
app.use(Toast, options);

app.use(BootstrapVue3);
app.use(router);
app.mount("#app");
