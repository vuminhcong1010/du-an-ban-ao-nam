<!-- <script setup>
import { ref } from "vue";

const props = defineProps({
  kho: Number,
  soLuongHienTai: Number,
  gia: Number,
  idHoaDon: String,
  idChiTietSanPham: Number,
  maChiTietSanPham: String
});

const emit = defineEmits(["close", "update"]);

const soLuongMoi = ref(props.soLuongHienTai);

// const xacNhan = () => {
//   if (soLuongMoi.value <= 0) {
//     alert("Số lượng phải lớn hơn 0");
//     return;
//   }
//   emit("update", soLuongMoi.value);
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

      const soLuongMua = quantities.value[item.maChiTietSapPham] || 1;

      return {
        idSanPhamChiTiet: item.maChiTietSapPham,
        gia: giaSauGiam,
        soLuong: soLuongMua,
        thanhTien: giaSauGiam * soLuongMua,
        idHoaDon: maHoaDon,
        trangThai: 0,
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
          maHoaDon: maHoaDon, // ✅ đúng tên trường trong DTO
          noiDungThayDoi: "Thêm sản phẩm",
          nguoiThucHien: "admin",
          ghiChu: "", // để backend tự sinh
          idChiTietSanPham: r.idSanPhamChiTiet,
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
</script> -->
<script setup>
import { ref } from "vue";
import Cookies from "js-cookie";
const props = defineProps({
  kho: Number,
  soLuongHienTai: Number,
  gia: Number,
  idHoaDon: String,
  idChiTietSanPham: Number,
  maChiTietSanPham: String
});


const token = Cookies.get("token");
const emit = defineEmits(["close", "update"]);

const soLuongMoi = ref(props.soLuongHienTai);

// // Hàm apply mới
// const apply = async () => {
//   try {
//     if (soLuongMoi.value <= 0) {
//       alert("Số lượng phải lớn hơn 0");
//       return;
//     }

//     // --- 1. Kiểm tra giảm giá cho sản phẩm hiện tại ---
//     const response = await fetch("http://localhost:8080/api/discounts/check", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify([props.idChiTietSanPham]), // chỉ gửi id sản phẩm hiện tại
//     });

//     if (!response.ok) throw new Error("Lỗi khi kiểm tra giảm giá");

//     const discountInfos = await response.json(); // [{ chiTietSanPhamId, phamTramGiam, soTienGiam }]
//     const discount = discountInfos.find(d => d.chiTietSanPhamId === props.idChiTietSanPham);

//     // --- 2. Tính giá sau giảm ---
//     let giaSauGiam = parseFloat(props.gia) || 0;
//     if (discount) {
//       if (discount.phamTramGiam != null) {
//         giaSauGiam = giaSauGiam * (1 - discount.phamTramGiam / 100);
//       } else if (discount.soTienGiam != null) {
//         giaSauGiam = giaSauGiam - discount.soTienGiam;
//       }
//     }
//     giaSauGiam = Math.max(Math.round(giaSauGiam), 0);

//     // --- 3. Cập nhật tồn kho ---
//     await fetch("http://localhost:8080/chi-tiet-san-pham/update-so-luong", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify([{
//         idSanPhamChiTiet: props.maChiTietSanPham,
//         soLuongMua: soLuongMoi.value - props.soLuongHienTai,
//       }]),
//     });

//     // --- 4. Lưu chi tiết hóa đơn ---
//     const chiTietHoaDon = [{
//       idSanPhamChiTiet: props.maChiTietSanPham,
//       gia: giaSauGiam,
//       soLuong: soLuongMoi.value - props.soLuongHienTai,
//       thanhTien: giaSauGiam * soLuongMoi.value,
//       idHoaDon: props.idHoaDon,
//       trangThai: 0,
//     }];

//     await fetch("http://localhost:8080/hoa-don-chi-tiet/add", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(chiTietHoaDon),
//     });

//     // --- 5. Ghi lịch sử ---
//     await fetch("http://localhost:8080/lich-su-hoa-don/them", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${token}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         maHoaDon: props.idHoaDon,
//         noiDungThayDoi: "Cập nhật số lượng sản phẩm",
//         nguoiThucHien: "admin",
//         ghiChu: "",
//         idChiTietSanPham: props.maChiTietSanPham,
//       }),
//     });

//     // --- 6. Emit ra ngoài ---
//     emit("update"); // cập nhật lại số lượng
//     emit("close");

//   } catch (err) {
//     console.error(err);
//   }
// };
import Swal from "sweetalert2";

const apply = async () => {
  try {
    if (soLuongMoi.value <= 0) {
      Swal.fire("Lỗi", "Số lượng phải lớn hơn 0", "error");
      return;
    }

    // --- 0. Xác nhận thay đổi ---
    const result = await Swal.fire({
      title: "Xác nhận",
      text: "Bạn có chắc chắn muốn thay đổi số lượng sản phẩm này?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Đồng ý",
      cancelButtonText: "Hủy",
      reverseButtons: true,
    });

    if (!result.isConfirmed) {
      console.log("❌ Người dùng đã hủy cập nhật số lượng");
      return;
    }

    // --- 1. Kiểm tra giảm giá cho sản phẩm hiện tại ---
    const response = await fetch("http://localhost:8080/api/discounts/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify([props.idChiTietSanPham]), // chỉ gửi id sản phẩm hiện tại
    });

    if (!response.ok) throw new Error("Lỗi khi kiểm tra giảm giá");

    const discountInfos = await response.json(); // [{ chiTietSanPhamId, phamTramGiam, soTienGiam }]
    const discount = discountInfos.find(d => d.chiTietSanPhamId === props.idChiTietSanPham);

    // --- 2. Tính giá sau giảm ---
    let giaSauGiam = parseFloat(props.gia) || 0;
    if (discount) {
      if (discount.phamTramGiam != null) {
        giaSauGiam = giaSauGiam * (1 - discount.phamTramGiam / 100);
      } else if (discount.soTienGiam != null) {
        giaSauGiam = giaSauGiam - discount.soTienGiam;
      }
    }
    giaSauGiam = Math.max(Math.round(giaSauGiam), 0);

    // --- 3. Cập nhật tồn kho ---
    await fetch("http://localhost:8080/chi-tiet-san-pham/update-so-luong", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{
        idSanPhamChiTiet: props.maChiTietSanPham,
        soLuongMua: soLuongMoi.value - props.soLuongHienTai,
      }]),
    });

    // --- 3. Lưu chi tiết hóa đơn ---
    const chiTietHoaDon = [{
      idSanPhamChiTiet: props.maChiTietSanPham,
      gia: giaSauGiam,
      soLuong: soLuongMoi.value - props.soLuongHienTai,
      thanhTien: giaSauGiam * soLuongMoi.value,
      idHoaDon: props.idHoaDon,
      trangThai: 0,
    }];

    await fetch("http://localhost:8080/hoa-don-chi-tiet/add", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(chiTietHoaDon),
    });

    // --- 4. Ghi lịch sử ---
    await fetch("http://localhost:8080/lich-su-hoa-don/them", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        maHoaDon: props.idHoaDon,
        noiDungThayDoi: "Cập nhật số lượng sản phẩm",
        nguoiThucHien: "admin",
        ghiChu: "",
        idChiTietSanPham: props.maChiTietSanPham,
      }),
    });

    // --- 5. Emit ra ngoài ---
    emit("update"); // cập nhật lại số lượng
    emit("close");

    // Swal.fire("Thành công", "Cập nhật số lượng sản phẩm thành công!", "success");

  } catch (err) {
    console.error(err);
    Swal.fire("Lỗi", "Không thể cập nhật số lượng. Vui lòng thử lại!", "error");
  }
};

</script>


<template>
  <!-- Nền tối -->
  <div class="modal-backdrop fade show" @click="emit('close')"></div>

  <!-- Popup -->
  <div class="modal show d-block" tabindex="-1">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Sửa số lượng</h5>
          <button type="button" class="btn-close" @click="emit('close')"></button>
        </div>

        <div class="modal-body">
          <p><strong>Kho:</strong> {{ kho }}</p>
          <p><strong>Gia:</strong> {{ gia }}</p>
          <!-- <p><strong>idChiTietSanPham:</strong> {{ idChiTietSanPham }}</p>
          <p><strong>maChiTietSanPham:</strong> {{ maChiTietSanPham }}</p>
          <p><strong>Ma hoa don:</strong> {{ idHoaDon }}</p> -->
          <div class="mb-3">
            <label class="form-label">Nhập số lượng cần sửa:</label>
            <input
              type="number"
              class="form-control"
              v-model.number="soLuongMoi"
            />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" @click="emit('close')">Hủy</button>
          <button class="btn btn-primary" @click="apply">Xác nhận</button>
        </div>
      </div>
    </div>
  </div>
</template>