import HoaDon from "@/components/admin/HoaDon.vue";
import { createRouter, createWebHistory } from "vue-router";
import PhieuGiamGia from "@/components/admin/PhieuGiamGia.vue";
import ThemPhieuGiamGia from "@/components/admin/ThemPhieuGiamGia.vue";
import SuaPhieuGiamGia from "@/components/admin/SuaPhieuGiamGia.vue";
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/hoa-don",
      name: "hoadon",
      component: HoaDon,
    },
    {
      path: "/phieu-giam-gia",
      name: "phieugiamgia",
      component: PhieuGiamGia,
    },
    {
      path: "/phieu-giam-gia/them",
      name: "ThemPhieuGiamGia",
      component: ThemPhieuGiamGia,
    },
    {
      path: "/phieu-giam-gia/sua/:id",
      name: "SuaPhieuGiamGia",
      component: SuaPhieuGiamGia,
    },
  ],
});

export default router;
