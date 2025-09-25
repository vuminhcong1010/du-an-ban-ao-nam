// src/stores/auth.js


import { defineStore } from "pinia";
import axios from "axios";
import Cookies from "js-cookie";


export const useAuthStore = defineStore("auth", {
  state: () => ({
    // Lấy dữ liệu từ localStorage khi khởi tạo store
    user: JSON.parse(localStorage.getItem("loggedInUser")) || null,
    token: localStorage.getItem("clientAuthToken") || null,
  }),


  getters: {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    // Getter này sẽ phụ thuộc vào state của store, đảm bảo tính đồng bộ
    isLoggedInClient: (state) => !!state.token && !!state.user,
  },


  actions: {
    setLoginData(userData, authToken) {
      this.user = userData;
      this.token = authToken;
      // Lưu vào localStorage
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
      
      
      localStorage.setItem("clientAuthToken", authToken);
      // Lưu vào Cookies (nếu cần)
      Cookies.set("thongTinKhachHang", JSON.stringify(userData));
    },


    logoutClient() {
      // Xóa dữ liệu khỏi state
      this.user = null;
      this.token = null;
      // Xóa dữ liệu khỏi localStorage và Cookies
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("clientAuthToken");
      Cookies.remove("email");
    },
   
    // Bạn có thể giữ lại hàm setUser nếu cần
    setUser(userData) {
      this.user = userData;
      localStorage.setItem("loggedInUser", JSON.stringify(userData));
    },
  },
});