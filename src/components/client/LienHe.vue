<template>
  <section class="contact-page">
   <TransitionGroup name="grid" tag="div" class="product-grid" appear >
    <div class="hero">
      <h1>Ghé thăm CoolMen</h1>
      <p>
        Trải nghiệm triết lý "Ít nhưng tốt" của chúng tôi tại hệ thống cửa hàng
        CoolMen trên toàn quốc, nơi dịch vụ tận tâm kết hợp cùng không gian
        mua sắm tinh gọn, ấm áp và cá nhân hóa.
      </p>
    </div>

    <div class="intro">
      <div class="intro-text">
        <h2>Cửa hàng</h2>
        <p>
          Tận hưởng trải nghiệm mua sắm của CoolMen với không gian tối giản,
          dịch vụ tư vấn tận tình và quy trình mua sắm mạch lạc. Khách hàng có
          thể trải nghiệm sản phẩm trực tiếp, nhận tư vấn phối đồ và các tùy
          chọn giao hàng linh hoạt.
        </p>
        <p>
          Hãy khám phá sự tiện lợi của mua sắm tại cửa hàng: không gian thoáng
          đãng, dịch vụ chuyên nghiệp và quy trình thanh toán nhanh chóng.
        </p>
      </div>
      <div class="intro-media">
        <img src="/src/assets/anh1.jpg" alt="Cửa hàng CoolMen" />
      </div>
    </div>

    <div class="stores-grid">
      <div class="store-card">
        <img src="/src/assets/banner-thoi-trang-nam-5.jpg" alt="CoolMen Hà Nội" />
        <p>Royal City — Hà Nội</p>
      </div>
      <div class="store-card">
        <img src="/src/assets/trang-tri-shop-quan-ao-1.jpg" alt="CoolMen TP.HCM" />
        <p>Saigon Centre — TP. Hồ Chí Minh</p>
      </div>
      <div class="store-card">
        <img src="/src/assets/anh2.jpg" alt="CoolMen Đà Nẵng" />
        <p>Vincom — Đà Nẵng</p>
      </div>
      <div class="store-card">
        <img src="/src/assets/Paner2.jpg" alt="CoolMen Hải Phòng" />
        <p>Vincom — Hải Phòng</p>
      </div>
      <div class="store-card">
        <img src="/src/assets/Paner1.png" alt="CoolMen Cần Thơ" />
        <p>Ninh Kiều — Cần Thơ</p>
      </div>
      <div class="store-card">
        <img src="/src/assets/Paner1.png" alt="CoolMen Nha Trang" />
        <p>Trần Phú — Nha Trang</p>
      </div>
      <div class="store-card">
        <img src="/src/assets/images.jpeg" alt="CoolMen Bình Dương" />
        <p>AEON — Bình Dương</p>
      </div>
      <div class="store-card">
        <img src="/src/assets/images1.jpeg" alt="CoolMen Đà Lạt" />
        <p>Phan Bội Châu — Đà Lạt</p>
      </div>
    </div>

    <div class="appointment">
      <div class="appointment-content">
        <h3>Đặt lịch tư vấn</h3>
        <p>
          Trải nghiệm dịch vụ tư vấn cá nhân hóa của CoolMen tại cửa hàng hoặc
          trực tuyến. Đội ngũ của chúng tôi sẵn sàng hỗ trợ chọn size, phối đồ
          theo nhu cầu và gu thẩm mỹ của bạn.
        </p>
        <div class="actions">
          <a class="btn" href="tel:0123456789">Gọi đặt lịch: 0123 456 789</a>
          <a class="btn btn-outline" href="mailto:care@coolmen.vn">Email: care@coolmen.vn</a>
        </div>
      </div>
      <div class="appointment-media">
        <img src="/src/assets/DanhMuc6.jpg" alt="Tư vấn tại CoolMen" />
      </div>
    </div>

    <div class="newsletter">
      <div class="newsletter-inner">
        <div class="left">
          <h4>Đăng ký nhận tin</h4>
          <p>Nhận thông tin sản phẩm mới và ưu đãi độc quyền từ CoolMen.</p>
        </div>
        <form class="right" @submit.prevent>
          <input type="email" placeholder="Nhập email của bạn" required />
          <button type="submit">Đăng ký</button>
        </form>
      </div>
    </div>
   </TransitionGroup>
  </section>
</template>

<script setup>
// Trang tĩnh hiển thị thông tin liên hệ và cửa hàng của CoolMen
</script>

<style scoped>
.contact-page {
  display: block;
  color: #111827;
  padding-top: 88px; /* chừa chỗ cho header cố định */
}

/* Transition-group animations for slide-up effect (đồng bộ các trang khác) */
.grid-enter-from,
.grid-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.grid-enter-active {
  transition: all 250ms ease;
}

.grid-leave-active {
  transition: all 220ms ease;
  position: relative;
}

.grid-move {
  transition: transform 300ms ease;
}

.hero {
  max-width: 960px;
  margin: 0 auto;
  text-align: center;
  padding: 32px 16px 8px;
}

.hero h1 {
  font-size: 28px;
  margin: 0 0 8px;
  font-weight: 700;
}

.hero p {
  color: #6b7280;
  line-height: 1.7;
}

.intro {
  max-width: 1100px;
  margin: 24px auto 8px;
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  gap: 24px;
  padding: 0 16px;
  align-items: start;
}

.intro-text h2 {
  margin: 0 0 12px;
  font-size: 20px;
}

.intro-text p {
  margin: 0 0 10px;
  color: #374151;
}

.intro-media img {
  width: 100%;
  height: 320px;
  object-fit: cover;
  border-radius: 8px;
}

.stores-grid {
  max-width: 1100px;
  margin: 8px auto 24px;
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.store-card img {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 8px;
}

.store-card p {
  margin: 6px 0 0;
  color: #6b7280;
  font-size: 14px;
}

.appointment {
  max-width: 1100px;
  margin: 8px auto 24px;
  padding: 16px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: center;
  background: #f9fafb;
  border-radius: 12px;
}

.appointment-media img {
  width: 100%;
  height: 260px;
  object-fit: cover;
  border-radius: 10px;
}

.appointment h3 {
  margin: 0 0 8px;
  font-size: 20px;
}

.appointment p {
  margin: 0 0 12px;
  color: #374151;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn {
  background: #111827;
  color: #fff;
  padding: 10px 14px;
  border-radius: 6px;
  text-decoration: none;
  display: inline-block;
}

.btn-outline {
  background: #fff;
  color: #111827;
  border: 1px solid #111827;
}

.newsletter {
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 0;
}

.newsletter-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: center;
}

.newsletter .right {
  display: flex;
  gap: 8px;
}

.newsletter input {
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  min-width: 260px;
}

.newsletter button {
  background: #111827;
  color: #fff;
  border: none;
  padding: 10px 14px;
  border-radius: 6px;
}

.contact-meta {
  max-width: 1100px;
  margin: 20px auto 40px;
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  color: #4b5563;
}

.contact-meta strong {
  color: #111827;
  display: inline-block;
  margin-bottom: 6px;
}

@media (max-width: 1024px) {
  .stores-grid { grid-template-columns: repeat(2, 1fr); }
  .intro { grid-template-columns: 1fr; }
  .appointment { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .stores-grid { grid-template-columns: 1fr; }
  .newsletter-inner { grid-template-columns: 1fr; }
  .contact-meta { grid-template-columns: 1fr; }
}
</style>