<script setup>
import { ref, provide, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import Cookies from 'js-cookie'
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
const chatComponent = ref(null);

// Kiểm tra token để xác định user type
const isUser = Cookies.get("token");
const isEmployee = ref(!!isUser);

console.log('🔍 User type:', isEmployee.value ? 'Employee' : 'Customer');

const toggleChat = () => {
  const wasVisible = showChat.value;
  showChat.value = !showChat.value;
  
  console.log(`💬 Chat toggle: ${wasVisible ? 'visible' : 'hidden'} -> ${showChat.value ? 'visible' : 'hidden'}`);
  
  if (isEmployee.value) {
    // Logic cho nhân viên: ngắt/tạo lại kết nối
    if (showChat.value) {
      // Mở chat - tạo kết nối mới
      console.log('🔌 Employee: Tạo kết nối WebSocket mới');
      // Chat component sẽ tự động kết nối khi được mount/show
    } else {
      // Đóng chat - ngắt kết nối
      console.log('🔌 Employee: Ngắt kết nối WebSocket');
      if (chatComponent.value && typeof chatComponent.value.disconnectWebSocket === 'function') {
        chatComponent.value.disconnectWebSocket();
      }
    }
  } else {
    // Logic cho khách hàng: giữ kết nối liên tục
    console.log('👤 Customer: Giữ kết nối WebSocket liên tục');
    // Không làm gì với WebSocket connection
  }
};

const handleChatClose = () => {
  console.log('🔒 Chat close triggered');
  
  if (isEmployee.value) {
    // Nhân viên: ngắt kết nối khi đóng
    console.log('🔌 Employee: Ngắt kết nối WebSocket do đóng chat');
    if (chatComponent.value && typeof chatComponent.value.disconnectWebSocket === 'function') {
      chatComponent.value.disconnectWebSocket();
    }
  }
  
  showChat.value = false;
};

const handleRoomSelected = (roomId) => {
  console.log('📍 Phòng đã chọn:', roomId);
};

// Xử lý khi component bị unmount
onBeforeUnmount(() => {
  if (isEmployee.value && chatComponent.value && typeof chatComponent.value.disconnectWebSocket === 'function') {
    console.log('🔌 App unmount: Ngắt kết nối WebSocket');
    chatComponent.value.disconnectWebSocket();
  }
});

// Cung cấp thông tin user type cho Chat component
provide('isEmployee', isEmployee);
provide('shouldPersistConnection', !isEmployee.value);
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
      <!-- Hiển thị trạng thái user -->
      <div class="user-type-indicator">
        {{ isEmployee ? '👨‍💼' : '👤' }}
      </div>
    </div>
    
    <!-- Bong bóng chat -->
    <!-- Sử dụng v-show cho khách hàng để giữ kết nối, v-if cho nhân viên để ngắt kết nối -->
    <div v-if="isEmployee ? showChat : true" 
         v-show="showChat" 
         class="chat-bubble-wrapper">
      <div class="chat-bubble-header">
        <span>Hỗ trợ trực tuyến</span>
        <span class="user-type-badge">
          {{ isEmployee ? 'Nhân viên' : 'Khách hàng' }}
        </span>
        <button class="close-btn" @click="handleChatClose">✖</button>
      </div>
      <div class="chat-bubble-content">
        <Chat 
          ref="chatComponent"
          :is-visible="showChat"
          @room-selected="handleRoomSelected" 
          @close="handleChatClose" 
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
#app-wrapper {
  position: relative;
  height: 100vh;
}

.main-content {
  height: 100%;
  padding: 0;
}

.chat-toggle {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 60px;
  height: 60px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  transition: all 0.3s ease;
  z-index: 1000;
}

.chat-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 20px rgba(0, 123, 255, 0.4);
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
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}

.user-type-indicator {
  position: absolute;
  bottom: -5px;
  left: -5px;
  background: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.chat-bubble-wrapper {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 370px;
  height: 510px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 999;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.chat-bubble-header {
  background: #007bff;
  color: white;
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.user-type-badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.close-btn {
  background: transparent;
  border: none;
  color: white;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.chat-bubble-content {
  flex: 1;
  overflow: hidden;
}

/* Animation cho chat bubble */
.chat-bubble-wrapper {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>