// api/customerApi.js
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/khach-hang'; // Địa chỉ API của bạn

// Hàm gọi API để lấy danh sách khách hàng với phân trang
export const fetchCustomers = (page, size) => {
  return axios.get(API_URL, {
    params: {
      page,
      size
    }
  });
};

// Hàm gọi API để tạo khách hàng mới
export const createCustomer = (createKhachHangDTO) => {
  return axios.post(API_URL, createKhachHangDTO)
    .then(response => response.data)
    .catch(error => {
      console.error("Có lỗi khi tạo khách hàng:", error);
      throw error;  // Propagate error to the caller
    });
};