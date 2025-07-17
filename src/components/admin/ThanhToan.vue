<script setup>
import { ref, reactive, watch } from "vue";

const props = defineProps({
  tongTien: {
    type: Number,
    required: true,
  },
});

const hinhThuc = ref("tien_mat");
const maGiaoDichChinh = ref("");
const soTienKhachTra = ref(props.tongTien);

const danhSachThanhToan = reactive([
  { tenPhuongThuc: "Tiền mặt", maGiaoDich: "", soTien: props.tongTien },
]);

// Khi thay đổi hình thức thì reset danh sách
watch(hinhThuc, (val) => {
  if (val === "ca_hai") {
    danhSachThanhToan.length = 0;
    danhSachThanhToan.push(
      { tenPhuongThuc: "Tiền mặt", maGiaoDich: "", soTien: props.tongTien / 2 },
      {
        tenPhuongThuc: "Chuyển khoản",
        maGiaoDich: "",
        soTien: props.tongTien / 2,
      }
    );
  } else {
    danhSachThanhToan.length = 0;
    danhSachThanhToan.push({
      tenPhuongThuc: val === "tien_mat" ? "Tiền mặt" : "Chuyển khoản",
      maGiaoDich: "",
      soTien: props.tongTien,
    });
  }
});

const themDong = () => {
  danhSachThanhToan.push({
    tenPhuongThuc: "Chuyển khoản",
    maGiaoDich: "",
    soTien: 0,
  });
};

const formatCurrency = (val) => {
  return val?.toLocaleString("vi-VN") + " ₫";
};

const xacNhanThanhToan = () => {
  const data = {};

  if (hinhThuc.value === "ca_hai") {
    const tongNhap = danhSachThanhToan.reduce(
      (acc, pt) => acc + (pt.soTien || 0),
      0
    );
    if (tongNhap !== props.tongTien) {
      alert("Tổng số tiền các phương thức không khớp với tổng cần thanh toán.");
      return;
    }

    data.thanhToan = JSON.parse(JSON.stringify(danhSachThanhToan));
  } else {
    data.hinhThuc = hinhThuc.value;
    data.maGiaoDich = maGiaoDichChinh.value;
    data.soTienKhachTra = soTienKhachTra.value;
  }

  emit("xac-nhan", data);
};


const emit = defineEmits(["close", "xac-nhan"]);
</script>

<style scoped>
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>

<template>
  <div class="modal show d-block" tabindex="-1">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Thanh toán</h5>
          <button
            type="button"
            class="btn-close"
            @click="emit('close')"
          ></button>
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
              <option value="tien_mat">Tiền mặt</option>
              <option value="chuyen_khoan">Chuyển khoản</option>
              <option value="ca_hai">Cả hai</option>
            </select>
          </div>

          <!-- Table khi chọn "cả hai" -->
          <div v-if="hinhThuc === 'ca_hai'" class="table-responsive">
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
                  <td>
                    <select v-model="pt.tenPhuongThuc" class="form-select">
                      <option value="Tiền mặt">Tiền mặt</option>
                      <option value="Chuyển khoản">Chuyển khoản</option>
                    </select>
                  </td>
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
          <div class="row mb-3" v-if="hinhThuc !== 'ca_hai'">
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
          <button class="btn btn-secondary" @click="emit('close')">
            Hủy bỏ
          </button>
          <button class="btn btn-primary" @click="xacNhanThanhToan">
            Xác nhận
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
