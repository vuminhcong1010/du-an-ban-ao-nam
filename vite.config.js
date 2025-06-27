import {fileURLToPath, URL} from "node:url";

import {defineConfig} from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),         // Plugin Vue để hỗ trợ Vue.js
    vueDevTools(), // Plugin Vue DevTools để hỗ trợ debugging với Vue DevTools
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // Dùng path.resolve cho alias src
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080', // Địa chỉ backend của bạn
        changeOrigin: true,              // Thay đổi origin của yêu cầu để tránh lỗi CORS
        // rewrite: (path) => path.replace(/^\/api/, ''), // Loại bỏ '/api' khi gửi yêu cầu tới backend
      },
    },
  },
});
