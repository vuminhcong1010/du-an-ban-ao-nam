<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { UserCog, Truck } from "lucide-vue-next";
import PopupChonKhachHang from "./ThemKhachHangHoaDon.vue";
import ChonDiaChiKhachHang from "./ChonDiaChiKhachHangHoaDon.vue";
import axios from "axios";
import { defineEmits } from "vue";

const emit = defineEmits(["capNhatThongTinKhachHang"]);
const props = defineProps({
  order: Object
});

// 0 = tại quầy, 1 = giao hàng
const phuongThucVanChuyen = ref(0);

// khách hàng:
// Hiển thị popup chọn khách hàng
const hienThiPopupChonKhach = ref(false);

// Thông tin khách hàng đã chọn
const khachHangDuocChon = ref(null);

// Mở popup
const moPopupChonKhach = () => {
  hienThiPopupChonKhach.value = true;
};

// Nhận khách hàng được chọn từ popup
const chonKhachHang = (khachHang) => {
  khachHangDuocChon.value = khachHang;
  hienThiPopupChonKhach.value = false;

  // Gán mặc định tên/sđt người nhận
  tenNguoiNhan.value = khachHang.tenKhachHang;
  sdtNguoiNhan.value = khachHang.soDienThoai;
};

// Bỏ chọn khách hàng
const boChonKhachHang = () => {
  khachHangDuocChon.value = null;
  diaChiGiaoHang.value = {
    diaChiChiTiet: "",
    xaPhuong: "",
    quanHuyen: "",
    tinhThanhPho: "",
  };
  tenNguoiNhan.value = "";
  sdtNguoiNhan.value = "";
  popupVisible.value = false;

  // 🔥 Xoá luôn mã giảm giá trong order
  if (props.order) {
    props.order.giamGia = null;
  }

  // Gửi cập nhật để xóa luôn trong component cha
  capNhatOrderKhachHang();
};

const tenNguoiNhan = ref("");
const sdtNguoiNhan = ref("");
//-------//

// lấy địa chỉ:

const diaChiGiaoHang = ref({
  diaChiChiTiet: "",
  xaPhuong: "",
  quanHuyen: "",
  tinhThanhPho: "",
}); // Địa chỉ đã chọn
watch(diaChiGiaoHang, (val) => {
  localStorage.setItem("diaChiGiaoHang", JSON.stringify(val));
}, { deep: true });


const popupVisible = ref(false); // Hiển thị popup chọn địa chỉ
const moPopupDiaChi = () => {
  if (!khachHangDuocChon.value?.id) return;
  popupVisible.value = true;
};
const dongPopupDiaChi = () => {
  popupVisible.value = false;
};
const chonDiaChi = async (dc) => {
  // Cập nhật trực tiếp object diaChiGiaoHang
  diaChiGiaoHang.value = {
    diaChiChiTiet: dc.diaChiChiTiet,
    xaPhuong: dc.xaPhuong,
    quanHuyen: dc.quanHuyen,
    tinhThanhPho: dc.tinhThanhPho,
  };

  // Tìm tỉnh theo tên và load quận
  const tinh = danhSachTinh.value.find((t) => t.name === dc.tinhThanhPho);
  if (tinh) {
    const resQuan = await axios.get(
      `https://provinces.open-api.vn/api/p/${tinh.code}?depth=2`
    );
    danhSachQuan.value = resQuan.data.districts;

    // Tìm quận và load phường
    const quan = resQuan.data.districts.find((q) => q.name === dc.quanHuyen);
    if (quan) {
      const resPhuong = await axios.get(
        `https://provinces.open-api.vn/api/d/${quan.code}?depth=2`
      );
      danhSachPhuong.value = resPhuong.data.wards;
    }
  }

  // Đóng popup sau khi chọn xong
  popupVisible.value = false;
  // ✅ THÊM DÒNG NÀY để đảm bảo cập nhật địa chỉ sang order
  // capNhatOrderKhachHang();
};

const danhSachTinh = ref([]);
const danhSachQuan = ref([]);
const danhSachPhuong = ref([]);

const tinhDuocChon = ref(null);
const quanDuocChon = ref(null);
const phuongDuocChon = ref(null);

onMounted(async () => {
  const res = await axios.get("https://provinces.open-api.vn/api/?depth=1");
  danhSachTinh.value = res.data;
  // Nếu đã có địa chỉ từ trước thì tự động load lại danh sách quận và phường tương ứng
  if (diaChiGiaoHang.value.tinhThanhPho) {
    const tinh = danhSachTinh.value.find(
      (t) => t.name === diaChiGiaoHang.value.tinhThanhPho
    );
    if (tinh) {
      const resQuan = await axios.get(
        `https://provinces.open-api.vn/api/p/${tinh.code}?depth=2`
      );
      danhSachQuan.value = resQuan.data.districts;

      const quan = danhSachQuan.value.find(
        (q) => q.name === diaChiGiaoHang.value.quanHuyen
      );
      if (quan) {
        const resPhuong = await axios.get(
          `https://provinces.open-api.vn/api/d/${quan.code}?depth=2`
        );
        danhSachPhuong.value = resPhuong.data.wards;
      }
    }
  }

});

const layQuanTheoTinh = async () => {
  const tinh = danhSachTinh.value.find(
    (t) => t.name === diaChiGiaoHang.value.tinhThanhPho
  );
  if (!tinh) return;

  const res = await axios.get(
    `https://provinces.open-api.vn/api/p/${tinh.code}?depth=2`
  );
  danhSachQuan.value = res.data.districts;

  // Reset các trường phụ thuộc
  diaChiGiaoHang.value.quanHuyen = "";
  diaChiGiaoHang.value.xaPhuong = "";
};

const layPhuongTheoQuan = async () => {
  const quan = danhSachQuan.value.find(
    (q) => q.name === diaChiGiaoHang.value.quanHuyen
  );
  if (!quan) return;

  const res = await axios.get(
    `https://provinces.open-api.vn/api/d/${quan.code}?depth=2`
  );
  danhSachPhuong.value = res.data.wards;

  diaChiGiaoHang.value.xaPhuong = "";
};

const diaChiDayDu = computed(() => {
  const dc = diaChiGiaoHang.value;
  if (!dc || !dc.diaChiChiTiet || !dc.xaPhuong || !dc.quanHuyen || !dc.tinhThanhPho) return "";
  return `${dc.diaChiChiTiet}, ${dc.xaPhuong}, ${dc.quanHuyen}, ${dc.tinhThanhPho}`;
});

// chuyển dữ liệu sang bán hàng: 
const capNhatOrderKhachHang = () => {
  emit("capNhatThongTinKhachHang", {
    idKhachHang: khachHangDuocChon.value?.id || null,
    tenKhachHang: khachHangDuocChon.value?.tenKhachHang || "Khách lẻ",
    tenNguoiNhan: tenNguoiNhan.value,
    sdt: sdtNguoiNhan.value,
    diaChi: diaChiDayDu.value,
    hinhThucNhanHang: phuongThucVanChuyen.value,
  });
};

const isUpdatingFromProps = ref(false);

// Gọi khi chọn khách, chọn địa chỉ, hoặc thay đổi input
watch(
  [khachHangDuocChon, diaChiGiaoHang, tenNguoiNhan, sdtNguoiNhan, phuongThucVanChuyen],
  () => {
    if (!isUpdatingFromProps.value) {
      capNhatOrderKhachHang();
    }
  },
  { deep: true }
);


watch(
  () => props.order,
  (newOrder) => {
    isUpdatingFromProps.value = true; // ⛔ chặn watcher emit tạm thời

    if (newOrder?.khachHang) {
      khachHangDuocChon.value = {
        id: newOrder.khachHang.idKhachHang,
        tenKhachHang: newOrder.khachHang.tenKhachHang,
        soDienThoai: newOrder.khachHang.sdt,
        email: "",
        gioiTinh: true,
      };

      tenNguoiNhan.value = newOrder.khachHang.tenNguoiNhan || "";
      sdtNguoiNhan.value = newOrder.khachHang.sdt || "";
      phuongThucVanChuyen.value = newOrder.hinhThucNhanHang ?? 0;

      if (newOrder.khachHang.diaChi) {
        const parts = newOrder.khachHang.diaChi.split(",").map((s) => s.trim());
        diaChiGiaoHang.value = {
          diaChiChiTiet: parts[0] || "",
          xaPhuong: parts[1] || "",
          quanHuyen: parts[2] || "",
          tinhThanhPho: parts[3] || "",
        };
      }
    }

    // Sau khi cập nhật xong props → cho phép emit lại
    setTimeout(() => {
      isUpdatingFromProps.value = false;
    }, 0);
  },
  { immediate: true, deep: true }
);

// theo dõi địa chỉ:
watch([
  () => diaChiGiaoHang.value.diaChiChiTiet,
  () => diaChiGiaoHang.value.xaPhuong,
  () => diaChiGiaoHang.value.quanHuyen,
  () => diaChiGiaoHang.value.tinhThanhPho,
], () => {
  if (!isUpdatingFromProps.value) {
    // diaChiDayDu();
    capNhatOrderKhachHang();
  }
});
</script>

<template>
  <!-- PHẦN KHÁCH HÀNG -->
  <div class="row gx-4">
    <div class="col-md-6">
      <div class="bg-white p-3 rounded mb-4 align-items-center border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">👤 Khách hàng</h5>
          <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
              width: 36px;
              height: 36px;
              background-color: #0a2c57;
              color: white;
            " title="Chọn khách hàng" @click="moPopupChonKhach">
            <UserCog size="20" />
          </button>
        </div>
        <!-- hiển thị thông tin khách hàng -->
        <div v-if="khachHangDuocChon && khachHangDuocChon.tenKhachHang">
          <div class="mb-2">
            <strong>Tên khách hàng:</strong>
            {{ khachHangDuocChon.tenKhachHang }}
          </div>
          <!-- Chỉ hiển thị các thông tin khác nếu KHÔNG phải khách lẻ -->
          <template v-if="khachHangDuocChon.id">
            <div class="mb-2">
              <strong>Số điện thoại:</strong> {{ khachHangDuocChon.soDienThoai }}
            </div>
            <div class="mb-2">
              <strong>Email:</strong>
              {{ khachHangDuocChon.email || "Chưa cập nhật" }}
            </div>
            <div class="mb-2">
              <strong>Giới tính:</strong>
              {{ khachHangDuocChon.gioiTinh ? "Nam" : "Nữ" }}
            </div>
               <button class="btn btn-sm btn-outline-danger mt-2" @click="boChonKhachHang">
            Bỏ chọn khách hàng
          </button>
          </template>
       
        </div>
        <div v-else class="text-muted"> <strong>Tên khách hàng:</strong> Khách lẻ.</div>
      </div>
    </div>

    <div class="col-md-6">
      <div class="bg-white p-3 rounded mb-4 border">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h5 class="mb-0">🚚 Thông tin giao hàng</h5>
          <Truck size="20" class="text-muted" />
        </div>

        <div class="mb-3">
          <label class="form-label">Phương thức vận chuyển:</label>
          <div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" id="shippingDirect" :value="0"
                v-model="phuongThucVanChuyen" />
              <label class="form-check-label" for="shippingDirect">Tại quầy</label>
            </div>
            <div class="form-check form-check-inline">
              <input class="form-check-input" type="radio" id="shippingDelivery" :value="1"
                v-model="phuongThucVanChuyen" />
              <label class="form-check-label" for="shippingDelivery">Giao hàng</label>
            </div>
          </div>
        </div>

        <!-- Nếu chọn GIAO HÀNG -->
        <div v-if="phuongThucVanChuyen === 1">
          <div class="row mb-3">
            <!-- Tên người nhận -->
            <div class="col-md-6">
              <label for="tenNguoiNhan" class="form-label">Tên người nhận:</label>
              <input type="text" id="tenNguoiNhan" class="form-control" placeholder="Nhập tên người nhận"
                v-model="tenNguoiNhan" />
            </div>

            <!-- Số điện thoại người nhận -->
            <div class="col-md-6">
              <label for="soDienThoaiNguoiNhan" class="form-label">Số điện thoại người nhận:</label>
              <input type="text" id="soDienThoaiNguoiNhan" class="form-control"
                placeholder="Nhập số điện thoại người nhận" v-model="sdtNguoiNhan" />
            </div>
          </div>

          <!-- dia chi -->

          <div class="alert alert-info py-2" role="alert">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5 class="mb-0">Địa chỉ giao hàng:</h5>

              <button class="btn border rounded-circle d-flex align-items-center justify-content-center" style="
                  width: 36px;
                  height: 36px;
                  background-color: #0a2c57;
                  color: white;
                " title="Chọn địa chỉ" @click="moPopupDiaChi">
                <UserCog size="20" />
              </button>
            </div>

            <!-- Form địa chỉ -->
            <div class="row g-3">
              <!-- Tỉnh/Thành phố -->
              <div class="col-md-6">
                <label>Tỉnh/Thành phố</label>
                <select class="form-select bg-white" v-model="diaChiGiaoHang.tinhThanhPho" @change="layQuanTheoTinh">
                  <option disabled value="">-- Chọn Tỉnh --</option>
                  <option v-for="tinh in danhSachTinh" :key="tinh.code" :value="tinh.name">
                    {{ tinh.name }}
                  </option>
                </select>
              </div>

              <!-- Quận/Huyện -->
              <div class="col-md-6">
                <label>Quận/Huyện</label>
                <select class="form-select bg-white" v-model="diaChiGiaoHang.quanHuyen" @change="layPhuongTheoQuan"
                  :disabled="!diaChiGiaoHang.tinhThanhPho">
                  <option disabled value="">-- Chọn Quận --</option>
                  <option v-for="quan in danhSachQuan" :key="quan.code" :value="quan.name">
                    {{ quan.name }}
                  </option>
                </select>
              </div>

              <!-- Phường/Xã -->
              <div class="col-md-6">
                <label>Phường/Xã</label>
                <select class="form-select bg-white" v-model="diaChiGiaoHang.xaPhuong"
                  :disabled="!diaChiGiaoHang.quanHuyen">
                  <option disabled value="">-- Chọn Phường --</option>
                  <option v-for="phuong in danhSachPhuong" :key="phuong.code" :value="phuong.name">
                    {{ phuong.name }}
                  </option>
                </select>
              </div>

              <!-- Số nhà/Đường -->
              <div class="col-md-6">
                <label>Địa chỉ chi tiết</label>
                <input class="form-control bg-white" v-model="diaChiGiaoHang.diaChiChiTiet"
                  placeholder="VD: 444 Đội Cấn" />
              </div>
            </div>
          </div>

          <!-- --- -->

          <div class="mt-3">
            <div class="d-flex align-items-center mb-2">
              <strong class="me-2">Đơn vị vận chuyển:</strong>
              <span>Giao hàng nhanh</span>
            </div>
            <div class="d-flex align-items-center">
              <strong class="me-2">Thời gian dự kiến:</strong>
              <span>17/5/2025</span>
            </div>
          </div>
        </div>

        <!-- Nếu chọn TẠI QUẦY -->
        <div v-else class="text-muted">Đơn hàng sẽ được xử lý tại quầy.</div>
      </div>
    </div>

    <PopupChonKhachHang v-if="hienThiPopupChonKhach" :currentSelectedCustomer="khachHangDuocChon"
      @customerSelected="chonKhachHang" @close="hienThiPopupChonKhach = false" />
    <ChonDiaChiKhachHang v-if="popupVisible" :khachHangId="khachHangDuocChon.id" @diaChiSelected="chonDiaChi"
      @close="dongPopupDiaChi" />
  </div>
</template>