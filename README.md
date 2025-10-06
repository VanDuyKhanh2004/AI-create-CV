# AI CV Builder - Full Stack Application

Ứng dụng web sử dụng AI để tạo CV chuyên nghiệp với React frontend và Node.js backend.

## 🚀 Cấu trúc Dự án

```
AI create CV/
├── client/          # React Frontend
│   ├── src/
│   │   ├── components/    # React Components
│   │   ├── pages/         # Page Components
│   │   ├── contexts/      # React Context (Auth)
│   │   └── config/        # API Configuration
│   └── package.json
├── server/          # Node.js Backend
│   ├── src/
│   │   ├── controllers/   # API Controllers
│   │   ├── models/       # Database Models
│   │   ├── routes/       # API Routes
│   │   ├── middleware/    # Auth Middleware
│   │   └── config/       # Database & Passport Config
│   └── package.json
└── README.md
```

## 🛠️ Cài đặt và Chạy

### 1. Cài đặt Backend Dependencies

```bash
cd server
npm install
```

### 2. Cài đặt Frontend Dependencies

```bash
cd client
npm install
```

### 3. Cấu hình Environment Variables

Tạo file `.env` trong thư mục `server`:

```env
MONGODB_URI=mongodb://localhost:27017/ai-cv-builder
JWT_SECRET=your-super-secret-jwt-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=5000
```

### 4. Chạy Ứng dụng

**Terminal 1 - Backend:**

```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**

```bash
cd client
npm start
```

## 🔧 API Endpoints

### Authentication

- `POST /auth/register` - Đăng ký tài khoản
- `POST /auth/login` - Đăng nhập
- `GET /auth/google` - Google OAuth
- `GET /auth/logout` - Đăng xuất
- `GET /auth/status` - Kiểm tra trạng thái đăng nhập

### CV Management

- `GET /api/cv` - Lấy danh sách CV của user
- `POST /api/cv` - Tạo CV mới
- `GET /api/cv/:id` - Lấy CV theo ID
- `PUT /api/cv/:id` - Cập nhật CV
- `DELETE /api/cv/:id` - Xóa CV

### AI Services

- `POST /api/ai/generate` - Tạo CV bằng AI
- `POST /api/ai/optimize` - Tối ưu hóa CV
- `GET /api/ai/suggestions/:cvId` - Gợi ý cải thiện CV

### Admin (Chỉ admin)

- `GET /api/cv/admin/all` - Xem tất cả CV

## 🔐 Authentication & Authorization

### User Roles

- **user**: Người dùng thường - chỉ xem/sửa CV của mình
- **admin**: Quản trị viên - xem tất cả CV, quản lý hệ thống

### Authentication Methods

1. **Local Authentication**: Email/Password
2. **Google OAuth**: Đăng nhập bằng Google

### Security Features

- JWT Token authentication
- Password hashing với bcrypt
- Role-based access control
- CORS configuration
- Session management

## 🎨 Frontend Features

### Pages

- **Home**: Landing page với features
- **Login/Register**: Authentication forms
- **Dashboard**: User dashboard với quick actions
- **CV Builder**: AI-powered CV creation với stepper
- **CV List**: Quản lý CVs với CRUD operations
- **CV Edit**: Chỉnh sửa CV với tabs
- **Profile**: User profile management
- **Admin Panel**: Admin dashboard với stats

### Components

- **Navbar**: Navigation với authentication
- **ProtectedRoute**: Route protection
- **AuthContext**: Authentication state management

### UI/UX

- Material-UI components
- Responsive design
- Toast notifications
- Loading states
- Error handling

## 🗄️ Database Schema

### User Model

```javascript
{
  _id: ObjectId,
  email: String (unique),
  password: String (hashed),
  firstName: String,
  lastName: String,
  username: String,
  role: String (user/admin),
  authProvider: String (local/google),
  googleId: String,
  lastLogin: Date
}
```

### CV Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  personalInfo: {
    fullName: String,
    jobTitle: String,
    email: String,
    phone: String,
    address: String,
    summary: String
  },
  experience: [Object],
  education: [Object],
  skills: [Object],
  projects: [Object],
  metadata: {
    status: String,
    version: Number
  }
}
```

## 🚀 Deployment

### Backend (Heroku/Railway/DigitalOcean)

1. Set environment variables
2. Deploy với `npm start`
3. Configure MongoDB Atlas

### Frontend (Vercel/Netlify)

1. Build với `npm run build`
2. Deploy static files
3. Configure API URL

## 📝 Development Notes

- Frontend chạy trên port 3000
- Backend chạy trên port 5000
- Proxy configuration trong package.json
- Hot reload cho development
- TypeScript cho backend
- JavaScript cho frontend

## 🔧 Troubleshooting

### Common Issues

1. **MongoDB Connection**: Kiểm tra MONGODB_URI
2. **Google OAuth**: Cấu hình redirect URI
3. **CORS Issues**: Kiểm tra proxy configuration
4. **Token Expired**: Clear cookies và login lại

### Debug Commands

```bash
# Check backend logs
cd server && npm run dev

# Check frontend logs
cd client && npm start

# Check database connection
mongosh "your-mongodb-uri"
```

## 📞 Support

Nếu gặp vấn đề, hãy kiểm tra:

1. Dependencies đã cài đặt đầy đủ
2. Environment variables đã cấu hình
3. Database connection
4. Port conflicts
