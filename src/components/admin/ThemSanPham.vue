<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";

const search = ref("");
const selected = ref({});
const quantities = ref({});

const route = useRoute();
const maHoaDon = route.params.maHoaDon;

let listSanPham = ref([]);

const fetchTodos = async () => {
  try {
    const response = await fetch("http://localhost:8080/chi-tiet-san-pham");
    const json = await response.json();
    listSanPham.value = json;
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error);
  }
};

onMounted(() => {
  fetchTodos();
});

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

const apply = async () => {
  const result = selectedItems.value.map((item) => {
    const soLuongMua = quantities.value[item.maChiTietSapPham] || 1;
    const gia = item.gia;
    return {
      idSanPhamChiTiet: item.maChiTietSapPham,
      gia: item.gia,
      soLuong: soLuongMua,
      thanhTien: gia * soLuongMua,
      idHoaDon: maHoaDon,
      trangThai: 0, // hoặc trạng thái mặc định
    };
  });

  //kiểm tra dữ liệu: 
   // 👉 Kiểm tra dữ liệu gốc
  console.log("✅ Dữ liệu result gửi xuống:", result);

  const bodyUpdateSoLuong = result.map((r) => ({
    idSanPhamChiTiet: r.idSanPhamChiTiet,
    soLuongMua: r.soLuong,
  }));

  // 👉 Kiểm tra body gửi xuống API update số lượng
  console.log("📦 Body gửi update số lượng:", bodyUpdateSoLuong);

  // 1. Cập nhật tồn kho
  try {
    await fetch("http://localhost:8080/chi-tiet-san-pham/update-so-luong", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(bodyUpdateSoLuong),
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng tồn kho:", error);
  }

  // 2. Lưu chi tiết hóa đơn
  try {
    await fetch("http://localhost:8080/hoa-don-chi-tiet/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(result),
    });
  } catch (error) {
    console.error("Lỗi khi lưu hóa đơn chi tiết:", error);
  }
  emit("selected", selectedItems.value);
  emit("close");
};

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
          <input
            type="text"
            class="form-control mb-3"
            placeholder="Tìm kiếm theo tên, mã SKU, Barcode sản phẩm"
            v-model="search"
          />

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
                  <th>Số lượng mua</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in listSanPham" :key="index">
                  <td>{{ index }}</td>
                  <td>
                    <img
                      src="https://img.lovepik.com/free-png/20210923/lovepik-t-shirt-png-image_401190055_wh1200.png"
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
                      item.soLuong - (quantities[item.maChiTietSapPham] || 0)
                    }}
                  </td>
                  <td >
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
                  </td>
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

