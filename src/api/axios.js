// src/api/axios.js


import axios from 'axios';
import router from '../router'; // Import router instance


// Biến để lưu trữ app instance (để truy cập toast)
let _appInstance = null;


// Hàm để thiết lập app instance từ main.js
export const setAxiosAppInstance = (appInstance) => {
  _appInstance = appInstance;
};


// Tạo một instance Axios
const apiClient = axios.create({
  baseURL: 'http://localhost:8080', // Đảm bảo URL này đúng với backend của bạn
  headers: {
    // 'Content-Type': 'application/json',
  },
});


// Hàm hiển thị toast
const displayToast = (message, type = 'error') => {
  if (_appInstance && _appInstance.config.globalProperties.$toast) {
    _appInstance.config.globalProperties.$toast[type](message);
  } else {
    console.warn(`Toast instance chưa được thiết lập cho Axios interceptor. Thông báo: ${message}`);
    // Fallback nếu toast không có sẵn (ví dụ: in ra console)
    alert(message); // Sử dụng alert chỉ trong trường hợp khẩn cấp để debug
  }
};


// Interceptor cho Request: Thêm Authorization token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// Interceptor cho Response: Xử lý lỗi tập trung
apiClient.interceptors.response.use(
  (response) => response, // Trả về response nếu thành công
  (error) => {
    console.error("Lỗi từ API:", error.response);


    if (error.response) {
      // Lỗi từ server (có phản hồi)
      if (error.response.status === 401) {
        displayToast('Phiên đăng nhập đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.', 'error');
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRoles');
        localStorage.removeItem('idNhanVien');
        localStorage.removeItem('idKhachHang');
        router.push('/login'); // Chuyển hướng về trang đăng nhập
      } else if (error.response.status === 403) {
        displayToast('Bạn không có quyền truy cập tài nguyên này.', 'error');
        router.push('/'); // Chuyển hướng về trang chủ hoặc trang lỗi
      } else if (error.response.data && error.response.data.message) {
        // Lỗi có thông báo cụ thể từ backend
        displayToast(error.response.data.message, 'error');
      } else {
        // Lỗi không xác định từ server
        displayToast('Đã xảy ra lỗi không xác định từ máy chủ.', 'error');
      }
    } else if (error.request) {
      // Yêu cầu đã được gửi nhưng không nhận được phản hồi (lỗi mạng)
      displayToast('Không nhận được phản hồi từ máy chủ. Vui lòng kiểm tra kết nối mạng.', 'error');
    } else {
      // Lỗi trong quá trình thiết lập yêu cầu
      displayToast('Có lỗi trong quá trình gửi yêu cầu.', 'error');
    }


    return Promise.reject(error); // Tiếp tục ném lỗi để component có thể xử lý thêm
  }
);


export default apiClient;