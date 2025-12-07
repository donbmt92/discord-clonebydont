# Discord Clone - Real-time Chat Application

Ứng dụng chat real-time được xây dựng với Next.js, mô phỏng các tính năng chính của Discord. Dự án hỗ trợ messaging real-time, video/audio calls, quản lý server và channel, cùng nhiều tính năng khác.

## 🚀 Key Features

- [x] **Real-time Messaging:** Send text, images, and files instantly via Socket.io.
- [x] **Video & Audio Calls:** High-quality group calls using LiveKit infrastructure.
- [x] **Server & Channel Management:** Create servers, invite users via unique codes, and manage channels (Text/Audio).
- [x] **Role Management:** Grant permissions (Kick, Ban, Manage Channels) to members.
- [x] **Responsive Design:** Fully optimized for Mobile and Desktop.
- [x] **Light/Dark Mode:** Built-in theme switching.

## 📋 Prerequisites

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- Node.js 18+ và npm/yarn/pnpm
- MySQL database
- Clerk account (cho authentication)
- LiveKit account (cho video/audio calls)
- UploadThing account (cho file uploads)

## 🛠️ Installation

1. **Clone repository và cài đặt dependencies:**

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

2. **Cấu hình environment variables:**

Tạo file `.env` trong thư mục gốc với các biến sau:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/database_name"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# LiveKit (Video/Audio Calls)
LIVEKIT_API_KEY=your_livekit_api_key
LIVEKIT_API_SECRET=your_livekit_api_secret
NEXT_PUBLIC_LIVEKIT_URL=your_livekit_url

# UploadThing (File Uploads)
UPLOADTHING_SECRET=your_uploadthing_secret
UPLOADTHING_APP_ID=your_uploadthing_app_id

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

3. **Setup database với Prisma:**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Open Prisma Studio để xem database
npx prisma studio
```

4. **Chạy development server:**

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) trong trình duyệt để xem kết quả.

## 📚 Documentation

- [Real-time Strategy](./REAL_TIME_STRATEGY.md) - Chiến lược và kiến trúc real-time messaging
- [Database Schema](./DATABASE_SCHEMA.md) - Cấu trúc database và các models

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** MySQL với Prisma ORM
- **Authentication:** Clerk
- **Real-time:** Socket.io
- **Video/Audio:** LiveKit
- **File Upload:** UploadThing
- **UI Components:** Radix UI, Tailwind CSS
- **State Management:** Zustand, React Query
- **Form Handling:** React Hook Form với Zod validation

## 📁 Project Structure

```
discord-clonebydont/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Authentication routes
│   │   ├── (main)/             # Main application routes
│   │   └── api/                # API routes
│   ├── components/             # React components
│   │   ├── chat/              # Chat components
│   │   ├── modals/            # Modal components
│   │   ├── navigation/        # Navigation components
│   │   ├── server/            # Server components
│   │   └── providers/         # Context providers
│   ├── hooks/                 # Custom React hooks
│   ├── lib/                   # Utility functions
│   └── pages/                 # API routes (Socket.io)
└── public/                     # Static assets
```

## 🚢 Deployment

### Deploy trên Vercel

Cách dễ nhất để deploy Next.js app là sử dụng [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme):

1. Push code lên GitHub
2. Import project vào Vercel
3. Thêm các environment variables
4. Deploy!

Xem thêm [Next.js deployment documentation](https://nextjs.org/docs/deployment) để biết thêm chi tiết.

## 📝 Scripts

- `npm run dev` - Chạy development server
- `npm run build` - Build production
- `npm run start` - Chạy production server
- `npm run lint` - Chạy ESLint

## 🤝 Contributing

Contributions are welcome! Vui lòng tạo issue hoặc pull request.

## 📄 License

This project is private.
