<template>
    <div class="account-container">
        <div class="sidebar">
            <img :src="userAvatar" :alt="userName" class="user-avatar" />
            <h3 class="welcome-text">Welcome, {{ userName }}</h3>
            <p class="user-email">{{ userEmail }}</p>
            <nav class="account-nav">
                <ul>
                    <li :class="{ active: currentView === 'details' }" @click="changeView('details')">
                        <i class="fas fa-user"></i> My Details
                    </li>
                    <li :class="{ active: currentView === 'orders' }" @click="changeView('orders')">
                        <i class="fas fa-shopping-bag"></i> Orders
                    </li>
                    <li @click="logout">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </li>
                </ul>
            </nav>
        </div>
        <div class="content">
            <component :is="currentViewComponent"></component>
        </div>
    </div>
</template>


<script>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import MyAccount from './MyAccount.vue';
import OrderHistory from './OrderHistory.vue';
import { useAuthStore } from '@/stores/auth';
import Cookies from 'js-cookie';
import axios from 'axios';



export default {
    components: { MyAccount, OrderHistory },
    setup() {
        const router = useRouter();
        const authStore = useAuthStore();

        const currentView = ref('details');


        // Lấy thông tin người dùng từ store
        const user = computed(() => authStore.user);


        // Computed properties để lấy thông tin chi tiết từ user object
        const userAvatar = computed(() => {
            return user.value && user.value.hinhAnh
                ? user.value.hinhAnh
                : '/src/assets/logo_icon-removebg-preview.png';
        });


        const userName = computed(() => {
            return user.value && user.value.tenKhachHang ? user.value.tenKhachHang : 'User';
        });


        const userEmail = computed(() => {
            return user.value && user.value.email ? user.value.email : 'No email';
        });


        const currentViewComponent = computed(() => {
            switch (currentView.value) {
                case 'details':
                    return MyAccount;
                case 'orders':
                    return OrderHistory;
                default:
                    return MyAccount;
            }
        });


        const changeView = (view) => {
            currentView.value = view;
        };


        const logout = async () => {
            try {
                await axios.delete('http://localhost:8080/client/XoaGioHang', { withCredentials: true });
            } catch (error) {
                console.error('Xóa giỏ hàng thất bại:', error);
            }

            sessionStorage.removeItem("gioHang");
            localStorage.removeItem("gioHang");
            sessionStorage.removeItem("dataHoaDon");  // Nếu lưu dữ liệu hóa đơn đang tạo
            localStorage.removeItem("ttkh");          // Nếu lưu dữ liệu thanh toán QR Code

            // Thông báo cập nhật giỏ hàng nếu cần
            window.dispatchEvent(new Event("cap-nhat-gio"));

            authStore.logoutClient();

            router.push('/coolmen/dang-nhap-khach-hang');
        };



        return {
            user,
            userAvatar,
            userName,
            userEmail,
            currentView,
            currentViewComponent,
            changeView,
            logout
        };
    }
};
</script>


<style scoped>
/* GENERAL STYLES */
.account-container {
    display: flex;
    min-height: calc(100vh - 80px);
    /* Giả định header cao 80px */
    background-color: #f5f6f8;
    padding: 20px;
    font-family: 'Inter', sans-serif;
}


/* SIDEBAR STYLES */
.sidebar {
    width: 250px;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    display: flex;
    flex-direction: column;
    align-items: center;
}


.user-avatar {
    width: 90px;
    height: 90px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #e0e0e0;
    margin-bottom: 12px;
}


.welcome-text {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin-top: 0;
    margin-bottom: 4px;
    text-align: center;
}


.user-email {
    font-size: 0.875rem;
    color: #718096;
    margin-bottom: 24px;
    text-align: center;
}


.account-nav {
    width: 100%;
}


.account-nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}


.account-nav li {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    cursor: pointer;
    border-radius: 8px;
    transition: background-color 0.2s, color 0.2s;
    font-size: 1rem;
    font-weight: 500;
    color: #4a5568;
}


.account-nav li i {
    margin-right: 12px;
    font-size: 1.1rem;
}


.account-nav li:hover,
.account-nav li.active {
    background-color: #e2e8f0;
    color: #0a2c57;
}


.account-nav li:hover i,
.account-nav li.active i {
    color: #0a2c57;
}


/* CONTENT AREA STYLES */
.content {
    flex-grow: 1;
    margin-left: 20px;
    background-color: #ffffff;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}


/* Responsive adjustments */
@media (max-width: 768px) {
    .account-container {
        flex-direction: column;
        padding: 10px;
    }


    .sidebar {
        width: 100%;
        margin-bottom: 20px;
    }


    .content {
        margin-left: 0;
        padding: 20px;
    }
}
</style>
