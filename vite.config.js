import {fileURLToPath, URL} from "node:url";
import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import path from "path";


export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  define: {
    global: "window", // 🛠 Thêm dòng này để fix lỗi "global is not defined"
  },


  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/ws": {
        target: "http://localhost:8080",
        ws: true,
        changeOrigin: true,
        secure: false,
      },
       '/api-provinces': {
        target: 'https://provinces.open-api.vn',
        changeOrigin: true, // Thay đổi origin host thành target URL
        rewrite: (path) => path.replace(/^\/api-provinces/, ''), // Xóa '/api-provinces' khỏi URL
      },
    },
  },
});





