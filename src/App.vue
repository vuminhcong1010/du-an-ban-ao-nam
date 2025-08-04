
<script setup>
import { ref, provide, watch } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/admin/Sidebar.vue';
import Topbar from './components/admin/Topbar.vue';
import Chat from './components/admin/Chat.vue';

// Biến điều khiển hiển thị Sidebar và Topbar
const showSidebar = ref(false);
const showTopbar = ref(false);

// Toggle Sidebar
function toggleSidebar() {
  showSidebar.value = !showSidebar.value;
}
provide('toggleSidebar', toggleSidebar);

// Toggle Chat
const showChat = ref(false);
const unreadMessagesCount = ref(0); // Giả định WebSocketService.unreadMessagesCount là ref

const toggleChat = () => {
  showChat.value = !showChat.value;
  if (showChat.value && unreadMessagesCount.value > 0) {
    // Reset unreadMessagesCount khi mở chat (tùy chọn)
    // unreadMessagesCount.value = 0;
  }
};

// Xử lý khi đóng chat từ component Chat
const handleChatClose = () => {
  showChat.value = false;
};

// Xử lý khi chọn phòng
const handleRoomSelected = (roomId) => {
  console.log('Phòng đã chọn:', roomId);
};


</script>


<template>
<div id="app-wrapper">
    <router-view></router-view>
  </div>
  <div class="d-flex flex-column vh-100">
    <Topbar v-if="showTopbar"/>
    <div class="d-flex flex-grow-1">
      
 
        <!-- Nút mở/đóng chat -->
        <div class="chat-toggle" @click="toggleChat">
          <div class="chat-icon">💬</div>
          <div v-if="unreadMessagesCount > 0" class="unread-badge">
            {{ unreadMessagesCount }}
          </div>
        </div>

        <!-- Component Chat -->
        <div v-if="showChat" class="chat-overlay" :class="{ show: showChat }">
          <div class="chat-container-wrapper">
            <Chat @room-selected="handleRoomSelected" @close="handleChatClose" />
          </div>
        </div>
      
    </div>
  </div>
</template>

<style scoped>
/* Đặt các style CSS toàn cục cho body, html, #app */
html, body {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  height: 100%;
}
#app-wrapper { /* Đổi id để tránh xung đột với #app trong index.html */
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  height: 100%;
}
/* Bố cục chính */
.d-flex {
  display: flex;
}



.bg-light {
  background-color: #f8f9fa;
}

/* Nút mở/đóng chat */
.chat-toggle {
  position: fixed;
  bottom: 30px;
  right: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  z-index: 10000;
}

.chat-toggle:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: scale(1.1);
}

.chat-icon {
  font-size: 24px;
  color: white;
}

.unread-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

/* Overlay cho Chat - TỐI ƯU HÓA ĐỘ RỘNG */
.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center; /* Căn giữa thay vì flex-end */
  align-items: center; /* Căn giữa theo chiều dọc */
  z-index: 2000;
  padding: 20px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.chat-overlay.show {
  opacity: 1;
}

.chat-container-wrapper {
  width: 90%; /* Tăng từ 100% lên 90% để tận dụng không gian */
  max-width: 1200px; /* Tăng từ 600px lên 1200px để rộng hơn */
  height: 85vh; /* Tăng từ 80vh lên 85vh */
  max-height: 900px; /* Tăng từ 800px lên 900px */
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  background: white;
  transform: translateY(100px);
  transition: transform 0.3s ease;
}

.chat-overlay.show .chat-container-wrapper {
  transform: translateY(0);
}

/* Responsive - CẢI THIỆN CHO MÀN HÌNH LỚN */
@media (min-width: 1400px) {
  .chat-container-wrapper {
    max-width: 1400px; /* Cho phép rộng hơn trên màn hình lớn */
  }
}

@media (min-width: 1200px) and (max-width: 1399px) {
  .chat-container-wrapper {
    width: 85%;
    max-width: 1200px;
  }
}

@media (min-width: 992px) and (max-width: 1199px) {
  .chat-container-wrapper {
    width: 80%;
    max-width: 1000px;
  }
}

@media (max-width: 991px) {
  .chat-container-wrapper {
    width: 95%;
    max-width: 800px;
  }
}

@media (max-width: 768px) {
  .chat-toggle {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }

  .chat-icon {
    font-size: 20px;
  }

  .unread-badge {
    width: 20px;
    height: 20px;
    font-size: 10px;
    top: -6px;
    right: -6px;
  }

  .chat-container-wrapper {
    width: 100%;
    height: 90vh;
    max-height: none;
    max-width: none; /* Bỏ giới hạn max-width trên mobile */
  }
}

@media (max-width: 576px) {
  .chat-overlay {
    padding: 10px;
  }

  .chat-container-wrapper {
    border-radius: 8px;
    width: 100%;
  }
}
</style>