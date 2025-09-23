<script setup>
import { ref, reactive, watch } from "vue";
import axios from "axios";

const props = defineProps({
  tongTien: {
    type: Number,
    required: true,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  maHoaDon: {  // ✅ Thêm prop này
    type: String,
    required: true,
  },
  loaiThanhToan: String,
});

const emit = defineEmits(["close", "xac-nhan"]);

const hinhThuc = ref("cod");
const maGiaoDichChinh = ref("");
const soTienKhachTra = ref(props.tongTien);

const danhSachThanhToan = reactive([
  { tenPhuongThuc: "Tiền mặt", maGiaoDich: "", soTien: props.tongTien },
]);

const PHUONG_THUC = [
  { label: "Tiền mặt", value: "tien_mat" },
  { label: "COD", value: "cod" },
  { label: "VNPay", value: "vnpay" },
  { label: "Momo", value: "momo" },
  { label: "QR code", value: "qrcode" },
];

const phuongThucChonNhieu = ref([]);

// Cập nhật khi hinhThuc thay đổi
watch(hinhThuc, (val) => {
  danhSachThanhToan.length = 0;
  if (val === "khac") {
    phuongThucChonNhieu.value = [];
  } else {
    const phuongThuc = PHUONG_THUC.find((p) => p.value === val);
    danhSachThanhToan.push({
      tenPhuongThuc: phuongThuc ? phuongThuc.label : "Không xác định",
      maGiaoDich: "",
      soTien: props.tongTien,
    });
  }
});

// Cập nhật khi chọn nhiều phương thức
watch(phuongThucChonNhieu, (list) => {
  danhSachThanhToan.length = 0;
  if (list.length) {
    const chiaTien = props.tongTien / list.length;
    list.forEach((val) => {
      const pt = PHUONG_THUC.find((p) => p.value === val);
      danhSachThanhToan.push({
        tenPhuongThuc: pt ? pt.label : val,
        maGiaoDich: "",
        soTien: chiaTien,
      });
    });
  }
});

// ✅ Cập nhật khi tongTien thay đổi
watch(
  () => props.tongTien,
  (newVal) => {
    soTienKhachTra.value = newVal;
    if (hinhThuc.value !== "khac") {
      danhSachThanhToan.length = 0;
      const phuongThuc = PHUONG_THUC.find((p) => p.value === hinhThuc.value);
      danhSachThanhToan.push({
        tenPhuongThuc: phuongThuc ? phuongThuc.label : "Không xác định",
        maGiaoDich: "",
        soTien: newVal,
      });
    } else {
      if (phuongThucChonNhieu.value.length) {
        const chiaTien = newVal / phuongThucChonNhieu.value.length;
        danhSachThanhToan.forEach((pt) => (pt.soTien = chiaTien));
      }
    }
  }
);

const themDong = () => {
  danhSachThanhToan.push({
    tenPhuongThuc: "Tiền mặt",
    maGiaoDich: "",
    soTien: 0,
  });
};

const formatCurrency = (val) => {
  return val?.toLocaleString("vi-VN") + " ₫";
};

// const xacNhanThanhToan = async () => {
//   const data = {
//     maHoaDon: props.maHoaDon,
//   };

//   if (hinhThuc.value === "khac") {
//     const tongNhap = danhSachThanhToan.reduce(
//       (acc, pt) => acc + (pt.soTien || 0),
//       0
//     );
//     if (tongNhap !== props.tongTien) {
//       alert("Tổng số tiền các phương thức không khớp với tổng cần thanh toán.");
//       return;
//     }
//     data.thanhToan = JSON.parse(JSON.stringify(danhSachThanhToan));
//   } else {
//     data.hinhThuc = hinhThuc.value;
//     data.maGiaoDich = maGiaoDichChinh.value;
//     data.soTienKhachTra = soTienKhachTra.value;
//   }

//   try {
//     await thanhToanDonHang(data);

//     // ✅ 1. Đóng modal
//     emit("close");

//     // ✅ 2. Gọi hàm ở cha
//     emit("thanh-toan-thanh-cong"); // bạn đặt tên event tùy ý
//   } catch (err) {
//     console.error(err);
//     alert("Thanh toán thất bại!");
//   }
// };
import Swal from "sweetalert2";
const xacNhanThanhToan = async () => {
  const data = {
    maHoaDon: props.maHoaDon,
  };

  if (hinhThuc.value === "khac") {
    const tongNhap = danhSachThanhToan.reduce(
      (acc, pt) => acc + (pt.soTien || 0),
      0
    );
    if (tongNhap !== props.tongTien) {
      await Swal.fire("Cảnh báo", "Tổng số tiền các phương thức không khớp với tổng cần thanh toán.", "warning");
      return;
    }
    data.thanhToan = JSON.parse(JSON.stringify(danhSachThanhToan));
  } else {
    data.hinhThuc = hinhThuc.value;
    data.maGiaoDich = maGiaoDichChinh.value;
    data.soTienKhachTra = soTienKhachTra.value;
  }

  try {
    // 👉 Hỏi xác nhận trước khi thanh toán
    const result = await Swal.fire({
      title: "Xác nhận thanh toán",
      text: `Bạn có chắc chắn muốn xác nhận thanh toán cho hoá đơn ${props.maHoaDon}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      console.log("❌ Người dùng đã huỷ thanh toán");
      return;
    }

    // --- Gọi API thanh toán ---
    await thanhToanDonHang(data);

    // --- Thông báo thành công ---
    await Swal.fire("Thành công", "Thanh toán thành công!", "success");

    // ✅ 1. Đóng modal
    emit("close");

    // ✅ 2. Gọi hàm ở cha
    emit("thanh-toan-thanh-cong");
  } catch (err) {
    console.error("❌ Lỗi khi thanh toán:", err);
    Swal.fire("Lỗi", "Thanh toán thất bại!", "error");
  }
};


const thanhToanDonHang = async (data) => {
  const danhSachThanhToan = [];

  if (Array.isArray(data.thanhToan)) {
    data.thanhToan.forEach((pt) => {
      danhSachThanhToan.push({
        maHinhThuc: pt.maGiaoDich || "",
        phuongThucThanhToan: pt.tenPhuongThuc,
        soTien: pt.soTien,
        moTa: "",
        ghiChu: "",
        trangThaiThanhToan: 1,
      });
    });
  } else {
    danhSachThanhToan.push({
      maHinhThuc: data.maGiaoDich || "",
      phuongThucThanhToan: data.hinhThuc,
      soTien: data.soTienKhachTra,
      moTa: "",
      ghiChu: "",
      trangThaiThanhToan: 1,
    });
  }

  const payload = {
    hoaDonId: data.maHoaDon,
    danhSachThanhToan,
  };

  console.log("Gửi thanh toán với payload:", payload);

  // ✅ Chọn API theo loaiThanhToan
  const apiUrl =
    props.loaiThanhToan === "phu-phi"
      ? "http://localhost:8080/thanh-toan/phu-phi"
      : "http://localhost:8080/thanh-toan/hoan-phi";

  try {
    const res = await axios.post(apiUrl, payload);
    console.log("✅ Thanh toán thành công:", res.data);
    // alert("Thanh toán thành công!");
  } catch (err) {
    console.error("❌ Lỗi khi thanh toán:", err);
    alert("Thanh toán thất bại!");
  }
};


</script>



<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

<template>
  <div v-if="visible" class=" , modal show d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Thanh toán</h5>
          <button type="button" class="btn-close" @click="emit('close')"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="fw-bold">Số tiền phải thanh toán:</label>
            <div class="fs-5 text-danger fw-bold">
              {{ formatCurrency(tongTien) }}
            </div>
          </div>

          <div class="mb-3">
            <label class="fw-bold">Hình thức thanh toán</label>
            <select v-model="hinhThuc" class="form-select">
              <!-- <option value="tien_mat">Tiền mặt</option> -->
              <option value="cod">COD</option>
              <option value="vnpay">VNPay</option>
              <option value="momo">Momo</option>
              <option value="qrcode">QR code</option>
              <option value="khac">Khác (chọn nhiều)</option>
            </select>
          </div>

          <!-- Nếu chọn "khác" thì hiển thị multi-select -->
          <div v-if="hinhThuc === 'khac'" class="mb-3">
            <label class="fw-bold">Chọn các phương thức:</label>
            <select
              v-model="phuongThucChonNhieu"
              class="form-select"
              multiple
              size="5"
            >
              <option v-for="pt in PHUONG_THUC" :key="pt.value" :value="pt.value">
                {{ pt.label }}
              </option>
            </select>
          </div>

          <!-- Table khi chọn "khác" -->
          <div v-if="hinhThuc === 'khac'" class="table-responsive">
            <table class="table table-bordered text-center">
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên phương thức</th>
                  <th>Mã giao dịch</th>
                  <th>Số tiền</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(pt, index) in danhSachThanhToan" :key="index">
                  <td>{{ index + 1 }}</td>
                  <td>{{ pt.tenPhuongThuc }}</td>
                  <td>
                    <input
                      v-model="pt.maGiaoDich"
                      class="form-control"
                      placeholder="Mã giao dịch nếu có"
                    />
                  </td>
                  <td>
                    <input
                      v-model.number="pt.soTien"
                      type="number"
                      class="form-control"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <button class="btn btn-outline-primary btn-sm" @click="themDong">
              + Thêm dòng
            </button>
          </div>

          <!-- Form đơn khi KHÔNG chọn "khác" -->
          <div class="row mb-3" v-if="hinhThuc !== 'khac'">
            <div class="col-md-6">
              <label class="fw-bold">Mã giao dịch:</label>
              <input
                v-model="maGiaoDichChinh"
                class="form-control"
                placeholder="Mã giao dịch nếu có"
              />
            </div>
            <div class="col-md-6">
              <label class="fw-bold">Số tiền khách trả:</label>
              <input
                v-model.number="soTienKhachTra"
                type="number"
                class="form-control"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="emit('close')">Hủy bỏ</button>
          <button class="btn btn-primary" @click="xacNhanThanhToan">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  </div>
</template>