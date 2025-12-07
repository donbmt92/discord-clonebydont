# Real-time Strategy

Tài liệu này mô tả chiến lược và kiến trúc real-time messaging và video/audio calls trong ứng dụng Discord Clone.

## Tổng quan

Ứng dụng sử dụng hai công nghệ chính cho real-time communication:
- **Socket.io** - Cho real-time messaging (text, images, files)
- **LiveKit** - Cho video và audio calls

## Socket.io Architecture

### 1. Socket Provider Setup

Socket.io được khởi tạo và quản lý thông qua `SocketProvider` component:

**File:** `src/components/providers/socket-provider.tsx`

```typescript
// Socket client được tạo và kết nối đến server
const socketInstance = new ClientIO(process.env.NEXT_PUBLIC_SITE_URL!, {
  path: "/api/socket/io",
  addTrailingSlash: false,
});
```

**Chức năng:**
- Tạo socket connection khi component mount
- Quản lý connection state (isConnected)
- Cleanup khi component unmount
- Cung cấp socket instance qua Context API

### 2. Socket Server Initialization

Socket server được khởi tạo trong Next.js API route:

**File:** `src/pages/api/socket/io.ts`

```typescript
const io = new ServerIO(httpServer, {
  path: "/api/socket/io",
  addTrailingSlash: false,
});
```

**Chức năng:**
- Khởi tạo Socket.io server trên HTTP server của Next.js
- Singleton pattern - chỉ tạo một instance duy nhất
- Xử lý WebSocket connections

### 3. Message Events và Channels

#### Channel Messages

**API Route:** `src/pages/api/socket/messages/index.ts`

**Event Flow:**
1. Client gửi POST request với message content
2. Server tạo message trong database
3. Server emit event đến channel: `chat:{channelId}:messages`
4. Tất cả clients trong channel nhận được message mới

**Event Keys:**
- `chat:{channelId}:messages` - New message event
- `chat:{channelId}:messages:update` - Message update/delete event

**Update/Delete Messages:**
- **File:** `src/pages/api/socket/messages/[messageId].ts`
- Chỉ message owner, ADMIN hoặc MODERATOR mới có thể update/delete
- Khi delete, message content được thay bằng "This message has been deleted."
- Event được emit với key `chat:{channelId}:messages:update`

#### Direct Messages

**API Route:** `src/pages/api/socket/direct-messages/index.ts`

**Event Flow:**
1. Client gửi POST request với conversationId
2. Server tạo direct message trong database
3. Server emit event: `chat:{conversationId}:messages`
4. Cả hai members trong conversation nhận được message

**Update/Delete Direct Messages:**
- **File:** `src/pages/api/socket/direct-messages/[directMessageId].ts`
- Tương tự channel messages, nhưng sử dụng conversationId
- Event key: `chat:{conversationId}:messages:update`

### 4. Client-side Socket Handling

**Hook:** `src/hooks/use-chat-socket.ts`

**Chức năng:**
- Subscribe vào socket events (addKey, updateKey)
- Tự động update React Query cache khi nhận events
- Optimistic updates cho better UX
- Cleanup listeners khi component unmount

**Usage:**
```typescript
useChatSocket({
  addKey: `chat:${channelId}:messages`,
  updateKey: `chat:${channelId}:messages:update`,
  queryKey: ["messages", channelId],
});
```

### 5. Socket Event Flow Diagram

```
Client A                    Server                    Client B
   |                          |                          |
   |-- POST /api/socket/messages -->                    |
   |                          |                          |
   |                    Create Message                   |
   |                    in Database                      |
   |                          |                          |
   |                    Emit Event                       |
   |                    chat:{id}:messages               |
   |                          |                          |
   |<-- Receive Event ---------|-------- Receive Event -->|
   |                          |                          |
```

## LiveKit Integration

### 1. Token Generation

**API Route:** `src/app/api/livekit/route.ts`

**Chức năng:**
- Tạo JWT access token cho LiveKit room
- Validate room và username parameters
- Grant permissions (roomJoin, canPublish, canSubscribe)
- Return token cho client

**Environment Variables:**
- `LIVEKIT_API_KEY` - LiveKit API key
- `LIVEKIT_API_SECRET` - LiveKit API secret
- `NEXT_PUBLIC_LIVEKIT_URL` - LiveKit WebSocket URL

### 2. MediaRoom Component

**File:** `src/components/media-room.tsx`

**Chức năng:**
- Fetch LiveKit token từ API
- Initialize LiveKitRoom với token
- Render VideoConference component
- Support cả video và audio modes

**Props:**
- `chatId` - Room ID (channelId hoặc conversationId)
- `video` - Enable/disable video
- `audio` - Enable/disable audio

**Usage:**
```typescript
<MediaRoom
  chatId={channel.id}
  video={true}
  audio={true}
/>
```

### 3. Channel Types

**Database Schema:** `prisma/schema.prisma`

```prisma
enum ChannelType {
  TEXT
  AUDIO
  VIDEO
}
```

**Implementation:**
- **TEXT channels:** Sử dụng Socket.io messaging
- **AUDIO channels:** Sử dụng LiveKit với audio only
- **VIDEO channels:** Sử dụng LiveKit với video + audio

**File:** `src/app/(main)/(routes)/servers/[serverId]/channels/[channelId]/page.tsx`

```typescript
{channel.type === ChannelType.TEXT && (
  // Socket.io messaging components
)}
{channel.type === ChannelType.AUDIO && (
  <MediaRoom chatId={channel.id} video={false} audio={true} />
)}
{channel.type === ChannelType.VIDEO && (
  <MediaRoom chatId={channel.id} video={true} audio={true} />
)}
```

### 4. Direct Video Calls

**File:** `src/app/(main)/(routes)/servers/[serverId]/conversations/[memberId]/page.tsx`

**Chức năng:**
- Support video calls trong direct messages
- Trigger qua searchParams: `?video=true`
- Sử dụng conversationId làm room ID

## Real-time Updates Strategy

### 1. Optimistic Updates

- React Query được sử dụng để cache data
- Socket events trigger cache updates
- UI update ngay lập tức khi nhận socket event

### 2. Message Pagination

- Infinite scroll với React Query
- Load messages theo pages
- Socket events được prepend vào first page

### 3. Connection Status

**Component:** `src/components/socket-indicator.tsx`

- Hiển thị connection status
- Visual indicator cho socket connection state

## Best Practices

1. **Error Handling:**
   - Tất cả socket operations có try-catch
   - Fallback khi socket disconnected
   - Retry logic cho failed connections

2. **Performance:**
   - Debounce cho frequent events
   - Limit số lượng messages loaded
   - Cleanup listeners khi không cần

3. **Security:**
   - Validate permissions trước khi emit events
   - Check member roles cho sensitive operations
   - Sanitize message content

4. **Scalability:**
   - Socket rooms được tách theo channel/conversation
   - Chỉ emit events đến relevant clients
   - Database indexes cho fast queries

## Troubleshooting

### Socket không kết nối
- Kiểm tra `NEXT_PUBLIC_SITE_URL` environment variable
- Verify socket server đã được khởi tạo
- Check network tab trong browser DevTools

### LiveKit không hoạt động
- Verify LiveKit credentials
- Check room permissions
- Ensure WebSocket URL đúng format

### Messages không sync
- Verify socket events được emit đúng
- Check React Query cache
- Ensure socket listeners được setup đúng

