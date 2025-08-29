<template>
  <div class="chat-container">
    <!-- Sidebar danh sách phòng cho nhân viên -->
    <div v-if="isEmployee" class="rooms-sidebar">
      <div class="sidebar-header">
        <h3>Danh sách phòng chat</h3>
        <div class="room-count">{{ danhSachPhongChat.length }} phòng</div>
      </div>
      
      <div class="rooms-list">
        <div 
          v-for="room in danhSachPhongChat" 
          :key="room.id || room"
          @click="selectRoom(room)"
          :class="['room-item', { 'active': selectedRoom === room }]"
        >
          <!-- Nếu room là object với thông tin chi tiết -->
          <div v-if="typeof room === 'object'" class="room-content">
            <div class="room-avatar">
              {{ (room.tenKhachHang || room.name || 'KH').charAt(0).toUpperCase() }}
            </div>
            <div class="room-details">
              <div class="room-name">{{ room.tenPhong || room.name || `Phòng ${room.id}` }}</div>
              <div class="room-info">{{ room.tenKhachHang || 'Khách hàng' }}</div>
              <div v-if="room.lastMessage" class="last-message">{{ room.lastMessage }}</div>
            </div>
            <div class="room-status">
              <div v-if="room.unreadCount" class="unread-badge">{{ room.unreadCount }}</div>
              <div class="time">{{ room.lastMessageTime || '' }}</div>
            </div>
          </div>
          
          <!-- Nếu room chỉ là string -->
          <div v-else class="room-content">
            <div class="room-avatar">{{ room.charAt(0).toUpperCase() }}</div>
            <div class="room-details">
              <div class="room-name">{{ room }}</div>
              <div class="room-info">Phòng chat</div>
            </div>
          </div>
        </div>
        
        <!-- Empty state -->
        <div v-if="danhSachPhongChat.length === 0" class="empty-rooms">
          <div class="empty-icon">💬</div>
          <div class="empty-text">Chưa có phòng chat nào</div>
        </div>
      </div>
    </div>
    
    <!-- Khu vực chat chính -->
    <div class="chat-main">
      <!-- Header -->
      <div class="chat-header">
        <div class="header-left">
          <div v-if="isEmployee && selectedRoom" class="room-info-header">
            <div class="room-avatar-small">
              {{ (typeof selectedRoom === 'object' 
                   ? (selectedRoom.tenKhachHang || selectedRoom.name || 'KH') 
                   : selectedRoom).charAt(0).toUpperCase() }}
            </div>
            <div>
              <h4 class="room-title">
                {{ typeof selectedRoom === 'object' 
                    ? (selectedRoom.tenPhong || selectedRoom.name || `Phòng ${selectedRoom.id}`) 
                    : selectedRoom }}
              </h4>
              <div v-if="typeof selectedRoom === 'object' && selectedRoom.tenKhachHang" class="customer-name">
                {{ selectedRoom.tenKhachHang }}
              </div>
            </div>
          </div>
          
          <!-- 👇 Chỗ này dành cho khách hàng -->
          <div v-else-if="!isEmployee" class="room-info-header flex items-center gap-2 mb-2">
            <div class="room-avatar-small">CS</div>
            <div>
              <h4 class="room-title">Chat hỗ trợ khách hàng</h4>
              <div class="customer-name">Đang chờ hỗ trợ</div>
            </div>
            <!-- Nút Chat với nhân viên -->
            <button 
              @click="yeuCauNhanVien()" 
              class="ml-3 px-2 py-0.5 text-xs bg-blue-500 text-black rounded hover:bg-blue-600 transition w-[60px]"
            >
              <div v-if="ChatAI" class="customer-name">Chat với nhân viên</div>
              <div v-else class="customer-name">Chat với AI</div>
            </button>
          </div>
          
          <div v-else class="room-info-header">
            <h4 class="room-title">Chọn phòng để bắt đầu chat</h4>
          </div>
        </div>
        
        <div class="header-right">
          <div class="connection-status" :class="{ 'connected': isConnected }">
            <div class="status-dot"></div>
            {{ isConnected ? 'Đã kết nối' : 'Đang kết nối...' }}
          </div>
        </div>
      </div>
      
      <!-- Khung tin nhắn -->
      <div class="messages-container" ref="messagesContainer">
        <!-- No room selected state -->
        <div v-if="!roomId && isEmployee" class="no-room-selected">
          <div class="no-room-icon">💬</div>
          <h3>Chọn một phòng chat</h3>
          <p>Vui lòng chọn một phòng từ danh sách bên trái để bắt đầu trò chuyện</p>
        </div>
        
        <!-- Loading state -->
        <div v-if="isLoadingMessages" class="loading-messages">
          <div class="spinner"></div>
          Đang tải tin nhắn...
        </div>
        
        <!-- Messages -->
        <div v-else class="messages-list">
          
          
          <div 
            v-for="(msg, index) in messages" 
            :key="index" 
            :class="['message', { 
              'own-message': msg.sender === (isEmployee ? 'Nhân viên' : 'Khách hàng'),
              'other-message': msg.sender !== (isEmployee ? 'Nhân viên' : 'Khách hàng')
            }]"
          >
            <div class="message-bubble">
              <div class="message-header">
                <span class="message-sender">{{ msg.sender }}</span>
                <span class="message-time">{{ msg.timestamp }}</span>
              </div>
              <div class="message-content">{{ msg.content }}</div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Input gửi tin nhắn -->
      <div class="message-input-container">
        <div class="message-input" :class="{ 'disabled': !isConnected || !roomId }">
          <div class="input-wrapper">
            <input 
              v-model="message" 
              @keyup.enter="sendMessage"
              @input="handleTyping"
              placeholder="Nhập tin nhắn..."
              :disabled="!isConnected || !roomId"
              class="message-input-field"
            />
            <button 
              @click="sendMessage" 
              :disabled="!isConnected || !message.trim() || !roomId"
              class="send-button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
              </svg>
            </button>
          </div>
          

        </div>
      </div>

    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import Cookies from 'js-cookie'
import axios from 'axios'
import { useToast } from "vue-toastification";

const toast = useToast();
const message = ref('')
const messages = ref([])
const isConnected = ref(false)
const isLoadingMessages = ref(false)
let stompClient = null
const roomId = ref('waiting-room')
const danhSachPhongChat = ref([])
const selectedRoom = ref('')
const isEmployee = ref(false)
const activeSubscriptions = new Map()
const messagesContainer = ref(null)
let ChatAI = ref(true)
const isUser = Cookies.get("token")

// Hàm tải lịch sử tin nhắn
const loadMessageHistory = async (roomId) => {
  isLoadingMessages.value = true
  try {
    const response = await axios.get(`http://localhost:8080/lich-su-phong-chat/${roomId}`)
    const history = response.data.data || []
    messages.value = history.map(msg => ({
      sender: msg.sender,
      content: msg.content,
      timestamp: new Date(msg.timestamp).toLocaleTimeString()
    }))
    scrollToBottom()
  } catch (error) {
    console.error('❌ Lỗi khi tải lịch sử tin nhắn:', error)
  } finally {
    isLoadingMessages.value = false
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

watch(messages, () => {
  scrollToBottom()
}, { deep: true })
onMounted(async () => {
  if (!isUser) {
    isEmployee.value = false
    const thongTinCookie = Cookies.get("thongTinKhachHang")
    
    if (!thongTinCookie) {
      toast.error('Vui lòng đăng nhập để sử dụng chức năng này')
      return
    }
    
    let thongTin
    try {
      thongTin = JSON.parse(thongTinCookie)
    } catch (e) {
      console.error("❌ Cookie 'thongTinKhachHang' không hợp lệ JSON:", e)
      return
    }

    connectWebSocket()

    // ❌ Bỏ việc gọi trực tiếp loadMessageHistory ở đây
    // Vì lúc này roomId.value thường chưa có
  } else {
    isEmployee.value = true
    const token = Cookies.get("token")
    const payload = JSON.parse(atob(token.split('.')[1]))
    let idNV = payload.idNv
    
    if (!idNV) {
      console.error("❌ Không tìm thấy idNV cho nhân viên")
      return
    }
    
    await axios.get(`http://localhost:8080/danh-sach-phong-chat/${idNV}`).then(res => {
      danhSachPhongChat.value = res.data.data.map(roomId => ({
        id: roomId,
        name: `Phòng ${roomId}`,
        tenKhachHang: roomId.split('-')[0],
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0
      }))
      connectWebSocketForEmployee()
      
      if (danhSachPhongChat.value && danhSachPhongChat.value.length > 0) {
        selectRoom(danhSachPhongChat.value[0])
        loadMessageHistory(danhSachPhongChat.value[0].id)
      }
    }).catch((err) => {
      console.error("❌ Lỗi khi lấy danh sách phòng chat:", err)
    })
  }
})

// 👇 Watch để user load khi roomId thay đổi
watch(roomId, async (newVal) => {
  if (newVal && newVal !== 'waiting-room') {
    console.log("📌 User load history khi roomId có:", newVal)
    await loadMessageHistory(newVal)
  }
})

// ✅ Giải pháp: Thêm flag để phân biệt tin nhắn local và từ server
const pendingMessages = ref(new Set()) // Track các tin nhắn đang chờ xác nhận

// ✅ Hàm sendMessage với optimistic UI update
function sendMessage() {
  if (!message.value.trim() || !roomId.value) return

  const messageContent = message.value
  const messageTimestamp = new Date().toISOString()
  const messageId = `local-${Date.now()}-${Math.random()}` // ID unique cho tin nhắn local
  
  const customerMessage = {
    id: messageId,
    sender: isEmployee.value ? 'Nhân viên' : 'Khách hàng',
    content: messageContent,
    timestamp: new Date(messageTimestamp).toLocaleTimeString(),
    isLocal: true, // Flag đánh dấu tin nhắn local
    isPending: true // Đang chờ xác nhận từ server
  }

  // Thêm tin nhắn vào UI ngay lập tức (optimistic update)
  messages.value.push(customerMessage)
  pendingMessages.value.add(messageId)

  if (stompClient && stompClient.connected) {
    try {
      stompClient.publish({
        destination: `/app/room/${roomId.value}/send`,
        body: JSON.stringify({
          sender: customerMessage.sender,
          content: messageContent,
          timestamp: messageTimestamp,
          localId: messageId // Gửi localId để có thể mapping
        })
      })
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error)
      toast.error('Không thể gửi tin nhắn.')
      
      // Xóa tin nhắn khỏi UI nếu gửi thất bại
      const index = messages.value.findIndex(m => m.id === messageId)
      if (index > -1) {
        messages.value.splice(index, 1)
      }
      pendingMessages.value.delete(messageId)
    }
  } else {
    toast.error('WebSocket chưa kết nối.')
    // Xóa tin nhắn khỏi UI nếu không có kết nối
    const index = messages.value.findIndex(m => m.id === messageId)
    if (index > -1) {
      messages.value.splice(index, 1)
    }
    pendingMessages.value.delete(messageId)
  }

  message.value = ''
}

// ✅ Cải thiện connectWebSocket để xử lý tin nhắn từ server
function connectWebSocket() {
  if (!roomId.value) return
  
  const socket = new SockJS('/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      isConnected.value = true
      stompClient.subscribe(`/topic/room/${roomId.value}/messages`, (msg) => {
        try {
          const body = JSON.parse(msg.body)
          
          // Nếu có localId, tìm và cập nhật tin nhắn local
          if (body.localId && pendingMessages.value.has(body.localId)) {
            const localMessageIndex = messages.value.findIndex(m => m.id === body.localId)
            if (localMessageIndex > -1) {
              // Cập nhật tin nhắn local thành tin nhắn đã được server xác nhận
              messages.value[localMessageIndex] = {
                ...messages.value[localMessageIndex],
                isPending: false,
                isLocal: false,
                timestamp: new Date(body.timestamp).toLocaleTimeString()
              }
            }
            pendingMessages.value.delete(body.localId)
            return // Không thêm tin nhắn mới
          }
          
          // Tin nhắn từ người khác hoặc từ server không có localId
          const messageData = {
            id: `server-${body.timestamp}-${Math.random()}`,
            sender: body.sender,
            content: body.content,
            timestamp: new Date(body.timestamp).toLocaleTimeString(),
            isLocal: false,
            isPending: false
          }

          // Kiểm tra duplicate dựa trên content và thời gian gần nhau
          const isDuplicate = messages.value.some(m => 
            m.content === messageData.content && 
            m.sender === messageData.sender &&
            Math.abs(new Date(`1970-01-01 ${m.timestamp}`).getTime() - 
                    new Date(`1970-01-01 ${messageData.timestamp}`).getTime()) < 2000 // 2 giây
          )

          if (!isDuplicate) {
            messages.value.push(messageData)
          }
        } catch (error) {
          console.error('Lỗi parse message:', error)
        }
      })
    }
  })
  stompClient.activate()
}

// ✅ Tương tự cho connectWebSocketForEmployee
function connectWebSocketForEmployee() {
  const socket = new SockJS('/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      isConnected.value = true
      danhSachPhongChat.value.forEach(room => {
        const roomIdToSubscribe = typeof room === 'object' ? room.id : room
        const subscription = stompClient.subscribe(`/topic/room/${roomIdToSubscribe}/messages`, (msg) => {
          try {
            const body = JSON.parse(msg.body)
            
            // Xử lý tin nhắn cho phòng hiện tại
            if (roomIdToSubscribe === roomId.value) {
              // Nếu có localId, cập nhật tin nhắn local
              if (body.localId && pendingMessages.value.has(body.localId)) {
                const localMessageIndex = messages.value.findIndex(m => m.id === body.localId)
                if (localMessageIndex > -1) {
                  messages.value[localMessageIndex] = {
                    ...messages.value[localMessageIndex],
                    isPending: false,
                    isLocal: false,
                    timestamp: new Date(body.timestamp).toLocaleTimeString()
                  }
                }
                pendingMessages.value.delete(body.localId)
                return
              }
              
              // Tin nhắn từ người khác
              const messageData = {
                id: `server-${body.timestamp}-${Math.random()}`,
                roomId: roomIdToSubscribe,
                sender: body.sender,
                content: body.content,
                timestamp: new Date(body.timestamp).toLocaleTimeString(),
                isLocal: false,
                isPending: false
              }
              
              // Kiểm tra duplicate
              const isDuplicate = messages.value.some(m => 
                m.content === messageData.content && 
                m.sender === messageData.sender &&
                Math.abs(new Date(`1970-01-01 ${m.timestamp}`).getTime() - 
                        new Date(`1970-01-01 ${messageData.timestamp}`).getTime()) < 2000
              )

              if (!isDuplicate) {
                messages.value.push(messageData)
              }
            }
          } catch (error) {
            console.error('Lỗi parse message:', error)
          }
        })
        activeSubscriptions.set(roomIdToSubscribe, subscription)
      })
    }
  })
  stompClient.activate()

// ✅ Timeout để cleanup các tin nhắn pending quá lâu
setTimeout(() => {
  pendingMessages.value.forEach(messageId => {
    const messageIndex = messages.value.findIndex(m => m.id === messageId && m.isPending)
    if (messageIndex > -1) {
      // Đánh dấu tin nhắn là failed hoặc xóa nó
      messages.value[messageIndex].isPending = false
      messages.value[messageIndex].failed = true
    }
    pendingMessages.value.delete(messageId)
  })
}, 10000) // 10 giây timeout
}

function selectRoom(room) {
  selectedRoom.value = room
  roomId.value = typeof room === 'object' ? room.id : room
  messages.value = []
  loadMessageHistory(roomId.value)
}

onBeforeUnmount(() => {
  if (stompClient) {
    activeSubscriptions.forEach(subscription => subscription.unsubscribe())
    activeSubscriptions.clear()
    stompClient.deactivate()
  }
})

async function yeuCauNhanVien() {
  
  console.log(roomId.value);
  if(ChatAI.value===true){
    ChatAI.value=false
    toast.success('Đã chuyển sang chat với nhân viên')
  }else{
    ChatAI.value=true
    toast.success('Đã chuyển sang chat với AI')
  }
  if (!roomId.value) {
    console.warn("⚠ Không có roomId để hủy đăng ký.");
  } else {
    const subscription = activeSubscriptions.get(roomId.value);
    if (subscription) {
      subscription.unsubscribe();
      activeSubscriptions.delete(roomId.value);
      console.log(`✅ Đã hủy đăng ký phòng ${roomId.value}`);
      toast.success(`Đã rời khỏi phòng ${roomId.value}`);
    } else {
      console.warn(`⚠ Không tìm thấy subscription cho phòng ${roomId.value}`);
    }
  }

  roomId.value = '';
  selectedRoom.value = '';
  messages.value = [];

  // Phần async xử lý user/employee
  if (!isUser) {
    // Xử lý khách hàng
    isEmployee.value = false;
    const thongTinCookie = Cookies.get("thongTinKhachHang");
    
    if (!thongTinCookie) {
      toast.error('Vui lòng đăng nhập để sử dụng chức năng này');
      return;
    }
    
    let thongTin;
    try {
      thongTin = JSON.parse(thongTinCookie);
    } catch (e) {
      console.error("❌ Cookie 'thongTinKhachHang' không hợp lệ JSON:", e);
      return;
    }
    if(ChatAI.value===false){
      const idKH = thongTin.maKhachHang;
    try {
      const response = await axios.get(`http://localhost:8080/create-room/${idKH}`);
      if (response.data.data === false) {   
        toast.info("Hiện tại không có nhân viên nào đang online vui lòng thử lại sau");
      } else {
        roomId.value = response.data.message;
      }
      connectWebSocket();
      
    } catch (error) {
      console.error('Lỗi khi tạo phòng:', error);
    }
  }else{
    roomId.value = 'waiting-room'
    connectWebSocket();
  }
    

  } else {
    // Xử lý nhân viên
    isEmployee.value = true;
    const token = Cookies.get("token");
    const payload = JSON.parse(atob(token.split('.')[1]));
    let idNV = payload.idNv;

    if (!idNV) {
      console.error("❌ Không tìm thấy idNV cho nhân viên");
      return;
    }

    try {
      const res = await axios.get(`http://localhost:8080/danh-sach-phong-chat/${idNV}`);
      danhSachPhongChat.value = res.data.data.map(roomId => ({
        id: roomId,
        name: `Phòng ${roomId}`,
        tenKhachHang: roomId.split('-')[0],
        lastMessage: '',
        lastMessageTime: '',
        unreadCount: 0
      }));
      console.log('Danh sách phòng chat:', res.data.data);

      connectWebSocketForEmployee();

      if (danhSachPhongChat.value && danhSachPhongChat.value.length > 0) {
        selectRoom(danhSachPhongChat.value[0]);
        loadMessageHistory(danhSachPhongChat.value[0].id);
      }
    } catch (err) {
      console.error("❌ Lỗi khi lấy danh sách phòng chat:", err);
    }
  }
}


</script>


<style scoped>
.chat-container {
  display: flex;
  width: 370px;
  height: 450px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: white;
}

/* === SIDEBAR === */
.rooms-sidebar {
  width: 100px;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 8px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.sidebar-header h3 {
  margin: 0 0 3px 0;
  font-size: 0.8em;
  font-weight: 600;
  color: #1a1a1a;
}

.room-count {
  font-size: 0.6em;
  color: #666;
}

.rooms-list {
  flex: 1;
  overflow-y: auto;
}

.room-item {
  padding: 6px 8px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.2s ease;
  position: relative;
}

.room-item:hover {
  background-color: #f5f7fa;
}

.room-item.active {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
}

.room-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #ffc107;
}

.room-content {
  display: flex;
  align-items: center;
  gap: 4px;
}

.room-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8em;
  flex-shrink: 0;
}

.room-item.active .room-avatar {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
}

.room-details {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-weight: 600;
  margin-bottom: 1px;
  font-size: 0.7em;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-info {
  font-size: 0.6em;
  opacity: 0.7;
  margin-bottom: 1px;
}

.last-message {
  font-size: 0.55em;
  opacity: 0.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.unread-badge {
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.55em;
  font-weight: 600;
}

.time {
  font-size: 0.55em;
  opacity: 0.6;
}

.empty-rooms {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80px;
  color: #666;
}

.empty-icon {
  font-size: 1.5em;
  margin-bottom: 6px;
}

.empty-text {
  text-align: center;
  color: #999;
  font-size: 0.7em;
}

/* === CHAT MAIN === */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 5px 6px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 1px 1px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
}

.room-info-header {
  display: flex;
  align-items: center;
  gap: 2px;
}

.room-avatar-small {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.6em;
}

.room-title {
  margin: 0;
  font-size: 0.7em;
  font-weight: 600;
  color: #1a1a1a;
}

.customer-name {
  font-size: 0.5em;
  color: #666;
  margin-top: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 0.5em;
  color: #dc3545;
  font-weight: 500;
}

.connection-status.connected {
  color: #28a745;
}

.status-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

/* === MESSAGES === */
.messages-container {
  flex: 1;
  overflow-y: auto;
  background: linear-gradient(180deg, #fafbfc 0%, #ffffff 100%);
  padding: 5px 6px;
}

.no-room-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 8px;
}

.no-room-icon {
  font-size: 1.2em;
  margin-bottom: 4px;
  opacity: 0.6;
}

.no-room-selected h3 {
  margin: 0 0 2px 0;
  color: #333;
  font-weight: 600;
  font-size: 0.7em;
}

.no-room-selected p {
  margin: 0;
  color: #666;
  font-size: 0.6em;
  line-height: 1.2;
  max-width: 140px;
}

.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.spinner {
  border: 1.5px solid #f3f3f3;
  border-top: 1.5px solid #007bff;
  border-radius: 50%;
  width: 10px;
  height: 10px;
  animation: spin 1s linear infinite;
  margin-right: 2px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-height: 100%;
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  text-align: center;
}

.empty-messages .empty-icon {
  font-size: 1em;
  margin-bottom: 3px;
  opacity: 0.5;
}

.message {
  display: flex;
  margin-bottom: 1px;
}

.message.own-message {
  justify-content: flex-end;
}

.message.other-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 85%;
  padding: 4px 6px;
  border-radius: 8px;
  position: relative;
  word-wrap: break-word;
}

.own-message .message-bubble {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-bottom-right-radius: 1px;
}

.other-message .message-bubble {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 1px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1px;
  gap: 2px;
}

.message-sender {
  font-weight: 600;
  font-size: 0.5em;
  opacity: 0.9;
}

.message-time {
  font-size: 0.45em;
  opacity: 0.7;
  white-space: nowrap;
}

.message-content {
  font-size: 0.6em;
  line-height: 1.1;
}

/* === INPUT === */
.message-input-container {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 5px 6px;
  z-index: 10;
}

.message-input {
  position: relative;
}

.message-input.disabled {
  opacity: 0.6;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 12px;
  padding: 1px;
  transition: all 0.2s ease;
  width: 100%;
}

.input-wrapper:focus-within {
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 1px rgba(0, 123, 255, 0.1);
}

.message-input-field {
  flex: 1;
  border: none;
  outline: none;
  padding: 4px 6px;
  font-size: 0.6em;
  background: transparent;
  color: #333;
}

.message-input-field::placeholder {
  color: #999;
}

.send-button {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.send-button:hover:not(:disabled) {
  background: linear-gradient(135deg, #0056b3 0%, #004085 100%);
  transform: scale(1.05);
}

.send-button:disabled {
  background: #dee2e6;
  cursor: not-allowed;
  transform: none;
}

.input-status {
  text-align: center;
  font-size: 0.5em;
  color: #666;
  margin-top: 2px;
  font-style: italic;
}

/* === SCROLLBAR === */
.rooms-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 3px;
}

.rooms-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.rooms-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 1px;
}

.rooms-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}
</style>