# Cinema Admin Panel

Giao diện quản trị cho hệ thống đặt vé xem phim online.

## 🚀 Tính năng chính

### 📊 Dashboard
- Thống kê tổng quan hệ thống (số phim, rạp, ghế, người dùng)
- Biểu đồ doanh thu và tình trạng đặt vé
- Dữ liệu thời gian thực

### 🎬 Quản lý Phim
- Thêm, sửa, xóa phim
- Upload poster và trailer
- Quản lý thông tin chi tiết (thể loại, diễn viên, đạo diễn...)
- Hiển thị dạng lưới hoặc bảng

### 🏢 Quản lý Rạp Chiếu
- CRUD rạp chiếu phim
- Quản lý phòng chiếu và ghế ngồi
- Thiết lập sơ đồ ghế

### 📅 Lịch Chiếu
- Tạo và quản lý suất chiếu
- Gán phim vào rạp và phòng chiếu
- Thiết lập giá vé

### 🎟️ Quản lý Đặt Vé
- Xem danh sách booking (User & Guest)
- Xác nhận và hủy đặt vé
- Theo dõi trạng thái thanh toán

### 💳 Thanh Toán
- Lịch sử giao dịch
- Thống kê doanh thu
- Xử lý hoàn tiền

### 👥 Quản lý Người Dùng
- Danh sách khách hàng
- Thông tin tài khoản
- Phân quyền người dùng

### 🧹 Dọn Dẹp Hệ Thống
- Xóa booking hết hạn
- Giải phóng ghế đã đặt trước
- Tối ưu database

## 🛠️ Công nghệ sử dụng

- **Frontend**: React 19 + Vite
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **HTTP Client**: Axios
- **State Management**: React Context

## 🔐 Đăng nhập

Chỉ tài khoản với role `ADMIN` hoặc `MANAGER` mới có thể truy cập.

**Tài khoản mặc định**:
- Email: `admin@cinema.com`
- Password: `admin123`

## 🚦 Cách chạy

1. **Cài đặt dependencies**:
```bash
npm install
```

2. **Chạy development server**:
```bash
npm run dev
```

3. **Build cho production**:
```bash
npm run build
```

## 📝 Ghi chú quan trọng

- Đảm bảo backend API đang chạy tại `http://localhost:8080`
- Kiểm tra CORS settings trên backend
- Chỉ admin và manager mới có thể truy cập
- Thường xuyên backup dữ liệu trước khi dọn dẹp hệ thống+ Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
