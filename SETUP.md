# 🚀 Hướng dẫn Setup và Chạy AI CV Builder

## 📋 Yêu cầu Hệ thống

- **Node.js**: v16+
- **npm**: v8+
- **MongoDB**: Local hoặc Atlas
- **Git**: Để clone repository

## 🛠️ Cài đặt Dependencies

### 1. Backend Dependencies

```bash
cd server
npm install
```

### 2. Frontend Dependencies

```bash
cd client
npm install
```

## ⚙️ Cấu hình Environment

### Backend (.env trong server/)

```env
MONGODB_URI=mongodb://localhost:27017/ai-cv-builder
JWT_SECRET=your-super-secret-jwt-key-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
PORT=5000
```

### Frontend (tự động)

- API URL: `http://localhost:5000` (tự động)
- Proxy: Đã cấu hình trong `package.json`

## 🚀 Chạy Ứng dụng

### Option 1: Sử dụng Scripts (Khuyến nghị)

**Windows:**

```bash
start-dev.bat
```

**Linux/Mac:**

```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual

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

## 🌐 Truy cập Ứng dụng

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Status**: Hiển thị ở góc phải màn hình (development mode)

## 🔧 Troubleshooting

### Lỗi thường gặp:

#### 1. **Module not found errors**

```bash
# Xóa node_modules và cài lại
rm -rf node_modules package-lock.json
npm install
```

#### 2. **MongoDB connection failed**

- Kiểm tra MongoDB đang chạy
- Kiểm tra MONGODB_URI trong .env
- Thử MongoDB Atlas nếu local không hoạt động

#### 3. **Port already in use**

```bash
# Tìm process sử dụng port
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

#### 4. **Google OAuth không hoạt động**

- Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET
- Cấu hình redirect URI: `http://localhost:5000/auth/google/callback`

#### 5. **CORS errors**

- Kiểm tra proxy trong `client/package.json`
- Đảm bảo backend chạy trên port 5000

## 📱 Test Ứng dụng

### 1. **Test Authentication**

- Truy cập http://localhost:3000
- Click "Register" để tạo tài khoản
- Hoặc click "Continue with Google"

### 2. **Test CV Builder**

- Đăng nhập vào dashboard
- Click "Build New CV"
- Điền thông tin và generate CV

### 3. **Test Admin Panel**

- Tạo user với role "admin" trong database
- Truy cập /admin để xem admin dashboard

## 🗄️ Database Setup

### MongoDB Local

```bash
# Start MongoDB
mongod

# Connect to database
mongosh
use ai-cv-builder
```

### MongoDB Atlas

1. Tạo cluster trên MongoDB Atlas
2. Lấy connection string
3. Cập nhật MONGODB_URI trong .env

## 🔍 Debug Mode

### Backend Debug

```bash
cd server
DEBUG=* npm run dev
```

### Frontend Debug

- Mở Developer Tools (F12)
- Check Console cho API connection status
- Check Network tab cho API calls

## 📊 Monitoring

### API Status

- Hiển thị ở góc phải màn hình
- Màu xanh: Connected
- Màu đỏ: Disconnected
- Màu vàng: Checking

### Logs

- Backend: Terminal 1
- Frontend: Terminal 2
- Browser: F12 Console

## 🚀 Production Deployment

### Backend (Heroku/Railway)

```bash
# Set environment variables
# Deploy với npm start
```

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build
# Deploy build folder
```

## 📞 Support

Nếu gặp vấn đề:

1. Kiểm tra logs trong terminal
2. Kiểm tra browser console
3. Kiểm tra API status indicator
4. Restart cả frontend và backend

## ✅ Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Environment variables configured
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] API connection status shows "Connected"
