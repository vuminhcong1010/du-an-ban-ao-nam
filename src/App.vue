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
const unreadMessagesCount = ref(0);

const toggleChat = () => {
  showChat.value = !showChat.value;
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
    <!-- Topbar -->
    <Topbar v-if="showTopbar" />

    <!-- Nội dung chính -->
    <div class="main-content">
      <router-view />
    </div>

    <!-- Nút toggle chat -->
    <div class="chat-toggle" @click="toggleChat">
      <div class="chat-icon">💬</div>
      <div v-if="unreadMessagesCount > 0" class="unread-badge">
        {{ unreadMessagesCount }}
      </div>
    </div>

    <!-- Chat Overlay -->
    <div v-if="showChat" class="chat-overlay" @click.self="handleChatClose">
      <div class="chat-container-wrapper">
        <Chat @room-selected="handleRoomSelected" @close="handleChatClose" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset và base styles */
#app-wrapper {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  position: relative;
}

/* Main content - cho phép scroll tự nhiên */
.main-content {
  width: 100%;
  min-height: 100vh; /* Đảm bảo chiều cao tối thiểu */
}

/* Chat toggle button */
.chat-toggle {
  position: fixed;
  bottom: 80px; /* Tăng khoảng cách từ bottom để tránh taskbar/dock */
  right: 20px; /* Giảm khoảng cách từ right để gần nội dung hơn */
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px; /* Giảm kích thước để ít chiếm chỗ hơn */
  height: 45px;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.chat-toggle:hover {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: scale(1.1);
}

.chat-icon {
  font-size: 26px;
  color: white;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  min-width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 2px 6px rgba(220, 53, 69, 0.3);
  border: 2px solid white;
}

/* Chat overlay */
.chat-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  padding: 20px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.chat-container-wrapper {
  width: 90%;
  max-width: 1200px;
  height: 85vh;
  max-height: 900px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  background: white;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .chat-toggle {
    bottom: 20px;
    right: 20px;
    width: 56px;
    height: 56px;
  }

  .chat-icon {
    font-size: 24px;
  }

  .chat-container-wrapper {
    width: 95%;
    height: 90vh;
    border-radius: 12px;
  }
}

@media (max-width: 576px) {
  .chat-overlay {
    padding: 10px;
  }

  .chat-container-wrapper {
    width: 100%;
    height: 95vh;
    border-radius: 8px;
  }
}
</style>