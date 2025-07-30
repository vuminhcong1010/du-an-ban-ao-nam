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
          
          <div v-else-if="!isEmployee" class="room-info-header">
            <div class="room-avatar-small">CS</div>
            <div>
              <h4 class="room-title">Chat hỗ trợ khách hàng</h4>
              <div class="customer-name">Đang chờ hỗ trợ</div>
            </div>
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
          <div v-if="messages.length === 0" class="empty-messages">
            <div class="empty-icon">💭</div>
            <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</p>
          </div>
          
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
          
          <div v-if="!isConnected || !roomId" class="input-status">
            {{ !isConnected ? 'Đang kết nối...' : 'Chọn phòng để gửi tin nhắn' }}
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
const roomId = ref('')
const danhSachPhongChat = ref([])
const selectedRoom = ref('')
const isEmployee = ref(false)
const activeSubscriptions = new Map()
const messagesContainer = ref(null)

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

// Scroll to bottom when new message arrives
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// Watch messages to auto scroll
watch(messages, () => {
  scrollToBottom()
}, { deep: true })

onMounted(async () => {
  if (!isUser) {
    // Xử lý khách hàng
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
    
    const idKH = thongTin.maKhachHang
    await axios.get(`http://localhost:8080/create-room/${idKH}`).then((response) => {
      if (response.data.data === false) {
        roomId.value = 'waiting-room'
      } else {
        roomId.value = response.data.message
      }
      connectWebSocket()
      if (roomId.value !== 'waiting-room') {
        loadMessageHistory(roomId.value)
      }
    }).catch((error) => {
      console.error('Lỗi khi tạo phòng:', error)
    })
    
  } else {
    // Xử lý nhân viên
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
      console.log('Danh sách phòng chat:', res.data.data)
      
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

function connectWebSocket() {
  if (!roomId.value) {
    console.warn("⚠️ Không có roomId để kết nối WebSocket")
    return
  }
  
  const socket = new SockJS('/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('✅ STOMP kết nối thành công')
      isConnected.value = true
      
      stompClient.subscribe(`/topic/room/${roomId.value}/messages`, (msg) => {
        try {
          const body = JSON.parse(msg.body)
          
          // Kiểm tra nếu đang ở waiting room và đây là tin nhắn từ khách hàng thì không hiển thị
          if (roomId.value === 'waiting-room' && body.sender === 'Khách hàng') {
            return // Không xử lý tin nhắn của chính khách hàng trong waiting room
          }
          
          let messageData
          
          if (roomId.value === 'waiting-room') {
            // Chỉ hiển thị thông báo hệ thống khi có tin nhắn từ server/nhân viên
            messageData = {
              sender: "Hệ thống",
              content: "Hiện tại không có nhân viên trực tuyến. Vui lòng thử lại sau vài phút.",
              timestamp: new Date().toLocaleTimeString()
            }
          } else {
            messageData = {
              sender: body.sender,
              content: body.content,
              timestamp: new Date().toLocaleTimeString()
            }
          }
          
          // Kiểm tra trùng lặp tin nhắn
          const isDuplicate = messages.value.some(
            m => m.content === messageData.content && 
                 m.timestamp === messageData.timestamp &&
                 m.sender === messageData.sender
          )
          
          if (!isDuplicate) {
            messages.value.push(messageData)
          }
          
        } catch (error) {
          console.error('Lỗi parse message:', error)
        }
      })
    },
    onDisconnect: () => {
      console.log('STOMP ngắt kết nối')
      isConnected.value = false
    },
    onStompError: (frame) => {
      console.error('❌ Lỗi STOMP:', frame)
      isConnected.value = false
    }
  })
  
  stompClient.activate()
}

// Sửa hàm sendMessage để xử lý trường hợp waiting room
function sendMessage() {
  if (!message.value.trim() || !roomId.value) {
    return
  }
  
  if (stompClient && stompClient.connected) {
    try {
      // Nếu đang ở waiting room, hiển thị tin nhắn của khách hàng trước
      if (roomId.value === 'waiting-room') {
        const customerMessage = {
          sender: 'Khách hàng',
          content: message.value,
          timestamp: new Date().toLocaleTimeString()
        }
        
        // Kiểm tra trùng lặp
        const isDuplicate = messages.value.some(
          m => m.content === customerMessage.content && 
               m.timestamp === customerMessage.timestamp &&
               m.sender === customerMessage.sender
        )
        
        if (!isDuplicate) {
          messages.value.push(customerMessage)
        }
        
        // Sau đó hiển thị thông báo hệ thống
        setTimeout(() => {
          const systemMessage = {
            sender: "Hệ thống",
            content: "Hiện tại không có nhân viên trực tuyến. Vui lòng thử lại sau vài phút.",
            timestamp: new Date().toLocaleTimeString()
          }
          
          const isSystemDuplicate = messages.value.some(
            m => m.content === systemMessage.content && 
                 m.sender === systemMessage.sender &&
                 Math.abs(new Date(`1970/01/01 ${m.timestamp}`) - new Date(`1970/01/01 ${systemMessage.timestamp}`)) < 2000
          )
          
          if (!isSystemDuplicate) {
            messages.value.push(systemMessage)
          }
        }, 500)
        
        message.value = ''
        return
      }
      
      // Xử lý bình thường cho phòng chat có nhân viên
      stompClient.publish({
        destination: `/app/room/${roomId.value}/send`,
        body: JSON.stringify({
          sender: isEmployee.value ? 'Nhân viên' : 'Khách hàng',
          content: message.value
        })
      })
      message.value = ''
    } catch (error) {
      console.error('Lỗi gửi tin nhắn:', error)
      alert('Không thể gửi tin nhắn.')
    }
  } else {
    alert('WebSocket chưa kết nối.')
  }
}

// Kết nối WebSocket cho nhân viên
function connectWebSocketForEmployee() {
  const socket = new SockJS('/ws')
  stompClient = new Client({
    webSocketFactory: () => socket,
    debug: (str) => console.log(str),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('✅ STOMP kết nối thành công cho nhân viên')
      isConnected.value = true
      
      danhSachPhongChat.value.forEach(room => {
        const roomIdToSubscribe = typeof room === 'object' ? room.id : room
        
        const subscription = stompClient.subscribe(`/topic/room/${roomIdToSubscribe}/messages`, (msg) => {
          try {
            const body = JSON.parse(msg.body)
            const messageData = {
              roomId: roomIdToSubscribe,
              sender: body.sender,
              content: body.content,
              timestamp: new Date().toLocaleTimeString()
            }
            
            // Kiểm tra trùng lặp tin nhắn
            const isDuplicate = messages.value.some(
              m => m.content === messageData.content && m.timestamp === messageData.timestamp
            )
            if (!isDuplicate && roomIdToSubscribe === roomId.value) {
              messages.value.push(messageData)
            }
            
            // Cập nhật danh sách phòng chat
            const roomIndex = danhSachPhongChat.value.findIndex(r => 
              (typeof r === 'object' ? r.id : r) === roomIdToSubscribe
            )
            if (roomIndex !== -1) {
              danhSachPhongChat.value[roomIndex] = {
                ...danhSachPhongChat.value[roomIndex],
                lastMessage: body.content,
                lastMessageTime: new Date().toLocaleTimeString(),
                unreadCount: roomIdToSubscribe === roomId.value ? 0 : 
                  (danhSachPhongChat.value[roomIndex].unreadCount || 0) + 1
              }
            }
            
            // Hiển thị thông báo (có thể thay bằng toast notification)
            if (roomIdToSubscribe !== roomId.value) {
              // Không hiển thị alert để tránh làm phiền người dùng
              console.log(`Tin nhắn mới từ phòng ${roomIdToSubscribe}: ${body.content}`)
            }
            
          } catch (error) {
            console.error('Lỗi parse message:', error)
          }
        })
        
        activeSubscriptions.set(roomIdToSubscribe, subscription)
      })
    },
    onDisconnect: () => {
      console.log('STOMP ngắt kết nối')
      isConnected.value = false
    },
    onStompError: (frame) => {
      console.error('❌ Lỗi STOMP:', frame)
      isConnected.value = false
    }
  })
  
  stompClient.activate()
}

// Chọn phòng chat
function selectRoom(room) {
  selectedRoom.value = room
  
  if (typeof room === 'object' && room.id) {
    roomId.value = room.id
  } else if (typeof room === 'string') {
    roomId.value = room
  } else {
    console.error('❌ Định dạng phòng không hợp lệ:', room)
    return
  }
  
  messages.value = []
  loadMessageHistory(roomId.value)
  
  // Đặt lại số lượng tin nhắn chưa đọc
  const roomIndex = danhSachPhongChat.value.findIndex(r => 
    (typeof r === 'object' ? r.id : r) === roomId.value
  )
  if (roomIndex !== -1) {
    danhSachPhongChat.value[roomIndex] = {
      ...danhSachPhongChat.value[roomIndex],
      unreadCount: 0
    }
  }
  
  console.log('✅ Đã chuyển sang phòng:', roomId.value)
}



// Handle typing (có thể mở rộng để hiển thị typing indicator)
function handleTyping() {
  // Logic for typing indicator nếu cần
}

onBeforeUnmount(() => {
  if (stompClient) {
    activeSubscriptions.forEach(subscription => {
      subscription.unsubscribe()
    })
    activeSubscriptions.clear()
    stompClient.deactivate()
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100%; /* Loại bỏ chiều cao cố định 700px, sử dụng 100% để linh hoạt */
  min-height: 400px; /* Đặt min-height để tránh co lại quá nhỏ */
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  background: white;
}

/* === SIDEBAR === */
.rooms-sidebar {
  width: 320px;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: white;
}

.sidebar-header h3 {
  margin: 0 0 8px 0;
  font-size: 1.2em;
  font-weight: 600;
  color: #1a1a1a;
}

.room-count {
  font-size: 0.9em;
  color: #666;
}

.rooms-list {
  flex: 1;
  overflow-y: auto;
}

.room-item {
  padding: 16px 20px;
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
  width: 4px;
  background: #ffc107;
}

.room-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1.2em;
  flex-shrink: 0;
}

.room-item.active .room-avatar {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
}

.room-details {
  flex: 1;
  min-width: 0;
}

.room-name {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 1em;
  color: inherit;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-info {
  font-size: 0.9em;
  opacity: 0.7;
  margin-bottom: 2px;
}

.last-message {
  font-size: 0.8em;
  opacity: 0.6;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.room-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.unread-badge {
  background: #dc3545;
  color: white;
  border-radius: 50%; /* Hình tròn để làm chấm đỏ */
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75em;
  font-weight: 600;
}

.time {
  font-size: 0.75em;
  opacity: 0.6;
}

.empty-rooms {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #666;
}

.empty-icon {
  font-size: 3em;
  margin-bottom: 16px;
}

.empty-text {
  text-align: center;
  color: #999;
}

/* === CHAT MAIN === */
.chat-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%; /* Đảm bảo chiếm toàn bộ chiều cao của container */
}

.chat-header {
  padding: 20px 24px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
}

.header-left {
  display: flex;
  align-items: center;
}

.room-info-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.room-avatar-small {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1em;
}

.room-title {
  margin: 0;
  font-size: 1.1em;
  font-weight: 600;
  color: #1a1a1a;
}

.customer-name {
  font-size: 0.9em;
  color: #666;
  margin-top: 2px;
}

.header-right {
  display: flex;
  align-items: center;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9em;
  color: #dc3545;
  font-weight: 500;
}

.connection-status.connected {
  color: #28a745;
}

.status-dot {
  width: 8px;
  height: 8px;
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
  padding: 20px 24px;
}

.no-room-selected {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 40px;
}

.no-room-icon {
  font-size: 4em;
  margin-bottom: 20px;
  opacity: 0.6;
}

.no-room-selected h3 {
  margin: 0 0 12px 0;
  color: #333;
  font-weight: 600;
}

.no-room-selected p {
  margin: 0;
  color: #666;
  font-size: 0.95em;
  line-height: 1.5;
  max-width: 300px;
}

.loading-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.messages-list {
  padding: 0 0; /* Loại bỏ padding bên trong để tối ưu không gian */
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  font-size: 3em;
  margin-bottom: 16px;
  opacity: 0.5;
}

.message {
  display: flex;
  margin-bottom: 8px;
}

.message.own-message {
  justify-content: flex-end;
}

.message.other-message {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  position: relative;
  word-wrap: break-word;
}

.own-message .message-bubble {
  background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
  color: white;
  border-bottom-right-radius: 4px;
}

.other-message .message-bubble {
  background: white;
  color: #333;
  border: 1px solid #e0e0e0;
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
  gap: 12px;
}

.message-sender {
  font-weight: 600;
  font-size: 0.85em;
  opacity: 0.9;
}

.message-time {
  font-size: 0.75em;
  opacity: 0.7;
  white-space: nowrap;
}

.message-content {
  font-size: 0.95em;
  line-height: 1.4;
}

/* === INPUT === */
.message-input-container {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 20px 24px;
  z-index: 10; /* Đảm bảo hiển thị trên cùng */
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
  border: 2px solid #e9ecef;
  border-radius: 24px;
  padding: 4px;
  transition: all 0.2s ease;
  width: 100%; /* Đảm bảo chiếm toàn bộ chiều rộng */
}

.input-wrapper:focus-within {
  border-color: #007bff;
  background: white;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.message-input-field {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 16px;
  font-size: 0.95em;
  background: transparent;
  color: #333;
}

.message-input-field::placeholder {
  color: #999;
}

.send-button {
  width: 44px;
  height: 44px;
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
  font-size: 0.8em;
  color: #666;
  margin-top: 8px;
  font-style: italic;
}

/* === SCROLLBAR === */
.rooms-list::-webkit-scrollbar,
.messages-container::-webkit-scrollbar {
  width: 6px;
}

.rooms-list::-webkit-scrollbar-track,
.messages-container::-webkit-scrollbar-track {
  background: transparent;
}

.rooms-list::-webkit-scrollbar-thumb,
.messages-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

.rooms-list::-webkit-scrollbar-thumb:hover,
.messages-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

/* === RESPONSIVE === */
@media (max-width: 768px) {
  .chat-container {
    height: 100vh;
    border-radius: 0;
  }
  
  .rooms-sidebar {
    width: 280px;
  }
  
  .room-content {
    gap: 10px;
  }
  
  .room-avatar {
    width: 40px;
    height: 40px;
    font-size: 1em;
  }
  
  .messages-list {
    padding: 16px 20px;
  }
  
  .message-bubble {
    max-width: 85%;
  }
  
  .message-input-container {
    padding: 16px 20px;
  }
}
</style>