<script setup>
import { ref } from "vue";
import { Plus, Trash } from "lucide-vue-next";
import ThemSanPham from "./ThemSanPhamBanHang.vue";
import Cookies from "js-cookie";
import { onMounted } from "vue";
const props = defineProps({
  order: Object,
  activeTab: Number,
  orders: Array,
});
const token = Cookies.get("token");
const hienThiThemSanPham = ref(false);

const moPopupThemSanPham = () => {
  hienThiThemSanPham.value = true;
};

const nhanSanPhamDaChon = async (danhSachSanPham) => {
  if (!props.order) return;

  const productIds = danhSachSanPham.map((item) => item.id);
  if (productIds.length === 0) return;

  try {
    const response = await fetch("http://localhost:8080/api/discounts/check", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(productIds),
    });

    if (!response.ok) {
      throw new Error("Lỗi khi kiểm tra giảm giá");
    }

    const discountInfos = await response.json(); // [{ chiTietSanPhamId, phamTramGiam, soTienGiam }]
    const discountMap = new Map();
    discountInfos.forEach((info) => {
      discountMap.set(info.chiTietSanPhamId, {
        phamTramGiam: info.phamTramGiam,
        soTienGiam: info.soTienGiam,
      });
    });

    const sanPhamDaCapNhatGia = danhSachSanPham.map((sanPham) => {
      const discount = discountMap.get(sanPham.id);
      let giaGoc = parseFloat(sanPham.gia);
      if (isNaN(giaGoc)) giaGoc = 0;

      let giaSauGiam = giaGoc;

      if (discount) {
        const { phamTramGiam, soTienGiam } = discount;
        if (phamTramGiam != null && !isNaN(phamTramGiam)) {
          giaSauGiam = giaGoc * (1 - phamTramGiam / 100);
        } else if (soTienGiam != null && !isNaN(soTienGiam)) {
          giaSauGiam = giaGoc - soTienGiam;
        }
      }

      giaSauGiam = Math.max(Math.round(giaSauGiam), 0);
      return {
        ...sanPham,
        gia: giaSauGiam,
        giaGoc: giaGoc,
        soLuong: 1,
      };
    });

    sanPhamDaCapNhatGia.forEach((spMoi) => {
      const indexTrung = props.order.listSanPham.findIndex(
        (spCu) => spCu.id === spMoi.id && spCu.gia === spMoi.gia
      );

      if (indexTrung !== -1) {
        // Đã có sản phẩm cùng ID và cùng giá → tăng số lượng
        props.order.listSanPham[indexTrung].soLuong =
          (props.order.listSanPham[indexTrung].soLuong || 1) + 1;
      } else {
        // Khác giá hoặc chưa có → thêm mới
        props.order.listSanPham.push(spMoi);
      }
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi:", error);
    // Nếu lỗi, thêm sản phẩm với giá gốc và logic tương tự
    danhSachSanPham.forEach((sanPham) => {
      const giaGoc = parseFloat(sanPham.gia) || 0;
      const spMoi = {
        ...sanPham,
        gia: giaGoc,
        giaGoc: giaGoc,
        soLuong: 1,
      };

      const indexTrung = props.order.listSanPham.findIndex(
        (spCu) => spCu.id === spMoi.id && spCu.gia === spMoi.gia
      );

      if (indexTrung !== -1) {
        props.order.listSanPham[indexTrung].soLuong =
          (props.order.listSanPham[indexTrung].soLuong || 1) + 1;
      } else {
        props.order.listSanPham.push(spMoi);
      }
    });

    alert("Không thể kiểm tra giảm giá, sản phẩm sẽ được thêm với giá gốc.");
  }
};

const xoaSanPhamKhoiDonHang = (index) => {
  props.order.listSanPham.splice(index, 1);
};

// validate:
const validateSoLuong = (item) => {
  const soLuongMoi = item.soLuong;
  const soLuongCu = item.soLuongTruocDo ?? soLuongMoi; // nếu chưa có thì dùng tạm

  // Nếu giá thay đổi và người dùng cố tình tăng số lượng → không cho
  if (item.baoGiaThayDoi && soLuongMoi > soLuongCu) {
    item.soLuong = soLuongCu;
    alert("Giá đã thay đổi, bạn không được tăng số lượng.");
    return;
  }

  // Kiểm tra vượt kho
  if (soLuongMoi > item.kho) {
    item.soLuong = item.kho;
    alert(`Số lượng vượt quá tồn kho: ${item.kho}`);
  } else if (soLuongMoi < 1) {
    item.soLuong = 1;
  }

  // ✅ Cập nhật lại mốc mới nếu không bị chặn
  item.soLuongTruocDo = item.soLuong;
};

onMounted(async () => {
  if (!props.order || !props.order.listSanPham.length) return;

  for (const sp of props.order.listSanPham) {
    try {
      const res = await fetch(
        `http://localhost:8080/chi-tiet-san-pham/find-by-id?id=${sp.id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Lỗi lấy giá từ backend");

      const sanPhamBackend = await res.json();

      const giaMoi = sanPhamBackend.gia; // giá hiện tại ở DB

      if (giaMoi !== sp.giaGoc) {
        // sp.giaGoc = sp.gia;
        sp.giaMoi = giaMoi;
        sp.baoGiaThayDoi = true;
      }
    } catch (err) {
      console.error(`Lỗi khi lấy giá cho sản phẩm ID ${sp.id}:`, err);
    }
  }
});
</script>

<template>
  <div class="bg-white p-3 rounded mb-4 align-items-center border">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">🛒 Giỏ hàng</h5>
      <button
        class="btn border rounded-circle d-flex align-items-center justify-content-center"
        style="
          width: 36px;
          height: 36px;
          background-color: #0a2c57;
          color: white;
        "
        @click="moPopupThemSanPham"
        title="Thêm sản phẩm"
      >
        <Plus size="20" />
      </button>
    </div>

    <div class="table-responsive bg-light rounded">
      <table class="table table-hover">
        <thead class="table-light">
          <tr>
            <th>STT</th>
            <th>Ảnh</th>
            <th>Thông tin chung</th>
            <th>Chi tiết</th>
            <th>Số lượng</th>
            <th>Giá bán</th>
            <th>Thành tiền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in order.listSanPham" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
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
            </td>
            <td>{{ item.idSanPham.tenSanPham }}</td>
            <td>
              <span>Size: {{ item.idSize.soCo }}</span> <br />
              <span>Màu sắc: {{ item.idMau.ten }}</span>
            </td>
            <td>
              <input
                type="number"
                class="form-control text-center"
                style="width: 70px"
                min="1"
                :max="item.soLuongTrongKho"
                v-model.number="item.soLuong"
                @input="() => validateSoLuong(item)"
              />
            </td>
            <td>
              <div v-if="item.giaGoc > item.gia">
                <div style="text-decoration: line-through; color: gray">
                  {{ item.giaGoc.toLocaleString() }}đ
                </div>
                <div style="color: red">{{ item.gia.toLocaleString() }}đ</div>
              </div>
              <div v-else>
                <div>{{ item.gia.toLocaleString() }}đ</div>
              </div>
              <div v-if="item.baoGiaThayDoi">
                <div style="color: red; font-weight: bold">
                  ⚠ Giá đã thay đổi từ {{ item.giaGoc }}đ → {{ item.giaMoi }}đ
                </div>
              </div>
            </td>
            <td>{{ (item.gia * item.soLuong).toLocaleString() }}đ</td>
            <td>
              <button
                class="btn p-1 border-0 bg-transparent d-flex align-items-center justify-content-center mx-auto"
                @click="xoaSanPhamKhoiDonHang(index)"
              >
                <Trash style="width: 16px; height: 16px; color: #0a2c57" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <ThemSanPham
      v-if="hienThiThemSanPham"
      :maHoaDon="order.maHoaDon"
      @selected="nhanSanPhamDaChon"
      @close="hienThiThemSanPham = false"
    />
  </div>
</template>