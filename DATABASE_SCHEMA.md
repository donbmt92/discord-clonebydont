# Database Schema

Tài liệu này mô tả cấu trúc database và các models trong ứng dụng Discord Clone.

## Tổng quan

Database sử dụng **MySQL** với **Prisma ORM** để quản lý schema và migrations. Tất cả models được định nghĩa trong `prisma/schema.prisma`.

## Models

### 1. Profile

Lưu trữ thông tin user profile, liên kết với Clerk authentication.

```prisma
model Profile {
  id       String @id @default(uuid())
  userId   String @unique  // Clerk user ID
  name     String
  imageUrl String @db.Text
  email    String @db.Text

  servers  Server[]
  members  Member[]
  channels Channel[]

  createAt DateTime @default(now())
  updateAt DateTime @updatedAt
}
```

**Relationships:**
- `servers` - Servers mà user tạo
- `members` - Memberships của user trong các servers
- `channels` - Channels mà user tạo

**Indexes:**
- `userId` - Unique index cho Clerk user ID

### 2. Server

Đại diện cho một Discord server/community.

```prisma
model Server {
  id         String @id @default(uuid())
  name       String
  imageUrl   String @db.Text
  inviteCode String @unique  // Unique invite code

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  members  Member[]
  channels Channel[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([profileId])
}
```

**Relationships:**
- `profile` - Owner của server (Profile)
- `members` - Tất cả members trong server
- `channels` - Tất cả channels trong server

**Constraints:**
- `inviteCode` - Unique, được generate bằng UUID
- Cascade delete khi owner bị xóa

### 3. Member

Đại diện cho membership của một user trong một server.

```prisma
enum MemberRole {
  ADMIN
  MODERATOR
  GUEST
}

model Member {
  id   String     @id @default(uuid())
  role MemberRole @default(GUEST)

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  serverId String
  server   Server @relation(fields: [serverId], references: [id], onDelete: Cascade)

  messages Message[]

  ConversationsInitialted Conversation[] @relation("MemberOne")
  ConversationsReceived   Conversation[] @relation("MemberTwo")

  directMessages DirectMessage[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([profileId])
  @@index([serverId])
}
```

**Roles:**
- `ADMIN` - Full permissions (manage server, channels, members)
- `MODERATOR` - Can manage channels và members (kick, ban)
- `GUEST` - Basic permissions (send messages)

**Relationships:**
- `profile` - User profile
- `server` - Server mà member thuộc về
- `messages` - Messages trong channels
- `ConversationsInitialted` - Conversations mà member khởi tạo
- `ConversationsReceived` - Conversations mà member nhận
- `directMessages` - Direct messages

**Indexes:**
- `profileId` - For fast lookups
- `serverId` - For fast server member queries

### 4. Channel

Đại diện cho một channel trong server (text, audio, hoặc video).

```prisma
enum ChannelType {
  TEXT
  AUDIO
  VIDEO
}

model Channel {
  id   String      @id @default(uuid())
  name String
  type ChannelType @default(TEXT)

  profileId String
  profile   Profile @relation(fields: [profileId], references: [id], onDelete: Cascade)

  serverId String
  server   Server @relation(fields: [serverId], references: [id], onDelete: Cascade)

  createdAt DateTime  @default(now())
  updateAt  DateTime  @updatedAt
  Message   Message[]

  @@index([profileId])
  @@index([serverId])
}
```

**Channel Types:**
- `TEXT` - Text messaging channel (Socket.io)
- `AUDIO` - Audio call channel (LiveKit)
- `VIDEO` - Video call channel (LiveKit)

**Relationships:**
- `profile` - Creator của channel
- `server` - Server mà channel thuộc về
- `Message` - Messages trong channel

**Constraints:**
- Channel name không thể là "general" (reserved)
- Cascade delete khi server hoặc creator bị xóa

### 5. Message

Đại diện cho một message trong channel.

```prisma
model Message {
  id      String @id @default(uuid())
  content String @db.Text
  fileUrl String? @db.Text  // Optional file attachment

  memberId String
  member   Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  channelId String
  channel   Channel @relation(fields: [channelId], references: [id], onDelete: Cascade)

  deleted Boolean @default(false)

  createdAt DateTime @default(now())
  updateAt  DateTime @updatedAt

  @@index([memberId])
  @@index([channelId])
}
```

**Soft Delete:**
- `deleted` flag thay vì hard delete
- Khi delete, content được thay bằng "This message has been deleted."
- `fileUrl` được set về null khi delete

**Relationships:**
- `member` - Member gửi message
- `channel` - Channel chứa message

**Indexes:**
- `memberId` - For member message queries
- `channelId` - For channel message pagination

### 6. Conversation

Đại diện cho một conversation giữa hai members trong cùng server.

```prisma
model Conversation {
  id String @id @default(uuid())

  memberOneId String
  memberOne   Member @relation("MemberOne", fields: [memberOneId], references: [id], onDelete: Cascade)

  memberTwoId String
  memberTwo   Member @relation("MemberTwo", fields: [memberTwoId], references: [id], onDelete: Cascade)

  directMessages DirectMessage[]

  @@unique([memberOneId, memberTwoId])
  @@index([memberTwoId])
}
```

**Relationships:**
- `memberOne` - First member trong conversation
- `memberTwo` - Second member trong conversation
- `directMessages` - Messages trong conversation

**Constraints:**
- Unique constraint trên `[memberOneId, memberTwoId]` - Mỗi cặp members chỉ có một conversation
- Cascade delete khi member bị xóa

### 7. DirectMessage

Đại diện cho một direct message trong conversation.

```prisma
model DirectMessage {
  id      String  @id @default(uuid())
  content String  @db.Text
  fileUrl String? @db.Text  // Optional file attachment

  memberId String
  member   Member @relation(fields: [memberId], references: [id], onDelete: Cascade)

  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  deleted Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([memberId])
  @@index([conversationId])
}
```

**Soft Delete:**
- Tương tự Message model
- `deleted` flag và content replacement

**Relationships:**
- `member` - Member gửi message
- `conversation` - Conversation chứa message

**Indexes:**
- `memberId` - For member direct message queries
- `conversationId` - For conversation message pagination

## Entity Relationship Diagram

```
Profile
  ├── Server[] (owner)
  ├── Member[] (memberships)
  └── Channel[] (created channels)

Server
  ├── Profile (owner)
  ├── Member[] (members)
  └── Channel[] (channels)

Member
  ├── Profile (user)
  ├── Server (server)
  ├── Message[] (channel messages)
  ├── Conversation[] (as memberOne)
  ├── Conversation[] (as memberTwo)
  └── DirectMessage[] (direct messages)

Channel
  ├── Profile (creator)
  ├── Server (server)
  └── Message[] (messages)

Message
  ├── Member (sender)
  └── Channel (channel)

Conversation
  ├── Member (memberOne)
  ├── Member (memberTwo)
  └── DirectMessage[] (messages)

DirectMessage
  ├── Member (sender)
  └── Conversation (conversation)
```

## Database Configuration

**Provider:** MySQL

**Connection:**
```prisma
datasource db {
  provider     = "mysql"
  url          = env("DATABASE_URL")
  relationMode = "prisma"
}
```

**Relation Mode:** `prisma` - Sử dụng Prisma's relation mode cho MySQL

## Indexes và Performance

### Primary Indexes
- Tất cả models có `id` field với `@id` constraint (UUID)

### Foreign Key Indexes
- `Profile.userId` - Unique index
- `Server.profileId` - Index
- `Member.profileId` - Index
- `Member.serverId` - Index
- `Channel.profileId` - Index
- `Channel.serverId` - Index
- `Message.memberId` - Index
- `Message.channelId` - Index
- `DirectMessage.memberId` - Index
- `DirectMessage.conversationId` - Index

### Composite Indexes
- `Conversation.[memberOneId, memberTwoId]` - Unique composite index

## Cascade Deletes

Tất cả relationships sử dụng `onDelete: Cascade` để đảm bảo data consistency:

- Khi Profile bị xóa → Servers, Members, Channels bị xóa
- Khi Server bị xóa → Members, Channels bị xóa
- Khi Member bị xóa → Messages, Conversations, DirectMessages bị xóa
- Khi Channel bị xóa → Messages bị xóa
- Khi Conversation bị xóa → DirectMessages bị xóa

## Migrations

Để tạo migration mới:

```bash
npx prisma migrate dev --name migration_name
```

Để apply migrations trong production:

```bash
npx prisma migrate deploy
```

## Prisma Studio

Xem và edit database trực tiếp:

```bash
npx prisma studio
```

Mở tại: http://localhost:5555

## Best Practices

1. **UUIDs:** Tất cả IDs sử dụng UUID để tránh collision và improve security
2. **Soft Deletes:** Messages sử dụng soft delete để preserve history
3. **Timestamps:** Tất cả models có createdAt và updatedAt
4. **Cascade Deletes:** Đảm bảo data consistency
5. **Indexes:** Foreign keys được index để improve query performance

