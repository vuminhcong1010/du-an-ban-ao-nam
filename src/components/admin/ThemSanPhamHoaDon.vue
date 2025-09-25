<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import Cookies from "js-cookie";

const token = Cookies.get("token");
const search = ref("");
const selected = ref({});
const quantities = ref({});
let listSanPham = ref([]);
// phân trang:
const currentPage = ref(0);
const pageSize = ref(5);
const totalPages = ref(0);

// lay ảnh sản phẩm
const anhMap = ref({}); // Lưu ảnh theo id sản phẩm

const fetchAnhSanPham = async (id) => {
  console.log(id);
  try {
    const response = await fetch(
      `http://localhost:8080/chi-tiet-san-pham/lay-anh/${id}`
    );
    if (response.ok) {
      const url = await response.text();
      console.log(url);
      anhMap.value[id] = url; // Gán đường dẫn ảnh vào map
    } else {
      anhMap.value[id] = "https://via.placeholder.com/50"; // Ảnh mặc định khi không có ảnh
    }
  } catch (error) {
    anhMap.value[id] = "https://via.placeholder.com/50"; // Ảnh mặc định khi lỗi
  }
};

const fetchSanPhamPaginated = async () => {
  try {
    const response = await fetch(
      `http://localhost:8080/chi-tiet-san-pham/phan-trang?page=${currentPage.value}&size=${pageSize.value}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    const data = await response.json();
    listSanPham.value = data.content; // Spring Data trả về `content`, `totalPages`, ...
    // lấy ảnh:
    listSanPham.value.forEach((sp) => {
      fetchAnhSanPham(sp.id);
    });
    totalPages.value = data.totalPages;
  } catch (error) {
    console.error("Lỗi khi fetch sản phẩm:", error);
  }
};

onMounted(() => {
  fetchSanPhamPaginated();
});

// Hàm chuyển trang
const nextPage = () => {
  if (currentPage.value < totalPages.value - 1) {
    currentPage.value++;
    fetchSanPhamPaginated();
  }
};

const prevPage = () => {
  if (currentPage.value > 0) {
    currentPage.value--;
    fetchSanPhamPaginated();
  }
};

// khác
const route = useRoute();
const maHoaDon = route.params.maHoaDon;

// const fetchTodos = async () => {
//   try {
//     const response = await fetch("http://localhost:8080/chi-tiet-san-pham");
//     const json = await response.json();
//     listSanPham.value = json;
//   } catch (error) {
//     console.error("Lỗi khi fetch dữ liệu:", error);
//   }
// };

// onMounted(() => {
//   fetchTodos();
// });

// thêm sản phẩm vào cthd

const emit = defineEmits(["chonSanPham"]);
const selectedItems = ref([]);
const toggleSelection = (item) => {
  const index = selectedItems.value.findIndex(
    (i) => i.maChiTietSapPham === item.maChiTietSapPham
  );

  if (index === -1) {
    selectedItems.value.push(item);
    quantities.value[item.maChiTietSapPham] = 1;
  } else {
    selectedItems.value.splice(index, 1);
    delete quantities.value[item.maChiTietSapPham];
  }
};

// const apply = async () => {
//   const result = selectedItems.value.map((item) => {
//     const soLuongMua = quantities.value[item.maChiTietSapPham] || 1;
//     const gia = item.gia;
//     return {
//       idSanPhamChiTiet: item.maChiTietSapPham,
//       gia: giaSauGiam,
//       soLuong: soLuongMua,
//       thanhTien: gia * soLuongMua,
//       idHoaDon: maHoaDon,
//       trangThai: 0, // hoặc trạng thái mặc định
//     };
//   });

//   //kiểm tra dữ liệu:
//   // 👉 Kiểm tra dữ liệu gốc
//   console.log("✅ Dữ liệu result gửi xuống:", result);

//   const bodyUpdateSoLuong = result.map((r) => ({
//     idSanPhamChiTiet: r.idSanPhamChiTiet,
//     soLuongMua: r.soLuong,
//   }));

//   // 👉 Kiểm tra body gửi xuống API update số lượng
//   console.log("📦 Body gửi update số lượng:", bodyUpdateSoLuong);

//   // 1. Cập nhật tồn kho
//   try {
//     await fetch("http://localhost:8080/chi-tiet-san-pham/update-so-luong", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(bodyUpdateSoLuong),
//     });
//   } catch (error) {
//     console.error("Lỗi khi cập nhật số lượng tồn kho:", error);
//   }

//   // 2. Lưu chi tiết hóa đơn
//   try {
//     await fetch("http://localhost:8080/hoa-don-chi-tiet/add", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(result),
//     });

//     // 3. Ghi lịch sử cho từng sản phẩm vừa thêm
//     for (const r of result) {
//       await fetch("http://localhost:8080/lich-su-hoa-don/them", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           maHoaDon: maHoaDon, // ✅ đúng tên trường trong DTO
//           noiDungThayDoi: "Thêm sản phẩm",
//           nguoiThucHien: "admin",
//           ghiChu: "", // để backend tự sinh
//           idChiTietSanPham: r.idSanPhamChiTiet,
//         }),
//       });
//     }
//   } catch (error) {
//     console.error("Lỗi khi lưu hóa đơn chi tiết:", error);
//   }
//   emit("selected", selectedItems.value);
//   emit("close");
// };
const apply = async () => {
  try {
    // Lấy danh sách id sản phẩm đã chọn
    const productIds = selectedItems.value.map((item) => item.id);
    if (productIds.length === 0) return;

    // Gọi API check giảm giá
    const response = await fetch("http://localhost:8080/api/discounts/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productIds),
    });

    if (!response.ok) throw new Error("Lỗi khi kiểm tra giảm giá");

    const discountInfos = await response.json(); // [{ chiTietSanPhamId, phamTramGiam, soTienGiam }]
    const discountMap = new Map();
    discountInfos.forEach((info) => {
      discountMap.set(info.chiTietSanPhamId, info);
    });

    // Tạo mảng kết quả để gửi backend
    const result = selectedItems.value.map((item) => {
      let giaGoc = parseFloat(item.gia) || 0;
      let giaSauGiam = giaGoc;

      const discount = discountMap.get(item.id);
      if (discount) {
        if (discount.phamTramGiam != null) {
          giaSauGiam = giaGoc * (1 - discount.phamTramGiam / 100);
        } else if (discount.soTienGiam != null) {
          giaSauGiam = giaGoc - discount.soTienGiam;
        }
      }

      giaSauGiam = Math.max(Math.round(giaSauGiam), 0);

      const soLuongMua = 1;

      return {
        idSanPhamChiTiet: item.maChiTietSapPham,
        gia: giaSauGiam,
        soLuong: soLuongMua,
        thanhTien: giaSauGiam * soLuongMua,
        idHoaDon: maHoaDon,
        trangThai: 0,
        tenSanPham: item.idSanPham.tenSanPham,
      };
    });

    console.log("✅ Dữ liệu gửi xuống:", result);

    // TODO: gọi API update số lượng, lưu hóa đơn chi tiết, ghi lịch sử như bạn viết tiếp
// -------------------
    // 1. Cập nhật tồn kho
    const bodyUpdateSoLuong = result.map((r) => ({
      idSanPhamChiTiet: r.idSanPhamChiTiet,
      soLuongMua: r.soLuong,
    }));

    console.log("📦 Body gửi update số lượng:", bodyUpdateSoLuong);

    await fetch("http://localhost:8080/chi-tiet-san-pham/update-so-luong", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyUpdateSoLuong),
    });

    // -------------------
    // 2. Lưu chi tiết hóa đơn
    await fetch("http://localhost:8080/hoa-don-chi-tiet/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });

    // -------------------
    // 3. Ghi lịch sử cho từng sản phẩm vừa thêm
    for (const r of result) {
      await fetch("http://localhost:8080/lich-su-hoa-don/them", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          idHoaDon: { maHoaDon: maHoaDon }, // ✅ đúng tên trường trong DTO
          noiDungThayDoi: "Thêm sản phẩm",
          nguoiThucHien: "admin",
          ghiChu: `admin thực hiện thêm sản phẩm ${r.tenSanPham}`, // để backend tự sinh
          // idChiTietSanPham: r.idSanPhamChiTiet,
        }),
      });
    }

    // -------------------
    // 4. Emit ra ngoài để đóng modal + reload
    emit("selected", selectedItems.value);
    emit("close");
  } catch (err) {
    console.error(err);
  }
};


const filteredSanPham = computed(() => {
  return listSanPham.value.filter((sp) => sp.soLuong > 0);
});
</script>

<template>
  <div
    class="modal fade show d-block"
    tabindex="-1"
    style="background-color: rgba(0, 0, 0, 0.5); z-index: 1050"
  >
    <div class="modal-dialog custom-modal modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Chọn nhiều sản phẩm</h5> 
          <button
            type="button"
            class="btn-close"
            @click="$emit('close')"
          ></button>
        </div>
        <div class="modal-body">
          <!-- <input
            type="text"
            class="form-control mb-3"
            placeholder="Tìm kiếm theo tên, mã SKU, Barcode sản phẩm"
            v-model="search"
          /> -->
          <div class="">
            <div class="row g-3">
              <div class="col-md-12">
                <label class="form-label fw-bold">Bộ lọc</label>
                <div class="d-flex align-items-center gap-2">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Tìm theo mã, tên sản phẩm"
                    v-model="timKiem"
                  />
                  <button
                    type="button"
                    class="btn"
                    style="
                      background-color: #0a2c57;
                      color: white;
                      white-space: nowrap;
                    "
                    @click="locSanPham"
                  >
                    Tìm kiếm
                  </button>
                </div>
              </div>

              <!-- Trạng thái -->
              <div class="col-md-5 ms-2">
                <label class="form-label fw-bold">Trạng thái</label>
                <div class="d-flex gap-3">
                  <input type="radio" checked /> Đang bán <input type="radio" /> Ngừng
                  bán
                </div>
              </div>

              <!-- Danh mục -->
              <div class="col-md-3">
                <label class="form-label fw-bold">Danh mục</label>
                <select
                  class="form-select"
                >
                  <option selected>Tất cả danh mục</option>
                  <option >Áo</option>
                  <option >Quần</option>
                </select>
              </div>

              <!-- Chất liệu -->
              <div class="col-md-3">
                <label class="form-label fw-bold">Chất liệu</label>
                <select
                  class="form-select"
                >
                  <option selected>Tất cả chất liệu</option>
                  <option >Cotton</option>
                  <option >Nano</option>
                  <option >Poly</option>
                </select>
              </div>
            </div>
          </div>
          <br />

          <div class="table-responsive">
            <table class="table align-middle">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Ảnh</th>
                  <th>Mã</th>
                  <th>Sản phẩm</th>
                  <th>Kích thước</th>
                  <th>Màu sắc</th>
                  <th>Chất liệu</th>
                  <th>Giá</th>
                  <th>Kho</th>
                  <!-- <th>Số lượng mua</th> -->
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in filteredSanPham" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>
                    <img
                      :src="anhMap[item.id] || 'https://via.placeholder.com/50'"
                      style="width: 20px; height: 20px"
                    />
                  </td>
                  <td>{{ item.maChiTietSapPham }}</td>
                  <td>{{ item.idSanPham.tenSanPham }}</td>
                  <td>{{ item.idSize.soCo }}</td>
                  <td>{{ item.idMau.ten }}</td>
                  <td>{{ item.idSanPham.idChatLieu.tenChatLieu }}</td>
                  <td>{{ item.gia }}</td>
                  <td>
                    {{
                      item.soLuong
                    }}
                  </td>
                  <!-- <td>
                    <input
                      type="number"
                      min="1"
                      :max="item.soLuong"
                      v-model.number="quantities[item.maChiTietSapPham]"
                      :disabled="
                        !selectedItems.some(
                          (i) => i.maChiTietSapPham === item.maChiTietSapPham
                        )
                      "
                      class="form-control form-control-sm"
                      style="width: 70px"
                    />
                  </td> -->
                  <td class="text-center">
                    <input
                      type="checkbox"
                      :checked="
                        selectedItems.some(
                          (i) => i.maChiTietSapPham === item.maChiTietSapPham
                        )
                      "
                      @change="toggleSelection(item)"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <!-- phân trang  -->
          <div class="d-flex justify-content-between align-items-center mt-3">
            <button
              class="btn btn-outline-primary"
              :disabled="currentPage === 0"
              @click="prevPage"
            >
              Trang trước
            </button>
            <span>Trang {{ currentPage + 1 }} / {{ totalPages }}</span>
            <button
              class="btn btn-outline-primary"
              :disabled="currentPage >= totalPages - 1"
              @click="nextPage"
            >
              Trang sau
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="$emit('close')">Hủy</button>
          <button class="btn btn-primary" @click="apply">Áp dụng</button>
        </div>
      </div>
    </div>
  </div>
  
</template>

<style scoped>
.custom-modal {
  max-width: 80vw;
}
</style>