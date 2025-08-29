<script setup>
import { ref, provide } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from './components/admin/Sidebar.vue';
import Topbar from './components/admin/Topbar.vue';
import Chat from './components/admin/Chat.vue';

// Biến điều khiển hiển thị Sidebar và Topbar
const showSidebar = ref(false);
const showTopbar = ref(false);

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

const handleChatClose = () => {
  showChat.value = false; // Ẩn nhưng KHÔNG hủy Chat.vue
};

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

    <!-- Bong bóng chat -->
    <!-- ❌ trước đây dùng v-if -->
    <!-- ✅ giờ đổi thành v-show để component Chat.vue KHÔNG bị unmount -->
    <div v-show="showChat" class="chat-bubble-wrapper">
      <div class="chat-bubble-header">
        <span>Hỗ trợ trực tuyến</span>
        <button class="close-btn" @click="handleChatClose">✖</button>
      </div>
      <div class="chat-bubble-content">
        <Chat @room-selected="handleRoomSelected" @close="handleChatClose" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Reset và base styles */
#app-wrapper {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  color: #2c3e50;
  position: relative;
}

.main-content {
  width: 100%;
  min-height: 100vh;
}

/* Nút toggle */
.chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #007bff, #0056b3);
  border-radius: 50%;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.chat-toggle:hover {
  background: linear-gradient(135deg, #0056b3, #004085);
  transform: scale(1.1);
}

.chat-icon {
  font-size: 24px;
  color: white;
}

.unread-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background: #dc3545;
  color: white;
  border-radius: 50%;
  min-width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  border: 2px solid white;
}

/* Bong bóng chat */
.chat-bubble-wrapper {
  position: fixed;
  bottom: 80px;
  right: 20px;
  width: 370px;
  height: 500px;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
  background: white;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 2000;
  animation: slideUp 0.3s ease;
}

.chat-bubble-header {
  background: #007bff;
  color: white;
  padding: 10px 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  cursor: pointer;
  font-size: 16px;
}

.chat-bubble-content {
  flex: 1;
  overflow-y: auto;
}

@keyframes slideUp {
  from {
    transform: translateY(40px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>