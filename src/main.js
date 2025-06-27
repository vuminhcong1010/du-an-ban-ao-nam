import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

// Import BootstrapVue3 and other necessary dependencies
import BootstrapVue3 from 'bootstrap-vue-3'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue-3/dist/bootstrap-vue-3.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// Configure Toast options
const options = {
  timeout: 1800,  // Timeout duration for toast messages (in milliseconds)
}

// Use the necessary plugins
app.use(Toast, options)
app.use(BootstrapVue3)
app.use(router)

// Mount the app
app.mount('#app')
