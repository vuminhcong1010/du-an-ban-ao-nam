<script setup>
import { useRoute } from "vue-router";
import LichSuHoaDon from "./LichSuHoaDon.vue";
import LichSuThanhToan from "./LichSuThanhToan.vue";
import { computed } from "vue";
import {
  Backpack,
  Delete,
  Edit,
  List,
  Lock,
  LucideArrowLeft,
  LucideCornerUpLeft,
  Mail,
  MapPin,
  Phone,
  Plus,
  Printer,
  Trash,
  Upload,
  Circle,
  FileText,
  User,
  ShoppingBag,
  ShoppingCart,
  Receipt,
  CreditCard,
  Dot,
  ArrowUpRight,
} from "lucide-vue-next";
import { ref, onMounted, watch } from "vue";

import ThemSanPham from "./ThemSanPham.vue";


const buttons = ref([
  ["Hủy đơn hàng", "Xác nhận"],
  ["Quay lại đang xử lý", "Đẩy giao hàng"],
  ["Quay lại đã xác nhận", "Giao hàng thành công"],
  ["Quay lại đang giao hàng", "Hoàn hàng"],
  ["", ""],
]);

let trangThai = ref(0);
const steps = [
  "Đang xử lý",
  "Đã xác nhận",
  "Đang giao hàng",
  "Giao hàng thành công",
  "Hủy/hoàn",
];

const reasons = ["Khách muốn huỷ đơn", "Khác"];
const selectedReason = ref(reasons[0]);
const note = ref("");

const route = useRoute();
const maHoaDon = route.params.maHoaDon;

const listHoaDonChiTiet = ref([]);

const fetchTodos = async () => {
  try {
    const response = await fetch(
      `http://localhost:8080/hoa-don-chi-tiet/${maHoaDon}`
    );
    const json = await response.json();
    listHoaDonChiTiet.value = json;

    // Cập nhật trangThai sau khi có dữ liệu
    trangThai.value = json[0]?.idHoaDon?.trangThai; // tìm chỉ số trong mảng steps
    console(trangThai);
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error);
  }
};

// lich su hoa don 
const showModalLichSuHoaDon = ref(false);
const lichSu = ref([]);
const fetchLichSuHoaDon = async () => {
  try {
    const response = await fetch(
      `http://localhost:8080/lich-su-hoa-don/${maHoaDon}`
    );
    const json = await response.json();
    lichSu.value = json;
    showModalLichSuHoaDon.value = true;
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error);
  }
};

// lich su thanh toan:
const showModalLichSuThanhToan = ref(false);
const lichSuThanhToan = ref([]);
const fetchLichSuThanhToan = async () => {
  try {
    const response = await fetch(
      `http://localhost:8080/lich-su-hoa-don/${maHoaDon}`
    );
    const json = await response.json();
    lichSuThanhToan.value = json;
    showModalLichSuThanhToan.value = true;
  } catch (error) {
    console.error("Lỗi khi fetch dữ liệu:", error);
  }
};


// show san pham
const showThemSanPham = ref(false);

function moThemSanPham() {
  showThemSanPham.value = true;
}

onMounted(() => {
  fetchTodos();
  // fetchLichSuHoaDon();
});

// thêm sản phẩm vào hóa đơn chi tiết:
const nhanSanPhamTuThem = async () => {
  toast.success("Thêm thành công!");
  await fetchTodos(); // gọi lại API để cập nhật danh sách chi tiết hóa đơn
};

// sửa thông tin người nhận hàng:
const isEditing = ref(false);

const receiverInfo = ref({
  tenKhachHang: "",
  diaChi: "",
  sdt: "",
});
// Đồng bộ giá trị ban đầu từ listHoaDonChiTiet khi có dữ liệu
watch(
  () => listHoaDonChiTiet.value,
  (val) => {
    if (val.length > 0) {
      const hd = val[0].idHoaDon;
      receiverInfo.value.tenKhachHang = hd.tenKhachHang;
      receiverInfo.value.diaChi = hd.diaChi;
      receiverInfo.value.sdt = hd.sdt;
    }
  },
  { immediate: true }
);

const luuThongTin = async () => {
  try {
    const response = await fetch(`http://localhost:8080/hoa-don/${maHoaDon}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(receiverInfo.value),
    });
    console.log(maHoaDon);
    console.log(receiverInfo.value.diaChi);
    console.log(receiverInfo.value.tenKhachHang);

    const text = await response.text(); // nhận phản hồi từ backend
    comfirm.value = text; // gán cho biến để hiển thị thông báo
    console.log(comfirm.value);

    // 👉 Hiển thị hộp thoại xác nhận
    const xacNhan = window.confirm("Bạn có chắc chắn muốn lưu thay đổi không?");
    if (xacNhan) {
      await fetchTodos(); // load lại dữ liệu
      isEditing.value = false;
      thongBao(); // 👉 Hiển thị toast sau khi xác nhận
    }
  } catch (err) {
    console.error(err);
    alert("Có lỗi xảy ra!");
  }
};

// comfirm thong bao
import { useToast } from "vue-toastification";
const toast = useToast();

let comfirm = ref();
function thongBao() {
  toast.success(comfirm.value);
}

const tongTienSanPham = computed(() => {
  return listHoaDonChiTiet.value.reduce((sum, item) => {
    return sum + (item.thanhTien || 0);
  }, 0);
});

import axios from "axios";
// thay doi trang thai:
const thayDoiTrangThai = async (moiTrangThai) => {
  const confirm = window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái?");
  if (!confirm) return;
  try {
    await axios.put(
      `http://localhost:8080/hoa-don/cap-nhat-trang-thai/${maHoaDon}?trangThai=${moiTrangThai}`
    );

    trangThai.value = moiTrangThai;
    toast.success("Đã cập nhật trạng thái!");
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái:", error);
    toast.error("Lỗi khi cập nhật trạng thái!");
  }
};

// xoa san pham:
const xoaSanPham = async (id) => {
  const confirm = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
  if (!confirm) return;

  try {
    await axios.delete(`http://localhost:8080/hoa-don-chi-tiet/xoa/${id}`);
    toast.success("Xóa sản phẩm thành công!");

    // Sau khi xóa, reload lại danh sách
    await fetchTodos(); // hoặc filter lại listHoaDonChiTiet
  } catch (error) {
    console.error(error);
  }
};


// xuat file pdf
function downloadPDF(maHoaDon) {
  axios.get(`http://localhost:8080/hoa-don/${maHoaDon}/pdf`, {
    responseType: 'blob'
  }).then((response) => {
    const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.setAttribute('download', `hoa_don_${maHoaDon}.pdf`);
    document.body.appendChild(fileLink);
    fileLink.click();
    document.body.removeChild(fileLink);
  }).catch((err) => {
    console.error("Lỗi tải file PDF:", err);
  });
}
</script>

<template>
  <div class="d-flex justify-content-between">
    <!-- Cột trái -->
    <div class="d-flex flex-column" style="flex: 1">
      <div class="container-fixed bg-white p-3 rounded shadow mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold">
            <RouterLink to="/hoa-don">
              <LucideArrowLeft></LucideArrowLeft>
            </RouterLink>
            <FileText :size="24" class="ms-2" /> Hóa đơn chi tiết:
          </h5>
          <!-- Nút Hủy/hoàn: viền + chữ màu #0A2C57, nền trắng -->
          <button
            @click="fetchLichSuHoaDon"
            class="btn btn-sm border text-nowrap d-flex align-items-center gap-1"
            style="
              color: #0a2c57;
              border-color: #0a2c57;
              background-color: white;
            "
          >
            <List style="width: 16px; height: 16px" />
            Lịch sử hóa đơn
          </button>
          <!-- lich su hoa don -->
          <LichSuHoaDon
            v-if="showModalLichSuHoaDon"
            :lich-su="lichSu"
            @close="showModalLichSuHoaDon = false"
          ></LichSuHoaDon>
        </div>
        <!-- thanh trang thai -->
        <div class="d-flex justify-content-between mb-4 border">
          <div
            v-for="(step, index) in steps.slice(0, trangThai + 1)"
            :key="index"
            class="text-center flex-fill my-2"
          >
            <div
              class="rounded-circle text-white d-inline-flex align-items-center justify-content-center"
              style="
                width: 32px;
                height: 32px;
                background-color: #0a2c57;
                color: white;
              "
            >
              ✓
            </div>
            <div class="mt-2">{{ step }}</div>
          </div>
        </div>

        <!-- Radio buttons -->
        <div class="mb-3">
          <div class="form-check" v-for="(reason, idx) in reasons" :key="idx">
            <input
              class="form-check-input"
              type="radio"
              :id="'reason' + idx"
              :value="reason"
              v-model="selectedReason"
            />
            <label class="form-check-label" :for="'reason' + idx">
              {{ reason }}
            </label>
          </div>
        </div>

        <!-- Textarea -->
        <div class="mb-3">
          <textarea
            class="form-control"
            rows="3"
            placeholder="Nội dung ghi chú"
            v-model="note"
          ></textarea>
        </div>
        <!-- Button xác nhận khi có nội dung -->
        <div class="mb-3" v-if="note.trim()">
          <button class="btn btn-success">✔️ Xác nhận ghi chú</button>
        </div>

        <!-- Buttons -->
        <div class="d-flex gap-2 justify-content-end">
          <button
            v-if="trangThai !== 0 && trangThai !== 4"
            class="btn btn-outline-secondary"
            @click="thayDoiTrangThai(trangThai - 1)"
          >
            {{ buttons[trangThai][0] }}
          </button>

          <!-- Nút Tiếp tục -->
          <button
            v-if="trangThai !== 4"
            class="btn btn-primary"
            @click="thayDoiTrangThai(trangThai + 1)"
            style="background-color: #0a2c57; color: white"
          >
            {{ buttons[trangThai][1] }}
          </button>
        </div>
      </div>

      <div class="container-fixed bg-white p-3 rounded shadow mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold">Sản phẩm:</h5>

          <div
            class="d-flex justify-content-end gap-2 mt-3"
            v-if="
              steps[trangThai] !== 'Giao hàng thành công' &&
              steps[trangThai] !== 'Đã hủy'
            "
          >
            <button
              @click="moThemSanPham"
              class="btn btn-sm text-white d-flex align-items-center gap-1"
              :style="{ backgroundColor: '#0A2C57' }"
              v-if="trangThai === 0"
            >
              <Plus style="width: 16px; height: 16px" />
              Thêm sản phẩm
            </button>
            <teleport to="body">
          

        
              <ThemSanPhamHoaDon

                v-if="showThemSanPham"
                :key="showThemSanPham"
                @close="showThemSanPham = false"
                @selected="nhanSanPhamTuThem"
              />
            </teleport>
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>#</th>
                <th>Sản phẩm</th>
                <th>Số lượng</th>
                <th>Giá sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in listHoaDonChiTiet" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <div class="d-flex align-items-start">
                    <!-- Hình ảnh sản phẩm -->
                    <img
                      src="https://img.lovepik.com/free-png/20210923/lovepik-t-shirt-png-image_401190055_wh1200.png"
                      style="
                        width: 80px;
                        height: 100px;
                        object-fit: cover;
                        margin-right: 10px;
                      "
                      alt="Sản phẩm"
                    />
                    <!-- Thông tin sản phẩm -->
                    <div>
                      <h6 class="mb-1">
                        {{ item.idSanPhamChiTiet.idSanPham.tenSanPham }}
                      </h6>
                      <div>
                        <strong>Chất liệu:</strong>
                        {{
                          item.idSanPhamChiTiet.idSanPham.idChatLieu.tenChatLieu
                        }}
                      </div>
                      <div>
                        <strong>Size:</strong>
                        {{ item.idSanPhamChiTiet.idSize.soCo }}
                      </div>
                      <div>
                        <strong>Màu:</strong>
                        {{ item.idSanPhamChiTiet.idMau.ten }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="text-center align-middle">{{ item.soLuong }}</td>
                <td class="text-center align-middle">
                  {{ item.idSanPhamChiTiet.gia }}
                </td>
                <td class="text-center align-middle">{{ item.thanhTien }}</td>
                <td class="text-center align-middle">
                  <button
                    class="btn p-1 border-0 bg-transparent d-flex align-items-center justify-content-center mx-auto"
                    v-if="trangThai === 0"
                    @click="xoaSanPham(item.id)"
                  >
                    <i>
                      <Trash
                        style="width: 16px; height: 16px; color: #0a2c57"
                      />
                    </i>
                  </button>
                  <i v-else>
                    <Lock style="width: 16px; height: 16px; color: #0a2c57" />
                  </i>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Cột phải -->
    <div class="d-flex flex-column ms-3" style="width: 400px">
      <div class="bg-white p-3 rounded shadow mb-4">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold">
            <Receipt></Receipt> Đơn hàng: {{ maHoaDon }}
          </h5>

          <button class="btn" style="border: none; color: #0a2c57" @click="downloadPDF(maHoaDon)">
            <Printer class="me-1" size="16"></Printer> In hóa đơn
          </button>
        </div>
        <hr />
        <label for=""
          >Hình thức đặt hàng:
          <ShoppingCart
            style="width: 16px; height: 16px; color: #0a2c57"
          ></ShoppingCart>
          Tại cửa hàng</label
        >
        <br />
        <label for=""
          >Hình thức thanh toán:
          <CreditCard
            style="width: 16px; height: 16px; color: #0a2c57"
          ></CreditCard>
          Chuyển khoản</label
        >
        <br />
        <label for="">Trạng thái đơn hàng: <Dot></Dot> Đã xác nhận</label>
        <br />
        <label for="">Trạng thái thanh toán: <Dot></Dot> Chưa thanh toán</label>
        <br />
      </div>
      <div class="bg-white p-3 rounded shadow mb-4">
        <div class="align-items-center mb-3">
          <h5 class="fw-semibold">
            Khách hàng:

            {{ listHoaDonChiTiet[0]?.idHoaDon?.idKhachHang?.tenKhachHang }}
          </h5>
          <label for="">
            <Phone style="width: 16px; height: 16px; color: #0a2c57"></Phone> :
            {{ listHoaDonChiTiet[0]?.idHoaDon?.idKhachHang?.soDienThoai }}

          </label>
          <br />
          <label for=""
            ><Mail style="width: 16px; height: 16px; color: #0a2c57"></Mail> :

            {{ listHoaDonChiTiet[0]?.idHoaDon?.idKhachHang?.email }}</label

          >
        </div>
        <hr />
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h6 class="mb-0">Thông tin người nhận hàng:</h6>
          <div>
            <button
              v-if="isEditing"
              class="btn btn-sm btn-primary me-2"
              @click="luuThongTin"
            >
              Lưu thông tin
            </button>
            <button
              v-if="trangThai === 0 && !isEditing"
              class="btn p-1 border-0 bg-transparent"
              @click="isEditing = true"
            >
              <Edit style="width: 19px; height: 19px; color: #0a2c57" /> Sửa
            </button>
          </div>
        </div>

        <!-- FORM THÔNG TIN -->
        <div class="d-grid gap-2">
          <!-- Tên -->
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light">
              <User style="width: 16px; height: 16px; color: #0a2c57" />
            </span>
            <input
              type="text"
              class="form-control"
              :value="listHoaDonChiTiet[0]?.idHoaDon?.tenKhachHang"
              :readonly="true"
              :disabled="!isEditing"
              v-if="!isEditing"
            />
            <input
              v-else
              type="text"
              v-model="receiverInfo.tenKhachHang"
              class="form-control"
              placeholder="Tên người nhận"
            />
          </div>

          <!-- Địa chỉ -->
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light">
              <MapPin style="width: 16px; height: 16px; color: #0a2c57" />
            </span>
            <input
              type="text"
              class="form-control"
              :value="listHoaDonChiTiet[0]?.idHoaDon?.diaChi"
              :readonly="true"
              :disabled="!isEditing"
              v-if="!isEditing"
            />
            <input
              v-else
              type="text"
              v-model="receiverInfo.diaChi"
              class="form-control"
              placeholder="Địa chỉ"
            />
          </div>

          <!-- Số điện thoại -->
          <div class="input-group input-group-sm">
            <span class="input-group-text bg-light">
              <Phone style="width: 16px; height: 16px; color: #0a2c57" />
            </span>
            <input
              type="text"
              class="form-control"
              :value="listHoaDonChiTiet[0]?.idHoaDon?.sdt"
              :readonly="true"
              :disabled="!isEditing"
              v-if="!isEditing"
            />
            <input
              v-else
              type="text"
              v-model="receiverInfo.sdt"
              class="form-control"
              placeholder="Số điện thoại"
            />
          </div>
        </div>
      </div>

      <!-- thông tin thanh toán -->
      <div class="bg-white p-3 rounded shadow mb-4">
        <div class="justify-content-between align-items-center mb-3">
          <h5 class="fw-semibold">Thông tin thanh toán:</h5>
        </div>
        <hr />
        <div class="d-flex justify-content-between">
          <label for="">Tổng tiền sản phẩm: </label>
          <span>{{ tongTienSanPham.toLocaleString("vi-VN") }}</span>
        </div>

        <div class="d-flex justify-content-between">
          <label for="">Khuyến mại/ giảm giá: </label>
          <span
            >-{{
              listHoaDonChiTiet[0]?.idHoaDon?.giamGia?.toLocaleString("vi-VN")
            }}</span
          >
        </div>

        <div class="d-flex justify-content-between">
          <label for="">Phí giao hàng: </label>
          <span>{{
            listHoaDonChiTiet[0]?.idHoaDon?.phiVanChuyen?.toLocaleString(
              "vi-VN"
            )
          }}</span>
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <!-- Đã thanh toán + nút xem lịch sử -->
          <div>
            <span>Đã thanh toán </span>
            <button
              @click="fetchLichSuThanhToan"
              class="btn btn-link p-0 text-decoration-none"
              style="color: blue; margin-bottom: 5px;"
              @mouseover="hovering = true"
              @mouseleave="hovering = false"
            >
              ( <ArrowUpRight style="width: 14px;"></ArrowUpRight> xem lịch sử)
            </button>
            <span>:</span>
          </div>

          <!-- Số tiền -->

          <span>4.856.000</span>


          <!-- Modal lịch sử thanh toán -->
          <LichSuThanhToan
            v-if="showModalLichSuThanhToan"
            :lich-su="lichSuThanhToan"
            @close="showModalLichSuThanhToan = false"
          />
        </div>

        <br />

        <div class="d-flex justify-content-between">
          <h6>Tổng thanh toán:</h6>
          <h5>
            <strong>
              {{
                (
                  tongTienSanPham -
                  listHoaDonChiTiet[0]?.idHoaDon?.giamGia +

                  listHoaDonChiTiet[0]?.idHoaDon?.phiVanChuyen - 4856000

                )?.toLocaleString("vi-VN")
              }}
            </strong>
          </h5>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.container-fixed {
  width: 855px;
  margin: 0 auto;
}

.status-tracker {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 20px auto;
}

.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  min-width: 100px;
}

.step {
  display: flex;
  align-items: center;
}

.circle {
  width: 32px;
  height: 32px;
  background-color: #ccc;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.circle.active {
  background-color: #0a2c57;
}

.line {
  height: 2px;
  width: 80px;
  background-color: #ccc;
  margin-left: 8px;
  margin-right: 8px;
  z-index: 1;
}

.line.active {
  background-color: #5a28e5;
}

.label {
  font-size: 14px;
  margin-top: 8px;
  white-space: nowrap;
  text-align: center;
}
</style>
