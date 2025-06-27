const LOCATION_API_URL = 'http://localhost:8080/api/dia-chi'; // Địa chỉ API lấy thông tin tỉnh, quận, xã

// Hàm gọi API để lấy danh sách tỉnh/thành phố
export const fetchTinhThanh = () => {
  return axios.get(`${LOCATION_API_URL}/tinh-thanh`)
    .then(response => {
      if (!response.data || response.data.length === 0) {
        console.warn("Không có tỉnh/thành phố nào được tìm thấy.");
           console.log("Dữ liệu tỉnh/thành phố:", responseTinhThanh.data);
        return [];
      }
      return response.data;
      
    })
    .catch(error => {
      console.error("Có lỗi khi lấy tỉnh/thành phố:", error);
      throw error;
    });
};

// Hàm gọi API để lấy danh sách quận/huyện theo id tỉnh
export const fetchQuanHuyenByTinh = (idTinhThanh) => {
  return axios.get(`${LOCATION_API_URL}/quan-huyen-by-tinh`, {
    params: {
      idTinhThanh
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error("Có lỗi khi lấy quận/huyện:", error);
      throw error;
    });
};

// Hàm gọi API để lấy danh sách xã/phường theo id quận
export const fetchXaPhuongByQuan = (idQuanHuyen) => {
  return axios.get(`${LOCATION_API_URL}/xa-phuong-by-quan`, {
    params: {
      idQuanHuyen
    }
  })
    .then(response => response.data)
    .catch(error => {
      console.error("Có lỗi khi lấy xã/phường:", error);
      throw error;
    });
};