import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),         // Plugin Vue để hỗ trợ Vue.js
    vueDevTools(), // Plugin Vue DevTools để hỗ trợ debugging với Vue DevTools
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Alias để import từ src dễ dàng
      // hoặc dùng cách dưới cũng được (tùy bạn thích):
      // '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Địa chỉ backend Spring Boot
        changeOrigin: true,              // Tránh lỗi CORS
        // rewrite: (path) => path.replace(/^\/api/, ''), // Có thể bật nếu cần bỏ "/api"
      },
    },
  },
});
