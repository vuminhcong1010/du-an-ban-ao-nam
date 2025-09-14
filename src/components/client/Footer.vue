<template>
  <footer class="bg-light border-top footer-small">
    <div class="container">
      <div class="row">
        <!-- Logo + Mô tả -->
        <div class="col-md-3 mb-3">
          <img src="/src/assets/logo.png" alt="CoolMen" class="mb-2" style="max-width: 80px;">
          <p class="footer-text">
            CoolMen là thương hiệu thời trang nam mang đến những sản phẩm đa dạng từ áo thun, sơ mi, quần jeans, vest đến phụ kiện thời trang. 
            Chúng tôi cam kết cung cấp chất liệu bền đẹp, thiết kế tinh tế, giá cả hợp lý để mỗi khách hàng đều có thể tự tin khẳng định phong cách riêng.
          </p>
          <div class="d-flex gap-2 footer-icons">
            <a href="#"><i class="bi bi-facebook"></i></a>
            <a href="#"><i class="bi bi-instagram"></i></a>
            <a href="#"><i class="bi bi-shop"></i></a>
            <a href="#"><i class="bi bi-bag"></i></a>
            <a href="#"><i class="bi bi-tiktok"></i></a>
          </div>
        </div>

        <!-- Liên hệ -->
        <div class="col-md-3 mb-3">
          <h6 class="footer-title">LIÊN HỆ</h6>
          <p><strong>Địa chỉ:</strong> Số 5 Lữ Gia, Phố Triều Khúc, Nam Từ Liêm, Hà Nội</p>
          <p><strong>Điện thoại:</strong> 1900 6750</p>
          <p><strong>Zalo:</strong> 036 1234 567</p>
          <p><strong>Email:</strong> support@coolmen.vn</p>
        </div>

        <!-- Chính sách -->
        <div class="col-md-2 mb-3">
          <h6 class="footer-title">CHÍNH SÁCH</h6>
          <ul class="list-unstyled">
            <li><a href="#">Chính sách mua hàng</a></li>
            <li><a href="#">Chính sách thanh toán</a></li>
            <li><a href="#">Chính sách vận chuyển</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Cam kết cửa hàng</a></li>
            <li><a href="#">Chính sách thành viên</a></li>
          </ul>
        </div>

        <!-- Hướng dẫn -->
        <div class="col-md-2 mb-3">
          <h6 class="footer-title">HƯỚNG DẪN</h6>
          <ul class="list-unstyled">
            <li><a href="#">Hướng dẫn mua hàng</a></li>
            <li><a href="#">Hướng dẫn đổi trả</a></li>
            <li><a href="#">Hướng dẫn chuyển khoản</a></li>
            <li><a href="#">Hướng dẫn trả góp</a></li>
            <li><a href="#">Hướng dẫn hoàn hàng</a></li>
            <li><a href="#">Kiểm tra đơn hàng</a></li>
          </ul>
        </div>

        <!-- Thanh toán -->
        <div class="col-md-2 mb-3">
          <h6 class="footer-title">HỖ TRỢ THANH TOÁN</h6>
          <div class="d-flex flex-wrap gap-1">
            <img src="/src/assets/momo.png" alt="Momo" style="height:20px">
            <img src="/src/assets/QRCode.png" alt="ZaloPay" style="height:20px">
            <img src="/src/assets/vnpay-logo-vinadesign-25-12-57-55.jpg" alt="VNPay" style="height:20px">
          </div>
        </div>
      </div>

      <div class="text-center border-top pt-2 footer-copy">
        © 2025 Coolmen. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-small {
  font-size: 12px;   /* thu nhỏ toàn bộ text */
  padding: 15px 0;   /* giảm padding */
}

.footer-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

.footer-text {
  font-size: 11px;
  line-height: 1.4;
}

.footer-icons a {
  font-size: 16px;
  color: #000;
  transition: color 0.3s ease;
}
.footer-icons a:hover {
  color: #0a2c57;
}

.footer-copy {
  font-size: 11px;
  color: #666;
}

a {
  color: #000;
  text-decoration: none;
}
a:hover {
  color: #0a2c57;
  text-decoration: underline;
}
</style>
